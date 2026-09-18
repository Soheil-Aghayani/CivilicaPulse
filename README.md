<div dir="rtl" align="center">
  <img src="web/assets/civilicapulse-mark.webp" alt="CivilicaPulse" width="112">
  <h1>استخراج مقالات سیویلیکا</h1>
  <p><strong>CivilicaPulse</strong>؛ ابزار فارسی برای تبدیل فهرست مقالات یک پژوهشگر به فایل Word مرتب و قابل استفاده.</p>
  <p>
    <a href="https://github.com/Soheil-Aghayani/CivilicaPulse">
      <img src="https://img.shields.io/badge/Repository-CivilicaPulse-1e3a5f?style=for-the-badge&logo=github&logoColor=white" alt="CivilicaPulse repository">
    </a>
    <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python and Flask">
    <img src="https://img.shields.io/badge/Word-Export-2b579a?style=for-the-badge&logo=microsoftword&logoColor=white" alt="Word export">
  </p>
</div>

## معرفی

CivilicaPulse یک ابزار فارسی و مستقل برای دریافت فهرست مقاله‌های صفحهٔ عمومی پژوهشگر در
[Civilica](https://civilica.com)، بررسی و انتخاب مقاله‌ها، و ساخت فایل Word با سبک ارجاع دلخواه است.

این پروژه عمداً در ریپوی جدا از [ScholarPulse](https://soheil-aghayani.github.io/ScholarPulse/)
نگه‌داری می‌شود و برای استفادهٔ پژوهشی کم‌حجم طراحی شده است.

<p align="center">
  <img src="web/assets/civilicapulse-preview.webp" alt="نمای رابط فارسی CivilicaPulse" width="100%">
</p>

## قابلیت‌ها

- دریافت لینک صفحهٔ پژوهشگر سیویلیکا، مانند
  <code>https://civilica.com/p/176225/</code>.
- حالت جایگزین برای چسباندن HTML صفحه، وقتی دریافت مستقیم از سرور محدود شود.
- استخراج عنوان، نوع مقاله، سال، محل انتشار و لینک هر رکورد.
- جست‌وجو و فیلتر مقاله‌ها بر اساس عنوان و نوع انتشار.
- صفحه‌بندی فهرست‌های بزرگ با انتخاب ۵ یا ۱۰ مقاله در هر صفحه.
- انتخاب همهٔ مقاله‌ها یا فقط مقاله‌های صفحهٔ جاری.
- انتخاب سبک‌های APA 7th، Vancouver، IEEE، Harvard، Chicago، MLA 9th و BibTeX.
- خروجی Word استاندارد <code>.docx</code> یا خروجی سازگار با نسخه‌های قدیمی‌تر <code>.doc</code>.
- امکان افزودن یا حذف لینک مقاله‌های سیویلیکا از فایل خروجی.
- آواتار پایدار پژوهشگر با Jdenticon، حتی وقتی تصویر عمومی قابل دریافت نباشد.
- رابط راست‌به‌چپ فارسی، بدون API key، سرویس هوش مصنوعی یا اطلاعات کارت بانکی.

## خروجی Word

تنظیمات فعلی خروجی در <code>server.py</code> متمرکز شده‌اند:

| مورد | تنظیم |
| --- | --- |
| جهت متن | راست‌به‌چپ و راست‌چین |
| متن فارسی | B Nazanin، اندازهٔ ۱۲ |
| متن انگلیسی | Times New Roman، اندازهٔ ۱۱ |
| اعداد متن فارسی | فارسی |
| اعداد داخل URL و لینک‌ها | لاتین و بدون تغییر |
| فایل استاندارد Word | <code>.docx</code> |
| فایل سازگار قدیمی | <code>.doc</code> |

اگر منظور از «فایل Word واقعی» قالب استاندارد امروزی Word است، گزینهٔ <code>.docx</code> انتخاب درست است.
گزینهٔ <code>.doc</code> برای گردش‌کارها و نرم‌افزارهای قدیمی‌تر ارائه شده و به‌صورت Word-compatible تولید می‌شود.

## روش استفاده

۱. لینک صفحهٔ پژوهشگر سیویلیکا را وارد کنید.<br>
۲. مقاله‌ها را بررسی، جست‌وجو و فیلتر کنید.<br>
۳. همهٔ مقاله‌ها یا موارد دلخواه را انتخاب کنید.<br>
۴. سبک ارجاع، نوع فایل Word و وضعیت لینک‌های سیویلیکا را تعیین کنید.<br>
۵. روی «دریافت فایل Word» بزنید.

اگر دریافت مستقیم موفق نشد، بخش ورود HTML را باز کنید، از صفحهٔ سیویلیکا گزینهٔ
<code>View Page Source</code> را بگیرید و کد HTML را در ابزار بچسبانید. این حالت محدودیت سایت را دور نمی‌زند؛
فقط همان HTML در اختیار کاربر را به‌صورت محلی پردازش می‌کند.

## اجرای محلی در ویندوز

ساده‌ترین راه، اجرای <code>start.bat</code> است. برای اجرای دستی در PowerShell:

~~~powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe server.py
~~~

سپس مرورگر را روی [http://127.0.0.1:5000](http://127.0.0.1:5000) باز کنید.

## آزمون‌ها

آزمون‌های parser، سبک‌های ارجاع و خروجی Word با کتابخانهٔ استاندارد <code>unittest</code> اجرا می‌شوند:

~~~powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
~~~

## ساختار پروژه

| مسیر | مسئولیت |
| --- | --- |
| <code>server.py</code> | API محلی، اعتبارسنجی درخواست و ساخت خروجی Word |
| <code>civilica_parser.py</code> | استخراج و نرمال‌سازی اطلاعات پروفایل |
| <code>citation_formats.py</code> | تولید سبک‌های ارجاع |
| <code>web/index.html</code> | ساختار رابط فارسی |
| <code>web/app.js</code> | تعاملات، انتخاب، فیلتر و صفحه‌بندی |
| <code>web/styles.css</code> | طراحی راست‌به‌چپ و واکنش‌گرا |
| <code>web/assets/</code> | فونت‌ها، آیکون‌ها و نشان CivilicaPulse |
| <code>tests/</code> | آزمون‌های parser و خروجی |

## محدودیت‌های آگاهانه

- ابزار فقط اطلاعات نمایه‌شده در فهرست عمومی پژوهشگر را دریافت می‌کند؛ متن کامل یا PDF مقاله‌ها
  دانلود نمی‌شود.
- Civilica ممکن است درخواست‌های خودکار از سرورهای عمومی را محدود کند. برای همین، مسیر ورود HTML
  هم در نظر گرفته شده است.
- صفحهٔ خلاصهٔ پژوهشگر ممکن است نام کامل همهٔ نویسندگان را ارائه نکند. در این حالت نام پژوهشگر
  پروفایل به‌عنوان نویسندهٔ جایگزین وارد citation می‌شود و باید قبل از استناد نهایی بررسی شود.
- اجرای عمومی نیازمند میزبانی یک backend پایتون است؛ GitHub Pages به‌تنهایی Flask را اجرا نمی‌کند.

## هزینه و حریم خصوصی

اجرای محلی هیچ هزینه‌ای ندارد و نیازی به API key یا وارد کردن اطلاعات بانکی نیست.
این ابزار برای اجرای محلی طراحی شده و پایگاه دادهٔ آنلاین یا ارسال اطلاعات پژوهشی به سرویس هوش
مصنوعی ندارد. در صورت انتشار عمومی، باید محدودیت‌ها و شرایط پلن رایگان سرویس میزبانی جداگانه بررسی شود.

## مسیر توسعه

- انتشار یک backend عمومی با پلن رایگان، در صورت امکان و پایداری سرویس.
- نصب‌پذیر کردن رابط به‌صورت PWA.
- آماده‌سازی نسخهٔ دسکتاپ و موبایل پس از تثبیت backend.
- افزودن نمونه‌های تصویری از رابط فارسی و فایل‌های خروجی نهایی.

## اعتبار

این ابزار توسط [سهیل آقایانی](https://github.com/Soheil-Aghayani) طراحی و توسعه داده شده است.

ریپوی پروژه: [github.com/Soheil-Aghayani/CivilicaPulse](https://github.com/Soheil-Aghayani/CivilicaPulse)
