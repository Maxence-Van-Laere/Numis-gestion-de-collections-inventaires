const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
// Import explicite du module local pour éviter les résolutions ambiguës en production
const db = require('./db.js');

let backendProcess = null;

function setupAutoUpdater() {
  if (isDev || !app.isPackaged || process.platform !== 'win32') return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (error) => {
    console.warn('Auto-update error:', error.message);
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`Update available: ${info.version}`);
  });

  autoUpdater.on('update-downloaded', async () => {
    const result = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Redémarrer maintenant', 'Plus tard'],
      defaultId: 0,
      cancelId: 1,
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de Numis est prête à être installée.',
      detail: 'L’application va redémarrer pour terminer la mise à jour.'
    });

    if (result.response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.warn('Unable to check for updates:', error.message);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    // En production, charger depuis dist/
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Production: loading', indexPath);
    win.loadFile(indexPath);
  }
}

app.whenReady().then(async () => {
  await db.init();
  // Start C# backend in dev mode if available
  if (isDev) {
    try {
      const projPath = path.join(__dirname, '..', 'csharp-server');
      backendProcess = spawn('dotnet', ['run', '--project', projPath], { stdio: 'inherit' });
    } catch (e) {
      console.warn('Unable to start C# backend automatically:', e.message);
    }
  } else {
    // En production, depuis le dossier resources/
    try {
      const backendPath = path.join(process.resourcesPath, 'backend', 'csharp-server.exe');
      const backendCwd = path.dirname(backendPath);
      backendProcess = spawn(backendPath, [], {
        cwd: backendCwd,
        windowsHide: true
      });
      backendProcess.on('error', (e) => {
        console.warn('Unable to start backend:', e.message);
        dialog.showErrorBox('Backend error', `Impossible de démarrer le backend.\n${e.message}`);
      });
      backendProcess.on('exit', (code) => {
        if (code && code !== 0) {
          console.warn('Backend exited with code:', code);
        }
      });
    } catch (e) {
      console.warn('Unable to start backend:', e.message);
      dialog.showErrorBox('Backend error', `Impossible de démarrer le backend.\n${e.message}`);
    }
  }
  createWindow();
  setupAutoUpdater();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (backendProcess) {
    try { backendProcess.kill(); } catch (e) { /* ignore */ }
  }
});

// Keep existing IPC handlers for compatibility (local DB JS)
ipcMain.handle('collections:list', async () => db.getCollections());
ipcMain.handle('collections:create', async (e, name) => db.createCollection(name));
ipcMain.handle('objects:list', async (e, collectionId) => db.getObjects(collectionId));
ipcMain.handle('objects:create', async (e, obj) => db.createObject(obj));
ipcMain.handle('objects:delete', async (e, id) => db.deleteObject(id));

