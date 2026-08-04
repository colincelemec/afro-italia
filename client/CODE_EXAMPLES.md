# Code Examples & Implementation Snippets

## 1. AUTH SERVICE TEMPLATE

```javascript
// /src/services/authService.js

import api from './api';

const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
      });
      
      // Store token in localStorage
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Store token in localStorage
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect is handled by api.js on 401
  },

  /**
   * Get current user
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
```

---

## 2. ZUSTAND AUTH STORE

```javascript
// /src/stores/authStore.js

import create from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
```

---

## 3. LOGIN COMPONENT

```javascript
// /src/components/auth/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading, error } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Connexion</h1>

        {(serverError || error) && (
          <div className="error-message">
            {serverError || error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p><Link to="/forgot-password">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

## 4. REGISTER COMPONENT

```javascript
// /src/components/auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../stores/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
      });
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Register</h1>

        {(serverError || error) && (
          <div className="error-message">
            {serverError || error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                {...register('firstName', {
                  required: 'First name is required'
                })}
              />
              {errors.firstName && <span className="error">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                {...register('lastName', {
                  required: 'Last name is required'
                })}
              />
              {errors.lastName && <span className="error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Phone (Optional)</label>
            <input
              type="tel"
              {...register('phone')}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: value =>
                  value === password || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

---

## 5. PROTECTED ROUTE COMPONENT

```javascript
// /src/components/common/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 6. HEADER/NAVIGATION COMPONENT

```javascript
// /src/components/layout/Header.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">🌍 AfroItalia</span>
          </Link>
        </div>

        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {/* Add more nav links here */}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="dropdown">
                <button className="dropdown-toggle">▼</button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

---

## 7. UPDATED APP.JS WITH ROUTING

```javascript
// /src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Layouts
import Header from './components/layout/Header';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ActivityDetail from './pages/ActivityDetail';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

// Store
import useAuthStore from './stores/authStore';

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Initialize user from localStorage on app load
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUser(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, [setUser]);

  return (
    <Router>
      <div className="App">
        <Header />

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/attivita/:slug" element={<ActivityDetail />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

---

## 8. ACTIVITY DETAIL PAGE TEMPLATE

```javascript
// /src/pages/ActivityDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import businessService from '../services/businessService';
import useAuthStore from '../stores/authStore';

const ActivityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await businessService.getBusinessBySlug(slug);
        setBusiness(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load business');
        console.error('Error fetching business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!business) {
    return <div className="not-found">Business not found</div>;
  }

  return (
    <div className="activity-detail">
      <div className="activity-header">
        {business.coverImage && (
          <img src={business.coverImage} alt={business.name} className="cover-image" />
        )}
        <div className="activity-info">
          <h1>{business.name}</h1>
          <p className="category">{business.category?.name}</p>
          <p className="location">📍 {business.city?.name}</p>
        </div>
      </div>

      <div className="activity-content">
        <section className="description">
          <h2>About</h2>
          <p>{business.description}</p>
        </section>

        <section className="contact">
          <h2>Contact</h2>
          {business.email && <p>Email: {business.email}</p>}
          {business.phone && <p>Phone: {business.phone}</p>}
          {business.website && <p>Website: <a href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a></p>}
        </section>

        <section className="reviews">
          <h2>Reviews</h2>
          <p>Average Rating: {business.averageRating} / 5</p>
          <p>{business.reviewCount} reviews</p>
          {isAuthenticated && (
            <button className="btn-add-review">Add a Review</button>
          )}
        </section>
      </div>
    </div>
  );
};

export default ActivityDetail;
```

---

## 9. CUSTOM USEAUTH HOOK

```javascript
// /src/hooks/useAuth.js

import useAuthStore from '../stores/authStore';

/**
 * Custom hook to access auth state and methods
 */
const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser,
    setError,
    clearError,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    login,
    register,
    logout,
    setUser,
    setError,
    clearError,
  };
};

export default useAuth;
```

---

## 10. ERROR BOUNDARY COMPONENT

```javascript
// /src/components/common/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.href = '/'}>
            Go to home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

