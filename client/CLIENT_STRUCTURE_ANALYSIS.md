# AfroItalia Client-Side Structure Analysis

## Overview
The AfroItalia project is a React 18-based single-page application (SPA) with TypeScript support capabilities. The frontend communicates with a Node.js/Express backend API using the Fetch API and includes state management via Zustand and form handling with react-hook-form.

---

## 1. DIRECTORY STRUCTURE

### Root Level
```
/Users/colincetcheussieumendji/Desktop/PROJECTS/afro-italia-v2/client/
├── public/                 # Static assets
├── src/                    # Source code
├── build/                  # Build output
├── node_modules/          # Dependencies
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
└── .env.example           # Environment template
```

### Source Directory Structure (src/)
```
src/
├── components/                # React components
│   ├── auth/                 # Authentication components (EMPTY - needs creation)
│   ├── business/             # Business/activities components
│   │   └── BusinessList.jsx   # Component to display business listings
│   ├── common/               # Reusable components (EMPTY)
│   ├── layout/               # Layout components (EMPTY)
│   └── reviews/              # Review-related components (EMPTY)
│
├── context/                  # React Context API (EMPTY - consider for auth state)
│
├── hooks/                    # Custom React hooks (EMPTY)
│
├── pages/                    # Page-level components
│   └── Home.js              # Homepage with business listing
│
├── services/                # Service layer for API calls
│   ├── api.js              # Base API configuration with Fetch API
│   └── businessService.js   # Business-related API service
│
├── styles/                  # CSS styles
│   ├── components/          # Component-specific styles (EMPTY)
│   ├── App.css
│   └── index.css
│
├── utils/                   # Utility functions (EMPTY)
│
├── App.js                  # Main App component with routing
├── index.js               # Entry point
└── .env                   # Environment configuration
```

---

## 2. EXISTING AUTHENTICATION IMPLEMENTATION

### Current Status
- **No authentication UI components exist yet** (components/auth/ is empty)
- **No authentication service exists** (needs to be created)
- **Backend API endpoints are ready** for authentication

### Backend Auth Endpoints (Ready to Use)
Located at: `/server/src/routes/auth.js`

**Endpoint Details:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

### Authentication Flow (Backend)
```javascript
// From authController.js
- Register: email, password, firstName, lastName, phone → Returns user + JWT token
- Login: email, password → Returns user + JWT token
- Token stored in localStorage (client-side)
- Token sent in Authorization header: "Bearer {token}"
- 401 response triggers logout (API service handles this)
```

---

## 3. API CALL IMPLEMENTATION

### Base API Service
**File:** `/src/services/api.js`

**Features:**
- Uses Fetch API (not Axios, despite Axios being in dependencies)
- Centralized configuration with `getHeaders()` function
- Automatic JWT token injection from localStorage
- Error handling with automatic logout on 401
- Supports multiple HTTP methods: GET, POST, PUT, PATCH, DELETE
- File upload support with FormData

**Configuration:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Headers are automatically built with Authorization token:
headers['Authorization'] = `Bearer ${token}`
```

**Methods Available:**
```javascript
api.get(endpoint, params)        // GET with query params
api.post(endpoint, data)         // POST JSON
api.put(endpoint, data)          // PUT JSON
api.patch(endpoint, data)        // PATCH JSON
api.delete(endpoint)             // DELETE
api.upload(endpoint, formData)   // File upload
```

### Example Service Implementation
**File:** `/src/services/businessService.js`

Shows the pattern for creating domain-specific services:
```javascript
const businessService = {
  getAllBusinesses: async (params) => api.get('/businesses', params),
  searchBusinesses: async (params) => api.get('/businesses/search', params),
  getBusinessBySlug: async (slug) => api.get(`/businesses/${slug}`),
  createBusiness: async (data) => api.post('/businesses', data),
  // ... more methods
}
```

---

## 4. ROUTING CONFIGURATION

### Current Routing Setup
**File:** `/src/App.js`

**Framework:** React Router v6

**Current Routes:**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</Router>
```

**Status:** Very basic - only the home page is defined

### To Add (Required Implementation)
1. Login page route: `/login`
2. Register page route: `/register`
3. Protected routes (require authentication)
4. Activity detail pages: `/attivita/:slug` (referenced in BusinessList)
5. User profile/dashboard: `/profile`, `/dashboard`
6. Admin routes (if needed)

---

## 5. STATE MANAGEMENT APPROACH

### Current State Management
- **Zustand** is listed in dependencies but NOT YET IMPLEMENTED
- All components currently use React's `useState` hook for local state
- No global state management exists yet

### Environment Configuration
- Environment variables are used for configuration
- Located in `.env` file
- Available at runtime as `process.env.REACT_APP_*`

**Current Environment Variables:**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_CHAT=false
REACT_APP_ENABLE_EVENTS=false
```

### localStorage Usage
- JWT token is stored in `localStorage` under key `'token'`
- User data is stored in `localStorage` under key `'user'`
- Token automatically removed on 401 response (logout)

---

## 6. KEY TECHNOLOGIES

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "axios": "^1.6.2",              // In package but using Fetch API instead
  "react-hook-form": "^7.49.2",   // For form validation
  "zustand": "^4.4.7",            // State management (not yet implemented)
  "@googlemaps/js-api-loader": "^1.16.2",
  "date-fns": "^3.0.6"
}
```

### Backend API Details
- **Base URL:** `http://localhost:5001/api` (configured in .env)
- **Proxy:** Set to `http://localhost:5001` in package.json
- **Authentication:** JWT-based with Bearer tokens
- **Content-Type:** application/json

---

## 7. IMPLEMENTATION ROADMAP FOR LOGIN/REGISTER/ACTIVITIES

### Phase 1: Authentication (Priority 1)

#### 1.1 Create Authentication Service
**File to create:** `/src/services/authService.js`
```javascript
const authService = {
  register: async (email, password, firstName, lastName, phone) => 
    api.post('/auth/register', {...}),
  login: async (email, password) => 
    api.post('/auth/login', {...}),
  logout: async () => { /* Clear localStorage */ },
  getMe: async () => 
    api.get('/auth/me'),
  updatePassword: async (currentPassword, newPassword) => 
    api.put('/auth/update-password', {...}),
  forgotPassword: async (email) => 
    api.post('/auth/forgot-password', {...}),
  resetPassword: async (token, newPassword) => 
    api.post(`/auth/reset-password/${token}`, {...})
}
```

#### 1.2 Create Zustand Auth Store
**File to create:** `/src/stores/authStore.js`
```javascript
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (email, password) => { /* ... */ },
  register: async (data) => { /* ... */ },
  logout: () => { /* ... */ },
  setUser: (user) => set({ user }),
}));
```

#### 1.3 Create Login Component
**File to create:** `/src/components/auth/Login.jsx`
- Form with email and password inputs
- Use react-hook-form for validation
- Call authService.login
- Store token and user in Zustand store
- Redirect to home on success

#### 1.4 Create Register Component
**File to create:** `/src/components/auth/Register.jsx`
- Form with email, password, firstName, lastName, phone
- Use react-hook-form for validation
- Call authService.register
- Store token and user in Zustand store
- Redirect to home on success

#### 1.5 Create Protected Route Component
**File to create:** `/src/components/common/ProtectedRoute.jsx`
- Check if user is authenticated via Zustand store
- Redirect to login if not authenticated
- Otherwise render the component

#### 1.6 Create Navigation Header
**File to create:** `/src/components/layout/Header.jsx`
- Show login/register links if not authenticated
- Show user info and logout button if authenticated
- Navigation to main features

### Phase 2: Activities/Business Details (Priority 2)

#### 2.1 Create Activity/Business Detail Page
**File to create:** `/src/pages/ActivityDetail.js`
- Route: `/attivita/:slug`
- Fetch business details by slug
- Display all business information
- Show reviews/ratings

#### 2.2 Create Review Component
**File to create:** `/src/components/reviews/ReviewList.jsx`
- Display reviews for a business
- Show rating and comments
- Allow authenticated users to add reviews

#### 2.3 Create Favorites/Wishlist
**File to create:** `/src/components/business/FavoriteButton.jsx`
- Toggle favorite status
- Require authentication
- Store in backend

### Phase 3: User Profile/Dashboard (Priority 3)

#### 3.1 Create User Profile Page
**File to create:** `/src/pages/Profile.js`
- Show user information
- Edit profile
- Change password

#### 3.2 Create User Dashboard
**File to create:** `/src/pages/Dashboard.js`
- For business owners: manage their businesses
- Show analytics
- Manage subscriptions

---

## 8. ROUTING STRUCTURE (RECOMMENDED)

```javascript
// App.js - Updated structure

const PublicLayout = ({ children }) => (
  <Header authenticated={isAuthenticated} />
  {children}
  <Footer />
)

const Routes = [
  // Public routes
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/attivita/:slug', element: <ActivityDetail /> },
  
  // Protected routes
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/favorites', element: <ProtectedRoute><Favorites /></ProtectedRoute> },
  
  // Admin routes (optional)
  { path: '/admin', element: <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute> }
]
```

---

## 9. CURRENT FILE LOCATIONS & WHAT NEEDS CREATION

### Existing Files
✓ `/src/services/api.js` - Base API service
✓ `/src/services/businessService.js` - Business service
✓ `/src/pages/Home.js` - Homepage
✓ `/src/components/business/BusinessList.jsx` - Business list component
✓ `/src/App.js` - Main app with basic routing
✓ `/src/index.js` - Entry point

### Files to Create
- [ ] `/src/services/authService.js` - Authentication service
- [ ] `/src/stores/authStore.js` - Zustand auth store (or Context if preferred)
- [ ] `/src/components/auth/Login.jsx` - Login form component
- [ ] `/src/components/auth/Register.jsx` - Register form component
- [ ] `/src/components/common/ProtectedRoute.jsx` - Protected route wrapper
- [ ] `/src/components/layout/Header.jsx` - Navigation header
- [ ] `/src/components/layout/Footer.jsx` - Footer component
- [ ] `/src/pages/ActivityDetail.js` - Activity/business detail page
- [ ] `/src/components/reviews/ReviewList.jsx` - Review listing
- [ ] `/src/pages/Profile.js` - User profile page
- [ ] `/src/pages/Dashboard.js` - User dashboard
- [ ] `/src/hooks/useAuth.js` - Custom hook for auth
- [ ] `/src/hooks/useForm.js` - Custom hook for form handling

### Directories to Create
- [ ] `/src/components/common/` - Create if empty
- [ ] `/src/components/layout/` - Create if empty
- [ ] `/src/hooks/` - Create if empty
- [ ] `/src/stores/` - For Zustand stores
- [ ] `/src/styles/components/` - Component-specific CSS

---

## 10. AUTHENTICATION FLOW DIAGRAM

```
User Input (Login Form)
        ↓
  Login Component
        ↓
  authService.login(email, password)
        ↓
  API Call: POST /api/auth/login
        ↓
Backend Validates → Returns {user, token}
        ↓
Store token in localStorage
Store user in Zustand auth store
        ↓
Redirect to Home/Dashboard
        ↓
All subsequent API calls include:
Authorization: Bearer {token}
```

---

## 11. ERROR HANDLING & PROTECTION

### Token Management
- Token stored in `localStorage` under key `'token'`
- Automatically sent in all API requests via `Authorization` header
- On 401 response: token is cleared and user redirected to login

### Protected Routes
- Create a `<ProtectedRoute>` component
- Check Zustand store for authentication status
- Redirect to login if not authenticated

### Form Validation
- Use `react-hook-form` (already installed)
- Validate on client-side before sending
- Show server-side errors from API responses

---

## 12. ENVIRONMENT CONFIGURATION

### Current .env Settings
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_PORT=0
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_NAME=AfroItalia
REACT_APP_DESCRIPTION="Découvrez les entreprises de la diaspora africaine en Italie"
REACT_APP_DEFAULT_CITY=Milan
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_CHAT=false
REACT_APP_ENABLE_EVENTS=false
```

### To Add (for deployment)
```env
REACT_APP_ENV=development|production
REACT_APP_API_TIMEOUT=5000
```

---

## 13. STARTING POINTS

### To Get Started:
1. **First:** Create `authService.js` - handles all API calls for auth
2. **Second:** Create Zustand store (`authStore.js`) - manages global auth state
3. **Third:** Create Login/Register components - UI for authentication
4. **Fourth:** Create Protected Route wrapper - guard protected pages
5. **Fifth:** Update App.js routing - add new routes
6. **Sixth:** Create Header component - navigation with auth status

### Key Integration Points:
- Use existing `api.js` service in all new services
- Follow `businessService.js` pattern for auth service
- Use react-hook-form for all form handling
- Store auth state in Zustand (globally accessible)
- All components access auth via Zustand store
- Redirect on 401 is handled in `api.js`

---

## 14. QUICK CHECKLIST

- [ ] Create authService.js with login/register/logout methods
- [ ] Create Zustand auth store with user state
- [ ] Create Login page/component
- [ ] Create Register page/component
- [ ] Create ProtectedRoute wrapper component
- [ ] Create Header/Navigation component
- [ ] Update App.js routing
- [ ] Add authentication interceptor/middleware
- [ ] Test login flow
- [ ] Test register flow
- [ ] Create Activity detail page
- [ ] Create Review components
- [ ] Create User profile page
- [ ] Create User dashboard page
- [ ] Test protected routes
- [ ] Test token refresh/expiration handling

