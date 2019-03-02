const electron = require('electron');
const fs = require('fs');
const path = require('path');
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(`${__dirname}/repo.sqlite`);

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

ipcMain.on('dbcreate:request', (event) => {
    db.serialize(function() {
      db.run("CREATE TABLE lorem (info TEXT)");
     
      var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();
     
      db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
          console.log(row.id + ": " + row.info);
      });
    });
     
    db.close();
});

ipcMain.on('data:request', (event, path) => {
    var chartData = walkSync(path);

    mainWindow.webContents.send('data:response', chartData);
});