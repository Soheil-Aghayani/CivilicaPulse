import unittest

from civilica_parser import (
    parse_article_authors_html,
    parse_author_search_html,
    parse_profile_html,
)


SAMPLE_HTML = """
<!doctype html>
<html lang="fa" dir="rtl">
  <head><title>پروفایل نمونه</title></head>
  <body>
    <h1>دکتر پژوهشگر نمونه</h1>
    <div id="confpaper">
      <a title="دریافت فایل PDF مقاله" href="/doc/12/"><svg></svg></a>
      <a title="مقالهٔ اول" href="/doc/12/">مقالهٔ اول ارائه شده در
        <i>کنفرانس نمونه</i> (1402)</a>
    </div>
    <div id="journalpaper">
      <a title="مقالهٔ دوم" href="/doc/13/">مقالهٔ دوم منتشر شده در
        <i>مجلهٔ نمونه</i> (۱۴۰۱)</a>
    </div>
  </body>
</html>
"""


AUTHOR_SEARCH_HTML = """
<!doctype html>
<html lang="fa" dir="rtl">
  <head><title>مقالات علیرضا پرداختی - سیویلیکا</title></head>
  <body>
    <h1>مقالات علیرضا پرداختی</h1>
    <nav>
      <a href="/search/paper/n-%D8%B9%D9%84%DB%8C%D8%B1%D8%B6%D8%A7_%D9%BE%D8%B1%D8%AF%D8%A7%D8%AE%D8%AA%DB%8C-o-Paper_id-ot-desc-p-2/">2</a>
      <a href="/search/paper/n-%D8%B9%D9%84%DB%8C%D8%B1%D8%B6%D8%A7_%D9%BE%D8%B1%D8%AF%D8%A7%D8%AE%D8%AA%DB%8C-o-Paper_id-ot-desc-p-3/">صفحه آخر</a>
    </nav>
    <ul id="list">
      <li>
        <a title="دریافت فایل PDF مقاله" href="/doc/999/"></a>
        <a title="عنوان مقالهٔ جست‌وجوشده" href="/doc/999/">عنوان مقالهٔ جست‌وجوشده</a>
        <h5>مقاله کنفرانسی</h5>
        <div>نویسندگان: نویسندهٔ اول، علیرضا پرداختی<br/>سال انتشار ۱۴۰۳<br/>
          محل انتشار: همایش نمونه<br/>تعداد صفحات: ۱۰ | زبان: فارسی</div>
      </li>
    </ul>
  </body>
</html>
"""


class CivilicaParserTests(unittest.TestCase):
    def test_extracts_unique_articles_and_metadata(self):
        result = parse_profile_html(SAMPLE_HTML, "https://civilica.com/p/176225/")

        self.assertEqual(result["profile"]["name"], "دکتر پژوهشگر نمونه")
        self.assertEqual(len(result["articles"]), 2)
        self.assertEqual(result["articles"][0]["id"], "12")
        self.assertEqual(result["articles"][0]["title"], "مقالهٔ اول")
        self.assertEqual(result["articles"][0]["venue"], "کنفرانس نمونه")
        self.assertEqual(result["articles"][0]["year"], "1402")
        self.assertEqual(result["articles"][0]["type"], "مقاله کنفرانسی")
        self.assertEqual(result["articles"][1]["year"], "1401")
        self.assertEqual(result["articles"][1]["venue"], "مجلهٔ نمونه")
        self.assertEqual(result["articles"][1]["type"], "مقاله ژورنالی")

    def test_extracts_ordered_article_authors_from_citation_metadata(self):
        html = """
        <head>
          <meta name="citation_author" content="رضا خاکپور">
          <meta name="citation_author" content="ناصر مهردادی">
          <meta name="citation_author" content="ناصر مهردادی">
        </head>
        """

        self.assertEqual(
            parse_article_authors_html(html),
            "رضا خاکپور، ناصر مهردادی",
        )

    def test_extracts_author_search_cards_and_page_count(self):
        result = parse_author_search_html(
            AUTHOR_SEARCH_HTML,
            "https://civilica.com/search/paper/n-%D8%B9%D9%84%DB%8C%D8%B1%D8%B6%D8%A7_%D9%BE%D8%B1%D8%AF%D8%A7%D8%AE%D8%AA%DB%8C/",
        )

        self.assertEqual(result["profile"]["name"], "علیرضا پرداختی")
        self.assertEqual(result["profile"]["affil"], "جست‌وجوی نام در سیویلیکا")
        self.assertEqual(result["page_count"], 3)
        self.assertEqual(len(result["articles"]), 1)
        article = result["articles"][0]
        self.assertEqual(article["id"], "999")
        self.assertEqual(article["authors"], "نویسندهٔ اول، علیرضا پرداختی")
        self.assertEqual(article["year"], "1403")
        self.assertEqual(article["venue"], "همایش نمونه")
        self.assertEqual(article["type"], "مقاله کنفرانسی")


if __name__ == "__main__":
    unittest.main()
