# 🚀 Docker Quick Start Guide - AfroItalia API

## 🎉 Setup Complete!

Your AfroItalia API is now fully containerized and running with Docker! All controllers have been created and the entire stack is operational.

## ⚠️ Important: Arrêter PostgreSQL local

Avant de démarrer Docker, vous devez arrêter votre PostgreSQL local pour éviter les conflits de port :

```bash
# Sur macOS (si installé via Homebrew)
brew services stop postgresql@15
# ou
brew services stop postgresql

# Vérifier que le port 5432 est libre
lsof -i :5432
```

## 🎯 Démarrage en 3 étapes

### 1️⃣ Configurer l'environnement

```bash
# Copier le fichier d'environnement Docker
cp .env.docker .env
```

**IMPORTANT**: Éditez `.env` et changez au minimum :
- `POSTGRES_PASSWORD` (utilisez un mot de passe fort)
- `JWT_SECRET` (générez une clé aléatoire longue)

### 2️⃣ Démarrer Docker

```bash
# Démarrer tous les services
npm run docker:up

# Ou en mode détaché (en arrière-plan)
docker-compose up -d
```

Attendez que tous les services démarrent (environ 30 secondes).

### 3️⃣ Initialiser la base de données

```bash
# Dans un nouveau terminal

# Créer les tables
docker-compose exec api npx prisma db push

# Seed les données de test
npm run docker:seed
```

## 🐳 Services Docker en cours d'exécution

```
✅ PostgreSQL - localhost:5432 (database)
✅ Redis - localhost:6379 (cache)
✅ API - localhost:5001 (Node.js API)
✅ Prisma Studio - localhost:5555 (database GUI)
```

## ✅ Vérification et Tests

### Accéder aux services

- **API Health Check**: http://localhost:5001/health
- **Prisma Studio (Database GUI)**: http://localhost:5555

### Test de connexion

```bash
# Test de l'API
curl http://localhost:5001/health

# Test de login
curl -X POST 'http://localhost:5001/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@afroitalia.com","password":"password123"}'
```

### 🔑 Identifiants de test

Après avoir seedé la base de données, utilisez ces identifiants :

```
Email: admin@afroitalia.com
Password: password123

Autres comptes:
- john@example.com (USER)
- owner@example.com (BUSINESS)
```

## 📁 Controllers créés

Tous les contrôleurs nécessaires ont été créés :

1. ✅ **authController.js** - Authentication (register, login, logout, password management)
2. ✅ **userController.js** - User profile management (get/update profile, favorites, reviews)
3. ✅ **reviewController.js** - Review management (create, update, delete, respond, report)
4. ✅ **adminController.js** - Admin operations (stats, users, businesses, moderation)

## 🛠️ Commandes Docker Utiles

```bash
# Démarrer tous les services
npm run docker:up

# Arrêter tous les services
npm run docker:down

# Voir les logs en temps réel
npm run docker:logs

# Redémarrer les services
npm run docker:restart

# Rebuild les images
npm run docker:up:build

# Seed la base de données
npm run docker:seed

# Ouvrir Prisma Studio
npm run docker:studio
```

### Commandes Docker avancées

```bash
# Voir le statut des conteneurs
docker-compose ps

# Accéder au shell d'un conteneur
docker-compose exec api sh

# Voir les logs d'un service spécifique
docker-compose logs -f api

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## 📊 Architecture Docker

```
┌─────────────────────────────────────────────┐
│           Docker Network                    │
│                                             │
│  ┌──────────────┐    ┌──────────────┐     │
│  │ PostgreSQL   │    │    Redis     │     │
│  │ Port: 5432   │    │  Port: 6379  │     │
│  └──────┬───────┘    └──────┬───────┘     │
│         │                   │              │
│         └────────┬──────────┘              │
│                  │                         │
│         ┌────────▼─────────┐               │
│         │   Node.js API    │               │
│         │   Port: 5001     │               │
│         └────────┬─────────┘               │
│                  │                         │
│         ┌────────▼─────────┐               │
│         │  Prisma Studio   │               │
│         │   Port: 5555     │               │
│         └──────────────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

## 🐛 Problèmes Courants

### Port 5432 déjà utilisé

```bash
# Arrêter PostgreSQL local
brew services stop postgresql@15

# Vérifier que le port est libre
lsof -i :5432
```

### Port 5000 déjà utilisé (macOS Control Center)

Le port 5000 est utilisé par défaut par macOS Control Center. L'API est donc accessible sur le **port 5001** au lieu de 5000.

### Les conteneurs ne démarrent pas

```bash
# Voir les logs d'erreur
docker-compose logs

# Rebuild tout
docker-compose down -v
docker-compose up --build
```

### L'API ne démarre pas

```bash
# Vérifier les logs de l'API
docker-compose logs api

# Régénérer le Prisma Client
docker-compose exec api npx prisma generate

# Redémarrer l'API
docker-compose restart api
```

### Base de données vide

```bash
# Initialiser le schéma
docker-compose exec api npx prisma db push

# Seed les données
npm run docker:seed
```

## 🔄 Revenir au Setup Local

Si vous voulez revenir à votre setup local :

```bash
# 1. Arrêter Docker
npm run docker:down

# 2. Redémarrer PostgreSQL local
brew services start postgresql@15

# 3. Restaurer votre .env local
# Remettez DATABASE_URL avec localhost:
# DATABASE_URL="postgresql://mendjilemec:Lemec@123@localhost:5432/afroitalia_db"
```

## 🎓 Prochaines Étapes

1. ✅ Vérifier que l'API répond : `curl http://localhost:5001/health`
2. ✅ Ouvrir Prisma Studio : http://localhost:5555
3. ✅ Tester les endpoints de l'API avec les identifiants de test
4. ✅ Développer avec hot-reload activé (les modifications de code redémarrent automatiquement l'API)

## 📚 Documentation complète

Pour plus de détails sur Docker, consultez le fichier `DOCKER.md` qui contient :
- Configuration avancée
- Déploiement en production
- Gestion des volumes
- Sécurité
- Et plus encore...

---

**🎉 Bon développement avec AfroItalia API !** 🚀
