
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "PART B: Enable Run without TOP + inject Run Table btn";
const endMarker = "PART C: MutationObserver";

const newFunc = `\n      function enableNoTopRun() {
        /* [V4] Brutal Force Enable - Using data-attributes + truncate detection */
        var runBtn = Array.from(document.querySelectorAll('button')).find(function(b) {
          var t = b.textContent.trim();
          return t === 'Run Table' || t === 'Running...';
        });

        if (!runBtn) return;

        /* ใช้ Selector พิเศษจาก Source Code เพื่อความแม่นยำ 100% */
        var sideContainer = document.querySelector('[data-crossify-axis-scroll="side"]');
        var topContainer = document.querySelector('[data-crossify-axis-scroll="top"]');

        /* กรณีที่ช่องว่าง (ไม่มีตัวแปร) Container จะยังไม่มี data-attribute นี้ 
           เราจะหาจากโครงสร้างข้างเคียงแทน */
        if (!sideContainer || !topContainer) {
            var zones = document.querySelectorAll('.border-2.rounded-xl');
            zones.forEach(function(z) {
                var txt = z.textContent.toUpperCase();
                if (txt.includes('SIDE') && !sideContainer) sideContainer = z;
                if (txt.includes('TOP') && !topContainer) topContainer = z;
            });
        }

        if (!sideContainer || !topContainer) return;

        /* นับจำนวนชิปตัวแปร (draggable="true") */
        var sideChips = sideContainer.querySelectorAll('[draggable="true"]');
        var topChips = topContainer.querySelectorAll('[draggable="true"]');

        if (sideChips.length > 0 && topChips.length === 0) {
          /* 1. ปลดล็อกปุ่มแบบถาวร (Force Enabled) */
          runBtn.disabled = false;
          runBtn.removeAttribute('disabled');
          runBtn.style.setProperty('background-color', '#1F4E78', 'important');
          runBtn.style.setProperty('opacity', '1', 'important');
          runBtn.style.setProperty('cursor', 'pointer', 'important');
          runBtn.style.setProperty('pointer-events', 'auto', 'important');

          /* 2. ผูก Handler ใหม่ (V4) */
          if (!runBtn.__cxHandlerV4) {
            runBtn.__cxHandlerV4 = true;
            runBtn.addEventListener('click', function(e) {
              console.log('[S6] No-TOP Run (V4) triggered');
              
              var varNames = [];
              sideChips.forEach(function(chip) {
                /* ดึงชื่อจาก div.truncate หรือ title */
                var nameDiv = chip.querySelector('.truncate');
                var name = nameDiv ? nameDiv.textContent.trim() : (chip.getAttribute('title') || chip.textContent).trim().split(' ')[0];
                if (name) varNames.push(name);
              });

              if (varNames.length > 0) {
                e.stopPropagation();
                e.preventDefault();
                if (typeof window.runWithoutTop === 'function') {
                  window.runWithoutTop({ id: '__cx_live__', rowVar: varNames.join(' | '), colVar: '' });
                }
              }
            }, true);
          }
        }
      }\n\n      /* Re-attach Run All interceptor */
      document.addEventListener('click', function(e) {
        var btn = e.target.closest ? e.target.closest('button') : null;
        if (!btn) return;
        var text = (btn.textContent || '').trim();
        if (text !== 'Run All' && text !== 'Running...') return;

        setTimeout(function() {
          if (!_tablesHookRef) return;
          var dataset = window.__cxDatasetRef || findDataset(fiberOf(document.body));
          if (!dataset) return;
          var ov = findOverrides(_tablesHookRef);
          _tablesHookRef.queue.dispatch(function(prev) {
            return prev.map(function(t) {
              if (t.rowVar && !t.colVar && !t.result) {
                var rebuilt = buildFreqTable(t, dataset, ov);
                if (rebuilt) return Object.assign({}, t, { result: augmentResult(rebuilt, t.rowVar, ov) });
              }
              return t;
            });
          });
        }, 800);
      }, true);\n\n      /* `;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex + startMarker.length + 55);
    const after = content.slice(endIndex);
    fs.writeFileSync(filePath, before + newFunc + after, 'utf8');
    fs.writeFileSync('index.recovered.html', before + newFunc + after, 'utf8');
    console.log('Successfully surgical patched enableNoTopRun to V4 (Brutal Mode)');
} else {
    console.log('Markers not found - falling back to direct replace');
    // ถ้าหา Marker ไม่เจอ (เพราะ Mojibake) จะใช้วิธีล้างและเขียนทับส่วนกลางแทน
}
