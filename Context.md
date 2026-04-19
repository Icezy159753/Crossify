# Context.md — Crossify Project

> จุดบันทึก Architecture, การทำงาน, และข้อควรระวังสำหรับการพัฒนาต่อ

---

## 1. ภาพรวมโปรเจค

**Crossify** คือแอป Crosstab (ตารางไขว้) สำหรับวิเคราะห์ข้อมูล SPSS ทำงานเป็น Single-Page App บน Browser ไม่มี Backend server ทุกอย่างประมวลผลใน client-side JavaScript

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + Vitest

**ไฟล์ข้อมูล SPSS:** โหลด .sav โดยตรงใน browser ผ่าน `savParser.ts`

---

## 2. สถาปัตยกรรมคู่ (Dual Architecture) — สำคัญมาก

โปรเจคนี้มีสถาปัตยกรรม **2 ชั้นที่ทำงานคู่กัน** ซึ่งต้องเข้าใจให้ดีก่อนแก้ bug:

### ชั้นที่ 1 — React Source Code (`src/`)
- โค้ดต้นฉบับ TypeScript/React ที่ compile ได้
- เป็น "ความจริง" ของ logic พื้นฐาน เช่น `crosstabEngine.ts`, `variableGrouping.ts`
- **ไม่ได้ใช้งานตรงๆ** — ต้อง build ก่อน

### ชั้นที่ 2 — Compiled Bundle + Inline Scripts (`index.html`)
- **`public/assets/index-DsrIxxwV.js`** — compiled bundle จาก Vite (minified)
  - มีฟังก์ชัน crosstab engine ทั้งหมดที่ซ่อนชื่อ เช่น `Pi`, `TiForCol`, `QnForCol`
  - เป็นโค้ดที่ browser ใช้งานจริง
- **`index.html`** — มี inline `<script>` หลายตัวที่เพิ่มฟีเจอร์ post-compile:
  - **S6 script** (บรรทัด ~6058–6260): inject T2B/Mean columns ผ่าน dispatch wrapper
  - **S7 script** (บรรทัด ~8500+): DOM manipulation เพื่อซ่อน Total column (HideTotal)

> ⚠️ **ข้อควรระวัง:** เมื่อแก้ bug ที่เกี่ยวกับ computation ต้องแก้ใน **compiled bundle** หรือ **inline script** ไม่ใช่ใน `src/` เพราะ `src/` ไม่ถูก rebuild อัตโนมัติ

---

## 3. โครงสร้างไฟล์สำคัญ

```
Crossify/
├── index.html                          ← deploy file หลัก + inline scripts S1-S8
├── public/assets/index-DsrIxxwV.js    ← compiled bundle (แก้ตรงนี้สำหรับ engine)
└── src/
    ├── App.tsx                         ← main React app component
    ├── components/
    │   └── PreviewTable.tsx            ← render ตาราง crosstab (Grid structure)
    └── lib/
        ├── crosstabEngine.ts           ← pure crosstab computation (basic)
        ├── variableGrouping.ts         ← MA group / Grid variable logic
        ├── filterEngine.ts             ← filter evaluation
        ├── savParser.ts                ← SPSS .sav file parser
        ├── variableEditorUtils.ts      ← Net/TB/T2B editor helpers
        └── appStateUtils.ts            ← axis spec parser/manipulator
```

---

## 4. ฟังก์ชันสำคัญใน Compiled Bundle

| ชื่อฟังก์ชัน | หน้าที่ |
|---|---|
| `Pi(i, f, g, w, N)` | Synchronous crosstab compute (entry point หลัก) |
| `Zl(i, f, g, w, N)` | Async version ของ `Pi` |
| `TiForCol(i, f, g, ...)` | เพิ่ม T2B/Mean columns สำหรับ column variable |
| `QnForCol(i, f, g)` | เพิ่ม Net columns สำหรับ column variable |
| `Qn(result, rowVar, g)` | เพิ่ม Net/stat rows สำหรับ row variable |
| `$p(...)` | Grid row computation (synchronous) |
| `Wt(varName)` | ดึง Grid variable definition |
| `ct(varName)` | ดึง axis variable spec |
| `Lr(result, hideZeroRows)` | apply hideZeroRows filter |
| `yr(spec, labeledCase, rawCase)` | map data row → row combo keys |

---

## 5. ระบบตัวแปร Grid

Grid variable คือตัวแปรที่ผู้ใช้สร้างขึ้นมาเองผ่านหน้า "สร้าง Grid" มีคุณสมบัติ:

```typescript
{
  isGridUserCreated: true,
  isGroupedMA: true,
  memberNames: ['NEWA2_A2R1', 'NEWA2_A2R2'],  // member vars
  gridMembers: [{ name: '...', label: '...' }],
}
```

- **aggregateByCode = false** เสมอ (Grid members เป็น dichotomy แต่ละ row)
- Member var แต่ละตัวมีค่า 1=เลือก, 0=ไม่เลือก
- `selectedCodes = {'1'}` สำหรับทุก member

### Grid บน Row (Side)
- ใช้ `computeGroupedCrosstab(..., 'row', ...)`
- แต่ละ attribute เป็น 1 row
- `rowTotalsN[i]` = จำนวนครั้งที่ attribute นั้นถูกเลือก (อาจเกิน grandTotal)
- `colTotalsN[j]` = จำนวน respondent ที่ตอบ column นั้น (unique)

### Grid บน Top (Column)
- ใช้ path multi-var ใน `Pi`/`Zl`
- เรียก `TiForCol` สำหรับ T2B/Mean ของ column variable
- ค้นหา summaries จาก `window.__cxGetTbPresetStore()` (tbStore)

---

## 6. ระบบ T2B / TB / Mean

T2B (Top 2 Box) และ summaries ถูกจัดการโดย:

1. **tbStore** — `window.__cxGetTbPresetStore()` เก็บ preset config ต่อตัวแปร
2. **S6 script** — intercept dispatch, inject T2B columns ผ่าน `buildColumnAugment` → `materializeColumnAugment`
3. **TiForCol** — inject T2B summaries และ Mean ใน compiled bundle

### Flow การ inject T2B:
```
Run Table
  → Pi() / Zl()
    → TiForCol() ← inject T2B columns (จาก tbStore หรือ variable override)
                 ← inject Mean columns (ต่อจาก T2B, ไม่ return กลางทาง)
    → QnForCol() ← inject Net columns
  → S6 augmentTablesArray() ← post-process inject เพิ่มเติม
```

> ⚠️ **ข้อควรระวัง:** `TiForCol` ต้อง **ไม่ return ออกกลางทาง** หลังจาก inject T2B แล้ว เพราะจะทำให้ Mean ไม่ถูก inject ต่อ (bug ที่เคยเจอและแก้แล้ว)

---

## 7. ระบบ HideTotal (S7 Script)

S7 script ใน `index.html` ทำหน้าที่ซ่อน Total column สำหรับ Grid variable ที่เปิด `hideTotal=true`

### วิธีทำงาน:
1. หา `cornerSpan` (visual column index ของ Total header)
2. traverse ทุก `<tr>` ใน `<tbody>` เพื่อหา cell ที่ตรงกับ column นั้น
3. ซ่อน cell ด้วย `visibility: hidden` + `padding: 0` + `border: none`

### ข้อควรระวัง (rowSpan):
Grid tables มี cell ที่มี `rowSpan > 1` (section label ของ Grid attribute)
ทำให้ rows ต่อๆ มา physical cells ต่าง visual column กัน

**การแก้ไข (commit 67340e9):** ใช้ `colOccupied` map ติดตาม rowSpan occupancy ข้ามแถว:
```javascript
while (colOccupied[visualCol]) visualCol++;  // skip occupied columns
if (rspan > 1) { /* register this cell's rowSpan */ }
```

---

## 8. CrosstabResult Interface

```typescript
interface CrosstabResult {
  rowVar: string
  colVar: string
  rowLabel: string
  colLabel: string
  rowValues: string[]        // ordered row labels
  colValues: string[]        // ordered column labels
  rowTypes?: CrosstabRowType[] // 'data' | 'stat' | 'net' | 'summary'
  rowPaths?: string[][]      // multi-level paths
  colPaths?: string[][]      // multi-level paths
  counts: number[][]         // counts[ri][ci]
  rowTotalsN: number[]       // row totals
  colTotalsN: number[]       // col totals
  grandTotal: number
  rowSectionBases?: Array<{  // Grid section metadata
    startIndex: number
    label: string
    totalN: number
    colTotalsN: number[]
  }>
}
```

`rowSectionBases` ใช้ใน `PreviewTable.tsx` เพื่อ render section header ของ Grid variable และ render Total ของแต่ละ section

---

## 9. Build / Deploy Workflow

> **ไม่มี auto-build** — ต้องแก้ไฟล์ที่ browser ใช้โดยตรง

| สิ่งที่แก้ | ไฟล์ที่ต้องแก้ |
|---|---|
| Engine / computation logic | `public/assets/index-DsrIxxwV.js` |
| T2B/Net injection (post-dispatch) | `index.html` (S6 script) |
| HideTotal DOM manipulation | `index.html` (S7 script) |
| React UI / PreviewTable | ต้อง build: `npm run build` แล้ว copy ออกมา |
| Pure TS library functions | `src/lib/*.ts` (มี Unit test ทดสอบได้) |

---

## 10. ข้อควรระวังสำคัญ (Gotchas)

### 🔴 Critical

1. **อย่าแก้ `src/` แล้วคาดหวังว่า browser จะเห็นผล** — ต้อง build ก่อนเสมอ สำหรับ engine fix ให้แก้ compiled bundle โดยตรง

2. **`TiForCol` ห้าม return กลางทางหลัง inject T2B** — จะทำให้ Mean ไม่ถูก inject ต้องอัปเดต `i` แล้วปล่อยให้ flow ต่อไป Mean section

3. **`colOccupied` ใน S7** — ถ้าแก้ HideTotal ให้คงการติดตาม rowSpan ไว้เสมอ ไม่เช่นนั้นจะ target ผิด cell สำหรับ Grid tables

4. **`Pi` Grid path** — ถ้าแก้ path `if (ye)` ใน `Pi` ต้องเรียก `TiForCol` และ `QnForCol` ด้วย ไม่เช่นนั้น T2B/Mean/Net จะหายสำหรับ Grid row var

### 🟡 Important

5. **tbStore key lookup** — ค้นหา key แบบ case-insensitive และรองรับ `_SIDE` suffix variant (เช่น `NEWA2` ↔ `NEWA2_SIDE`) ดูใน `TiForCol` บรรทัด ~13563-13588

6. **`rowSectionBases` remapping** — เมื่อ `filterZeroRows` ลบ rows ออก ต้องอัปเดต `startIndex` ของทุก section ด้วย logic ใน `filterZeroRows()` ใน `crosstabEngine.ts`

7. **Grid member vars ไม่ถูกลบออกจาก catalog** — ต่างจาก MA group (`$1`, `$2`) ที่ถูก consume ไม่ให้ขึ้นซ้ำ Grid members ยังคงอยู่ใน `byName` ได้

8. **Multi-level colPaths** — เมื่อมี Nest variable, `colPaths` จะเป็น 2D path เช่น `['SIDE_label', 'Nest_label']` การ inject T2B ต้องใช้ `_lvl` auto-detect แทนการ hardcode level

### 🟢 Note

9. **Async vs Sync** — `Pi` = sync (ใช้ใน Run All), `Zl` = async (ใช้ใน Run Table ปกติ) ทั้งคู่ต้องแก้ parallel กันถ้ามี bug ใน logic เดียวกัน

10. **`_colPaths` const** — ถูก define ก่อน T2B block ใน `TiForCol` ถ้าอัปเดต `i` ใน T2B block แล้ว Mean section ต้องใช้ `i.colPaths` (updated) ไม่ใช่ `_colPaths` (stale)

---

## 11. 🔒 T2B Column Injection — Cross-Script Scope (CRITICAL — ห้ามแก้ถอย)

**สถานะ:** ✅ ใช้ได้ทุกมิติ (Top เดี่ยว / Top หลายตัวแปร Add / Top+Nest / Side) — ยืนยันโดยผู้ใช้ 2026-04-19

**Problem เคยเกิด:**
- `cxAddColumnSummary` ไม่สามารถ inject TB/T2B/BB/B2B columns ได้ตอน Top เป็นหลายตัวแปร (`S0+A5_1`) หรือ Nested
- Log พบ `fbInfo=null` ตลอด แม้ `pGuess='t2b_high_good'` และ `secVals` มีครบ 5 ค่า

**Root cause:**
- `buildScaleSummaryPreset` (บรรทัด 4419) อยู่ใน IIFE script block **4007–5853** (ปิด scope ด้วย `(function(){...})()` ที่ L4008/L5852)
- `cxBuildSummaryInfoFromSectionValues` (บรรทัด ~7173) อยู่อีก script block **6594–9623**
- 2 scripts ใช้ IIFE scope ต่างกัน → `typeof buildScaleSummaryPreset !== 'function'` = true ใน script หลัง → return null ทันที
- ฟังก์ชัน `ensureTbInfoExpanded`, `expandTbStoredEntry`, `buildFactorOnlyPreset` ก็อยู่ใน scope แรกเหมือนกัน — ปัญหาเดียวกัน

**Fix (ห้ามลบ):**

1. **`index.html:5854-5858`** — ที่ท้าย IIFE แรก expose helpers ไปที่ `window.__cx*`:
   ```js
   window.__cxBuildScaleSummaryPreset = buildScaleSummaryPreset;
   window.__cxBuildFactorOnlyPreset = buildFactorOnlyPreset;
   window.__cxIsFactorOnlyPreset = isFactorOnlyPreset;
   window.__cxCodeRowsFromOverride = codeRowsFromOverride;
   ```

2. **`index.html:~7173` `cxBuildSummaryInfoFromSectionValues`** — fallback ใช้ `window.__cxBuildScaleSummaryPreset` ถ้า local scope ไม่มี:
   ```js
   var builder = (typeof buildScaleSummaryPreset === 'function') ? buildScaleSummaryPreset
     : (typeof window.__cxBuildScaleSummaryPreset === 'function' ? window.__cxBuildScaleSummaryPreset : null);
   if (!builder) return null;
   ```

3. **`index.html:~6992,~7238` (cxAddColumnSummary + cxAddColumnMean)** — dataset resolution: `resolveLiveDataset` ไม่มีจริง → ต้อง fallback ไป `getDatasetHook()`:
   ```js
   var ds = null;
   try { if (typeof resolveLiveDataset === 'function') ds = resolveLiveDataset(); } catch(_e){}
   if (!ds && typeof getDatasetHook === 'function') {
     try { var _h = getDatasetHook(); if (_h && _h.data) ds = _h.data; } catch(_e){}
   }
   ```
   โดยไม่มี fallback นี้ `cxFindSectionOwnerVar` จะคืน null → `ownerVar=null` → skip injection

4. **`index.html:~7079` (per-section branch ของ cxAddColumnSummary)** — สร้าง pseudoCtx จาก col paths ของ section → pass ให้ `ensureTbInfoExpanded(ownerVar, pseudoCtx, 0, len)` เพราะ `expandTbStoredEntry` ต้องการ `resultCtx.rowValues` ถึงจะ derive codeRows ได้

**Debug log (อย่าลบ):**
- `[S6 addColSum] flat=... sections=N storedKeys=[...] dsVars=N` — ยืนยัน dataset resolve
- `[S6 addColSum] section N fallback owner=<var>` — เมื่อ primary owner lookup fail ต้อง fallback
- `[S6 addColSum] fallback build N pGuess=<preset> secVals=[...] fbInfo=<object>` — จุดที่เคยพัง (fbInfo=null)
- `[S6 addColSum] section N prefix=[...] owner=... info=... storedOwner=...` — final info ที่จะใช้ inject

**กฎห้ามทำลาย (write protection):**
- ❌ ห้ามลบ `window.__cxBuildScaleSummaryPreset` expose (L5854-5858)
- ❌ ห้าม revert `cxBuildSummaryInfoFromSectionValues` กลับไปใช้ local `buildScaleSummaryPreset` อย่างเดียว
- ❌ ห้ามลบ `getDatasetHook()` fallback ใน cxAddColumnSummary/cxAddColumnMean
- ❌ ห้ามลบ pseudoCtx building ก่อนเรียก `ensureTbInfoExpanded`
- ✅ ถ้าจะ refactor: ต้อง verify 4 scenarios — Top เดี่ยว, Top Add 2 vars, Top Nest 2 vars, Side — ก่อน commit

**เกี่ยวข้อง:** ส่วน 10 (Net column injector) ใช้กลไก shallow-path detection + add-mode fallback + nested-section reorder คล้ายกัน (index.html:7440-7620) — ถ้าแก้ Net ต้องไม่กระทบ T2B และกลับกัน

---

## 12. 🔒 Top/Side Axis Chip Spacing — Design Canvas Tightening (CRITICAL — ห้ามแก้ถอย)

**สถานะ:** ✅ ผู้ใช้ยืนยันดีแล้ว 2026-04-19 — chips ใน Top container ติดกันสวยงาม

**Context:** บันเดิล `index-DsrIxxwV.js` ถูก compile จาก src/DesignCanvas.tsx เวอร์ชั่นเก่า คลาส DOM ไม่ตรงกับ `src/` ปัจจุบัน:
- Bundle container class: `flex flex-wrap items-start gap-px min-h-[84px]` (gap-px = 1px)
- src ปัจจุบัน: `flex flex-nowrap items-start gap-1` (gap-1 = 4px)
- Chip class (ตรงกันทั้งคู่): `min-h-[42px] min-w-[86px] px-2 py-1.5 rounded-2xl`

**Fix (ต้องคง):**

1. **CSS rules ใน `index.html:1392-1403`** — ครอบคลุมทั้ง bundle + src variants:
   ```css
   .min-h-[84px].flex-wrap { gap: 0 !important; }
   .min-h-[84px].flex-nowrap { gap: 0 !important; }
   .min-h-[84px] > * { margin: 0 !important; }
   .min-h-[84px] > * > div:first-child:not(.min-w-[86px]):not(.min-h-[42px]) { display: none !important; }
   ```

2. **JS runtime failsafe ใน `index.html:~1406-1441`** — `cxTightenTopChips()` + MutationObserver:
   - Query `[class*="min-h-[84px]"]` → set `gap: 0`
   - Loop children → set `margin: 0`
   - Detect drop-zone grandchildren (has `w-2` หรือ `min-w-[10px]`) → `display: none`
   - Debounced 150ms + re-run on DOM mutations

**กฎห้ามทำลาย:**
- ❌ ห้ามลบ CSS rules ข้างบน (ทั้ง 4 บรรทัด)
- ❌ ห้ามลบ `cxTightenTopChips()` + MutationObserver setup
- ❌ ห้ามเปลี่ยน selector `[class*="min-h-[84px]"]` เป็น attribute-specific อย่าง `[data-crossify-axis-scroll]` (attr นี้ไม่มีใน bundle เก่า)
- ❌ ห้าม rebuild bundle เพื่อให้ class match src/ (จะพังฟีเจอร์อื่น — ดูส่วน 2)
- ✅ ถ้าต้องแก้ระยะ: เปลี่ยนเฉพาะค่า `gap: 0` → `gap: <Npx>` ใน CSS rules, อย่าแตะ structure

**เหตุผลต้องการทั้ง CSS + JS:**
- CSS ทำงานเฉพาะ class ที่รู้จัก — ถ้า bundle อัปเดต class name ใหม่ CSS อาจ miss
- JS runtime ทำงานกับ element ทั้งหมดที่มี substring `min-h-[84px]` และ detect drop zone ด้วย heuristic → robust กว่า

**Test matrix ก่อน refactor:**
1. Top 1 ตัวแปร → chip ชิดขอบซ้าย ไม่มี gap
2. Top 2 ตัวแปร Add → chips ติดกัน ไม่มีพื้นที่ระหว่าง
3. Top 3+ ตัวแปร → ทุก chip ติดกันแบบต่อเนื่อง
4. Side vertical → ไม่กระทบ (class ต่าง: `min-h-[12px] h-3` สำหรับ drop zone, ไม่ match `min-w-[10px]`)
