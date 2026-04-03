# 📡 Chebbi Trading — Full API Reference
> **Base URL:** `https://tawriqa-sys.giize.com`  
> **Local dev:** `http://localhost:3000`

---

## 🔐 Authentication

All protected endpoints use **one permanent key** — your **Webhook Secret** (set in Admin → Settings).

```
Authorization: Bearer YOUR_WEBHOOK_SECRET
```

This key lives in the database and **never expires**, even after server restarts.

---

## 🔑 For n8n — HTTP Request Node Setup

| Field | Value |
|-------|-------|
| **Authentication** | `None` |
| **Send Headers** | ✅ ON |
| **Header Name** | `Authorization` |
| **Header Value** | `Bearer YOUR_WEBHOOK_SECRET` |

---

## 🔔 Outbound Webhooks (to n8n)

The dashboard will automatically fire POST requests to the `webhookRegister` URL you define in the settings panel. These requests are authenticated using the `webhookSecret` you secure the dashboard with.

### Authentication Headers sent to n8n
When your n8n webhook receives a request from Chebbi Trading, it will contain these headers. *(Configure your n8n Webhook node to use Header Auth matching your Webhook Secret)*:
- `Authorization: Bearer YOUR_WEBHOOK_SECRET`
- `x-webhook-secret: YOUR_WEBHOOK_SECRET`

### Event: `new_registration`
Fired when a user successfully submits the registration form on the site.
```json
{
  "event": "new_registration",
  "memberId": "cuid_database_id_here",
  "name": "Ahmed Ben Ali",
  "email": "ahmed@example.com",
  "xmId": "12345678",
  "createdAt": "2026-04-02T20:10:00.000Z",
  "proofBase64": "data:image/png;base64,iVBOR...",
  "proofFilename": "deposit.png",
  "callbackUrl": "https://tawriqa-sys.giize.com/api/webhook/member-status"
}
```

### Event: `member_approved`
Fired when you click the **Approve** button in the Admin Dashboard.
```json
{
  "event": "member_approved",
  "id": "cuid_database_id_here",
  "xmId": "12345678",
  "email": "ahmed@example.com"
}
```

---

## 1. 🔑 AUTH *(Admin login — only needed for manual testing)*

### Login
```bash
curl -X POST https://tawriqa-sys.giize.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "YOUR_PASSWORD"}'
```
Response includes a `token` you can also use as a Bearer token (short-lived, lost on restart).

### Check Session
```bash
curl https://tawriqa-sys.giize.com/api/auth \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Logout
```bash
curl -X DELETE https://tawriqa-sys.giize.com/api/auth \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 2. 👥 MEMBERS

### Get All Members
```bash
curl https://tawriqa-sys.giize.com/api/members \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Get Only Pending Members *(waiting for deposit verification)*
```bash
curl "https://tawriqa-sys.giize.com/api/members?status=pending" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Get Only Active Members
```bash
curl "https://tawriqa-sys.giize.com/api/members?status=active" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Get Only Rejected Members
```bash
curl "https://tawriqa-sys.giize.com/api/members?status=rejected" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Create a Member *(admin only)*
```bash
curl -X POST https://tawriqa-sys.giize.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "name": "Ahmed Ben Ali",
    "email": "ahmed@example.com",
    "xmId": "12345678",
    "status": "pending"
  }'
```

### Update Member Status
```bash
curl -X PATCH https://tawriqa-sys.giize.com/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
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
curl -X POST https://tawriqa-sys.giize.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Ben Ali",
    "email": "ahmed@example.com",
    "xmId": "12345678"
  }'
```
> After registration, this **automatically fires a webhook** to n8n (if `webhookRegister` is configured in Settings).

---

## 4. 🔔 WEBHOOK — Member Status Update *(called by n8n)*

### Approve a Member After Deposit Verification
```bash
curl -X POST https://tawriqa-sys.giize.com/api/webhook/member-status \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEMBER_ID_HERE",
    "status": "active",
    "secret": "YOUR_WEBHOOK_SECRET"
  }'
```

### Reject a Member
```bash
curl -X POST https://tawriqa-sys.giize.com/api/webhook/member-status \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "MEMBER_ID_HERE",
    "status": "rejected",
    "secret": "YOUR_WEBHOOK_SECRET"
  }'
```
> `status` can be: `active` | `rejected`  
> Optional field: `"proofFile": "/uploads/proof_123.jpg"`

---

## 5. 📡 SIGNALS

### Get All Signals *(public)*
```bash
curl https://tawriqa-sys.giize.com/api/signals
```

### Create a Signal
```bash
curl -X POST https://tawriqa-sys.giize.com/api/signals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
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
curl https://tawriqa-sys.giize.com/api/trades
```

### Get Trades Filtered *(public)*
```bash
# By year
curl "https://tawriqa-sys.giize.com/api/trades?year=2026"

# By year + month (0=Jan, 1=Feb, ...)
curl "https://tawriqa-sys.giize.com/api/trades?year=2026&month=3"

# Only winning trades
curl "https://tawriqa-sys.giize.com/api/trades?result=W"
```

### Create a Trade *(no auth required)*
```bash
curl -X POST https://tawriqa-sys.giize.com/api/trades \
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

### Delete a Trade *(no auth required)*
```bash
curl -X DELETE "https://tawriqa-sys.giize.com/api/trades?id=TRADE_ID_HERE"
```

---

## 7. 📈 RESULTS *(computed from trades — public)*

### Get All Monthly Results
```bash
curl https://tawriqa-sys.giize.com/api/results
```

### Get Results for a Specific Year
```bash
curl "https://tawriqa-sys.giize.com/api/results?year=2026"
```
> Returns `lowRisk` and `mediumRisk` percentages computed automatically from pips.

---

## 8. ₿ CRYPTO VIP — Monthly Performance

### Get All Crypto Monthly Records *(public)*
```bash
curl https://tawriqa-sys.giize.com/api/crypto
```

### Add/Update a Monthly Crypto Record(s) *(Bulk n8n support)*
```bash
curl -X POST https://tawriqa-sys.giize.com/api/crypto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '[
      {
        "year": 2026,
        "monthIndex": 3,
        "percentage": 18.5
      }
    ]'
```
> `monthIndex`: 0=Jan, 1=Feb, ..., 11=Dec.  
> You can also pass `?year=2026` in the URL to apply it to an entire array automatically.

### Update a Record by ID
```bash
curl -X PUT https://tawriqa-sys.giize.com/api/crypto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "id": "RECORD_ID_HERE",
    "percentage": 21.0
  }'
```

### Delete Crypto Record(s)
```bash
# Delete by ID
curl -X DELETE "https://tawriqa-sys.giize.com/api/crypto?id=RECORD_ID_HERE" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"

# Bulk Delete by Year and Month (Used for n8n syncing)
curl -X DELETE "https://tawriqa-sys.giize.com/api/crypto?year=2026&month=3" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"

# Bulk Delete Entire Year
curl -X DELETE "https://tawriqa-sys.giize.com/api/crypto?year=2026" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 9. 📧 CRYPTO VIP — Email Subscribers

### Subscribe an Email *(public — called by the crypto page form)*
```bash
curl -X POST https://tawriqa-sys.giize.com/api/crypto-subscribers \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com"}'
```
> Returns `already_subscribed` message if email exists.

### Get All Subscribers
```bash
curl https://tawriqa-sys.giize.com/api/crypto-subscribers \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### Update Subscriber Status
```bash
curl -X PATCH https://tawriqa-sys.giize.com/api/crypto-subscribers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "id": "SUBSCRIBER_ID_HERE",
    "status": "contacted"
  }'
```
> `status`: `new` | `contacted` | `active` | `rejected`

### Delete a Subscriber
```bash
curl -X DELETE "https://tawriqa-sys.giize.com/api/crypto-subscribers?id=SUBSCRIBER_ID_HERE" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 10. ✍️ BLOG ARTICLES

### Get All Articles *(public)*
```bash
curl https://tawriqa-sys.giize.com/api/blog
```

### Get Articles by Category *(public)*
```bash
curl "https://tawriqa-sys.giize.com/api/blog?category=gold"
```
> Categories: `gold` | `education` | `strategie` | `analyse`

### Create an Article
```bash
curl -X POST https://tawriqa-sys.giize.com/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
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

### Update an Article
```bash
curl -X PUT https://tawriqa-sys.giize.com/api/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "id": "ARTICLE_ID_HERE",
    "titleFr": "Titre mis à jour",
    "views": 150
  }'
```

### Delete an Article
```bash
curl -X DELETE "https://tawriqa-sys.giize.com/api/blog?id=ARTICLE_ID_HERE" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 11. ❓ FAQ

### Get All FAQs *(public)*
```bash
curl https://tawriqa-sys.giize.com/api/faq
```

### Create a FAQ
```bash
curl -X POST https://tawriqa-sys.giize.com/api/faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
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

### Update a FAQ
```bash
curl -X PUT https://tawriqa-sys.giize.com/api/faq \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "id": "FAQ_ID_HERE",
    "order": 2
  }'
```

### Delete a FAQ
```bash
curl -X DELETE "https://tawriqa-sys.giize.com/api/faq?id=FAQ_ID_HERE" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

---

## 12. ⚙️ SETTINGS

### Get All Settings *(public)*
```bash
curl https://tawriqa-sys.giize.com/api/settings
```

### Update a Setting
```bash
curl -X PUT https://tawriqa-sys.giize.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
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
| `webhookSecret` | Permanent API key for all protected endpoints |
| `webhookRegister` | n8n webhook URL triggered on registration |
| `siteUrl` | Production site base URL |

---

## 🗂️ Quick Reference Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth` | ❌ Public | Login |
| `GET` | `/api/auth` | Bearer | Check session |
| `DELETE` | `/api/auth` | Bearer | Logout |
| `GET` | `/api/members` | Bearer | List members |
| `GET` | `/api/members?status=pending` | Bearer | List pending members |
| `POST` | `/api/members` | Bearer | Create member |
| `PATCH` | `/api/members` | Bearer | Update member status |
| `POST` | `/api/register` | ❌ Public | Public registration |
| `POST` | `/api/webhook/member-status` | Body secret | Approve/reject via n8n |
| `GET` | `/api/signals` | ❌ Public | List signals |
| `POST` | `/api/signals` | Bearer | Create signal |
| `GET` | `/api/trades` | ❌ Public | List trades |
| `POST` | `/api/trades` | ❌ Public | Create trade |
| `DELETE` | `/api/trades?id=X` | ❌ Public | Delete trade |
| `GET` | `/api/results` | ❌ Public | Monthly results |
| `GET` | `/api/crypto` | ❌ Public | Crypto monthly data |
| `POST` | `/api/crypto` | Bearer | Add/bulk-insert crypto month |
| `PUT` | `/api/crypto` | Bearer | Update crypto by ID |
| `DELETE` | `/api/crypto?id=X` | Bearer | Delete crypto record |
| `POST` | `/api/crypto-subscribers` | ❌ Public | Subscribe email |
| `GET` | `/api/crypto-subscribers` | Bearer | List subscribers |
| `PATCH` | `/api/crypto-subscribers` | Bearer | Update subscriber status |
| `DELETE` | `/api/crypto-subscribers?id=X` | Bearer | Delete subscriber |
| `GET` | `/api/blog` | ❌ Public | List articles |
| `POST` | `/api/blog` | Bearer | Create article |
| `PUT` | `/api/blog` | Bearer | Update article |
| `DELETE` | `/api/blog?id=X` | Bearer | Delete article |
| `GET` | `/api/faq` | ❌ Public | List FAQs |
| `POST` | `/api/faq` | Bearer | Create FAQ |
| `PUT` | `/api/faq` | Bearer | Update FAQ |
| `DELETE` | `/api/faq?id=X` | Bearer | Delete FAQ |
| `GET` | `/api/settings` | ❌ Public | Get all settings |
| `PUT` | `/api/settings` | Bearer | Update a setting |

---

*Last updated: April 2026 — Chebbi Trading Platform*
