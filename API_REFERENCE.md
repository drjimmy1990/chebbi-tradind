# 📡 Chebbi Trading — Full API Reference
> **Base URL:** `https://chebbi-trading.com`  
> **Local dev:** `http://localhost:3000`  
> Replace `YOUR_SECRET` with the value set in Admin → Settings → **Webhook Secret**

---

## 🔐 Authentication

There are **two ways** to authenticate:

| Method | Best for | Expires? |
|--------|----------|----------|
| **Webhook Secret** (permanent) | n8n, API automations | ❌ Never |
| **Session token** (temporary) | Manual curl testing | ✅ On server restart |

---

### ✅ Method 1 — Permanent API Key (recommended for n8n)

Use your **Webhook Secret** (set in Admin → Settings → Webhook Secret) — it lives in the database and survives server restarts.

Pass it as a Bearer token:
```bash
curl https://chebbi-trading.com/api/crypto-subscribers \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

Or as a query param (same secret):
```bash
curl "https://chebbi-trading.com/api/members?secret=YOUR_WEBHOOK_SECRET"
```

> ✅ This is what you should use in **n8n HTTP Request nodes**. No login step needed, never expires.

---

### Method 2 — Session Token (temporary, for manual testing)

Login to get a short-lived token. Disappears on server restart.

```bash
# Login — copy the "token" value from the response
curl -X POST https://chebbi-trading.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "YOUR_PASSWORD"}'

# Use it
curl https://chebbi-trading.com/api/crypto-subscribers \
  -H "Authorization: Bearer SESSION_TOKEN_HERE"
```

### Check Session
```bash
curl https://chebbi-trading.com/api/auth \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Logout
```bash
curl -X DELETE https://chebbi-trading.com/api/auth \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 🔑 For n8n — HTTP Request Node Setup

| Field | Value |
|-------|-------|
| **Authentication** | `None` |
| **Send Headers** | ✅ ON |
| **Header Name** | `Authorization` |
| **Header Value** | `Bearer YOUR_WEBHOOK_SECRET` |

That's it. One secret, all endpoints, never expires.

---

## 2. 👥 MEMBERS

### Get All Members *(requires webhook secret)*
```bash
curl "https://chebbi-trading.com/api/members?secret=YOUR_SECRET"
```

### Get Only Pending Members *(waiting for deposit verification)*
```bash
curl "https://chebbi-trading.com/api/members?secret=YOUR_SECRET&status=pending"
```

### Get Only Active Members
```bash
curl "https://chebbi-trading.com/api/members?secret=YOUR_SECRET&status=active"
```

### Get Only Rejected Members
```bash
curl "https://chebbi-trading.com/api/members?secret=YOUR_SECRET&status=rejected"
```

### Create a Member *(admin only)*
```bash
curl -X POST https://chebbi-trading.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Ahmed Ben Ali",
    "email": "ahmed@example.com",
    "xmId": "12345678",
    "status": "pending"
  }'
```

### Update Member Status *(admin only)*
```bash
curl -X PATCH https://chebbi-trading.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "MEMBER_ID_HERE",
    "status": "active"
  }'
```
> `status` can be: `pending` | `active` | `rejected`

---

## 3. 📝 REGISTER *(Public — used by the website form)*

### Register a New Member
```bash
curl -X POST https://chebbi-trading.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Ben Ali",
    "email": "ahmed@example.com",
    "xmId": "12345678"
  }'
```
> After registration, this **automatically fires a webhook** to n8n (if `webhookRegister` is set in Settings).

---

## 4. 🔔 WEBHOOK — Member Status Update *(called by n8n)*

### Approve or Reject a Member After Deposit Verification
```bash
curl -X POST https://chebbi-trading.com/api/webhook/member-status \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEMBER_ID_HERE",
    "status": "active",
    "secret": "YOUR_SECRET"
  }'
```

### Reject a Member
```bash
curl -X POST https://chebbi-trading.com/api/webhook/member-status \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEMBER_ID_HERE",
    "status": "rejected",
    "secret": "YOUR_SECRET"
  }'
```
> `status` can be: `active` | `rejected`  
> Optional: `"proofFile": "/uploads/proof_123.jpg"` — path where n8n saved the screenshot

---

## 5. 📡 SIGNALS

### Get All Signals *(public)*
```bash
curl https://chebbi-trading.com/api/signals
```

### Create a Signal *(admin only)*
```bash
curl -X POST https://chebbi-trading.com/api/signals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "instrument": "XAUUSD",
    "direction": "BUY",
    "entry": "2310.50",
    "takeProfit": "2340.00",
    "stopLoss": "2295.00",
    "result": "open",
    "date": "2026-04-02"
  }'
```
> `direction`: `BUY` | `SELL`  
> `result`: `open` | `+380` | `-150` | etc.

---

## 6. 📋 TRADES

### Get All Trades *(public)*
```bash
curl https://chebbi-trading.com/api/trades
```

### Get Trades Filtered
```bash
# By year
curl "https://chebbi-trading.com/api/trades?year=2026"

# By year + month (0=Jan, 1=Feb, ...)
curl "https://chebbi-trading.com/api/trades?year=2026&month=3"

# Only winning trades
curl "https://chebbi-trading.com/api/trades?result=W"
```

### Create a Trade *(admin only or public — no auth)*
```bash
curl -X POST https://chebbi-trading.com/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 3,
    "contract": "GOLD",
    "period": "1st week April",
    "direction": "BUY",
    "entry": 2310.50,
    "exit": 2340.00,
    "pips": 295,
    "result": "W"
  }'
```
> `result`: `W` (Win) | `L` (Loss) | `BE` (Break Even)

### Delete a Trade *(admin only or public — no auth)*
```bash
curl -X DELETE "https://chebbi-trading.com/api/trades?id=TRADE_ID_HERE"
```

---

## 7. 📈 RESULTS *(computed from trades)*

### Get All Monthly Results *(public)*
```bash
curl https://chebbi-trading.com/api/results
```

### Get Results for a Specific Year
```bash
curl "https://chebbi-trading.com/api/results?year=2026"
```
> Returns `lowRisk` and `mediumRisk` percentages computed automatically from pips.

---

## 8. ₿ CRYPTO VIP — Monthly Performance

### Get All Crypto Monthly Records *(public)*
```bash
curl https://chebbi-trading.com/api/crypto
```

### Add/Update a Monthly Crypto Record *(admin only or public — no auth)*
```bash
curl -X POST https://chebbi-trading.com/api/crypto \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "monthIndex": 3,
    "percentage": 18.5
  }'
```
> `monthIndex`: 0=Jan, 1=Feb, ..., 11=Dec

### Update a Record by ID
```bash
curl -X PUT https://chebbi-trading.com/api/crypto \
  -H "Content-Type: application/json" \
  -d '{
    "id": "RECORD_ID_HERE",
    "percentage": 21.0
  }'
```

### Delete a Crypto Record
```bash
curl -X DELETE "https://chebbi-trading.com/api/crypto?id=RECORD_ID_HERE"
```

---

## 9. 📧 CRYPTO VIP — Email Subscribers

### Subscribe an Email *(public — called by the crypto page form)*
```bash
curl -X POST https://chebbi-trading.com/api/crypto-subscribers \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com"}'
```
> Returns `already_subscribed` message if email exists.

### Get All Subscribers *(admin only)*
```bash
curl https://chebbi-trading.com/api/crypto-subscribers \
  -H "Authorization: Bearer $TOKEN"
```

### Update Subscriber Status *(admin only)*
```bash
curl -X PATCH https://chebbi-trading.com/api/crypto-subscribers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "SUBSCRIBER_ID_HERE",
    "status": "contacted"
  }'
```
> `status`: `new` | `contacted` | `active` | `rejected`

### Delete a Subscriber *(admin only)*
```bash
curl -X DELETE "https://chebbi-trading.com/api/crypto-subscribers?id=SUBSCRIBER_ID_HERE" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 10. ✍️ BLOG ARTICLES

### Get All Articles *(public)*
```bash
curl https://chebbi-trading.com/api/blog
```

### Get Articles by Category *(public)*
```bash
curl "https://chebbi-trading.com/api/blog?category=gold"
```
> Categories: `gold` | `education` | `strategie` | `analyse`

### Create an Article *(admin only)*
```bash
curl -X POST https://chebbi-trading.com/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titleFr": "Mon Article",
    "titleEn": "My Article",
    "titleAr": "مقالتي",
    "excerptFr": "Résumé court",
    "excerptEn": "Short summary",
    "excerptAr": "ملخص قصير",
    "contentFr": "<p>Contenu HTML ici</p>",
    "contentEn": "<p>HTML content here</p>",
    "contentAr": "<p>محتوى هنا</p>",
    "category": "analyse",
    "catLabelFr": "Analyses",
    "catLabelEn": "Analysis",
    "catLabelAr": "تحليلات",
    "date": "2026-04-02",
    "readTime": "5 min",
    "emoji": "📊"
  }'
```

### Update an Article *(admin only)*
```bash
curl -X PUT https://chebbi-trading.com/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "ARTICLE_ID_HERE",
    "titleFr": "Titre mis à jour",
    "views": 150
  }'
```

### Delete an Article *(admin only)*
```bash
curl -X DELETE "https://chebbi-trading.com/api/blog?id=ARTICLE_ID_HERE" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. ❓ FAQ

### Get All FAQs *(public)*
```bash
curl https://chebbi-trading.com/api/faq
```

### Create a FAQ *(admin only)*
```bash
curl -X POST https://chebbi-trading.com/api/faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "questionFr": "Comment ça fonctionne ?",
    "questionEn": "How does it work?",
    "questionAr": "كيف يعمل؟",
    "answerFr": "Voici comment...",
    "answerEn": "Here is how...",
    "answerAr": "إليك الطريقة...",
    "category": "gratuit",
    "icon": "help",
    "order": 1
  }'
```

### Update a FAQ *(admin only)*
```bash
curl -X PUT https://chebbi-trading.com/api/faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "FAQ_ID_HERE",
    "order": 2
  }'
```

### Delete a FAQ *(admin only)*
```bash
curl -X DELETE "https://chebbi-trading.com/api/faq?id=FAQ_ID_HERE" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 12. ⚙️ SETTINGS

### Get All Settings *(public)*
```bash
curl https://chebbi-trading.com/api/settings
```

### Update a Setting *(admin only)*
```bash
curl -X PUT https://chebbi-trading.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"key": "TELEGRAM_URL", "value": "https://t.me/chebbi_trading"}'
```

#### Available Setting Keys
| Key | Description |
|-----|-------------|
| `TELEGRAM_URL` | Telegram group/channel link |
| `YOUTUBE_URL` | YouTube channel link |
| `EMAIL` | Contact email address |
| `XM_LINK_FR` | XM affiliate link for French visitors |
| `XM_LINK_EN` | XM affiliate link for English visitors |
| `XM_LINK_AR` | XM affiliate link for Arabic visitors |
| `webhookSecret` | Shared secret for n8n webhooks |
| `webhookRegister` | n8n webhook URL triggered on registration |
| `siteUrl` | Production site base URL |

---

## 🗂️ Quick Reference Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth` | ❌ | Login |
| `GET` | `/api/auth` | Cookie | Check session |
| `DELETE` | `/api/auth` | Cookie | Logout |
| `GET` | `/api/members?secret=X` | Secret | List members |
| `POST` | `/api/members` | Cookie | Create member |
| `PATCH` | `/api/members` | Cookie | Update member status |
| `POST` | `/api/register` | ❌ | Public registration |
| `POST` | `/api/webhook/member-status` | Secret | Approve/reject via n8n |
| `GET` | `/api/signals` | ❌ | List signals |
| `POST` | `/api/signals` | Cookie | Create signal |
| `GET` | `/api/trades` | ❌ | List trades |
| `POST` | `/api/trades` | ❌ | Create trade |
| `DELETE` | `/api/trades?id=X` | ❌ | Delete trade |
| `GET` | `/api/results` | ❌ | Monthly results |
| `GET` | `/api/crypto` | ❌ | Crypto monthly data |
| `POST` | `/api/crypto` | ❌ | Add/update crypto month |
| `PUT` | `/api/crypto` | ❌ | Update crypto by ID |
| `DELETE` | `/api/crypto?id=X` | ❌ | Delete crypto record |
| `POST` | `/api/crypto-subscribers` | ❌ | Subscribe email |
| `GET` | `/api/crypto-subscribers` | Cookie | List subscribers |
| `PATCH` | `/api/crypto-subscribers` | Cookie | Update subscriber status |
| `DELETE` | `/api/crypto-subscribers?id=X` | Cookie | Delete subscriber |
| `GET` | `/api/blog` | ❌ | List articles |
| `POST` | `/api/blog` | Cookie | Create article |
| `PUT` | `/api/blog` | Cookie | Update article |
| `DELETE` | `/api/blog?id=X` | Cookie | Delete article |
| `GET` | `/api/faq` | ❌ | List FAQs |
| `POST` | `/api/faq` | Cookie | Create FAQ |
| `PUT` | `/api/faq` | Cookie | Update FAQ |
| `DELETE` | `/api/faq?id=X` | Cookie | Delete FAQ |
| `GET` | `/api/settings` | ❌ | Get all settings |
| `PUT` | `/api/settings` | Cookie | Update a setting |

---

*Last updated: April 2026 — Chebbi Trading Platform*
