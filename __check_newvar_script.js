    (function () {
      'use strict';

      function fiberOf3(el) {
        var k = Object.keys(el).find(function (k) { return k.startsWith('__reactFiber'); });
        return k ? el[k] : null;
      }

      function getDatasetHook() {
        var rows = document.querySelectorAll('[draggable="true"]');
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (!(row.className || '').includes('cursor-grab')) continue;
          var f = fiberOf3(row);
          while (f) {
            var s = f.memoizedState;
            while (s) {
              var v = s.memoizedState;
              if (v && typeof v === 'object' && !Array.isArray(v) &&
                  Array.isArray(v.variables) && Array.isArray(v.cases) &&
                  v.variables.length > 0) {
                return { data: v, dispatch: s.queue.dispatch };
              }
              s = s.next;
            }
            f = f.return;
          }
        }
        return null;
      }

      function varBadge(v) {
        if (v.isGroupedMA) return { label:'MA', bg:'#d1fae5', color:'#065f46', border:'#6ee7b7' };
        if (v.isString)    return { label:'A',  bg:'#fef3c7', color:'#92400e', border:'#fcd34d' };
        if (!v.valueLabels || Object.keys(v.valueLabels).length === 0)
                           return { label:'#',  bg:'#f3f4f6', color:'#6b7280', border:'#d1d5db' };
        return               { label:'SA', bg:'#dbeafe', color:'#1e40af', border:'#93c5fd' };
      }
      function badgeStyle(v) {
        var b = varBadge(v);
        return 'display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:16px;padding:0 3px;border-radius:3px;font-size:8px;font-weight:700;flex-shrink:0;background:'+b.bg+';color:'+b.color+';border:1px solid '+b.border;
      }

      /* โ”€โ”€ Inject + button โ”€โ”€ */
      function injectPlusBtn() {
        var spans = document.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          if (spans[i].textContent.trim() !== 'VariableFolders') continue;
          var hdr = spans[i].parentElement;
          if (!hdr || hdr.querySelector('[data-cx-newvar]')) return;
          var btn = document.createElement('button');
          btn.setAttribute('data-cx-newvar', '1');
          btn.title = 'เธชเธฃเนเธฒเธเธ•เธฑเธงเนเธเธฃเนเธซเธกเน';
          btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
          btn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;border:1px solid #d1d5db;background:#fff;cursor:pointer;color:#374151;padding:0;flex-shrink:0';
          btn.addEventListener('mouseover', function(){ btn.style.background='#eff6ff';btn.style.borderColor='#93c5fd';btn.style.color='#1d4ed8'; });
          btn.addEventListener('mouseout',  function(){ btn.style.background='#fff';btn.style.borderColor='#d1d5db';btn.style.color='#374151'; });
          btn.addEventListener('click', function(e){ e.stopPropagation(); openModal(); });
          hdr.appendChild(btn); return;
        }
      }
      var _obs3 = new MutationObserver(injectPlusBtn);
      _obs3.observe(document.body, { childList: true, subtree: true });
      setTimeout(injectPlusBtn, 800);

      /* โ•โ•โ• State โ•โ•โ• */
      var _modal   = null;
      var _hook    = null;
      var _allVars = [];
      var _filterQ = '';
      var _rules   = [];
      var _dragVar = null;
      var _popover = null;
      var _activeExpr = { ruleId: null, textarea: null };
      var _rulesPanelContainer = null;
      function uid() { return Math.random().toString(36).slice(2); }
      function resolveVarDisplayName(v) {
        if (!v) return '';
        if (v.displayName && String(v.displayName).trim()) return String(v.displayName).trim();
        var base = String(v.name || '').trim();
        if (base && !/^V\d+$/i.test(base)) return base;
        var text = String(v.longName || v.label || '').trim();
        var m = text.match(/\b([A-Z]{1,8}\d+[A-Z0-9$]*)\b/i);
        if (m && m[1]) return m[1].toUpperCase();
        return base || text || '';
      }

      function openModal() {
        if (_modal) return;
        _hook = getDatasetHook();
        if (!_hook) { alert('เธเธฃเธธเธ“เธฒเนเธซเธฅเธ”เนเธเธฅเน SPSS เธเนเธญเธ'); return; }
        _allVars = _hook.data.variables
          .filter(function(v){ return v.valueLabels && Object.keys(v.valueLabels).length > 0; })
          .map(function(v){
            var next = Object.assign({}, v);
            next.displayName = resolveVarDisplayName(v);
            return next;
          });
        if (_allVars.length === 0) { alert('เนเธกเนเธเธเธ•เธฑเธงเนเธเธฃเธ—เธตเนเธกเธต Value Labels'); return; }
        _filterQ = '';
        _rules = [{ id: uid(), conditions: [], expression: '', newCode: '1', newLabel: '' }];
        buildModal();
      }
      function closeModal() {
        closePopover();
        if (_modal) { _modal.remove(); _modal = null; }
        _rules = []; _hook = null; _allVars = []; _dragVar = null;
        _activeExpr = { ruleId: null, textarea: null };
        _rulesPanelContainer = null;
      }
      function closePopover() {
        if (_popover) { _popover.remove(); _popover = null; }
      }

      function mkInput(ph, type) {
        var el = document.createElement('input');
        el.type = type||'text'; el.placeholder = ph;
        el.style.cssText = 'padding:7px 11px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:13px;font-family:inherit;width:100%;box-sizing:border-box;outline:none;color:#111827;background:#fff';
        el.addEventListener('focus', function(){ el.style.borderColor='#3b82f6'; el.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; });
        el.addEventListener('blur',  function(){ el.style.borderColor='#e5e7eb'; el.style.boxShadow='none'; });
        return el;
      }
      function mkBtn(txt, bg, fg, bdr) {
        var b = document.createElement('button');
        b.textContent = txt;
        b.style.cssText = 'padding:9px 20px;border:'+bdr+';background:'+bg+';color:'+fg+';border-radius:10px;cursor:pointer;font-size:13px;font-family:inherit';
        return b;
      }
      function fieldWrap(lbl) {
        var w = document.createElement('div'); w.style.cssText='display:flex;flex-direction:column;gap:5px;flex:1';
        var l = document.createElement('div'); l.style.cssText='font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em';
        l.textContent=lbl; w.appendChild(l); return w;
      }

      /* โ•โ• Build Modal โ•โ• */
      function buildModal() {
        var bd = document.createElement('div');
        bd.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(15,23,42,0.5);display:flex;align-items:center;justify-content:center;font-family:inherit';
        bd.addEventListener('click', function(e){ e.stopPropagation(); });

        var box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:20px;width:900px;max-width:96vw;height:80vh;max-height:660px;display:flex;flex-direction:column;box-shadow:0 32px 80px rgba(0,0,0,0.3);overflow:hidden';

        /* topbar */
        var tb = document.createElement('div');
        tb.style.cssText = 'padding:16px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%)';
        var tbLeft = document.createElement('div'); tbLeft.style.cssText='display:flex;align-items:center;gap:10px';
        tbLeft.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>'
          +'<span style="font-size:15px;font-weight:700;color:#fff">เธชเธฃเนเธฒเธเธ•เธฑเธงเนเธเธฃเนเธซเธกเน</span>'
          +'<span style="font-size:11px;color:#93c5fd;background:rgba(255,255,255,0.12);padding:2px 8px;border-radius:20px">Recode / Derive</span>';
        var tbClose = document.createElement('button');
        tbClose.innerHTML = '&times;'; tbClose.style.cssText='border:none;background:rgba(255,255,255,0.15);cursor:pointer;font-size:18px;color:#fff;width:30px;height:30px;border-radius:8px;line-height:1';
        tbClose.addEventListener('click', closeModal);
        tb.appendChild(tbLeft); tb.appendChild(tbClose);

        /* meta row */
        var meta = document.createElement('div');
        meta.style.cssText = 'padding:14px 22px;border-bottom:1px solid #f1f5f9;display:flex;gap:14px;flex-shrink:0;background:#fafafa';
        var nw = fieldWrap('เธเธทเนเธญเธ•เธฑเธงเนเธเธฃ (Name)');
        var ni = mkInput('NEWVAR','text'); ni.id='cx-dv-name'; ni.style.fontWeight='700'; ni.style.letterSpacing='0.04em';
        nw.appendChild(ni);
        var lw = fieldWrap('เธเธณเธญเธเธดเธเธฒเธข (Label)'); lw.style.flex='2';
        var li = mkInput('เธเธณเธญเธเธดเธเธฒเธขเธ•เธฑเธงเนเธเธฃเนเธซเธกเน...','text'); li.id='cx-dv-label';
        lw.appendChild(li);
        meta.appendChild(nw); meta.appendChild(lw);

        /* panels */
        var panels = document.createElement('div'); panels.style.cssText='display:flex;flex:1;overflow:hidden';
        var leftP = buildLeftPanel();
        var div = document.createElement('div'); div.style.cssText='width:1px;background:#e2e8f0;flex-shrink:0';
        var rightP = document.createElement('div'); rightP.id='cx-rules-panel'; rightP.style.cssText='flex:1;display:flex;flex-direction:column;overflow:hidden';
        buildRulesPanel(rightP);
        panels.appendChild(leftP); panels.appendChild(div); panels.appendChild(rightP);

        /* footer */
        var footer = document.createElement('div');
        footer.style.cssText = 'padding:13px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:#fafafa';
        var fn = document.createElement('div'); fn.style.cssText='font-size:11px;color:#94a3b8';
        fn.innerHTML = '<b>เธฅเธฒเธ</b>เธ•เธฑเธงเนเธเธฃเธเธฒเธเธเนเธฒเธขเนเธเธงเธฒเธเนเธเธเนเธญเธ "เน€เธเธทเนเธญเธเนเธ" &nbsp;ยท&nbsp; <b>เธเธฅเธดเธ</b> chip เน€เธเธทเนเธญเน€เธฅเธทเธญเธ/เน€เธเธดเนเธก Code (เน€เธฅเธทเธญเธเนเธ”เนเธซเธฅเธฒเธข Code)';
        var fb = document.createElement('div'); fb.style.cssText='display:flex;gap:10px';
        var cancelB = mkBtn('เธขเธเน€เธฅเธดเธ','#fff','#374151','1.5px solid #e2e8f0');
        cancelB.addEventListener('click', closeModal);
        var createB = mkBtn('เธชเธฃเนเธฒเธเธ•เธฑเธงเนเธเธฃ','#1d4ed8','#fff','none'); createB.style.fontWeight='700';
        createB.addEventListener('mouseover', function(){ createB.style.background='#1e40af'; });
        createB.addEventListener('mouseout',  function(){ createB.style.background='#1d4ed8'; });
        createB.addEventListener('click', doCreate);
        fb.appendChild(cancelB); fb.appendChild(createB);
        footer.appendChild(fn); footer.appendChild(fb);

        box.appendChild(tb); box.appendChild(meta); box.appendChild(panels); box.appendChild(footer);
        bd.appendChild(box); document.body.appendChild(bd);
        _modal = bd; ni.focus();
      }

      /* โ•โ• Left Panel โ•โ• */
      function buildLeftPanel() {
        var lp = document.createElement('div');
        lp.style.cssText = 'width:240px;flex-shrink:0;display:flex;flex-direction:column;background:#f8fafc;overflow:hidden;min-height:0';
        var lpTop = document.createElement('div'); lpTop.style.cssText='padding:10px 12px 8px;border-bottom:1px solid #e2e8f0;flex-shrink:0';
        var lpTitle = document.createElement('div'); lpTitle.style.cssText='font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px';
        lpTitle.textContent = 'เธ•เธฑเธงเนเธเธฃ (เธฅเธฒเธเน€เธเธทเนเธญเน€เธเธดเนเธกเน€เธเธทเนเธญเธเนเธ)';
        var srch = document.createElement('input'); srch.type='text'; srch.placeholder='เธเนเธเธซเธฒ...';
        srch.style.cssText = 'padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;font-family:inherit;outline:none;background:#fff;width:100%;box-sizing:border-box';
        srch.addEventListener('focus', function(){ srch.style.borderColor='#3b82f6'; });
        srch.addEventListener('blur',  function(){ srch.style.borderColor='#e2e8f0'; });
        srch.addEventListener('input', function(){ _filterQ=srch.value.toLowerCase(); renderVarList(listEl); });
        lpTop.appendChild(lpTitle); lpTop.appendChild(srch);
        var listEl = document.createElement('div'); listEl.id='cx-var-list'; listEl.style.cssText='flex:1 1 0%;min-height:0;overflow-y:auto;overflow-x:hidden;padding:6px;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch';
        renderVarList(listEl);
        lp.appendChild(lpTop); lp.appendChild(listEl); return lp;
      }

      function renderVarList(container) {
        container.innerHTML = '';
        var filtered = _filterQ
          ? _allVars.filter(function(v){ return v.name.toLowerCase().includes(_filterQ)||(v.label||'').toLowerCase().includes(_filterQ)||(v.longName||'').toLowerCase().includes(_filterQ); })
          : _allVars;
        filtered.forEach(function(v) {
          var item = document.createElement('div');
          item.draggable = true;
          item.style.cssText = 'display:flex;align-items:flex-start;gap:7px;padding:7px 8px;border-radius:8px;cursor:grab;user-select:none;margin-bottom:2px;border:1.5px solid transparent;transition:all 0.1s';
          item.addEventListener('mouseover', function(){ item.style.background='#fff'; item.style.borderColor='#bfdbfe'; item.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; });
          item.addEventListener('mouseout',  function(){ item.style.background=''; item.style.borderColor='transparent'; item.style.boxShadow='none'; });
          var badge = document.createElement('span'); badge.style.cssText=badgeStyle(v)+';margin-top:2px'; badge.textContent=varBadge(v).label;
          var txt = document.createElement('div'); txt.style.cssText='min-width:0;flex:1';
          var nm = document.createElement('div'); nm.style.cssText='font-size:12px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'; nm.textContent=v.displayName||v.name;
          var lb = document.createElement('div'); lb.style.cssText='font-size:10px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'; lb.textContent=v.label||v.longName||'';
          txt.appendChild(nm); txt.appendChild(lb);
          item.appendChild(badge); item.appendChild(txt);
          item.addEventListener('dragstart', function(e){ _dragVar=v; e.dataTransfer.effectAllowed='copy'; e.dataTransfer.setData('text/plain',v.name); item.style.opacity='0.45'; });
          item.addEventListener('dragend',   function(){ _dragVar=null; item.style.opacity='1'; });
          item.addEventListener('dblclick', function(){
            if (!_activeExpr || !_activeExpr.textarea) return;
            insertVarToken(_activeExpr.textarea, v.name);
            _activeExpr.textarea.dispatchEvent(new Event('input', { bubbles: true }));
            _activeExpr.textarea.focus();
          });
          container.appendChild(item);
        });
        if (filtered.length===0) {
          var em=document.createElement('div'); em.style.cssText='text-align:center;padding:24px;font-size:12px;color:#94a3b8'; em.textContent='เนเธกเนเธเธเธ•เธฑเธงเนเธเธฃ'; container.appendChild(em);
        }
      }

      /* โ•โ• Rules Panel โ•โ• */
      function insertVarToken(textarea, varName) {
        var start = textarea.selectionStart || 0;
        var end = textarea.selectionEnd || start;
        var left = textarea.value.slice(0, start);
        var right = textarea.value.slice(end);
        var needLeft = left.length > 0 && !/\s|\(|&|\||!|=|<|>$/.test(left);
        var needRight = right.length > 0 && !/^\s|\)|&|\||!|=|<|>/.test(right);
        var token = (needLeft ? ' ' : '') + varName + (needRight ? ' ' : '');
        textarea.value = left + token + right;
        var caret = left.length + token.length;
        textarea.selectionStart = textarea.selectionEnd = caret;
      }

      function tokenizeExpr(input) {
        var src = String(input || '');
        var i = 0;
        var out = [];
        while (i < src.length) {
          var c = src[i];
          if (/\s/.test(c)) { i++; continue; }
          if (c === '(' || c === ')') { out.push({ t: c, v: c, p: i++ }); continue; }
          if (c === '&' || c === '|') { out.push({ t: 'L', v: src[i + 1] === c ? (i++, c + c) : c, p: i++ }); continue; }
          if (c === '!') { out.push({ t: src[i + 1] === '=' ? 'O' : 'N', v: src[i + 1] === '=' ? (i++, '!=') : '!', p: i++ }); continue; }
          if (c === '<' || c === '>') {
            if (src[i + 1] === '=') { out.push({ t: 'O', v: c + '=', p: i }); i += 2; continue; }
            if (c === '<' && src[i + 1] === '>') { out.push({ t: 'O', v: '!=', p: i }); i += 2; continue; }
            out.push({ t: 'O', v: c, p: i++ }); continue;
          }
          if (c === '=') { out.push({ t: 'O', v: src[i + 1] === '=' ? (i++, '==') : '=', p: i++ }); continue; }
          if (c === '"' || c === "'") {
            var q = c; var p = i++; var str = '';
            while (i < src.length && src[i] !== q) str += src[i++];
            if (i >= src.length) throw new Error('Unclosed string at ' + p);
            i++;
            out.push({ t: 'S', v: str, p: p });
            continue;
          }
          if (/[0-9.]/.test(c)) {
            var ns = i;
            while (i < src.length && /[0-9.]/.test(src[i])) i++;
            var raw = src.slice(ns, i);
            if (!/^\d+(\.\d+)?$/.test(raw)) throw new Error('Invalid number "' + raw + '" at ' + ns);
            out.push({ t: 'M', v: Number(raw), p: ns });
            continue;
          }
          if (/[A-Za-z_$]/.test(c)) {
            var ws = i;
            while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) i++;
            var w = src.slice(ws, i);
            var u = w.toUpperCase();
            if (u === 'AND' || u === 'OR') out.push({ t: 'L', v: u, p: ws });
            else if (u === 'NOT') out.push({ t: 'N', v: 'NOT', p: ws });
            else out.push({ t: 'I', v: w, p: ws });
            continue;
          }
          throw new Error('Unexpected "' + c + '" at ' + i);
        }
        out.push({ t: 'E', v: '', p: src.length });
        return out;
      }

      function parseExpr(tokens) {
        var p = 0;
        var used = new Set();
        function cur() { return tokens[p]; }
        function eat(t) { return cur().t === t ? tokens[p++] : null; }
        function req(t, m) { if (!eat(t)) throw new Error(m + ' at ' + cur().p); }
        function primary() {
          var t = cur();
          if (eat('(')) { var e = orExpr(); req(')', 'Expected )'); return e; }
          if (eat('M')) return { k: 'lit', v: t.v };
          if (eat('S')) return { k: 'lit', v: t.v };
          if (eat('I')) { used.add(t.v); return { k: 'var', n: t.v }; }
          throw new Error('Expected value at ' + t.p);
        }
        function cmpExpr() {
          var l = primary();
          var o = cur().t === 'O' ? tokens[p++] : null;
          if (!o) return l;
          return { k: 'cmp', o: o.v, l: l, r: primary() };
        }
        function unary() { return eat('N') ? { k: 'not', e: unary() } : cmpExpr(); }
        function andExpr() { var n = unary(); while (cur().t === 'L' && (cur().v === '&' || cur().v === '&&' || cur().v === 'AND')) { p++; n = { k: 'and', l: n, r: unary() }; } return n; }
        function orExpr() { var n = andExpr(); while (cur().t === 'L' && (cur().v === '|' || cur().v === '||' || cur().v === 'OR')) { p++; n = { k: 'or', l: n, r: andExpr() }; } return n; }
        var ast = orExpr();
        if (cur().t !== 'E') throw new Error('Unexpected token at ' + cur().p);
        return { ast: ast, used: Array.from(used) };
      }

      function toNum(v) { var n = Number(v); return Number.isFinite(n) ? n : NaN; }
      function cmpVals(a, b, op) {
        var an = toNum(a), bn = toNum(b), both = Number.isFinite(an) && Number.isFinite(bn);
        if (op === '=' || op === '==') return both ? an === bn : String(a) === String(b);
        if (op === '!=') return both ? an !== bn : String(a) !== String(b);
        if (!both) return false;
        if (op === '>') return an > bn;
        if (op === '>=') return an >= bn;
        if (op === '<') return an < bn;
        if (op === '<=') return an <= bn;
        return false;
      }

      function evalExprAst(node, row) {
        if (!node) return false;
        if (node.k === 'lit') return node.v;
        if (node.k === 'var') return row[node.n];
        if (node.k === 'cmp') return cmpVals(evalExprAst(node.l, row), evalExprAst(node.r, row), node.o);
        if (node.k === 'not') return !Boolean(evalExprAst(node.e, row));
        if (node.k === 'and') return Boolean(evalExprAst(node.l, row)) && Boolean(evalExprAst(node.r, row));
        if (node.k === 'or') return Boolean(evalExprAst(node.l, row)) || Boolean(evalExprAst(node.r, row));
        return false;
      }

      function validateExpression(expr) {
        var source = String(expr || '').trim();
        if (!source) return { ok: false, error: 'Expression is required' };
        try {
          var parsed = parseExpr(tokenizeExpr(source));
          var varMap = Object.create(null);
          _allVars.forEach(function (v) { varMap[v.name] = true; });
          var miss = parsed.used.filter(function (name) { return !varMap[name]; });
          if (miss.length > 0) return { ok: false, error: 'Unknown variable: ' + miss.join(', ') };
          return { ok: true, ast: parsed.ast, used: parsed.used };
        } catch (err) {
          return { ok: false, error: err && err.message ? err.message : 'Invalid expression' };
        }
      }

      function buildRulesPanel(container) {
        container.innerHTML = '';
        var rHdr = document.createElement('div'); rHdr.style.cssText='padding:10px 16px 8px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f5f9;flex-shrink:0';
        var rTitle = document.createElement('div'); rTitle.style.cssText='font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em'; rTitle.textContent='Output Codes';
        var addBtn = document.createElement('button'); addBtn.style.cssText='padding:4px 12px;border:1.5px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;color:#475569;font-family:inherit'; addBtn.innerHTML='+ เน€เธเธดเนเธก Code';
        addBtn.addEventListener('mouseover', function(){ addBtn.style.borderColor='#93c5fd'; addBtn.style.color='#1d4ed8'; });
        addBtn.addEventListener('mouseout',  function(){ addBtn.style.borderColor='#e2e8f0'; addBtn.style.color='#475569'; });
        addBtn.addEventListener('click', function(){ _rules.push({id:uid(),conditions:[],expression:'',newCode:String(_rules.length+1),newLabel:''}); buildRulesPanel(container); });
        rHdr.appendChild(rTitle); rHdr.appendChild(addBtn);

        var rBody = document.createElement('div'); rBody.id='cx-rules-body'; rBody.style.cssText='flex:1 1 0%;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch';
        var rInner = document.createElement('div'); rInner.style.cssText='display:flex;flex-direction:column;gap:10px;padding:12px 16px;min-height:min-content';

        _rules.forEach(function(rule, rIdx) {
          var card = document.createElement('div'); card.style.cssText='background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:10px';

          /* top row */
          var topRow = document.createElement('div'); topRow.style.cssText='display:flex;align-items:center;gap:8px';
          var ncL = document.createElement('div'); ncL.style.cssText='font-size:10px;font-weight:700;color:#64748b;white-space:nowrap;text-transform:uppercase;letter-spacing:0.05em'; ncL.textContent='Code เนเธซเธกเน';
          var ncI = document.createElement('input'); ncI.type='number'; ncI.value=rule.newCode; ncI.placeholder='1';
          ncI.style.cssText='width:64px;padding:6px 8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:700;font-family:inherit;text-align:center;outline:none;background:#fff';
          ncI.addEventListener('focus', function(){ ncI.style.borderColor='#3b82f6'; }); ncI.addEventListener('blur', function(){ ncI.style.borderColor='#e2e8f0'; });
          ncI.addEventListener('input', function(){ _rules[rIdx].newCode=ncI.value; });
          var arrow = document.createElement('div'); arrow.style.flexShrink='0'; arrow.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
          var nlI = document.createElement('input'); nlI.type='text'; nlI.value=rule.newLabel; nlI.placeholder='Label เธเธญเธ Code เธเธตเน...';
          nlI.style.cssText='flex:1;padding:6px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;font-family:inherit;outline:none;background:#fff';
          nlI.addEventListener('focus', function(){ nlI.style.borderColor='#3b82f6'; }); nlI.addEventListener('blur', function(){ nlI.style.borderColor='#e2e8f0'; });
          nlI.addEventListener('input', function(){ _rules[rIdx].newLabel=nlI.value; });
          var copyB = document.createElement('button'); copyB.textContent='Copy';
          copyB.style.cssText='border:1px solid #dbeafe;background:#eff6ff;cursor:pointer;color:#1d4ed8;padding:4px 8px;border-radius:6px;flex-shrink:0;font-size:11px;font-weight:600';
          copyB.addEventListener('click', function(){
            var nextNum = _rules.reduce(function(mx, rr){
              var n = Number(rr.newCode);
              return Number.isFinite(n) ? Math.max(mx, n) : mx;
            }, 0) + 1;
            var cloned = {
              id: uid(),
              conditions: JSON.parse(JSON.stringify(rule.conditions || [])),
              expression: String(rule.expression || ''),
              newCode: String(nextNum),
              newLabel: String(rule.newLabel || '')
            };
            _rules.splice(rIdx + 1, 0, cloned);
            buildRulesPanel(container);
          });
          var delB = document.createElement('button'); delB.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
          delB.style.cssText='border:none;background:none;cursor:pointer;color:#cbd5e1;padding:4px;border-radius:6px;flex-shrink:0;display:flex;align-items:center';
          delB.addEventListener('mouseover', function(){ delB.style.background='#fef2f2'; delB.style.color='#ef4444'; }); delB.addEventListener('mouseout', function(){ delB.style.background='none'; delB.style.color='#cbd5e1'; });
          delB.addEventListener('click', function(){ _rules.splice(rIdx,1); buildRulesPanel(container); });
          topRow.appendChild(ncL); topRow.appendChild(ncI); topRow.appendChild(arrow); topRow.appendChild(nlI); topRow.appendChild(copyB); topRow.appendChild(delB);

          /* conditions */
          var condHdr = document.createElement('div'); condHdr.style.cssText='font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:0.04em'; condHdr.textContent='Expression เน€เธเธทเนเธญเธเนเธ โ€” เธเธดเธกเธเนเน€เธญเธเนเธ”เน, เธฅเธฒเธ/เธ”เธฑเธเน€เธเธดเนเธฅเธเธฅเธดเธเธ•เธฑเธงเนเธเธฃเน€เธเธทเนเธญเนเธ—เธฃเธ';
          var dz = document.createElement('div'); dz.style.cssText='min-height:48px;border:2px dashed #cbd5e1;border-radius:10px;padding:8px 10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;background:#fff;transition:all 0.15s';
          renderConditionChips(dz, rule, rIdx, container);
          dz.addEventListener('dragover', function(e){ if(!_dragVar)return; e.preventDefault(); e.dataTransfer.dropEffect='copy'; dz.style.borderColor='#3b82f6'; dz.style.background='#eff6ff'; });
          dz.addEventListener('dragleave', function(){ dz.style.borderColor='#cbd5e1'; dz.style.background='#fff'; });
          dz.addEventListener('drop', function(e){
            e.preventDefault(); dz.style.borderColor='#cbd5e1'; dz.style.background='#fff';
            if(!_dragVar) return; var v=_dragVar;
            if(!rule.conditions.some(function(c){ return c.varName===v.name; })) rule.conditions.push({varName:v.name,displayName:v.displayName||v.name,codes:[]});
            if (_activeExpr && _activeExpr.textarea) {
              insertVarToken(_activeExpr.textarea, v.name);
              _activeExpr.textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            buildRulesPanel(container);
          });
          var exprTa = document.createElement('textarea');
          exprTa.rows = 3;
          exprTa.value = rule.expression || '';
          exprTa.placeholder = 'เน€เธเนเธ SQ1=1 & SQ2=2 เธซเธฃเธทเธญ (SQ1=1 | SQ1=2) & SQ3!=9';
          exprTa.style.cssText = 'width:100%;min-height:62px;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.5;font-family:ui-monospace,Consolas,monospace;box-sizing:border-box;outline:none;background:#fff';
          var exprStatus = document.createElement('div');
          exprStatus.style.cssText = 'font-size:11px;line-height:1.4';
          function refreshExprStatus() {
            var result = validateExpression(exprTa.value);
            if (result.ok) {
              exprStatus.style.color = '#16a34a';
              exprStatus.textContent = 'เธเธฃเนเธญเธกเนเธเนเธเธฒเธ | vars: ' + (result.used.length ? result.used.join(', ') : '-');
              exprTa.style.borderColor = '#86efac';
            } else {
              exprStatus.style.color = '#dc2626';
              exprStatus.textContent = 'Error: ' + result.error;
              exprTa.style.borderColor = '#fca5a5';
            }
          }
          exprTa.addEventListener('focus', function(){ _activeExpr = { ruleId: rule.id, textarea: exprTa }; });
          exprTa.addEventListener('input', function(){ _rules[rIdx].expression = exprTa.value; refreshExprStatus(); });
          exprTa.addEventListener('dragover', function(e){ if(!_dragVar) return; e.preventDefault(); e.dataTransfer.dropEffect='copy'; });
          exprTa.addEventListener('drop', function(e){
            e.preventDefault();
            if(!_dragVar) return;
            insertVarToken(exprTa, _dragVar.name);
            exprTa.dispatchEvent(new Event('input', { bubbles: true }));
            exprTa.focus();
          });
          refreshExprStatus();
          card.appendChild(topRow); card.appendChild(condHdr); card.appendChild(dz); card.appendChild(exprTa); card.appendChild(exprStatus);
          rInner.appendChild(card);
        });

        if (_rules.length===0) {
          var em2=document.createElement('div'); em2.style.cssText='text-align:center;padding:48px 20px;color:#94a3b8;font-size:13px'; em2.innerHTML='<div style="font-size:36px;margin-bottom:10px">๐“</div>เธเธ” "+ เน€เธเธดเนเธก Code" เน€เธเธทเนเธญเธชเธฃเนเธฒเธเธเธเนเธฃเธ'; rInner.appendChild(em2);
        }
        rBody.appendChild(rInner);
        container.appendChild(rHdr); container.appendChild(rBody);
      }

      /* โ•โ• Condition chips โ•โ• */
      function renderConditionChips(dz, rule, rIdx, container) {
        dz.innerHTML = '';
        rule.conditions.forEach(function(cond, cIdx) {
          var srcV = _allVars.find(function(v){ return v.name===cond.varName; });
          if (!srcV) return;
          if (cIdx>0) {
            var andTag=document.createElement('span'); andTag.style.cssText='font-size:9px;font-weight:700;color:#7c3aed;background:#f3e8ff;padding:3px 8px;border-radius:20px;letter-spacing:0.06em;flex-shrink:0'; andTag.textContent='AND'; dz.appendChild(andTag);
          }
          var hasCode = cond.codes.length > 0;
          var chip = document.createElement('div');
          chip.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:4px 8px 4px 6px;border-radius:8px;background:#fff;border:1.5px solid '+(hasCode?'#bfdbfe':'#fca5a5')+';cursor:pointer;user-select:none;max-width:260px';
          chip.title = 'เธเธฅเธดเธเน€เธเธทเนเธญเน€เธฅเธทเธญเธ/เนเธเนเนเธ Code';
          var cb=document.createElement('span'); cb.style.cssText=badgeStyle(srcV); cb.textContent=varBadge(srcV).label;
          var cn=document.createElement('span'); cn.style.cssText='font-size:11px;font-weight:700;color:#1e293b'; cn.textContent=cond.displayName||srcV.displayName||srcV.name||cond.varName;
          var eq=document.createElement('span'); eq.style.cssText='font-size:11px;color:#94a3b8;margin:0 1px'; eq.textContent='=';
          var cv=document.createElement('span'); cv.style.cssText='font-size:11px;font-weight:600;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
          if (!hasCode) { cv.textContent='เธเธฅเธดเธเน€เธฅเธทเธญเธ'; cv.style.color='#ef4444'; }
          else { cv.textContent=cond.codes.join(', '); cv.style.color='#1d4ed8'; }
          var cx=document.createElement('span'); cx.style.cssText='font-size:14px;color:#94a3b8;line-height:1;cursor:pointer;margin-left:2px;flex-shrink:0'; cx.textContent='ร—';
          cx.addEventListener('click', function(e){ e.stopPropagation(); rule.conditions.splice(cIdx,1); buildRulesPanel(container); });
          chip.appendChild(cb); chip.appendChild(cn); chip.appendChild(eq); chip.appendChild(cv); chip.appendChild(cx);
          chip.addEventListener('click', function(e){ e.stopPropagation(); showCodePopover(srcV, cond, container, chip); });
          dz.appendChild(chip);
        });
        if (rule.conditions.length===0) {
          var hint=document.createElement('div'); hint.style.cssText='font-size:11px;color:#cbd5e1;pointer-events:none'; hint.textContent='เธฅเธฒเธเธ•เธฑเธงเนเธเธฃเธเธฒเธเธเนเธฒเธขเธกเธฒเธงเธฒเธเธ—เธตเนเธเธตเน'; dz.appendChild(hint);
        }
      }

      /* โ•โ• Code Popover โ•โ• */
      function showCodePopover(srcV, cond, rulesContainer, anchorEl) {
        closePopover();
        var pop = document.createElement('div');
        pop.style.cssText = 'position:fixed;z-index:2147483647;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:8px;min-width:260px;max-width:340px;max-height:300px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.18);font-family:inherit';
        pop.addEventListener('click', function(e){ e.stopPropagation(); });

        var ph = document.createElement('div'); ph.style.cssText='font-size:11px;font-weight:700;color:#475569;padding:2px 4px 8px;border-bottom:1px solid #f1f5f9;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center';
        ph.innerHTML = '<span>' + (cond.displayName||srcV.displayName||srcV.name||cond.varName) + ' &nbsp;โ€”&nbsp; เน€เธฅเธทเธญเธ Code (เน€เธฅเธทเธญเธเนเธ”เนเธซเธฅเธฒเธข)</span>';
        var phX=document.createElement('span'); phX.textContent='ร—'; phX.style.cssText='cursor:pointer;color:#94a3b8;font-size:16px'; phX.addEventListener('click', closePopover);
        ph.appendChild(phX); pop.appendChild(ph);

        var entries = Object.entries(srcV.valueLabels).sort(function(a,b){ return Number(a[0])-Number(b[0]); });
        entries.forEach(function(pair) {
          var row=document.createElement('label'); row.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:6px;cursor:pointer;font-size:12px;color:#1e293b';
          row.addEventListener('mouseover', function(){ row.style.background='#f8fafc'; }); row.addEventListener('mouseout', function(){ row.style.background=''; });
          var cb=document.createElement('input'); cb.type='checkbox'; cb.value=pair[0]; cb.checked=cond.codes.indexOf(pair[0])!==-1;
          cb.style.cssText='width:14px;height:14px;cursor:pointer;accent-color:#1d4ed8;flex-shrink:0';
          cb.addEventListener('change', function(){
            if (cb.checked) { if (cond.codes.indexOf(pair[0])===-1) cond.codes.push(pair[0]); }
            else { cond.codes=cond.codes.filter(function(c){ return c!==pair[0]; }); }
            buildRulesPanel(rulesContainer);
            closePopover();
          });
          var cNum=document.createElement('span'); cNum.style.cssText='font-weight:700;color:#1d4ed8;min-width:28px;font-size:12px'; cNum.textContent=pair[0];
          var cLbl=document.createElement('span'); cLbl.style.cssText='color:#475569;flex:1'; cLbl.textContent=String(pair[1]);
          row.appendChild(cb); row.appendChild(cNum); row.appendChild(cLbl); pop.appendChild(row);
        });

        document.body.appendChild(pop); _popover = pop;
        var rect = anchorEl.getBoundingClientRect();
        pop.style.left=rect.left+'px'; pop.style.top=(rect.bottom+6)+'px';
        var pr = pop.getBoundingClientRect();
        if (pr.right>window.innerWidth)  pop.style.left=(rect.right-pr.width)+'px';
        if (pr.bottom>window.innerHeight) pop.style.top=(rect.top-pr.height-6)+'px';
        setTimeout(function(){ document.addEventListener('click', function h(){ closePopover(); document.removeEventListener('click',h); }); }, 0);
      }

      /* โ•โ• Create Variable โ•โ• */
      function doCreate() {
        var nameEl=document.getElementById('cx-dv-name'); var labelEl=document.getElementById('cx-dv-label');
        var varName=nameEl?nameEl.value.trim().toUpperCase():'';
        var varLabel=labelEl?labelEl.value.trim():'';
        if (!varName) { alert('เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธเธทเนเธญเธ•เธฑเธงเนเธเธฃ'); return; }
        if (!/^[A-Z_][A-Z0-9_]*$/.test(varName)) { alert('เธเธทเนเธญเธ•เนเธญเธเธเธถเนเธเธ•เนเธเธ”เนเธงเธขเธ•เธฑเธงเธญเธฑเธเธฉเธฃ/_ เนเธฅเธฐเธกเธตเน€เธเธเธฒเธฐ A-Z 0-9 _'); return; }
        if (_hook.data.variables.some(function(v){ return v.name===varName; })) { alert('เธ•เธฑเธงเนเธเธฃ '+varName+' เธกเธตเธญเธขเธนเนเนเธฅเนเธง'); return; }
        var validRules = [];
        var exprErrors = [];
        _rules.forEach(function(r, idx){
          if (r.newCode==='') return;
          var expr = String(r.expression || '').trim();
          if (expr) {
            var check = validateExpression(expr);
            if (!check.ok) {
              exprErrors.push('Rule #' + (idx + 1) + ': ' + check.error);
              return;
            }
            validRules.push({ newCode: r.newCode, newLabel: r.newLabel, mode: 'expr', ast: check.ast });
            return;
          }
          if (r.conditions.length>0 && r.conditions.every(function(c){ return c.codes.length>0; })) {
            validRules.push({ newCode: r.newCode, newLabel: r.newLabel, mode: 'chip', conditions: r.conditions });
          }
        });
        if (exprErrors.length > 0) { alert('Expression Error:\\n' + exprErrors.join('\\n')); return; }
        if (validRules.length===0) { alert('เธเธฃเธธเธ“เธฒเน€เธเธดเนเธกเธเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธเธ เนเธฅเธฐเธเธฃเธญเธ expression เธซเธฃเธทเธญเน€เธฅเธทเธญเธ chip เนเธซเนเธเธฃเธ'); return; }
        var newVL={};
        validRules.forEach(function(r){ if(!(r.newCode in newVL)) newVL[r.newCode]=r.newLabel||('Code '+r.newCode); });
        var ds=_hook.data;
        var newCases=ds.cases.map(function(row){
          for (var ri=0;ri<validRules.length;ri++) {
            var rule=validRules[ri];
            var allMatch = false;
            if (rule.mode === 'expr') {
              allMatch = !!evalExprAst(rule.ast, row);
            } else {
              allMatch = rule.conditions.every(function(cond){
                var raw=row[cond.varName]; if(raw===null||raw===undefined) return false;
                return cond.codes.some(function(code){ return Number(raw)===Number(code); });
              });
            }
            if (allMatch) { var obj=Object.assign({},row); obj[varName]=Number(rule.newCode); return obj; }
          }
          var obj2=Object.assign({},row); obj2[varName]=null; return obj2;
        });
        var newVar={name:varName,longName:varName,label:varLabel||varName,isString:false,isGroupedMA:false,valueLabels:newVL,_derived:true};
        _hook.dispatch(function(prev){ if(!prev) return prev; return Object.assign({},prev,{variables:prev.variables.concat([newVar]),cases:newCases}); });
        var matched=newCases.filter(function(r){ return r[varName]!==null; }).length;
        closeModal();
        var t=document.createElement('div'); t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#166534;color:#fff;padding:9px 22px;border-radius:20px;font-size:12px;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:none';
        t.textContent='โ“ เธชเธฃเนเธฒเธ '+varName+' เน€เธฃเธตเธขเธเธฃเนเธญเธข โ€” matched '+matched+'/'+newCases.length+' cases';
        document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 3500);
      }

      document.addEventListener('keydown', function(e){
        if (e.key==='Escape') { if(_popover) closePopover(); else if(_modal) closeModal(); }
      });

    })();
