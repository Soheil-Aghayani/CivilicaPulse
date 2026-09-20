<div align="center">

<img src="docs/readme-hero.svg" alt="CivilicaPulse visual hero" width="100%">

# <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/solar:document-text-linear.svg?color=%2338BDF8"><source media="(prefers-color-scheme: light)" srcset="https://api.iconify.design/solar:document-text-linear.svg?color=%231E3A5F"><img alt="Document icon" src="https://api.iconify.design/solar:document-text-linear.svg?color=%231E3A5F" width="38" height="38" align="text-bottom"></picture> CivilicaPulse

### Extract, curate, and export Civilica researcher publications.

[![Live site](https://img.shields.io/badge/Live_site-Civilica%2B-1E3A5F?style=for-the-badge)](https://soheil-aghayani.github.io/CivilicaPulse/)
[![Architecture](https://img.shields.io/badge/Architecture-Static_UI_%7C_Flask_API-0F172A?style=for-the-badge)](#architecture)
[![Deployment](https://img.shields.io/badge/Hosting-GitHub_Pages_%7C_Cloudflare_%7C_Render-2563EB?style=for-the-badge&logo=cloudflare&logoColor=white)](#deployment)
[![License](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge)](LICENSE)

<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=600&size=23&pause=1000&color=38BDF8&center=true&vCenter=true&width=860&lines=Extract+Civilica+researcher+publications;Format+APA+7th,+Vancouver,+IEEE,+Harvard,+Chicago,+MLA,+and+BibTeX;Export+properly+formatted+Word+documents;Support+Persian+RTL+academic+workflows">
    <source media="(prefers-color-scheme: light)" srcset="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=600&size=23&pause=1000&color=1E3A5F&center=true&vCenter=true&width=860&lines=Extract+Civilica+researcher+publications;Format+APA+7th,+Vancouver,+IEEE,+Harvard,+Chicago,+MLA,+and+BibTeX;Export+properly+formatted+Word+documents;Support+Persian+RTL+academic+workflows">
    <img alt="CivilicaPulse capabilities" src="https://readme-typing-svg.demolab.com?font=Plus+Jakarta+Sans&weight=600&size=23&pause=1000&color=1E3A5F&center=true&vCenter=true&width=860&lines=Extract+Civilica+researcher+publications;Format+APA+7th,+Vancouver,+IEEE,+Harvard,+Chicago,+MLA,+and+BibTeX;Export+properly+formatted+Word+documents;Support+Persian+RTL+academic+workflows">
  </picture>
</p>

<p align="center">
  A focused research utility for turning a public Civilica researcher profile into a searchable publication list and a ready-to-use bibliography.
</p>

</div>

---

## Overview

CivilicaPulse is a free, open-source academic utility for researchers who use [Civilica](https://civilica.com). Paste a public researcher profile URL, review the indexed publications, select the records you need, and export a bibliography in the citation style required by your workflow.

The application is designed for Persian academic content but also handles Latin text, mixed-language titles, co-authors, links, and publication metadata. The default view preserves every available author. An optional target-author isolation control is available when a researcher needs a focused bibliography.

## Live links

- **Website:** [soheil-aghayani.github.io/CivilicaPulse](https://soheil-aghayani.github.io/CivilicaPulse/)
- **API health:** [civilicapulse-api-bridge.soheil-deutschly.workers.dev/api/health](https://civilicapulse-api-bridge.soheil-deutschly.workers.dev/api/health)
- **Related project:** [ScholarPulse](https://soheil-aghayani.github.io/ScholarPulse/)
- **Author:** [Soheil Aghayani](https://github.com/Soheil-Aghayani)

## Features

- Extract publication records from a public Civilica researcher profile.
- Use pasted page HTML when direct profile access is unavailable.
- Resolve co-authors in small background batches without blocking the initial results.
- Keep all available authors by default, or isolate a target author when needed.
- Search and filter by title, author, publication type, venue, and year.
- Browse long publication lists with pagination, cards, table view, and analytics.
- Format references as APA 7th, Vancouver, IEEE, Harvard, Chicago, MLA 9th, or BibTeX.
- Export `.docx` and Word-compatible `.doc` files, plus JSON, CSV, BibTeX, copy, and print outputs.
- Generate right-to-left Word documents with Persian typography and mixed Persian/Latin text handling.
- Keep processing stateless: no account, database, API key, or stored publication library is required.

## Architecture

| Layer | Responsibility | Technology |
| :--- | :--- | :--- |
| Static frontend | Profile input, search, filters, pagination, author controls, and exports | Semantic HTML, vanilla JavaScript, and CSS |
| Parser and API | Civilica profile parsing, author enrichment, validation, and export responses | Python and Flask |
| Citation engine | Style normalization and citation formatting | `citation_formats.py` |
| Word generator | RTL paragraphs, script-aware fonts, Persian digits, and Word output | `python-docx` and Word-compatible HTML |
| API bridge | Browser-safe routing from the static site to the Flask service | Cloudflare Worker |

### Request flow

1. The frontend sends a public Civilica profile URL to the Flask API.
2. The API returns the publication list quickly so the interface can become usable immediately.
3. The frontend requests missing article authors in bounded batches and merges them into the current list.
4. Word and structured exports wait for the author-enrichment run before generating the final file.

## Word export rules

| Property | Behavior |
| :--- | :--- |
| Direction | Right-to-left paragraphs with right alignment |
| Persian text | `B Nazanin` |
| English and Latin text | `Times New Roman`, one point smaller than the Persian base size |
| Numerals | Persian digits in normal text; URLs preserve Latin digits |
| Modern output | Native `.docx` generated with `python-docx` |
| Compatibility output | Word-compatible `.doc` HTML export |
| Links | Civilica links can be included or omitted from the Word file |

## Repository structure

```text
CivilicaPulse/
├── web/                    # Static frontend and GitHub Pages deploy target
│   ├── assets/             # Site artwork, icons, fonts, and preview assets
│   ├── app.js              # UI state, rendering, filtering, and exports
│   ├── config.js           # Local and production API selection
│   ├── index.html          # Accessible RTL application shell
│   └── styles.css          # Theme, responsive layout, and component styles
├── cloudflare/             # Cloudflare Worker API bridge
├── docs/                   # README and documentation artwork
├── tests/                  # Parser, citation, and Word export regression tests
├── citation_formats.py     # Citation style formatters
├── civilica_parser.py      # Civilica profile and article metadata parsers
├── server.py               # Flask API and Word document generator
├── render.yaml             # Render service definition
├── requirements.txt        # Python dependencies
└── start.bat               # Windows local-development launcher
```

## Production API

The frontend is published on GitHub Pages. Browser requests use the Cloudflare Worker bridge and are forwarded to the Flask service on Render:

```text
https://civilicapulse-api-bridge.soheil-deutschly.workers.dev
```

Available API routes include:

| Method | Route | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/parse-profile` | Read a public Civilica profile |
| `POST` | `/api/parse-html` | Parse pasted Civilica HTML |
| `POST` | `/api/enrich-authors` | Resolve authors for one bounded batch |
| `POST` | `/api/export-word` | Generate `.docx` or Word-compatible `.doc` output |

## Local development

### Windows launcher

Double-click [`start.bat`](start.bat) to create or reuse the virtual environment, install dependencies, and start the local server.

### PowerShell

```powershell
# From the repository root
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Tests

```powershell
python -m unittest discover -s tests -v
```

## Deployment

- **Frontend:** GitHub Pages from the `web/` directory.
- **API:** Render service defined by [`render.yaml`](render.yaml).
- **Browser bridge:** Cloudflare Worker in [`cloudflare/`](cloudflare/).

The production frontend is configured in [`web/config.js`](web/config.js). Localhost uses the local Flask server; the published site uses the Cloudflare bridge.

## License

CivilicaPulse is released under the MIT License. See [`LICENSE`](LICENSE) for the full text.

## Credits

Designed and developed by [Soheil Aghayani](https://github.com/Soheil-Aghayani), an environmental engineering researcher building focused tools for academic and technical workflows.

<div align="center">
  <sub>Built for practical Persian academic research workflows.</sub>
</div>
