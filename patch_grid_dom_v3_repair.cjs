const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Remove the previously injected gridPanel code block.
// Let's use string manipulation to carefully replace it.
const startGridPanel = "/* grid panel */";
const endGridPanelSetup = "/* pre-fill if editing */";

let startIdx = html.indexOf(startGridPanel);
let endIdx = html.indexOf(endGridPanelSetup);

if (startIdx !== -1 && endIdx !== -1) {
    // Strip it out
    html = html.substring(0, startIdx) + endGridPanelSetup + html.substring(endIdx + endGridPanelSetup.length);
}

// 2. We need to add global refs:
const globals = `
      var _gridFooterEl = null;
      var _createFooterEl = null;
      var _metaEl = null;
      var _gmEl = null;
      var _rightPEl = null;
      var _gbEl = null;
`;
html = html.replace("var _gridFooterEl = null;\n      var _createFooterEl = null;", globals);

// 3. Re-inject proper logic inside buildModal
// Let's inject after: createPanel.appendChild(meta); createPanel.appendChild(panels);
const targetHook = "createPanel.appendChild(meta); createPanel.appendChild(panels);";

const theSharedDomCode = `
        _metaEl = meta;
        _rightPEl = rightP;

        var gm = document.createElement('div'); gm.style.cssText = 'padding:14px 22px;border-bottom:1px solid #f1f5f9;display:flex;gap:14px;flex-shrink:0;background:#fafafa;display:none;';
        var gni = mkInput('GRIDVAR_1','text'); gni.id='cx-grid-name'; gni.style.fontWeight='700'; gni.style.letterSpacing='0.04em';
        var gnw = fieldWrap('ชื่อตัวแปร Grid'); gnw.appendChild(gni);
        var gli = mkInput('คำอธิบายตัวแปร (Grid Label)','text'); gli.id='cx-grid-label';
        var glw = fieldWrap('คำอธิบาย (LABEL)'); glw.style.flex='2'; glw.appendChild(gli);
        gm.appendChild(gnw); gm.appendChild(glw);
        _gmEl = gm;
        createPanel.appendChild(gm); // attach right next to meta

        var gb = document.createElement('div'); gb.style.cssText='display:flex;flex:1;min-height:0;overflow:hidden;background:#f8fafc;padding:16px 22px;flex-direction:column;display:none;';
        var gh = document.createElement('div'); gh.style.cssText='font-size:12px;font-weight:bold;margin-bottom:10px;color:#334155'; gh.textContent='ตัวแปรสมาชิก (สเกลต้องเหมือนกัน)';
        var glist = document.createElement('div'); glist.id='cx-grid-mem-list'; glist.style.cssText='flex:1;overflow-y:auto';
        gb.appendChild(gh); gb.appendChild(glist);
        
        gb.addEventListener('dragover', function(e){ if(_dragVar){ e.preventDefault(); e.dataTransfer.dropEffect='copy'; }});
        gb.addEventListener('drop', function(e){ e.preventDefault(); if(_dragVar && !_gridMembers.find(m=>m.name===_dragVar.name)){ _gridMembers.push(_dragVar); renderGridMembers(); }});
        _gbEl = gb;
        panels.appendChild(gb); // attach right next to rightP
`;

if (!html.includes('_gmEl = gm;')) {
    html = html.replace(targetHook, targetHook + "\n" + theSharedDomCode);
}

// 4. Inject gridFooter right after footer
const footerHook = "fb.appendChild(cancelB); fb.appendChild(createB);\n        footer.appendChild(fn); footer.appendChild(fb);";
const theFooterCode = `
        var gridFooter = document.createElement('div');
        gridFooter.style.cssText = 'padding:13px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fafafa;display:none';
        _gridFooterEl = gridFooter;
        
        var gfn = document.createElement('div'); gfn.style.cssText='font-size:11px;color:#94a3b8'; gfn.textContent='ดับเบิ้ลคลิกซ้าย หรือ ลากวางเพื่อเพิ่มสมาชิก Grid';
        var gfb = document.createElement('div'); gfb.style.cssText='display:flex;gap:10px';
        var gcB = mkBtn('ยกเลิก','#fff','#374151','1.5px solid #e2e8f0'); gcB.addEventListener('click', closeModal);
        var gCr = mkBtn('สร้าง Grid','#1d4ed8','#fff','none'); gCr.style.fontWeight='700';
        gCr.addEventListener('click', function(){
           var vn=document.getElementById('cx-grid-name').value.trim().toUpperCase(); var vl=document.getElementById('cx-grid-label').value.trim();
           if(!vn) return alert('ใส่ชื่อตัวแปร');
           if(_gridMembers.length<2) return alert('เลือกอย่างน้อย 2 ตัวแปร');
           var vLabels = _gridMembers[0].valueLabels || {};
           var newVar={name:vn,longName:vn,label:vl,isString:false,isGroupedMA:false,valueLabels:vLabels,isGridUserCreated:true,gridMembers:_gridMembers.map(m=>({name:m.name,label:m.label||m.name})),_derived:true};
           var ds=_hook.data; var newCases=ds.cases; 
           _hook.dispatch(function(prev){ if(!prev)return prev;
             var nvs = prev.variables.filter(v=>v.name!==vn);
             return Object.assign({},prev,{variables:nvs.concat([newVar])});
           });
           closeModal();
           var t=document.createElement('div'); t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#166534;color:#fff;padding:9px 22px;border-radius:20px;font-size:12px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.2)'; t.textContent='สร้าง Grid ' + vn + ' เรียบร้อยแล้ว'; document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3500);
        });
        gfb.appendChild(gcB); gfb.appendChild(gCr);
        gridFooter.appendChild(gfn); gridFooter.appendChild(gfb);
        _createFooterEl = footer;
`;

if (!html.includes('_createFooterEl = footer;')) {
    html = html.replace(footerHook, footerHook + "\n" + theFooterCode);
}

// 5. Inject box.appendChild(gridFooter)
if (!html.includes('box.appendChild(gridFooter)')) {
    html = html.replace("box.appendChild(tb); box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(managePanel); box.appendChild(footer);", "box.appendChild(tb); box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(managePanel); box.appendChild(footer); box.appendChild(gridFooter);");
}

// 6. Rewrite switchTab completely
const oldSwitchTabRegex = /function switchTab\(tab\) \{[\s\S]*?\}/;
const newSwitchTab = `function switchTab(tab) {
        _activeTab = tab;
        if (!_tabBarEl) return;
        var btns = _tabBarEl.querySelectorAll('button[data-tab]');
        for (var i = 0; i < btns.length; i++) {
          var isActive = btns[i].getAttribute('data-tab') === tab;
          btns[i].style.background = isActive ? '#fff' : 'transparent';
          btns[i].style.color = isActive ? '#1e40af' : '#93c5fd';
          btns[i].style.fontWeight = isActive ? '700' : '500';
          btns[i].style.boxShadow = isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none';
        }

        if (_createPanelEl) _createPanelEl.style.display = (tab === 'create' || tab === 'grid') ? 'flex' : 'none';
        
        if (_metaEl && _gmEl) {
            _metaEl.style.display = tab === 'create' ? 'flex' : 'none';
            _gmEl.style.display = tab === 'grid' ? 'flex' : 'none';
        }
        if (_rightPEl && _gbEl) {
            _rightPEl.style.display = tab === 'create' ? 'flex' : 'none';
            _gbEl.style.display = tab === 'grid' ? 'flex' : 'none';
        }
        if (_createFooterEl && _gridFooterEl) {
            _createFooterEl.style.display = tab === 'create' ? 'flex' : 'none';
            _gridFooterEl.style.display = tab === 'grid' ? 'flex' : 'none';
        }

        if (_managePanelEl) {
          _managePanelEl.style.display = tab === 'manage' ? 'flex' : 'none';
          if (tab === 'manage') renderManageList();
        }
      }`;

html = html.replace(oldSwitchTabRegex, newSwitchTab);

fs.writeFileSync(file, html, 'utf8');
console.log('DOM Repaired!');
