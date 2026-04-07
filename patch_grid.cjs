const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Globals
if (!html.includes('var _gridPanelEl = null;')) {
    html = html.replace(
        "var _activeTab = 'create';",
        "var _activeTab = 'create';\n      var _gridPanelEl = null;\n      var _gridMembers = [];\n      function renderGridMembers() { if(!_gridPanelEl)return; var c=document.getElementById('cx-grid-mem-list'); if(!c)return; c.innerHTML=''; _gridMembers.forEach(function(m,i){ var r=document.createElement('div'); r.style.cssText='padding:8px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;display:flex;justify-content:space-between;margin-bottom:6px'; var t=document.createElement('div'); t.innerHTML='<div style=\"font-weight:bold;font-size:12px\">'+m.name+'</div><div style=\"font-size:11px;color:#64748b\">'+(m.label||'')+'</div>'; var x=document.createElement('button'); x.textContent='\u00D7'; x.style.cssText='background:none;border:none;cursor:pointer;font-size:16px;color:#94a3b8'; x.onclick=function(){_gridMembers.splice(i,1);renderGridMembers();}; r.appendChild(t); r.appendChild(x); c.appendChild(r); }); if(_gridMembers.length===0){c.innerHTML='<div style=\"text-align:center;padding:20px;color:#94a3b8;font-size:12px;border:2px dashed #cbd5e1;border-radius:8px\">ลากตัวแปรที่มีสเกลเดียวกันมาวางที่นี่</div>';} else { var vl=_gridMembers[0].valueLabels; if(vl){ var vv=document.createElement('div'); vv.style.cssText='margin-top:10px;font-size:10px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:10px'; vv.textContent=\"Scale Reference: \"+Object.keys(vl).map(k=>k+'='+vl[k]).join(', '); c.appendChild(vv); } } }"
    );
}

// 2. Tab Bar
if (!html.includes("tabBar.appendChild(mkTab('สร้าง Grid', 'grid'));")) {
    html = html.replace(
        "tabBar.appendChild(mkTab('สร้างใหม่', 'create'));",
        "tabBar.appendChild(mkTab('สร้างใหม่', 'create'));\n        tabBar.appendChild(mkTab('สร้าง Grid', 'grid'));"
    );
}

// 3. Grid Panel DOM
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
        
        var gf = document.createElement('div'); gf.style.cssText = 'padding:13px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fafafa';
        var gfn = document.createElement('div'); gfn.style.cssText='font-size:11px;color:#94a3b8'; gfn.textContent='ดับเบิ้ลคลิกซ้าย หรือ ลากวางเพื่อเพิ่ม';
        var gfb = document.createElement('div'); gfb.style.cssText='display:flex;gap:10px';
        var gcB = mkBtn('ยกเลิก','#fff','#374151','1.5px solid #e2e8f0'); gcB.addEventListener('click', closeModal);
        var gCr = mkBtn('สร้าง Grid','#1d4ed8','#fff','none'); gCr.style.fontWeight='700';
        gCr.addEventListener('click', function(){
           var vn=gni.value.trim().toUpperCase(); var vl=gli.value.trim();
           if(!vn) return alert('ใส่ชื่อตัวแปร');
           if(_gridMembers.length<2) return alert('เลือกอย่างน้อย 2 ตัวแปร');
           var vLabels = _gridMembers[0].valueLabels || {};
           var newVar={name:vn,longName:vn,label:vl,isString:false,isGroupedMA:false,valueLabels:vLabels,isGridUserCreated:true,gridMembers:_gridMembers.map(m=>({name:m.name,label:m.label||m.name})),_derived:true};
           var ds=_hook.data; var newCases=ds.cases; // grids don't alter cases! 
           _hook.dispatch(function(prev){ if(!prev)return prev;
             var nvs = prev.variables.filter(v=>v.name!==vn);
             return Object.assign({},prev,{variables:nvs.concat([newVar])});
           });
           closeModal(); alert('สร้าง Grid แล้ว');
        });
        gfb.appendChild(gcB); gfb.appendChild(gCr);
        gf.appendChild(gfn); gf.appendChild(gfb);
        
        gridPanel.appendChild(gm); gridPanel.appendChild(gb); gridPanel.appendChild(gf);
`;

if (!html.includes('cx-grid-mem-list')) {
    html = html.replace(
        "box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(managePanel);",
        gridPanelCode + "\n        box.appendChild(tabBar); box.appendChild(createPanel); box.appendChild(gridPanel); box.appendChild(managePanel);"
    );
}

// 4. Switch Tab Update
html = html.replace(
    "if (_createPanelEl) _createPanelEl.style.display = tab === 'create' ? '' : 'none';",
    "if (_createPanelEl) _createPanelEl.style.display = tab === 'create' ? 'flex' : 'none';\n        if (_gridPanelEl) _gridPanelEl.style.display = tab === 'grid' ? 'flex' : 'none';"
);

// 5. Build Grid Matrix on Freq Run (Run Without Top)
// Instead of modifying FreqTable which is deeply scoped, we can override `augmentResult`!
// If `augmentResult` receives a Freq array and rowVar is Grid, we rewrite it to a Crosstab matrix.
const gridInterceptionCode = `
      function buildGridMatrix(origResult, varObj, dataset, overrides) {
        if (!varObj || !varObj.isGridUserCreated || !varObj.gridMembers) return null;
        var members = varObj.gridMembers;
        var ov = overrides[varObj.name] || {};
        var labels = ov.labels || varObj.valueLabels || {};
        var scaleCodes = Array.isArray(ov.order) ? ov.order.slice() : Object.keys(labels);
        var filteredScale = cxFilterOutSummaryCodes(scaleCodes);

        var colOrder = members.map(m => m.label || m.name);
        var baseTotal = dataset.cases.length; // Actually total cases? Or cases answering grid?
        
        var matrixRows = {};
        filteredScale.forEach(code => {
           matrixRows[code] = { base: baseTotal, cols: {} };
           members.forEach(m => { matrixRows[code].cols[m.label||m.name] = 0; });
        });
        
        dataset.cases.forEach(c => {
           members.forEach(m => {
              var v = c[m.name];
              if (v == null || v === '') return;
              var k = String(v);
              if (matrixRows[k]) {
                 matrixRows[k].cols[m.label||m.name]++;
              }
           });
        });

        var maColTotals = [];
        members.forEach(m => {
           var colTot = 0;
           dataset.cases.forEach(c => {
              var v = c[m.name];
              if (v != null && v !== '') colTot++;
           });
           maColTotals.push(colTot);
        });

        var res = {
           base: baseTotal,
           colOrder: colOrder,
           rowOrder: filteredScale,
           rowLabel: "Scale",
           colLabel: varObj.label || varObj.name,
           rows: matrixRows,
           colTotalsN: maColTotals
        };
        // flag it so previewtable interprets it as a matrix
        res.__cxGridMatrix = true;
        res.__cxAugmented = true;
        return res;
      }
`;

if (!html.includes('function buildGridMatrix')) {
    html = html.replace(
        "function augmentTablesArray(tables)",
        gridInterceptionCode + "\n      function augmentTablesArray(tables)"
    );
}

// Map augmentResult
if (!html.includes('buildGridMatrix(result, rowVar, dataset, ov)')) {
    html = html.replace(
        "var aug = augmentResult(t.result, t.rowVar, ov);",
        "var h=_hookedHook||resolveLiveTablesHook(); var aug = t.rowVar && t.rowVar.isGridUserCreated && (!t.colVar) ? buildGridMatrix(t.result, t.rowVar, h?h.data:null, ov) : augmentResult(t.result, t.rowVar, ov);"
    );
}

// 6. Hook Dblclick for Grid
html = html.replace(
    "if (!_activeExpr || !_activeExpr.textarea) return;",
    "if (_activeTab === 'grid') { if(!_gridMembers.find(m=>m.name===v.name)){ _gridMembers.push(v); renderGridMembers(); } return; }\n            if (!_activeExpr || !_activeExpr.textarea) return;"
);


fs.writeFileSync(file, html, 'utf8');
console.log('Grid feature patched smoothly.');
