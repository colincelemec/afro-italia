# 🌍 AfroItalia Platform v2.0 - Architecture Simplifiée

> Plateforme de découverte d'entreprises de la diaspora africaine en Italie

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

AfroItalia Platform v2.0 est une refonte complète utilisant une stack technique simplifiée et performante.

### Fonctionnalités principales

✅ **Authentification**
- Inscription/Connexion avec email/password
- JWT pour la gestion des sessions
- OAuth Google (optionnel)

✅ **Annuaire d'entreprises**
- Recherche par ville et catégorie
- Géolocalisation avec cartes Google Maps
- Profils détaillés avec photos

✅ **Système de reviews**
- Notes et commentaires
- Réponses des propriétaires
- Modération

✅ **Dashboard**
- Tableau de bord utilisateur
- Gestion d'entreprises
- Statistiques

✅ **Panel Admin**
- Vérification d'entreprises
- Modération de contenu
- Analytics

✅ **Plans d'abonnement**
- FREE, BASIC, PREMIUM
- Paiements Stripe

---

## 🛠 Stack Technique

### Frontend
- **React 18** - Bibliothèque UI
- **React Router v6** - Navigation SPA
- **JavaScript ES6+** - Pas de TypeScript
- **CSS Modules** - Styles
- **Fetch API** - Requêtes AJAX
- **Zustand** - Gestion d'état (léger)

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework API REST
- **Prisma ORM** - Accès base de données
- **PostgreSQL** - Base de données principale
- **PostGIS** - Extension géospatiale
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe

### Services tiers
- **Google Maps API** - Cartes et géolocalisation
- **Stripe** - Paiements
- **Nodemailer** - Emails

### DevOps
- **Docker** - Conteneurisation PostgreSQL
- **Git** - Versioning

---

## 🏗 Architecture

### Architecture globale

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

### Flux de données

1. **User Action** → Interaction dans le navigateur (click, form submit)
2. **AJAX Request** → Appel API via Fetch (services/api.js)
3. **Express Route** → Route reçoit la requête
4. **Controller** → Logique métier + validation
5. **Prisma ORM** → Requête base de données
6. **PostgreSQL** → Lecture/écriture données
7. **JSON Response** → Réponse API au format JSON
8. **UI Update** → React met à jour l'interface

---

## 📦 Installation

### Prérequis

- **Node.js** ≥ 18.0.0
- **PostgreSQL** ≥ 15 (ou Docker)
- **npm** ou **pnpm**

### 1. Cloner le projet

```bash
git clone <repo-url>
cd afro-italia-v2
```

### 2. Installer les dépendances

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Base de données avec Docker

```bash
# À la racine du projet
docker-compose up -d

# Vérifier que PostgreSQL fonctionne
docker ps
```

Accès :
- **PostgreSQL** : `localhost:5432`
- **pgAdmin** : `http://localhost:5050` (admin@afroitalia.com / admin123)

---

## ⚙️ Configuration

### Backend (.env)

```bash
cd server
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

```env
# Database
DATABASE_URL="postgresql://afroitalia:afroitalia123@localhost:5432/afroitalia_db"

# JWT
JWT_SECRET=your-super-secret-key

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
```

### Frontend (.env)

```bash
cd client
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 🚀 Démarrage

### 1. Initialiser la base de données

```bash
cd server

# Générer le client Prisma
npm run db:generate

# Créer les tables (migrations)
npm run db:migrate

# Peupler avec des données de test
npm run db:seed
```

### 2. Démarrer le backend

```bash
cd server
npm run dev
```

Le serveur démarre sur : **http://localhost:5000**

Test health check : **http://localhost:5000/health**

### 3. Démarrer le frontend

```bash
cd client
npm start
```

L'application démarre sur : **http://localhost:3000**

---

## 📁 Structure du Projet

```
afro-italia-v2/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages de l'app
│   │   ├── services/          # Services API (AJAX)
│   │   │   ├── api.js         # Configuration Fetch
│   │   │   └── businessService.js
│   │   ├── context/           # Context API (état global)
│   │   ├── hooks/             # Custom hooks
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Backend Express
│   ├── src/
│   │   ├── routes/            # Routes API REST
│   │   ├── controllers/       # Logique métier
│   │   ├── middleware/        # Middlewares (auth, validation)
│   │   ├── services/          # Services (email, maps, etc.)
│   │   ├── app.js             # Configuration Express
│   │   └── server.js          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma DB
│   │   └── seed.js            # Données de test
│   └── package.json
│
├── database/                   # Scripts SQL
│   └── schema.sql
│
├── docs/                       # Documentation
│
└── docker-compose.yml          # PostgreSQL + Redis
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints principaux

#### 🔐 Authentification
```
POST   /api/auth/register      - Inscription
POST   /api/auth/login         - Connexion
POST   /api/auth/logout        - Déconnexion
GET    /api/auth/me            - Profil utilisateur
```

#### 🏢 Entreprises
```
GET    /api/businesses              - Liste des entreprises
GET    /api/businesses/search       - Recherche
GET    /api/businesses/:slug        - Détails d'une entreprise
POST   /api/businesses              - Créer (auth required)
PUT    /api/businesses/:id          - Modifier (owner only)
DELETE /api/businesses/:id          - Supprimer (owner/admin)
POST   /api/businesses/:id/favorite - Toggle favoris (auth required)
```

#### ⭐ Reviews
```
GET    /api/reviews/:businessId     - Reviews d'une entreprise
POST   /api/reviews                 - Créer un avis (auth required)
PUT    /api/reviews/:id             - Modifier son avis
DELETE /api/reviews/:id             - Supprimer son avis
```

#### 👤 Utilisateurs
```
GET    /api/users/profile           - Mon profil
PUT    /api/users/profile           - Modifier mon profil
GET    /api/users/favorites         - Mes favoris
GET    /api/users/my-businesses     - Mes entreprises
```

#### 🔧 Admin
```
GET    /api/admin/businesses        - Toutes les entreprises
PATCH  /api/admin/businesses/:id/verify  - Vérifier une entreprise
GET    /api/admin/stats             - Statistiques
```

### Exemple d'appel AJAX

```javascript
// Dans votre composant React
import businessService from '../services/businessService';

const fetchBusinesses = async () => {
  try {
    const response = await businessService.getAllBusinesses({
      page: 1,
      limit: 12,
      city: 'milan',
      category: 'restaurant'
    });

    console.log(response.data); // Array d'entreprises
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};
```

---

## 🌐 Déploiement

### Frontend (Netlify/Vercel)

```bash
cd client
npm run build

# Le dossier build/ contient les fichiers statiques
```

### Backend (Heroku/Railway/Render)

```bash
cd server

# Variables d'environnement à configurer :
# - DATABASE_URL
# - JWT_SECRET
# - GOOGLE_MAPS_API_KEY
# - STRIPE_SECRET_KEY
```

### Base de données (Production)

Utiliser un service PostgreSQL managé :
- **Supabase** (gratuit jusqu'à 500 MB)
- **Railway** (avec extension PostGIS)
- **Neon** (serverless PostgreSQL)
- **AWS RDS**

---

## 🧪 Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

---

## 📝 Migration depuis v1

Si vous migrez depuis l'ancienne version (Next.js + Supabase) :

1. **Exporter les données** de Supabase
2. **Créer la nouvelle DB** PostgreSQL
3. **Importer les données** avec les scripts de migration
4. **Tester** l'API avec Postman
5. **Déployer** progressivement

Documentation détaillée : `docs/MIGRATION.md`

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT License - voir le fichier `LICENSE`

---

## 👥 Équipe

- **Développement** : AfroItalia Team
- **Contact** : contact@afroitalia.com

---

## 🔗 Liens utiles

- [Documentation API complète](docs/API.md)
- [Schéma de base de données](docs/DATABASE.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)

---

**Bonne chance avec votre projet ! 🚀**
