# 📋 Instructions Étape par Étape - Solana Messenger

## 🎯 Résumé du Projet

J'ai créé une application de messagerie chiffrée complète avec :
- ✅ Interface utilisateur professionnelle et moderne
- ✅ Connexion avec Phantom Wallet
- ✅ Chiffrement end-to-end
- ✅ Base de données PostgreSQL avec Prisma
- ✅ API REST complète

## 📁 Fichiers Créés

### Configuration
- `prisma/schema.prisma` - Modèle de base de données
- `package.json` - Dépendances et scripts
- `.env.example` - Variables d'environnement (à copier en `.env`)

### Backend/API
- `src/lib/encryption.ts` - Chiffrement avec tweetnacl
- `src/lib/solana-auth.ts` - Authentification Solana
- `src/lib/prisma.ts` - Client base de données
- `src/app/api/messages/route.ts` - API messages
- `src/app/api/auth/route.ts` - API authentification

### Frontend
- `src/contexts/WalletContext.tsx` - Gestion des wallets
- `src/components/WalletButton.tsx` - Bouton de connexion
- `src/components/MessageList.tsx` - Liste des messages
- `src/components/SendMessage.tsx` - Formulaire d'envoi
- `src/app/page.tsx` - Page principale
- `src/app/layout.tsx` - Layout avec contexte

## 🚀 Commandes à Exécuter

### 1. Configuration de l'environnement

```bash
# Naviguer dans le dossier du projet
cd solana-messenger

# Créer le fichier .env (copier le contenu ci-dessous)
cp .env.example .env
```

**Contenu du fichier `.env` à créer :**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/solana_messenger?schema=public"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this"

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
```

### 2. Configuration de PostgreSQL

**Option A : PostgreSQL local**
```bash
# Installer PostgreSQL (macOS avec Homebrew)
brew install postgresql
brew services start postgresql

# Créer la base de données
createdb solana_messenger
```

**Option B : PostgreSQL en ligne (Supabase/Neon)**
1. Créer un compte sur https://supabase.com ou https://neon.tech
2. Créer une nouvelle base de données
3. Copier l'URL de connexion dans `.env`

### 3. Migration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio pour voir la base de données
npx prisma studio
```

### 4. Lancement de l'application

```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## 🎮 Comment Utiliser l'Application

### 1. Installation de Phantom Wallet
- Aller sur https://phantom.app/
- Installer l'extension pour votre navigateur
- Créer ou importer un wallet Solana

### 2. Connexion
1. Ouvrir http://localhost:3000
2. Cliquer sur "Connecter Phantom Wallet"
3. Approuver la connexion dans Phantom
4. Cliquer sur "S'authentifier"
5. Signer le message d'authentification

### 3. Envoyer un message
1. Aller dans l'onglet "Nouveau message"
2. Entrer l'adresse Solana du destinataire
3. Taper le message
4. Cliquer sur "Envoyer le message chiffré"

### 4. Lire les messages
1. Aller dans l'onglet "Messages reçus"
2. Cliquer sur "Lire" pour déchiffrer un message
3. Le message apparaîtra en clair

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de développement
npm run build           # Construire pour la production
npm run start           # Lancer en production

# Base de données
npm run db:generate     # Générer le client Prisma
npm run db:migrate      # Appliquer les migrations
npm run db:push         # Pousser le schéma vers la DB
npm run db:studio       # Ouvrir Prisma Studio

# Installation complète
npm run setup           # Installer + générer + migrer
```

## 🐛 Résolution de Problèmes

### Erreur "Phantom Wallet non trouvé"
- Vérifier que l'extension Phantom est installée
- Actualiser la page après installation

### Erreur de base de données
- Vérifier que PostgreSQL est démarré
- Vérifier l'URL dans `.env`
- Exécuter `npx prisma generate`

### Erreur de chiffrement
- Vérifier que vous êtes authentifié
- Se reconnecter au wallet si nécessaire

### Erreur "Module not found"
- Exécuter `npm install`
- Vérifier que tous les fichiers sont présents

## 📱 Interface Utilisateur

L'interface est divisée en plusieurs sections :

1. **Header** : Logo et bouton de connexion wallet
2. **Écran d'accueil** : Description et fonctionnalités (non connecté)
3. **Navigation par onglets** : Messages reçus / Nouveau message
4. **Liste des messages** : Affichage des messages chiffrés avec bouton de déchiffrement
5. **Formulaire d'envoi** : Champs destinataire et message avec validation

## 🔒 Sécurité

- **Chiffrement NaCl** : Utilise tweetnacl pour un chiffrement robuste
- **Clés éphémères** : Chaque message a sa propre paire de clés
- **Authentification par signature** : Impossible de falsifier l'identité
- **Validation des adresses** : Vérification de la validité des adresses Solana

## 🚀 Prochaines Étapes

Pour améliorer l'application :

1. **JWT Tokens** : Remplacer les tokens simples par JWT
2. **Notifications** : Ajouter des notifications en temps réel
3. **Groupes** : Permettre les messages de groupe
4. **Métadonnées** : Ajouter des informations sur les messages (lu/non lu, etc.)
5. **Tests** : Ajouter des tests unitaires et d'intégration

## 📞 Support

Si tu rencontres des problèmes :
1. Vérifier les logs dans la console du navigateur
2. Vérifier les logs du serveur dans le terminal
3. S'assurer que toutes les dépendances sont installées
4. Vérifier la configuration de la base de données

L'application est maintenant prête à être utilisée ! 🎉
