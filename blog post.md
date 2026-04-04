# Chebbi Trading — Blog Post + Project Entry

---

## §1 · BLOG METADATA

```yaml
SLUG:           chebbi-trading-forex-signal-platform
TITLE_EN:       "How We Built a Full-Stack Forex Signal Platform with AI Verification"
TITLE_AR:       "كيف بنينا منصة إشارات فوركس متكاملة بالذكاء الاصطناعي"
EXCERPT_EN:     "From manual signal sharing to a trilingual platform with AI deposit verification, real-time results, and n8n automation — the full story."
EXCERPT_AR:     "من مشاركة الإشارات يدوياً إلى منصة ثلاثية اللغات بتحقق تلقائي وأتمتة كاملة — القصة الكاملة."
COVER_IMAGE:    see §4
TAGS:           see §5
LINKED_PROJECT: "Chebbi Trading"
PUBLISHED:      true
```

---

## §2 · CONTENT — ENGLISH

## The Problem

Amine Chebbi had been sharing free Forex trading signals — primarily XAUUSD and major pairs — to a growing community via YouTube live streams and Telegram for over four years. The operation was entirely manual: signals shared as text messages, results tracked in Google Sheets, member verification done by eye-checking deposit screenshots. Every new member meant a DM conversation, a manual check of their XM broker screenshot, and a hand-typed status update.

By early 2026, the community had crossed 1,900 members. The Google Sheets holding four years of trading results had become a scroll-heavy nightmare. New members regularly asked the same onboarding questions in three languages — French, English, and Arabic. The Telegram group was a firehose of requests, and Amine was spending more time on admin than on actual market analysis.

The breaking point came when a Crypto VIP group launched alongside the free Forex service. Now there were two separate result sets, two subscriber pipelines, and zero tooling to manage either. Something had to give.

![chebbi-trading-pain-scenario](GENERATE: Forex trader overwhelmed by multiple chat windows, spreadsheets, and Telegram notifications on three monitors, moody editorial illustration, medium shot with dramatic overhead warm light casting cool blue shadows, frustrated yet focused mood, muted blue-grey palette with stacks of spreadsheet printouts and phone notifications glowing, dark vignette edges, 16:9, high-detail photography and illustration hybrid, asra3.com brand aesthetics — dark, premium, minimal, tech-forward.)

## The Solution: Chebbi Trading

We built a self-contained, full-stack platform — not a WordPress site with plugins, not a no-code dashboard with glue logic — a real application. The system runs as a standalone Next.js 16 application on a single VPS, uses SQLite via Prisma for zero-ops database management, and delegates verification workflows to n8n with Google Gemini AI.

The architecture decision was deliberate: Chebbi Trading doesn't need horizontal scaling or a managed database cluster. It needs reliability, trilingual support, and automation. A single SQLite file means backup is `cp dev.db dev_backup.db`. A standalone Next.js build means deployment is `git pull && npm run build && pm2 restart`. We chose simplicity where others would over-engineer, and invested complexity where it matters — the automation layer.

![chebbi-trading-dashboard-overview](SCREENSHOT: Admin dashboard overview tab showing KPI cards (active members, performance, visits, pending requests), annual performance bars, and latest signals table — full viewport, dark mode, 1440px, no browser chrome)

## Key Features

### ⚡ Trilingual CMS with Zero-Config Localization

Every piece of content — blog articles, FAQ entries, testimonials, signals, even error messages — supports French, English, and Arabic simultaneously. We didn't use a third-party i18n library with JSON key files that drift out of sync. Instead, every database model stores `titleFr`, `titleEn`, `titleAr` columns directly. The frontend uses a lightweight `pickLang()` helper that resolves the correct field based on the active language state in Zustand.

The result: the admin creates one blog article and fills three tabs. The public site renders the correct language instantly. Arabic gets proper RTL layout. No build step, no locale files, no missing key warnings.

![chebbi-trading-trilingual](SCREENSHOT: Blog article creation dialog showing the three language tabs — French, English, Arabic — with content fields visible, dark mode admin panel)

### 🔄 AI-Powered Deposit Verification via n8n

When a new member registers, they upload a screenshot of their XM broker deposit. The form converts it to base64 on the client side, ships it to our `/api/register` endpoint, which fires a webhook to an n8n automation workflow. The n8n workflow sends the image to Google Gemini 1.5 Flash with a strict prompt: verify this is a real XM deposit of at least $100. Gemini responds APPROVED or REJECTED. n8n calls back our `/api/webhook/member-status` endpoint with the verdict, and the member gets a Telegram notification — all in under 30 seconds.

The webhook uses a shared secret stored in the database's `SiteSetting` table — one permanent key that survives server restarts. No JWT rotation, no OAuth dance. Simple, auditable, reliable.

### 📊 Compounding Performance Engine

The results page isn't a static table of percentages. We compute compounding returns using the correct multiplicative formula: `Final = Initial × Π(1 + rₙ)`. Each monthly result feeds into the previous month's compound balance. The year summary cards, monthly breakdown charts, and cumulative growth lines all derive from the same computed pipeline — no divergence between what the dashboard shows and what the results page displays.

Both the Forex results (computed from individual `Trade` records with pip-to-percentage conversion) and the Crypto VIP results (stored as direct monthly percentages in `CryptoMonthly`) use this compounding logic. The API at `/api/results` returns pre-computed `lowRisk` and `mediumRisk` percentages per month.

### 🔐 Full Admin Dashboard with Real-Time CRUD

The admin panel isn't an afterthought — it's a 144KB component with complete CRUD for every entity: Members (approve/reject/view), Signals (create/delete), Blog Articles (trilingual rich text), FAQs (drag-to-reorder), Settings (XM affiliate links per language, webhook URLs, stat overrides), and a dedicated Crypto VIP management section. Every mutating API route requires authentication via a session cookie validated through the shared `auth-guard.ts` module.

> 💡 **Engineering insight**: We use an in-memory session store with 24-hour TTL instead of database-backed sessions. For a single-admin platform, this eliminates an entire class of session cleanup problems. The trade-off — sessions don't survive PM2 restarts — is acceptable because the admin simply logs in again.

![chebbi-trading-features-grid](SCREENSHOT: Grid showing 3 screens side-by-side: Members management table with status badges, Signals creation form, and Results page with annual performance bars — dark mode, 1440px viewport)

## Architecture & Tech Stack

We chose Next.js 16 with the App Router because Server Components let us ship zero JavaScript for content-heavy pages while keeping the interactive dashboard fully client-side. SQLite via Prisma was the intentional "boring" choice — for a platform with a single admin and read-heavy public traffic, it eliminates connection pooling, managed database costs, and cold start latency entirely. The database is literally a file on disk.

n8n handles the event-driven workflows — deposit verification, Google Sheets result syncing, and member notification — because it gives the operator (Amine) a visual interface to modify automation logic without touching code. The Gemini integration lives entirely in n8n, keeping our application code free of AI vendor lock-in.

| Layer | Technology | Why We Chose It |
|:------|:-----------|:----------------|
| Frontend | Next.js 16 + React 19 | Server Components for content pages; App Router for clean API routes |
| UI Kit | shadcn/ui + Tailwind CSS 4 | Pre-built accessible components with full dark mode; no bundle bloat |
| Database | SQLite via Prisma | Zero-ops, single-file backup, sub-millisecond reads for our scale |
| Animation | Framer Motion | Scroll-triggered reveals, page transitions, micro-interactions |
| Automation | n8n (self-hosted) | Visual workflow builder for deposit verification + Sheets sync |
| AI | Google Gemini 1.5 Flash | Vision API for deposit screenshot analysis — fast, cheap, accurate |
| Charts | Recharts | Composable React chart library for performance visualization |
| Infra | aaPanel + Nginx + PM2 | $5/mo VPS, reverse proxy with static asset caching, zero-downtime restarts |

![chebbi-trading-architecture](GENERATE: Clean system architecture diagram on a deep charcoal #0a0a0a background. Components: Next.js App Router, Prisma ORM, SQLite Database, n8n Workflow Engine, Google Gemini AI, Telegram Bot API, Nginx Reverse Proxy. Components shown as rounded rectangles in dark #1a1a1a with white labels. Data flow shown as emerald green #10b981 directional arrows with subtle glow. User flow from left: Browser → Nginx → Next.js → Prisma → SQLite. Automation flow from bottom: Registration → n8n → Gemini AI → Webhook callback. Section labels in muted grey #888888. No clipart icons — purely geometric shapes. 16:9 format, vector-clean style, minimal, no gradients on boxes.)

## Results & Impact

The platform replaced an entire manual pipeline. Member onboarding — from registration to status update — went from a 24-hour manual process to under 30 seconds with AI verification. Four years of trading results that previously lived in multiple Google Sheets tabs are now queryable via API, rendered in interactive charts, and automatically synced through n8n workflows with two HTTP request nodes.

The trilingual support expanded the reachable audience from French-speaking North Africa to the entire MENA region and English-speaking traders globally. Blog articles, FAQs, and even the registration form all render natively in all three languages — zero translation delay, zero content drift.

> **"The platform handles over 1,900 members across three languages with a single SQLite file and a $5/month VPS. Total infrastructure cost: under $10/month."**

The Crypto VIP page — complete with documented monthly performance, compounding return calculations, and an email subscriber waitlist — launched as a standalone feature within the same codebase, sharing the same admin panel. Adding an entirely new product vertical took days, not months.

![chebbi-trading-metrics-infographic](GENERATE: Dark-theme before/after metrics infographic on #0a0a0a background. Left column shows BEFORE state: 24h manual verification in muted red #ef4444, scattered Google Sheets, French-only in muted red #ef4444. Right column shows AFTER state: 30s AI verification in emerald green #10b981, unified dashboard in emerald green #10b981, 3 languages in emerald green #10b981. Center divider arrow indicating transformation. Additional circular progress indicators: 1900+ members managed, 4+ years of results digitized, $10/mo total infra cost. White labels, Inter-style typography, clean modern dashboard aesthetic, 16:9, asra3.com brand identity — dark, premium, minimal, tech-forward.)

## What I'd Do Differently

1. **Move the session store to SQLite from day one** — The in-memory session approach works for single-admin, but it created confusion during PM2 restarts when the admin kept getting logged out. A simple `Session` table in the existing SQLite database would have been more robust with zero additional infrastructure.

2. **Use `next-intl` for the i18n layer instead of a custom `t()` helper** — Our homegrown `t(key, lang)` function works, but it doesn't give us type-safe keys, missing key warnings in dev, or automatic key extraction. At 200+ translation keys across the codebase, the ergonomic cost of the manual approach starts compounding.

3. **Design the API authentication around the same webhook secret from the start** — We initially built separate admin session cookies and webhook body secrets, then unified them into a single `Authorization: Bearer` pattern late in development. Starting with a single auth strategy would have saved a full refactor cycle.

4. **Extract the 144KB dashboard component into sub-routes** — The monolithic `dashboard-page.tsx` contains every admin view — members, signals, blog, FAQ, settings, results, crypto. Each section deserves its own route under `/admin/*` with proper code splitting. The file works, but onboarding a new developer to a single 3,000-line component is a non-starter.

---

*Built by [asra3.com](https://asra3.com) — Turning ideas into high-performance digital products.*

---

## §3 · CONTENT — ARABIC

## المشكلة

أمين الشبي كان يشارك إشارات فوركس مجانية — أساساً XAUUSD وأزواج العملات الرئيسية — لمجتمع متنامٍ عبر بثوث يوتيوب المباشرة وتيليجرام لأكثر من أربع سنوات. كانت العملية بأكملها يدوية: إشارات تُرسل كرسائل نصية، نتائج تُتابع في جداول Google Sheets، والتحقق من الأعضاء عبر فحص لقطات شاشة الإيداع بالعين المجردة. كل عضو جديد يعني محادثة خاصة، فحص يدوي للقطة حساب XM، وتحديث حالة مكتوب يدوياً.

بحلول أوائل 2026، تجاوز المجتمع 1,900 عضو. ملف Google Sheets الذي يحوي نتائج أربع سنوات أصبح كابوساً للتصفح. الأعضاء الجدد يطرحون نفس الأسئلة بثلاث لغات — الفرنسية والإنجليزية والعربية. مجموعة تيليجرام تحولت لسيل من الطلبات، وأمين كان يقضي وقتاً أكثر في الإدارة مقارنة بتحليل الأسواق.

نقطة الانفجار كانت عند إطلاق مجموعة Crypto VIP إلى جانب خدمة الفوركس المجانية. الآن هناك مجموعتا نتائج منفصلتان، قناتان للمشتركين، وصفر أدوات لإدارة أي منهما.

![chebbi-trading-pain-scenario](GENERATE: Forex trader overwhelmed by multiple chat windows, spreadsheets, and Telegram notifications on three monitors, moody editorial illustration, medium shot with dramatic overhead warm light casting cool blue shadows, frustrated yet focused mood, muted blue-grey palette with stacks of spreadsheet printouts and phone notifications glowing, dark vignette edges, 16:9, high-detail photography and illustration hybrid, asra3.com brand aesthetics — dark, premium, minimal, tech-forward.)

## الحل: Chebbi Trading

بنينا منصة متكاملة قائمة بذاتها — ليس موقع WordPress بإضافات، وليس لوحة تحكم no-code ملصقة ببعضها — تطبيق حقيقي. النظام يعمل كتطبيق Next.js 16 مستقل على VPS واحد، يستخدم SQLite عبر Prisma لإدارة قاعدة بيانات بدون صيانة، ويُفوّض سير العمل للتحقق إلى n8n مع Google Gemini AI.

قرار البنية كان مقصوداً: Chebbi Trading لا تحتاج توسع أفقي أو قاعدة بيانات مُدارة. تحتاج ثبات، دعم ثلاث لغات، وأتمتة. ملف SQLite واحد يعني أن النسخ الاحتياطي هو `cp dev.db dev_backup.db`. بناء Next.js المستقل يعني أن النشر هو `git pull && npm run build && pm2 restart`. اخترنا البساطة حيث سيُعقّد غيرنا، واستثمرنا التعقيد حيث يهم — طبقة الأتمتة.

![chebbi-trading-dashboard-overview](SCREENSHOT: Admin dashboard overview tab showing KPI cards (active members, performance, visits, pending requests), annual performance bars, and latest signals table — full viewport, dark mode, 1440px, no browser chrome)

## الميزات الرئيسية

### ⚡ نظام محتوى ثلاثي اللغات بدون إعداد

كل قطعة محتوى — مقالات المدونة، أسئلة FAQ، الشهادات، الإشارات، حتى رسائل الخطأ — تدعم الفرنسية والإنجليزية والعربية في الوقت ذاته. لم نستخدم مكتبة i18n خارجية بملفات JSON للمفاتيح التي تخرج عن التزامن. بدلاً من ذلك، كل نموذج قاعدة بيانات يُخزّن أعمدة `titleFr` و`titleEn` و`titleAr` مباشرة. الواجهة تستخدم مساعد `pickLang()` خفيف يحدد الحقل المناسب حسب حالة اللغة في Zustand.

النتيجة: المسؤول يُنشئ مقالاً واحداً ويملأ ثلاث ألسنة. الموقع العام يعرض اللغة الصحيحة فوراً والعربية تحصل على تخطيط RTL سليم. بدون خطوة بناء، بدون ملفات ترجمة، بدون تحذيرات مفاتيح مفقودة.

![chebbi-trading-trilingual](SCREENSHOT: Blog article creation dialog showing the three language tabs — French, English, Arabic — with content fields visible, dark mode admin panel)

### 🔄 تحقق تلقائي من الإيداع بالذكاء الاصطناعي عبر n8n

عند تسجيل عضو جديد، يرفع لقطة شاشة إيداعه في وسيط XM. النموذج يحوّلها إلى base64 في المتصفح، ويرسلها إلى نقطة `/api/register`، التي تطلق webhook إلى سير عمل n8n. يرسل n8n الصورة إلى Google Gemini 1.5 Flash مع أمر صارم: تحقق من أن هذا إيداع XM حقيقي بقيمة $100 على الأقل. Gemini يرد APPROVED أو REJECTED. يعاود n8n الاتصال بنقطة `/api/webhook/member-status` بالقرار، ويتلقى العضو إشعاراً على تيليجرام — كل ذلك في أقل من 30 ثانية.

### 📊 محرك الأداء بالعائد المركّب

صفحة النتائج ليست جدولاً ثابتاً من النسب. نحسب العوائد المركّبة بالمعادلة الضربية الصحيحة: `Final = Initial × Π(1 + rₙ)`. كل نتيجة شهرية تُبنى على الرصيد المركّب للشهر السابق. بطاقات ملخص السنة، مخططات التفصيل الشهري، وخطوط النمو التراكمي جميعها تنبع من نفس خط الحساب.

خدمتا الفوركس (المحسوبة من سجلات `Trade` الفردية بتحويل النقاط إلى نسب) وCrypto VIP (المخزنة كنسب شهرية مباشرة في `CryptoMonthly`) تستخدمان هذا المنطق التراكمي.

### 🔐 لوحة تحكم كاملة مع CRUD فوري

لوحة التحكم ليست فكرة لاحقة — إنها مكوّن بحجم 144 كيلوبايت مع CRUD كامل لكل كيان: الأعضاء (موافقة/رفض/عرض)، الإشارات (إنشاء/حذف)، مقالات المدونة (نص غني ثلاثي اللغة)، الأسئلة الشائعة (سحب لإعادة الترتيب)، الإعدادات (روابط XM لكل لغة، عناوين webhooks)، وقسم إدارة Crypto VIP مخصص.

> 💡 **رؤية هندسية**: نستخدم مخزن جلسات في الذاكرة مع انتهاء صلاحية 24 ساعة بدلاً من جلسات محفوظة في قاعدة البيانات. لمنصة بمسؤول واحد، هذا يلغي فئة كاملة من مشاكل تنظيف الجلسات.

![chebbi-trading-features-grid](SCREENSHOT: Grid showing 3 screens side-by-side: Members management table with status badges, Signals creation form, and Results page with annual performance bars — dark mode, 1440px viewport)

## البنية والتقنيات

اخترنا Next.js 16 مع App Router لأن Server Components تتيح لنا إرسال صفر JavaScript لصفحات المحتوى مع الحفاظ على تفاعلية لوحة التحكم بالكامل. SQLite عبر Prisma كان الخيار "الممل" المتعمد — لمنصة بمسؤول واحد وقراءة كثيفة، يلغي connection pooling وتكاليف قواعد البيانات المُدارة والتأخر عند البداية الباردة.

n8n يدير سير العمل المبني على الأحداث — التحقق من الإيداع ومزامنة Google Sheets وإشعارات الأعضاء — لأنه يمنح المستخدم (أمين) واجهة مرئية لتعديل الأتمتة بدون لمس الشيفرة.

| Layer | Technology | Why We Chose It |
|:------|:-----------|:----------------|
| Frontend | Next.js 16 + React 19 | Server Components for content pages; App Router for clean API routes |
| UI Kit | shadcn/ui + Tailwind CSS 4 | Pre-built accessible components with full dark mode; no bundle bloat |
| Database | SQLite via Prisma | Zero-ops, single-file backup, sub-millisecond reads for our scale |
| Animation | Framer Motion | Scroll-triggered reveals, page transitions, micro-interactions |
| Automation | n8n (self-hosted) | Visual workflow builder for deposit verification + Sheets sync |
| AI | Google Gemini 1.5 Flash | Vision API for deposit screenshot analysis — fast, cheap, accurate |
| Charts | Recharts | Composable React chart library for performance visualization |
| Infra | aaPanel + Nginx + PM2 | $5/mo VPS, reverse proxy with static asset caching, zero-downtime restarts |

![chebbi-trading-architecture](GENERATE: Clean system architecture diagram on a deep charcoal #0a0a0a background. Components: Next.js App Router, Prisma ORM, SQLite Database, n8n Workflow Engine, Google Gemini AI, Telegram Bot API, Nginx Reverse Proxy. Components shown as rounded rectangles in dark #1a1a1a with white labels. Data flow shown as emerald green #10b981 directional arrows with subtle glow. User flow from left: Browser → Nginx → Next.js → Prisma → SQLite. Automation flow from bottom: Registration → n8n → Gemini AI → Webhook callback. Section labels in muted grey #888888. No clipart icons — purely geometric shapes. 16:9 format, vector-clean style, minimal, no gradients on boxes.)

## النتائج والأثر

المنصة استبدلت خط أنابيب يدوي بالكامل. إضافة الأعضاء — من التسجيل إلى تحديث الحالة — انخفض من عملية يدوية تستغرق 24 ساعة إلى أقل من 30 ثانية بتحقق ذكاء اصطناعي. أربع سنوات من نتائج التداول التي كانت في ألسنة Google Sheets متعددة أصبحت الآن قابلة للاستعلام عبر API وتُعرض في مخططات تفاعلية.

الدعم الثلاثي اللغات وسّع الجمهور من شمال أفريقيا الناطق بالفرنسية إلى منطقة MENA بالكامل والمتداولين الناطقين بالإنجليزية عالمياً.

> **"المنصة تدير أكثر من 1,900 عضو بثلاث لغات بملف SQLite واحد و VPS بـ $5 شهرياً. تكلفة البنية التحتية الكاملة: أقل من $10 شهرياً."**

صفحة Crypto VIP — بأداء شهري موثق وحسابات عائد مركّب وقائمة انتظار بالبريد — أُطلقت كميزة مستقلة ضمن نفس قاعدة الشيفرة. إضافة خط منتج جديد بالكامل استغرقت أياماً وليس أشهراً.

![chebbi-trading-metrics-infographic](GENERATE: Dark-theme before/after metrics infographic on #0a0a0a background. Left column shows BEFORE state: 24h manual verification in muted red #ef4444, scattered Google Sheets, French-only in muted red #ef4444. Right column shows AFTER state: 30s AI verification in emerald green #10b981, unified dashboard in emerald green #10b981, 3 languages in emerald green #10b981. Center divider arrow indicating transformation. Additional circular progress indicators: 1900+ members managed, 4+ years of results digitized, $10/mo total infra cost. White labels, Inter-style typography, clean modern dashboard aesthetic, 16:9, asra3.com brand identity — dark, premium, minimal, tech-forward.)

## ما الذي كنت سأغيّره

1. **نقل مخزن الجلسات إلى SQLite من البداية** — نهج الجلسات في الذاكرة يعمل لمسؤول واحد، لكنه سبب ارتباكاً عند إعادة تشغيل PM2 حيث يجد المسؤول نفسه مطروداً. جدول `Session` بسيط في قاعدة SQLite الموجودة سيكون أكثر صلابة بدون بنية تحتية إضافية.

2. **استخدام `next-intl` بدلاً من مساعد `t()` المُخصص** — دالة `t(key, lang)` المصنوعة يدوياً تعمل، لكنها لا توفر مفاتيح آمنة من حيث النوع أو تحذيرات مفاتيح مفقودة. عند أكثر من 200 مفتاح ترجمة، التكلفة العملية تتراكم.

3. **تصميم مصادقة API حول نفس المفتاح السري من البداية** — بنينا في البداية كوكيز جلسة منفصلة وأسرار webhook، ثم وحّدناها لاحقاً في نمط `Authorization: Bearer` واحد. البدء باستراتيجية مصادقة واحدة كان سيوفر دورة إعادة هيكلة كاملة.

4. **تقسيم مكوّن لوحة التحكم البالغ 144KB إلى مسارات فرعية** — الملف الأحادي يحتوي على كل عرض إداري. كل قسم يستحق مساره الخاص مع code splitting مناسب.

---

*بُني بواسطة [asra3.com](https://asra3.com) — تحويل الأفكار إلى منتجات رقمية عالية الأداء.*

---

## §4 · COVER IMAGE PROMPT

```
FILENAME: chebbi-trading-cover.png

PROMPT: "Professional Forex trader reviewing a sleek dark trading dashboard with live gold price charts and green signal indicators glowing on a wide curved monitor, cinematic editorial photography, wide shot rule of thirds with deep-focus background blur showing a dim trading floor, focused confidence mood, cool-blue ambient light from monitor glow with emerald green #10b981 UI highlights and chart annotations, deep charcoal #0a0a0a environment with subtle gold #f59e0b price chart accent, white typography elements visible on the dashboard, 16:9, photorealistic, 8K resolution, no text overlays, asra3.com brand aesthetics — dark, premium, minimal, tech-forward."
```

---

## §5 · BLOG TAGS

```json
["Forex Platform", "Next.js", "Prisma", "n8n Automation", "AI Verification", "FinTech", "تطوير ويب", "أتمتة"]
```

---

## §6 · SCREENSHOTS LIST

| # | Filename (= Alt Text) | What to Capture | Used In |
|:-:|:----------------------|:----------------|:--------|
| 1 | `chebbi-trading-dashboard-overview` | Full admin dashboard Overview tab: KPI cards row (members, performance, visits, pending), annual performance bars, latest signals table. Dark mode, 1440px viewport, no browser chrome. | §2 & §3 "The Solution" |
| 2 | `chebbi-trading-trilingual` | Blog article creation dialog open, showing the language tabs (FR/EN/AR) with content textarea visible. Dark mode admin panel background. | §2 & §3 Feature 1 |
| 3 | `chebbi-trading-features-grid` | Composite screenshot: Members tab (status badges visible), Signals tab (creation form), and Results page (annual performance bars) — side-by-side grid or top-bottom layout. | §2 & §3 Features section |
| 4 | `chebbi-trading-mobile-view` | Home page hero section on mobile (375px viewport via DevTools or Responsively). Show the XM registration card and live badge. | Always |

> **Upload workflow**: Screenshot → save as `filename.png` → Admin panel → "Upload Image" button → paste the returned `/uploads/filename.png` URL into the markdown image tag.

---

## §7 · GENERATED IMAGES LIST

| # | Filename | Full Prompt | Used In |
|:-:|:---------|:------------|:--------|
| 1 | `chebbi-trading-cover` | Professional Forex trader reviewing a sleek dark trading dashboard with live gold price charts and green signal indicators glowing on a wide curved monitor, cinematic editorial photography, wide shot rule of thirds with deep-focus background blur showing a dim trading floor, focused confidence mood, cool-blue ambient light from monitor glow with emerald green #10b981 UI highlights and chart annotations, deep charcoal #0a0a0a environment with subtle gold #f59e0b price chart accent, white typography elements visible on the dashboard, 16:9, photorealistic, 8K resolution, no text overlays, asra3.com brand aesthetics — dark, premium, minimal, tech-forward. | Cover image |
| 2 | `chebbi-trading-pain-scenario` | Forex trader overwhelmed by multiple chat windows, spreadsheets, and Telegram notifications on three monitors, moody editorial illustration, medium shot with dramatic overhead warm light casting cool blue shadows, frustrated yet focused mood, muted blue-grey palette with stacks of spreadsheet printouts and phone notifications glowing, dark vignette edges, 16:9, high-detail photography and illustration hybrid, asra3.com brand aesthetics — dark, premium, minimal, tech-forward. | §2 "The Problem" |
| 3 | `chebbi-trading-architecture` | Clean system architecture diagram on a deep charcoal #0a0a0a background. Components: Next.js App Router, Prisma ORM, SQLite Database, n8n Workflow Engine, Google Gemini AI, Telegram Bot API, Nginx Reverse Proxy. Components shown as rounded rectangles in dark #1a1a1a with white labels. Data flow shown as emerald green #10b981 directional arrows with subtle glow. User flow from left: Browser → Nginx → Next.js → Prisma → SQLite. Automation flow from bottom: Registration → n8n → Gemini AI → Webhook callback. Section labels in muted grey #888888. No clipart icons — purely geometric shapes. 16:9 format, vector-clean style, minimal, no gradients on boxes. | §2 Tech Stack |
| 4 | `chebbi-trading-metrics-infographic` | Dark-theme before/after metrics infographic on #0a0a0a background. Left column shows BEFORE state: 24h manual verification in muted red #ef4444, scattered Google Sheets, French-only in muted red #ef4444. Right column shows AFTER state: 30s AI verification in emerald green #10b981, unified dashboard in emerald green #10b981, 3 languages in emerald green #10b981. Center divider arrow indicating transformation. Additional circular progress indicators: 1900+ members managed, 4+ years of results digitized, $10/mo total infra cost. White labels, Inter-style typography, clean modern dashboard aesthetic, 16:9, asra3.com brand identity — dark, premium, minimal, tech-forward. | §2 Results |

> **Workflow**: Copy prompt → generate in Midjourney / DALL·E / Firefly → save as `filename.png` → upload → paste URL.

---

## §8 · PROJECT ENTRY

```yaml
# ─── TITLES ──────────────────────────────────────────────────────────────
TITLE_EN:        "Chebbi Trading"
TITLE_AR:        "Chebbi Trading — منصة إشارات فوركس"

# ─── CATEGORY ────────────────────────────────────────────────────────────
CATEGORY_EN:     "Web App"
CATEGORY_AR:     "تطبيق ويب"

# ─── DESCRIPTION (2-3 sharp sentences. Show ROI, not features.) ──────────
DESCRIPTION_EN:  "Built a full-stack trilingual Forex signal platform that replaced 
                  a manual pipeline of Google Sheets and Telegram DMs with AI-powered 
                  deposit verification, real-time results tracking, and a complete admin 
                  dashboard — serving 1,900+ members on a $10/month VPS."
DESCRIPTION_AR:  "بنينا منصة إشارات فوركس ثلاثية اللغات تستبدل خط أنابيب يدوي 
                  من Google Sheets ورسائل تيليجرام بتحقق ذكاء اصطناعي من الإيداعات 
                  وتتبع نتائج لحظي ولوحة تحكم كاملة — تخدم أكثر من 1,900 عضو 
                  بتكلفة $10 شهرياً."

# ─── IMAGE ───────────────────────────────────────────────────────────────
IMAGE_URL:       "/uploads/chebbi-trading-cover.png"

# ─── TAGS (shared with blog tags, tech-focused) ──────────────────────────
TAGS_EN:         ["Next.js", "Prisma", "SQLite", "n8n", "Gemini AI", "Framer Motion"]
TAGS_AR:         ["تداول فوركس", "أتمتة", "ذكاء اصطناعي"]

# ─── METRICS (3-5 items. Use the exact icon names from the list below.) ──
METRICS:
  - icon: Users        value: "1,900+"  label: "Active Members"
  - icon: Zap          value: "30s"     label: "AI Verification Speed"
  - icon: Globe        value: "3"       label: "Languages Supported"
  - icon: DollarSign   value: "$10/mo"  label: "Total Infra Cost"
  - icon: TrendingUp   value: "4+"      label: "Years of Results Digitized"

# ─── SETTINGS ────────────────────────────────────────────────────────────
FEATURED:        true
ACTIVE:          true
ORDER:           2
```

---

## §9 · PROJECT IMAGE PROMPT

```
FILENAME: chebbi-trading-cover.png

PROMPT: "Professional Forex trader reviewing a sleek dark trading dashboard with live gold price charts and green signal indicators glowing on a wide curved monitor, cinematic editorial photography, wide shot rule of thirds with deep-focus background blur showing a dim trading floor, focused confidence mood, cool-blue ambient light from monitor glow with emerald green #10b981 UI highlights and chart annotations, deep charcoal #0a0a0a environment with subtle gold #f59e0b price chart accent, white typography elements visible on the dashboard, 16:9, photorealistic, 8K resolution, no text overlays, asra3.com brand aesthetics — dark, premium, minimal, tech-forward. Format: 16:9 landscape, 1920×1080px. Must work as both a blog cover and a portfolio card thumbnail. The composition should read well when cropped to 4:3."
```
