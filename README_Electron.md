# App Collections — Desktop (Electron + React + SQLite)

Ce scaffold ajoute une application desktop minimale utilisant Electron, React et SQLite.

Installation (depuis le dossier `electron-app`):

```powershell
cd electron-app
npm install
```

Démarrage en développement (lancer UI et Electron):

```powershell
npm run dev:ui    # lance Vite
# dans un autre terminal
npm run dev:electron
```

Ou utiliser la commande combinée (nécessite `concurrently`):

```powershell
npm run dev
```

Notes:
- L'API du process principal est exposée via `window.api` (préload). Les méthodes disponibles: `listCollections`, `createCollection`, `listObjects`, `createObject`, `deleteObject`.
- Le fichier SQLite est `electron-app/data.sqlite`.
- Pour production, build le front (`npm run build`) puis configure Electron pour charger les fichiers dist.
