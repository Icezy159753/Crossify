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
