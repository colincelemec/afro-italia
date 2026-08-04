// ============================================
// Configuration Express App
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const metaRoutes = require('./routes/meta');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');

// Initialiser Express
const app = express();

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Sécurité avec Helmet
app.use(helmet());

// CORS - Autoriser les requêtes depuis le client
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression des réponses
app.use(compression());

// Parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logger HTTP (uniquement en dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting global
app.use('/api/', limiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AfroItalia API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/meta', metaRoutes);

// ============================================
// ROUTE 404
// ============================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ============================================
// ERROR HANDLER GLOBAL
// ============================================

app.use(errorHandler);

module.exports = app;
