const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('crossifyDesktop', {
  getProjectPath: () => ipcRenderer.invoke('crossify:get-project-path'),
  getLaunchProject: () => ipcRenderer.invoke('crossify:get-launch-project'),
  chooseProjectPath: (options) => ipcRenderer.invoke('crossify:choose-project-path', options || {}),
  saveProject: (project, options) => ipcRenderer.invoke('crossify:save-project', project, options || {}),
  openProject: () => ipcRenderer.invoke('crossify:open-project'),
})
