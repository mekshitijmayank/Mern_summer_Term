# GharFind

GharFind is an India-focused property discovery and advisor platform for residential sales and rentals. The repository is split into `frontend/` (React + Vite) and `backend/` (Express + MongoDB).

## Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB, local or hosted
- Cloudinary credentials for property image uploads (optional for local API startup)

## Configure

Create both local environment files from the examples:

```env
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

The root `.env` configures Vite. `backend/.env` configures MongoDB, JWT signing and the API port. The Vite client uses `VITE_API_BASE_URL` when set and otherwise proxies `/api` and `/uploads` to `http://localhost:5001`.

For MongoDB Atlas, use the URI from the Atlas connection dialog and allow your current IP in Atlas Network Access. The backend waits for MongoDB before opening its port, so a bad URI or unresolved Atlas hostname will prevent the API from starting.

## Run

In one terminal:

```powershell
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite.

## India Listings

Seed the database with Indian city and state listings and advisor accounts:

```powershell
cd backend
npm run seed
```

The seed command **deletes and replaces users, agents and properties** in the database selected by `MONGO_URI`. Use it only with a disposable development database. It creates a demo admin and three demo agents; change these credentials before exposing a seeded database to a network.

## Roles

- `buyer`: browse and save homes, contact advisors, and track viewing requests.
- `agent`: manage owned listings and move requests through contact, visit, negotiation and admin review.
- `admin`: review all listings and inquiries, manage agent access, and approve deals submitted for verification.

Public sign-up at `/register` creates buyer accounts only. Admins grant agent access from the operations dashboard; admin accounts should be provisioned by trusted operators only.

### Demo sign-in

After configuring MongoDB and running `npm run seed` from `backend/`, use these credentials at `/login`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gharfind.in` | `password123` |
| Agent | `mira.shah@gharfind.in` | `password123` |
| Agent | `arya.menon@gharfind.in` | `password123` |
| Agent | `kabir.sethi@gharfind.in` | `password123` |

For a buyer account, register at `/register` and then sign in with that email and password. To make that account an agent, sign in as admin, open the dashboard's **People & agents** tab, and promote the buyer. The new agent should sign out and sign in again to refresh the role in the browser.
