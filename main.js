const {
    app,
    BrowserWindow,
    shell
} = require("electron");

function createWindow() {

    const win = new BrowserWindow({

        width: 1000,
        height: 800,
        minWidth: 700,
        minHeight: 600,

        webPreferences: {
            contextIsolation: true
        }

    });

    // Open external websites in the normal browser
    win.webContents.setWindowOpenHandler(({ url }) => {

        if (url.startsWith("https://")) {
            shell.openExternal(url);
        }

        return {
            action: "deny"
        };

    });

    win.loadFile("index.html");
}

app.whenReady().then(() => {

    createWindow();

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }

    });

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});