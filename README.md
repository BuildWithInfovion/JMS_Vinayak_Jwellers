# Infovion JMS — Jewellery Management Software

Billing by weight, purity and making charges · GST invoices · old-gold exchange · girvi (gold loans) · udhaar · stock · reports · **Tally export for the CA**.

Built by [Infovion Technologies](https://www.infovion.in/jewellery-management-software), Pune.

| Part | Stack | Folder |
|------|-------|--------|
| Web app | React 19, Vite, Tailwind CSS, jsPDF | `jms-frontend/` |
| API | Node.js 20, Express 5, MongoDB (Mongoose), JWT | `jms-backend/` |

One codebase, one deployment per shop: everything shop-specific comes from environment variables.

---

## What's new in v2

**Security**
- Password reset no longer hands a reset token to anyone who knows a username. Self-service reset now needs the shop's **recovery key** (`RECOVERY_KEY`); without it, reset is switched off.
- The owner can set a new password for any staff member (Settings → Staff passwords).
- The API refuses to start without `JWT_SECRET` (there is no default secret any more).
- Login and reset attempts are rate-limited; customer data is no longer written to the server log.
- Optional `ALLOWED_ORIGINS` limits which websites may call the API.

**Billing & GST**
- GST is charged on the full value of the jewellery, making charges included — 3% by default, as the CBIC's FAQ on gems and jewellery states. Rates are configurable (`VITE_GST_METAL_RATE`, `VITE_GST_MAKING_RATE`) — **confirm with the shop's CA before going live**.
- A discount shown on the invoice is applied **before** GST (CGST Act s.15(3)).
- **Invoices made before v2 are not changed**: reprints and the Tally export keep their original layout and tax split. Each new sale stores its tax method (`taxMode: "v2"`) and rates.
- One shared calculation (`jms-frontend/src/utils/billing.js`) for the cart, invoice, print, PDF and WhatsApp.
- **HUID** (hallmark unique ID) can be entered per line at billing and is printed on the invoice.
- Adding an item to the bill now defaults to the weight of **one piece**, not the whole stock's weight.
- Stock weight is reduced correctly when several pieces of the same item are sold.

**Girvi (gahan)**
- "Interest to date" column (simple monthly interest counted by days).
- Release dialog shows principal + interest due; the owner confirms the interest actually received, which is stored with the record.

**Udhaar**
- Payments record how they were paid (Cash, UPI, Card, Bank transfer, Cheque).

**For the CA — Reports → Export for your CA**
- Tally XML for TallyPrime: **ledgers** (Import → Masters) and **vouchers** (Import → Transactions).
  - Sales vouchers with CGST/SGST; cash sales to the Cash ledger, credit sales to a customer ledger under Sundry Debtors.
  - Receipts for advances/old gold on credit sales, udhaar payments (cash or bank) and girvi releases (principal + interest income).
  - Payments for girvi loans given.
  - Every voucher is checked to balance before export.
- Excel (CSV) **sales register** with taxable value, CGST, SGST, invoice value, balance and HUIDs, and a **girvi register**.
- Ledger names are editable in Settings → Tally ledgers so they match the CA's books.

**Productisation**
- Shop name, local-script name, logo, tagline, owner and address all come from environment variables (sidebar, login, invoices, girvi receipts).
- Page titles in the top bar; "Powered by Infovion JMS".

---

## Environment variables

### API (`jms-backend`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGO_URI` | yes | MongoDB connection string (replica set — sales use transactions) |
| `JWT_SECRET` | yes | Long random secret for login tokens. The API will not start without it. |
| `RECOVERY_KEY` | recommended | Secret the owner uses to reset a forgotten password from the login page. Leave empty to disable self-service reset. |
| `ALLOWED_ORIGINS` | optional | Comma-separated list of web app URLs allowed to call the API |
| `GIRVI_MIN_DAYS` | optional | Minimum days of interest charged on a pledge (default 0) |
| `PORT` | optional | Default 5001 |

### Web app (`jms-frontend`)

| Variable | Purpose |
|----------|---------|
| `VITE_PROD_API_URL` | API URL in production |
| `VITE_SHOP_NAME` | Shop name on invoices and login |
| `VITE_SHOP_NAME_LOCAL` | Name shown in the sidebar (e.g. in Marathi); empty = use `VITE_SHOP_NAME` |
| `VITE_SHOP_LOGO` | Logo path or URL (PNG), default `/VJ.png` |
| `VITE_SHOP_TAGLINE` | Line under the shop name on invoices; empty hides it |
| `VITE_SHOP_ADDRESS`, `VITE_OWNER_NAME`, `VITE_OWNER_MOBILE` | Letterhead |
| `VITE_GST_NUMBER`, `VITE_ENABLE_GST` | GSTIN and default GST setting |
| `VITE_GST_METAL_RATE`, `VITE_GST_MAKING_RATE` | Total GST % on metal value and on making charges (default 3 and 3) |

---

## Upgrading an existing shop from v1

1. **Set `RECOVERY_KEY`** on the API host (e.g. Render) and give it to the owner privately. Keep `JWT_SECRET` as it is (changing it logs everyone out).
2. **Confirm GST rates with the shop's CA.** v2 charges 3% on making charges (v1 charged 5%). If the CA wants a different split, set `VITE_GST_MAKING_RATE`.
3. **Check the girvi receipt header.** v1 printed a fixed "Vinayak Jewellers, Gangakhed" / "Prop. Vinayak D. Dishe"; v2 uses `VITE_SHOP_NAME`, `VITE_OWNER_NAME` and `VITE_OWNER_MOBILE`. Set them to exactly what the receipt should show.
4. Deploy the API first, then the web app. Existing sales, girvi and udhaar records need no migration.
5. With the CA: fill in Settings → Tally ledgers, export one month, and import it into a test company in TallyPrime before using it on the live books.

## Demo store for sales

Point `MONGO_URI` at an **empty** database whose name contains `demo` (e.g. `jms_demo`) and run `npm run seed:demo` in `jms-backend`. It refuses any other database. Deploy the web app with demo branding (`VITE_SHOP_NAME="Shree Demo Jewellers"`, `VITE_SHOP_NAME_LOCAL=""`, …) on its own URL, e.g. `jms-demo.infovion.in`. Logins: `owner` / `demo123` and `counter1` / `demo123` — change them if the demo is public.

## Running locally

```bash
cd jms-backend && npm install && npm run dev      # needs MONGO_URI, JWT_SECRET in .env
cd jms-frontend && npm install && npm run dev     # http://localhost:5173, API at http://localhost:5001
```
