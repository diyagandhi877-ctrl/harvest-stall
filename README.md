# Harvest Stall — multi-role marketplace

This extends your original front-end sandbox into a working multi-role app
(Customer / Farmer / Admin) with a real Node/Express/MongoDB backend, while
keeping the exact visual identity of your original page (same fonts, colors,
card layout, price-tag styling — nothing was redesigned).

## What's in here

```
harvest-stall/
├── backend/            Express + MongoDB REST API (JWT auth, 3 roles)
└── frontend/            Static site — open directly or serve with any static server
    ├── index.html            Customer storefront (your original page, extended)
    ├── farmer-dashboard.html Farmer panel (products, orders, analytics, messages)
    ├── admin-dashboard.html  Admin panel (approvals, users, products, orders, categories)
    ├── css/
    │   ├── styles.css        Your ORIGINAL CSS, unchanged, extracted from the inline <style>
    │   └── extend.css        New components only — hero photo, pricing cards, contact
    │                         section, footer, drawers, dashboards, dark mode
    └── js/
        ├── api.js            Fetch wrapper + JWT handling, shared by all 3 pages
        └── i18n.js            English / Hindi / Marathi dictionaries + apply()
```

## Running it

**1. Backend**
```bash
cd backend
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET
npm install
npm run seed               # creates an admin, a demo farmer, and 12 starter products
npm run dev                 # http://localhost:5000
```
Seeded logins (from `npm run seed`):
- Admin:  `admin@harveststall.test` / `Admin@12345`
- Farmer: `farmer@harveststall.test` / `Farmer@12345`

**2. Frontend**
Open `frontend/index.html` directly in a browser, or serve the folder
(`npx serve frontend`) — either works, since it's still a static site.
It talks to `http://localhost:5000/api` by default (see the
`window.HARVEST_API_BASE` line at the top of each page's scripts — change
this if you deploy the API elsewhere).

**If the backend isn't running**, `index.html` still works: it falls back to
the original 12-item demo catalog and shows a friendly message on API calls
that need a server (login, checkout, etc). This was intentional so the page
never goes blank.

## What's implemented end-to-end

- **Auth**: register/login as customer or farmer, JWT, bcrypt hashing, role
  stored on the account. Farmer accounts start `pending` and are invisible
  to admin-approval-gated actions until an admin approves them.
- **Customer**: browse/search/filter/sort products, weight selector
  (250g/500g/1kg), cart (persisted server-side once logged in), wishlist,
  checkout (splits the cart into one order per farmer, decrements stock),
  order history, address book, profile, contact-seller, general contact form,
  language switch (EN/HI/MR) applied live via `data-i18n` attributes, dark
  mode toggle.
- **Farmer dashboard**: overview stats, add/edit/publish/delete products with
  per-weight price & stock, accept/reject/advance orders, revenue-by-day
  chart, top products, customer messages, availability toggle, store profile.
- **Admin dashboard**: platform stats, approve/reject farmers, activate/
  deactivate any account, moderate products, view all orders, manage
  categories, send announcements.
- **Security**: helmet, CORS allow-list, mongo-sanitize (NoSQL-injection
  guard), rate limiting (tighter on `/api/auth`), bcrypt password hashing,
  JWT route protection, role middleware, express-validator on the write
  endpoints that most need it.

## Honest gaps — what I'd build next

This was scoped as a first working slice, not the full spec, because the
full spec (every sub-bullet you listed) is realistically several weeks of
work. Left for a follow-up pass:

- **Image uploads** are wired on the backend (`multer`, `/uploads` static
  route, `images[]` field) but the farmer dashboard form doesn't yet have a
  file picker — right now products use an emoji icon like the original.
- **Product reviews/ratings** — the `Product` model has `ratingAvg` /
  `numReviews` fields ready, but there's no `Review` model or endpoints yet.
- **Search suggestions dropdown** — the backend endpoint
  (`GET /products/suggestions`) exists; the storefront search box doesn't
  call it yet (it still does simple client-side substring filtering).
- **Push/toast notifications for new orders** — the farmer dashboard needs a
  manual refresh/tab switch to see new orders; no websockets/polling yet.
- **Automated tests** — none written yet; I'd add Jest + supertest for the
  controllers before calling this production-ready.
- **Deployment config** (Docker, CI) — not included.

## Reused vs. new

Everything in `css/styles.css` and the product-card markup/logic in
`index.html` is your original code, untouched in spirit — I only extracted
the `<style>` block into its own file so `farmer-dashboard.html` and
`admin-dashboard.html` could share the same design tokens (`--leaf`,
`--gold`, `--tomato`, card shadows, the Fraunces/Karla type pairing, etc.)
without copy-pasting 500 lines of CSS three times.
