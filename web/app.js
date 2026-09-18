/**
 * CivilicaPulse — Pure Client-Side & Live Academic Researcher Toolkit
 * Features:
 * - Multi-author citation generation & custom author management
 * - Target author isolation (تفکیک پژوهشگر هدف) and bolding in Word & citations
 * - Co-author filtering & collaborator analytics
 * - Authentic Persian typography (IRANYekanX) & Solar icon consistency
 * - Client-side Word (.docx/.doc), BibTeX, CSV, JSON, Print
 */

(function () {
  "use strict";

  // Preloaded Datasets with Comprehensive Multi-Author Details
  var DEMO_PROFILES = {
    samiee: {
      profile: {
        id: "28419",
        name: "دکتر رودابه سامعی",
        affil: "عضو هیئت علمی و استاد مهندسی محیط زیست، دانشگاه تهران",
        url: "https://civilica.com/p/28419/"
      },
      articles: [
        {
          id: "401",
          title: "ارزیابی چندمعیاره و تحلیل چرخه حیات (LCA) فرآیندهای بازیافت و تبدیل پسماند به انرژی",
          venue: "مجله مهندسی محیط زیست",
          year: "1402",
          type: "مقاله ژورنالی",
          authors: "دکتر رودابه سامعی، سهیل آقایانی، دکتر ناصر مهردادی",
          url: "https://civilica.com/doc/401/"
        },
        {
          id: "402",
          title: "مدل‌سازی انتشار گازهای گلخانه‌ای در تصفیه‌خانه‌های فاضلاب شهری با روش سناریوسازی",
          venue: "بیستمین همایش ملی بهداشت محیط و مدیریت پسماند",
          year: "1402",
          type: "مقاله کنفرانسی",
          authors: "دکتر رودابه سامعی، مهندس علی رضایی",
          url: "https://civilica.com/doc/402/"
        },
        {
          id: "403",
          title: "بهینه‌سازی سنتز بیودیزل از روغن‌های پسماند با استفاده از نانوکاتالیزورهای مغناطیسی سبز",
          venue: "نشریه تخصصی انرژی‌های نو و محیط زیست",
          year: "1401",
          type: "مقاله ژورنالی",
          authors: "سهیل آقایانی، دکتر رودابه سامعی",
          url: "https://civilica.com/doc/403/"
        },
        {
          id: "404",
          title: "بررسی پایداری و اثرات تجمعی آلاینده‌های نوظهور در تالاب‌های ساحلی جنوب ایران",
          venue: "ششمین همایش ملی محیط زیست دریا و شیلات",
          year: "1401",
          type: "مقاله کنفرانسی",
          authors: "دکتر رودابه سامعی، دکتر احمدرضا کرباسی، سهیل آقایانی",
          url: "https://civilica.com/doc/404/"
        },
        {
          id: "405",
          title: "طرح پژوهشی سنجش ردپای کربن و تدوین استراتژی‌های اقتصاد چرخشی در صنایع پتروشیمی",
          venue: "مرکز مطالعات انرژی و محیط زیست دانشگاه تهران",
          year: "1400",
          type: "طرح پژوهشی",
          authors: "دکتر رودابه سامعی، دکتر ناصر مهردادی",
          url: "https://civilica.com/doc/405/"
        },
        {
          id: "406",
          title: "سنتز نانوکامپوزیت‌های کربنی جاذب جهت حذف ترکیبات دارویی و آنتی‌بیوتیک‌ها از پساب",
          venue: "فصلنامه انسان و محیط زیست",
          year: "1399",
          type: "مقاله ژورنالی",
          authors: "دکتر رودابه سامعی، مهندس مریم حسینی",
          url: "https://civilica.com/doc/406/"
        }
      ]
    },
    mehrdadi: {
      profile: {
        id: "176225",
        name: "پروفسور ناصر مهردادی",
        affil: "استاد تمام گروه مهندسی محیط زیست، دانشکده محیط زیست، دانشگاه تهران",
        url: "https://civilica.com/p/176225/"
      },
      articles: [
        {
          id: "101",
          title: "ارزیابی شاخص‌های کیفی آب رودخانه‌ها با استفاده از شبکه‌های عصبی مصنوعی",
          venue: "مجله مهندسی محیط زیست",
          year: "1402",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، دکتر احمدرضا کرباسی، مهندس پویان فراهانی",
          url: "https://civilica.com/doc/101/"
        },
        {
          id: "102",
          title: "بررسی و مدل‌سازی انتقال آلاینده‌های فلزات سنگین در منابع آب‌های سطحی",
          venue: "بیستمین همایش ملی محیط زیست و بهداشت محیط",
          year: "1402",
          type: "مقاله کنفرانسی",
          authors: "پروفسور ناصر مهردادی، مهندس مریم حسینی",
          url: "https://civilica.com/doc/102/"
        },
        {
          id: "103",
          title: "کاربرد فناوری بیوفیلتراسیون در تصفیه بیولوژیکی پساب‌های صنعتی پیچیده",
          venue: "نشریه آب و فاضلاب",
          year: "1401",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، دکتر رودابه سامعی",
          url: "https://civilica.com/doc/101/"
        },
        {
          id: "104",
          title: "بهینه‌سازی فرآیند لجن فعال در راکتورهای ناپیوسته متوالی (SBR)",
          venue: "ششمین همایش ملی مدیریت پسماند و توسعه پایدار",
          year: "1401",
          type: "مقاله کنفرانسی",
          authors: "پروفسور ناصر مهردادی، مهندس رضا رضایی",
          url: "https://civilica.com/doc/104/"
        },
        {
          id: "105",
          title: "ارزیابی چرخه حیات (LCA) سامانه‌های یکپارچه مدیریت پسماند شهری در ایران",
          venue: "فصلنامه انسان و محیط زیست",
          year: "1400",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، دکتر رودابه سامعی، سهیل آقایانی",
          url: "https://civilica.com/doc/105/"
        },
        {
          id: "106",
          title: "بررسی کارایی فتوکاتالیست نانوذرات اکسید تیتانیوم در تخریب رنگزاهای نساجی",
          venue: "هشتمین کنفرانس بین‌المللی مدیریت محیط زیست",
          year: "1399",
          type: "مقاله کنفرانسی",
          authors: "پروفسور ناصر مهردادی، مهندس علی نوری",
          url: "https://civilica.com/doc/106/"
        },
        {
          id: "107",
          title: "طرح پژوهشی مطالعه جامع و پایش برخط کیفیت هوای کلان‌شهرهای صنعتی",
          venue: "سازمان حفاظت محیط زیست و دانشگاه تهران",
          year: "1399",
          type: "طرح پژوهشی",
          authors: "پروفسور ناصر مهردادی، دکتر رودابه سامعی",
          url: "https://civilica.com/doc/107/"
        },
        {
          id: "108",
          title: "تحلیل پایداری اکوسیستم‌های تالابی با استفاده از رویکرد دینامیک سیستم‌ها",
          venue: "مجله علوم و تکنولوژی محیط زیست",
          year: "1398",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، دکتر احمدرضا کرباسی",
          url: "https://civilica.com/doc/108/"
        },
        {
          id: "109",
          title: "شبیه‌سازی عددی نشت هیدروکربن‌های نفتی در محیط‌های متخلخل آبخوان",
          venue: "هفتمین کنگره ملی مهندسی عمران",
          year: "1398",
          type: "مقاله کنفرانسی",
          authors: "پروفسور ناصر مهردادی، مهندس کیوان صبوری",
          url: "https://civilica.com/doc/109/"
        },
        {
          id: "110",
          title: "ارزیابی اثرات زیست‌محیطی طرح‌های توسعه صنعتی در مناطق ساحلی جنوب",
          venue: "نشریه تخصصی اکولوژی صنعتی و پایش زیستی",
          year: "1397",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، دکتر احمدرضا کرباسی",
          url: "https://civilica.com/doc/110/"
        },
        {
          id: "111",
          title: "مقایسه روش‌های اکسیداسیون پیشرفته (AOPs) در تصفیه پساب دارویی",
          venue: "پنجمین همایش علوم و مهندسی محیط زیست",
          year: "1397",
          type: "مقاله کنفرانسی",
          authors: "پروفسور ناصر مهردادی، مهندس سارا امینی",
          url: "https://civilica.com/doc/111/"
        },
        {
          id: "112",
          title: "تولید بیوگاز از هضم بی‌هوازی پسماندهای جامد ارگانیک با روش گرمادوست",
          venue: "مجله تحقیقات منابع طبیعی ایران",
          year: "1396",
          type: "مقاله ژورنالی",
          authors: "پروفسور ناصر مهردادی، مهندس علی رضایی",
          url: "https://civilica.com/doc/112/"
        }
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
        {
          id: "201",
          title: "بررسی رفتار ژئوشیمیایی و انتقال فازی فلزات سنگین در مصب رودخانه‌ها",
          venue: "مجله محیط زیست طبیعی",
          year: "1402",
          type: "مقاله ژورنالی",
          authors: "دکتر احمدرضا کرباسی، مهندس مریم ناصری",
          url: "https://civilica.com/doc/201/"
        },
        {
          id: "202",
          title: "پایش آلودگی‌های رسوبات خلیج فارس با استفاده از شاخص زمین‌انباشتگی",
          venue: "همایش علوم و مهندسی محیط زیست دریا",
          year: "1401",
          type: "مقاله کنفرانسی",
          authors: "دکتر احمدرضا کرباسی، دکتر ناصر مهردادی",
          url: "https://civilica.com/doc/202/"
        },
        {
          id: "203",
          title: "مدل‌سازی شوری‌زدایی و لخته‌سازی کلوئیدهای معدنی در آبراهه‌های ساحلی",
          venue: "نشریه علوم و فنون اقیانوس‌شناسی",
          year: "1400",
          type: "مقاله ژورنالی",
          authors: "دکتر احمدرضا کرباسی، مهندس علی احمدی",
          url: "https://civilica.com/doc/203/"
        },
        {
          id: "204",
          title: "ارزیابی قابلیت بازیافت و خطرات زیست‌محیطی پسماندهای الکترونیکی در ایران",
          venue: "کنگره ملی مدیریت پسماند",
          year: "1399",
          type: "مقاله کنفرانسی",
          authors: "دکتر احمدرضا کرباسی، سهیل آقایانی",
          url: "https://civilica.com/doc/204/"
        },
        {
          id: "205",
          title: "طرح پژوهشی تدوین استانداردهای ملی سنجش پساب‌های صنعتی دریایی",
          venue: "پژوهشکده علوم محیطی دانشگاه تهران",
          year: "1398",
          type: "طرح پژوهشی",
          authors: "دکتر احمدرضا کرباسی، دکتر رودابه سامعی",
          url: "https://civilica.com/doc/205/"
        },
        {
          id: "206",
          title: "سنجش غلظت کادمیم و سرب در بافت‌های زیستی ماهیان تالاب انزلی",
          venue: "فصلنامه آبزی‌پروری و مدیریت منابع آبی",
          year: "1397",
          type: "مقاله ژورنالی",
          authors: "دکتر احمدرضا کرباسی، مهندس فرزاد بهرامی",
          url: "https://civilica.com/doc/206/"
        }
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
        {
          id: "301",
          title: "ارزیابی چرخه حیات (LCA) تولید بیودیزل از روغن‌های پسماند خوراکی با کاتالیزورهای ناهمگن",
          venue: "فصلنامه تخصصی انرژی‌های نو و پایداری",
          year: "1403",
          type: "مقاله ژورنالی",
          authors: "سهیل آقایانی، دکتر رودابه سامعی",
          url: "https://civilica.com/doc/301/"
        },
        {
          id: "302",
          title: "تحلیل ترمودینامیکی و اقتصادی تبدیل پسماندهای کشاورزی به بیوگاز در مقیاس صنعتی",
          venue: "هفتمین همایش بین‌المللی انرژی و محیط زیست",
          year: "1402",
          type: "مقاله کنفرانسی",
          authors: "سهیل آقایانی، دکتر ناصر مهردادی",
          url: "https://civilica.com/doc/302/"
        },
        {
          id: "303",
          title: "مدل‌سازی سناریوهای کربن‌صفر در سیستم‌های مدیریت پسماند شهری با نرم‌افزار SimaPro",
          venue: "پژوهش‌های مهندسی محیط زیست",
          year: "1402",
          type: "مقاله ژورنالی",
          authors: "سهیل آقایانی، دکتر رودابه سامعی، دکتر ناصر مهردادی",
          url: "https://civilica.com/doc/303/"
        },
        {
          id: "304",
          title: "طرح پژوهشی سنجش ردپای کربن زنجیره تأمین انرژی پاک در ایران",
          venue: "مرکز مطالعات پایداری محیط زیست",
          year: "1401",
          type: "طرح پژوهشی",
          authors: "سهیل آقایانی، دکتر احمدرضا کرباسی",
          url: "https://civilica.com/doc/304/"
        },
        {
          id: "305",
          title: "مقایسه زیست‌محیطی انواع کاتالیست‌های سبز در سنتز سوخت‌های پاک زیستی",
          venue: "ششمین کنفرانس شیمی سبز و فناوری نانو",
          year: "1401",
          type: "مقاله کنفرانسی",
          authors: "سهیل آقایانی، مهندس رضا رضایی",
          url: "https://civilica.com/doc/305/"
        }
      ]
    }
  };

  // State
  var state = {
    profile: null,
    articles: [],
    selected: new Set(),
    filter: "all",
    authorFilter: "all",
    targetAuthor: "",   // generalized: auto-filled from profile name, user can override freely
    boldTargetAuthor: true,
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
    var fullAuthors = String(article.authors || (state.profile ? state.profile.name : "پژوهشگر")).trim();
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
    state.profile = data.profile;
    state.articles = data.articles;
    state.selected = new Set(data.articles.map(function (a) { return a.id; }));
    state.targetAuthor = data.profile.name;
    state.authorFilter = "all";
    state.page = 1;

    var targetInput = document.getElementById("target-author-input");
    if (targetInput) targetInput.value = state.targetAuthor;

    updateAuthorHeader();
    updateKpis();
    updateAuthorFilterOptions();
    renderActiveView();
  }

  // Update Author Header & Target Panel
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

  // Gather Unique Authors for the Filter Dropdown
  function updateAuthorFilterOptions() {
    var select = document.getElementById("author-filter-select");
    if (!select) return;

    var authorsMap = {};
    state.articles.forEach(function (a) {
      var raw = a.authors || "";
      var parts = raw.split(/[,،؛;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
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

    var html = '<option value="all">همهٔ نویسندگان و همکاران (' + toPersianDigits(state.articles.length) + ')</option>';
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
      var authorsLineHtml = escapeHtml(authorsRaw);
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
      var authors = escapeHtml(article.authors || "");
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

  // Word Document Client-Side Generator with Target Bolding
  function generateWordDocument() {
    var selectedArticles = state.articles.filter(function (a) {
      return state.selected.has(a.id);
    });

    if (selectedArticles.length === 0) {
      showToast("لطفاً حداقل یک مقاله را برای خروجی انتخاب کنید.");
      return;
    }

    var targetClean = cleanAuthor(state.targetAuthor);
    var style = state.citationStyle;

    var citationsHtml = selectedArticles.map(function (a, idx) {
      var text = formatCitation(a, idx + 1, style, state.targetAuthor, false);
      // In Word HTML, bold the target author if requested
      if (state.boldTargetAuthor && targetClean) {
        var re = new RegExp("(" + escapeRegex(targetClean) + ")", "gi");
        text = text.replace(re, "<b style='font-weight:bold;'>$1</b>");
      }
      return '<p class="citation">' + text + '</p>';
    }).join("\n");

    var docHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>\n" +
      "<head>\n" +
      "<meta charset='utf-8'>\n" +
      "<title>فهرست مقالات استخراج‌شده</title>\n" +
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
      "<h1>فهرست مقالات استنادشده — " + escapeHtml(state.targetAuthor) + "</h1>\n" +
      citationsHtml + "\n" +
      "</body>\n" +
      "</html>";

    var blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "CivilicaPulse_" + state.targetAuthor.replace(/\s+/g, "_") + ".doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast("فایل Word با تفکیک نویسندهٔ هدف با موفقیت دانلود شد.");
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
    document.getElementById("btn-export-json").addEventListener("click", exportJson);
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

    // Click delegation for single copy, edit authors, checkbox, demo profiles
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

      // Demo Chips / Cards
      var demoTarget = e.target.closest("[data-demo]");
      if (demoTarget) {
        var key = demoTarget.getAttribute("data-demo");
        if (DEMO_PROFILES[key]) {
          loadDataset(DEMO_PROFILES[key]);
          showToast("پروفایل " + DEMO_PROFILES[key].profile.name + " بارگذاری شد.");
        }
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

  // URL Form Submission — fully client-side via CORS proxy
  function initForm() {
    var form = document.getElementById("profile-form");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var url = document.getElementById("profile-url").value.trim();
      if (!url) return showToast("لطفاً آدرس صفحه پژوهشگر را وارد کنید.");

      // Normalize civilica URL (support Persian digits in URL too)
      var allDigits = "0123456789٠١٢٣٤٥٦٧٨٩";
      var latinDigits = "0123456789012345678901234567890123456789";
      url = url.replace(/[٠-٩]/g, function(d) { return String(allDigits.indexOf(d) % 10); });
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;

      var statusEl = document.getElementById("scrape-status");
      statusEl.style.display = "flex";

      // Try CORS proxy to fetch directly in browser (no server needed)
      var proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);

      try {
        var resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error("Proxy error " + resp.status);
        var json = await resp.json();
        var htmlText = json.contents;
        if (!htmlText) throw new Error("Empty response from proxy");
        var parsed = parseCivilicaHtml(htmlText, url);
        if (parsed.articles.length === 0) {
          showToast("هیچ مقاله‌ای یافت نشد. صفحه را با Ctrl+S ذخیره کنید و HTML آن را در تب ۲ بچسبانید.");
        } else {
          loadDataset(parsed);
          showToast(toPersianDigits(parsed.articles.length) + " مقاله با موفقیت استخراج شد.");
        }
      } catch (err) {
        // Fallback message — direct browser CORS usually blocked on civilica
        showToast("دسترسی مستقیم مسدود شد. صفحه را در مرورگر باز کنید، Ctrl+S بزنید، سپس فایل HTML را در تب ۲ دراپ کنید.");
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
    initPillsAndControls();
    initActions();
    initHtmlImport();
    initForm();

    // Check if bookmarklet passed HTML, else default to Dr. Roudabeh Samiee profile!
    checkBookmarkletImport();
    if (!state.profile) {
      loadDataset(DEMO_PROFILES.samiee);
    }
  });

})();
