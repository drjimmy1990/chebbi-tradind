# n8n Workflow Guide: Syncing Monthly Results from Google Sheets

To support efficiently syncing your results from Google Sheets via n8n without hitting API limits, I have updated your application API to support **Bulk Deletion** and **Bulk Insertion**. 

You now only need **two HTTP Request nodes** in n8n.

---

## Step 0: Backup Your Existing Database (Highly Recommended)

Before making any big data imports, it's always smart to back up the data. Because your system uses **SQLite**, taking a backup is incredibly simple—you just copy a single file.

**Option A: Using aaPanel (Visual Interface)**
1. Log in to your aaPanel dashboard.
2. Go to **Files** and navigate to your project folder: `/www/wwwroot/chebbi-trading/prisma/`
3. Select your database file (typically named `dev.db` or `chebbi.db`).
4. Click **Copy** in the top menu, then paste it in the same folder.
5. Rename the copied file to something like `dev_backup_sept.db`.

**Option B: Using the Terminal (SSH)**
If you are logged into your server via SSH, run these commands:
```bash
cd /www/wwwroot/chebbi-trading/prisma/
cp dev.db dev_backup_sept.db
```
*(If your backup is safe, you can proceed with confidence knowing you can revert instantly by removing `dev.db` and renaming the backup back to `dev.db`)*

---

## Step 1: Prepare the Google Sheets Data

From your provided JSON, n8n correctly extracts your Google Sheet rows. Before hitting the Chebbi Trading API, n8n must map those columns to what the API expects.

**In n8n**, add an **Edit Fields (Set)** node right after your Google Sheets node to map your spreadsheet names:
- Map `Contract` -> `contract`
- Map `Date` -> `period`
- Map `Long Short` -> `direction`
- Map `Entry Price` -> `entry`
- Map `Exit Price` -> `exit`
- Map `Pip AVG` -> `pips`
- Map `W/L/BE` -> `result`

Your mapping should produce a JSON array where *every item* looks exactly like this:
```json
{
  "contract": "GOLD",
  "period": "First week September",
  "direction": "SELL",
  "entry": 0,
  "exit": 0,
  "pips": 60,
  "result": "W"
}
```

---

## Step 2: Clear the Month's Data

Before inserting, we delete all existing trades for that specific month so we don't end up with duplicate rows when we run the sync multiple times.

Add an **HTTP Request Node** in n8n:
- **Method:** `DELETE`
- **URL:** `https://chebbi-trading.com/api/trades`
- **Authentication:** None *(We will use Header Auth manually)*
- **Send Headers:** Yes
  - Name: `Authorization`
  - Value: `Bearer YOUR_WEBHOOK_SECRET` *(The same webhook secret set in your database site settings, e.g., the one n8n uses for registration)*
- **Send Query Parameters:** Yes
  - Parameter 1: Name: `year`, Value: `2024`
  - Parameter 2: Name: `month`, Value: `8` *(8 corresponds to September. October is 9, November is 10, etc.)*

When this node runs, the API will reply with:
`{ "success": true, "count": 25, "message": "Deleted trades for 2024/8" }`

---

## Step 3: Bulk Insert the New Data

Next, you will take the full array of rows from your Google Sheet and send them in **one single API call** via an HTTP Request.

*(Note: We have updated the server to automatically figure out the year and month if you just pass them in the URL! This prevents the `500` error you got when mapping arrays).*

Add another **HTTP Request Node** right after the DELETE node:
- **Method:** `POST`
- **URL:** `https://chebbi-trading.com/api/trades`
- **Authentication:** None *(We will use Header Auth manually)*
- **Send Headers:** Yes
  - Name: `Authorization`
  - Value: `Bearer YOUR_WEBHOOK_SECRET`
- **Send Query Parameters:** Yes
  - Parameter 1: Name: `year`, Value: `2024`
  - Parameter 2: Name: `month`, Value: `8`
- **Send Body:** Yes
- **Body Content Type:** JSON
- **JSON / Body Type:** Expression or Raw
- **Body Expression:** 
  ```json
  ={{ $input.all().map(item => item.json) }}
  ```
  *(This expression takes the entire mapped list of Google Sheet rows inside n8n and converts them into a flat JSON array directly inside the body).*

When this node runs, the server will loop over the array, assign the year and month from the URL, and insert everything instantly:
`{ "count": 25 }` (Returning the count of successfully created rows)

---

## Summary of your pipeline in n8n:
1. **Google Sheets Node** (Read all rows from "September 2024" sheet)
2. **Edit Fields Node** (Map names like `Pip AVG` -> `pips`)
3. **HTTP Request** (DELETE `api/trades?year=2024&month=8` with Auth Header)
4. **HTTP Request** (POST `api/trades?year=2024&month=8` with Body `= {{ $input.all().map(i => i.json) }}` and Auth Header)

Save and execute the workflow, and the live dashboard will immediately reflect the fresh data!

---

## Ready-to-Use CURL Commands

If you want to test the API directly from your terminal or another script instead of n8n, here are the ready-to-use `curl` commands. *(Make sure to replace `YOUR_WEBHOOK_SECRET` with the actual secret from your database `SiteSetting` object).*

### 1. CURL to Delete All Trades for a Month
This instantly clears out all trades for September 2024:
```bash
curl -X DELETE "https://chebbi-trading.com/api/trades?year=2024&month=8" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### 2. CURL to Bulk Insert Multiple Trades At Once
The `POST` API has been explicitly upgraded to **accept an array (`[ ]`)**. This is how you import many items at once! You just send one massive JSON array containing all 100+ trades in a single request, and the server inserts them all in one operation. 

Notice how we append `?year=2024&month=8` to the URL. This will apply to every row in the array automatically.

```bash
curl -X POST "https://chebbi-trading.com/api/trades?year=2024&month=8" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
     -d '[
          {
            "contract": "GBPJPY",
            "period": "First week September",
            "direction": "BUY",
            "entry": 0,
            "exit": 0,
            "pips": -60,
            "result": "L"
          },
          {
            "contract": "GOLD",
            "period": "First week September",
            "direction": "BUY",
            "entry": 0,
            "exit": 0,
            "pips": 50,
            "result": "W"
          }
        ]'
```
*(Notice the `[` and `]` wrapping the items. This tells the API "here are many items, insert them all at once!").*

---

## Ready-to-Use CURL Commands for Crypto VIP

You can also bulk-sync your Crypto VIP performance data using the upgraded `/api/crypto` endpoint. It works exactly like the regular trades endpoint and requires the same `webhookSecret` for security.

### 1. CURL to Delete All Crypto Results for a Month
Delete an entire month for a specific year (Used heavily in n8n loops):
```bash
curl -X DELETE "https://chebbi-trading.com/api/crypto?year=2026&month=1" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

Delete an entire year at once:
```bash
curl -X DELETE "https://chebbi-trading.com/api/crypto?year=2026" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
```

### 2. CURL to Bulk Insert Crypto Results
Pass a massive JSON array of monthly items. Just like the general trades, the backend supports `year` and `monthIndex` parameters inside the JSON payload.

```bash
curl -X POST "https://chebbi-trading.com/api/crypto" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
     -d '[
          {
            "year": 2026,
            "monthIndex": 0,
            "percentage": 5.2
          },
          {
            "year": 2026,
            "monthIndex": 1,
            "percentage": -1.5
          },
          {
            "year": 2026,
            "monthIndex": 2,
            "percentage": 8.0
          }
        ]'
```
