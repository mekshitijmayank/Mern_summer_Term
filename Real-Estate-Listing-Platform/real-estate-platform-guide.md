# Real Estate Listing Platform — Full Build Guide

Stack: **React (Vite) + Node.js + Express + MongoDB (Mongoose)**
Type: Open-source portfolio project on GitHub

---

## 1. System Architecture

```
                        ┌─────────────────────────┐
                        │        CLIENT (React)     │
                        │  Vite + React Router      │
                        │  Axios / React Query       │
                        │  Leaflet.js (map)          │
                        │  Tailwind CSS               │
                        └────────────┬─────────────┘
                                     │ REST (JSON) over HTTPS
                                     ▼
                        ┌─────────────────────────┐
                        │      SERVER (Node.js)     │
                        │  Express.js REST API       │
                        │  JWT Auth middleware        │
                        │  Multer (image uploads)     │
                        │  express-validator           │
                        └────────────┬─────────────┘
                                     │ Mongoose ODM
                                     ▼
                        ┌─────────────────────────┐
                        │       MongoDB Atlas        │
                        │  properties, agents,       │
                        │  users, inquiries,          │
                        │  favorites                  │
                        └─────────────────────────┘

  External services: Cloudinary/S3 (image hosting), Mapbox/Leaflet+OSM (maps)
```

**Why this stack fits your goals:** it's the same MERN pattern you already used on DelhiGlow, so you're extending known muscle memory rather than starting cold, and it's fully deployable for free (Vercel/Netlify + Render/Railway + MongoDB Atlas) — good for an open-source GitHub portfolio piece.

---

## 2. Repository Structure

```
real-estate-platform/
├── client/                        # React app (Vite)
│   ├── src/
│   │   ├── api/                   # axios instance + endpoint functions
│   │   │   ├── axios.js
│   │   │   ├── properties.api.js
│   │   │   ├── inquiries.api.js
│   │   │   └── auth.api.js
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer, Layout
│   │   │   ├── property/          # PropertyCard, PropertyGrid, Gallery
│   │   │   ├── filters/           # SearchBar, FilterPanel, MapView
│   │   │   ├── inquiry/           # InquiryForm, InquiryList
│   │   │   └── common/            # Button, Modal, Loader, Pagination
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Listings.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── AgentDashboard.jsx
│   │   │   ├── Login.jsx / Register.jsx
│   │   ├── context/               # AuthContext, FavoritesContext
│   │   ├── hooks/                 # useProperties, useDebounce, useFilters
│   │   ├── utils/                 # formatPrice, formatDate
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                        # Express API
│   ├── config/
│   │   ├── db.js                  # Mongo connection
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── Property.js
│   │   ├── Agent.js
│   │   ├── User.js
│   │   ├── Inquiry.js
│   │   └── Favorite.js
│   ├── controllers/
│   │   ├── property.controller.js
│   │   ├── agent.controller.js
│   │   ├── inquiry.controller.js
│   │   ├── favorite.controller.js
│   │   └── auth.controller.js
│   ├── routes/
│   │   ├── property.routes.js
│   │   ├── agent.routes.js
│   │   ├── inquiry.routes.js
│   │   ├── favorite.routes.js
│   │   └── auth.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verify
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js   # multer config
│   ├── utils/
│   │   └── apiFeatures.js         # filtering/sorting/pagination helper
│   ├── server.js
│   └── package.json
│
├── .env.example
└── README.md
```

---

## 3. Database Schema (MongoDB / Mongoose)

### Property
```js
{
  title: String,
  description: String,
  price: Number,
  type: { type: String, enum: ["sale", "rent"] },
  propertyType: { type: String, enum: ["apartment", "house", "villa", "plot", "commercial"] },
  bedrooms: Number,
  bathrooms: Number,
  areaSqft: Number,
  address: {
    street: String, city: String, state: String, zip: String
  },
  location: {                       // GeoJSON — enables map + radius search
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]           // [lng, lat]
  },
  images: [String],                 // Cloudinary URLs
  amenities: [String],              // ["parking", "pool", "gym", ...]
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  status: { type: String, enum: ["available", "pending", "sold"], default: "available" },
  featured: Boolean,
  createdAt: Date
}
// Index: location as "2dsphere", plus text index on title/description/address.city
```

### Agent
```js
{
  name: String, email: String, phone: String,
  photo: String, agency: String, bio: String,
  listings: [{ type: ObjectId, ref: "Property" }]
}
```

### User
```js
{
  name: String, email: String, password: String (hashed),
  role: { type: String, enum: ["buyer", "agent", "admin"], default: "buyer" },
  favorites: [{ type: ObjectId, ref: "Property" }]
}
```

### Inquiry
```js
{
  property: { type: ObjectId, ref: "Property" },
  name: String, email: String, phone: String,
  message: String,
  status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  createdAt: Date
}
```

### Favorite
```js
{ user: { type: ObjectId, ref: "User" }, property: { type: ObjectId, ref: "Property" } }
// unique compound index on (user, property) to prevent duplicates
```

---

## 4. API Design (Express)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/properties` | List properties — supports query params: `city, minPrice, maxPrice, bedrooms, type, propertyType, amenities, lat, lng, radius, sort, page, limit` |
| GET | `/api/properties/:id` | Single property detail |
| POST | `/api/properties` | Create listing (agent/admin, auth required) |
| PUT | `/api/properties/:id` | Update listing |
| DELETE | `/api/properties/:id` | Delete listing |
| GET | `/api/agents/:id` | Agent profile + their listings |
| POST | `/api/inquiries` | Submit an inquiry on a property |
| GET | `/api/inquiries` | Agent/admin: view inquiries for their listings |
| POST | `/api/favorites/:propertyId` | Toggle favorite (auth required) |
| GET | `/api/favorites` | Get logged-in user's favorites |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login → returns JWT |

**Filtering implementation pattern (`apiFeatures.js`):** build a reusable class/function that chains `.filter()`, `.sort()`, `.paginate()`, `.search()` on the Mongoose query object — this is the standard MERN pattern and keeps your controller code clean:

```js
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const exclude = ["page", "sort", "limit", "fields", "search"];
    exclude.forEach(f => delete queryObj[f]);
    let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, m => `$${m}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  search() {
    if (this.queryString.search) {
      this.query = this.query.find({ $text: { $search: this.queryString.search } });
    }
    return this;
  }
  geoFilter() {
    const { lat, lng, radius } = this.queryString;
    if (lat && lng && radius) {
      this.query = this.query.find({
        location: {
          $geoWithin: { $centerSphere: [[+lng, +lat], radius / 3963.2] } // radius in miles
        }
      });
    }
    return this;
  }
  sort() {
    this.query = this.query.sort(this.queryString.sort?.split(",").join(" ") || "-createdAt");
    return this;
  }
  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 12;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }
}
```

Controller usage:
```js
exports.getProperties = async (req, res) => {
  const features = new APIFeatures(Property.find(), req.query)
    .filter().search().geoFilter().sort().paginate();
  const properties = await features.query;
  res.json({ success: true, count: properties.length, data: properties });
};
```

---

## 5. Search & Map Filters (Task 3)

- **Text search:** MongoDB text index on `title`, `description`, `address.city` → hit via `?search=` param.
- **Structured filters:** price range, bedrooms, property type, amenities — all handled by `filter()` above using query params.
- **Map-based search:** use `2dsphere` geo index + `$geoWithin`/`$centerSphere` for "properties within X miles of this point."
- **Frontend map:** use **Leaflet.js + react-leaflet** with **OpenStreetMap** tiles (free, no API key) — plot markers from the returned property list, sync map bounds with the filter panel so panning/zooming re-queries visible listings.
- **Debounce** filter inputs (price sliders, search box) with a `useDebounce` hook (300ms) before firing API calls, so you're not hammering the backend on every keystroke.
- **URL-synced filters:** store filter state in the URL query string (`useSearchParams`) so listings are shareable/bookmarkable — a nice portfolio touch.

---

## 6. UI/UX Plan (Task 1)

**Pages:**
1. **Home** — hero search bar, featured listings carousel, city shortcuts.
2. **Listings (search results)** — left: filter panel (price, beds, type, amenities); center: grid/list of `PropertyCard`; right (toggle): map view. Include a grid/map view switch and sort dropdown (price, newest).
3. **Property Detail** — image gallery/carousel, key facts, description, amenities list, embedded mini-map, agent card, inquiry form, "add to favorites" button.
4. **Favorites** — grid of saved listings (auth required).
5. **Agent Dashboard** — CRUD for own listings, view inquiries received.
6. **Auth pages** — login/register.

**Design system notes (consistent with your other builds):**
- Clean, white-dominant background with a single accent color for CTAs (matches your dev-tools-suite pattern).
- Card-based layout for listings with consistent image aspect ratio (use `object-fit: cover`).
- Skeleton loaders while data fetches, not spinners, for a more premium feel.
- Mobile-first: filter panel collapses into a bottom-sheet modal on small screens.

---

## 7. Build Order (recommended sequence)

1. **Scaffold repo** — `client/` (Vite + React + Tailwind) and `server/` (Express) as separate folders, root `README.md`, `.gitignore`, `.env.example`.
2. **MongoDB models** — Property, Agent, User, Inquiry, Favorite. Seed with ~30 dummy properties (script in `server/seed.js`) so the UI has real data early.
3. **Core Property API** — GET list + GET by id first, test with Postman/Thunder Client.
4. **Listings page + PropertyCard** — connect to the API, get real data rendering before styling filters.
5. **Property Detail page.**
6. **Filters + search API** (`apiFeatures.js`) → wire up filter panel.
7. **Map integration** (Leaflet) — plot markers, geo filter.
8. **Auth** (JWT) — register/login, protect agent routes.
9. **Inquiries** — form on detail page → POST → agent dashboard to view them.
10. **Favorites** — toggle + favorites page (auth-gated).
11. **Agent Dashboard** — create/edit/delete own listings, image upload via Cloudinary.
12. **Polish** — loading states, empty states, error boundaries, responsive pass, SEO meta tags per listing (you already do this well in your dev-tools projects).
13. **Deploy** — client → Vercel/Netlify, server → Render/Railway, DB → MongoDB Atlas, images → Cloudinary free tier.
14. **README + GitHub polish** — architecture diagram, setup instructions, screenshots, live demo link — since this is going open source, a strong README materially affects how it reads to a PM/recruiter audience.

---

## 8. Suggested `.env` variables

```
# server/.env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 9. Where each Task/Outcome maps

| Task | Outcome | Where it lives above |
|---|---|---|
| Task 1 (Listing/Detail UI) | Outcome 1 (Design interfaces) | Section 6 |
| Task 2 (APIs) | Outcome 2 (Filtering APIs) | Section 4 |
| Task 3 (Search/map filters) | Outcome 4 (Search functionality) | Section 5 |
| Task 4 (MongoDB storage) | Outcome 3 (Manage listing data) | Section 3 |
| Task 5 (Inquiry/favorites) | Outcome 5 (Develop platform) | Sections 3–4, build steps 9–10 |

---

## 10. Honest notes

- The heaviest real engineering here is the **map + geo filter combo** — budget the most time for that, not the CRUD parts, since CRUD you've already done on DelhiGlow.
- Skip building your own auth from scratch if you're short on time — `jsonwebtoken` + `bcryptjs` as shown is fine and standard, don't over-engineer it with refresh tokens for a portfolio project.
- Image upload is the other place people stall — use Cloudinary's free tier + `multer-storage-cloudinary`, don't try to self-host image storage.
- For an open-source repo, seed data and a working demo link matter more than feature count — a fully working smaller feature set beats a half-working large one.
