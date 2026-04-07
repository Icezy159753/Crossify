
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "PART B: Enable Run without TOP + inject Run Table btn";
const endMarker = "PART C: MutationObserver";

const ghostCode = `\n      function enableNoTopRun() {
        /* [V5] Ghost Button Overlay - Unstoppable Run */
        var originalBtn = Array.from(document.querySelectorAll('button')).find(function(b) {
          return b.textContent.trim() === 'Run Table' || b.textContent.trim() === 'Running...';
        });

        if (!originalBtn) return;

        /* ตรวจสอบช่อง Side และ Top */
        var sideZone = document.querySelector('[data-crossify-axis-scroll="side"]') || 
                       Array.from(document.querySelectorAll('.border-2.rounded-xl')).find(z => z.textContent.toUpperCase().includes('SIDE'));
        var topZone = document.querySelector('[data-crossify-axis-scroll="top"]') || 
                      Array.from(document.querySelectorAll('.border-2.rounded-xl')).find(z => z.textContent.toUpperCase().includes('TOP'));

        if (!sideZone || !topZone) return;

        var sideVars = sideZone.querySelectorAll('[draggable="true"]').length;
        var topVars = topZone.querySelectorAll('[draggable="true"]').length;

        /* ถ้ามี Side แต่ไม่มี Top -> สร้างปุ่มผีมาวางทับ */
        if (sideVars > 0 && topVars === 0) {
          var ghostId = '__cx_ghost_run_btn';
          var ghostBtn = document.getElementById(ghostId);

          if (!ghostBtn) {
            ghostBtn = document.createElement('button');
            ghostBtn.id = ghostId;
            ghostBtn.textContent = 'Run Table (No-TOP)';
            ghostBtn.style.cssText = 'position:absolute; z-index:9999; background:#1F4E78; color:white; font-weight:bold; border-radius:12px; cursor:pointer; font-size:14px; border:none; transition: all 0.2s;';
            
            ghostBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('[S6] Ghost Run Triggered');
              
              var varNames = [];
              sideZone.querySelectorAll('[draggable="true"]').forEach(function(el) {
                var nameDiv = el.querySelector('.truncate');
                var name = nameDiv ? nameDiv.textContent.trim() : (el.getAttribute('title') || el.textContent).trim().split(' ')[0];
                if (name) varNames.push(name);
              });

              if (varNames.length > 0 && typeof window.runWithoutTop === 'function') {
                window.runWithoutTop({ id: '__cx_live__', rowVar: varNames.join(' | '), colVar: '' });
              }
            });
            document.body.appendChild(ghostBtn);
          }

          /* จัดตำแหน่งให้ทับปุ่มเดิมเป๊ะๆ */
          var rect = originalBtn.getBoundingClientRect();
          ghostBtn.style.left = rect.left + 'px';
          ghostBtn.style.top = rect.top + 'px';
          ghostBtn.style.width = rect.width + 'px';
          ghostBtn.style.height = rect.height + 'px';
          ghostBtn.style.display = 'block';
          
          /* ซ่อนปุ่มจริงไว้ข้างหลัง */
          originalBtn.style.opacity = '0';
        } else {
          /* ถ้าเงื่อนไขไม่ครบ ให้ซ่อนปุ่มผีและคืนค่าปุ่มจริง */
          var ghost = document.getElementById('__cx_ghost_run_btn');
          if (ghost) ghost.style.display = 'none';
          originalBtn.style.opacity = '1';
        }
      }\n\n      /* `;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex + startMarker.length + 55);
    const after = content.slice(endIndex);
    fs.writeFileSync(filePath, before + ghostCode + after, 'utf8');
    fs.writeFileSync('index.recovered.html', before + ghostCode + after, 'utf8');
    console.log('Successfully surgical patched enableNoTopRun to V5 (Ghost Mode)');
} else {
    console.log('Markers not found');
}
