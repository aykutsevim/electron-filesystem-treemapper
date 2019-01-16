const electron = require('electron');
const fs = require('fs');
const path = require('path');

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({});

    mainWindow.loadURL(`file://${__dirname}/index.html`);
});

// List all files in a directory in Node.js recursively in a synchronous fashion
const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);
        if (dirent.isDirectory()) {
        console.log('directory', path.join(dir, file));
        var odir = {
            name: dirFile,
            children: []
        }
        odir.children = walkSync(dirFile, dir.files);
        filelist.push(odir);
        } else {
        filelist.push({
            name: dirFile,
            value: dirent.size
        });
        }
    }
    return filelist;
};


ipcMain.on('data:request', (event, path) => {
    var chartData = walkSync(path);

    mainWindow.webContents.send('data:response', chartData);
});