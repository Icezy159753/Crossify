
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

const newFunc = `      function enableNoTopRun() {
        /* [V2] Force enable Run Table button when SIDE exists but NO TOP */
        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(btn) {
          var btnText = (btn.textContent || '').trim();
          if (btnText !== 'Run Table' && btnText !== 'Running...') return;

          /* Get variables from UI directly (DOM) for maximum accuracy */
          var sideZone = document.evaluate("//span[contains(text(), 'SIDE')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          var topZone = document.evaluate("//span[contains(text(), 'TOP')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          
          if (!sideZone || !topZone) return;
          
          var sideVars = sideZone.closest('.rounded-xl').querySelectorAll('[draggable="true"]').length;
          var topVars = topZone.closest('.rounded-xl').querySelectorAll('[draggable="true"]').length;
          
          if (sideVars > 0 && topVars === 0) {
            btn.disabled = false;
            btn.style.background = '#1F4E78';
            btn.style.color = 'white';
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';

            if (!btn.__cxNoTopHandler) {
              btn.__cxNoTopHandler = true;
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                /* Find current side variables for calculation */
                var dataset = window.__cxDatasetRef || null;
                var sideVarNames = [];
                sideZone.closest('.rounded-xl').querySelectorAll('[draggable="true"]').forEach(el => {
                   var txt = (el.getAttribute('title') || el.textContent || '').trim();
                   var name = txt.split(' ')[0]; // Basic name extraction
                   if (name) sideVarNames.push(name);
                });
                
                if (typeof window.runWithoutTop === 'function') {
                   window.runWithoutTop({ id: '__cx_live__', rowVar: sideVarNames.join(' | '), colVar: '' });
                }
              }, true);
            }
          }
        });
      }`;

// ใช้ Regex เพื่อหาและแทนที่ฟังก์ชันเก่า
const funcRegex = /function enableNoTopRun\(\) \{[\s\S]+?\}\n      \}/;
if (funcRegex.test(content)) {
    content = content.replace(funcRegex, newFunc);
    fs.writeFileSync(filePath, content, 'utf8');
    fs.writeFileSync('index.recovered.html', content, 'utf8'); // Sync backup
    console.log('Successfully patched enableNoTopRun to V2');
} else {
    console.log('Could not find enableNoTopRun function to patch');
}
