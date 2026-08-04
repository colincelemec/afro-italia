# Docker Setup pour AfroItalia API

Ce guide vous explique comment utiliser Docker pour développer et déployer l'API AfroItalia.

## 📋 Prérequis

- Docker Desktop installé ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (inclus avec Docker Desktop)

## 🚀 Démarrage Rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` à partir du template Docker :

```bash
cp .env.docker .env
```

Modifiez les variables selon vos besoins (notamment les secrets JWT, Stripe, etc.)

### 2. Lancer tous les services

```bash
# Démarrer tous les services en arrière-plan
docker-compose up -d

# Ou en mode verbose (voir les logs)
docker-compose up
```

Cela va démarrer :
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ API Node.js (port 5000)
- ✅ Prisma Studio (port 5555)

### 3. Initialiser la base de données

```bash
# Créer les tables
docker-compose exec api npx prisma db push

# Seed la base de données
docker-compose exec api npm run db:seed
```

### 4. Accéder aux services

- **API** : http://localhost:5000
- **Prisma Studio** : http://localhost:5555
- **PostgreSQL** : localhost:5432
- **Redis** : localhost:6379

## 🛠️ Commandes Docker Utiles

### Gestion des conteneurs

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir les logs
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs api
docker-compose logs postgres

# Suivre les logs en temps réel
docker-compose logs -f api

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Gestion de la base de données

```bash
# Exécuter Prisma Studio
docker-compose exec api npx prisma studio

# Créer une migration
docker-compose exec api npx prisma migrate dev --name nom_migration

# Appliquer les migrations
docker-compose exec api npx prisma db push

# Reset la base de données
docker-compose exec api npx prisma migrate reset

# Seed la base de données
docker-compose exec api npm run db:seed

# Accéder à PostgreSQL en ligne de commande
docker-compose exec postgres psql -U postgres -d afroitalia_db
```

### Shell dans un conteneur

```bash
# Ouvrir un shell dans le conteneur API
docker-compose exec api sh

# Ouvrir un shell dans le conteneur PostgreSQL
docker-compose exec postgres sh
```

### Rebuild des images

```bash
# Rebuild les images Docker
docker-compose build

# Rebuild sans cache
docker-compose build --no-cache

# Rebuild et redémarrer
docker-compose up -d --build
```

## 🔄 Workflow de Développement

### Mode Développement (avec hot-reload)

Le docker-compose.yml est configuré pour le développement avec nodemon :

```bash
docker-compose up
```

Les modifications de code seront automatiquement détectées et le serveur redémarrera.

### Mode Production

Créez un fichier `docker-compose.prod.yml` :

```yaml
version: '3.9'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
    command: npm start  # Pas de nodemon
```

Puis lancez :

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐛 Debugging

### Vérifier les logs d'erreur

```bash
# Tous les logs
docker-compose logs

# Dernières lignes
docker-compose logs --tail=50

# Logs en temps réel
docker-compose logs -f api
```

### Vérifier la santé des services

```bash
docker-compose ps
```

Les services en bonne santé afficheront `healthy` dans la colonne Status.

### Problèmes courants

#### PostgreSQL ne démarre pas

```bash
# Vérifier les logs
docker-compose logs postgres

# Supprimer le volume et redémarrer
docker-compose down -v
docker-compose up -d postgres
```

#### L'API ne peut pas se connecter à PostgreSQL

```bash
# Attendre que PostgreSQL soit ready
docker-compose exec postgres pg_isready -U postgres

# Vérifier la DATABASE_URL dans .env
# Doit être: postgresql://postgres:postgres@postgres:5432/afroitalia_db
```

#### Prisma Client non généré

```bash
docker-compose exec api npx prisma generate
```

## 📊 Prisma Studio (Interface Graphique)

Prisma Studio est automatiquement lancé avec docker-compose.

Accédez-y sur : http://localhost:5555

Vous pouvez :
- ✅ Voir toutes les tables
- ✅ Ajouter/Modifier/Supprimer des données
- ✅ Exécuter des requêtes
- ✅ Voir les relations entre tables

## 🔐 Sécurité

### En développement

Les mots de passe par défaut sont dans `.env.docker` :
- PostgreSQL : `postgres/postgres`
- JWT Secret : généré automatiquement

### En production

⚠️ **IMPORTANT** : Changez tous les secrets avant de déployer :

```bash
# .env
POSTGRES_PASSWORD=un_mot_de_passe_super_fort
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
JWT_REFRESH_SECRET=une_autre_cle_secrete
```

## 🌐 Déploiement

### Docker Hub

```bash
# Build l'image
docker build -t afroitalia/api:latest .

# Push sur Docker Hub
docker push afroitalia/api:latest
```

### Production

Pour la production, utilisez des orchestrateurs comme :
- **Docker Swarm**
- **Kubernetes**
- **AWS ECS**
- **Google Cloud Run**

## 📝 Structure des Volumes

Les données persistantes sont stockées dans des volumes Docker :

```
volumes/
├── postgres_data/  # Base de données PostgreSQL
├── redis_data/     # Cache Redis
└── uploads/        # Fichiers uploadés
```

Pour voir les volumes :

```bash
docker volume ls
```

## 🧹 Nettoyage

```bash
# Arrêter tous les conteneurs
docker-compose down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Supprimer les images
docker rmi afroitalia-server_api

# Nettoyage complet Docker
docker system prune -a --volumes
```

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
