# Instructions pour configurer les nouvelles informations d'identification Gmail

## 1. Créer un nouveau mot de passe d'application Google

1. Allez sur https://myaccount.google.com/security
2. Activez la validation en deux étapes si ce n'est pas déjà fait
3. Allez dans "Mots de passe des applications"
4. Créez un nouveau mot de passe d'application :
   - Sélectionnez "Autre (nom personnalisé)"
   - Nommez-le "Penventory App"
   - Copiez le mot de passe généré (16 caractères sans espaces)

## 2. Mettre à jour votre fichier .env local

Ajoutez ou modifiez ces variables dans votre fichier `.env` :

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=moncefbensalem222@gmail.com
EMAIL_SERVER_PASSWORD=votre_nouveau_mot_de_passe_application
EMAIL_FROM=moncefbensalem222@gmail.com
```

## 3. Mettre à jour les variables d'environnement en production (Vercel)

1. Allez sur le dashboard Vercel de votre projet
2. Cliquez sur "Settings" > "Environment Variables"
3. Mettez à jour les variables suivantes :
   - `EMAIL_SERVER_USER`: moncefbensalem222@gmail.com
   - `EMAIL_SERVER_PASSWORD`: votre_nouveau_mot_de_passe_application
   - `EMAIL_FROM`: moncefbensalem222@gmail.com

## 4. Débloquer l'accès Gmail

1. Visitez https://accounts.google.com/DisplayUnlockCaptcha
2. Connectez-vous avec votre compte Gmail (moncefbensalem222@gmail.com)
3. Cliquez sur "Continuer" pour autoriser l'accès

## 5. Vérifier les paramètres de sécurité Gmail

1. Allez sur https://myaccount.google.com/lesssecureapps
2. Activez "Autoriser les applications moins sécurisées"
3. Ou utilisez uniquement un mot de passe d'application (recommandé)

## 6. Redéployez votre application

Après avoir mis à jour les variables d'environnement, redéployez votre application pour appliquer les changements.
