# App Collections - Release Notes

## Installation

### Application Portable (Recommandée)
1. Téléchargez le fichier `App-Collections-Portable-X.X.X.exe`
2. Double-cliquez sur l'exécutable pour lancer l'application
3. Aucune installation n'est requise !


### Installation via Installeur (Setup)
1. Téléchargez le fichier `App-Collections-Setup-X.X.X.exe`
2. Double-cliquez pour lancer l'installeur
3. Suivez les étapes de l'assistant d'installation:
   - Acceptez la licence
   - Choisissez le dossier d'installation (par défaut: `C:\Program Files\App Collections`)
   - L'application crée automatiquement des raccourcis sur le Bureau et dans le menu Démarrage
4. Cliquez sur "Terminer"
5. Lancez l'application depuis le raccourci créé ou le menu Démarrer

**Avantages de l'installeur:**
- Installation standard avec désinstallation complète
- Raccourcis automatiques sur le Bureau et le menu Démarrer
- Meilleure intégration système
- Plus facile à désinstaller via "Ajout/Suppression de programmes"


**Prérequis:** .NET 10 Runtime (téléchargez depuis: https://dotnet.microsoft.com/download/dotnet/10.0)

## Fonctionnalités

- ✨ Gestion de collections d'objets
- 📦 Interface utilisateur moderne avec React
- 🔄 Backend en C# avec API REST
- 💾 Base de données SQLite locale
- 🖼️ Support des images

## Configuration Requise

- **Système d'exploitation:** Windows 10/11 (64-bit)
- **Mémoire:** 4 GB RAM minimum
- **Espace disque:** 200 MB
- **.NET Runtime:** .NET 10.0 ou supérieur

## Utilisation

1. Lancez l'application en double-cliquant sur l'exécutable
2. L'interface web se charge automatiquement
3. Le serveur backend démarre automatiquement en arrière-plan

## Données de l'application

Les données sont stockées localement dans un dossier `data.sqlite` situé dans le même répertoire que l'exécutable.

## Problèmes Connus

- Le premier démarrage peut prendre quelques secondes
- Un pare-feu peut demander l'autorisation pour le serveur backend (port 5000)

## Support

Pour signaler un bug ou demander une fonctionnalité, veuillez créer une issue sur GitHub.

## Construction

Pour construire l'application depuis les sources:

```powershell
.\build-portable.ps1
```

L'exécutable sera généré dans le dossier `electron-app\release\`.

## License

Voir le fichier LICENSE pour plus de détails.
