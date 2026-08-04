# 🚀 Guide Complet - Lancer l'Application AfroItalia

Ce guide explique comment démarrer l'application complète avec le frontend (React) et le backend (API Docker).

## 📋 Architecture de l'Application

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend React (Port 3000)                    │
│  http://localhost:3000                         │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌─────────────────────────────────────────────────┐
│         Backend Docker Services                 │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │   PostgreSQL     │  │      Redis       │   │
│  │   Port: 5432     │  │   Port: 6379     │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │   API Node.js    │  │  Prisma Studio   │   │
│  │   Port: 5001     │  │   Port: 5555     │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🎯 Démarrage Rapide (2 Terminaux)

### Terminal 1: Backend (Docker)

```bash
# Aller dans le dossier server
cd server

# Démarrer tous les services Docker
npm run docker:up

# Attendre que tous les services démarrent (30 secondes)
# Vérifier que tout est OK
docker-compose ps
```

### Terminal 2: Frontend (React)

```bash
# Aller dans le dossier client
cd client

# Installer les dépendances (première fois seulement)
npm install

# Démarrer le serveur de développement React
npm start
```

## ✅ Vérification

Après avoir lancé les deux commandes, vous devriez avoir :

### Backend (Docker)
- ✅ **PostgreSQL** - localhost:5432
- ✅ **Redis** - localhost:6379
- ✅ **API** - http://localhost:5001/health
- ✅ **Prisma Studio** - http://localhost:5555

### Frontend (React)
- ✅ **Application Web** - http://localhost:3000

## 🌐 Accéder à l'Application

Ouvrez votre navigateur et allez sur :

### **http://localhost:3000**

Vous devriez voir la page d'accueil d'AfroItalia ! 🎉

## 🔑 Se Connecter

Utilisez ces identifiants de test :

```
Email: admin@afroitalia.com
Password: password123

Autres comptes:
- john@example.com (USER)
- owner@example.com (BUSINESS)
```

## 📁 Structure du Projet

```
afro-italia-v2/
├── client/              # Frontend React
│   ├── src/            # Code source React
│   ├── public/         # Assets statiques
│   └── package.json    # Dépendances frontend
│
├── server/             # Backend API
│   ├── src/           # Code source API
│   ├── prisma/        # Schéma de base de données
│   ├── Dockerfile     # Configuration Docker
│   └── docker-compose.yml
│
└── FULL_APP_GUIDE.md  # Ce fichier
```

## 🛠️ Commandes Utiles

### Backend (depuis /server)

```bash
# Démarrer Docker
npm run docker:up

# Arrêter Docker
npm run docker:down

# Voir les logs
npm run docker:logs

# Accéder à Prisma Studio
http://localhost:5555

# Restart API
docker-compose restart api

# Seed la base de données
npm run docker:seed
```

### Frontend (depuis /client)

```bash
# Démarrer le serveur de dev
npm start

# Build pour la production
npm run build

# Lancer les tests
npm test
```

## 🐛 Problèmes Courants

### Le frontend ne se connecte pas à l'API

**Vérifiez** :
1. Le backend Docker est démarré : `docker-compose ps`
2. L'API répond : `curl http://localhost:5001/health`
3. Le fichier `client/.env` existe avec `REACT_APP_API_URL=http://localhost:5001/api`

**Solution** :
```bash
# Dans le dossier client
cat .env | grep REACT_APP_API_URL
# Doit afficher: REACT_APP_API_URL=http://localhost:5001/api

# Si différent, corrigez le fichier .env
```

### Port 3000 déjà utilisé

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port
PORT=3001 npm start
```

### Erreur CORS sur l'API

L'API est configurée pour accepter les requêtes depuis `http://localhost:3000`. Si vous changez le port du frontend, mettez à jour `server/.env` :

```bash
CLIENT_URL=http://localhost:3001
```

Puis redémarrez l'API :
```bash
docker-compose restart api
```

### Page blanche ou erreur React

```bash
# Nettoyer et réinstaller
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🔄 Workflow de Développement

### 1. Démarrage Quotidien

```bash
# Terminal 1: Backend
cd server && npm run docker:up

# Terminal 2: Frontend
cd client && npm start
```

### 2. Pendant le Développement

- **Frontend** : Les modifications dans `client/src/` rechargent automatiquement le navigateur (hot reload)
- **Backend** : Les modifications dans `server/src/` redémarrent automatiquement l'API (nodemon)

### 3. Tester les Changements

```bash
# Ouvrir http://localhost:3000
# Modifier du code
# Les changements apparaissent automatiquement
```

### 4. Arrêt en Fin de Journée

```bash
# Arrêter le frontend
Ctrl + C dans le terminal du client

# Arrêter le backend
cd server && npm run docker:down
```

## 📊 Outils de Développement

### Prisma Studio (Base de Données)
http://localhost:5555
- Voir toutes les tables
- Ajouter/Modifier/Supprimer des données
- Tester les relations

### React DevTools
Installez l'extension Chrome/Firefox pour débugger React :
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

### API Testing
Utilisez **Postman** ou **Insomnia** pour tester l'API :
- Base URL : `http://localhost:5001/api`
- Exemple : `GET http://localhost:5001/api/businesses`

## 🎨 Personnalisation

### Changer le Nom de l'Application

Éditez `client/.env` :
```bash
REACT_APP_NAME=VotreNom
REACT_APP_DESCRIPTION="Votre description"
```

### Activer/Désactiver des Fonctionnalités

Dans `client/.env` :
```bash
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_CHAT=false
REACT_APP_ENABLE_EVENTS=false
```

## 🚀 Déploiement en Production

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Le dossier build/ contient l'application prête pour la production
```

### Backend (Docker en Production)

Consultez `server/DOCKER.md` pour les instructions de déploiement.

## 📚 Documentation Complète

- **Backend API** : Consultez `server/README.md`
- **Docker Setup** : Consultez `server/DOCKER.md`
- **Quick Start** : Consultez `server/DOCKER-QUICKSTART.md`

## 💡 Astuces

### Développement Parallèle Frontend + Backend

```bash
# Script pratique pour tout démarrer
# Créez un fichier start.sh à la racine

#!/bin/bash
cd server && npm run docker:up &
sleep 10
cd client && npm start
```

### Vérification Rapide

```bash
# Vérifier que tout fonctionne
curl http://localhost:5001/health  # Backend
curl http://localhost:3000         # Frontend
curl http://localhost:5555         # Prisma Studio
```

## ❓ Support

Si vous rencontrez des problèmes :

1. **Backend** : Vérifiez `docker-compose logs api`
2. **Frontend** : Vérifiez la console du navigateur (F12)
3. **Database** : Utilisez Prisma Studio sur http://localhost:5555

---

**🎉 Bon développement avec AfroItalia !** 🚀

*Dernière mise à jour : Mai 2026*
