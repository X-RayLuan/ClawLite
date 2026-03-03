const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
const win = new BrowserWindow({
width: 1280,
height: 820,
minWidth: 1024,
minHeight: 700,
backgroundColor: '#0b1020',
show: false,
autoHideMenuBar: true,
webPreferences: {
contextIsolation: true,
nodeIntegration: false,
sandbox: true
}
});

const isDev = !app.isPackaged;

// Open external links in system browser
win.webContents.setWindowOpenHandler(({ url }) => {
shell.openExternal(url);
return { action: 'deny' };
});

win.webContents.on('will-navigate', (event, url) => {
const allowed = isDev
? url.startsWith('http://127.0.0.1:3000')
: url.startsWith('file://');

if (!allowed) {
event.preventDefault();
shell.openExternal(url);
}
});

if (isDev) {
win.loadURL('http://127.0.0.1:3000');
win.webContents.openDevTools({ mode: 'detach' });
} else {
// IMPORTANT: this must match your static export output directory
// If your build outputs to "out/", keep this.
// If different, update accordingly.
const indexPath = path.join(__dirname, 'out', 'index.html');
win.loadFile(indexPath);
}

win.once('ready-to-show', () => {
win.show();
});

win.webContents.on('did-fail-load', (_event, code, desc, url) => {
console.error('[ClawLite] did-fail-load:', { code, desc, url });
});
}

app.whenReady().then(() => {
createWindow();

app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
});

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit();
});





