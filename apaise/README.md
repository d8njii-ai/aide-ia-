# Apaise 🌿 — compagnon d'écoute (APK Android)

Application de chat avec une IA bienveillante qui écoute, réconforte et aide (rôle de psychologue), en français. Elle inclut un bouton **SOS** (3114, 112, 15, 119, 3919) et un protocole de sécurité en cas de détresse.

## Obtenir l'APK (sans rien installer sur ton PC)

1. Crée un compte gratuit sur https://github.com et un nouveau dépôt (privé si tu veux).
2. Envoie-y tout le contenu de ce dossier (bouton « Add file » → « Upload files »), **y compris le dossier `.github`**.
3. Va dans l'onglet **Actions** → « Build APK » → **Run workflow**.
4. Au bout de 5 à 10 minutes, ouvre l'exécution terminée, descends à **Artifacts** et télécharge `apaise-apk`.
5. Dézippe, transfère `app-debug.apk` sur ton téléphone et ouvre-le (autorise l'installation depuis des sources inconnues).

## Premier lancement

- Ouvre l'app → ⚙️ Réglages → colle ta **clé API Anthropic** (à créer sur https://console.anthropic.com). Elle reste uniquement sur ton téléphone.
- L'usage de l'API est facturé selon la consommation (quelques centimes pour de longues conversations).

## Tester tout de suite sans APK

Héberge le dossier `www/` sur n'importe quel hébergeur statique (GitHub Pages, Netlify…), ouvre le lien sur ton téléphone dans Chrome, puis menu ⋮ → « Ajouter à l'écran d'accueil » : l'app s'installe comme une vraie application.

## Personnaliser

- Le comportement de l'IA est dans `www/app.js` (constante `SYSTEM_PROMPT`).
- Les couleurs sont dans `www/style.css`.
- Le modèle utilisé est `claude-sonnet-5-5` (constante `MODEL`).

## Important

- Pour un usage **personnel**, la clé saisie dans l'app suffit. Si tu veux **publier** l'app à d'autres personnes, ne distribue jamais ta propre clé dans l'APK : il faut un petit serveur intermédiaire qui garde la clé secrète.
- L'IA ne remplace pas un professionnel de santé. En cas de danger : 3114 (24h/24) ou 112.
