# Unittest.md — รายการ Unit Test ทั้งหมด

> อัปเดตล่าสุด: 2026-04-12 (sync กับ vitest จริง)
> Framework: **Vitest v4.1.1**
> รัน test: `npm run test` หรือ `npx vitest run`

---

## 📌 กฎบังคับสำหรับ AI ทุกครั้งที่แก้ไขโค้ด

> **AI ต้องปฏิบัติตามกฎเหล่านี้ทุกครั้งโดยไม่มีข้อยกเว้น**

### กฎที่ 1 — เพิ่มฟังก์ชันใหม่ → ต้องเขียน Unit Test ด้วยเสมอ

เมื่อมีการเพิ่มฟังก์ชันใหม่ใด ๆ ใน `src/lib/` หรือไฟล์อื่นในโปรเจค ต้องทำทันที:

1. **เขียน test** ในไฟล์ `*.test.ts` ที่สอดคล้องกับฟังก์ชันนั้น
   - Pure function → เพิ่มใน test file ของ module นั้น
   - Browser API → ใช้ `@vitest-environment jsdom` + `vi.mock`
   - ExcelJS → ใช้ integration test file หรือ mock ExcelJS
2. **ครอบคลุม** อย่างน้อย: happy path, edge case (empty/null/zero), error case
3. **อัปเดต Unittest.md** — เพิ่มจำนวน test ในตารางสรุป + รายละเอียดในส่วนนั้น

### กฎที่ 2 — แก้ไขโค้ดทุกครั้ง → ต้องรัน Test ก่อนรายงานว่าเสร็จ

หลังแก้ไขโค้ดทุกครั้ง ไม่ว่าจะเล็กหรือใหญ่ ต้องรัน:

```bash
npx vitest run
```

- ถ้า **ผ่านครบ** → รายงานผลให้ user ทราบจำนวน test ที่ผ่าน
- ถ้า **มีอันล้ม** → ต้องแก้ให้ผ่านก่อน ห้ามรายงานว่าเสร็จ

### กฎที่ 3 — ห้ามเพิ่มฟังก์ชันโดยไม่มี Test

ถ้าฟังก์ชันใหม่มี dependency ที่ test ได้ยาก (เช่น browser API) ให้:
- Extract logic ส่วน pure ออกมาและ test ส่วนนั้น
- หรืออธิบายให้ user ทราบว่า test ไม่ได้เพราะอะไร และต้องทดสอบ manual อย่างไร

---

## สรุปภาพรวม

| ไฟล์ Test | จำนวน Test | สถานะ | Environment |
|---|---|---|---|
| `crosstabEngine.test.ts` | 18 | ✅ ผ่าน | node |
| `variableGrouping.test.ts` | 16 | ✅ ผ่าน | node |
| `appStateUtils.test.ts` | 22 | ✅ ผ่าน | node |
| `filterEngine.test.ts` | 40 | ✅ ผ่าน | node |
| `variableEditorUtils.test.ts` | 29 | ✅ ผ่าน | node |
| `savParser.test.ts` | 4 | ✅ ผ่าน | node |
| `gridCrosstab.test.ts` | 35 | ✅ ผ่าน | node |
| `columnAugment.test.ts` | 19 | ✅ ผ่าน | node |
| `hideTotalDOM.test.ts` | 12 | ✅ ผ่าน | **jsdom** |
| `timeFormatUtils.test.ts` | 15 | ✅ ผ่าน | node |
| `dragTransfer.test.ts` | 11 | ✅ ผ่าน | node |
| `excelExport.test.ts` | 29 | ✅ ผ่าน | node |
| `settingsIO.test.ts` | 53 | ✅ ผ่าน | node |
| `fileHandleStore.test.ts` | 12 | ✅ ผ่าน | node |
| `settingsIO.integration.test.ts` | 9 | ✅ ผ่าน | **jsdom** |
| `fileAccess.test.ts` | 18 | ✅ ผ่าน | **jsdom** |
| `excelExport.integration.test.ts` | 12 | ✅ ผ่าน | **jsdom** |
| `useBatchExportFlow.test.ts` | 11 | ✅ ผ่าน | **jsdom** |
| **รวมทั้งหมด** | **365** | ✅ **365/365 ผ่าน** | |

---

## รายละเอียดแต่ละไฟล์

---

### 1. `src/lib/crosstabEngine.test.ts` — 16 tests

#### กลุ่ม computeCrosstab (6 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | computes counts from ordered labels including 0-count values | นับ count, รวม 0-count values จาก spssOrder, rowTotalsN/colTotalsN/grandTotal ถูกต้อง |
| 2 | appends unlabeled data values not in spssOrder | ค่าที่ไม่มีใน spssOrder → ต่อท้าย rowValues |
| 3 | throws when no usable data rows exist | ทุก row มี rowVar='' → throw error |
| 4 | uses data insertion order when spssOrder is not provided | ไม่มี spssOrder → เรียงตาม insertion order |
| 5 | sets rowTypes to all data by default | rowTypes = ['data'] ทุก row |
| 6 | sets rowPaths and colPaths as single-element arrays | rowPaths/colPaths เป็น `[[value]]` |

#### กลุ่ม computeCrosstabAsync (2 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 7 | returns same result as sync version | async ให้ผลเหมือน sync ทุกอย่าง |
| 8 | throws when no usable data rows exist | async throw เหมือนกัน |

#### กลุ่ม getPct (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 9 | column %: n / colTotal | % ตาม column total |
| 10 | row %: n / rowTotal | % ตาม row total |
| 11 | total %: n / grandTotal | % ตาม grand total |
| 12 | returns 0 when denom is 0 | denominator = 0 → คืน 0 (ไม่ NaN) |

#### กลุ่ม filterZeroRows (6 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 13 | filters zero-total data rows but keeps stat rows | ลบ data rows ที่ total=0, คง stat rows |
| 14 | returns original reference when hideZeroRows=false | false → คืน reference เดิม |
| 15 | returns original reference when all rows have data | ไม่มีอะไรต้องลบ → คืน reference เดิม |
| 16 | defaults rowTypes to all-data when not provided | ไม่มี rowTypes → ถือว่าทุก row เป็น data |
| 17 | remaps rowPaths after filtering | rowPaths ถูก remap หลัง filter |
| 18 | remaps rowSectionBases after filtering | rowSectionBases startIndex ถูก remap ถูกต้อง |

---

### 2. `src/lib/variableGrouping.test.ts` — 17 tests

#### กลุ่ม buildVariableCatalog (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | normalizes aggregate-by-code labels (SPSS decimal keys) | key `1.00000000` normalize → `1`, match raw case |
| 2 | treats shared 0/1-style codes as dichotomy set | MA group ที่ทุก member มี {0,1} → aggregateByCode=false |
| 3 | includes observed raw codes not in SAV labels | raw case code ที่ไม่มีใน labels → ถูกเพิ่ม options |
| 4 | non-MA variables appear in list without grouping | ตัวแปรธรรมดา (ไม่มี $ suffix) → อยู่ใน byName โดดๆ |
| 5 | custom MRSET overrides auto-detected group | custom MRSET label ทับ auto-detected |

#### กลุ่ม getGroupedBaseCount (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 6 | counts cases with at least one selected member | นับ cases ที่มี member เลือกอย่างน้อย 1 ตัว |
| 7 | returns 0 when no case has any selection | ทุก case ไม่เลือก → 0 |
| 8 | returns 0 for empty rawCases | ไม่มี cases → 0 |

#### กลุ่ม summarizeGroupedRawValues (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 9 | counts each code per member | นับแต่ละ code ต่อ member, เรียงตาม count desc |
| 10 | respects limit parameter | จำกัดจำนวน codes ที่คืนตาม limit |
| 11 | skips empty/null values | ค่าว่าง/null ไม่ถูกนับ |

#### กลุ่ม computeGroupedCrosstab (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 12 | MA on Row: grandTotal excludes empty cases | case ที่ไม่มี selection → ไม่นับ grandTotal |
| 13 | MA on Row: counts each option per column | count ถูกต้องแต่ละ option × column |
| 14 | throws when no usable column values | column values ทั้งหมดว่าง → throw |

#### กลุ่ม computeGroupedCrosstabAsync (2 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 15 | returns same result as sync version | async ให้ผลเหมือน sync |
| 16 | throws when no usable data | async throw เมื่อไม่มีข้อมูล |

---

### 3. `src/lib/appStateUtils.test.ts` — 22 tests

#### กลุ่ม axis helpers (8 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | parses and joins nested axis specs | parse/join/flatten/getDisplayLevels ถูกต้อง |
| 2 | inserts by add and nest modes without duplicating | add mode, nest mode, block duplicate |
| 3 | removes and moves variables across levels | removeVarFromAxis, moveVarInAxis |
| 4 | moveVarInAxis reorders add-mode SIDE/TOP | reorder single-branch add-mode |
| 5 | removes only the clicked nested occurrence | ลบเฉพาะ occurrence ที่ระบุ (branchIndex + itemIndex) |
| 6 | supports nesting under a specific variable | nest ใต้ตัวแปรเฉพาะโดยไม่กระทบ branch อื่น |
| 7 | nesting does not drag old child deeper | nest ใหม่ไม่ทำให้ child เดิมลึกลง |
| 8 | keeps add mode at top level even when nested | add mode ไม่ลง level ลึก |

#### กลุ่ม insertTopLevelBranchAt (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 9 | appends new branch when index omitted | ไม่ระบุ index → ต่อท้าย |
| 10 | inserts at specific index | ระบุ index → แทรกตรงนั้น |
| 11 | inserts at index 0 (prepend) | index=0 → แทรกหน้าสุด |
| 12 | clamps out-of-range index to end | index เกินขอบ → แทรกท้าย |
| 13 | no-op when var already exists anywhere | var ซ้ำ → คืน reference เดิม |

#### กลุ่ม moveAxisOccurrenceToTarget (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 14 | moves single-item branch downward (placement before) | behavior จริงเมื่อ source branch ถูกลบแล้วใส่ที่ targetBranchIndex |
| 15 | moves single-item branch forward (placement after) | behavior จริงเมื่อใส่ที่ targetBranchIndex+1 |
| 16 | moves nested item within a branch — before | เลื่อน item ภายใน branch เดียวกัน (before) |
| 17 | moves nested item within a branch — after | เลื่อน item ภายใน branch เดียวกัน (after) |
| 18 | returns original branches when source branch is invalid | branch index ไม่มี → คืน original |

#### กลุ่ม data helpers (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 19 | normalizes numeric-like codes | normalizeCode — trim, float→int, null→'', string→ unchanged |
| 20 | moves selected rows preserving grouped order | moveSelectedRows ทิศทาง -1 และ +1 |
| 21 | moveSelectedRows: no-op when selectedKeys empty | ไม่มี selection → ไม่เปลี่ยน |
| 22 | moveSelectedRows: no-op at boundary | เลื่อนขึ้นเมื่ออยู่บนสุด / ลงเมื่ออยู่ล่างสุด → ไม่เปลี่ยน |

---

### 4. `src/lib/filterEngine.test.ts` — 40 tests

#### กลุ่ม evaluateFilterCondition (26 tests)

**in / not_in (4 tests)**

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | in: matches when value is in set | ค่าอยู่ใน set → true |
| 2 | in: fails when value not in set | ค่าไม่อยู่ใน set → false |
| 3 | not_in: passes when value not in set | ค่าไม่อยู่ใน set → true |
| 4 | not_in: fails when value is in set | ค่าอยู่ใน set → false |
| 5 | in: incomplete (empty values) → passes | values=[] (ยังไม่กรอก) → ผ่านเสมอ |

**is_blank / not_blank (4 tests)**

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 6 | is_blank: passes when variable is empty | ว่าง → true |
| 7 | is_blank: fails when variable has value | มีค่า → false |
| 8 | not_blank: passes when variable has value | มีค่า → true |
| 9 | not_blank: fails when variable is empty | ว่าง → false |

**contains / not_contains (5 tests)**

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 10 | contains: case-insensitive substring match | HELLO → ตรงกับ "hello world" |
| 11 | contains: fails when substring not found | ไม่มี substring → false |
| 12 | not_contains: passes when substring not found | ไม่มี → true |
| 13 | not_contains: fails when substring found | มี → false |
| 14 | contains: incomplete (empty value) → passes | value='' → ผ่านเสมอ |

**numeric comparisons (13 tests)**

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 15 | gt: passes when value > threshold | 15 > 10 → true |
| 16 | gt: fails when value = threshold | 10 > 10 → false (strict) |
| 17 | gte: passes when value >= threshold | 10 >= 10 → true |
| 18 | lt: passes when value < threshold | 5 < 10 → true |
| 19 | lt: fails when value = threshold | 10 < 10 → false (strict) |
| 20 | lte: passes when value <= threshold | 10 <= 10 → true |
| 21 | between: passes when value in range (inclusive) | 7 in [5,10] → true |
| 22 | between: passes at boundary values | 5, 10 in [5,10] → true |
| 23 | between: normalizes reversed range | range(10,5) = [5,10] |
| 24 | between: fails when value outside range | 11 not in [5,10] → false |
| 25 | numeric: returns false when value is not numeric | data='abc', threshold=5 → false |
| 26 | gt: incomplete (empty value) → passes | value='' → ผ่านเสมอ |
| 27 | gt: non-numeric threshold → false | threshold='abc', data=5 → false (ไม่ผ่านทุก row) |
| 28 | gte: non-numeric threshold → false | threshold='xyz', data=5 → false |
| 29 | lt: non-numeric threshold → false | threshold='abc', data=5 → false |
| 30 | lte: non-numeric threshold → false | threshold='xyz', data=5 → false |
| 31 | between: non-numeric primary threshold → false | primary='abc', secondary='10' → false |
| 32 | between: non-numeric secondary threshold → false | primary='5', secondary='xyz' → false |

#### กลุ่ม evaluateFilterGroup (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 33 | empty group → passes | ไม่มี conditions → ผ่าน |
| 34 | join=all: all conditions must pass | ทุก condition ต้องผ่านจึงผ่าน |
| 35 | join=any: at least one condition must pass | แค่ 1 condition ผ่านก็พอ |

#### กลุ่ม evaluateFilterSpec (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 36 | null spec → passes | spec=null → ผ่าน |
| 37 | empty groups → passes | ไม่มี group → ผ่าน |
| 38 | supports grouped all/any logic across filter groups | rootJoin=any, nested group joins |
| 39 | ignores incomplete conditions | condition ที่ value='' → ถือว่าผ่าน |
| 40 | rootJoin=all: all groups must pass | ทุก group ต้องผ่าน |

---

### 5. `src/lib/variableEditorUtils.test.ts` — 25 tests

#### กลุ่ม getNetPrefix (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | depth 0 → "Net : " | prefix ระดับ 0 |
| 2 | depth 1 → "Subnet : " | prefix ระดับ 1 |
| 3 | depth 2 → "SubSubnet : " | prefix ระดับ 2 |
| 4 | depth 3 → "SubSubSubnet : " | prefix ระดับ 3 |
| 5 | negative depth → "Net : " | negative → ถือว่า 0 |

#### กลุ่ม getGroupDepth (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 6 | root group has depth 0 | ไม่มี parentId → depth 0 |
| 7 | child of root has depth 1 | parent = root → depth 1 |
| 8 | grandchild has depth 2 | parent = child → depth 2 |
| 9 | breaks circular references without infinite loop | A→B→A → ไม่ loop ตลอด |

#### กลุ่ม buildVariableEditorDisplayRows (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 10 | returns code rows unchanged when no groups | ไม่มี groups → คืน rows เดิม |
| 11 | injects net rows before grouped members and indents descendants | แทรก Net/Subnet rows, indent ตาม depth |
| 12 | net row count = sum of member counts | count ของ net row = ผลรวม member counts |
| 13 | skips groups whose members are not in rows | group ที่ member ไม่มีในตาราง → ข้าม |

#### กลุ่ม buildVariableEditorRowsWithSummaries (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 14 | appends summary rows after display rows | TB/BB rows ต่อท้าย |
| 15 | summary count = sum of member counts | count = ผลรวมของ member rows ที่ระบุ |
| 16 | summary percent = count / baseCount * 100 | percent คำนวณจาก baseCount |
| 17 | returns display rows unchanged when no summaries | ไม่มี summaries → คืน displayRows เดิม |

#### กลุ่ม buildScaleSummaryPreset (12 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 18 | tb_low_good: only TB and BB | TB=ต่ำสุด, BB=สูงสุด, ไม่มี T2B/T3B |
| 19 | tb_high_good: only TB and BB | TB=สูงสุด, BB=ต่ำสุด, ไม่มี T2B/T3B |
| 20 | t2b_low_good: TB + T2B + BB + B2B | factors reversed, 4 summaries |
| 21 | t2b_high_good: TB + T2B + BB + B2B (high side) | factors ascending, 4 summaries |
| 22 | t3b_high_good: TB + T2B + T3B + BB + B2B + B3B | 6 summaries |
| 23 | t3b_low_good: TB + T2B + T3B + BB + B2B + B3B (low) | 6 summaries, low side |
| 24 | justright_centered: factors -2 to +2, no summaries | factors centered, summaries=[] |
| 25 | justright_code: factors 1 to N, no summaries | factors 1-based, summaries=[] |
| 26 | justright_code: works with any number of rows | ไม่จำกัดจำนวน rows |
| 27 | throws for empty rows | rows=[] → throw |
| 28 | throws for justright_centered with wrong count | ≠5 rows → throw |
| 29 | sorts rows by numeric code before applying preset | input ไม่เรียง → sort ก่อน apply |

---

### 6. `src/lib/savParser.test.ts` — 4 tests

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | maps common East Asian SPSS code pages to browser decoder labels | CP932→shift_jis, GB18030, Big5, CP949 |
| 2 | keeps legacy Thai fallback for unknown encodings | unknown → windows-874 |
| 3 | decodes safely when encoding label is unsupported | fallback decode ไม่ crash |
| 4 | recognizes browser-supported encodings | isSupportedEncoding — true/false |

---

### 7. `src/lib/gridCrosstab.test.ts` — 35 tests ⭐

#### กลุ่ม buildVariableCatalog › Grid (6 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | registers Grid var in groupedByName | isGridUserCreated=true → ลงทะเบียนใน groupedByName |
| 2 | aggregateByCode is always false | Grid var มี aggregateByCode=false เสมอ |
| 3 | builds options from gridMembers labels | options จาก gridMembers[].label |
| 4 | memberNames matches original member list | memberNames ถูกต้อง |
| 5 | keeps individual Grid member vars in byName | member vars ยังอยู่ใน byName (ไม่ถูก consume) |
| 6 | non-Grid variables remain in list | ตัวแปรอื่นยังอยู่ใน catalog |

#### กลุ่ม getGroupedSelections › Grid dichotomy (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 7 | returns label for member with value 1 | ค่า=1 → คืน label |
| 8 | returns multiple labels when multiple selected | หลาย member=1 → หลาย label |
| 9 | returns all labels when all selected | ทุก member=1 → ทุก label |
| 10 | returns empty array when none selected | ทุก member=0 → [] |
| 11 | treats missing member key as not selected | key หาย → ไม่นับ |

#### กลุ่ม computeGroupedCrosstab › Grid as Row (8 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 12 | rowVar and colVar correct | rowVar=Grid name, colVar=other |
| 13 | rowValues = Grid member labels | row = attribute แต่ละตัว |
| 14 | colValues = other variable values in order | colValues ตาม otherOrder |
| 15 | grandTotal excludes cases with no selection | case ไม่เลือก attribute ใด → ไม่นับ |
| 16 | counts[memberIdx][colIdx] correct | นับ cell ถูกต้อง (1 case หลาย rows) |
| 17 | rowTotalsN = selection count per member | rowTotalsN อาจเกิน grandTotal |
| 18 | colTotalsN = respondent count per column | colTotalsN = unique respondents |
| 19 | result has rowPaths and colPaths | paths ถูกต้อง |

#### กลุ่ม computeGroupedCrosstab › Grid as Column (7 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 20 | rowVar=GENDER colVar=NEWA2 | vars ถูกต้องเมื่อ Grid อยู่บน column |
| 21 | colValues = Grid member labels | column = attribute |
| 22 | rowValues = other variable values | rowValues ตาม otherOrder |
| 23 | grandTotal = cases with at least one selection | นับเฉพาะ case มี selection |
| 24 | counts[rowIdx][memberIdx] correct | count ถูกต้อง |
| 25 | rowTotalsN = respondent count per row | rowTotalsN ต่อ row value |
| 26 | colTotalsN = selection count per Grid member | colTotalsN อาจเกิน grandTotal |

#### กลุ่ม Grid edge cases (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 27 | throws when no usable other-variable data | throw เมื่อไม่มีข้อมูล |
| 28 | grandTotal=0 when no selection | ทุก case ไม่เลือก → 0 |
| 29 | one case selects all members | 1 case เลือกทุก attribute |

#### กลุ่ม filterZeroRows › rowSectionBases (6 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 30 | removes zero-total rows | ลบ rows ที่ total=0 |
| 31 | retains non-zero rows with correct counts | counts/totals ถูกต้องหลัง filter |
| 32 | remaps section A startIndex | startIndex=0 คงที่ |
| 33 | remaps section B startIndex | startIndex ถูก remap |
| 34 | removes sections that have all rows filtered out | section ที่ทุก row เป็น zero → ลบ section |
| 35 | does nothing when hideZeroRows=false | false → reference เดิม |

---

### 8. `src/lib/columnAugment.test.ts` — 21 tests ⭐ (S6 extracted)

> ทดสอบ `materializeColumnAugment` ที่แยกออกจาก S6 inline script → TypeScript pure function

#### กลุ่ม no-op (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | returns original when colAug is null | null → คืน reference เดิม |
| 2 | returns original when specs array is empty | specs=[] → ไม่เปลี่ยน |
| 3 | skips specs with empty memberIndexes | memberIndexes=[] → ข้าม |

#### กลุ่ม append at end (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 4 | appends new column label | colValues มี T2B ต่อท้าย |
| 5 | sums colTotalsN from member indexes | total = ผลรวม member colTotalsN |
| 6 | sums row counts from member indexes | counts[row] = ผลรวม member counts |
| 7 | appends single-element colPath | colPaths = ['T2B'] |
| 8 | does not mutate the original result | original ไม่ถูก mutate |

#### กลุ่ม insertBoundary (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 9 | inserts at the correct position | insertBoundary=0 → แทรกหน้าสุด |
| 10 | colTotalsN at inserted position correct | total ถูกต้อง |
| 11 | original columns shift right | columns เลื่อนขวา |

#### กลุ่ม multiple specs with ordering (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 12 | inserts lower insertOrder first | TB(order=10) ก่อน T2B(order=20) |
| 13 | TB total = only last column | TB total ถูกต้อง |
| 14 | T2B total = last two columns | T2B total ถูกต้อง |
| 15 | member indexes always reference original positions | indexes ไม่เลื่อนตามที่แทรกไปก่อน |

#### กลุ่ม multi-level colPaths (2 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 16 | builds multi-level path from groupPath + label | colPaths = ['Nest', 'T2B'] |
| 17 | label is set correctly | colValues label ถูกต้อง |

#### กลุ่ม multiple rows (2 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 18 | computes correct T2B count per row | T2B ต่อ row ถูกต้อง |
| 19 | colTotalsN = sum across all rows | colTotalsN = ผลรวมทุก row |

---

### 9. `src/lib/hideTotalDOM.test.ts` — 12 tests ⭐ (S7 extracted, jsdom)

> **Environment: jsdom** — ใช้ `@vitest-environment jsdom` annotation
> ทดสอบ `findCellsAtVisualColumn` (pure) และ `findTotalBodyCells` (DOM)

#### กลุ่ม findCellsAtVisualColumn › pure algorithm (7 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | flat table: maps each cell to visual column | colSpan=1, rowSpan=1 ทุก cell |
| 2 | col inside colSpan=2 cell is found | cell ที่ colSpan=2 cover 2 visual cols |
| 3 | rowSpan=N: subsequent rows return null | rows ที่ถูก span → null |
| 4 | rowSpan expires after N rows | หลัง N rows, col ว่างอีกครั้ง → ได้ index |
| 5 | Grid structure: section rowSpan=2, target=Total | ตรงกับ Grid table จริงใน app |
| 6 | returns null for targetVisualCol beyond all cells | col เกินขอบ → null |
| 7 | empty table returns empty array | rows=[] → [] |

#### กลุ่ม findTotalBodyCells › DOM / jsdom (5 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 8 | flat table: finds Total cell in each row | ตารางธรรมดา ไม่มี rowSpan |
| 9 | Grid table with rowSpan=2: finds correct Total cell | rowSpan=2 section label → target ถูก row |
| 10 | returns empty array when tbody is absent | ไม่มี tbody → [] |
| 11 | handles 3-row Grid (rowSpan=3) | rowSpan=3 → 3 rows ถูกต้อง |
| 12 | non-Grid table: each row selects correct Total cell | ไม่มี rowSpan ทุก row ถูก |

---

### 10. `src/lib/timeFormatUtils.test.ts` — 17 tests

> ทดสอบ `formatBatchDuration` และ `formatLiveBatchDuration` — pure functions ไม่มี dependency

#### กลุ่ม formatBatchDuration (7 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | 0 ms → "0 sec" | ค่า 0 |
| 2 | negative ms → "0 sec" (clamped) | ค่าลบ → 0 |
| 3 | < 1 min: rounds ms to nearest second | 1499ms→1sec, 1500ms→2sec |
| 4 | exactly 1 min → "1 min 0 sec" | boundary 60000ms |
| 5 | 1 min 30 sec | 90000ms |
| 6 | 2 min 5 sec | 125000ms |
| 7 | rounds partial seconds in multi-minute range | 61400ms→"1 min 1 sec", 61500ms→"1 min 2 sec" |

#### กลุ่ม formatLiveBatchDuration (10 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 8 | 0 ms → "0 sec" | ค่า 0 |
| 9 | negative ms → "0 sec" (clamped) | ค่าลบ → 0 |
| 10 | snaps to nearest 5 seconds (floor) | 4999→0sec, 5000→5sec, 9999→5sec |
| 11 | exactly 1 min (60s) → "1 min" (ไม่แสดง sec เมื่อ=0) | ไม่มี "0 sec" ต่อท้าย |
| 12 | 1 min 5 sec | 65000ms |
| 13 | 2 min exactly → "2 min" | 120000ms |
| 14 | 2 min 30 sec | 150000ms |
| 15 | snaps down — 64s → 60s → "1 min" | 64999ms→"1 min" |
| 16 | 55 sec | 55000ms |
| 17 | 10 sec boundary | 10000ms |

---

### 11. `src/lib/dragTransfer.test.ts` — 11 tests

> ทดสอบ `parseFolderVarListDrag` — drag-and-drop variable list parsing ผ่าน DataTransfer mock

#### กลุ่ม MIME type (6 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | returns variable names from valid MIME JSON array | parse สำเร็จ |
| 2 | filters out non-string and empty-string entries | กรอง '', null, number ออก |
| 3 | returns null when MIME array empty after filtering | ไม่มี valid string → null |
| 4 | returns null when MIME value is not a JSON array | object → null |
| 5 | returns null when MIME value is invalid JSON | invalid JSON → null |
| 6 | prefers MIME over text/plain when both present | MIME priority สูงกว่า |

#### กลุ่ม text/plain fallback (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 7 | reads variables from text/plain with correct prefix | prefix ถูก → parse สำเร็จ |
| 8 | returns null when text/plain prefix is missing | ไม่มี prefix → null |
| 9 | returns null when text/plain has prefix but invalid JSON | invalid JSON หลัง prefix |
| 10 | returns null when payload is not an array | object หลัง prefix → null |

#### กลุ่ม no data (1 test)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 11 | returns null when both MIME and text/plain are empty | ไม่มีข้อมูลเลย → null |

---

### 12. `src/lib/excelExport.test.ts` — 29 tests

> ทดสอบ pure utility functions ใน `excelExport.ts` ที่ไม่แตะ ExcelJS เลย

#### กลุ่ม excelColName (7 tests)
`A`, `Z`, `AA`, `AB`, `AZ`, `BA`, `ZZ`

#### กลุ่ม sanitizeSheetName (5 tests)
ชื่อปกติ, ลบ illegal chars, truncate 31 chars, trim whitespace, empty → "Sheet"

#### กลุ่ม computeSheetNames (4 tests)
unique, deduplicate `(2)/(3)`, mix unique+duplicate, empty

#### กลุ่ม buildHeaderGroups (3 tests)
flat 1-level, 2-level merge prefix, levels=0

#### กลุ่ม buildRowDisplayPaths (4 tests)
first row แสดงทุก segment, suppress repeated prefix, single-element, empty

#### กลุ่ม buildRowSectionMeta (3 tests)
single section, two sections, empty

#### กลุ่ม normalizeRowStructure (3 tests)
wrap single-level + synthetic section, preserve existing sectionBases, preserve multi-label

---

### 13. `src/lib/settingsIO.test.ts` — 22 tests

> ทดสอบ pure string parsers และ data transformation functions ใน `settingsIO.ts`

#### กลุ่ม parseScalePresetLabel (6 tests)
Thai variants: tb_low_good, tb_high_good, t2b_low_good, t2b_high_good, trim, unknown

#### กลุ่ม parseScalePresetEntry (3 tests)
English entries ทั้ง 8 preset, Thai fallback, unknown

#### กลุ่ม buildVariableOverrideRows (7 tests)
empty, Label, Factor, Order (1-based), Summary+extra1, Net depth, SummaryPreset

#### กลุ่ม parseVariableOverrideRows (6 tests)
empty, Label, Factor (skip empty), Order (sorted), netRows+parent, roundtrip

---

### 14. `src/lib/fileHandleStore.test.ts` — 6 tests

> ทดสอบ `buildHandleId` — pure function สร้าง ID สำหรับ IndexedDB key

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | uses filePath when present (lowercase) | filePath → `path:...` lowercase |
| 2 | uses fileName when filePath absent | ไม่มี filePath → `name:...` |
| 3 | uses fileName when filePath is empty string | filePath='' → ใช้ fileName |
| 4 | uses fileName when filePath is whitespace-only | filePath='   ' → ใช้ fileName |
| 5 | normalizes fileName to lowercase | `MY_FILE.SAV` → `name:my_file.sav` |
| 6 | trims whitespace from filePath | filePath มี spaces → trim ก่อน |

---

### 15. `src/lib/settingsIO.test.ts` เพิ่มเติม — Filter pure functions (+25 tests)

#### กลุ่ม isFilterJoin (5 tests)
`"all"` → true, `"any"` → true, uppercase → false, empty → false, unknown → false

#### กลุ่ม isFilterOperator (13 tests)
valid operators ทั้ง 11 ตัว → true, unknown → false, empty → false

#### กลุ่ม summarizeFilterCondition (7 tests)
in, not_in, between, is_blank, not_blank, gt, contains

#### กลุ่ม summarizeFilter (6 tests)
undefined, uses description, empty groups, single condition, two conditions (AND), truncate 180 chars

---

### 16. `src/lib/settingsIO.integration.test.ts` — 9 tests ⭐ (roundtrip, jsdom)

> **Environment: jsdom** — ใช้ ExcelJS จริง, roundtrip `buildSettingsWorkbookBuffer → loadSettings`

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | restores tables name, rowVar, colVar | ข้อมูลตารางครบถ้วน |
| 2 | restores output settings | showCount/showPercent/percentType/hideZeroRows |
| 3 | restores sourceDataset | fileName + filePath |
| 4 | restores variableOverrides labels via hidden sheet | labels ผ่าน _settings sheet |
| 5 | restores version as 1.9 | version field |
| 6 | restores activeLock when provided | sessionId, ownerLabel |
| 7 | restores detectedMrsets via hidden sheet | groupName, members |
| 8 | restores sourceMappings | fileName ถูกต้อง |
| 9 | table with filter description survives roundtrip | filter.description preserved |

---

### 17. `src/lib/fileHandleStore.test.ts` เพิ่มเติม — IndexedDB (+6 tests)

> ใช้ `fake-indexeddb` แทน browser IndexedDB — reset ใน `beforeEach` ทุก test

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 7 | saves and retrieves handle by exact filePath | `path:...` key matching |
| 8 | saves and retrieves handle by fileName | `name:...` fallback |
| 9 | returns null when nothing saved | empty DB |
| 10 | exact path match takes priority over name match | priority logic |
| 11 | returns most-recently-saved when multiple name matches | sort by updatedAt |
| 12 | skips save when fileName is empty | guard condition |

---

### 18. `src/lib/fileAccess.test.ts` — 16 tests (jsdom + mocked browser APIs)

> **Environment: jsdom** — mock `window.showOpenFilePicker`, `window.showSaveFilePicker`,  
> `fileHandleStore` (vi.mock), `settingsIO.buildSettingsWorkbookBuffer` (vi.mock)

#### กลุ่ม supportsFileSystemAccess (2 tests)
ไม่มี showOpenFilePicker → false, มี → true

#### กลุ่ม pickSavFileViaSystem (3 tests)
API ไม่ support → null, picker resolves → file+handle, picker rejects → throw

#### กลุ่ม pickSettingsFileViaSystem (2 tests)
ไม่ support → null, returns file+handle

#### กลุ่ม restoreSavFileFromSource (5 tests)
API ไม่ support → null, ไม่มี handle → null, มี handle → file+handle, permission denied → null, fileName empty → null

#### กลุ่ม rememberSavFileHandle (3 tests)
API ไม่ support → skip save, handle undefined → skip, ครบ → calls saveSavFileHandle

#### กลุ่ม saveSettingsToFileHandle (1 test)
API ไม่ support → null

---

### 19. `src/lib/excelExport.integration.test.ts` — 13 tests (jsdom + real ExcelJS)

> **Environment: jsdom** — `file-saver` mocked, ใช้ ExcelJS จริงเพื่อ verify workbook structure

#### กลุ่ม buildCrosstabWorkbook (5 tests)
single item → 1 sheet, multiple → Index+sheets, sheet name sanitized, deduplicate names, produces non-empty buffer

#### กลุ่ม exportCrosstabToExcel (2 tests)
calls saveAs with correct filename, Blob type ถูกต้อง

#### กลุ่ม exportTableToExcel (2 tests)
throws when result=null, filename = table.name + .xlsx

#### กลุ่ม exportAllTablesToExcel (3 tests)
skips null results, uses settingsName as filename, defaults to crosstab_all.xlsx

---

## วิธีเพิ่ม Test สำหรับ Inline Script / Compiled Bundle

### แนวที่ 1 — Extract to TypeScript (ทำแล้ว ✅)

| ฟังก์ชัน | ไฟล์ที่ extract ออกมา | Test file |
|---|---|---|
| S6 `materializeColumnAugment` | `src/lib/columnAugment.ts` | `columnAugment.test.ts` |
| S7 `findCellsAtVisualColumn` | `src/lib/hideTotalDOM.ts` | `hideTotalDOM.test.ts` |

> Logic เดิมใน inline script ยังทำงานได้ตามปกติ — TypeScript version เป็น "source of truth" ที่ test ได้

### แนว 2 — jsdom Environment (ทำแล้ว ✅)

เพิ่ม `@vitest-environment jsdom` ที่หัวไฟล์ test → ได้ `document`, `window`, `HTMLElement` ครบ

```typescript
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
// ... ใช้ document.createElement ได้ทันที
```

### แนวที่ 3 — ยังไม่ได้ทำ

| ฟังก์ชัน | วิธีแนะนำ |
|---|---|
| `TiForCol` T2B+Mean injection | Extract core algorithm → `src/lib/statInjection.ts` แล้ว test |
| `Pi` / `Zl` Grid row path | เช่นเดียวกัน — แยก Grid compute logic ออกจาก compiled bundle |
| S6 `buildColumnAugment` (ส่วนที่ query tbStore) | ต้อง mock `window.__cxGetTbPresetStore` ก่อน test |

---

### 18. `src/hooks/useBatchExportFlow.test.ts` — 11 tests

> Environment: **jsdom** | ใช้ `@testing-library/react` renderHook + act

#### กลุ่ม initial state (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 1 | starts not exporting | batchExporting = false ตั้งแต่แรก |
| 2 | starts with zero elapsed time | batchElapsedMs = 0 ตั้งแต่แรก |
| 3 | starts with no summary | batchExportSummary = null ตั้งแต่แรก |

#### กลุ่ม beginBatchExport (3 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 4 | sets batchExporting to true | หลัง begin → batchExporting = true |
| 5 | clears any previous summary | begin ใหม่ล้าง summary เก่า |
| 6 | returns the startedAt timestamp | คืน timestamp ที่ใช้จับเวลา |

#### กลุ่ม finishBatchExport (4 tests)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 7 | resets batchExporting to false atomically | **regression guard**: finish เดียวทำให้ batchExporting=false ทันที (ไม่ต้องเรียก endSession แยก) |
| 8 | sets batchExportSummary with correct values | summary มี successCount/skippedCount ถูกต้อง |
| 9 | sets batchElapsedMs from summary | elapsedMs ถูก sync จาก summary |
| 10 | is safe to call without a prior beginBatchExport | เรียก finish โดยไม่ begin ก่อน → ไม่ crash |

#### กลุ่ม dismissBatchExportSummary (1 test)

| # | ชื่อ Test | สิ่งที่ทดสอบ |
|---|---|---|
| 11 | clears summary while leaving batchExporting unchanged | dismiss ลบ summary แต่ไม่ยุ่ง batchExporting |
