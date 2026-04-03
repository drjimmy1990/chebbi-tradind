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

**In n8n**, add a **Set** node or an **Edit Fields** node right after your Google Sheets node to ensure the payload matches the database exactly.

### How to handle the Date and Month indexing (Javascript `0` Indexing)
You noticed the note: *"Month in Javascript/Prisma starts at `0` for January. So September is `8`."*
**What this means for you:** Instead of trying to write a complex script to figure out the month from "First week September", you can just tell n8n exactly what month you are importing right now.

In your **Edit Fields** node, manually add two fixed values for the month and year you are importing:
- Add Field `year` ➔ Set to **Number** ➔ Value: `2024`
- Add Field `month` ➔ Set to **Number** ➔ Value: `8` *(8 corresponds to September. October is 9, November is 10, etc.)*

Then, map the rest of your columns from the spreadsheet:
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
  "year": 2024,
  "month": 8,
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

Before inserting, we delete all existing trades for that specific `year` and `month` so we don't end up with duplicate rows when we run the sync multiple times.

Add an **HTTP Request Node** in n8n:
- **Method:** `DELETE`
- **URL:** `https://chebbi-trading.com/api/trades`
- **Authentication:** None needed.
- **Send Query Parameters:** Yes
  - Parameter 1: Name: `year`, Value: `2024`
  - Parameter 2: Name: `month`, Value: `8`

When this node runs, the API will reply with:
`{ "success": true, "count": 25, "message": "Deleted trades for 2024/8" }`

*(Tip: In n8n, for the values of year and month in this node, you can also use `={{ $json.year }}` and `={{ $json.month }}` mapped from the previous Edit Fields node if you prefer).*

---

## Step 3: Bulk Insert the New Data

Next, you will take the full array of rows from your Google Sheet and send them in **one single API call**, letting the server do all the heavy lifting.

Add another **HTTP Request Node** right after the DELETE node:
- **Method:** `POST`
- **URL:** `https://chebbi-trading.com/api/trades`
- **Authentication:** None needed.
- **Send Body:** Yes
- **Body Content Type:** JSON
- **JSON / Body Type:** Expression or Raw
- **Body Expression:** 
  ```json
  ={{ $input.all().map(item => item.json) }}
  ```
  *(This expression takes the entire mapped list of Google Sheet rows inside n8n and converts them into a flat JSON array directly inside the body).*

When this node runs, the server will loop over the array and insert everything instantly:
`{ "count": 25 }` (Returning the count of successfully created rows)

---

## Summary of your pipeline in n8n:
1. **Google Sheets Node** (Read all rows from "September 2024" sheet)
2. **Edit Fields Node** (Map names like `Pip AVG` -> `pips` and set `year` to `2024`, `month` to `8`)
3. **HTTP Request** (DELETE `api/trades?year=2024&month=8`)
4. **HTTP Request** (POST `api/trades` with Body `= {{ $input.all().map(i => i.json) }}` )

Save and execute the workflow, and the live dashboard will immediately reflect the fresh data!
