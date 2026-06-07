const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const url = require('node:url')

let server
let currentProjectPath = null

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.exe': 'application/octet-stream',
}

const desktopBootstrapScript = `
<script>
  (function () {
    window.__CX_DESKTOP_APP = true;
    window.__CX_AUTH_BYPASS = true;
    try {
      localStorage.setItem('crossify.auth.bypass', '1');
    } catch (_error) {}

    var PROJECT_DB = 'crossify-workspace-snapshot-v1';
    var PROJECT_STORE = 'snapshot';
    var PROJECT_KEY = 'latest';
    var desktopAutosaveTimer = null;
    var desktopAutosaveBusy = false;
    var desktopProjectPath = '';
    var desktopSaveHintShown = false;

    function desktopToast(title, text) {
      if (window.__crossifyRuntime && typeof window.__crossifyRuntime.toast === 'function') {
        window.__crossifyRuntime.toast({ title: title, text: text || '', timer: 2600 });
        return;
      }
      console.log('[Crossify Desktop]', title, text || '');
    }

    function desktopAlert(type, title, text) {
      if (window.__crossifyRuntime && typeof window.__crossifyRuntime.alert === 'function') {
        window.__crossifyRuntime.alert({ type: type || 'info', title: title, text: text || '', confirmText: 'OK' });
        return;
      }
      window.alert((title ? title + '\\n\\n' : '') + (text || ''));
    }

    function openProjectDb() {
      return new Promise(function (resolve, reject) {
        var request = indexedDB.open(PROJECT_DB, 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains(PROJECT_STORE)) db.createObjectStore(PROJECT_STORE, { keyPath: 'id' });
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || new Error('Cannot open desktop workspace database')); };
      });
    }

    async function putDesktopSnapshot(snapshot) {
      var db = await openProjectDb();
      try {
        await new Promise(function (resolve, reject) {
          var tx = db.transaction(PROJECT_STORE, 'readwrite');
          tx.objectStore(PROJECT_STORE).put({ id: PROJECT_KEY, value: snapshot, updatedAt: Date.now() });
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { reject(tx.error || new Error('Cannot write desktop workspace snapshot')); };
        });
      } finally {
        db.close();
      }
    }

    function getSnapshot() {
      if (typeof window.__cxBuildWorkspaceSnapshot !== 'function') return null;
      return window.__cxBuildWorkspaceSnapshot();
    }

    function buildProject() {
      var snapshot = getSnapshot();
      if (!snapshot || !snapshot.dataset) {
        throw new Error('Load an SPSS file and set up a table before saving a Crossify Table file.');
      }
      return {
        type: 'crossify.table',
        formatVersion: 1,
        appVersion: '0.0.1',
        savedAt: new Date().toISOString(),
        snapshot: snapshot
      };
    }

    async function refreshProjectPath() {
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.getProjectPath !== 'function') return '';
      desktopProjectPath = await window.crossifyDesktop.getProjectPath().catch(function () { return ''; }) || '';
      updateDesktopProjectBadge();
      return desktopProjectPath;
    }

    function updateDesktopProjectBadge() {
      var existing = document.getElementById('cx-desktop-project-status');
      if (!desktopProjectPath) {
        if (existing) existing.remove();
        return;
      }
      if (!existing) {
        existing = document.createElement('div');
        existing.id = 'cx-desktop-project-status';
        existing.style.cssText = 'position:fixed;right:350px;top:18px;z-index:2147481200;display:flex;align-items:center;gap:7px;border:1px solid rgba(191,219,254,.55);border-radius:999px;background:rgba(255,255,255,.13);color:#dbeafe;padding:7px 11px;font:800 12px Inter,"Noto Sans Thai",system-ui;box-shadow:0 8px 20px rgba(15,23,42,.12);backdrop-filter:blur(8px);pointer-events:none';
        document.body.appendChild(existing);
      }
      var name = desktopProjectPath.split(/[\\\\/]/).pop() || 'Crossify Table';
      existing.textContent = 'Saved to ' + name;
    }

    async function saveDesktopProject(saveAs, quiet) {
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.saveProject !== 'function') {
        throw new Error('Desktop file bridge is not ready.');
      }
      var result = await window.crossifyDesktop.saveProject(buildProject(), { saveAs: !!saveAs });
      if (!result || result.canceled) return result;
      desktopProjectPath = result.filePath || desktopProjectPath;
      updateDesktopProjectBadge();
      if (!quiet) desktopToast(saveAs ? 'Saved As Crossify Table' : 'Saved Crossify Table', desktopProjectPath ? desktopProjectPath.split(/[\\\\/]/).pop() : '');
      return result;
    }

    async function openDesktopProject() {
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.openProject !== 'function') {
        throw new Error('Desktop file bridge is not ready.');
      }
      var result = await window.crossifyDesktop.openProject();
      if (!result || result.canceled) return result;
      if (!result.project || result.project.type !== 'crossify.table' || !result.project.snapshot) {
        throw new Error('This is not a valid Crossify Table file.');
      }
      await putDesktopSnapshot(result.project.snapshot);
      desktopProjectPath = result.filePath || '';
      try { localStorage.setItem('crossify.desktop.projectPath', desktopProjectPath); } catch (_error) {}
      desktopToast('Opening Crossify Table', 'Restoring workspace...');
      window.setTimeout(function () { window.location.reload(); }, 150);
      return result;
    }

    function scheduleDesktopAutosave() {
      if (!desktopProjectPath || desktopAutosaveBusy) return;
      clearTimeout(desktopAutosaveTimer);
      desktopAutosaveTimer = setTimeout(async function () {
        if (!desktopProjectPath || desktopAutosaveBusy || !getSnapshot()) return;
        desktopAutosaveBusy = true;
        try {
          await saveDesktopProject(false, true);
        } catch (error) {
          console.warn('[Crossify Desktop] autosave failed', error);
        } finally {
          desktopAutosaveBusy = false;
        }
      }, 1800);
    }

    function buttonText(target) {
      var el = target && target.closest ? target.closest('button, a, [role="button"], [role="menuitem"]') : null;
      if (!el) return { el: null, text: '' };
      return { el: el, text: (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim() };
    }

    function isHeaderDropdownItem(el) {
      if (!el) return false;
      var menu = el.closest('div.absolute, div[role="menu"]');
      if (!menu) return false;
      var menuText = (menu.innerText || menu.textContent || '').replace(/\\s+/g, ' ').trim();
      return /Change SPSS|Load SPSS|Save|Load|Batch Export|Crossify Table/i.test(menuText);
    }

    function ensureDesktopMenuStyle() {
      if (document.getElementById('cx-desktop-menu-style')) return;
      var style = document.createElement('style');
      style.id = 'cx-desktop-menu-style';
      style.textContent = [
        '.cx-desktop-menu-item{display:flex;width:100%;align-items:center;gap:7px;border:1px solid #bfdbfe;background:#fff;border-radius:9px;margin:4px 0;padding:6px 8px;color:#334155;font-size:11px;font-weight:900;text-align:left;cursor:pointer;box-shadow:0 6px 14px rgba(31,78,120,.08)}',
        '.cx-desktop-menu-item:hover{background:#eff6ff;border-color:#60a5fa;color:#1d4ed8;transform:translateY(-1px)}',
        '.cx-desktop-save{background:linear-gradient(135deg,#16a34a,#22c55e);border-color:#16a34a;color:#fff}',
        '.cx-desktop-save:hover{background:linear-gradient(135deg,#15803d,#16a34a);color:#fff}',
        '.cx-desktop-open{background:linear-gradient(135deg,#1f4e78,#2f6fe4);border-color:#2f6fe4;color:#fff}',
        '.cx-desktop-open:hover{background:linear-gradient(135deg,#173b5c,#245ac7);color:#fff}',
        '.cx-desktop-sep{height:1px;background:#dbeafe;margin:5px 2px}',
        '.cx-desktop-title{padding:2px 7px 4px;color:#1f4e78;font-size:11px;font-weight:900}'
      ].join('');
      document.head.appendChild(style);
    }

    function refreshDesktopMenus() {
      ensureDesktopMenuStyle();
      document.querySelectorAll('[data-cx-cloud], #cx-cloud-settings-menu, #cx-cloud-save-settings-item, #cx-cloud-load-settings-item, #cx-cloud-autosave-settings-item').forEach(function (node) {
        node.remove();
      });
      Array.from(document.querySelectorAll('div.absolute, div[role="menu"]')).forEach(function (menu) {
        var text = (menu.innerText || menu.textContent || '').replace(/\\s+/g, ' ').trim();
        if (!/Change SPSS|Load SPSS|Save|Load|Batch Export/i.test(text)) return;
        if (menu.querySelector('[data-cx-desktop-project-menu]')) return;
        menu.insertAdjacentHTML('beforeend',
          '<div data-cx-desktop-project-menu="1">' +
          '<div class="cx-desktop-sep"></div>' +
          '<div class="cx-desktop-title">Table Crossify File</div>' +
          '<button type="button" class="cx-desktop-menu-item cx-desktop-save" data-cx-desktop-project="save">Save Crossify Table</button>' +
          '<button type="button" class="cx-desktop-menu-item" data-cx-desktop-project="save-as">Save As Crossify Table</button>' +
          '<button type="button" class="cx-desktop-menu-item cx-desktop-open" data-cx-desktop-project="open">Open Crossify Table</button>' +
          '</div>'
        );
      });
    }

    document.addEventListener('click', function (event) {
      var projectButton = event.target && event.target.closest ? event.target.closest('[data-cx-desktop-project]') : null;
      var info = buttonText(event.target);
      var text = info.text;
      if (projectButton || info.el && info.el.hasAttribute('data-cx-cloud') || (isHeaderDropdownItem(info.el) && /^(Save|Load|Save Cloud Settings|Load Cloud Settings|Save Settings|Load Settings)$/i.test(text))) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        var action = projectButton ? projectButton.getAttribute('data-cx-desktop-project') : (/^Load|Open/i.test(text) ? 'open' : 'save');
        Promise.resolve().then(async function () {
          if (action === 'open') await openDesktopProject();
          else if (action === 'save-as') await saveDesktopProject(true, false);
          else await saveDesktopProject(false, false);
        }).catch(function (error) {
          desktopAlert('error', 'Crossify Table Error', error && error.message ? error.message : String(error));
        }).finally(function () {
          setTimeout(refreshDesktopMenus, 100);
        });
        return;
      }
      setTimeout(refreshDesktopMenus, 80);
      scheduleDesktopAutosave();
    }, true);

    document.addEventListener('input', scheduleDesktopAutosave, true);
    document.addEventListener('change', scheduleDesktopAutosave, true);

    var desktopObserver = new MutationObserver(function () {
      refreshDesktopMenus();
      updateDesktopProjectBadge();
      if (!desktopProjectPath && !desktopSaveHintShown && getSnapshot()) {
        desktopSaveHintShown = true;
        desktopToast('Save As Crossify Table', 'Use Workspace or Tables menu to save this desktop project.');
      }
    });

    function startDesktopBridge() {
      refreshProjectPath();
      refreshDesktopMenus();
      desktopObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDesktopBridge);
    else startDesktopBridge();

    window.cxDesktopSaveProject = function () { return saveDesktopProject(false, false); };
    window.cxDesktopSaveProjectAs = function () { return saveDesktopProject(true, false); };
    window.cxDesktopOpenProject = openDesktopProject;
  })();
</script>
`

function appRoot() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'app.asar.unpacked')
  return path.join(__dirname, '..')
}

function distDir() {
  const root = appRoot()
  const candidates = [
    path.join(root, 'dist'),
    path.join(__dirname, '..', 'dist'),
  ]
  return candidates.find(candidate => fs.existsSync(path.join(candidate, 'index.html'))) || candidates[0]
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0])
  const clean = decoded === '/' ? '/index.html' : decoded
  const target = path.normalize(path.join(root, clean))
  if (!target.startsWith(root)) return null
  return target
}

function injectDesktopBootstrap(html) {
  if (html.includes('window.__CX_DESKTOP_APP')) return html
  if (html.includes('</head>')) return html.replace('</head>', `${desktopBootstrapScript}</head>`)
  return `${desktopBootstrapScript}${html}`
}

function sendHtml(res, data) {
  res.writeHead(200, { 'Content-Type': mimeTypes['.html'] })
  res.end(injectDesktopBootstrap(data.toString('utf8')))
}

function normalizeProjectPath(filePath) {
  if (!filePath) return null
  return /\.crossify$/i.test(filePath) ? filePath : `${filePath}.crossify`
}

function validateProject(project) {
  if (!project || project.type !== 'crossify.table' || !project.snapshot) {
    throw new Error('Invalid Crossify Table project.')
  }
}

ipcMain.handle('crossify:get-project-path', () => currentProjectPath || '')

ipcMain.handle('crossify:save-project', async (event, project, options = {}) => {
  validateProject(project)
  let targetPath = options.saveAs ? null : currentProjectPath
  if (!targetPath) {
    const result = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
      title: 'Save Crossify Table',
      defaultPath: path.join(app.getPath('documents'), 'Crossify Table.crossify'),
      filters: [
        { name: 'Crossify Table', extensions: ['crossify'] },
        { name: 'JSON', extensions: ['json'] },
      ],
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    targetPath = normalizeProjectPath(result.filePath)
  }
  const payload = JSON.stringify(project)
  await fs.promises.writeFile(targetPath, payload, 'utf8')
  currentProjectPath = targetPath
  return { canceled: false, filePath: currentProjectPath }
})

ipcMain.handle('crossify:open-project', async event => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
    title: 'Open Crossify Table',
    properties: ['openFile'],
    filters: [
      { name: 'Crossify Table', extensions: ['crossify', 'json'] },
    ],
  })
  if (result.canceled || !result.filePaths?.length) return { canceled: true }
  const filePath = result.filePaths[0]
  const project = JSON.parse(await fs.promises.readFile(filePath, 'utf8'))
  validateProject(project)
  currentProjectPath = filePath
  return { canceled: false, filePath, project }
})

function startStaticServer(root) {
  return new Promise((resolve, reject) => {
    const localServer = http.createServer((req, res) => {
      const parsed = url.parse(req.url || '/')
      const filePath = safeJoin(root, parsed.pathname || '/')
      if (!filePath) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          fs.readFile(path.join(root, 'index.html'), (fallbackError, fallbackData) => {
            if (fallbackError) {
              res.writeHead(404)
              res.end('Not found')
              return
            }
            sendHtml(res, fallbackData)
          })
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        if (ext === '.html') {
          sendHtml(res, data)
          return
        }
        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        })
        res.end(data)
      })
    })
    localServer.once('error', reject)
    localServer.listen(0, '127.0.0.1', () => {
      server = localServer
      const address = localServer.address()
      resolve(`http://127.0.0.1:${address.port}/`)
    })
  })
}

async function createWindow() {
  const startUrl = await startStaticServer(distDir())
  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#f8fbff',
    title: 'Crossify',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  win.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith(startUrl)) {
      shell.openExternal(targetUrl)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  await win.loadURL(startUrl)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (server) server.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
