import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { writeUrlFile, fetchUrl, mkdir } from './network';
import * as path from 'path';

function createWindow() {
    const mainWindow = new BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        width: 800
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
    return mainWindow;
}

app.on('ready', () => {
    const mainWindow = createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.handle('download', async (event, url: string, path: string) => {
        return await writeUrlFile(url, path);
    });
    ipcMain.handle('fetch', async (event, url: string) => {
        return await fetchUrl(url);
    });
    ipcMain.handle('mkdir', async (event, path: string) => {
        return await mkdir(path);
    });
    ipcMain.handle('select', async (event, title: string) => {
        const result = await dialog.showOpenDialog({
            title: title,
            properties: [
                'createDirectory',
                'openDirectory',
                'dontAddToRecent',
                'promptToCreate'
            ]
        });
        return result.filePaths[0];
    });
    ipcMain.handle(
        'message',
        async (
            event,
            level: string,
            title: string,
            message: string,
            buttons: Array<string> = []
        ) => {
            const result = await dialog.showMessageBox(mainWindow, {
                message: message,
                type: level,
                title: title,
                buttons: buttons
            });
            return result.response;
        }
    );
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
