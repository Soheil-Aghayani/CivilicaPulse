/**
 * CivilicaPulse — Pure Client-Side & Live Academic Researcher Toolkit
 * Built for Persian researchers with authentic typography, multi-view analytics,
 * client-side Word exports, and zero-server GitHub Pages capability.
 */

(function () {
  "use strict";

  // Preloaded Demo Datasets for 100% Live Initial Experience
  var DEMO_PROFILES = {
    mehrdadi: {
      profile: {
        id: "176225",
        name: "پروفسور ناصر مهردادی",
        affil: "استاد تمام گروه مهندسی محیط زیست، دانشکده محیط زیست، دانشگاه تهران",
        url: "https://civilica.com/p/176225/"
      },
      articles: [
        { id: "101", title: "ارزیابی شاخص‌های کیفی آب رودخانه‌ها با استفاده از شبکه‌های عصبی مصنوعی", venue: "مجله مهندسی محیط زیست", year: "1402", type: "مقاله ژورنالی", url: "https://civilica.com/doc/101/" },
        { id: "102", title: "بررسی و مدل‌سازی انتقال آلاینده‌های فلزات سنگین در منابع آب‌های سطحی", venue: "بیستمین همایش ملی محیط زیست و بهداشت محیط", year: "1402", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/102/" },
        { id: "103", title: "کاربرد فناوری بیوفیلتراسیون در تصفیه بیولوژیکی پساب‌های صنعتی پیچیده", venue: "نشریه آب و فاضلاب", year: "1401", type: "مقاله ژورنالی", url: "https://civilica.com/doc/101/" },
        { id: "104", title: "بهینه‌سازی فرآیند لجن فعال در راکتورهای ناپیوسته متوالی (SBR)", venue: "ششمین همایش ملی مدیریت پسماند و توسعه پایدار", year: "1401", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/104/" },
        { id: "105", title: "ارزیابی چرخه حیات (LCA) سامانه‌های یکپارچه مدیریت پسماند شهری در ایران", venue: "فصلنامه انسان و محیط زیست", year: "1400", type: "مقاله ژورنالی", url: "https://civilica.com/doc/105/" },
        { id: "106", title: "بررسی کارایی فتوکاتالیست نانوذرات اکسید تیتانیوم در تخریب رنگزاهای نساجی", venue: "هشتمین کنفرانس بین‌المللی مدیریت محیط زیست", year: "1399", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/106/" },
        { id: "107", title: "طرح پژوهشی مطالعه جامع و پایش برخط کیفیت هوای کلان‌شهرهای صنعتی", venue: "سازمان حفاظت محیط زیست و دانشگاه تهران", year: "1399", type: "طرح پژوهشی", url: "https://civilica.com/doc/107/" },
        { id: "108", title: "تحلیل پایداری اکوسیستم‌های تالابی با استفاده از رویکرد دینامیک سیستم‌ها", venue: "مجله علوم و تکنولوژی محیط زیست", year: "1398", type: "مقاله ژورنالی", url: "https://civilica.com/doc/108/" },
        { id: "109", title: "شبیه‌سازی عددی نشت هیدروکربن‌های نفتی در محیط‌های متخلخل آبخوان", venue: "هفتمین کنگره ملی مهندسی عمران", year: "1398", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/109/" },
        { id: "110", title: "ارزیابی اثرات زیست‌محیطی طرح‌های توسعه صنعتی در مناطق ساحلی جنوب", venue: "نشریه تخصصی اکولوژی صنعتی و پایش زیستی", year: "1397", type: "مقاله ژورنالی", url: "https://civilica.com/doc/110/" },
        { id: "111", title: "مقایسه روش‌های اکسیداسیون پیشرفته (AOPs) در تصفیه پساب دارویی", venue: "پنجمین همایش علوم و مهندسی محیط زیست", year: "1397", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/111/" },
        { id: "112", title: "تولید بیوگاز از هضم بی‌هوازی پسماندهای جامد ارگانیک با روش گرمادوست", venue: "مجله تحقیقات منابع طبیعی ایران", year: "1396", type: "مقاله ژورنالی", url: "https://civilica.com/doc/112/" }
      ]
    },
    karbassi: {
      profile: {
        id: "45210",
        name: "دکتر احمدرضا کرباسی",
        affil: "استاد تمام دانشکده محیط زیست، متخصص ژئوشیمی و آلودگی‌های دریایی، دانشگاه تهران",
        url: "https://civilica.com/p/45210/"
      },
      articles: [
        { id: "201", title: "بررسی رفتار ژئوشیمیایی و انتقال فازی فلزات سنگین در مصب رودخانه‌ها", venue: "مجله محیط زیست طبیعی", year: "1402", type: "مقاله ژورنالی", url: "https://civilica.com/doc/201/" },
        { id: "202", title: "پایش آلودگی‌های رسوبات خلیج فارس با استفاده از شاخص زمین‌انباشتگی", venue: "همایش علوم و مهندسی محیط زیست دریا", year: "1401", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/202/" },
        { id: "203", title: "مدل‌سازی شوری‌زدایی و لخته‌سازی کلوئیدهای معدنی در آبراهه‌های ساحلی", venue: "نشریه علوم و فنون اقیانوس‌شناسی", year: "1400", type: "مقاله ژورنالی", url: "https://civilica.com/doc/203/" },
        { id: "204", title: "ارزیابی قابلیت بازیافت و خطرات زیست‌محیطی پسماندهای الکترونیکی در ایران", venue: "کنگره ملی مدیریت پسماند", year: "1399", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/204/" },
        { id: "205", title: "طرح پژوهشی تدوین استانداردهای ملی سنجش پساب‌های صنعتی دریایی", venue: "پژوهشکده علوم محیطی", year: "1398", type: "طرح پژوهشی", url: "https://civilica.com/doc/205/" },
        { id: "206", title: "سنجش غلظت کادمیم و سرب در بافت‌های زیستی ماهیان تالاب انزلی", venue: "فصلنامه آبزی‌پروری و مدیریت منابع آبی", year: "1397", type: "مقاله ژورنالی", url: "https://civilica.com/doc/206/" }
      ]
    },
    aghayani: {
      profile: {
        id: "384912",
        name: "سهیل آقایانی",
        affil: "پژوهشگر ارشد مهندسی محیط زیست، معماری سیستم‌های پایدار و انرژی زیستی، دانشگاه تهران",
        url: "https://civilica.com/p/384912/"
      },
      articles: [
        { id: "301", title: "ارزیابی چرخه حیات (LCA) تولید بیودیزل از روغن‌های پسماند خوراکی با کاتالیزورهای ناهمگن", venue: "فصلنامه تخصصی انرژی‌های نو و پایداری", year: "1403", type: "مقاله ژورنالی", url: "https://civilica.com/doc/301/" },
        { id: "302", title: "تحلیل ترمودینامیکی و اقتصادی تبدیل پسماندهای کشاورزی به بیوگاز در مقیاس صنعتی", venue: "هفتمین همایش بین‌المللی انرژی و محیط زیست", year: "1402", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/302/" },
        { id: "303", title: "مدل‌سازی سناریوهای کربن‌صفر در سیستم‌های مدیریت پسماند شهری با نرم‌افزار SimaPro", venue: "پژوهش‌های مهندسی محیط زیست", year: "1402", type: "مقاله ژورنالی", url: "https://civilica.com/doc/303/" },
        { id: "304", title: "طرح پژوهشی سنجش ردپای کربن زنجیره تأمین انرژی پاک در ایران", venue: "مرکز مطالعات پایداری محیط زیست", year: "1401", type: "طرح پژوهشی", url: "https://civilica.com/doc/304/" },
        { id: "305", title: "مقایسه زیست‌محیطی انواع کاتالیست‌های سبز در سنتز سوخت‌های پاک زیستی", venue: "ششمین کنفرانس شیمی سبز و فناوری نانو", year: "1401", type: "مقاله کنفرانسی", url: "https://civilica.com/doc/305/" }
      ]
    }
  };

  // State
  var state = {
    profile: null,
    articles: [],
    selected: new Set(),
    filter: "all",
    query: "",
    citationStyle: "apa7",
    view: "cards",
    page: 1,
    pageSize: 10
  };

  var apiBaseUrl = String(window.CIVILICA_API_BASE_URL || "").replace(/\/+$/, "");

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
    var val = String(name || "نویسنده").trim();
    return val.replace(/^(?:(?:آقای|خانم|دکتر|پروفسور|استاد|مهندس)\s+)+/gi, "");
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

  // Citation Formatter conforming to citation_formats.py
  function formatCitation(article, index, style, authorName) {
    var author = cleanAuthor(authorName || (state.profile ? state.profile.name : "پژوهشگر"));
    var title = String(article.title || "بدون عنوان").replace(/\.+$/, "");
    var venue = String(article.venue || "").replace(/\.+$/, "");
    var year = article.year ? toPersianDigits(article.year) : "بی‌تا";
    var displayIndex = toPersianDigits(index);
    var url = article.url || "";
    var venuePart = venue ? " " + venue + "." : "";
    var urlPart = url ? " " + url : "";

    switch (style) {
      case "vancouver":
        return displayIndex + ". " + author + ". " + title + "." + venuePart + " " + year + "." + urlPart;
      case "ieee":
        return "[" + displayIndex + "] " + author + ", “" + title + ",”" + (venue ? " " + venue + "," : "") + " " + year + "." + urlPart;
      case "harvard":
        return author + " (" + year + ") ‘" + title + "’." + venuePart + urlPart;
      case "chicago":
        return author + ". “" + title + ".”" + venuePart + " (" + year + ")." + urlPart;
      case "mla":
        return author + ". “" + title + ".”" + (venue ? " " + venue + "," : "") + " " + year + "." + urlPart;
      case "bibtex":
        var key = "civilica_" + (article.id || index);
        return "@misc{" + key + ",\n" +
          "  author = {" + author + "},\n" +
          "  title = {" + title + "},\n" +
          "  year = {" + (article.year || "") + "},\n" +
          "  howpublished = {" + venue + "},\n" +
          (url ? "  url = {" + url + "}\n" : "") +
          "}";
      case "apa7":
      default:
        return author + " (" + year + "). " + title + "." + venuePart + urlPart;
    }
  }

  // Pure Client-Side DOM HTML Parser
  function parseCivilicaHtml(htmlText, fallbackUrl) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlText, "text/html");

    var h1 = doc.querySelector("h1");
    var titleTag = doc.querySelector("title");
    var researcherName = h1 ? h1.textContent.trim() : (titleTag ? titleTag.textContent.split("-")[0].trim() : "پژوهشگر سیویلیکا");

    var articles = [];
    var seenIds = new Set();

    // Scan sections
    var sectionMappings = [
      { selector: "#confpaper", type: "مقاله کنفرانسی" },
      { selector: "#journalpaper", type: "مقاله ژورنالی" },
      { selector: "#researchs", type: "طرح پژوهشی" }
    ];

    sectionMappings.forEach(function (sec) {
      var container = doc.querySelector(sec.selector);
      if (!container) return;
      var links = container.querySelectorAll('a[href*="/doc/"]');
      links.forEach(function (a) {
        var href = a.getAttribute("href") || "";
        var match = href.match(/\/doc\/(\d+)\/?/);
        var id = match ? match[1] : "";
        var title = (a.getAttribute("title") || a.textContent || "").trim();
        if (!id || seenIds.has(id) || title === "دریافت فایل PDF مقاله" || !title) return;
        seenIds.add(id);

        var fullText = a.textContent || "";
        var yearMatch = fullText.match(/\((\d{4})\)/);
        var year = yearMatch ? yearMatch[1] : "1402";

        var venue = "محل انتشار نامشخص";
        var iTag = a.querySelector("i");
        if (iTag && iTag.textContent.trim()) {
          venue = iTag.textContent.trim();
        }

        articles.push({
          id: id,
          title: title,
          venue: venue,
          year: year,
          type: sec.type,
          url: "https://civilica.com/doc/" + id + "/"
        });
      });
    });

    // Fallback if specific div ids not found: parse any doc links
    if (articles.length === 0) {
      var allLinks = doc.querySelectorAll('a[href*="/doc/"]');
      allLinks.forEach(function (a, i) {
        var href = a.getAttribute("href") || "";
        var match = href.match(/\/doc\/(\d+)\/?/);
        var id = match ? match[1] : String(i + 1);
        var title = (a.getAttribute("title") || a.textContent || "").trim();
        if (!title || title === "دریافت فایل PDF مقاله" || seenIds.has(id)) return;
        seenIds.add(id);

        articles.push({
          id: id,
          title: title,
          venue: "همایش یا نشریه علمی",
          year: "1402",
          type: "مقاله",
          url: "https://civilica.com/doc/" + id + "/"
        });
      });
    }

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

  // Load Profile into State & Render
  function loadDataset(data) {
    state.profile = data.profile;
    state.articles = data.articles;
    state.selected = new Set(data.articles.map(function (a) { return a.id; }));
    state.page = 1;
    updateAuthorHeader();
    updateKpis();
    renderActiveView();
  }

  // Update Author Header & KPI Cards
  function updateAuthorHeader() {
    var p = state.profile;
    if (!p) return;
    document.getElementById("author-name").textContent = p.name;
    document.getElementById("author-affil").textContent = p.affil || "پژوهشگر سیویلیکا";
    var link = document.getElementById("author-link");
    if (link) link.href = p.url || "#";

    var initials = p.name.split(" ").filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join("");
    document.getElementById("author-initials").textContent = initials || "CP";
  }

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

  // Visible filtered articles
  function getVisibleArticles() {
    var q = state.query.trim().toLowerCase();
    return state.articles.filter(function (a) {
      var matchType = state.filter === "all" || a.type === state.filter;
      var text = (a.title + " " + a.venue + " " + a.year).toLowerCase();
      var matchQuery = !q || text.indexOf(q) >= 0;
      return matchType && matchQuery;
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
        '<h3>مقاله‌ای با این مشخصات یافت نشد.</h3><p style="margin-top:6px; font-size:0.9rem;">فیلتر یا عبارت جست‌وجو را تغییر دهید.</p></div>';
      return;
    }

    var totalPages = Math.max(1, Math.ceil(visible.length / state.pageSize));
    state.page = Math.min(Math.max(state.page, 1), totalPages);

    var start = (state.page - 1) * state.pageSize;
    var paged = visible.slice(start, start + state.pageSize);

    if (visible.length > state.pageSize) {
      pagination.style.display = "flex";
      document.getElementById("pagination-info").textContent = "صفحه " + toPersianDigits(state.page) + " از " + toPersianDigits(totalPages) + " · " + toPersianDigits(visible.length) + " مقاله";
      document.getElementById("prev-page").disabled = state.page <= 1;
      document.getElementById("next-page").disabled = state.page >= totalPages;
    }

    container.innerHTML = paged.map(function (article) {
      var isSelected = state.selected.has(article.id);
      var globalIndex = state.articles.indexOf(article) + 1;
      var citationText = formatCitation(article, globalIndex, state.citationStyle, state.profile ? state.profile.name : "");

      return (
        '<article class="article-card' + (isSelected ? " is-selected" : "") + '" data-id="' + article.id + '">' +
          '<input type="checkbox" class="article-check" data-id="' + article.id + '"' + (isSelected ? " checked" : "") + ' aria-label="انتخاب">' +
          '<div class="article-content">' +
            '<h3 class="article-title">' + escapeHtml(article.title) + '</h3>' +
            '<div class="article-meta">' +
              '<span class="meta-tag">' + escapeHtml(article.type) + '</span>' +
              '<span>سال <b>' + toPersianDigits(article.year) + '</b></span>' +
              '<span>' + escapeHtml(article.venue) + '</span>' +
            '</div>' +
            '<div class="article-citation">' + escapeHtml(citationText) + '</div>' +
            '<div class="article-actions">' +
              '<button class="btn-subtle btn-copy-one" data-citation="' + escapeHtml(citationText) + '" type="button">' +
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

  // 2. Table View
  function renderTableView(visible) {
    var tbody = document.getElementById("table-body");
    tbody.innerHTML = visible.map(function (article, index) {
      var isSelected = state.selected.has(article.id);
      var rowNum = toPersianDigits(index + 1);

      return (
        '<tr' + (isSelected ? ' style="background:var(--primary-subtle);"' : "") + '>' +
          '<td><input type="checkbox" class="table-row-check" data-id="' + article.id + '"' + (isSelected ? " checked" : "") + '></td>' +
          '<td style="font-weight:700;">' + rowNum + '</td>' +
          '<td style="font-weight:600; min-width:240px;">' + escapeHtml(article.title) + '</td>' +
          '<td><span class="meta-tag">' + escapeHtml(article.type) + '</span></td>' +
          '<td>' + toPersianDigits(article.year) + '</td>' +
          '<td style="color:var(--text-muted);">' + escapeHtml(article.venue) + '</td>' +
          '<td><a class="nav-link" href="' + escapeHtml(article.url) + '" target="_blank" rel="noreferrer">مشاهده</a></td>' +
        '</tr>'
      );
    }).join("");
  }

  // 3. Analytics View
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

    // 3. Top Venues
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

  // Word Document Client-Side Generator
  function generateWordDocument() {
    var selectedArticles = state.articles.filter(function (a) {
      return state.selected.has(a.id);
    });

    if (selectedArticles.length === 0) {
      showToast("لطفاً حداقل یک مقاله را برای خروجی انتخاب کنید.");
      return;
    }

    var authorName = state.profile ? state.profile.name : "پژوهشگر";
    var style = state.citationStyle;

    var citationsHtml = selectedArticles.map(function (a, idx) {
      var text = formatCitation(a, idx + 1, style, authorName);
      return '<p class="citation">' + escapeHtml(text) + '</p>';
    }).join("\n");

    var docHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>\n" +
      "<head>\n" +
      "<meta charset='utf-8'>\n" +
      "<title>فهرست مقالات " + escapeHtml(authorName) + "</title>\n" +
      "<!--[if gte mso 9]>\n" +
      "<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>\n" +
      "<![endif]-->\n" +
      "<style>\n" +
      "@page { size: 21.0cm 29.7cm; margin: 2.5cm 2.5cm 2.5cm 2.5cm; mso-page-orientation: portrait; }\n" +
      "body { font-family: 'B Nazanin', 'Times New Roman', serif; font-size: 12pt; direction: rtl; text-align: right; line-height: 1.6; }\n" +
      "h1 { font-family: 'B Nazanin'; font-size: 16pt; font-weight: bold; text-align: right; margin-bottom: 12pt; }\n" +
      "p.citation { margin-top: 0pt; margin-bottom: 8pt; text-align: right; direction: rtl; font-family: 'B Nazanin'; font-size: 12pt; }\n" +
      "span.english { font-family: 'Times New Roman'; font-size: 11pt; direction: ltr; }\n" +
      "</style>\n" +
      "</head>\n" +
      "<body>\n" +
      "<h1>فهرست مقالات استخراج‌شده — " + escapeHtml(authorName) + "</h1>\n" +
      citationsHtml + "\n" +
      "</body>\n" +
      "</html>";

    var blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "CivilicaPulse_" + authorName.replace(/\s+/g, "_") + ".doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast("فایل Word با موفقیت ایجاد و دانلود شد.");
  }

  // Export BibTeX
  function exportBibTeX() {
    var selectedArticles = state.articles.filter(function (a) { return state.selected.has(a.id); });
    if (selectedArticles.length === 0) return showToast("مقاله‌ای انتخاب نشده است.");

    var bib = selectedArticles.map(function (a, i) {
      return formatCitation(a, i + 1, "bibtex", state.profile ? state.profile.name : "");
    }).join("\n\n");

    var blob = new Blob([bib], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "civilicapulse.bib");
    showToast("فایل BibTeX ذخیره شد.");
  }

  // Export CSV
  function exportCsv() {
    var selectedArticles = state.articles.filter(function (a) { return state.selected.has(a.id); });
    if (selectedArticles.length === 0) return showToast("مقاله‌ای انتخاب نشده است.");

    var rows = [["ردیف", "عنوان مقاله", "نوع انتشار", "سال", "محل انتشار", "لینک سیویلیکا"]];
    selectedArticles.forEach(function (a, i) {
      rows.push([String(i + 1), a.title, a.type, a.year, a.venue, a.url]);
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

  // Init Theme & Events
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
      { btn: "tab-btn-demo", panel: "tab-content-demo" },
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

  // Init Filter & Style Pills
  function initPills() {
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

    // Search filter
    var filterInput = document.getElementById("article-filter");
    if (filterInput) {
      filterInput.addEventListener("input", function () {
        state.query = filterInput.value;
        state.page = 1;
        renderActiveView();
      });
    }
  }

  // Init Actions
  function initActions() {
    document.getElementById("btn-export-word").addEventListener("click", generateWordDocument);
    document.getElementById("btn-export-bib").addEventListener("click", exportBibTeX);
    document.getElementById("btn-export-csv").addEventListener("click", exportCsv);
    document.getElementById("btn-export-json").addEventListener("click", exportJson);
    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });

    // Copy All
    document.getElementById("btn-copy-all").addEventListener("click", function () {
      var selected = state.articles.filter(function (a) { return state.selected.has(a.id); });
      if (selected.length === 0) return showToast("هیچ مقاله‌ای انتخاب نشده است.");

      var text = selected.map(function (a, idx) {
        return formatCitation(a, idx + 1, state.citationStyle, state.profile ? state.profile.name : "");
      }).join("\n\n");

      navigator.clipboard.writeText(text).then(function () {
        showToast("تمامی ارجاعات با موفقیت کپی شدند.");
      }).catch(function () {
        showToast("خطا در کپی متن به حافظه.");
      });
    });

    // Click delegate for single copy & article checks
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

      // Checkbox click
      var check = e.target.closest(".article-check, .table-row-check");
      if (check) {
        var id = check.getAttribute("data-id");
        if (check.checked) {
          state.selected.add(id);
        } else {
          state.selected.delete(id);
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

      // Demo Chips / Cards
      var demoTarget = e.target.closest("[data-demo]");
      if (demoTarget) {
        var key = demoTarget.getAttribute("data-demo");
        if (DEMO_PROFILES[key]) {
          loadDataset(DEMO_PROFILES[key]);
          showToast("پروفایل " + DEMO_PROFILES[key].profile.name + " با موفقیت بارگذاری شد.");
        }
      }
    });

    // Pagination buttons
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
      parseBtn.addEventListener("click", function () {
        var text = rawText.value.trim();
        if (!text) return showToast("لطفاً ابتدا کد HTML صفحه را وارد کنید.");
        var parsed = parseCivilicaHtml(text, "https://civilica.com");
        if (parsed.articles.length === 0) return showToast("هیچ مقاله‌ای در کد واردشده پیدا نشد.");
        loadDataset(parsed);
        showToast(toPersianDigits(parsed.articles.length) + " مقاله استخراج شد.");
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

  // URL Form Submission
  function initForm() {
    var form = document.getElementById("profile-form");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var url = document.getElementById("profile-url").value.trim();
      if (!url) return showToast("لطفاً آدرس صفحه پژوهشگر را وارد کنید.");

      var statusEl = document.getElementById("scrape-status");
      statusEl.style.display = "flex";

      try {
        var resp = await fetch((apiBaseUrl || "") + "/api/profile?url=" + encodeURIComponent(url));
        if (!resp.ok) throw new Error("Backend response error " + resp.status);
        var data = await resp.json();
        loadDataset(data);
        showToast(toPersianDigits(data.articles.length) + " مقاله با موفقیت استخراج شد.");
      } catch (err) {
        // Defensive: suggest pasting HTML if backend is down
        showToast("سرور در دسترس نیست؛ می‌توانید کد HTML صفحه را در تب دوم بچسبانید.");
      } finally {
        statusEl.style.display = "none";
      }
    });
  }

  // Boot Application
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initTabs();
    initViewSwitcher();
    initPills();
    initActions();
    initHtmlImport();
    initForm();

    // Check if bookmarklet passed HTML, else default to Mehrdadi profile
    checkBookmarkletImport();
    if (!state.profile) {
      loadDataset(DEMO_PROFILES.mehrdadi);
    }
  });

})();
