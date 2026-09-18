"""Small, dependency-free parser for Civilica researcher profile pages."""

from __future__ import annotations

import re
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse


PERSIAN_DIGITS = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
    "01234567890123456789",
)

SECTION_TYPES = {
    "confpaper": "مقاله کنفرانسی",
    "journalpaper": "مقاله ژورنالی",
    "researchs": "طرح پژوهشی",
}


def normalize_text(value: str) -> str:
    """Collapse HTML whitespace while preserving Persian text."""

    value = unescape(value or "").replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def western_digits(value: str) -> str:
    return (value or "").translate(PERSIAN_DIGITS)


def profile_url_id(url: str) -> str | None:
    match = re.search(r"/p/(\d+)/?$", urlparse(url).path)
    return match.group(1) if match else None


class CivilicaProfileParser(HTMLParser):
    """Extract the profile heading and article links from a Civilica page.

    Civilica puts the article title, event/journal and Persian year in the
    profile list itself. That lets the local app extract the whole list with
    one request instead of requesting hundreds of individual article pages.
    """

    def __init__(self, source_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.source_url = source_url
        self.page_title_parts: list[str] = []
        self.heading_parts: list[str] = []
        self._active_heading: str | None = None
        self._active_anchor: dict[str, object] | None = None
        self._stack: list[tuple[str, str | None]] = []
        self._section_name: str | None = None
        self._section_depth: int | None = None
        self.articles: list[dict[str, str]] = []
        self._seen_ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        self._stack.append((tag, attributes.get("id")))

        if tag == "title":
            self._active_heading = "title"
        elif tag == "h1":
            self._active_heading = "h1"

        if tag == "div" and attributes.get("id") in SECTION_TYPES:
            self._section_name = SECTION_TYPES[attributes["id"]]
            self._section_depth = len(self._stack)

        if tag != "a":
            return

        href = attributes.get("href") or ""
        match = re.search(r"/doc/(\d+)/?", href)
        title = normalize_text(attributes.get("title") or "")
        if not match or title == "دریافت فایل PDF مقاله":
            return

        self._active_anchor = {
            "id": match.group(1),
            "href": href,
            "title": title,
            "text": [],
            "section": self._section_name or "مقاله",
        }

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        if self._active_heading == "title":
            self.page_title_parts.append(data)
        elif self._active_heading == "h1":
            self.heading_parts.append(data)

        if self._active_anchor is not None:
            self._active_anchor["text"].append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._active_anchor is not None:
            self._finish_anchor()

        if tag == self._active_heading:
            self._active_heading = None

        if tag == "div" and self._section_depth == len(self._stack):
            self._section_name = None
            self._section_depth = None

        for index in range(len(self._stack) - 1, -1, -1):
            if self._stack[index][0] == tag:
                del self._stack[index:]
                break

    def _finish_anchor(self) -> None:
        anchor = self._active_anchor
        self._active_anchor = None
        if anchor is None:
            return

        article_id = str(anchor["id"])
        if article_id in self._seen_ids:
            return
        self._seen_ids.add(article_id)

        raw_text = normalize_text("".join(anchor["text"]))
        title = normalize_text(str(anchor["title"])) or raw_text
        title = re.sub(
            r"\s+(?:ارائه\s+شده|منتشر\s+شده)\s+در\s+.+?\s*\(\s*[۰-۹٠-٩0-9]{4}\s*\)\s*$",
            "",
            title,
        )

        year_match = re.search(r"\(\s*([۰-۹٠-٩0-9]{4})\s*\)\s*$", raw_text)
        year = western_digits(year_match.group(1)) if year_match else ""

        venue = ""
        venue_match = re.search(
            r"\s+(?:ارائه\s+شده|منتشر\s+شده)\s+در\s+(.+?)\s*\(\s*[۰-۹٠-٩0-9]{4}\s*\)\s*$",
            raw_text,
        )
        if venue_match:
            venue = normalize_text(venue_match.group(1))

        href = str(anchor["href"])
        self.articles.append(
            {
                "id": article_id,
                "title": title,
                "venue": venue,
                "year": year,
                "type": str(anchor["section"]),
                "url": urljoin(self.source_url, href),
            }
        )

    def result(self) -> dict[str, object]:
        heading = normalize_text("".join(self.heading_parts))
        page_title = normalize_text("".join(self.page_title_parts))
        profile_name = heading or page_title or "پژوهشگر سیویلیکا"
        return {
            "profile": {
                "id": profile_url_id(self.source_url) or "",
                "name": profile_name,
                "url": self.source_url,
            },
            "articles": self.articles,
        }


def parse_profile_html(html: str, source_url: str) -> dict[str, object]:
    parser = CivilicaProfileParser(source_url)
    parser.feed(html)
    parser.close()
    return parser.result()
