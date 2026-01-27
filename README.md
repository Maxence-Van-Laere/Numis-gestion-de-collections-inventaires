# App Collections

## Guide Téléchargement et utilisation

Pour obtenir et utiliser cette application de gestion d'inventaires/collections, veuillez vous référez [App_Download.md](App_Download.md)


## Guide Développement

Application desktop pour gérer des collections/inventaires, composée de :
- Frontend: Electron + React (Vite)
- Backend: ASP.NET Core minimal API (C#) sur http://127.0.0.1:5555
- Base de données: LiteDB (fichier `csharp-server/data.db`, créé automatiquement)

### Fonctionnalités
- Page Accueil/Collection : liste des différentes collections (nbr d'éléments, date de création & modification)
- Page Objets : affichage complet/par collection, déplacer/supprimer/modifier/ajouter un nouvel objet; cliquer sur l'objet pour obtenir plus d'informations (photos, nom, date de production & d'acquisition, commentaires, appartenance à une collection)
- Page Préférence : Toggle Thème clair/sombre
  
### Architecture
- `electron-app/`: UI React + Electron. Le preload expose une API Web qui appelle le backend C# (voir `electron-app/preload.js`). En mode dev, Electron tente de démarrer automatiquement le backend via `dotnet run`.
- `csharp-server/`: API REST en C# (Minimal API) qui persiste les données dans LiteDB. Le fichier de base de données est créé dans `csharp-server/data.db`.
- Un module SQLite local (`electron-app/db.js`) existe pour des handlers IPC historiques; l’interface principale passe par l’API REST.

### Prérequis
- Node.js 18+ et npm
- .NET SDK (compatible avec les cibles du projet: `net9.0`/`net10.0`)
- Windows 

### Installation
#### Frontend (Electron + React)
```powershell
cd electron-app
npm install
```

#### Backend (C#)
```powershell
cd csharp-server
# Facultatif mais recommandé en cas de changements récents
dotnet restore
```

### Lancer en développement
Vous pouvez lancer les deux parties séparément, ou laisser Electron démarrer le backend.

#### Option A: lancer séparément
- Backend:
```powershell
cd csharp-server
dotnet run
```
- Frontend:
```powershell
cd electron-app
npm run dev
```

#### Option B: via Electron (auto-start backend)
```powershell
cd electron-app
npm run dev
```
Electron démarre Vite et tente de lancer le backend avec `dotnet run --project ../csharp-server`.

### Base de données (LiteDB)
- Chemin: `csharp-server/data.db`
- Création: automatique au premier accès (ex: appel API)
- Versionnement: ignorée par Git grâce au `.gitignore` (`*.db`). Ne pas pousser les données en prod.
- Vérifier le chemin via: `http://127.0.0.1:5555/debug/stats` (champ `dbPath`).

### Principaux Endpoints (Backend)
- `GET /`: ping (vérifie que le backend tourne)
- `GET /collections`: liste des collections
- `POST /collections { name }`: création d’une collection
- `DELETE /collections/{id}`: suppression d’une collection
- `GET /collections/{id}/objects`: objets d’une collection
- `GET /objects`: tous les objets
- `POST /objects`: création d’un objet
- `PUT /objects/{id}`: mise à jour d’un objet
- `DELETE /objects/{id}`: suppression d’un objet
- `POST /objects/move { objectIds, targetCollectionId }`: déplacer des objets
- `POST /upload` (form-data, fichier): upload d’image
- `GET /files/{filename}`: servir une image
- `GET /debug/stats`: stats + chemin DB

### Développement UI
- Code React dans `electron-app/src/`
- Pages: `views/` (Home, Collections, Utilisateur)
- Composants: `components/` (Drawer, Listes, Formulaires, Détails)

### Bonnes pratiques
- Ne pas versionner `data.db` (déjà ignoré par `.gitignore`).
- Ne pas stocker d’images lourdes dans Git; elles sont stockées dans `csharp-server/uploads/` et seul le chemin de ces images est stocké dans LiteDB (également à ignorer si besoin).
- Redémarrer le backend après changement du chemin DB.

### Dépannage
- Si `/debug/stats` montre un chemin en `bin/Debug/net...`, assurez-vous que le projet utilise la résolution vers `csharp-server/data.db` (déjà corrigé dans `Database.cs` et l’affichage du chemin est aligné dans `Program.cs`).
- Si `npm run dev` échoue, vérifiez que Vite et Electron sont installés (`npm install`) et que le port `5173` est libre.
- Si le backend ne démarre pas via Electron, lancez-le manuellement avec `dotnet run` dans `csharp-server/`.

