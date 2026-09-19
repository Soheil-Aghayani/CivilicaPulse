/**
 * CivilicaPulse — Live Academic Researcher Toolkit
 * Features:
 * - Multi-author citation generation & custom author management
 * - Target author isolation (تفکیک پژوهشگر هدف) and bolding in Word & citations
 * - Co-author filtering & collaborator analytics
 * - Authentic Persian typography (IRANYekanX) & Solar icon consistency
 * - Backend-backed profile parsing and Word (.docx) export, plus local exports
 */

(function () {
  "use strict";

  // No bundled sample data; live input only.
  // State
  var state = {
    profile: null,
    articles: [],
    selected: new Set(),
    filter: "all",
    authorFilter: "all",
    targetAuthor: "",   // generalized: auto-filled from profile name, user can override freely
    boldTargetAuthor: true,
    isolateTargetAuthor: false,
    query: "",
    citationStyle: "apa7",
    view: "cards",
    page: 1,
    pageSize: 10
  };

  var apiBaseUrl = String(window.CIVILICA_API_BASE_URL || "").replace(/\/+$/, "");
  var profileFallbackProxy = "https://api.cors.lol/?url=";
  // Render may need a few seconds to wake up on the first request.
  var backendRequestTimeout = 120000;
  var fallbackRequestTimeout = 30000;

  function apiUrl(path) {
    return apiBaseUrl + path;
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var requestOptions = Object.assign({}, options || {});
    var timer = null;
    if (controller) requestOptions.signal = controller.signal;

    var request = fetch(url, requestOptions);
    if (!controller) return request;

    timer = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);
    return request.finally(function () {
      window.clearTimeout(timer);
    });
  }

  function shouldUseProfileFallback(error) {
    return !error || error.name === "TypeError" || error.name === "AbortError" || error.name === "SyntaxError";
  }

  function userFacingError(error, fallbackMessage) {
    if (error && error.name === "AbortError") {
      return "پاسخ سرور دیر رسید؛ دوباره تلاش کنید یا حالت HTML را انتخاب کنید.";
    }
    if (error && error.name === "TypeError") {
      return "اتصال به سرویس برقرار نشد؛ DNS یا شبکه را بررسی کنید یا حالت HTML را انتخاب کنید.";
    }
    return (error && error.message) || fallbackMessage;
  }

  function setLoadingState(isLoading) {
    var statusEl = document.getElementById("scrape-status");
    var extractButton = document.getElementById("extract-button");

    if (statusEl) statusEl.hidden = !isLoading;
    if (!extractButton) return;

    extractButton.disabled = isLoading;
    extractButton.setAttribute("aria-busy", isLoading ? "true" : "false");
    extractButton.innerHTML = isLoading
      ? '<svg class="icon loading-icon" aria-hidden="true"><use href="#icon-loader"></use></svg>'
      : '<svg class="icon" aria-hidden="true"><use href="#icon-search"></use></svg>';
  }

  async function requestProfileFromBackend(profileUrl) {
    var response = await fetchWithTimeout(apiUrl("/api/parse-profile"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: profileUrl })
    }, backendRequestTimeout);
    var payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "دریافت پروفایل انجام نشد.");
    return payload;
  }

  async function requestProfileFromFallback(profileUrl) {
    var proxyUrl = profileFallbackProxy + encodeURIComponent(profileUrl);
    var response = await fetchWithTimeout(proxyUrl, {
      headers: { "Accept": "text/html" }
    }, fallbackRequestTimeout);
    if (!response.ok) throw new Error("مسیر جایگزین دریافت صفحه در دسترس نیست.");

    var html = await response.text();
    var parsed = parseCivilicaHtml(html, profileUrl);
    if (!parsed || !Array.isArray(parsed.articles) || !parsed.articles.length) {
      throw new Error("مقاله‌ای در این پروفایل پیدا نشد.");
    }
    return {
      ok: true,
      profile: parsed.profile,
      articles: parsed.articles,
      count: parsed.articles.length,
      source: "browser-fallback"
    };
  }

  async function requestProfile(profileUrl) {
    try {
      return await requestProfileFromBackend(profileUrl);
    } catch (error) {
      if (!shouldUseProfileFallback(error)) throw error;
      return requestProfileFromFallback(profileUrl);
    }
  }

  function setResultsVisible(visible) {
    ["author-card", "control-deck", "references-view", "table-view", "analytics-view", "pagination"]
      .forEach(function (id) {
        var element = document.getElementById(id);
        if (element) element.hidden = !visible;
      });
  }

  // Helpers
  function toPersianDigits(value) {
    var persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    var allDigits = "0123456789٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[0-9٠-٩]/g, function (digit) {
      var index = allDigits.indexOf(digit);
      return index >= 0 ? persianDigits[index % 10] : digit;
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cleanAuthor(name) {
    var val = String(name || "").trim();
    return val.replace(/^(?:(?:آقای|خانم|دکتر|پروفسور|استاد|مهندس)\s+)+/gi, "").trim();
  }

  function splitAuthors(value) {
    return String(value || "")
      .split(/\s*(?:[,،؛;]|\s+(?:و|and)\s+)\s*/i)
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  function normalizeAuthorForMatch(value) {
    return cleanAuthor(value)
      .replace(/ي/g, "ی")
      .replace(/ى/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/ـ/g, "")
      .replace(/\u200c/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function getCitationAuthors(article, targetAuthor, isolate) {
    var fullAuthors = String(article.authors || (state.profile ? state.profile.name : "پژوهشگر")).trim();
    var targetKey = normalizeAuthorForMatch(targetAuthor);
    if (!isolate || targetKey.length < 3) return fullAuthors;

    var match = splitAuthors(fullAuthors).find(function (candidate) {
      var candidateKey = normalizeAuthorForMatch(candidate);
      return candidateKey && (
        candidateKey === targetKey ||
        candidateKey.indexOf(targetKey) >= 0 ||
        targetKey.indexOf(candidateKey) >= 0
      );
    });
    return match || fullAuthors;
  }

  function syncIsolateTargetButton() {
    var button = document.getElementById("isolate-target-author");
    if (!button) return;
    var active = state.isolateTargetAuthor && normalizeAuthorForMatch(state.targetAuthor).length >= 3;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    var msgEl = document.getElementById("toast-message");
    if (!toast) return;
    if (msgEl) msgEl.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  // Citation Formatter with Multi-Author & Target Bolding Support
  function formatCitation(article, index, style, targetAuthor, asHtml) {
    var fullAuthors = getCitationAuthors(article, targetAuthor, state.isolateTargetAuthor);
    var title = String(article.title || "بدون عنوان").replace(/\.+$/, "");
    var venue = String(article.venue || "").replace(/\.+$/, "");
    var year = article.year ? toPersianDigits(article.year) : "بی‌تا";
    var displayIndex = toPersianDigits(index);
    var url = article.url || "";
    var venuePart = venue ? " " + venue + "." : "";
    var urlPart = url ? " " + url : "";

    // Highlight target author if requested and in HTML mode
    var authorsDisplay = fullAuthors;
    if (asHtml && state.boldTargetAuthor && targetAuthor) {
      var targetClean = cleanAuthor(targetAuthor);
      if (targetClean) {
        var re = new RegExp("(" + escapeRegex(targetClean) + ")", "gi");
        authorsDisplay = authorsDisplay.replace(re, '<strong class="author-highlight">$1</strong>');
      }
    }

    switch (style) {
      case "vancouver":
        return displayIndex + ". " + authorsDisplay + ". " + title + "." + venuePart + " " + year + "." + urlPart;
      case "ieee":
        return "[" + displayIndex + "] " + authorsDisplay + ", “" + title + ",”" + (venue ? " " + venue + "," : "") + " " + year + "." + urlPart;
      case "harvard":
        return authorsDisplay + " (" + year + ") ‘" + title + "’." + venuePart + urlPart;
      case "chicago":
        return authorsDisplay + ". “" + title + ".”" + venuePart + " (" + year + ")." + urlPart;
      case "mla":
        return authorsDisplay + ". “" + title + ".”" + (venue ? " " + venue + "," : "") + " " + year + "." + urlPart;
      case "bibtex":
        var key = "civilica_" + (article.id || index);
        return "@misc{" + key + ",\n" +
          "  author = {" + fullAuthors + "},\n" +
          "  title = {" + title + "},\n" +
          "  year = {" + (article.year || "") + "},\n" +
          "  howpublished = {" + venue + "},\n" +
          (url ? "  url = {" + url + "}\n" : "") +
          "}";
      case "apa7":
      default:
        return authorsDisplay + " (" + year + "). " + title + "." + venuePart + urlPart;
    }
  }

  // Client-Side DOM HTML Parser — Handles modern Civilica (Tailwind) page structure
  function parseCivilicaHtml(htmlText, fallbackUrl) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlText, "text/html");

    // ── Researcher name ──────────────────────────────────────────────────────
    var h1 = doc.querySelector("h1");
    var titleTag = doc.querySelector("title");
    var researcherName =
      h1 ? h1.textContent.trim() :
        titleTag ? titleTag.textContent.split("-")[0].trim() :
          "پژوهشگر سیویلیکا";

    var articles = [];
    var seenIds = new Set();

    // ── Collect ALL `a[href*="/doc/"]` links, skip PDF icon links ───────────
    var allLinks = doc.querySelectorAll('a[href*="/doc/"]');

    allLinks.forEach(function (a) {
      // Skip PDF download icon links (class="mx-1" OR title="دریافت فایل PDF مقاله")
      if (a.classList.contains("mx-1")) return;
      if ((a.getAttribute("title") || "").trim() === "دریافت فایل PDF مقاله") return;

      var href = a.getAttribute("href") || "";
      var match = href.match(/\/doc\/(\d+)\/?/);
      if (!match) return;
      var id = match[1];
      if (seenIds.has(id)) return;
      seenIds.add(id);

      // Title: prefer title attribute, fall back to visible text (strip year/venue text)
      var title = (a.getAttribute("title") || "").trim();
      if (!title) {
        // Remove known suffixes like "ارائه شده در..." and "(۱۴۰۲)"
        title = (a.textContent || "").trim()
          .replace(/[\(（]\d{4}[\)）]/g, "")
          .replace(/(?:ارائه|منتشر)\s+شده\s+در.*$/u, "")
          .trim();
      }
      if (!title) return;

      // Year: look for 4-digit year in full text of the link
      var linkText = a.textContent || "";
      var yearMatchLatin = linkText.match(/\b(13\d{2}|14\d{2})\b/);
      // Also handle Persian digits: ۱۴۰۲ etc.
      var yearMatchPersian = linkText.match(/(۱[۳۴]\d{0,2})/u);
      var year = "1402";
      if (yearMatchLatin) {
        year = yearMatchLatin[1];
      } else if (yearMatchPersian) {
        // Convert Persian to Latin
        var py = yearMatchPersian[1];
        var persianDigits = "۰۱۲۳۴۵۶۷۸۹";
        year = py.split("").map(function (c) {
          var i = persianDigits.indexOf(c);
          return i >= 0 ? String(i) : c;
        }).join("");
      }

      // Venue: the `<i>` tag immediately inside or right after this link's parent
      var venue = "محل انتشار نامشخص";
      var iEl = a.querySelector("i");
      if (!iEl) {
        // Try sibling <i> in same parent
        var parent = a.parentNode;
        if (parent) iEl = parent.querySelector("i");
      }
      if (iEl && iEl.textContent.trim()) {
        venue = iEl.textContent.trim();
      }

      // Article type from headings above, or from link text keywords
      var type = "مقاله";
      var linkTextLower = linkText + " " + venue;
      if (/ارائه\s+شده|کنفرانس|همایش|سمینار/u.test(linkTextLower)) {
        type = "مقاله کنفرانسی";
      } else if (/منتشر\s+شده|ژورنال|نشریه|فصلنامه|مجله/u.test(linkTextLower)) {
        type = "مقاله ژورنالی";
      } else if (/طرح\s+پژوهشی|پروژه\s+پژوهش/u.test(linkTextLower)) {
        type = "طرح پژوهشی";
      }
      // Fallback: try to detect from surrounding heading text
      if (type === "مقاله") {
        // Walk up to find a heading that describes the section
        var ancestor = a.parentNode;
        for (var depth = 0; depth < 8 && ancestor; depth++, ancestor = ancestor.parentNode) {
          var siblings = ancestor.parentNode ? ancestor.parentNode.children : [];
          for (var si = 0; si < siblings.length; si++) {
            var sib = siblings[si];
            if (/h[1-6]/i.test(sib.tagName)) {
              var hText = sib.textContent;
              if (/کنفرانس|همایش/u.test(hText)) { type = "مقاله کنفرانسی"; depth = 99; break; }
              if (/ژورنال|نشریه|فصلنامه/u.test(hText)) { type = "مقاله ژورنالی"; depth = 99; break; }
            }
          }
        }
      }

      // Co-authors: text siblings AFTER this link in the same parent, before the next link
      var authors = researcherName;
      var parentNode = a.parentNode;
      if (parentNode) {
        var nodes = parentNode.childNodes;
        var foundLink = false;
        var coAuthorParts = [];
        for (var ni = 0; ni < nodes.length; ni++) {
          var node = nodes[ni];
          if (node === a) { foundLink = true; continue; }
          if (!foundLink) continue;
          if (node.nodeType === 3 /* TEXT_NODE */) {
            var txt = node.textContent.replace(/\s+/g, " ").trim();
            // Filter out short connective text, keep author lists (contain ، or multiple words)
            if (txt.length > 2 && !/^(?:ارائه|منتشر|شده|در|و|با|از|را|که|به)$/u.test(txt)) {
              coAuthorParts.push(txt);
            }
          } else if (node.nodeType === 1 /* ELEMENT_NODE */) {
            var tag = (node.tagName || "").toLowerCase();
            // Stop at next link or structural element (not <i>)
            if (tag === "a" || tag === "br" || tag === "div" || tag === "p" || tag === "li" || tag === "ul") break;
            if (tag !== "i") {
              var elemTxt = node.textContent.replace(/\s+/g, " ").trim();
              if (elemTxt.length > 2) coAuthorParts.push(elemTxt);
            }
          }
        }
        var coAuthorText = coAuthorParts.join(" ").replace(/\s+/g, " ").trim();
        // Only use if it looks like an author string (contains ، Persian name separator)
        if (coAuthorText && (coAuthorText.indexOf("،") >= 0 || coAuthorText.indexOf(",") >= 0 || coAuthorText.split(" ").length >= 2)) {
          authors = coAuthorText;
        }
      }

      articles.push({
        id: id,
        title: title,
        venue: venue,
        year: year,
        type: type,
        authors: authors,
        url: "https://civilica.com/doc/" + id + "/"
      });
    });

    return {
      profile: {
        id: "custom",
        name: researcherName,
        affil: "پژوهشگر نمایه‌شده در پایگاه استنادی سیویلیکا",
        url: fallbackUrl || "https://civilica.com"
      },
      articles: articles
    };
  }

  // Load Profile Dataset
  function loadDataset(data) {
    var profile = data && data.profile ? data.profile : {};
    var articles = data && Array.isArray(data.articles) ? data.articles : [];
    if (!articles.length) return false;

    state.profile = profile;
    state.articles = articles;
    state.selected = new Set(articles.map(function (a) { return a.id; }));
    state.targetAuthor = cleanAuthor(profile.name || "");
    state.authorFilter = "all";
    state.isolateTargetAuthor = false;
    state.page = 1;

    var targetInput = document.getElementById("target-author-input");
    if (targetInput) targetInput.value = state.targetAuthor;
    syncIsolateTargetButton();

    setResultsVisible(true);
    updateAuthorHeader();
    updateKpis();
    updateAuthorFilterOptions();
    renderActiveView();
    return true;
  }

  // Update Author Header & Target Panel
  function updateAuthorHeader() {
    var p = state.profile;
    if (!p) return;
    document.getElementById("author-name").textContent = p.name;
    document.getElementById("author-affil").textContent = p.affil || "پژوهشگر سیویلیکا";
    var link = document.getElementById("author-link");
    if (link) link.href = p.url || "#";

    var identicon = document.getElementById("author-identicon");
    if (identicon && window.jdenticon) {
      var identity = p.id || p.url || p.name || "civilicapulse";
      identicon.setAttribute("data-jdenticon-value", identity);
      window.jdenticon.update(identicon, identity);
    }
  }

  // Gather Unique Authors for the Filter Dropdown
  function updateAuthorFilterOptions() {
    var select = document.getElementById("author-filter-select");
    if (!select) return;

    var authorsMap = {};
    state.articles.forEach(function (a) {
      var raw = a.authors || "";
      var parts = splitAuthors(raw);
      parts.forEach(function (name) {
        var clean = cleanAuthor(name);
        if (clean.length > 2) {
          authorsMap[name] = (authorsMap[name] || 0) + 1;
        }
      });
    });

    var sorted = Object.keys(authorsMap).sort(function (a, b) {
      return authorsMap[b] - authorsMap[a];
    });

    var html = '<option value="all">همهٔ نویسندگان (' + toPersianDigits(state.articles.length) + ')</option>';
    sorted.forEach(function (name) {
      var count = authorsMap[name];
      var isSelected = state.authorFilter === name ? " selected" : "";
      html += '<option value="' + escapeHtml(name) + '"' + isSelected + '>' + escapeHtml(name) + ' (' + toPersianDigits(count) + ' مقاله)</option>';
    });

    select.innerHTML = html;
  }

  // Update KPI Cards
  function updateKpis() {
    var total = state.articles.length;
    var conf = state.articles.filter(function (a) { return a.type === "مقاله کنفرانسی"; }).length;
    var journal = state.articles.filter(function (a) { return a.type === "مقاله ژورنالی"; }).length;
    var research = state.articles.filter(function (a) { return a.type === "طرح پژوهشی"; }).length;

    var years = state.articles.map(function (a) { return parseInt(a.year, 10); }).filter(function (y) { return !isNaN(y); });
    var span = years.length > 0
      ? toPersianDigits(Math.min.apply(null, years)) + " - " + toPersianDigits(Math.max.apply(null, years))
      : "—";

    document.getElementById("metric-total").textContent = toPersianDigits(total);
    document.getElementById("metric-conf").textContent = toPersianDigits(conf);
    document.getElementById("metric-journal").textContent = toPersianDigits(journal);
    document.getElementById("metric-research").textContent = toPersianDigits(research);
    document.getElementById("metric-span").textContent = span;

    document.getElementById("count-all").textContent = toPersianDigits(total);
    document.getElementById("count-conf").textContent = toPersianDigits(conf);
    document.getElementById("count-journal").textContent = toPersianDigits(journal);
    document.getElementById("count-research").textContent = toPersianDigits(research);
    document.getElementById("selected-badge").textContent = toPersianDigits(state.selected.size);
  }

  // Get Visible Articles (Type filter + Author filter + Query)
  function getVisibleArticles() {
    var q = state.query.trim().toLowerCase();
    var authorF = state.authorFilter.trim().toLowerCase();

    return state.articles.filter(function (a) {
      var matchType = state.filter === "all" || a.type === state.filter;
      var authorsLower = (a.authors || "").toLowerCase();
      var matchAuthor = authorF === "all" || authorsLower.indexOf(authorF) >= 0;

      var text = (a.title + " " + a.venue + " " + a.year + " " + (a.authors || "")).toLowerCase();
      var matchQuery = !q || text.indexOf(q) >= 0;

      return matchType && matchAuthor && matchQuery;
    });
  }

  // Render Router
  function renderActiveView() {
    var visible = getVisibleArticles();
    var refView = document.getElementById("references-view");
    var tableView = document.getElementById("table-view");
    var analyticsView = document.getElementById("analytics-view");
    var pagination = document.getElementById("pagination");

    refView.style.display = "none";
    tableView.style.display = "none";
    analyticsView.style.display = "none";
    pagination.style.display = "none";
    pagination.hidden = true;

    if (state.view === "cards") {
      refView.style.display = "flex";
      renderReferencesView(visible);
    } else if (state.view === "table") {
      tableView.style.display = "block";
      renderTableView(visible);
    } else if (state.view === "analytics") {
      analyticsView.style.display = "flex";
      renderAnalyticsView(visible);
    }

    document.getElementById("selected-badge").textContent = toPersianDigits(state.selected.size);
  }

  // 1. References View
  function renderReferencesView(visible) {
    var container = document.getElementById("references-view");
    var pagination = document.getElementById("pagination");

    if (visible.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-muted); background:var(--bg-surface); border:1px dashed var(--border-medium); border-radius:var(--radius-lg);">' +
        '<h3>مقاله‌ای با این مشخصات یافت نشد.</h3><p style="margin-top:6px; font-size:0.9rem;">فیلتر نویسنده یا عبارت جست‌وجو را تغییر دهید.</p></div>';
      return;
    }

    var totalPages = Math.max(1, Math.ceil(visible.length / state.pageSize));
    state.page = Math.min(Math.max(state.page, 1), totalPages);

    var start = (state.page - 1) * state.pageSize;
    var paged = visible.slice(start, start + state.pageSize);

    if (visible.length > state.pageSize) {
      pagination.hidden = false;
      pagination.style.display = "flex";
      document.getElementById("pagination-info").textContent = "صفحه " + toPersianDigits(state.page) + " از " + toPersianDigits(totalPages) + " · " + toPersianDigits(visible.length) + " مقاله";
      document.getElementById("prev-page").disabled = state.page <= 1;
      document.getElementById("next-page").disabled = state.page >= totalPages;
    }

    var targetClean = cleanAuthor(state.targetAuthor);

    container.innerHTML = paged.map(function (article) {
      var isSelected = state.selected.has(article.id);
      var globalIndex = state.articles.indexOf(article) + 1;

      // Highlight target author in the authors line
      var authorsRaw = article.authors || (state.profile ? state.profile.name : "پژوهشگر");
      var authorsDisplay = getCitationAuthors(article, state.targetAuthor, state.isolateTargetAuthor);
      var authorsLineHtml = escapeHtml(authorsDisplay);
      if (state.boldTargetAuthor && targetClean) {
        var re = new RegExp("(" + escapeRegex(targetClean) + ")", "gi");
        authorsLineHtml = authorsLineHtml.replace(re, '<strong class="author-highlight">$1</strong>');
      }

      var citationHtml = formatCitation(article, globalIndex, state.citationStyle, state.targetAuthor, true);
      var citationPlain = formatCitation(article, globalIndex, state.citationStyle, state.targetAuthor, false);

      return (
        '<article class="article-card' + (isSelected ? " is-selected" : "") + '" data-id="' + article.id + '">' +
        '<input type="checkbox" class="article-check" data-id="' + article.id + '"' + (isSelected ? " checked" : "") + ' aria-label="انتخاب">' +
        '<div class="article-content">' +
        '<h3 class="article-title">' + escapeHtml(article.title) + '</h3>' +
        '<div class="article-authors-row">' +
        '<svg class="icon" aria-hidden="true" style="color:var(--text-subtle);"><use href="#icon-user"></use></svg>' +
        '<span class="article-authors-text">نویسندگان: ' + authorsLineHtml + '</span>' +
        '<button class="btn-subtle btn-trigger-edit-author" data-id="' + article.id + '" type="button" title="ویرایش اسامی نویسندگان این مقاله">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg>' +
        '<span>ویرایش</span>' +
        '</button>' +
        '</div>' +
        '<div class="inline-author-edit" id="author-edit-box-' + article.id + '" style="display:none;">' +
        '<input type="text" class="edit-author-input" data-id="' + article.id + '" value="' + escapeHtml(authorsRaw) + '" placeholder="اسامی نویسندگان (جداشده با ویرگول)...">' +
        '<button class="btn-primary btn-save-author" data-id="' + article.id + '" type="button" style="padding:4px 10px; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>' +
        '<span>تأیید</span>' +
        '</button>' +
        '<button class="btn-secondary btn-cancel-author" data-id="' + article.id + '" type="button" style="padding:4px 10px; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>' +
        '<span>انصراف</span>' +
        '</button>' +
        '</div>' +
        '<div class="article-meta">' +
        '<span class="meta-tag">' + escapeHtml(article.type) + '</span>' +
        '<span>سال <b>' + toPersianDigits(article.year) + '</b></span>' +
        '<span>' + escapeHtml(article.venue) + '</span>' +
        '</div>' +
        '<div class="article-citation">' + citationHtml + '</div>' +
        '<div class="article-actions">' +
        '<button class="btn-subtle btn-copy-one" data-citation="' + escapeHtml(citationPlain) + '" type="button">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-copy"></use></svg>' +
        '<span>کپی استناد</span>' +
        '</button>' +
        '<a class="btn-subtle" href="' + escapeHtml(article.url) + '" target="_blank" rel="noreferrer">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-external"></use></svg>' +
        '<span>سیویلیکا</span>' +
        '</a>' +
        '</div>' +
        '</div>' +
        '<span class="article-index">' + toPersianDigits(globalIndex) + '</span>' +
        '</article>'
      );
    }).join("");
  }

  // 2. Table View with Authors Column
  function renderTableView(visible) {
    var tbody = document.getElementById("table-body");
    var targetClean = cleanAuthor(state.targetAuthor);

    tbody.innerHTML = visible.map(function (article, index) {
      var isSelected = state.selected.has(article.id);
      var rowNum = toPersianDigits(index + 1);
      var authorsDisplay = getCitationAuthors(article, state.targetAuthor, state.isolateTargetAuthor);
      var authors = escapeHtml(authorsDisplay);
      if (state.boldTargetAuthor && targetClean) {
        var re = new RegExp("(" + escapeRegex(targetClean) + ")", "gi");
        authors = authors.replace(re, '<strong class="author-highlight">$1</strong>');
      }

      return (
        '<tr' + (isSelected ? ' style="background:var(--primary-subtle);"' : "") + '>' +
        '<td><input type="checkbox" class="table-row-check" data-id="' + article.id + '"' + (isSelected ? " checked" : "") + '></td>' +
        '<td style="font-weight:700;">' + rowNum + '</td>' +
        '<td style="font-weight:600; min-width:240px;">' + escapeHtml(article.title) + '</td>' +
        '<td style="min-width:180px; font-size:0.85rem;">' + authors + '</td>' +
        '<td><span class="meta-tag">' + escapeHtml(article.type) + '</span></td>' +
        '<td>' + toPersianDigits(article.year) + '</td>' +
        '<td style="color:var(--text-muted); font-size:0.825rem;">' + escapeHtml(article.venue) + '</td>' +
        '<td><a class="nav-link" href="' + escapeHtml(article.url) + '" target="_blank" rel="noreferrer">مشاهده</a></td>' +
        '</tr>'
      );
    }).join("");
  }

  // 3. Analytics View with Co-Authors Chart
  function renderAnalyticsView(visible) {
    // 1. Years Distribution
    var yearsCount = {};
    visible.forEach(function (a) {
      var y = a.year || "نامشخص";
      yearsCount[y] = (yearsCount[y] || 0) + 1;
    });

    var sortedYears = Object.keys(yearsCount).sort().reverse();
    var maxYearCount = Math.max.apply(null, Object.values(yearsCount).concat([1]));
    var chartYears = document.getElementById("chart-years");
    chartYears.innerHTML = sortedYears.map(function (y) {
      var count = yearsCount[y];
      var pct = Math.round((count / maxYearCount) * 100);
      return (
        '<div class="bar-chart-row">' +
        '<span class="bar-label">' + toPersianDigits(y) + '</span>' +
        '<div class="bar-track">' +
        '<div class="bar-fill" style="width:' + pct + '%;"></div>' +
        '</div>' +
        '<span class="bar-value">' + toPersianDigits(count) + '</span>' +
        '</div>'
      );
    }).join("");

    // 2. Types Distribution
    var typesCount = {};
    visible.forEach(function (a) {
      typesCount[a.type] = (typesCount[a.type] || 0) + 1;
    });

    var chartTypes = document.getElementById("chart-types");
    var maxTypeCount = Math.max.apply(null, Object.values(typesCount).concat([1]));
    chartTypes.innerHTML = Object.keys(typesCount).map(function (t) {
      var count = typesCount[t];
      var pct = Math.round((count / maxTypeCount) * 100);
      return (
        '<div class="bar-chart-row">' +
        '<span class="bar-label" style="width:110px;">' + escapeHtml(t) + '</span>' +
        '<div class="bar-track">' +
        '<div class="bar-fill" style="width:' + pct + '%;"></div>' +
        '</div>' +
        '<span class="bar-value">' + toPersianDigits(count) + '</span>' +
        '</div>'
      );
    }).join("");

    // 3. Co-Authors Distribution
    var authorsCount = {};
    visible.forEach(function (a) {
      var parts = (a.authors || "").split(/[,،؛;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      parts.forEach(function (name) {
        if (name.length > 2) {
          authorsCount[name] = (authorsCount[name] || 0) + 1;
        }
      });
    });

    var sortedAuthors = Object.keys(authorsCount).sort(function (a, b) {
      return authorsCount[b] - authorsCount[a];
    }).slice(0, 5);

    var chartAuthors = document.getElementById("chart-authors");
    var maxAuthorCount = Math.max.apply(null, Object.values(authorsCount).concat([1]));
    chartAuthors.innerHTML = sortedAuthors.map(function (authorName) {
      var count = authorsCount[authorName];
      var pct = Math.round((count / maxAuthorCount) * 100);
      return (
        '<div class="bar-chart-row" style="cursor:pointer;" title="کلیک برای فیلتر این نویسنده" data-filter-author="' + escapeHtml(authorName) + '">' +
        '<span class="bar-label" style="width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(authorName) + '</span>' +
        '<div class="bar-track">' +
        '<div class="bar-fill" style="width:' + pct + '%; background:linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);"></div>' +
        '</div>' +
        '<span class="bar-value">' + toPersianDigits(count) + '</span>' +
        '</div>'
      );
    }).join("");

    // 4. Top Venues
    var venuesCount = {};
    visible.forEach(function (a) {
      var v = a.venue || "سایر";
      venuesCount[v] = (venuesCount[v] || 0) + 1;
    });

    var sortedVenues = Object.keys(venuesCount).sort(function (a, b) {
      return venuesCount[b] - venuesCount[a];
    }).slice(0, 6);

    var maxVenueCount = Math.max.apply(null, Object.values(venuesCount).concat([1]));
    var chartVenues = document.getElementById("chart-venues");
    chartVenues.innerHTML = sortedVenues.map(function (v) {
      var count = venuesCount[v];
      var pct = Math.round((count / maxVenueCount) * 100);
      return (
        '<div class="bar-chart-row">' +
        '<span class="bar-label" style="width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + escapeHtml(v) + '">' + escapeHtml(v) + '</span>' +
        '<div class="bar-track">' +
        '<div class="bar-fill" style="width:' + pct + '%;"></div>' +
        '</div>' +
        '<span class="bar-value">' + toPersianDigits(count) + '</span>' +
        '</div>'
      );
    }).join("");
  }

  // Word Document Generator — use the backend so .docx and Persian typography stay correct
  async function generateWordDocument() {
    var selectedArticles = state.articles.filter(function (a) {
      return state.selected.has(a.id);
    });

    if (selectedArticles.length === 0) {
      showToast("ابتدا مقاله‌ای را انتخاب کنید.");
      return;
    }

    var exportButton = document.getElementById("btn-export-word");
    var includeLinks = document.getElementById("include-links");
    if (exportButton) exportButton.disabled = true;

    try {
      var response = await fetch(apiUrl("/api/export-word"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          articles: selectedArticles,
          style: state.citationStyle,
          include_links: includeLinks ? includeLinks.checked : true,
          target_author: state.targetAuthor,
          isolate_author: state.isolateTargetAuthor,
          file_type: "docx"
        })
      });

      if (!response.ok) {
        var errorPayload = await response.json().catch(function () { return {}; });
        throw new Error(errorPayload.error || "ساخت فایل Word انجام نشد.");
      }

      var blob = await response.blob();
      var disposition = response.headers.get("Content-Disposition") || "";
      var filenameMatch = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      var filename = "civilica-references-" + state.citationStyle + ".docx";
      if (filenameMatch) {
        filename = decodeURIComponent(filenameMatch[1] || filenameMatch[2]);
      }
      downloadBlob(blob, filename);
      showToast("فایل Word آماده شد.");
    } catch (error) {
      showToast(userFacingError(error, "ساخت فایل Word انجام نشد."));
    } finally {
      if (exportButton) exportButton.disabled = false;
    }
  }

  // Export BibTeX
  function exportBibTeX() {
    var selectedArticles = state.articles.filter(function (a) { return state.selected.has(a.id); });
    if (selectedArticles.length === 0) return showToast("مقاله‌ای انتخاب نشده است.");

    var bib = selectedArticles.map(function (a, i) {
      return formatCitation(a, i + 1, "bibtex", state.targetAuthor, false);
    }).join("\n\n");

    var blob = new Blob([bib], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "civilicapulse.bib");
    showToast("فایل BibTeX ذخیره شد.");
  }

  // Export CSV with Authors Column
  function exportCsv() {
    var selectedArticles = state.articles.filter(function (a) { return state.selected.has(a.id); });
    if (selectedArticles.length === 0) return showToast("مقاله‌ای انتخاب نشده است.");

    var rows = [["ردیف", "عنوان مقاله", "نویسندگان", "نوع انتشار", "سال", "محل انتشار", "لینک سیویلیکا"]];
    selectedArticles.forEach(function (a, i) {
      rows.push([String(i + 1), a.title, a.authors || "", a.type, a.year, a.venue, a.url]);
    });

    var csvContent = "\uFEFF" + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c || "").replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");

    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "civilicapulse.csv");
    showToast("فایل CSV ذخیره شد.");
  }

  // Export JSON
  function exportJson() {
    var selectedArticles = state.articles.filter(function (a) { return state.selected.has(a.id); });
    if (selectedArticles.length === 0) return showToast("مقاله‌ای انتخاب نشده است.");

    var payload = {
      profile: state.profile,
      targetAuthor: state.targetAuthor,
      isolateTargetAuthor: state.isolateTargetAuthor,
      extractedAt: new Date().toISOString(),
      articles: selectedArticles
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, "civilicapulse.json");
    showToast("فایل JSON ذخیره شد.");
  }

  function downloadBlob(blob, filename) {
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Init Theme
  function initTheme() {
    var saved = localStorage.getItem("civilicapulse_theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    updateThemeIcon(saved);

    var btnTheme = document.getElementById("btn-theme");
    if (btnTheme) {
      btnTheme.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "light";
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("civilicapulse_theme", next);
        updateThemeIcon(next);
      });
    }
  }

  function updateThemeIcon(theme) {
    var btn = document.getElementById("btn-theme");
    if (!btn) return;
    btn.innerHTML = theme === "dark"
      ? '<svg class="icon" aria-hidden="true"><use href="#icon-sun"></use></svg>'
      : '<svg class="icon" aria-hidden="true"><use href="#icon-moon"></use></svg>';
  }

  // Init Tabs
  function initTabs() {
    var tabs = [
      { btn: "tab-btn-url", panel: "tab-content-url" },
      { btn: "tab-btn-html", panel: "tab-content-html" },
      { btn: "tab-btn-bookmarklet", panel: "tab-content-bookmarklet" }
    ];

    tabs.forEach(function (tab) {
      var btnEl = document.getElementById(tab.btn);
      if (!btnEl) return;
      btnEl.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var b = document.getElementById(t.btn);
          var p = document.getElementById(t.panel);
          if (b) b.classList.remove("active");
          if (p) p.classList.remove("active");
        });
        btnEl.classList.add("active");
        var panelEl = document.getElementById(tab.panel);
        if (panelEl) panelEl.classList.add("active");
      });
    });
  }

  // Init View Switcher
  function initViewSwitcher() {
    var views = [
      { id: "view-btn-cards", name: "cards" },
      { id: "view-btn-table", name: "table" },
      { id: "view-btn-analytics", name: "analytics" }
    ];

    views.forEach(function (v) {
      var btn = document.getElementById(v.id);
      if (!btn) return;
      btn.addEventListener("click", function () {
        views.forEach(function (o) {
          var b = document.getElementById(o.id);
          if (b) b.classList.remove("active");
        });
        btn.classList.add("active");
        state.view = v.name;
        renderActiveView();
      });
    });
  }

  // Init Filters, Target Author & Style Pills
  function initPillsAndControls() {
    // Type pills
    var typePills = document.querySelectorAll("#type-pills .pill-btn");
    typePills.forEach(function (p) {
      p.addEventListener("click", function () {
        typePills.forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        state.filter = p.getAttribute("data-filter") || "all";
        state.page = 1;
        renderActiveView();
      });
    });

    // Style pills
    var stylePills = document.querySelectorAll("#style-pills .pill-btn");
    stylePills.forEach(function (p) {
      p.addEventListener("click", function () {
        stylePills.forEach(function (x) { x.classList.remove("active"); });
        p.classList.add("active");
        state.citationStyle = p.getAttribute("data-style") || "apa7";
        renderActiveView();
      });
    });

    // Search filter input
    var filterInput = document.getElementById("article-filter");
    if (filterInput) {
      filterInput.addEventListener("input", function () {
        state.query = filterInput.value;
        state.page = 1;
        renderActiveView();
      });
    }

    // Author Filter Dropdown (Isolation)
    var authorSelect = document.getElementById("author-filter-select");
    if (authorSelect) {
      authorSelect.addEventListener("change", function () {
        state.authorFilter = authorSelect.value;
        state.page = 1;
        renderActiveView();
      });
    }

    // Target Author Input
    var targetInput = document.getElementById("target-author-input");
    if (targetInput) {
      targetInput.addEventListener("input", function () {
        state.targetAuthor = targetInput.value;
        syncIsolateTargetButton();
        renderActiveView();
      });
    }

    // Target author isolation toggle
    var isolateButton = document.getElementById("isolate-target-author");
    if (isolateButton) {
      isolateButton.addEventListener("click", function () {
        state.isolateTargetAuthor = !state.isolateTargetAuthor;
        syncIsolateTargetButton();
        renderActiveView();
      });
    }

    // Bold Target Checkbox
    var boldCheck = document.getElementById("bold-target-author");
    if (boldCheck) {
      boldCheck.addEventListener("change", function () {
        state.boldTargetAuthor = boldCheck.checked;
        renderActiveView();
      });
    }
  }

  // Init Actions
  function initActions() {
    document.getElementById("btn-export-word").addEventListener("click", generateWordDocument);
    document.getElementById("btn-export-bib").addEventListener("click", exportBibTeX);
    document.getElementById("btn-export-csv").addEventListener("click", exportCsv);
    var exportJsonButton = document.getElementById("btn-export-json");
    if (exportJsonButton) exportJsonButton.addEventListener("click", exportJson);
    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });

    // Copy All
    document.getElementById("btn-copy-all").addEventListener("click", function () {
      var selected = state.articles.filter(function (a) { return state.selected.has(a.id); });
      if (selected.length === 0) return showToast("هیچ مقاله‌ای انتخاب نشده است.");

      var text = selected.map(function (a, idx) {
        return formatCitation(a, idx + 1, state.citationStyle, state.targetAuthor, false);
      }).join("\n\n");

      navigator.clipboard.writeText(text).then(function () {
        showToast("تمامی ارجاعات با تفکیک نویسندگان با موفقیت کپی شدند.");
      }).catch(function () {
        showToast("خطا در کپی متن به حافظه.");
      });
    });

    // Click delegation for copy, author editing, and selection
    document.addEventListener("click", function (e) {
      // Single Copy Button
      var copyBtn = e.target.closest(".btn-copy-one");
      if (copyBtn) {
        var citation = copyBtn.getAttribute("data-citation");
        if (citation) {
          navigator.clipboard.writeText(citation).then(function () {
            showToast("استناد این مقاله کپی شد.");
          });
        }
        return;
      }

      // Inline Edit Author Trigger
      var editTrigger = e.target.closest(".btn-trigger-edit-author");
      if (editTrigger) {
        var id = editTrigger.getAttribute("data-id");
        var editBox = document.getElementById("author-edit-box-" + id);
        if (editBox) {
          editBox.style.display = editBox.style.display === "none" ? "flex" : "none";
        }
        return;
      }

      // Save Edited Authors
      var saveAuthorBtn = e.target.closest(".btn-save-author");
      if (saveAuthorBtn) {
        var artId = saveAuthorBtn.getAttribute("data-id");
        var inputEl = document.querySelector('.edit-author-input[data-id="' + artId + '"]');
        if (inputEl) {
          var newAuthors = inputEl.value.trim();
          var targetArt = state.articles.find(function (a) { return a.id === artId; });
          if (targetArt) {
            targetArt.authors = newAuthors;
            updateAuthorFilterOptions();
            renderActiveView();
            showToast("اسامی نویسندگان این مقاله به‌روز شد.");
          }
        }
        return;
      }

      // Cancel Edited Authors
      var cancelAuthorBtn = e.target.closest(".btn-cancel-author");
      if (cancelAuthorBtn) {
        var cId = cancelAuthorBtn.getAttribute("data-id");
        var cBox = document.getElementById("author-edit-box-" + cId);
        if (cBox) cBox.style.display = "none";
        return;
      }

      // Filter by Author from Analytics Chart
      var authorChartRow = e.target.closest("[data-filter-author]");
      if (authorChartRow) {
        var aName = authorChartRow.getAttribute("data-filter-author");
        state.authorFilter = aName;
        var aSelect = document.getElementById("author-filter-select");
        if (aSelect) aSelect.value = aName;
        state.view = "cards";
        var vCardsBtn = document.getElementById("view-btn-cards");
        if (vCardsBtn) vCardsBtn.click();
        showToast("مقالاتِ همکار «" + aName + "» جداسازی شد.");
        return;
      }

      // Checkbox click
      var check = e.target.closest(".article-check, .table-row-check");
      if (check) {
        var chkId = check.getAttribute("data-id");
        if (check.checked) {
          state.selected.add(chkId);
        } else {
          state.selected.delete(chkId);
        }
        renderActiveView();
        return;
      }

      // Table select all
      var tableAll = e.target.closest("#table-select-all");
      if (tableAll) {
        var visible = getVisibleArticles();
        if (tableAll.checked) {
          visible.forEach(function (a) { state.selected.add(a.id); });
        } else {
          visible.forEach(function (a) { state.selected.delete(a.id); });
        }
        renderActiveView();
        return;
      }

    });

    // Pagination
    document.getElementById("prev-page").addEventListener("click", function () {
      if (state.page > 1) {
        state.page--;
        renderActiveView();
      }
    });

    document.getElementById("next-page").addEventListener("click", function () {
      var visible = getVisibleArticles();
      var totalPages = Math.ceil(visible.length / state.pageSize);
      if (state.page < totalPages) {
        state.page++;
        renderActiveView();
      }
    });
  }

  // Init HTML Paste & Drop
  function initHtmlImport() {
    var parseBtn = document.getElementById("parse-html-btn");
    var clearBtn = document.getElementById("clear-html-btn");
    var rawText = document.getElementById("raw-html");
    var dropzone = document.getElementById("html-dropzone");

    if (parseBtn) {
      parseBtn.addEventListener("click", async function () {
        var text = rawText.value.trim();
        if (!text) return showToast("ابتدا HTML را وارد کنید.");

        parseBtn.disabled = true;
        try {
          var response = await fetch(apiUrl("/api/parse-html"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: text })
          });
          var payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "پردازش HTML انجام نشد.");
          if (!loadDataset(payload)) throw new Error("مقاله‌ای در HTML پیدا نشد.");
          showToast(toPersianDigits(payload.count || payload.articles.length) + " مقاله آماده شد.");
        } catch (error) {
          showToast(userFacingError(error, "پردازش HTML انجام نشد."));
        } finally {
          parseBtn.disabled = false;
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        rawText.value = "";
      });
    }

    if (dropzone) {
      dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("dragover");
      });
      dropzone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            rawText.value = evt.target.result;
            parseBtn.click();
          };
          reader.readAsText(e.dataTransfer.files[0]);
        }
      });
    }
  }

  // Check Bookmarklet Import from LocalStorage
  function checkBookmarkletImport() {
    var stored = localStorage.getItem("civilica_import_html");
    if (stored) {
      localStorage.removeItem("civilica_import_html");
      var parsed = parseCivilicaHtml(stored, "https://civilica.com");
      if (parsed.articles.length > 0) {
        loadDataset(parsed);
        showToast("اطلاعات از طریق بوک‌مارکلت با موفقیت وارد شد.");
      }
    }
  }

  // URL Form Submission — use the CivilicaPulse backend, not a public proxy
  function initForm() {
    var form = document.getElementById("profile-form");
    if (!form) return;

    var urlInput = document.getElementById("profile-url");
    var clearButton = document.getElementById("clear-profile-url");
    function syncClearButton() {
      if (clearButton) clearButton.hidden = !urlInput.value;
    }

    if (urlInput) {
      urlInput.addEventListener("input", syncClearButton);
      syncClearButton();
    }
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        urlInput.value = "";
        syncClearButton();
        urlInput.focus();
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var url = urlInput.value.trim();
      if (!url) return showToast("لطفاً آدرس صفحه پژوهشگر را وارد کنید.");

      // Normalize civilica URL (support Persian digits in URL too, e.g. /p/۱۷۶۲۲۵/)
      url = url.replace(/[۰-۹٠-٩]/g, function (d) {
        var persian = "۰۱۲۳۴۵۶۷۸۹";
        var arabic = "٠١٢٣٤٥٦٧٨٩";
        var pi = persian.indexOf(d);
        var ai = arabic.indexOf(d);
        return pi >= 0 ? String(pi) : ai >= 0 ? String(ai) : d;
      });
      if (!/^https?:\/\//i.test(url)) url = "https://civilica.com/p/" + url.replace(/\D/g, "") + "/";

      setLoadingState(true);

      try {
        var payload = await requestProfile(url);
        if (!loadDataset(payload)) throw new Error("مقاله‌ای در این پروفایل پیدا نشد.");
        showToast(toPersianDigits(payload.count || payload.articles.length) + " مقاله آماده شد.");
      } catch (err) {
        showToast(userFacingError(err, "اتصال برقرار نشد؛ حالت HTML را امتحان کنید."));
      } finally {
        setLoadingState(false);
      }
    });

    // Shared profile links can start an extraction immediately.
    var queryProfileUrl = new URLSearchParams(window.location.search).get("profile-url");
    if (queryProfileUrl && queryProfileUrl.trim()) {
      urlInput.value = queryProfileUrl.trim();
      syncClearButton();
      if (typeof form.requestSubmit === "function") {
        window.setTimeout(function () {
          form.requestSubmit();
        }, 0);
      }
    }
  }

  // Boot Application
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initTabs();
    initViewSwitcher();
    initPillsAndControls();
    initActions();
    initHtmlImport();
    initForm();

    // Import only when the user explicitly used the bookmarklet; otherwise stay empty.
    checkBookmarkletImport();
  });

})();


(() => {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = document.documentElement.getAttribute('data-theme') === 'dark' ? '#090d16' : '#1e3a5f';
  document.head.appendChild(meta);
})();
