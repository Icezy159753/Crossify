const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const { execFile } = require('node:child_process')
const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const url = require('node:url')

let server
let mainWindow
let currentProjectPath = null
let pendingLaunchProjectPath = findProjectArg(process.argv)

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
    if (window.__cxDesktopProjectBridgeLoaded) return;
    window.__cxDesktopProjectBridgeLoaded = true;
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
    var desktopSaveBusy = false;
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

    function installDesktopCloudOverrides() {
      window.__cxRequireSettingsWorkbook = function (_actionLabel, onReady) {
        if (typeof onReady === 'function') {
          setTimeout(function () {
            try { onReady(); } catch (error) { console.error('[Crossify Desktop] pending action failed', error); }
          }, 0);
        }
        return true;
      };
      window.cxTriggerWorkspaceSave = function () { return saveDesktopProject(false, false); };
      window.cxCloudSaveSettingsNow = function () { return saveDesktopProject(false, false); };
      window.cxCloudLoadLatest = function () { return openDesktopProject(); };
      window.cxCloudAutosaveSettingsNow = function () {
        scheduleDesktopAutosave();
        return Promise.resolve({ desktop: true });
      };
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
      if (typeof window.__cxBuildWorkspaceSettingsSnapshot === 'function') return window.__cxBuildWorkspaceSettingsSnapshot();
      if (typeof window.__cxBuildWorkspaceSnapshot !== 'function') return null;
      return window.__cxBuildWorkspaceSnapshot();
    }

    function compactTable(table) {
      if (!table || typeof table !== 'object') return table;
      var next = Object.assign({}, table);
      delete next.result;
      return next;
    }

    function compactDataset(dataset) {
      if (!dataset || typeof dataset !== 'object') return dataset;
      return {
        fileName: dataset.fileName || '',
        fileSize: dataset.fileSize || 0,
        sourcePath: dataset.sourcePath || null,
        encoding: dataset.encoding || '',
        casesCount: Array.isArray(dataset.cases) ? dataset.cases.length : (dataset.casesCount || 0),
        variablesCount: Array.isArray(dataset.variables) ? dataset.variables.length : (dataset.variablesCount || 0)
      };
    }

    function compactSnapshot(snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return snapshot;
      return {
        version: 'desktop-settings-only-v2',
        savedAt: new Date().toISOString(),
        dataset: compactDataset(snapshot.dataset),
        lightLoadMode: !!snapshot.lightLoadMode,
        customMrsets: Array.isArray(snapshot.customMrsets) ? snapshot.customMrsets : [],
        settings: snapshot.settings || {},
        tables: Array.isArray(snapshot.tables) ? snapshot.tables.map(compactTable) : [],
        activeTableId: snapshot.activeTableId || null,
        activeTab: snapshot.activeTab || null,
        variableOverrides: snapshot.variableOverrides || {},
        currentSourceMappings: Array.isArray(snapshot.currentSourceMappings) ? snapshot.currentSourceMappings : [],
        loadedSettingsName: snapshot.loadedSettingsName || null,
        folders: Array.isArray(snapshot.folders) ? snapshot.folders : []
      };
    }

    function compactBanners(banners) {
      if (!Array.isArray(banners)) return banners;
      return banners.map(function (banner) {
        if (!banner || typeof banner !== 'object') return banner;
        return {
          id: banner.id || '',
          name: banner.name || '',
          createdAt: banner.createdAt || null,
          updatedAt: banner.updatedAt || null,
          table: compactTable(banner.table)
        };
      });
    }

    function buildProject() {
      var fullSnapshot = getSnapshot();
      if (!fullSnapshot || !fullSnapshot.dataset) {
        throw new Error('Load an SPSS file and set up a table before saving a Crossify Table file.');
      }
      var snapshot = compactSnapshot(fullSnapshot);
      if (typeof window.__cxGetBannerTemplates === 'function') {
        snapshot.banners = compactBanners(window.__cxGetBannerTemplates());
      }
      return {
        type: 'crossify.table',
        formatVersion: 1,
        appVersion: '0.0.1',
        savedAt: new Date().toISOString(),
        snapshot: snapshot
      };
    }

    function buildProjectPayload() {
      var start = performance.now();
      var payload = JSON.stringify(buildProject());
      console.log('[Crossify Desktop] settings-only payload bytes=', payload.length, 'built in', Math.round(performance.now() - start), 'ms');
      return payload;
    }

    function sanitizeProjectFileName(name) {
      return String(name || '')
        .replace(/\.crossify$/i, '')
        .replace(/[<>:"/\\\\|?*\\x00-\\x1F]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim()
        .slice(0, 90) || 'Crossify Table';
    }

    function defaultProjectName() {
      var snapshot = getSnapshot();
      var ds = snapshot && snapshot.dataset ? snapshot.dataset : {};
      return sanitizeProjectFileName((ds.fileName || 'Crossify Table').replace(/\.sav$/i, ''));
    }

    function promptProjectName(saveAs) {
      var current = desktopProjectPath ? desktopProjectPath.split(/[\\\\/]/).pop().replace(/\.crossify$/i, '') : defaultProjectName();
      if (!saveAs) return Promise.resolve(current);
      var suffix = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
      return Promise.resolve(sanitizeProjectFileName(current + ' ' + suffix));
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
      if (desktopSaveBusy) return { busy: true };
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.saveProject !== 'function') {
        throw new Error('Desktop file bridge is not ready.');
      }
      desktopSaveBusy = true;
      try {
        if ((saveAs || !desktopProjectPath) && typeof window.crossifyDesktop.chooseProjectPath === 'function') {
          var fileName = await promptProjectName(!!saveAs);
          if (!fileName) return { canceled: true };
          var chosen = await window.crossifyDesktop.chooseProjectPath({ saveAs: !!saveAs, fileName: fileName });
          if (!chosen || chosen.canceled) return chosen;
          desktopProjectPath = chosen.filePath || desktopProjectPath;
          updateDesktopProjectBadge();
          await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        var saveStart = performance.now();
        var result = await window.crossifyDesktop.saveProject(buildProjectPayload(), { saveAs: false, payloadType: 'json' });
        console.log('[Crossify Desktop] native save completed in', Math.round(performance.now() - saveStart), 'ms');
        if (!result || result.canceled) return result;
        desktopProjectPath = result.filePath || desktopProjectPath;
        updateDesktopProjectBadge();
        if (!quiet) desktopToast(saveAs ? 'Saved As Crossify Table' : 'Saved Crossify Table', desktopProjectPath ? desktopProjectPath.split(/[\\\\/]/).pop() : '');
        return result;
      } finally {
        desktopSaveBusy = false;
      }
    }

    async function restoreDesktopProjectPayload(result, reload) {
      if (!result || result.canceled) return result;
      if (!result.project || result.project.type !== 'crossify.table' || !result.project.snapshot) {
        throw new Error('This is not a valid Crossify Table file.');
      }
      var applyResult = null;
      if (Array.isArray(result.project.snapshot.banners) && typeof window.__cxSetBannerTemplates === 'function') {
        window.__cxSetBannerTemplates(result.project.snapshot.banners);
      }
      if (typeof window.__cxApplyWorkspaceSettings === 'function') {
        applyResult = window.__cxApplyWorkspaceSettings(result.project.snapshot);
        if (applyResult && applyResult.ok && typeof window.__cxRestoreDerivedDatasetState === 'function') {
          try { window.__cxRestoreDerivedDatasetState(result.project.snapshot); } catch (_derivedRestoreErr) {}
        }
      }
      if (!applyResult || !applyResult.ok) {
        throw new Error((applyResult && applyResult.reason) || 'Load the matching SPSS file first, then open this Crossify Table file.');
      }
      desktopProjectPath = result.filePath || '';
      try { localStorage.setItem('crossify.desktop.projectPath', desktopProjectPath); } catch (_error) {}
      updateDesktopProjectBadge();
      desktopToast('Opened Crossify Table', desktopProjectPath ? desktopProjectPath.split(/[\\\\/]/).pop() : '');
      return result;
    }

    async function openDesktopProject() {
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.openProject !== 'function') {
        throw new Error('Desktop file bridge is not ready.');
      }
      var result = await window.crossifyDesktop.openProject();
      return restoreDesktopProjectPayload(result, true);
    }

    async function consumeLaunchProject() {
      if (!window.crossifyDesktop || typeof window.crossifyDesktop.getLaunchProject !== 'function') return;
      var result = await window.crossifyDesktop.getLaunchProject();
      if (!result || result.canceled) return;
      await restoreDesktopProjectPayload(result, true);
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
      }, 6000);
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
        '.cx-desktop-actions{display:flex;align-items:center;gap:7px;margin-left:10px}',
        '.cx-desktop-action-btn{border:1px solid rgba(191,219,254,.65);background:rgba(255,255,255,.14);color:#fff;border-radius:12px;padding:8px 11px;font:900 12px Inter,"Noto Sans Thai",system-ui;cursor:pointer;box-shadow:0 8px 18px rgba(15,23,42,.10)}',
        '.cx-desktop-action-btn:hover{background:rgba(255,255,255,.22);transform:translateY(-1px)}',
        '.cx-desktop-action-save{background:linear-gradient(135deg,#16a34a,#22c55e);border-color:#22c55e}',
        '.cx-desktop-action-open{background:linear-gradient(135deg,#1f4e78,#2f6fe4);border-color:#60a5fa}',
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

    function findTopHeader() {
      var headers = Array.from(document.querySelectorAll('header'));
      if (headers.length) return headers[0];
      var workspaceButton = Array.from(document.querySelectorAll('button')).find(function (button) {
        return (button.textContent || '').replace(/\\s+/g, ' ').trim().indexOf('Workspace') !== -1;
      });
      return workspaceButton && workspaceButton.closest ? workspaceButton.closest('div') : null;
    }

    function ensureDesktopActionButtons() {
      ensureDesktopMenuStyle();
      if (document.getElementById('cx-desktop-actions')) return;
      var header = findTopHeader();
      if (!header) return;
      var actions = document.createElement('div');
      actions.id = 'cx-desktop-actions';
      actions.className = 'cx-desktop-actions';
      actions.innerHTML =
        '<button type="button" class="cx-desktop-action-btn cx-desktop-action-save" data-cx-desktop-project="save">Save</button>' +
        '<button type="button" class="cx-desktop-action-btn" data-cx-desktop-project="save-as">Save As</button>' +
        '<button type="button" class="cx-desktop-action-btn cx-desktop-action-open" data-cx-desktop-project="open">Open</button>';
      var workspace = Array.from(header.querySelectorAll('button')).find(function (button) {
        return (button.textContent || '').replace(/\\s+/g, ' ').trim().indexOf('Workspace') !== -1;
      });
      if (workspace && workspace.parentElement) {
        header.insertBefore(actions, workspace.parentElement);
      } else {
        header.appendChild(actions);
      }
    }

    function refreshDesktopMenus() {
      ensureDesktopMenuStyle();
      installDesktopCloudOverrides();
      ensureDesktopActionButtons();
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
      installDesktopCloudOverrides();
      refreshProjectPath();
      refreshDesktopMenus();
      setTimeout(function () {
        consumeLaunchProject().catch(function (error) {
          desktopAlert('error', 'Open Crossify Table Failed', error && error.message ? error.message : String(error));
        });
      }, 500);
      desktopObserver.observe(document.documentElement, { childList: true, subtree: true });
      setInterval(function () {
        installDesktopCloudOverrides();
        refreshDesktopMenus();
      }, 1000);
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
  if (html.includes('__cxDesktopProjectBridgeLoaded')) return html
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

function findProjectArg(argv) {
  return (argv || [])
    .map(arg => String(arg || '').replace(/^"|"$/g, ''))
    .find(arg => /\.crossify$/i.test(arg) && fs.existsSync(arg)) || null
}

function readProjectFile(filePath) {
  return fs.promises.readFile(filePath, 'utf8').then(content => {
    const project = JSON.parse(content)
    validateProject(project)
    currentProjectPath = filePath
    return { canceled: false, filePath, project }
  })
}

function desktopIconPath() {
  const candidates = [
    path.join(appRoot(), 'assets', 'crossify.ico'),
    path.join(__dirname, '..', 'assets', 'crossify.ico'),
  ]
  return candidates.find(candidate => fs.existsSync(candidate)) || null
}

async function chooseProjectSavePath(event) {
  return chooseProjectSavePathFromName(event, {})
}

function sanitizeProjectFileName(name) {
  return String(name || '')
    .replace(/\.crossify$/i, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90) || 'Crossify Table'
}

async function chooseProjectSavePathFromName(_event, options = {}) {
  const outDir = path.join(app.getPath('documents'), 'Crossify Tables')
  await fs.promises.mkdir(outDir, { recursive: true })
  const fileName = sanitizeProjectFileName(options.fileName || 'Crossify Table') + '.crossify'
  currentProjectPath = normalizeProjectPath(path.join(outDir, fileName))
  return { canceled: false, filePath: currentProjectPath }
}

function regAdd(args) {
  return new Promise(resolve => {
    execFile('reg.exe', ['add', ...args], { windowsHide: true }, error => {
      if (error) console.warn('[Crossify Desktop] file association registry failed:', error.message)
      resolve(!error)
    })
  })
}

async function registerCrossifyFileAssociation() {
  if (process.platform !== 'win32' || !app.isPackaged) return
  const exePath = process.execPath
  const iconPath = desktopIconPath() || exePath
  await regAdd(['HKCU\\Software\\Classes\\.crossify', '/ve', '/d', 'Crossify.Table', '/f'])
  await regAdd(['HKCU\\Software\\Classes\\Crossify.Table', '/ve', '/d', 'Crossify Table', '/f'])
  await regAdd(['HKCU\\Software\\Classes\\Crossify.Table\\DefaultIcon', '/ve', '/d', `"${iconPath}",0`, '/f'])
  await regAdd(['HKCU\\Software\\Classes\\Crossify.Table\\shell\\open\\command', '/ve', '/d', `"${exePath}" "%1"`, '/f'])
}

ipcMain.handle('crossify:get-project-path', () => currentProjectPath || '')

ipcMain.handle('crossify:get-launch-project', async () => {
  const filePath = pendingLaunchProjectPath
  pendingLaunchProjectPath = null
  if (!filePath) return { canceled: true }
  return readProjectFile(filePath)
})

ipcMain.handle('crossify:choose-project-path', async (event, options = {}) => {
  return chooseProjectSavePathFromName(event, options)
})

ipcMain.handle('crossify:save-project', async (event, project, options = {}) => {
  let payload = ''
  if (typeof project === 'string') {
    payload = project
  } else {
    validateProject(project)
    payload = JSON.stringify(project)
  }
  let targetPath = options.saveAs ? null : currentProjectPath
  if (!targetPath) {
    const result = await chooseProjectSavePath(event)
    if (result.canceled || !result.filePath) return { canceled: true }
    targetPath = result.filePath
  }
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
  return readProjectFile(filePath)
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
    icon: desktopIconPath() || undefined,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })
  mainWindow = win

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      event.preventDefault()
      if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
      else win.webContents.openDevTools({ mode: 'detach' })
    }
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

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const projectPath = findProjectArg(argv)
    if (projectPath) pendingLaunchProjectPath = projectPath
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      if (projectPath) mainWindow.reload()
    }
  })
}

app.setAppUserModelId('com.crossify.desktop')

if (gotLock) {
  app.whenReady().then(async () => {
    await registerCrossifyFileAssociation()
    await createWindow()
  })
}

app.on('window-all-closed', () => {
  if (server) server.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
