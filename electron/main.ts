import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        width: 800,
    });

    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    mainWindow.webContents.openDevTools();
}

app.on("ready", () => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('debug', function (event, name: string, value: number) {
        console.log(name + '=' + value);
    })
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});