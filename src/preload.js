const { contextBridge, ipcRenderer, ipcMain } = require('electron');
const fs = require("fs");

console.log("Preloading context bridge...");

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once(channel, func) {
        ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    send(channel, ...args){
      ipcRenderer.send(channel, ...args);
    },
    sendSync(channel, ...args){
      ipcRenderer.sendSync(channel, ...args);
    },
    removeAllListeners(channel){
      ipcRenderer.removeAllListeners(channel);
    }
  },
  fileOps: {
    readFileSync(p){
      return fs.readFileSync(p, {encoding:"UTF-8"});
    },
    existsSync(p){
      return fs.existsSync(p);
    },
    writeFileSync(path, content) {
      return fs.writeFileSync(path, content, { encoding: "UTF-8" });
  }
  }
});