# 🔐 Solana Messenger - Messagerie Chiffrée

Une application de messagerie chiffrée de bout en bout utilisant des wallets Solana pour l'authentification et le chiffrement.

## ✨ Fonctionnalités

- 🔗 Connexion avec Phantom Wallet
- 🔐 Authentification par signature (Sign-In With Solana)
- 🔒 Chiffrement end-to-end avec tweetnacl
- 📨 Envoi et réception de messages chiffrés
- 💾 Stockage sécurisé en base de données PostgreSQL
- 🎨 Interface utilisateur moderne et responsive

## 🚀 Installation et Configuration

### 1. Prérequis

- Node.js 18+ 
- PostgreSQL
- Phantom Wallet (extension navigateur)

### 2. Installation des dépendances

```bash
cd solana-messenger
npm install
```

### 3. Configuration de la base de données

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/solana_messenger?schema=public"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Solana
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
```

### 4. Configuration PostgreSQL

Créez une base de données PostgreSQL :

```sql
CREATE DATABASE solana_messenger;
```

### 5. Migration de la base de données

```bash
npx prisma migrate dev --name init
```

### 6. Génération du client Prisma

```bash
npx prisma generate
```

### 7. Lancement du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Utilisation

### Connexion

1. Installez l'extension Phantom Wallet dans votre navigateur
2. Créez ou importez un wallet Solana
3. Cliquez sur "Connecter Phantom Wallet"
4. Approuvez la connexion dans Phantom
5. Cliquez sur "S'authentifier" pour signer le message d'authentification

### Envoi de messages

1. Allez dans l'onglet "Nouveau message"
2. Entrez l'adresse Solana du destinataire
3. Tapez votre message
4. Cliquez sur "Envoyer le message chiffré"

### Réception de messages

1. Les messages reçus apparaissent dans l'onglet "Messages reçus"
2. Cliquez sur "Lire" pour déchiffrer un message
3. Le message sera automatiquement déchiffré avec votre clé privée

## 🔧 Architecture Technique

### Frontend

- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **TailwindCSS** pour le styling
- **React Context** pour la gestion d'état du wallet

### Backend

- **Next.js API Routes** pour les endpoints REST
- **Prisma ORM** pour l'accès à la base de données
- **PostgreSQL** pour le stockage des messages

### Chiffrement

- **tweetnacl** pour le chiffrement NaCl
- **Clés éphémères** générées pour chaque message
- **Chiffrement asymétrique** avec les clés publiques Solana

### Authentification

- **Sign-In With Solana** (signature de messages)
- **Tokens de session** simples (à améliorer avec JWT en production)

## 📁 Structure du Projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # API d'authentification
│   │   └── messages/route.ts      # API des messages
│   ├── layout.tsx                 # Layout principal
│   └── page.tsx                   # Page d'accueil
├── components/
│   ├── MessageList.tsx           # Liste des messages reçus
│   ├── SendMessage.tsx           # Formulaire d'envoi
│   └── WalletButton.tsx          # Bouton de connexion wallet
├── contexts/
│   └── WalletContext.tsx         # Contexte Solana wallet
├── lib/
│   ├── encryption.ts             # Utilitaires de chiffrement
│   ├── prisma.ts                 # Client Prisma
│   └── solana-auth.ts            # Authentification Solana
└── generated/
    └── prisma/                   # Client Prisma généré
```

## 🔒 Sécurité

- **Chiffrement end-to-end** : Seuls l'expéditeur et le destinataire peuvent lire les messages
- **Authentification par signature** : Impossible de falsifier l'identité
- **Clés éphémères** : Chaque message utilise une nouvelle paire de clés
- **Validation des adresses** : Vérification de la validité des adresses Solana

## 🚀 Déploiement

### Variables d'environnement de production

```env
DATABASE_URL="postgresql://user:pass@host:5432/solana_messenger"
NEXTAUTH_SECRET="your-production-secret"
NEXT_PUBLIC_SOLANA_NETWORK="mainnet"  # ou "devnet" pour les tests
```

### Déploiement sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Déploiement sur Render

1. Créez un service Web sur Render
2. Connectez votre repository
3. Configurez PostgreSQL comme service séparé
4. Définissez les variables d'environnement

## 🐛 Dépannage

### Erreurs communes

1. **"Phantom Wallet non trouvé"** : Installez l'extension Phantom
2. **"Adresse invalide"** : Vérifiez le format de l'adresse Solana
3. **"Erreur de chiffrement"** : Vérifiez que vous êtes bien authentifié
4. **"Base de données non accessible"** : Vérifiez la configuration DATABASE_URL

### Logs de débogage

Activez les logs détaillés :

```bash
DEBUG=* npm run dev
```

## 📝 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.