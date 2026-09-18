(function () {
  "use strict";

  var state = {
    articles: [],
    profile: null,
    selected: new Set(),
    filter: "all",
    query: "",
    citationStyle: "apa7",
    includeLinks: true
  };
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var elements = {
    form: document.getElementById("profile-form"),
    url: document.getElementById("profile-url"),
    extractButton: document.getElementById("extract-button"),
    toggleHtml: document.getElementById("toggle-html-import"),
    htmlImport: document.getElementById("html-import"),
    closeHtml: document.getElementById("close-html-import"),
    rawHtml: document.getElementById("raw-html"),
    parseHtmlButton: document.getElementById("parse-html-button"),
    resultsSection: document.getElementById("results-section"),
    resultsTitle: document.getElementById("results-title"),
    profileIdenticon: document.querySelector(".profile-identicon"),
    profileSource: document.getElementById("profile-source"),
    totalCount: document.getElementById("total-count"),
    conferenceCount: document.getElementById("conference-count"),
    journalCount: document.getElementById("journal-count"),
    resultsList: document.getElementById("results-list"),
    emptyResults: document.getElementById("empty-results"),
    articleFilter: document.getElementById("article-filter"),
    selectVisible: document.getElementById("select-visible-button"),
    selectedCount: document.getElementById("selected-count"),
    exportButton: document.getElementById("export-button"),
    citationStylePills: document.querySelectorAll(".citation-style-pill"),
    wordFileType: document.getElementById("word-file-type"),
    includeLinks: document.getElementById("include-civilica-links"),
    toast: document.getElementById("toast")
  };

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#icon-' + name + '"></use></svg>';
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toEnglishDigits(value) {
    return String(value).replace(/[۰-۹٠-٩]/g, function (digit) {
      var persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
      if (persian >= 0) {
        return String(persian);
      }
      return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit));
    });
  }

  function renderProfileAvatar() {
    var identity = state.profile.id || state.profile.url || state.profile.name || "civilica";
    elements.profileIdenticon.setAttribute("data-jdenticon-value", identity);
    if (window.jdenticon && typeof window.jdenticon.update === "function") {
      window.jdenticon.update(elements.profileIdenticon, identity);
    }
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(function () {
      elements.toast.hidden = true;
    }, 5000);
  }

  function setLoading(button, loading, loadingText) {
    if (loading) {
      button.dataset.restoreHtml = button.innerHTML;
      button.disabled = true;
      button.innerHTML = icon("refresh") + "<span>" + loadingText + "</span>";
    } else {
      button.disabled = false;
      if (button.dataset.restoreHtml) {
        button.innerHTML = button.dataset.restoreHtml;
        delete button.dataset.restoreHtml;
      }
    }
  }

  async function postJson(endpoint, body, button, loadingText) {
    setLoading(button, true, loadingText);
    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      var contentType = response.headers.get("content-type") || "";
      var result = contentType.indexOf("application/json") >= 0
        ? await response.json()
        : { ok: false, error: "پاسخ قابل خواندن از سرور دریافت نشد." };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "پردازش انجام نشد.");
      }
      applyResults(result);
    } catch (error) {
      showToast(error.message || "خطایی در پردازش رخ داد.");
    } finally {
      setLoading(button, false);
    }
  }

  function applyResults(result) {
    state.articles = Array.isArray(result.articles) ? result.articles : [];
    state.profile = result.profile || {};
    state.selected = new Set();
    state.filter = "all";
    state.query = "";
    state.citationStyle = "apa7";
    state.includeLinks = true;

    elements.articleFilter.value = "";
    document.querySelectorAll(".filter-pill").forEach(function (pill) {
      pill.classList.toggle("is-active", pill.dataset.filter === "all");
    });
    elements.citationStylePills.forEach(function (pill) {
      pill.classList.toggle("is-active", pill.dataset.style === state.citationStyle);
    });
    elements.wordFileType.value = "docx";
    elements.includeLinks.checked = true;

    elements.resultsTitle.textContent = state.profile.name || "پژوهشگر سیویلیکا";
    renderProfileAvatar();
    elements.profileSource.href = state.profile.url || "#";
    elements.totalCount.textContent = toEnglishDigits(state.articles.length);
    elements.conferenceCount.textContent = toEnglishDigits(
      state.articles.filter(function (article) {
        return article.type === "مقاله کنفرانسی";
      }).length
    );
    elements.journalCount.textContent = toEnglishDigits(
      state.articles.filter(function (article) {
        return article.type === "مقاله ژورنالی";
      }).length
    );
    elements.resultsSection.hidden = false;
    renderResults();
    elements.resultsSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function visibleArticles() {
    var query = state.query.trim().toLocaleLowerCase("fa-IR");
    return state.articles.filter(function (article) {
      var matchesType = state.filter === "all" || article.type === state.filter;
      var searchable = [
        article.title,
        article.venue,
        article.year,
        article.type
      ].join(" ").toLocaleLowerCase("fa-IR");
      return matchesType && (!query || searchable.indexOf(query) >= 0);
    });
  }

  function renderResults() {
    var visible = visibleArticles();
    elements.resultsList.innerHTML = visible.map(function (article) {
      var selected = state.selected.has(article.id);
      var articleId = escapeHtml(article.id);
      var title = escapeHtml(toEnglishDigits(article.title || "بدون عنوان"));
      var venue = escapeHtml(toEnglishDigits(article.venue || "محل انتشار نامشخص"));
      var year = escapeHtml(toEnglishDigits(article.year || "—"));
      var type = escapeHtml(toEnglishDigits(article.type || "مقاله"));
      var url = escapeHtml(article.url || "#");
      var number = state.articles.indexOf(article) + 1;
      return (
        '<article class="article-card' + (selected ? " is-selected" : "") + '" data-article-card="' + articleId + '">' +
          '<input class="article-check" type="checkbox" data-article-id="' + articleId + '"' +
            (selected ? " checked" : "") + ' aria-label="انتخاب ' + title + '">' +
          '<div class="article-content">' +
            '<h3 class="article-title">' + title + "</h3>" +
            '<div class="article-meta">' +
              '<span class="meta-tag">' + type + "</span>" +
              '<span>سال ' + year + "</span>" +
              '<span class="article-venue" title="' + venue + '">' + venue + "</span>" +
            "</div>" +
            '<a class="article-link" href="' + url + '" target="_blank" rel="noreferrer">' +
              icon("external") + "مشاهده در سیویلیکا" +
            "</a>" +
          "</div>" +
          '<span class="article-index" aria-hidden="true">' + toEnglishDigits(number) + "</span>" +
        "</article>"
      );
    }).join("");

    elements.emptyResults.hidden = visible.length !== 0;
    updateSelectionUi(visible);
  }

  function updateSelectionUi(visible) {
    var count = state.selected.size;
    elements.selectedCount.textContent = toEnglishDigits(count);
    elements.exportButton.disabled = count === 0;
    var allVisibleSelected = visible.length > 0 && visible.every(function (article) {
      return state.selected.has(article.id);
    });
    elements.selectVisible.innerHTML = allVisibleSelected
      ? icon("close") + "لغو انتخاب"
      : icon("check") + "انتخاب همه";
  }

  function toggleVisibleSelection() {
    var visible = visibleArticles();
    var allSelected = visible.length > 0 && visible.every(function (article) {
      return state.selected.has(article.id);
    });
    visible.forEach(function (article) {
      if (allSelected) {
        state.selected.delete(article.id);
      } else {
        state.selected.add(article.id);
      }
    });
    renderResults();
  }

  async function exportWord() {
    if (!state.selected.size) {
      showToast("حداقل یک مقاله را انتخاب کنید.");
      return;
    }

    var selectedArticles = state.articles.filter(function (article) {
      return state.selected.has(article.id);
    });
    var fileType = elements.wordFileType.value === "doc" ? "doc" : "docx";
    setLoading(elements.exportButton, true, "در حال ساخت فایل Word...");
    try {
      var response = await fetch("/api/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          articles: selectedArticles,
          style: state.citationStyle,
          file_type: fileType,
          include_links: state.includeLinks
        })
      });
      if (!response.ok) {
        var errorJson = await response.json().catch(function () {
          return {};
        });
        throw new Error(errorJson.error || "ساخت فایل Word انجام نشد.");
      }
      var blob = await response.blob();
      var downloadUrl = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "civilica-references-" + state.citationStyle + "." + fileType;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showToast(error.message || "ساخت فایل Word انجام نشد.");
    } finally {
      setLoading(elements.exportButton, false);
    }
  }

  elements.form.addEventListener("submit", function (event) {
    event.preventDefault();
    var url = elements.url.value.trim();
    if (!url) {
      showToast("لینک صفحهٔ پژوهشگر را وارد کنید.");
      elements.url.focus();
      return;
    }
    postJson("/api/parse-profile", { url: url }, elements.extractButton, "در حال استخراج...");
  });

  elements.toggleHtml.addEventListener("click", function () {
    elements.htmlImport.hidden = false;
    elements.toggleHtml.setAttribute("aria-expanded", "true");
    elements.rawHtml.focus();
  });

  elements.closeHtml.addEventListener("click", function () {
    elements.htmlImport.hidden = true;
    elements.toggleHtml.setAttribute("aria-expanded", "false");
  });

  elements.parseHtmlButton.addEventListener("click", function () {
    postJson(
      "/api/parse-html",
      { html: elements.rawHtml.value, source_url: elements.url.value.trim() },
      elements.parseHtmlButton,
      "در حال پردازش..."
    );
  });

  elements.resultsList.addEventListener("change", function (event) {
    var checkbox = event.target.closest(".article-check");
    if (!checkbox) {
      return;
    }
    var id = checkbox.dataset.articleId;
    if (checkbox.checked) {
      state.selected.add(id);
    } else {
      state.selected.delete(id);
    }
    var card = checkbox.closest(".article-card");
    if (card) {
      card.classList.toggle("is-selected", checkbox.checked);
    }
    updateSelectionUi(visibleArticles());
  });

  elements.articleFilter.addEventListener("input", function () {
    state.query = elements.articleFilter.value;
    renderResults();
  });

  document.querySelectorAll(".filter-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      state.filter = pill.dataset.filter;
      document.querySelectorAll(".filter-pill").forEach(function (item) {
        item.classList.toggle("is-active", item === pill);
      });
      renderResults();
    });
  });

  elements.citationStylePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      state.citationStyle = pill.dataset.style || "apa7";
      elements.citationStylePills.forEach(function (item) {
        item.classList.toggle("is-active", item === pill);
      });
    });
  });

  elements.selectVisible.addEventListener("click", toggleVisibleSelection);
  elements.includeLinks.addEventListener("change", function () {
    state.includeLinks = elements.includeLinks.checked;
  });
  elements.exportButton.addEventListener("click", exportWord);
})();
