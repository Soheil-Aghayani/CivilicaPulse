"""Local-first Civilica article extractor with Persian Word exports."""

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

from citation_formats import format_citation, normalize_style, style_label
from civilica_parser import parse_profile_html


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
MAX_HTML_BYTES = 8 * 1024 * 1024
MAX_ARTICLES = 1000
USER_AGENT = "CivilicaPaperExtractor/0.1 (local research utility)"
PERSIAN_FONT = "B Nazanin"
ENGLISH_FONT = "Times New Roman"
PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_URL_PATTERN = re.compile(r"https?://[^\s]+", re.IGNORECASE)
_PERSIAN_CHAR_PATTERN = re.compile(r"[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]")
_LATIN_CHAR_PATTERN = re.compile(r"[A-Za-z]")

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
                "authors": safe_text(item.get("authors")),
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


def persianize_digits(value: object) -> str:
    text = str(value or "")
    arabic_digits = "٠١٢٣٤٥٦٧٨٩"
    translation = str.maketrans(
        "0123456789" + arabic_digits,
        PERSIAN_DIGITS + PERSIAN_DIGITS,
    )
    return text.translate(translation)


def _script_chunks(value: str):
    current_script = "fa"
    buffer: list[str] = []

    def flush() -> tuple[str, str] | None:
        if not buffer:
            return None
        chunk = "".join(buffer)
        buffer.clear()
        return chunk, current_script

    for character in value:
        if character in "\r\n":
            pending = flush()
            if pending:
                yield pending
            yield "\n", "fa"
            current_script = "fa"
            continue

        if _PERSIAN_CHAR_PATTERN.search(character) or character in PERSIAN_DIGITS:
            detected_script = "fa"
        elif _LATIN_CHAR_PATTERN.search(character):
            detected_script = "en"
        else:
            detected_script = current_script

        if buffer and detected_script != current_script:
            pending = flush()
            if pending:
                yield pending
        current_script = detected_script
        buffer.append(character)

    pending = flush()
    if pending:
        yield pending


def word_text_chunks(value: object):
    text = str(value or "")
    cursor = 0
    for match in _URL_PATTERN.finditer(text):
        before = text[cursor:match.start()]
        if before:
            for chunk, script in _script_chunks(persianize_digits(before)):
                yield chunk, script, False
        yield match.group(0), "en", True
        cursor = match.end()

    remainder = text[cursor:]
    if remainder:
        for chunk, script in _script_chunks(persianize_digits(remainder)):
            yield chunk, script, False


def set_run_font(
    run,
    size: float | None = None,
    bold: bool | None = None,
    font_name: str = PERSIAN_FONT,
    rtl: bool = True,
) -> None:
    from docx.oxml.ns import qn
    from docx.shared import Pt

    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        from docx.oxml import OxmlElement

        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    run.font.name = font_name
    for font_slot in ("ascii", "hAnsi", "eastAsia", "cs"):
        rfonts.set(qn(f"w:{font_slot}"), font_name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold

    rtl_tag = rpr.find(qn("w:rtl"))
    if rtl and rtl_tag is None:
        from docx.oxml import OxmlElement

        rpr.append(OxmlElement("w:rtl"))
    elif not rtl and rtl_tag is not None:
        rpr.remove(rtl_tag)


def add_word_text(paragraph, value: object, size: float = 12, bold: bool = False) -> None:
    for chunk, script, is_url in word_text_chunks(value):
        if chunk == "\n":
            if paragraph.runs:
                paragraph.runs[-1].add_break()
            else:
                paragraph.add_run().add_break()
            continue
        run = paragraph.add_run(chunk)
        if script == "fa":
            set_run_font(run, size=size, bold=bold, font_name=PERSIAN_FONT, rtl=True)
        else:
            set_run_font(
                run,
                size=max(size - 1, 1),
                bold=bold,
                font_name=ENGLISH_FONT,
                rtl=False,
            )


def build_docx(payload: dict[str, object]) -> io.BytesIO:
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.shared import Inches, Pt

    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    normal = document.styles["Normal"]
    normal.font.name = PERSIAN_FONT
    normal_rpr = normal._element.get_or_add_rPr()
    normal_rfonts = normal_rpr.rFonts
    if normal_rfonts is None:
        from docx.oxml import OxmlElement

        normal_rfonts = OxmlElement("w:rFonts")
        normal_rpr.insert(0, normal_rfonts)
    from docx.oxml.ns import qn

    for font_slot in ("ascii", "hAnsi", "eastAsia", "cs"):
        normal_rfonts.set(qn(f"w:{font_slot}"), PERSIAN_FONT)
    normal.font.size = Pt(10.5)

    profile = payload.get("profile") or {}
    profile_name = str(profile.get("name") or "پژوهشگر سیویلیکا")
    source_url = str(profile.get("url") or "")
    articles = list(payload.get("articles") or [])[:MAX_ARTICLES]
    selected_style = normalize_style(payload.get("style"))
    selected_style_label = style_label(selected_style)
    citations = [
        format_citation(article, index, selected_style, profile_name)
        for index, article in enumerate(articles, start=1)
    ]

    title = document.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_bidi(title)
    add_word_text(title, "فهرست منابع سیویلیکا", size=18, bold=True)

    subtitle = document.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_bidi(subtitle)
    add_word_text(subtitle, profile_name, size=13, bold=True)

    info = document.add_paragraph()
    add_bidi(info)
    add_word_text(info, "تعداد مقالات انتخاب‌شده: ", size=9.5, bold=True)
    add_word_text(info, len(articles), size=9.5)
    add_word_text(info, "  |  سبک ارجاع: ", size=9.5, bold=True)
    add_word_text(info, selected_style_label, size=9.5)
    add_word_text(info, "  |  منبع: ", size=9.5, bold=True)
    add_word_text(info, source_url, size=9.5)
    info.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    note = document.add_paragraph()
    add_bidi(note)
    add_word_text(
        note,
        "این فایل بر اساس اطلاعات نمایه‌شده در صفحهٔ پژوهشگر سیویلیکا ساخته شده است. "
        "اگر نام نویسندگان در فهرست عمومی موجود نباشد، نام پژوهشگر پروفایل به‌عنوان "
        "نویسندهٔ جایگزین استفاده می‌شود؛ برای استناد نهایی آن را بررسی کنید.",
        size=9.5,
    )
    note.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    for citation in citations:
        citation_paragraph = document.add_paragraph()
        add_bidi(citation_paragraph)
        citation_paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        citation_paragraph.paragraph_format.right_indent = Inches(0.35)
        citation_paragraph.paragraph_format.first_line_indent = Inches(-0.35)
        citation_paragraph.paragraph_format.space_after = Pt(7)
        add_word_text(citation_paragraph, citation, size=10)

    output = io.BytesIO()
    document.core_properties.title = f"منابع سیویلیکا - {profile_name}"
    document.core_properties.subject = f"فهرست منابع با سبک {selected_style_label}"
    document.save(output)
    output.seek(0)
    return output


def html_word_markup(value: object, size: float = 12, bold: bool = False) -> str:
    from html import escape

    markup: list[str] = []
    for chunk, script, is_url in word_text_chunks(value):
        if chunk == "\n":
            markup.append("<br>")
            continue
        font_name = PERSIAN_FONT if script == "fa" else ENGLISH_FONT
        font_size = size if script == "fa" else max(size - 1, 1)
        direction = "rtl" if script == "fa" and not is_url else "ltr"
        weight = "font-weight:700;" if bold else ""
        markup.append(
            f'<span dir="{direction}" style="font-family:{escape(font_name)};'
            f'font-size:{font_size}pt;{weight}">{escape(chunk)}</span>'
        )
    return "".join(markup)


def build_word_html(payload: dict[str, object]) -> io.BytesIO:
    from html import escape

    profile = payload.get("profile") or {}
    profile_name = str(profile.get("name") or "پژوهشگر سیویلیکا")
    source_url = str(profile.get("url") or "")
    articles = list(payload.get("articles") or [])[:MAX_ARTICLES]
    selected_style = normalize_style(payload.get("style"))
    selected_style_label = style_label(selected_style)
    citations = [
        format_citation(article, index, selected_style, profile_name)
        for index, article in enumerate(articles, start=1)
    ]
    citation_markup = "".join(
        '<p class="citation" dir="rtl">'
        + html_word_markup(citation, size=10)
        + "</p>"
        for citation in citations
    )
    title_markup = html_word_markup("فهرست منابع سیویلیکا", size=18, bold=True)
    profile_markup = html_word_markup(profile_name, size=13, bold=True)
    meta_markup = (
        html_word_markup("سبک ارجاع: ", size=9.5, bold=True)
        + html_word_markup(selected_style_label, size=9.5)
        + html_word_markup(" | تعداد: ", size=9.5, bold=True)
        + html_word_markup(len(articles), size=9.5)
        + html_word_markup(" | منبع: ", size=9.5, bold=True)
        + html_word_markup(source_url, size=9.5)
    )
    note_markup = html_word_markup(
        "این فایل بر اساس اطلاعات نمایه‌شده در صفحهٔ پژوهشگر سیویلیکا ساخته شده است. "
        "اگر نام نویسندگان در فهرست عمومی موجود نباشد، نام پژوهشگر پروفایل به‌عنوان "
        "نویسندهٔ جایگزین استفاده می‌شود؛ برای استناد نهایی آن را بررسی کنید.",
        size=9.5,
    )
    html = f"""<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>منابع سیویلیکا - {escape(profile_name)}</title>
<style>
  @page {{ margin: 2cm; }}
  body {{ font-family: "B Nazanin", Tahoma, Arial, sans-serif; direction: rtl; text-align: right; font-size: 11pt; line-height: 1.7; }}
  h1 {{ margin-bottom: 4pt; direction: rtl; }}
  p {{ direction: rtl; text-align: right; }}
  .meta {{ color: #475569; font-size: 9pt; }}
  .citation {{ margin: 0 0 10pt 0; padding-right: 0.35in; text-indent: -0.35in; }}
</style>
</head>
<body>
<h1>{title_markup}</h1>
<p>{profile_markup}</p>
<p class="meta">{meta_markup}</p>
<p class="meta">{note_markup}</p>
{citation_markup}
</body>
</html>"""
    output = io.BytesIO(("\ufeff" + html).encode("utf-8"))
    output.seek(0)
    return output


@app.post("/api/export-word")
@app.post("/api/export-docx")
def export_word():
    body = request.get_json(silent=True) or {}
    articles = body.get("articles")
    if not isinstance(articles, list) or not articles:
        return json_error("حداقل یک مقاله را انتخاب کنید.", 400)
    if len(articles) > MAX_ARTICLES:
        return json_error("تعداد مقاله‌های انتخاب‌شده بیش از حد مجاز است.", 400)

    profile = body.get("profile") if isinstance(body.get("profile"), dict) else {}
    try:
        sanitized_payload = {
            "profile": {
                "name": safe_text(profile.get("name"), 500),
                "url": safe_text(profile.get("url"), 1000),
            },
            "articles": sanitize_articles(articles),
            "style": normalize_style(body.get("style")),
        }
    except ValueError as error:
        return json_error(str(error), 400)

    file_type = "doc" if str(body.get("file_type", "")).lower() == "doc" else "docx"
    try:
        if file_type == "doc":
            output = build_word_html(sanitized_payload)
            mimetype = "application/msword"
        else:
            output = build_docx(sanitized_payload)
            mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    except ValueError as error:
        return json_error(str(error), 400)
    except ImportError:
        return json_error(
            "کتابخانهٔ ساخت فایل Word نصب نیست. requirements.txt را نصب کنید.",
            503,
        )
    except Exception:
        app.logger.exception("Word export failed")
        return json_error("ساخت فایل Word انجام نشد.", 500)

    filename = f"civilica-references-{normalize_style(body.get('style'))}-{datetime.now(timezone.utc):%Y%m%d}.{file_type}"
    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype=mimetype,
    )


@app.errorhandler(413)
def request_too_large(_error):
    return json_error("حجم درخواست بیشتر از حد مجاز است.", 413)


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    app.run(host=host, port=port, debug=False)
