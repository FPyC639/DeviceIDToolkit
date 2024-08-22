const { app, BrowserWindow, ipcMain, dialog } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);



app.on('window-all-closed', () => {
    app.quit();
});
