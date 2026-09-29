"""Small, dependency-free parsers for Civilica profiles and author searches."""

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

_AUTHOR_SEARCH_PREFIX = re.compile(r"^(?:مقالات(?:\s+علمی)?|فهرست\s+مقالات)\s+")
_SEARCH_PAGE_PATTERN = re.compile(r"-p-(\d+)/?$")


def normalize_text(value: str) -> str:
    """Collapse HTML whitespace while preserving Persian text."""

    value = unescape(value or "").replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def western_digits(value: str) -> str:
    return (value or "").translate(PERSIAN_DIGITS)


def profile_url_id(url: str) -> str | None:
    match = re.search(r"/p/(\d+)/?$", urlparse(url).path)
    return match.group(1) if match else None


def author_search_name(value: str) -> str:
    """Remove Civilica's result-list prefix from an author-search heading."""

    heading = normalize_text(value)
    return _AUTHOR_SEARCH_PREFIX.sub("", heading).strip() or heading


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


class CivilicaArticleMetaParser(HTMLParser):
    """Extract the ordered author metadata from a Civilica article page."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.authors: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return

        attributes = dict(attrs)
        meta_name = normalize_text(attributes.get("name") or "").casefold()
        if meta_name != "citation_author":
            return

        author = normalize_text(attributes.get("content") or "")
        if author and author not in self.authors:
            self.authors.append(author)


class CivilicaAuthorSearchParser(HTMLParser):
    """Read cards and pagination from Civilica's ``/search/paper/n-.../`` pages."""

    def __init__(self, source_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.source_url = source_url
        self._stack: list[tuple[str, str | None]] = []
        self._active_heading: str | None = None
        self._heading_parts: list[str] = []
        self._title_parts: list[str] = []
        self._result_list_depth: int | None = None
        self._current_item: dict[str, object] | None = None
        self._current_anchor: dict[str, object] | None = None
        self._page_urls: dict[int, str] = {}
        self.articles: list[dict[str, str]] = []
        self._seen_ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        self._stack.append((tag, attributes.get("id")))

        if tag == "title":
            self._active_heading = "title"
        elif tag == "h1":
            self._active_heading = "h1"
        if tag == "ul" and attributes.get("id") == "list":
            self._result_list_depth = len(self._stack)
        if (
            tag == "li"
            and self._result_list_depth is not None
            and len(self._stack) == self._result_list_depth + 1
        ):
            self._current_item = {
                "depth": len(self._stack),
                "parts": [],
                "links": [],
            }

        if tag != "a":
            return

        href = attributes.get("href") or ""
        absolute_url = urljoin(self.source_url, href)
        page_match = _SEARCH_PAGE_PATTERN.search(urlparse(absolute_url).path)
        if "/search/paper/n-" in urlparse(absolute_url).path and page_match:
            self._page_urls[int(page_match.group(1))] = absolute_url

        if self._current_item is None:
            return

        article_match = re.search(r"/doc/(\d+)/?", href)
        if not article_match or (attributes.get("title") or "").strip() == "دریافت فایل PDF مقاله":
            return

        self._current_anchor = {
            "id": article_match.group(1),
            "title": normalize_text(attributes.get("title") or ""),
            "parts": [],
        }

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        if self._active_heading == "h1":
            self._heading_parts.append(data)
        elif self._active_heading == "title":
            self._title_parts.append(data)
        if self._current_item is not None:
            self._current_item["parts"].append(data)
        if self._current_anchor is not None:
            self._current_anchor["parts"].append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._current_anchor is not None:
            if self._current_item is not None:
                self._current_item["links"].append(self._current_anchor)
            self._current_anchor = None

        if tag == self._active_heading:
            self._active_heading = None

        if (
            tag == "li"
            and self._current_item is not None
            and self._current_item["depth"] == len(self._stack)
        ):
            self._finish_item()

        if tag == "ul" and self._result_list_depth == len(self._stack):
            self._result_list_depth = None

        for index in range(len(self._stack) - 1, -1, -1):
            if self._stack[index][0] == tag:
                del self._stack[index:]
                break

    @staticmethod
    def _label_value(text: str, label: str, stops: tuple[str, ...]) -> str:
        stop_pattern = "|".join(re.escape(stop) for stop in stops)
        match = re.search(
            re.escape(label) + r"\s*:\s*(.+?)(?=" + stop_pattern + r"|$)",
            text,
        )
        return normalize_text(match.group(1)) if match else ""

    def _finish_item(self) -> None:
        item = self._current_item
        self._current_item = None
        if item is None:
            return

        links = item["links"]
        if not links:
            return

        link = next(
            (candidate for candidate in links if candidate["title"]),
            links[0],
        )
        article_id = str(link["id"])
        if article_id in self._seen_ids:
            return

        title = normalize_text(str(link["title"]) or "".join(link["parts"]))
        if not title:
            return

        self._seen_ids.add(article_id)
        card_text = normalize_text(" ".join(item["parts"]))
        year_match = re.search(r"سال\s+انتشار\s*([۰-۹٠-٩0-9]{4})", card_text)
        article_type = "مقاله"
        if "مقاله کنفرانسی" in card_text:
            article_type = "مقاله کنفرانسی"
        elif "مقاله ژورنالی" in card_text:
            article_type = "مقاله ژورنالی"
        elif "طرح پژوهشی" in card_text:
            article_type = "طرح پژوهشی"

        self.articles.append(
            {
                "id": article_id,
                "title": title,
                "authors": self._label_value(
                    card_text,
                    "نویسندگان",
                    ("سال انتشار", "محل انتشار", "تعداد صفحات", "زبان"),
                ),
                "venue": self._label_value(
                    card_text,
                    "محل انتشار",
                    ("تعداد صفحات", "زبان"),
                ),
                "year": western_digits(year_match.group(1)) if year_match else "",
                "type": article_type,
                "url": urljoin(self.source_url, f"/doc/{article_id}/"),
            }
        )

    def result(self) -> dict[str, object]:
        heading = author_search_name(
            "".join(self._heading_parts) or "".join(self._title_parts)
        )
        page_count = max([1, *self._page_urls])
        return {
            "profile": {
                "id": "author-search",
                "name": heading or "نتایج جست‌وجوی سیویلیکا",
                "affil": "جست‌وجوی نام در سیویلیکا",
                "url": self.source_url,
            },
            "articles": self.articles,
            "page_count": page_count,
        }


def parse_profile_html(html: str, source_url: str) -> dict[str, object]:
    parser = CivilicaProfileParser(source_url)
    parser.feed(html)
    parser.close()
    return parser.result()


def parse_author_search_html(html: str, source_url: str) -> dict[str, object]:
    parser = CivilicaAuthorSearchParser(source_url)
    parser.feed(html)
    parser.close()
    return parser.result()


def parse_article_authors_html(html: str) -> str:
    """Return the article's deduplicated citation authors in page order."""

    parser = CivilicaArticleMetaParser()
    parser.feed(html)
    parser.close()
    return "، ".join(parser.authors)
