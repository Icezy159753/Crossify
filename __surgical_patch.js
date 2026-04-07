
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "/* PART B: Enable Run without TOP + inject Run Table btn */";
const endMarker = "function getCurrentTableForRunButton(btn) {";

const newFunc = `\n      function enableNoTopRun() {
        /* [V3] Enhanced Force Enable - CSS + Robust DOM Detection */
        var buttons = document.querySelectorAll('button');
        var runBtn = null;
        buttons.forEach(function(btn) {
          var txt = (btn.textContent || '').trim();
          if (txt === 'Run Table' || txt === 'Running...') runBtn = btn;
        });

        if (!runBtn) return;

        /* Find Zones by searching for "Side" and "Top" labels */
        var allLabels = document.querySelectorAll('.text-xs.font-bold.text-gray-600.uppercase');
        var sideZone = null;
        var topZone = null;

        allLabels.forEach(function(el) {
          var t = el.textContent.trim().toLowerCase();
          if (t === 'side') sideZone = el.closest('.border-2.rounded-xl');
          if (t === 'top') topZone = el.closest('.border-2.rounded-xl');
        });

        if (!sideZone || !topZone) return;

        /* Count variables in each zone */
        var sideVars = sideZone.querySelectorAll('[draggable="true"]').length;
        var topVars = topZone.querySelectorAll('[draggable="true"]').length;

        if (sideVars > 0 && topVars === 0) {
          /* 1. Force Styling via JS & CSS to bypass React state */
          runBtn.disabled = false;
          runBtn.removeAttribute('disabled');
          runBtn.style.setProperty('background-color', '#1F4E78', 'important');
          runBtn.style.setProperty('opacity', '1', 'important');
          runBtn.style.setProperty('cursor', 'pointer', 'important');
          runBtn.style.setProperty('display', 'block', 'important');

          /* 2. Attach specialized handler if not present */
          if (!runBtn.__cxNoTopHandlerV3) {
            runBtn.__cxNoTopHandlerV3 = true;
            runBtn.addEventListener('click', function(e) {
              console.log('[S6] No-TOP Run Triggered');
              
              /* Extract variable names from SIDE zone */
              var varNames = [];
              sideZone.querySelectorAll('[draggable="true"]').forEach(function(el) {
                /* Try to get name from title or textContent */
                var fullText = (el.getAttribute('title') || el.textContent || '').trim();
                var name = fullText.split(' ')[0]; // Standard format: "VAR_NAME Label..."
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
      }\n\n      `;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex + startMarker.length);
    const after = content.slice(endIndex);
    const updated = before + newFunc + after;
    fs.writeFileSync(filePath, updated, 'utf8');
    fs.writeFileSync('index.recovered.html', updated, 'utf8');
    console.log('Successfully surgical patched enableNoTopRun to V3');
} else {
    console.log('Markers not found', { startIndex, endIndex });
}
