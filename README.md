# 🌍 AfroItalia Platform v2.0

> A discovery platform for African diaspora businesses in Italy

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)

## 🎯 Overview

AfroItalia Platform v2.0 is a complete rebuild on a simpler, faster stack.

### Main features

**Authentication** — email/password sign-up and sign-in, JWT session management,
optional Google OAuth.

**Business directory** — search by city and category, geolocation with Google
Maps, detailed profiles with photos.

**Reviews** — ratings and comments, owner replies, moderation.

**Dashboard** — user dashboard, business management, statistics.

**Admin panel** — business verification, content moderation, analytics.

**Subscription plans** — FREE, BASIC and PREMIUM tiers with Stripe payments.

---

## 🛠 Tech stack

### Front end

- **React 18** — UI library
- **React Router v6** — SPA navigation
- **JavaScript ES6+** — no TypeScript
- **CSS Modules** — styling
- **Fetch API** — AJAX requests
- **Zustand** — lightweight state management

### Back end

- **Node.js** — runtime
- **Express.js** — REST API framework
- **Prisma ORM** — database access
- **PostgreSQL** — primary database
- **PostGIS** — geospatial extension
- **JWT** — authentication
- **Bcrypt** — password hashing

### Third-party services

- **Google Maps API** — maps and geolocation
- **Stripe** — payments
- **Nodemailer** — transactional email

### DevOps

- **Docker** — PostgreSQL containerisation
- **Git** — version control

---

## 🏗 Architecture

```
┌─────────────────┐         AJAX (Fetch)        ┌─────────────────┐
│                 │ ◄──────────────────────────► │                 │
│  React SPA      │      JSON REST API          │   Express API   │
│  (Port 3000)    │                              │   (Port 5000)   │
│                 │                              │                 │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          │ Prisma ORM
                                                          │
                                                    ┌─────▼─────┐
                                                    │           │
                                                    │ PostgreSQL│
                                                    │ + PostGIS │
                                                    │           │
                                                    └───────────┘
```

### Data flow

1. **User action** — interaction in the browser (click, form submit)
2. **AJAX request** — API call through Fetch (`services/api.js`)
3. **Express route** — the route receives the request
4. **Controller** — business logic and validation
5. **Prisma ORM** — database query
6. **PostgreSQL** — read/write
7. **JSON response** — API responds in JSON
8. **UI update** — React updates the interface

---

## 📦 Installation

### Requirements

- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 15 (or Docker)
- **npm** or **pnpm**

### 1. Clone the project

```bash
git clone <repo-url>
cd afro-italia-v2
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Database with Docker

```bash
# from the project root
docker-compose up -d
docker ps   # check PostgreSQL is running
```

Access:

- **PostgreSQL** — `localhost:5432`
- **pgAdmin** — `http://localhost:5050` (credentials are set in `docker-compose.yml`)

---

## ⚙️ Configuration

> **⚠️ Never commit real credentials.** The `.env` files are gitignored; only
> `.env.example` belongs in the repository, and it must contain placeholders
> only. If a key is ever committed, rotate it — removing it later is not enough.

### Back end

```bash
cd server
cp .env.example .env
```

Then fill in your own values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/afroitalia_db"

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### Front end

```bash
cd client
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

---

## 🚀 Running the project

### 1. Initialise the database

```bash
cd server
npm run db:generate   # generate the Prisma client
npm run db:migrate    # create the tables
npm run db:seed       # populate with test data
```

### 2. Start the back end

```bash
cd server
npm run dev
```

Runs on **http://localhost:5000** — health check at `/health`.

### 3. Start the front end

```bash
cd client
npm start
```

Runs on **http://localhost:3000**.

---

## 📁 Project structure

```
.
├── client/                     # React front end
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Application pages
│   │   ├── services/           # API services (AJAX)
│   │   │   ├── api.js          # Fetch configuration
│   │   │   └── businessService.js
│   │   ├── context/            # Context API (global state)
│   │   ├── hooks/              # Custom hooks
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Express back end
│   ├── src/
│   │   ├── routes/             # REST API routes
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth, validation
│   │   ├── services/           # Email, maps, etc.
│   │   ├── app.js              # Express configuration
│   │   └── server.js           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Test data
│   └── package.json
│
├── database/                   # SQL scripts
├── docs/                       # Documentation
└── docker-compose.yml          # PostgreSQL + Redis
```

---

## 📡 API documentation

Base URL: `http://localhost:5000/api`

### 🔐 Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Sign up |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Current user profile |

### 🏢 Businesses

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/businesses` | List businesses |
| `GET` | `/api/businesses/search` | Search |
| `GET` | `/api/businesses/:slug` | Business details |
| `POST` | `/api/businesses` | Create (auth required) |
| `PUT` | `/api/businesses/:id` | Update (owner only) |
| `DELETE` | `/api/businesses/:id` | Delete (owner or admin) |
| `POST` | `/api/businesses/:id/favorite` | Toggle favourite (auth required) |

### ⭐ Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/reviews/:businessId` | Reviews for a business |
| `POST` | `/api/reviews` | Create a review (auth required) |
| `PUT` | `/api/reviews/:id` | Update own review |
| `DELETE` | `/api/reviews/:id` | Delete own review |

### 👤 Users

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/users/profile` | Own profile |
| `PUT` | `/api/users/profile` | Update own profile |
| `GET` | `/api/users/favorites` | Own favourites |
| `GET` | `/api/users/my-businesses` | Own businesses |

### 🔧 Admin

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/businesses` | All businesses |
| `PATCH` | `/api/admin/businesses/:id/verify` | Verify a business |
| `GET` | `/api/admin/stats` | Statistics |

### Example call

```javascript
import businessService from '../services/businessService';

const fetchBusinesses = async () => {
  try {
    const response = await businessService.getAllBusinesses({
      page: 1,
      limit: 12,
      city: 'milan',
      category: 'restaurant'
    });

    console.log(response.data); // array of businesses
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

---

## 🌐 Deployment

**Front end** (Netlify / Vercel)

```bash
cd client
npm run build   # static files land in build/
```

**Back end** (Heroku / Railway / Render) — configure these environment variables:
`DATABASE_URL`, `JWT_SECRET`, `GOOGLE_MAPS_API_KEY`, `STRIPE_SECRET_KEY`.

**Database** — use a managed PostgreSQL service: Supabase (free up to 500 MB),
Railway (with the PostGIS extension), Neon (serverless PostgreSQL) or AWS RDS.

---

## 🧪 Tests

```bash
cd server && npm test
cd client && npm test
```

---

## 📝 Migrating from v1

If you are migrating from the previous version (Next.js + Supabase):

1. Export the data from Supabase
2. Create the new PostgreSQL database
3. Import the data using the migration scripts
4. Test the API with Postman
5. Deploy progressively

See `docs/MIGRATION.md` for the detailed guide.

---

## 📄 Licence

MIT — see the `LICENSE` file.

---

## 🔗 Useful links

- [Full API documentation](docs/API.md)
- [Database schema](docs/DATABASE.md)
- [Deployment guide](docs/DEPLOYMENT.md)

---

**Author:** Colince Tcheussieu Mendji
