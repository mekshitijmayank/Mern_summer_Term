# Product Requirements Document (PRD)
## Real Estate Listing Platform

**Type:** Open-source project (GitHub)
**Stack:** React, Node.js, Express, MongoDB
**Author:** Keshav

---

## 1. Overview

### 1.1 Problem Statement
People searching for a property to buy or rent typically deal with cluttered listing sites, weak filtering, and no easy way to see listings visually on a map. Agents need a simple way to publish listings and manage incoming interest without heavyweight CRM tooling.

### 1.2 Product Summary
A full-stack web platform where visitors can browse, search, and filter property listings (by price, type, bedrooms, location, and map radius), view detailed property pages, contact agents via inquiries, and save favorites. Agents can log in and manage their own listings and view inquiries received.

### 1.3 Goals
- Ship a working, deployable MERN application, not just a UI mockup.
- Demonstrate full-stack ownership: schema design, REST API design, filtering/search logic, geospatial queries, auth, and a polished responsive UI.
- Produce a strong open-source README/repo suitable for a portfolio (recruiter/PM-reviewer audience).

### 1.4 Non-Goals (out of scope for v1)
- Payments / rent collection / escrow
- In-app messaging or chat between buyer and agent (inquiries are form-based, not real-time)
- Admin moderation dashboard beyond basic agent CRUD
- Multi-language support
- Native mobile app

---

## 2. Users & Personas

| Persona | Description | Primary needs |
|---|---|---|
| **Buyer/Renter (visitor)** | Browsing for a property, may or may not create an account | Fast search, clear filters, map view, easy way to contact agent, save favorites |
| **Agent** | Lists and manages properties | Simple listing creation/editing, visibility into inquiries received |
| **Admin** *(optional, stretch)* | Oversees platform | Manage agents/listings if abuse occurs — not required for v1 |

---

## 3. Functional Requirements (mapped to your 5 tasks)

### 3.1 Property Listing & Detail UI (Task 1)
- FR1.1: Display paginated grid of property listings with image, price, address, beds/baths, sqft.
- FR1.2: Property detail page with full image gallery, description, amenities, embedded map, agent contact card.
- FR1.3: Responsive layout — usable on mobile, tablet, desktop.
- FR1.4: Loading and empty states (no results, network error).

### 3.2 Property & Inquiry APIs (Task 2)
- FR2.1: CRUD REST endpoints for properties (`GET/POST/PUT/DELETE /api/properties`).
- FR2.2: Endpoint to submit an inquiry tied to a specific property (`POST /api/inquiries`).
- FR2.3: Endpoint for agents to view inquiries on their own listings only (auth-scoped).
- FR2.4: Input validation on all write endpoints (reject malformed/missing fields).

### 3.3 Search & Map Filters (Task 3)
- FR3.1: Text search across title/description/city.
- FR3.2: Structured filters: price range, property type, bedrooms, bathrooms, amenities.
- FR3.3: Map view showing pins for currently filtered listings.
- FR3.4: Radius/geo search — "properties near this point."
- FR3.5: Filters reflected in the URL (shareable/bookmarkable search results).

### 3.4 MongoDB Data Layer (Task 4)
- FR4.1: Property, Agent, User, Inquiry, Favorite collections with defined schemas.
- FR4.2: Geospatial (`2dsphere`) index on property location for map/radius queries.
- FR4.3: Text index for search.
- FR4.4: Seed script to populate demo data.

### 3.5 Inquiry & Favorites (Task 5)
- FR5.1: Inquiry form on property detail page (name, email, phone, message).
- FR5.2: Favorite/unfavorite toggle on property cards and detail page (auth required).
- FR5.3: Dedicated "My Favorites" page for logged-in users.
- FR5.4: Agent dashboard listing inquiries received, newest first.

---

## 4. Non-Functional Requirements

- **Performance:** listing queries paginated (12–20 per page); avoid N+1 queries via `.populate()` scoping.
- **Security:** passwords hashed (bcrypt), JWT-based auth, input sanitization, rate-limiting on inquiry/auth endpoints to prevent spam/abuse.
- **Scalability (portfolio-appropriate, not enterprise):** stateless API so it can run on a free-tier host; indexes in place so filtering stays fast as demo data grows.
- **Accessibility:** semantic HTML, alt text on property images, keyboard-navigable filter controls.
- **SEO:** unique meta title/description per property detail page (server-rendered or pre-rendered if feasible; otherwise document as a known limitation of client-rendered React).
- **Maintainability:** consistent folder structure (see architecture doc), environment-based config, no secrets committed to the repo.

---

## 5. System Design Reference

Full architecture, folder structure, DB schema, and API table are already defined in the companion doc: **real-estate-platform-guide.md**. This PRD defines *what* is being built and *why*; that doc defines *how*.

Key structural decisions worth restating here because they shape requirements:
- GeoJSON `Point` field on Property + `2dsphere` index → enables FR3.3/FR3.4.
- `apiFeatures.js` chainable query builder → keeps filter/search/sort/paginate logic reusable across the API instead of duplicated per-route.
- Favorite documents are join records (`user` + `property`), not an array on User, to keep the User document lean and allow unique-constraint enforcement.

---

## 6. File/Repo Structure Requirements

The repo must include, at minimum:

```
real-estate-platform/
├── client/                # React app
├── server/                # Express API
├── .env.example           # committed — blank placeholder values only
├── .gitignore              # must exclude .env, node_modules
└── README.md               # setup instructions, architecture diagram, screenshots, live demo link
```

**README.md requirements** (this is a public deliverable, treat it like a section of the product):
- What the project is and who it's for (1–2 lines)
- Tech stack badges
- Architecture diagram (can reuse the one from the guide doc)
- Setup instructions (clone → env vars → install → run, both client and server)
- Screenshots or GIF of the UI
- Live demo link (once deployed)
- API reference summary or link to `/docs`

---

## 7. Success Metrics

Since this is a portfolio/open-source project rather than a live business, "success" is measured differently than a normal PRD:

| Metric | Target |
|---|---|
| Core user flow works end-to-end | Search → filter → view detail → submit inquiry → agent sees it, with zero manual DB edits needed |
| Deployed & publicly accessible | Live URL in README, works on first load without errors |
| Map/geo search functions correctly | Radius search returns correct, verifiable results against seed data |
| Code is legible to an outside reviewer | Clear folder structure, consistent naming, no dead/commented-out code left in |
| README quality | A stranger could clone + run it using only the README |

---

## 8. Milestones (maps to the build order from the architecture guide)

| Milestone | Deliverable |
|---|---|
| M1 | Repo scaffolded, models defined, seed data loads |
| M2 | Property API (list + detail) working, listings page renders real data |
| M3 | Filters + search + map view functional |
| M4 | Auth (JWT) working; protected agent routes |
| M5 | Inquiries + favorites working end-to-end |
| M6 | Agent dashboard complete |
| M7 | Deployed (client + server + DB live), polish pass, README finalized |

---

## 9. Risks / Open Questions

- **Image hosting cost/limits:** Cloudinary free tier should be sufficient for demo data volume — revisit if seed image count grows large.
- **SEO on client-rendered React:** property detail pages won't be crawlable well without SSR/prerendering. Acceptable tradeoff for v1; note it as a known limitation in the README rather than solving it now.
- **Geo query correctness:** `$centerSphere` radius math is easy to get subtly wrong (miles vs radians) — needs explicit test cases against known seed coordinates before considering FR3.4 done.
- **Auth scope creep:** resist adding refresh tokens, email verification, or password reset for v1 — none of the 5 tasks require it.

---

## 10. Which Sections Actually Matter Most

Not all 10 sections carry equal weight for a project like this. Ranked by importance:

1. **Section 3 (Functional Requirements)** — this is the actual spec. Everything you build should trace back to one of these bullets. If a feature doesn't map to an FR here, it's scope creep.
2. **Section 6 (File/Repo Structure, especially README requirements)** — for an open-source portfolio project, this is arguably *more* visible than your code quality, because it's the first thing anyone reviewing the repo reads. Don't treat it as an afterthought.
3. **Section 8 (Milestones)** — this is what keeps you from stalling. Without it, "build a real estate platform" is too big and you'll bounce between tasks. Follow the milestone order.
4. **Section 4 (Non-Functional Requirements)** — security and pagination items here are cheap to do right from the start and expensive to retrofit later (e.g., adding rate-limiting after launch vs. from day one).
5. **Section 9 (Risks)** — worth a five-minute read before you start Task 3 specifically, since the geo-search risk is the one most likely to eat unplanned time.

Sections 1, 2, 5, and 7 are useful context and worth having for completeness (and they read well in a portfolio context if you link the PRD from your README), but they're not places where you need to make hard decisions — they mostly restate things already settled elsewhere.
