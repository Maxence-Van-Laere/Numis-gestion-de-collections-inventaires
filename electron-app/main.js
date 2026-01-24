const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');
const db = require(path.join(__dirname, 'db'));

let backendProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
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
  }
  createWindow();

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
