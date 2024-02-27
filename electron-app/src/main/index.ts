import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { AdminWebsocket, AppAgentWebsocket, CellType, CallZomeRequest, ActionHash } from '@holochain/client'
import { Post } from './types'

import * as childProcess from 'child_process'

import split from 'split'

const electronPDF = require('electron-pdf');

let conductorHandle;
const fs = require('fs');

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('saveNewAudit', (event, norms) => {
    dialog.showSaveDialog({title: 'Audit speichern', defaultPath: 'neuesAudit.json', filters: [{ name: "JSON files", extensions: ['json']}]})
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePath;

        try {
          fs.writeFileSync(filePath, norms, 'utf-8');
          console.log("Saved file.");
          event.reply('newAuditSaved', {success: true});
        } catch (err) {
          console.log("Error saving file: " + err.message);
          event.reply('newAuditSaved', {success: false, error: err.message});
        }
      }
    });
  });

  ipcMain.on('loadAudit', (event) => {
    dialog.showOpenDialog({ properties: ['openFile'] })
    .then((result) => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];

        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            console.error('Error reading file: ', err);
            return;
          }

          event.reply('file-opened', data);
        });
      }
    }).catch((err) => {
      console.error('Error opening file dialog: ', err);
    });
  });

  ipcMain.on('openAsPDF', (event, data) => {
    const htmlContent = `<pre>${data}</pre>`
    
    const pdfWin = new BrowserWindow({ width: 800, height: 600 });

    pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  });

  ipcMain.handle('dialog', (event, method, params) => {
    dialog[method](params);
  });

  createWindow()

  // Source: https://github.com/holochain/launcher-electron/blob/holochain-0.3/src/main/holochainManager.ts
  // ------------------------------------------------
  // Set up conductor process
  // const conductorHandle = childProcess.spawn('./out/binaries/holochain-v0.2.5-x86_64-unknown-linux-gnu', ['-c', './out/config/conductor-config.yaml', '-p']);
  const conductorHandle = childProcess.spawn('./out/binaries/holochain-v0.2.6-x86_64-unknown-linux-gnu', ['-c', './out/config/conductor-config.yaml', '-p']);
  // const conductorHandle = childProcess.spawn('./out/binaries/holochain-v0.3.0-beta-dev.35-x86_64-unknown-linux-gnu', ['-c', './out/configuration/conductor-config.yaml', '-p']);
  // conductorHandle = childProcess.spawn('./out/binaries/holochain-v0.3.0-beta-dev.35-x86_64-unknown-linux-gnu', ['-c', './out/config/conductor-config.yaml', '-p']);
  // const conductorHandle = childProcess.spawn('./out/binaries/holochain-v0.3.0-beta-dev.35-x86_64-pc-windows-msvc.exe', ['-c', './out/config/conductor-config.yaml', '-p']);

  conductorHandle.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  conductorHandle.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  conductorHandle.on('exit', (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
  });

  conductorHandle.stdin.write('testing');
  conductorHandle.stdin.end();

  conductorHandle.stdout.pipe(split()).on('data', async (line: string) => {
    if (line.includes('FATAL PANIC PanicInfo')) {
      console.log(
        `Holochain version 0.2.5 failed to start up and crashed. Check the logs for details.`
        );
    }
    if (line.includes('Conductor ready.')) {
      const adminWebsocket = await AdminWebsocket.connect(
        new URL("ws://127.0.0.1:1234")
      );
      console.log('Connected to admin websocket.');
      // const installedApps = await adminWebsocket.listApps({});
      const appInterfaces = await adminWebsocket.listAppInterfaces();
      console.log('Got appInterfaces: ', appInterfaces);
      let appPort;
      if (appInterfaces.length > 0) {
        appPort = appInterfaces[0];
      } else {
        const attachAppInterfaceResponse = await adminWebsocket.attachAppInterface({});
        console.log('Attached app interface port: ', attachAppInterfaceResponse);
        appPort = attachAppInterfaceResponse.port;
      }

      console.log("Current directory: " + __dirname);

      // Install web happ
      const pubKey = await adminWebsocket.generateAgentPubKey();
      const appInfo = await adminWebsocket.installApp({
        agent_key: pubKey,
        installed_app_id: 'haudit',
        membrane_proofs: {},
        path: '../happ/haudit_app/workdir/haudit_app.happ',
        network_seed: 'haudittestnetworkseed'
      }).catch((error) => {
        console.log("Error: " + error);
      });

      console.log("HELLO INSTALLING!");

      await adminWebsocket.enableApp({ installed_app_id: 'haudit'});
      const installedApps = await adminWebsocket.listApps({});
      console.log("Installed apps: ", installedApps);

      // await adminWebsocket.enableApp({ installed_app_id: 'haudit' });
      // if (!(CellType.Provisioned in appInfo.cell_info['forum'][0])) {
      //   process.exit();
      // }

      const { cell_id } = appInfo.cell_info['forum'][0][CellType.Provisioned];
      await adminWebsocket.authorizeSigningCredentials(cell_id);
      await adminWebsocket.attachAppInterface({ port: 1235 });
      const appAgentWs = await AppAgentWebsocket.connect(
        new URL("ws://127.0.0.1:1234"),
        'haudit'
      );

      const post : Post = {
        title: "Test title",
        content: "This is test content!"
      }

      const zomeCallPayload: CallZomeRequest = {
        cell_id,
        zome_name: "posts",
        fn_name: "create_post",
        provenance: pubKey,
        payload: post,
      };

      const response: ActionHash = await appAgentWs.callZome(zomeCallPayload, 30000);

      console.log("Response: " + response);

      await appAgentWs.appWebsocket.client.close();
      await adminWebsocket.client.close();
    }
    // ------------------------------------------------

  });
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (conductorHandle && !conductorHandle.killed) {
    conductorHandle.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
