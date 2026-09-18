"""Citation-style formatting for the Civilica Word export."""

from __future__ import annotations

import re


STYLE_LABELS = {
    "apa7": "APA 7th",
    "vancouver": "Vancouver",
    "ieee": "IEEE",
    "harvard": "Harvard",
    "chicago": "Chicago",
    "mla": "MLA 9th",
    "bibtex": "BibTeX",
}


def normalize_style(value: object) -> str:
    candidate = str(value or "").strip().lower()
    aliases = {
        "apa": "apa7",
        "apa 7": "apa7",
        "apa 7th": "apa7",
        "mla 9": "mla",
        "mla 9th": "mla",
    }
    candidate = aliases.get(candidate, candidate)
    return candidate if candidate in STYLE_LABELS else "apa7"


def style_label(value: object) -> str:
    return STYLE_LABELS[normalize_style(value)]


def clean_text(value: object, fallback: str = "") -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip() or fallback


def profile_author(value: object) -> str:
    author = clean_text(value, "نویسندهٔ پروفایل")
    author = re.sub(
        r"^(?:(?:آقای|خانم|دکتر|پروفسور|استاد)\s+)+",
        "",
        author,
        flags=re.IGNORECASE,
    )
    return author or "نویسندهٔ پروفایل"


def citation_author(article: dict[str, object], fallback_author: str) -> str:
    return clean_text(article.get("authors"), profile_author(fallback_author))


def citation_year(article: dict[str, object]) -> str:
    value = clean_text(article.get("year"))
    return value if value else "n.d."


def citation_title(article: dict[str, object]) -> str:
    return clean_text(article.get("title"), "بدون عنوان").rstrip(".")


def citation_venue(article: dict[str, object]) -> str:
    return clean_text(article.get("venue")).rstrip(".")


def citation_url(article: dict[str, object]) -> str:
    return clean_text(article.get("url"))


def format_citation(
    article: dict[str, object],
    index: int,
    style: object,
    fallback_author: str,
) -> str:
    """Return one citation using only the metadata available for an article."""

    selected_style = normalize_style(style)
    authors = citation_author(article, fallback_author)
    title = citation_title(article)
    venue = citation_venue(article)
    year = citation_year(article)
    url = citation_url(article)
    venue_part = f" {venue}." if venue else ""
    url_part = f" {url}" if url else ""

    if selected_style == "apa7":
        return f"{authors} ({year}). {title}.{venue_part}{url_part}".strip()

    if selected_style == "vancouver":
        return f"{index}. {authors}. {title}.{venue_part} {year}.{url_part}".strip()

    if selected_style == "ieee":
        return f"[{index}] {authors}, “{title},”{(' ' + venue + ',') if venue else ''} {year}.{url_part}".strip()

    if selected_style == "harvard":
        return f"{authors} ({year}) ‘{title}’.{venue_part}{url_part}".strip()

    if selected_style == "chicago":
        return f"{authors}. “{title}.”{venue_part} ({year}).{url_part}".strip()

    if selected_style == "mla":
        return f"{authors}. “{title}.”{(' ' + venue + ',') if venue else ''} {year}.{url_part}".strip()

    key_source = re.sub(r"[^A-Za-z0-9]+", "", authors) or "author"
    article_id = clean_text(article.get("id"), str(index))
    key = f"civilica_{key_source[:24]}_{article_id}"
    return (
        f"@misc{{{key},\n"
        f"  author = {{{authors}}},\n"
        f"  title = {{{title}}},\n"
        f"  year = {{{year if year != 'n.d.' else ''}}},\n"
        f"  howpublished = {{{venue}}},\n"
        f"  url = {{{url}}}\n"
        f"}}"
    )
