"""Local-first Civilica article extractor with a Persian DOCX export."""

from __future__ import annotations

import io
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from flask import Flask, jsonify, request, send_file, send_from_directory

from civilica_parser import parse_profile_html


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
MAX_HTML_BYTES = 8 * 1024 * 1024
MAX_ARTICLES = 1000
USER_AGENT = "CivilicaPaperExtractor/0.1 (local research utility)"

app = Flask(__name__, static_folder=str(WEB_DIR), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_HTML_BYTES + 256 * 1024


def json_error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


def canonical_profile_url(value: str) -> str:
    raw = (value or "").strip()
    parsed = urlparse(raw)
    host = (parsed.hostname or "").lower()
    if parsed.scheme not in {"http", "https"} or host not in {"civilica.com", "www.civilica.com"}:
        raise ValueError("فقط لینک صفحهٔ پژوهشگر سیویلیکا پذیرفته می‌شود.")

    match = re.fullmatch(r"/p/(\d+)/?", parsed.path)
    if not match:
        raise ValueError("لینک باید شبیه https://civilica.com/p/176225/ باشد.")

    return f"https://civilica.com/p/{match.group(1)}/"


def decode_html(raw: bytes, content_type: str = "") -> str:
    charset_match = re.search(r"charset=([\\w-]+)", content_type or "", re.IGNORECASE)
    encoding = charset_match.group(1) if charset_match else "utf-8"
    return raw.decode(encoding, errors="replace")


def fetch_profile_html(source_url: str) -> str:
    request_headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fa-IR,fa;q=0.9,en;q=0.5",
        "Accept-Encoding": "identity",
    }
    try:
        with urlopen(Request(source_url, headers=request_headers), timeout=30) as response:
            final_host = (urlparse(response.geturl()).hostname or "").lower()
            if final_host not in {"civilica.com", "www.civilica.com"}:
                raise RuntimeError("سیویلیکا به یک مقصد ناشناس هدایت کرد.")
            raw = response.read(MAX_HTML_BYTES + 1)
            if len(raw) > MAX_HTML_BYTES:
                raise ValueError("حجم صفحه بیشتر از حد مجاز است.")
            return decode_html(raw, response.headers.get("Content-Type", ""))
    except HTTPError as error:
        if error.code in {401, 403, 429}:
            raise RuntimeError(
                "سیویلیکا دسترسی مستقیم این سرور را محدود کرده است. "
                "حالت «چسباندن HTML» را امتحان کنید."
            ) from error
        raise RuntimeError(f"سیویلیکا با خطای {error.code} پاسخ داد.") from error
    except (URLError, TimeoutError) as error:
        raise RuntimeError(
            "اتصال به سیویلیکا برقرار نشد. می‌توانید HTML صفحه را در حالت جایگزین وارد کنید."
        ) from error


def normalized_payload(result: dict[str, object]) -> dict[str, object]:
    articles = result.get("articles") or []
    articles = list(articles)[:MAX_ARTICLES]
    profile = result.get("profile") or {}
    return {
        "ok": True,
        "profile": profile,
        "articles": articles,
        "count": len(articles),
    }


def safe_text(value: object, limit: int = 12000) -> str:
    return str(value or "").strip()[:limit]


def sanitize_articles(value: object) -> list[dict[str, str]]:
    if not isinstance(value, list):
        raise ValueError("فهرست مقاله‌ها معتبر نیست.")

    cleaned: list[dict[str, str]] = []
    for item in value[:MAX_ARTICLES]:
        if not isinstance(item, dict):
            raise ValueError("یکی از مقاله‌های انتخاب‌شده معتبر نیست.")
        title = safe_text(item.get("title"))
        if not title:
            continue
        cleaned.append(
            {
                "id": safe_text(item.get("id"), 120),
                "title": title,
                "venue": safe_text(item.get("venue")),
                "year": safe_text(item.get("year"), 32),
                "type": safe_text(item.get("type"), 120),
                "url": safe_text(item.get("url"), 1000),
            }
        )
    if not cleaned:
        raise ValueError("حداقل یک مقالهٔ معتبر انتخاب کنید.")
    return cleaned


@app.get("/")
def index():
    return send_from_directory(WEB_DIR, "index.html")


@app.post("/api/parse-profile")
def parse_profile():
    body = request.get_json(silent=True) or {}
    try:
        source_url = canonical_profile_url(str(body.get("url", "")))
        html = fetch_profile_html(source_url)
        result = parse_profile_html(html, source_url)
        if not result["articles"]:
            return json_error(
                "مقاله‌ای در صفحه پیدا نشد. لینک را بررسی کنید یا HTML صفحه را در حالت جایگزین بچسبانید.",
                422,
            )
        return jsonify(normalized_payload(result))
    except ValueError as error:
        return json_error(str(error), 400)
    except RuntimeError as error:
        return json_error(str(error), 502)


@app.post("/api/parse-html")
def parse_html():
    body = request.get_json(silent=True) or {}
    html = str(body.get("html", ""))
    if not html.strip():
        return json_error("کد HTML صفحه را وارد کنید.", 400)
    if len(html.encode("utf-8")) > MAX_HTML_BYTES:
        return json_error("حجم HTML بیشتر از حد مجاز است.", 413)

    raw_source_url = str(body.get("source_url", "")).strip()
    if raw_source_url:
        try:
            source_url = canonical_profile_url(raw_source_url)
        except ValueError:
            source_url = "https://civilica.com/"
    else:
        source_url = "https://civilica.com/"

    result = parse_profile_html(html, source_url)
    if not result["articles"]:
        return json_error(
            "از این HTML مقاله‌ای پیدا نشد. در مرورگر، گزینهٔ View Page Source را کپی کنید.",
            422,
        )
    return jsonify(normalized_payload(result))


def add_bidi(paragraph) -> None:
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    paragraph_format = paragraph._p.get_or_add_pPr()
    if paragraph_format.find(qn("w:bidi")) is None:
        paragraph_format.append(OxmlElement("w:bidi"))


def set_run_font(run, size: int | None = None, bold: bool | None = None) -> None:
    from docx.oxml.ns import qn
    from docx.shared import Pt

    run.font.name = "IRANYekanXFaNum"
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "IRANYekanXFaNum")
    run._element.get_or_add_rPr().rFonts.set(qn("w:cs"), "IRANYekanXFaNum")
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold


def style_paragraph(paragraph, size: int | None = None, bold: bool | None = None) -> None:
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    add_bidi(paragraph)
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for run in paragraph.runs:
        set_run_font(run, size=size, bold=bold)


def build_docx(payload: dict[str, object]) -> io.BytesIO:
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml.ns import qn
    from docx.shared import Inches, Pt

    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    normal = document.styles["Normal"]
    normal.font.name = "IRANYekanXFaNum"
    normal._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "IRANYekanXFaNum")
    normal._element.get_or_add_rPr().rFonts.set(qn("w:cs"), "IRANYekanXFaNum")
    normal.font.size = Pt(10.5)

    profile = payload.get("profile") or {}
    profile_name = str(profile.get("name") or "پژوهشگر سیویلیکا")
    source_url = str(profile.get("url") or "")
    articles = list(payload.get("articles") or [])[:MAX_ARTICLES]

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.add_run("فهرست مقالات سیویلیکا")
    set_run_font(title_run, size=18, bold=True)
    add_bidi(title)

    subtitle = document.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_run = subtitle.add_run(profile_name)
    set_run_font(subtitle_run, size=13, bold=True)
    add_bidi(subtitle)

    info = document.add_paragraph()
    info.add_run("تعداد مقالات انتخاب‌شده: ").bold = True
    info.add_run(str(len(articles)))
    info.add_run("  |  منبع: ")
    info.add_run(source_url)
    style_paragraph(info, size=9.5)

    note = document.add_paragraph()
    note.add_run(
        "این فایل بر اساس اطلاعات نمایه‌شده در صفحهٔ پژوهشگر سیویلیکا ساخته شده است؛ "
        "متن کامل یا فایل PDF مقاله‌ها در این خروجی درج نمی‌شود."
    )
    style_paragraph(note, size=9.5)

    for index, article in enumerate(articles, start=1):
        heading = document.add_paragraph()
        heading_run = heading.add_run(f"{index}. {article.get('title') or 'بدون عنوان'}")
        set_run_font(heading_run, size=12, bold=True)
        add_bidi(heading)

        metadata = document.add_paragraph()
        metadata.add_run("نوع: ").bold = True
        metadata.add_run(str(article.get("type") or "مقاله"))
        metadata.add_run("  |  سال: ")
        metadata.add_run(str(article.get("year") or "نامشخص"))
        style_paragraph(metadata, size=10)

        venue = str(article.get("venue") or "").strip()
        if venue:
            venue_paragraph = document.add_paragraph()
            venue_paragraph.add_run("محل انتشار: ").bold = True
            venue_paragraph.add_run(venue)
            style_paragraph(venue_paragraph, size=10)

        link_paragraph = document.add_paragraph()
        link_paragraph.add_run("پیوند: ").bold = True
        link_paragraph.add_run(str(article.get("url") or ""))
        style_paragraph(link_paragraph, size=9)

    output = io.BytesIO()
    document.core_properties.title = f"مقالات سیویلیکا - {profile_name}"
    document.core_properties.subject = "فهرست مقالات پژوهشگر"
    document.save(output)
    output.seek(0)
    return output


@app.post("/api/export-docx")
def export_docx():
    body = request.get_json(silent=True) or {}
    articles = body.get("articles")
    if not isinstance(articles, list) or not articles:
        return json_error("حداقل یک مقاله را انتخاب کنید.", 400)
    if len(articles) > MAX_ARTICLES:
        return json_error("تعداد مقاله‌های انتخاب‌شده بیش از حد مجاز است.", 400)

    try:
        profile = body.get("profile") if isinstance(body.get("profile"), dict) else {}
        output = build_docx(
            {
                "profile": {
                    "name": safe_text(profile.get("name"), 500),
                    "url": safe_text(profile.get("url"), 1000),
                },
                "articles": sanitize_articles(articles),
            }
        )
    except ValueError as error:
        return json_error(str(error), 400)
    except ImportError:
        return json_error(
            "کتابخانهٔ ساخت DOCX نصب نیست. requirements.txt را نصب کنید.",
            503,
        )
    except Exception:
        app.logger.exception("DOCX export failed")
        return json_error("ساخت فایل DOCX انجام نشد.", 500)

    filename = f"civilica-articles-{datetime.now(timezone.utc):%Y%m%d}.docx"
    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@app.errorhandler(413)
def request_too_large(_error):
    return json_error("حجم درخواست بیشتر از حد مجاز است.", 413)


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host=host, port=port, debug=False)
