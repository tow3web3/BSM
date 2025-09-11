# 🧪 Test de l'Application Solana Messenger

## ✅ Checklist de Test

### 1. Configuration de Base
- [ ] Fichier `.env` créé avec les bonnes variables
- [ ] Base de données PostgreSQL accessible
- [ ] Migration Prisma appliquée
- [ ] Client Prisma généré

### 2. Installation
- [ ] `npm install` exécuté sans erreur
- [ ] `npm run dev` démarre le serveur
- [ ] Application accessible sur http://localhost:3000

### 3. Interface Utilisateur
- [ ] Page d'accueil s'affiche correctement
- [ ] Design responsive et moderne
- [ ] Bouton "Connecter Phantom Wallet" visible
- [ ] Messages d'erreur clairs

### 4. Connexion Wallet
- [ ] Phantom Wallet installé dans le navigateur
- [ ] Bouton de connexion fonctionne
- [ ] Popup Phantom s'ouvre
- [ ] Connexion réussie
- [ ] Adresse du wallet affichée

### 5. Authentification
- [ ] Bouton "S'authentifier" visible après connexion
- [ ] Message d'authentification généré
- [ ] Signature demandée dans Phantom
- [ ] Authentification réussie
- [ ] Interface utilisateur mise à jour

### 6. Navigation
- [ ] Onglets "Messages reçus" et "Nouveau message" visibles
- [ ] Changement d'onglet fonctionne
- [ ] Interface adaptée selon l'onglet actif

### 7. Envoi de Messages
- [ ] Formulaire d'envoi s'affiche
- [ ] Champ destinataire avec validation
- [ ] Champ message fonctionnel
- [ ] Bouton d'envoi actif
- [ ] Validation des adresses Solana
- [ ] Message chiffré envoyé
- [ ] Confirmation d'envoi

### 8. Réception de Messages
- [ ] Liste des messages s'affiche
- [ ] Messages chiffrés visibles
- [ ] Bouton "Lire" pour chaque message
- [ ] Déchiffrement fonctionnel
- [ ] Contenu du message affiché

### 9. Sécurité
- [ ] Messages chiffrés en base de données
- [ ] Impossible de lire sans clé privée
- [ ] Authentification requise
- [ ] Validation des adresses

### 10. Base de Données
- [ ] Messages stockés correctement
- [ ] Champs requis présents
- [ ] Timestamps corrects
- [ ] Relations entre tables

## 🐛 Tests d'Erreurs

### Cas d'Erreur à Tester
- [ ] Connexion sans Phantom Wallet
- [ ] Adresse de destinataire invalide
- [ ] Message vide
- [ ] Déconnexion wallet
- [ ] Erreur réseau
- [ ] Base de données indisponible

### Messages d'Erreur Attendu
- "Phantom Wallet non trouvé"
- "Adresse de wallet invalide"
- "Message requis"
- "Erreur lors de l'envoi"
- "Impossible de déchiffrer ce message"

## 📊 Métriques de Performance

### Temps de Chargement
- [ ] Page d'accueil < 2 secondes
- [ ] Connexion wallet < 3 secondes
- [ ] Authentification < 5 secondes
- [ ] Envoi message < 3 secondes
- [ ] Déchiffrement < 1 seconde

### Compatibilité
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile responsive

## 🔧 Commandes de Debug

```bash
# Vérifier les logs du serveur
npm run dev

# Vérifier la base de données
npx prisma studio

# Vérifier les types TypeScript
npx tsc --noEmit

# Vérifier les erreurs ESLint
npm run lint

# Nettoyer et reconstruire
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Rapport de Test

### Date du Test : ___________
### Testeur : ___________
### Navigateur : ___________
### Version Phantom : ___________

### Résultats :
- ✅ Tests réussis : ___/10
- ❌ Tests échoués : ___/10
- ⚠️ Problèmes mineurs : ___

### Commentaires :
_________________________________
_________________________________
_________________________________

### Recommandations :
_________________________________
_________________________________
_________________________________
