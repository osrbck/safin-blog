# Safin

A modern publishing platform. Authors sign up, write rich-text posts with cover images, and publish them under curated categories.

| Layer  | Stack                                                                 |
| ------ | --------------------------------------------------------------------- |
| API    | Node 20+, Express 5, Mongoose 9, MongoDB Atlas, JWT, Helmet, rate limiting |
| Client | Vite 8, React 19, React Router 7, Quill 2 editor, light/dark theming     |

## Project layout

```
safin-blog/
├── server/        REST API  (http://localhost:5000)
│   ├── config/    env + database connection
│   ├── models/    User, Post
│   ├── controllers/ routes/ middleware/ utils/
│   ├── scripts/init-db.js   creates collections, validators and indexes
│   └── uploads/   cover images and avatars (served at /uploads)
└── blog-client/   Vite + React app (http://localhost:3000)
```

## Quick start

```bash
npm run install:all                 # root + server + client dependencies

cp server/.env.example server/.env  # fill in MONGODB_URI and JWT_SECRET
cp blog-client/.env.example blog-client/.env

npm run db:init                     # one-off: prepares the `safin` database
cp server/seed/admins.example.json server/seed/admins.json   # list the editor accounts
npm run db:seed                     # creates/updates those accounts (there is no public sign-up)
npm run db:seed-posts               # optional: publishes the articles in server/seed/posts (idempotent)
npm run dev                         # runs API and client together
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Database

Safin is invite-only: accounts are created with `npm run db:seed` from `server/seed/admins.json` (git-ignored; see `admins.example.json`). Running it again updates names and passwords of existing accounts.

Database `safin` on MongoDB Atlas, two collections kept deliberately small:

| Collection | Fields                                                                 | Indexes                                   |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| `users`    | `name`, `email`, `password` (bcrypt), `avatar` (nullable), `createdAt` | `email` unique                            |
| `posts`    | `title`, `category`, `description` (HTML), `thumbnail`, `creator` → users, `createdAt`, `updatedAt` | `creator`, `category`, `createdAt desc` |

Post counts per author are computed on read, so there is no counter field to drift out of sync.

`npm run db:init` is idempotent. It also attaches JSON-schema validators to both collections when the database user has the `dbAdmin` role on `safin`; with a plain `readWrite` role it reports that the validators were skipped and still syncs the indexes.

## API

Base URL: `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route                              | Auth | Description                                   |
| ------ | ---------------------------------- | ---- | --------------------------------------------- |
| GET    | `/health`                          |      | Liveness check                                |
| POST   | `/users/login`                     |      | → `{token, id, name, avatar}`                 |
| GET    | `/users`                           |      | Authors with post counts                      |
| GET    | `/users/:id`                       |      | Public profile                                |
| POST   | `/users/change-avatar`             | ✓    | multipart `avatar` (PNG/JPEG/WebP, ≤ 1.5 MB)  |
| PATCH  | `/users/edit-user`                 | ✓    | `{name, email, currentPassword, newPassword?, confirmNewPassword?}` |
| GET    | `/posts`                           |      | All posts, newest first, creator populated    |
| GET    | `/posts/:id`                       |      | Single post                                   |
| GET    | `/posts/categories/:category`      |      | Posts in a category (URL-encode spaces)       |
| GET    | `/posts/users/:id`                 |      | Posts by an author                            |
| POST   | `/posts`                           | ✓    | multipart `title, category, description, thumbnail` (≤ 2 MB) |
| PATCH  | `/posts/:id`                       | ✓    | Owner only; `thumbnail` optional              |
| DELETE | `/posts/:id`                       | ✓    | Owner only                                    |

Categories: `Houseplants`, `Poisonous Plants`, `Flower Legends`, `Art`, `Investment`. Errors are returned as `{ "message": "..." }` with a meaningful status code. Sign-in is rate limited to 20 attempts per 15 minutes per IP.

Outside `/api` the server also answers `GET /sitemap.xml` (every public page, generated from the database, with `SITE_URL` links and image entries) and `GET /robots.txt` (keeps the API host itself out of search results).

## Environment variables

**server/.env**

| Name             | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `MONGODB_URI`    | Atlas connection string ending in `/safin`               |
| `JWT_SECRET`     | Token signing secret (required)                          |
| `JWT_EXPIRES_IN` | Token lifetime, default `1d`                             |
| `CLIENT_URL`     | Allowed origin(s), comma-separated, default `http://localhost:3000` |
| `SITE_URL`       | Public client address used in `sitemap.xml`, default the first `CLIENT_URL` |
| `PORT`           | Default `5000`                                           |
| `HOST`           | Bind address, default `0.0.0.0`; `127.0.0.1` behind a reverse proxy |

**blog-client/.env**

| Name              | Description                                  |
| ----------------- | -------------------------------------------- |
| `VITE_API_URL`    | `/api` in development (Vite proxies it); the deployed API URL in production |
| `VITE_ASSETS_URL` | empty in development; the deployed API origin in production (serves `/uploads`) |
| `VITE_SITE_URL`   | Public site address (no trailing slash) for canonical, Open Graph and `robots.txt` URLs |
| `VITE_PROXY_TARGET` | Where the dev proxy forwards, default `http://localhost:5000` |

The client does not need to run on port 3000. If it is taken, Vite picks the next free port and the proxy keeps the API reachable; the API also accepts any `localhost` origin outside production.

## SEO

- Every route sets its own title, description, canonical URL, Open Graph / Twitter tags and robots directive (`src/lib/seo.js`); private pages (sign in, dashboard, profile, editor, 404) are `noindex`.
- Stories carry `BlogPosting` + `BreadcrumbList` JSON-LD, author pages `ProfilePage`, and `index.html` ships `WebSite` / `Organization` defaults for crawlers that do not run JavaScript.
- `robots.txt` is generated at build time from `VITE_SITE_URL`; `/sitemap.xml` is served by the API and proxied by the client host (`blog-client/vercel.json`, and the Vite dev proxy).
- Icons: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, 192/512 and maskable PNGs, `site.webmanifest`, and a 1200×630 `og-image.png`.

## Deployment

**API (EC2, Caddy + systemd).** Files live in `server/deploy/`:

1. Point an `A` record for `safin-api.osmansaribacak.online` to the instance and allow the instance IP in Atlas → Network Access.
2. First time: create `/home/ubuntu/safin-backend/.env` (as `server/.env.example`, with `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=5000`, `CLIENT_URL`/`SITE_URL` set to the client origin), install `safin.service` into `/etc/systemd/system/`, append `Caddyfile.snippet` to `/etc/caddy/Caddyfile` and reload Caddy.
3. Every release: `./server/deploy/deploy.sh` (rsync code + uploads, `npm ci --omit=dev`, restart, health check).

**Client (Vercel).** Root directory `blog-client`, env `VITE_API_URL=https://safin-api.osmansaribacak.online/api`, `VITE_ASSETS_URL=https://safin-api.osmansaribacak.online`, `VITE_SITE_URL=https://safin.osmansaribacak.online`. `vercel.json` handles SPA routing, long-lived asset caching and the sitemap rewrite.
