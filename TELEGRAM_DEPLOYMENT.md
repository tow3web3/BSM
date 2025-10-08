# 🚀 Déploiement du Bot Telegram 24/7

## Option 1: Webhook sur Render (RECOMMANDÉ) ⭐

### Avantages
- ✅ Gratuit
- ✅ Toujours actif avec ton app
- ✅ Pas de serveur séparé
- ✅ Déjà configuré dans le code

### Configuration

1. **Ajouter la variable d'environnement sur Render:**
   - Va sur ton Dashboard Render
   - Sélectionne ton service BSM
   - Environment → Add Environment Variable
   - Nom: `TELEGRAM_BOT_TOKEN`
   - Valeur: Ton token de BotFather

2. **Redéployer:**
   - Render redéploiera automatiquement
   - Ou push ton code sur GitHub (trigger auto-deploy)

3. **Configurer le webhook** (une seule fois):
```bash
curl -X POST https://api.telegram.org/bot<TON_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ton-site.onrender.com/api/telegram/webhook"}'
```

4. **Vérifier:**
```bash
curl https://api.telegram.org/bot<TON_TOKEN>/getWebhookInfo
```

Tu devrais voir:
```json
{
  "url": "https://ton-site.onrender.com/api/telegram/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

### ✅ C'est tout! Bot actif 24/7

---

## Option 2: Railway.app

1. Créer compte sur railway.app
2. New Project → Deploy from GitHub
3. Sélectionner ton repo
4. Ajouter variable: `TELEGRAM_BOT_TOKEN`
5. Même configuration webhook

---

## Option 3: Fly.io

1. Installer Fly CLI
2. `fly launch`
3. Configurer secrets: `fly secrets set TELEGRAM_BOT_TOKEN=ton_token`
4. `fly deploy`

---

## Test du Bot

Après configuration, teste:

```
/start → Devrait répondre
/link → Devrait donner un code
/status → Devrait checker le statut
```

## Commandes Rapides

**Voir webhook info:**
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

**Supprimer webhook (revenir au polling):**
```bash
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

**Set webhook:**
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://your-domain.com/api/telegram/webhook"
```

## Monitoring

- Vérifie les logs Render pour voir les requêtes
- Teste `/start` dans Telegram
- Envoie un message BSM test pour vérifier les notifications

## Dépannage

**Bot ne répond pas:**
1. Vérifier que `TELEGRAM_BOT_TOKEN` est dans Render
2. Vérifier que l'app est déployée
3. Vérifier le webhook: `/getWebhookInfo`
4. Checker les logs Render

**Notifications ne marchent pas:**
1. Vérifier que l'utilisateur a linkà avec `/link`
2. Vérifier que les notifications sont ON
3. Checker les logs de l'API

## Production Checklist

- [ ] `TELEGRAM_BOT_TOKEN` ajouté sur Render
- [ ] App redéployée
- [ ] Webhook configuré
- [ ] Bot testé avec `/start`
- [ ] Linking testé avec code de vérification
- [ ] Notification testée en envoyant un message

---

**Le webhook est BEAUCOUP mieux que le polling pour la production!** 🎯

