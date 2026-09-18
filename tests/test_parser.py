import unittest

from civilica_parser import parse_profile_html


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


if __name__ == "__main__":
    unittest.main()
