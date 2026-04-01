# Sensitive.md — อ่านก่อนแก้ Project นี้

> เอกสารนี้สำหรับ AI ที่จะมาแก้ต่อ อ่านให้ครบก่อนทำอะไรทั้งสิ้น

---

## 1. กฎเหล็กที่ห้ามทำ

```
❌ ห้ามสลับ bundle เป็น src/main.tsx หรือ bundle อื่น
❌ ห้าม npm run build แล้วเอาไปใช้แทน
❌ ห้ามแก้ไฟล์ใน public/assets/ โดยตรง
❌ ห้าม import หรืออ้างอิง src/ เพื่อใช้งานจริง
```

ถ้าทำสิ่งข้างบน = app พังทันที และผู้ใช้จะบอกว่า "พังอีกแล้ว"

---

## 2. Architecture หลัก

### Bundle ที่ใช้งานจริง (มีตัวเดียว)
```
public/assets/index-DsrIxxwV.js   ← THE ONLY RUNTIME (582 KB, minified)
public/assets/index-DN00P1lj.css  ← CSS
public/assets/exceljs-BMcsBZ_F.js ← ExcelJS chunk
public/assets/arquero-6vuVcGup.js ← Arquero chunk
```

### ไฟล์ที่แก้ได้
```
index.html  ← ไฟล์เดียวที่แก้เพื่อเพิ่ม feature
index.recovered.html  ← backup ต้อง sync ทุกครั้งที่แก้ index.html
```

### src/ คืออะไร
`src/` เป็น source code เวอร์ชันเก่ากว่า bundle — มีไว้ศึกษาเท่านั้น ไม่ใช้งานจริง

---

## 3. วิธีเพิ่ม Feature

**ทุก feature ใหม่ต้อง inject ผ่าน `<script>` tag ใน `index.html` เท่านั้น**

โดยใช้ React Fiber API เพื่อเข้าถึง state ของ app:

```javascript
// 1. หา fiber จาก DOM element
function fiberOf(el) {
  var k = Object.keys(el).find(k => k.startsWith('__reactFiber'));
  return k ? el[k] : null;
}

// 2. Traverse ขึ้น (ใช้ .return เสมอ ไม่ใช่ลง)
var f = fiberOf(someElement);
while (f) {
  // ค้นหา props หรือ state ที่ต้องการ
  var p = f.memoizedProps;  // props ของ component
  var s = f.memoizedState;  // hook chain (linked list)
  f = f.return;             // ขึ้นไป parent
}

// 3. Update state ผ่าน hook dispatch
hook.queue.dispatch(updaterFn);  // เหมือน setState(fn)
```

### Deploy
```bash
# แค่นี้พอ — ไม่มี build step
cp index.html index.recovered.html
# แล้ว refresh browser
```

---

## 4. React State Patterns ที่รู้แล้ว

### Tables state
```javascript
// ค้นหา: array ที่ element แรกมี {id: string, colVar, rowVar}
Array.isArray(v) && v.length > 0 && typeof v[0].id === 'string'
    && 'colVar' in v[0] && 'rowVar' in v[0]
// traverse ขึ้นจาก TableRow element (draggable + border-l-2 + cursor-pointer)
```

### Dataset state (variables + cases)
```javascript
// ค้นหา: object ที่มี {variables: [...], cases: [...]}
v && typeof v === 'object' && !Array.isArray(v)
    && Array.isArray(v.variables) && Array.isArray(v.cases)
    && v.variables.length > 0
// traverse ขึ้นจาก variable row element (draggable + cursor-grab)
// dataset.variables[i] = {name, longName, label, isString, isGroupedMA, valueLabels: {code: label}}
// dataset.cases[i] = {varName: rawNumericValue, ...}
```

### Variable quick-action handler
```javascript
// handleVarQuickAction(varName, target) อยู่ใน bundle
// เข้าถึงผ่าน fiber props: memoizedProps.onQuickAction
// target: "top" | "side" | "filter" | "table"
```

---

## 5. DOM Identifiers สำคัญ

| Element | วิธีหา |
|---|---|
| Table row | `draggable=true` + `border-l-2` + `cursor-pointer` |
| Active table (selected) | เพิ่ม `border-[#1F4E78]` |
| Checked tables (checkbox) | เพิ่ม `bg-blue-50` |
| Variable row | `draggable=true` + `cursor-grab` |
| Selected variables | เพิ่ม `ring-blue-100` |
| VariableFolders header | `<span>` ที่มี text `"VariableFolders"` |

---

## 6. Script Blocks ที่ inject ไปแล้ว (ใน index.html)

### Script 1 — Tables List right-click menu
- Copy / Paste / Delete ผ่าน right-click
- Multi-select: เลือกหลาย table แล้วทำพร้อมกัน
- Keyboard: `Ctrl+C`, `Ctrl+V`, `Delete`
- localStorage key: `__cx_tbl_copy__`

### Script 2 — Variable Folders right-click menu
- Add to Top / Side / Filter / Create Table ผ่าน right-click
- Multi-select: เลือกหลายตัวแปรแล้วทำพร้อมกัน
- ซ่อน hover buttons เดิม: `.cursor-grab .opacity-0.transition-opacity { display:none }`
- ซ่อน bottom Quick-add bar: `.flex-shrink-0.space-y-2 { display:none }`

### Script 3 — Create Derived Variable (Recode)
- ปุ่ม `+` ถัดจาก "VariableFolders" header (inject ผ่าน MutationObserver)
- Modal 2-panel: ซ้าย = var list (drag), ขวา = output codes
- แต่ละ Output Code มี conditions (AND logic)
- แต่ละ condition เลือกได้หลาย source code (OR logic)
- inject ตัวแปรใหม่ลง dataset state โดยตรง

---

## 7. Variable Type System (จาก bundle)

```javascript
function ex(v) {
  if (v.isGroupedMA) return "ma";   // badge: MA (emerald)
  if (v.isString)    return "text";  // badge: A  (amber)
  if (Object.keys(v.valueLabels).length === 0) return "numeric"; // badge: # (gray)
  return "sa";                       // badge: SA (blue)
}
```

ตัวแปรที่ inject เข้าไปใหม่จะแสดงเป็น SA ถ้ามี `valueLabels`

---

## 8. สิ่งที่ยังไม่ได้ทำ (จาก Note.md เดิม)

ดู `Note.md` ในโปรเจกต์ — มีรายการ feature ที่วางแผนไว้ทั้งหมด

---

## 9. Workflow ประจำวัน

```bash
# รัน dev server — ต้องใช้ index.html ที่ชี้ index-DsrIxxwV.js (ไม่ใช่ /src/main.tsx)
cd "c:/Users/songklod/Desktop/Crosstab"
npm run dev
# เทียบเท่า: npx vite --port 5173

# หลังแก้ index.html ทุกครั้ง
cp index.html index.recovered.html
# แล้ว refresh browser ที่ http://localhost:5173
```

---

## 10. ถ้า App พัง

1. เช็คก่อนว่า `index.html` ยังชี้ไปที่ `index-DsrIxxwV.js` อยู่ไหม
2. ถ้าไม่ใช่ → `cp index.recovered.html index.html`
3. ถ้า `index.recovered.html` ก็พัง → bundle ยังอยู่ที่ `public/assets/index-DsrIxxwV.js` ให้สร้าง `index.html` ใหม่ที่ชี้ไปที่มัน
