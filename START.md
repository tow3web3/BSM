# 🚀 Démarrage Rapide - Solana Messenger

## ⚡ Commandes Essentielles

### 1. Configuration Initiale
```bash
# Aller dans le dossier du projet
cd solana-messenger

# Créer le fichier .env
cp .env.example .env
```

### 2. Modifier le fichier .env
Ouvre le fichier `.env` et remplace :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/solana_messenger?schema=public"
```
Par ton URL de base de données PostgreSQL.

### 3. Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init
```

### 4. Lancer l'Application
```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur : **http://localhost:3000**

## 📱 Test Rapide

1. **Installer Phantom Wallet** : https://phantom.app/
2. **Ouvrir** : http://localhost:3000
3. **Connecter** ton wallet Phantom
4. **S'authentifier** en signant le message
5. **Envoyer un message** à une autre adresse Solana

## 🔧 Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Construction
npm run start        # Production
npm run db:generate  # Générer Prisma
npm run db:migrate   # Migrations
npm run db:studio    # Interface DB
```

## 🆘 Problèmes Courants

### Erreur "Phantom Wallet non trouvé"
- Installer l'extension Phantom
- Actualiser la page

### Erreur de base de données
- Vérifier PostgreSQL est démarré
- Vérifier l'URL dans `.env`

### Erreur de build
- Exécuter `npm install`
- Exécuter `npx prisma generate`

## 📞 Support

Si tu as des problèmes :
1. Vérifier les logs dans le terminal
2. Vérifier la console du navigateur
3. S'assurer que PostgreSQL fonctionne

**L'application est prête ! 🎉**
