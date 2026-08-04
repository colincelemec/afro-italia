# 🚀 Guide de Configuration - AfroItalia Platform v2

## Installation pas à pas

### Étape 1 : Prérequis

Assurez-vous d'avoir installé :

```bash
# Vérifier Node.js (≥ 18.0.0)
node --version

# Vérifier npm
npm --version

# Installer Docker (optionnel mais recommandé)
docker --version
docker-compose --version
```

---

### Étape 2 : Installation des dépendances

#### Backend

```bash
cd server
npm install
```

**Dépendances principales installées :**
- `express` - Framework web
- `@prisma/client` - ORM
- `bcryptjs` - Hash passwords
- `jsonwebtoken` - JWT auth
- `cors` - CORS middleware
- `helmet` - Sécurité
- `multer` - Upload fichiers
- `nodemailer` - Emails
- `stripe` - Paiements

#### Frontend

```bash
cd client
npm install
```

**Dépendances principales installées :**
- `react` & `react-dom` - Bibliothèque UI
- `react-router-dom` - Routing
- `axios` ou `Fetch API` - Requêtes HTTP
- `zustand` - State management

---

### Étape 3 : Configuration de la base de données

#### Option A : Avec Docker (Recommandé)

```bash
# À la racine du projet
docker-compose up -d

# Vérifier les conteneurs
docker ps
```

Vous devriez voir :
- `afroitalia_db` (PostgreSQL + PostGIS)
- `afroitalia_redis` (Redis)
- `afroitalia_pgadmin` (Interface d'administration)

**Accès pgAdmin :**
- URL : http://localhost:5050
- Email : admin@afroitalia.com
- Password : admin123

**Pour ajouter le serveur PostgreSQL dans pgAdmin :**
1. Ouvrir pgAdmin
2. Clic droit sur "Servers" → "Register" → "Server"
3. Name : AfroItalia
4. Connection tab :
   - Host : postgres (ou localhost si externe)
   - Port : 5432
   - Database : afroitalia_db
   - Username : afroitalia
   - Password : afroitalia123

#### Option B : PostgreSQL local

Si vous avez déjà PostgreSQL installé localement :

```bash
# Créer la base de données
createdb afroitalia_db

# Activer l'extension PostGIS
psql afroitalia_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

### Étape 4 : Configuration des variables d'environnement

#### Backend (.env)

```bash
cd server
cp .env.example .env
```

**Éditer `server/.env` :**

```env
# ============================================
# CONFIGURATION MINIMALE POUR DÉMARRER
# ============================================

NODE_ENV=development
PORT=5000

# Base de données (avec Docker)
DATABASE_URL="postgresql://afroitalia:afroitalia123@localhost:5432/afroitalia_db"

# JWT (générer une clé secrète aléatoire)
JWT_SECRET=changez-ceci-par-une-cle-secrete-tres-longue-et-aleatoire
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:3000

# ============================================
# CONFIGURATION OPTIONNELLE (pour plus tard)
# ============================================

# Google Maps (optionnel au début)
# GOOGLE_MAPS_API_KEY=

# Stripe (optionnel au début)
# STRIPE_SECRET_KEY=
# STRIPE_PUBLISHABLE_KEY=

# Email (optionnel au début)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

**Générer une clé JWT secrète :**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env)

```bash
cd client
cp .env.example .env
```

**Éditer `client/.env` :**

```env
REACT_APP_API_URL=http://localhost:5000/api

# Optionnel au début
# REACT_APP_GOOGLE_MAPS_API_KEY=
# REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

---

### Étape 5 : Initialisation de la base de données

```bash
cd server

# Générer le client Prisma
npm run db:generate

# Créer les tables via migrations
npm run db:migrate

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

**Vérifier les tables créées :**

```bash
# Via psql
psql postgresql://afroitalia:afroitalia123@localhost:5432/afroitalia_db

# Lister les tables
\dt

# Vous devriez voir :
# - users
# - cities
# - categories
# - businesses
# - reviews
# - favorites
# - payments
```

---

### Étape 6 : Démarrer l'application

#### Terminal 1 : Backend

```bash
cd server
npm run dev
```

**Vous devriez voir :**

```
✅ Connecté à PostgreSQL via Prisma
🚀 ============================================
🚀 AfroItalia API Server
🚀 Environment: development
🚀 Port: 5000
🚀 URL: http://localhost:5000
🚀 Health Check: http://localhost:5000/health
🚀 ============================================
```

**Tester l'API :**

```bash
curl http://localhost:5000/health
```

#### Terminal 2 : Frontend

```bash
cd client
npm start
```

**Vous devriez voir :**

```
Compiled successfully!

You can now view afro-italia-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

### Étape 7 : Vérification

#### 1. Backend fonctionne

```bash
# Health check
curl http://localhost:5000/health

# Liste des entreprises (vide au début)
curl http://localhost:5000/api/businesses
```

#### 2. Frontend fonctionne

Ouvrir http://localhost:3000 dans le navigateur

#### 3. Base de données fonctionne

```bash
# Via psql
psql postgresql://afroitalia:afroitalia123@localhost:5432/afroitalia_db -c "SELECT COUNT(*) FROM users;"
```

---

### Étape 8 : Créer un compte admin

#### Option A : Via l'interface

1. Aller sur http://localhost:3000/register
2. S'inscrire avec un email
3. Modifier le rôle en base de données :

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```

#### Option B : Via script

```bash
cd server
node scripts/create-admin.js
```

---

## 🛠 Commandes utiles

### Backend

```bash
# Développement avec auto-reload
npm run dev

# Production
npm start

# Prisma Studio (interface graphique DB)
npm run db:studio

# Réinitialiser la DB
npm run db:reset

# Nouvelle migration
npm run db:migrate

# Seed data
npm run db:seed
```

### Frontend

```bash
# Développement
npm start

# Build production
npm run build

# Tests
npm test
```

### Docker

```bash
# Démarrer les services
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Arrêter et supprimer les volumes
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Erreur : "Port 5000 already in use"

```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=5001
```

### Erreur : "Cannot connect to PostgreSQL"

```bash
# Vérifier que Docker fonctionne
docker ps

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les logs
docker-compose logs postgres
```

### Erreur : "Prisma Client not generated"

```bash
cd server
npm run db:generate
```

### Erreur CORS

Vérifier que `CLIENT_URL` dans `server/.env` correspond à l'URL du frontend :

```env
CLIENT_URL=http://localhost:3000
```

### Erreur : "JWT malformed"

Vérifier que `JWT_SECRET` est bien défini dans `server/.env`

---

## 🎯 Prochaines étapes

Une fois l'installation terminée :

1. **Créer des données de test** :
   - Villes (Milan, Rome, Turin, etc.)
   - Catégories (Restaurants, Coiffeurs, etc.)
   - Quelques entreprises

2. **Tester les fonctionnalités** :
   - Inscription/Connexion
   - Création d'entreprise
   - Recherche
   - Reviews

3. **Configurer les services externes** :
   - Google Maps API
   - Stripe (paiements)
   - Nodemailer (emails)

4. **Personnaliser** :
   - Design/CSS
   - Ajouter des features
   - Déploiement

---

## 📚 Documentation additionnelle

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Besoin d'aide ?** Ouvrir une issue sur GitHub ou contacter l'équipe.
