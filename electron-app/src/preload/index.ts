import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CallZomeRequestUnsigned } from '@holochain/client'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('dialog', {
      openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config)
    });
    contextBridge.exposeInMainWorld('__HC_ZOME_CALL_SIGNER__', {
      signZomeCall: (zomeCall: CallZomeRequestUnsigned) =>
        ipcRenderer.invoke('sign-zome-call', zomeCall)
    });
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
