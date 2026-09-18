import unittest
from io import BytesIO

from docx import Document

from citation_formats import format_citation, normalize_style
from server import app


ARTICLE = {
    "id": "12",
    "title": "عنوان پژوهش 1402 English",
    "venue": "Journal of Testing",
    "year": "1402",
    "type": "مقاله ژورنالی",
    "url": "https://civilica.com/doc/12/",
}


class CitationFormatTests(unittest.TestCase):
    def test_style_aliases_and_formats(self):
        self.assertEqual(normalize_style("APA 7th"), "apa7")
        self.assertIn("(1402)", format_citation(ARTICLE, 1, "apa7", "پژوهشگر نمونه"))
        self.assertIn("(1402)", format_citation({**ARTICLE, "year": "۱۴۰۲"}, 1, "apa7", "پژوهشگر نمونه"))
        self.assertTrue(format_citation(ARTICLE, 2, "vancouver", "پژوهشگر نمونه").startswith("2."))
        self.assertIn("@misc", format_citation(ARTICLE, 1, "bibtex", "پژوهشگر نمونه"))


class WordExportTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.payload = {
            "profile": {
                "name": "دکتر Soheil",
                "url": "https://civilica.com/p/176225/",
            },
            "articles": [ARTICLE],
            "style": "apa7",
        }

    def test_docx_uses_requested_fonts_rtl_and_digit_rules(self):
        response = self.client.post(
            "/api/export-word",
            json={**self.payload, "file_type": "docx"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content_type,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
        document = Document(BytesIO(response.data))
        citation = document.paragraphs[-1]
        self.assertIn("1402", citation.text)
        self.assertIn("https://civilica.com/doc/12/", citation.text)
        self.assertIn("w:bidi", citation._p.xml)
        self.assertIn("B Nazanin", {run.font.name for run in citation.runs})
        self.assertIn("Times New Roman", {run.font.name for run in citation.runs})
        self.assertIn(14.0, {run.font.size.pt for run in citation.runs if run.font.size})
        self.assertIn(13.0, {run.font.size.pt for run in citation.runs if run.font.size})
        self.assertIn('w:val="right"', document.paragraphs[0]._p.xml)

    def test_persian_digits_become_english_font_runs(self):
        article = {
            **ARTICLE,
            "title": "عنوان پژوهش ۱۴۰۲ English",
            "year": "۱۴۰۲",
        }
        response = self.client.post(
            "/api/export-word",
            json={**self.payload, "articles": [article], "file_type": "docx"},
        )

        self.assertEqual(response.status_code, 200)
        document = Document(BytesIO(response.data))
        citation = document.paragraphs[-1]
        self.assertIn("1402", citation.text)
        self.assertNotIn("۱۴۰۲", citation.text)
        numeric_runs = [run for run in citation.runs if "1402" in run.text]
        self.assertTrue(numeric_runs)
        self.assertTrue(all(run.font.name == "Times New Roman" for run in numeric_runs))
        self.assertTrue(all(run.font.size.pt == 13.0 for run in numeric_runs))

    def test_docx_can_omit_civilica_links(self):
        response = self.client.post(
            "/api/export-word",
            json={**self.payload, "file_type": "docx", "include_links": False},
        )

        self.assertEqual(response.status_code, 200)
        document = Document(BytesIO(response.data))
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)
        self.assertNotIn("https://civilica.com", text)
        self.assertIn("صفحهٔ پژوهشگر سیویلیکا", text)

    def test_doc_compatibility_export_is_word_readable(self):
        response = self.client.post(
            "/api/export-word",
            json={**self.payload, "file_type": "doc"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/msword")
        self.assertTrue(response.data.startswith(b"\xef\xbb\xbf<!doctype html"))
        self.assertIn(b"<head>", response.data)
        self.assertIn(b"text-align: right", response.data)
        self.assertIn("B Nazanin".encode(), response.data)
        self.assertIn("Times New Roman".encode(), response.data)
        self.assertIn("1402".encode(), response.data)
        self.assertIn(b"/doc/12/", response.data)


if __name__ == "__main__":
    unittest.main()
