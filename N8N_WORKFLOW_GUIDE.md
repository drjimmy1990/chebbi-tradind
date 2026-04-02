# 🤖 N8N AI Deposit Verification Workflow Guide
> **Chebbi Trading Platform** — Automated member activation via AI deposit screenshot analysis

---

## 📋 Overview

When a new member registers and sends a screenshot of their XM deposit, this n8n workflow will:

1. Receive the image via Telegram bot
2. Send it to Google Gemini AI for analysis
3. Decide: **approve** or **reject** the member
4. Call the Chebbi Trading API to update the member's status
5. Notify the member with the result via Telegram

---

## 🔗 API Endpoint Reference

### `POST /api/webhook/member-status`

**Base URL:** `https://chebbi-trading.com/api/webhook/member-status`

**Description:** Called by n8n to approve or reject a member after AI verifies their deposit screenshot.

**Authentication:** Shared secret set in the Admin Dashboard → Settings → Webhook Secret

#### Request Body

```json
{
  "memberId": "clxxxxxxxxxxxxxxxx",
  "status": "active",
  "secret": "YOUR_WEBHOOK_SECRET",
  "proofFile": "/uploads/proof_123.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `memberId` | string | ✅ | The member's database ID (from the Members table) |
| `status` | string | ✅ | Either `"active"` (approved) or `"rejected"` |
| `secret` | string | ✅ | Must match the `webhookSecret` value in Admin → Settings |
| `proofFile` | string | ❌ | Path to the saved screenshot file on the VPS |

#### Response Examples

**Success:**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxxxx",
    "name": "Ahmed Ben Ali",
    "status": "active"
  }
}
```

**Error — wrong secret:**
```json
{ "error": "Invalid secret" }
```
*(HTTP 401)*

**Error — invalid status:**
```json
{ "error": "status must be 'active' or 'rejected'" }
```
*(HTTP 400)*

---

## 🏗️ N8N Workflow: Step-by-Step

### Workflow: `AI Deposit Verification`

```
[Telegram Trigger] → [Get Member from DB] → [Download Image] 
      → [Gemini AI Analysis] → [IF: Approved?]
           ├── YES → [Call /api/webhook/member-status {active}] → [Notify Client ✅]
           └── NO  → [Call /api/webhook/member-status {rejected}] → [Notify Client ❌]
```

---

### Step 1 — Telegram Bot Trigger

**Node type:** `Telegram Trigger`

- **Event:** `message`
- **Filter:** Only accept messages with a **photo** attachment
- The member sends a screenshot of their XM deposit to the bot

**Important:** Tell clients to also send their **Member ID** as the caption of the image.
Format: `ID: clxxxxxxxxxxxxxxxx`

---

### Step 2 — Extract Member ID from Caption

**Node type:** `Code` (JavaScript)

```javascript
const caption = $json.message?.caption || '';
const match = caption.match(/ID:\s*([a-z0-9]+)/i);

if (!match) {
  throw new Error('No member ID found in caption');
}

return { memberId: match[1].trim() };
```

---

### Step 3 — Download the Deposit Screenshot

**Node type:** `HTTP Request`

- **Method:** `GET`
- **URL:** `https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/getFile?file_id={{ $('Telegram Trigger').item.json.message.photo.last.file_id }}`

Then a second request to download the actual file:

- **Method:** `GET`
- **URL:** `https://api.telegram.org/file/bot{{ $env.TELEGRAM_BOT_TOKEN }}/{{ $json.result.file_path }}`
- **Response Format:** `File`

---

### Step 4 — Gemini AI Analysis

**Node type:** `HTTP Request` (calls Google Gemini Vision API)

- **Method:** `POST`
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}`
- **Headers:** `Content-Type: application/json`

**Body (JSON):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "You are a financial verification assistant for a Forex trading platform. Analyze this XM broker deposit screenshot and determine if it shows a valid deposit of at least $100 USD (or equivalent). Respond with ONLY one of these exact words: APPROVED or REJECTED. If the image is blurry, fake, edited, does not show XM platform, or the amount is less than $100, respond REJECTED."
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "{{ $binary.data.toString('base64') }}"
          }
        }
      ]
    }
  ]
}
```

**Extract the response:**

Add a `Code` node after this:
```javascript
const text = $json.candidates[0].content.parts[0].text.trim().toUpperCase();
const approved = text.includes('APPROVED');
return { aiDecision: approved ? 'active' : 'rejected', rawResponse: text };
```

---

### Step 5 — IF Node: Approved?

**Node type:** `IF`

- **Condition:** `{{ $json.aiDecision }}` equals `active`
- **True branch** → Approve the member
- **False branch** → Reject the member

---

### Step 6A — Approve: Call Webhook

**Node type:** `HTTP Request`

- **Method:** `POST`
- **URL:** `https://chebbi-trading.com/api/webhook/member-status`
- **Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "memberId": "{{ $('Extract Member ID').item.json.memberId }}",
  "status": "active",
  "secret": "{{ $env.CHEBBI_WEBHOOK_SECRET }}"
}
```

---

### Step 6B — Reject: Call Webhook

Same node setup, but with `"status": "rejected"`:

```json
{
  "memberId": "{{ $('Extract Member ID').item.json.memberId }}",
  "status": "rejected",
  "secret": "{{ $env.CHEBBI_WEBHOOK_SECRET }}"
}
```

---

### Step 7A — Notify Client: APPROVED ✅

**Node type:** `Telegram`

- **Chat ID:** `{{ $('Telegram Trigger').item.json.message.from.id }}`
- **Text:**
```
✅ *Félicitations !*

Votre dépôt XM a été vérifié avec succès.
Votre compte est maintenant *ACTIF*.

Vous serez ajouté au groupe VIP dans les prochaines heures.
Bienvenue dans la communauté Chebbi Trading ! 🚀
```

---

### Step 7B — Notify Client: REJECTED ❌

**Node type:** `Telegram`

- **Chat ID:** `{{ $('Telegram Trigger').item.json.message.from.id }}`
- **Text:**
```
❌ *Vérification échouée*

Nous n'avons pas pu vérifier votre dépôt XM.

Raisons possibles :
• L'image est floue ou illisible
• Le montant est inférieur à $100
• La plateforme XM n'est pas visible
• L'image a été modifiée

Veuillez renvoyer une capture claire de votre dépôt.
```

---

## 🔐 N8N Environment Variables (Credentials)

Set these in **N8N → Settings → Environment Variables** or as **N8N Credentials**:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `GEMINI_API_KEY` | Your Google AI Studio API key |
| `CHEBBI_WEBHOOK_SECRET` | The secret set in Admin Dashboard → Settings → Webhook |

---

## ⚙️ Admin Dashboard Setup

1. Go to `/admin` → Login
2. Navigate to **⚙️ Settings**
3. In the **Webhook Secret** field, enter a strong random string (e.g. `MyS3cr3tW3bh00k!2025`)
4. Save — this is the value you put in `CHEBBI_WEBHOOK_SECRET` in n8n

---

## 📡 Member Registration Flow (Client Side)

```
Client fills form on website
        ↓
Member created in DB with status: "pending"
        ↓
Admin dashboard shows member in "👥 Members" (with 🔔 badge)
        ↓
Client sends Telegram message to bot:
  📸 [XM Deposit Screenshot]
  Caption: "ID: clxxxxxxxxxxxxxxxx"
        ↓
n8n AI Workflow runs automatically
        ↓
Status updated → "active" or "rejected"
        ↓
Client gets Telegram notification
```

---

## 🧪 Testing the Endpoint

You can test the webhook directly with curl (or Postman):

```bash
curl -X POST https://chebbi-trading.com/api/webhook/member-status \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "PASTE_A_REAL_MEMBER_ID_HERE",
    "status": "active",
    "secret": "YOUR_WEBHOOK_SECRET"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": { "id": "...", "name": "...", "status": "active" }
}
```

---

## 🗺️ Summary Architecture

```
Client (Telegram)
    │
    │ sends deposit screenshot + Member ID caption
    ▼
Telegram Bot (n8n trigger)
    │
    │ downloads image
    ▼
Google Gemini AI (Vision)
    │
    │ APPROVED / REJECTED
    ▼
POST /api/webhook/member-status
    │  { memberId, status: "active"|"rejected", secret }
    ▼
Chebbi Trading Database (SQLite via Prisma)
    │
    │ member.status updated
    ▼
Admin Dashboard (👥 Members tab reflects new status)
    +
Telegram notification sent back to client
```

---

*Last updated: April 2026 — Chebbi Trading Platform*
