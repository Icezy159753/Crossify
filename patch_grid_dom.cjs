const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const gridPanelCode = `
        /* grid panel */
        var gridPanel = document.createElement('div');
        gridPanel.style.cssText = 'flex-direction:column;flex:1;min-height:0;overflow:hidden;display:none';
        _gridPanelEl = gridPanel;
        
        var gm = document.createElement('div'); gm.style.cssText = 'padding:14px 22px;border-bottom:1px solid #f1f5f9;display:flex;gap:14px;flex-shrink:0;background:#fafafa';
        var gni = mkInput('GRIDVAR_1','text'); gni.id='cx-grid-name'; gni.style.fontWeight='700'; gni.style.letterSpacing='0.04em';
        var gnw = fieldWrap('ชื่อตัวแปร Grid'); gnw.appendChild(gni);
        var gli = mkInput('คำอธิบายตัวแปร (Grid Label)','text'); gli.id='cx-grid-label';
        var glw = fieldWrap('คำอธิบาย (LABEL)'); glw.style.flex='2'; glw.appendChild(gli);
        gm.appendChild(gnw); gm.appendChild(glw);
        
        var gb = document.createElement('div'); gb.style.cssText='display:flex;flex:1;min-height:0;overflow:hidden;background:#f8fafc;padding:16px 22px;flex-direction:column';
        var gh = document.createElement('div'); gh.style.cssText='font-size:12px;font-weight:bold;margin-bottom:10px;color:#334155'; gh.textContent='ตัวแปรสมาชิก (สเกลต้องเหมือนกัน)';
        var glist = document.createElement('div'); glist.id='cx-grid-mem-list'; glist.style.cssText='flex:1;overflow-y:auto';
        gb.appendChild(gh); gb.appendChild(glist);
        
        gb.addEventListener('dragover', function(e){ if(_dragVar){ e.preventDefault(); e.dataTransfer.dropEffect='copy'; }});
        gb.addEventListener('drop', function(e){ e.preventDefault(); if(_dragVar && !_gridMembers.find(m=>m.name===_dragVar.name)){ _gridMembers.push(_dragVar); renderGridMembers(); }});
        
        gridPanel.appendChild(gm); gridPanel.appendChild(gb); // NO footer inside grid panel, we use the global footer! Wait!

        // Actually grid panel needs its own footer or we update the global footer!
        // The current index.html setup has ONE global footer appended to the box.
        // It's easier if each panel has its own footer OR we hide/show footers inside switchTab.
        // BUT createPanel CURRENTLY DOES NOT append its footer inside itself.
        // Look: createPanel.appendChild(meta); createPanel.appendChild(panels);
        // And then: box.appendChild(createPanel); box.appendChild(managePanel); box.appendChild(footer);
        // This is why when the user clicked 'Grid', the footer belonged to 'Create'!
`;

// wait, if we look at the screenshot, the footer says "ดึงตัวแปรจาก Variable Folders..." and the button says "สร้างตัวแปร"!
// So the global footer is visible!

const gridFooterLogic = `
        /* grid footer overlay */
        var gridFooter = document.createElement('div');
        gridFooter.style.cssText = 'padding:13px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fafafa;display:none';
        _gridFooterEl = gridFooter;
        
        var gfn = document.createElement('div'); gfn.style.cssText='font-size:11px;color:#94a3b8'; gfn.textContent='ดับเบิ้ลคลิกซ้าย หรือ ลากวางเพื่อเพิ่มสมาชิก Grid';
        var gfb = document.createElement('div'); gfb.style.cssText='display:flex;gap:10px';
        var gcB = mkBtn('ยกเลิก','#fff','#374151','1.5px solid #e2e8f0'); gcB.addEventListener('click', closeModal);
        var gCr = mkBtn('สร้าง Grid','#1d4ed8','#fff','none'); gCr.style.fontWeight='700';
        gCr.addEventListener('click', function(){
           var vn=gni.value.trim().toUpperCase(); var vl=gli.value.trim();
           if(!vn) return alert('ใส่ชื่อตัวแปร');
           if(_gridMembers.length<2) return alert('เลือกอย่างน้อย 2 ตัวแปร');
           var vLabels = _gridMembers[0].valueLabels || {};
           var newVar={name:vn,longName:vn,label:vl,isString:false,isGroupedMA:false,valueLabels:vLabels,isGridUserCreated:true,gridMembers:_gridMembers.map(m=>({name:m.name,label:m.label||m.name})),_derived:true};
           var ds=_hook.data; var newCases=ds.cases; 
           _hook.dispatch(function(prev){ if(!prev)return prev;
             var nvs = prev.variables.filter(v=>v.name!==vn);
             return Object.assign({},prev,{variables:nvs.concat([newVar])});
           });
           closeModal(); alert('สร้าง Grid แล้ว');
        });
        gfb.appendChild(gcB); gfb.appendChild(gCr);
        gridFooter.appendChild(gfn); gridFooter.appendChild(gfb);
`;

const globalStateFix = `
      var _gridFooterEl = null;
      var _createFooterEl = null;
`;

if (!html.includes('cx-grid-mem-list')) {
    // 1. apply state fix
    html = html.replace("var _gridPanelEl = null;", globalStateFix + "var _gridPanelEl = null;");
    
    // 2. build the panel
    html = html.replace(
        "box.appendChild(tb); box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(managePanel); box.appendChild(footer);",
        gridPanelCode + gridFooterLogic + "\n        _createFooterEl = footer;\n        box.appendChild(tb); box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(gridPanel); box.appendChild(managePanel); box.appendChild(footer); box.appendChild(gridFooter);"
    );

    // 3. update switch tab
    html = html.replace(
        "if (_gridPanelEl) _gridPanelEl.style.display = tab === 'grid' ? 'flex' : 'none';",
        "if (_gridPanelEl) _gridPanelEl.style.display = tab === 'grid' ? 'flex' : 'none';\n        if (_createFooterEl) _createFooterEl.style.display = tab === 'create' ? 'flex' : 'none';\n        if (_gridFooterEl) _gridFooterEl.style.display = tab === 'grid' ? 'flex' : 'none';"
    );
    
    fs.writeFileSync(file, html, 'utf8');
    console.log('Grid Panel DOM Patched!');
} else {
    console.log('Grid panel already injected!');
}
