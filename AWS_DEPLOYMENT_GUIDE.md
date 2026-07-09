# Ubuntu Cafe & Lounge — AWS Deployment & Backend Integration Guide

This document is the handover reference between the frontend team and the
infrastructure team. It covers three things:

1. The **system architecture** this frontend was built to plug into
2. **Full project documentation** — stack, file structure, and the exact
   data contract the backend needs to implement
3. A **phased checklist** for provisioning AWS, wiring the frontend to it,
   and deploying via AWS Amplify

> **Status today:** The frontend is production-ready and fully functional
> against **simulated data**. No AWS resources exist yet. Every network call
> lives in one file — `src/utils/api.js` — so none of this requires touching
> component code.

---

## 1. System Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                              END USER — BROWSER                          │
│            Customer (Order Online)   /   Owner (Admin Dashboard)         │
└──────────────────────────────────────┬───────────────────────────────────┘
                                        │  HTTPS
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    STATIC FRONTEND HOSTING (pick one)                    │
│                                                                          │
│   ┌────────────────────────┐        ┌───────────────────────────────┐   │
│   │   AWS AMPLIFY HOSTING   │  -or-  │  AMAZON S3 (static website)    │   │
│   │  (Git-based CI/CD)      │        │      + AMAZON CLOUDFRONT (CDN) │   │
│   └────────────────────────┘        └───────────────────────────────┘   │
│                                                                          │
│        Next.js static export — `next build` → flat `/out` folder        │
│        (next.config.js: output: 'export', images: unoptimized)          │
└──────────────────────────────────────┬───────────────────────────────────┘
                                        │
                                        │  Client-side fetch() calls,
                                        │  all issued from src/utils/api.js
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    AMAZON API GATEWAY (REST or HTTP API)                 │
│                                                                          │
│   POST   /orders             ───────────────────────┐                   │
│   GET    /orders             ───────────────────────┤                   │
│   PATCH  /orders/{orderId}   ───────────────────────┤                   │
│                                                       │                  │
│   (NEXT_PUBLIC_AWS_API_URL points the frontend here) │                  │
└───────────────────────────────────────────────────────┼──────────────────┘
                                                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           AWS LAMBDA (Node.js)                           │
│                                                                          │
│   createOrder(event)        ◄── invoked by  POST   /orders               │
│   listOrders(event)         ◄── invoked by  GET    /orders               │
│   updateOrderStatus(event)  ◄── invoked by  PATCH   /orders/{orderId}     │
└──────────────────────────────────────┬───────────────────────────────────┘
                                        │
                                        │  AWS SDK v3 — DynamoDBDocumentClient
                                        │  PutCommand / ScanCommand / UpdateCommand
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   AMAZON DYNAMODB — "UbuntuCafeOrders" TABLE             │
│                                                                          │
│   Partition key: orderId (String)                                       │
│   Attributes: customer, items, subtotal, fulfillment, status,           │
│               receivedAt                                                │
└──────────────────────────────────────┬───────────────────────────────────┘
                                        │
                                        │  Async, fire-and-forget —
                                        │  does NOT block the API response
                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              AMAZON SES — Order Confirmation Email (optional)           │
│         Triggered from inside createOrder Lambda after a               │
│         successful DynamoDB write, sent to customer.email                │
└──────────────────────────────────────────────────────────────────────────┘
```

**Reading the diagram, hop by hop:**

| # | Hop | Protocol / Method | Notes |
|---|-----|--------------------|-------|
| 1 | Browser → Frontend hosting | HTTPS | Serves the static Next.js export |
| 2 | Frontend → API Gateway | `POST /orders` | Fired by `submitOrder()` when the customer clicks **Place Order** |
| 3 | Frontend → API Gateway | `GET /orders` | Fired by `fetchOrders()` when the Admin Dashboard loads |
| 4 | Frontend → API Gateway | `PATCH /orders/{orderId}` | Fired by `updateOrderStatus()` when the owner changes an order's status |
| 5 | API Gateway → Lambda | Proxy integration | One Lambda per route (or one Lambda with internal routing — either is fine) |
| 6 | Lambda → DynamoDB | AWS SDK | `PutCommand` (create), `ScanCommand`/`QueryCommand` (list), `UpdateCommand` (status) |
| 7 | Lambda → SES | AWS SDK, async | Optional. Only on `createOrder`, after the DynamoDB write succeeds |

---

## 2. Full Project Documentation

### 2.1 Project Overview & Tech Stack

Ubuntu Cafe & Lounge is a premium, culturally-grounded restaurant web app,
architected as a **static frontend that is backend-agnostic until wired up**.

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14 (App Router), `output: 'export'` | Ships as a flat static bundle — no Node.js server required at runtime, so it can be hosted on S3/CloudFront or Amplify Hosting for close to zero cost |
| **Styling** | Tailwind CSS 3, `darkMode: 'class'` | Utility-first styling; class-based dark mode drives the premium light/dark theme toggle |
| **Theming** | `next-themes` | Persists the visitor's light/dark choice in `localStorage`; toggled via `ThemeToggle.jsx` in the Navbar and Admin header |
| **State management** | React Context (`CartContext`, `ToastContext`) | Cart state is shared between the home page menu and the `/order` page without prop-drilling or an external state library |
| **Data fetching** | Native `fetch()`, centralized in `src/utils/api.js` | Single seam to the AWS backend — see Section 2.3 |
| **Fonts** | `next/font/google` (Playfair Display + Plus Jakarta Sans) | Self-hosted at build time — no runtime calls to Google Fonts |
| **Target hosting** | AWS Amplify Hosting, or Amazon S3 + CloudFront | Both consume the same static `/out` folder |

### 2.2 File Structure Breakdown

```
src/
├── app/                          Next.js App Router — one folder per route
│   ├── layout.js                 Root layout: fonts, <ThemeProvider>,
│   │                              <ToastProvider>, <CartProvider>
│   ├── page.js                   Home page (Hero, Story, Menu, Reservations)
│   ├── globals.css                Tailwind layers, theme CSS variables,
│   │                              transition rules, .eyebrow / .ubuntu-knot
│   ├── order/
│   │   └── page.js               "/order" — the checkout page
│   └── admin/
│       └── page.js               "/admin" — the owner dashboard (password-gated)
│
├── components/
│   ├── Navbar.jsx                 Nav, mobile menu, cart badge, ThemeToggle
│   ├── ThemeToggle.jsx             Sun/moon light-dark toggle (next-themes)
│   ├── Hero.jsx                   Landing hero (fixed dark scrim, both themes)
│   ├── UbuntuStory.jsx             Philosophy + hours + location
│   ├── Menu.jsx                    Home page tabbed menu (reads menuData.js)
│   ├── AddToCartControl.jsx        Shared "Add to Cart" stepper button
│   ├── Reservations.jsx            Table reservation UI shell (no backend yet)
│   ├── Footer.jsx                  Social links, copyright, "Cafe Admin" link
│   ├── UbuntuKnot.jsx              Signature logo motif (SVG)
│   ├── PatternDivider.jsx          Kente-inspired divider motif (SVG)
│   ├── order/
│   │   ├── MenuPicker.jsx          Full menu browser with dish images, /order page
│   │   └── CartPanel.jsx           Cart summary, customer form, submit + success UI
│   └── admin/
│       ├── PasswordGate.jsx         UI-level password screen for /admin
│       └── OrdersDashboard.jsx      Stats + incoming orders table/cards
│
├── context/
│   ├── CartContext.jsx             Global cart state (add/remove/quantity/subtotal)
│   └── ToastContext.jsx            Global toast notifications (used for the
│                                    "AWS Backend Offline" fallback messaging)
│
├── data/
│   └── menuData.js                 SINGLE SOURCE OF TRUTH for the menu —
│                                    id, name, description, price, image, tags
│                                    per dish, grouped by category
│
└── utils/
    ├── api.js                      THE INTEGRATION SEAM — submitOrder(),
    │                                fetchOrders(), updateOrderStatus(),
    │                                reads NEXT_PUBLIC_AWS_API_URL
    └── format.js                    formatCurrency(), formatOrderTime()
```

### 2.3 Data Contract Specifications

This is the exact JSON shape the frontend sends and expects. **The backend
team should parse/return exactly this shape** — no other frontend files
need to change once these three endpoints exist and match this contract.

#### `POST /orders` — request body (sent by `submitOrder()` in `CartPanel.jsx`)

```json
{
  "customer": {
    "name": "Ama Owusu",
    "phone": "+233 24 555 0182",
    "email": "ama@example.com"
  },
  "items": [
    {
      "id": "jollof-suya",
      "name": "Smoked Jollof Rice with Grilled Suya",
      "price": 28,
      "quantity": 2
    },
    {
      "id": "bissap",
      "name": "West African Bissap",
      "price": 8,
      "quantity": 2
    }
  ],
  "subtotal": 72,
  "fulfillment": {
    "type": "table",
    "tableNumber": "5"
  }
}
```

> `fulfillment.type` is either `"table"` (with a `tableNumber` string) or
> `"pickup"` (with no `tableNumber` field at all — omitted, not null).
>
> **Note for the backend team:** the payload does **not** include an
> order ID, timestamp, or status — these should be generated/stamped
> server-side in the `createOrder` Lambda (`orderId`, `receivedAt`,
> `status: "Pending"`), not trusted from the client.

#### `POST /orders` — expected success response

```json
{
  "orderId": "ORD-10233",
  "status": "received",
  "receivedAt": "2026-07-09T14:32:00.000Z"
}
```

The frontend reads `orderId` and displays it on the confirmation screen.
Any additional fields are ignored (not an error) — you don't need to
match this exactly beyond `orderId` and `status`.

#### `GET /orders` — expected response (used by `OrdersDashboard.jsx`)

An array of order objects, in this shape:

```json
[
  {
    "orderId": "ORD-10231",
    "customer": {
      "name": "Ama Owusu",
      "phone": "+233 24 555 0182",
      "email": "ama@example.com"
    },
    "items": [
      {
        "id": "jollof-suya",
        "name": "Smoked Jollof Rice with Grilled Suya",
        "price": 28,
        "quantity": 2
      }
    ],
    "fulfillment": { "type": "table", "tableNumber": "5" },
    "total": 72,
    "status": "Preparing",
    "receivedAt": "2026-07-09T14:20:00.000Z"
  }
]
```

> Note the field is `total` here (not `subtotal`) — the dashboard displays
> it as the order's grand total. `status` must be one of exactly:
> `"Pending"`, `"Preparing"`, `"Ready"`, `"Completed"` — these four strings
> drive the color-coded status badge in the UI.

#### `PATCH /orders/{orderId}` — request body (sent by `updateOrderStatus()`)

```json
{
  "status": "Ready"
}
```

Expected response: `{ "orderId": "ORD-10231", "status": "Ready" }` (or any
2xx with a JSON body — the frontend already updates its own local state
optimistically and doesn't strictly require the response body back).

#### Reference: full request/response contract at a glance

| Endpoint | Method | Request body | Success response |
|----------|--------|---------------|-------------------|
| `/orders` | `POST` | Customer + items + fulfillment (no ID/timestamp) | `{ orderId, status }` |
| `/orders` | `GET` | — | Array of order objects (see above) |
| `/orders/{orderId}` | `PATCH` | `{ status }` | `{ orderId, status }` |

---

## 3. Step-by-Step Backend Integration & AWS Deployment Checklist

### Phase A — AWS Infrastructure Provisioning

1. **Create the DynamoDB table**
   - Table name: `UbuntuCafeOrders`
   - Partition key: `orderId` (String)
   - Billing mode: On-Demand (simplest for unpredictable café traffic)
   - No sort key needed for a first pass; add a Global Secondary Index on
     `status` later if the dashboard needs server-side filtering by status

2. **Write three Lambda functions (Node.js 20.x runtime)**
   - `createOrder` — validates the body against the contract in Section
     2.3, generates `orderId` (e.g. `ORD-` + a short UUID/timestamp) and
     `receivedAt`, sets `status: "Pending"`, writes via `PutCommand`,
     returns `{ orderId, status }`
   - `listOrders` — reads all orders via `ScanCommand` (or `QueryCommand`
     against a GSI once one exists), returns the array shape from 2.3
   - `updateOrderStatus` — reads `orderId` from the path parameter and
     `status` from the body, writes via `UpdateCommand`

3. **Attach IAM policies (least privilege)**
   - Each Lambda's execution role needs exactly:
     - `dynamodb:PutItem` on `createOrder`
     - `dynamodb:Scan` (and/or `Query`) on `listOrders`
     - `dynamodb:UpdateItem` on `updateOrderStatus`
   - Scope every policy's `Resource` to the single table ARN — avoid
     `dynamodb:*` or wildcard resources
   - If wiring up SES: add `ses:SendEmail` / `ses:SendRawEmail`, scoped to
     the verified sending identity, to `createOrder`'s role only

4. **(Optional) Configure Amazon SES**
   - Verify a sending domain or email address in SES
   - If the SES account is still in the sandbox, verify recipient
     addresses too, or request production access
   - Call `SendEmailCommand` from inside `createOrder`, **after** the
     DynamoDB write succeeds, and don't let a failed email block the
     order response (fire-and-forget or wrap in its own try/catch)

5. **Create the API Gateway**
   - HTTP API is sufficient and cheaper than REST API for this use case
   - Routes, each proxying to its Lambda:
     - `POST /orders` → `createOrder`
     - `GET /orders` → `listOrders`
     - `PATCH /orders/{orderId}` → `updateOrderStatus`
   - **Enable CORS** on all three routes — allow the Amplify/CloudFront
     domain as an origin (or `*` while testing, tightened before launch)
   - Deploy to a stage (e.g. `prod`) and copy the **Invoke URL**

### Phase B — Wiring the Frontend to the Backend

1. Open `src/utils/api.js` — **no code changes are required here**, only
   an environment variable. Confirm this line is unchanged:
   ```js
   const API_URL = process.env.NEXT_PUBLIC_AWS_API_URL || 'YOUR_MOCK_API_FALLBACK';
   ```
2. Locally, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Set the real value:
   ```
   NEXT_PUBLIC_AWS_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
   ```
   (No trailing slash — `api.js` appends paths like `/orders` directly.)
4. Restart the dev server (`npm run dev`) and test:
   - Place a test order on `/order` — it should hit the real API instead
     of showing the **"Order simulated successfully! (AWS Backend
     Offline)"** toast
   - Load `/admin` — real orders from DynamoDB should replace the mock
     `MOCK_ORDERS` data, and the "Showing simulated orders" toast should
     no longer appear
5. If you still see the offline toasts after setting the variable, check:
   - CORS is enabled on all three API Gateway routes
   - The Lambda responses match the shapes in Section 2.3 exactly
   - The browser console (`[api] ...` warnings log the exact fetch error)

### Phase C — AWS Amplify Deployment Execution

1. **Push this repository to GitHub** (already done if you're reading
   this from the repo).
2. **In the AWS Amplify console:** choose *New app → Host web app*,
   connect your GitHub account, and select this repository + branch
   (e.g. `main`).
3. **Build settings** — Amplify auto-detects Next.js, but confirm:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: out
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. **Inject environment variables** — in *App settings → Environment
   variables*, add:
   - `NEXT_PUBLIC_AWS_API_URL` = your API Gateway invoke URL from Phase A
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = a real password for the `/admin` gate
     (see the security note below before relying on this alone)
5. **Save and deploy** — Amplify triggers the first build automatically.
   Every subsequent push to the connected branch redeploys automatically
   (CI/CD is live from this point on).
6. **Verify the live site:**
   - Home page loads with images and the theme toggle working
   - `/order` places a real order that appears in DynamoDB
   - `/admin` shows that real order, and status changes persist
7. **(Optional) Custom domain** — *App settings → Domain management* to
   attach a real domain via Route 53 or an external registrar.

> **Security reminder:** `NEXT_PUBLIC_ADMIN_PASSWORD` is baked into the
> public JS bundle at build time — anyone can read it in the browser's
> dev tools. It is a UI-level convenience, not real authentication. Before
> this handles real customer data, put a real identity provider (Amazon
> Cognito is the natural fit here) in front of `/admin`, and — more
> importantly — protect the `/orders` API routes themselves with an
> authorizer, since a frontend password screen alone does not secure the
> underlying data.

---

## Quick Reference

| What | Where |
|------|-------|
| Swap in the real API | `NEXT_PUBLIC_AWS_API_URL` env var (Amplify console or `.env.local`) |
| Change the admin password | `NEXT_PUBLIC_ADMIN_PASSWORD` env var |
| Add/edit a menu item | `src/data/menuData.js` |
| Change the API contract | `src/utils/api.js` (keep in sync with Section 2.3 above) |
| Adjust brand colors | `tailwind.config.js` (`charcoal`, `terracotta`, `ivory`, `emerald`, `gold`) |
