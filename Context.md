# Crossify Context

เอกสารนี้มีไว้สำหรับกลับมาทำงานต่อกับโปรเจกต์นี้ในครั้งถัดไป โดยเน้น 3 เรื่อง:
- ตอนนี้ระบบทำอะไรได้แล้ว
- จุดไหนเคยพังและต้องระวังมากเป็นพิเศษ
- ถ้าจะแก้/เพิ่มฟีเจอร์ต่อ ควรไล่ดูอะไรบ้างก่อน

## 1. ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็นเว็บแอป `Vite + React + TypeScript` สำหรับทำงานกับไฟล์ SPSS `.sav` เพื่อ:
- โหลดข้อมูล SPSS
- แสดงรายการตัวแปร
- สร้างตาราง crosstab แบบ `Top / Side`
- รองรับ `MA/MRSET`
- แก้ label/order/factor ของตัวแปร
- ทำ `Filter` แบบ drag and drop
- export Excel
- save/load settings
- batch export หลาย settings ไฟล์

ไฟล์หลัก:
- [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx)
- [src/lib/savParser.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/savParser.ts)
- [src/lib/crosstabEngine.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/crosstabEngine.ts)
- [src/lib/variableGrouping.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableGrouping.ts)
- [src/lib/settingsIO.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/settingsIO.ts)
- [src/components/DesignCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/DesignCanvas.tsx)
- [src/components/FilterCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/FilterCanvas.tsx)

## 2. สถานะปัจจุบัน

สิ่งที่ทำเสร็จแล้ว:
- แยก `DesignCanvas`, `FilterCanvas`, `TableRow`
- มี `Filter` tab อยู่ระหว่าง `Design` และ `Results`
- Filter รองรับ `AND / OR` ทั้ง:
  - ระหว่าง condition ภายใน group
  - ระหว่างหลาย group
- Filter ใช้จริงตอน:
  - Run Table
  - Run All
  - Batch Export
- Save/Load settings รองรับ filter แล้ว
- Save settings จะเขียน filter ออกทั้ง:
  - ชีท `Tables` เป็น summary
  - ชีท `Filters` เป็นรายละเอียดเต็ม
  - hidden sheet `_settings` เป็น source สำรอง
- เลือกหลาย table ได้ด้วย `Shift` / `Ctrl(Cmd)` และแก้ design/filter พร้อมกันได้
- deploy production ล่าสุดขึ้นบน Vercel แล้วที่:
  - `https://crossify-manager.vercel.app`

## 3. จุดเปราะบางที่ต้องระวังมาก

### 3.1 SPSS parser

ไฟล์ที่ต้องระวังที่สุด:
- [src/lib/savParser.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/savParser.ts)

จุดสำคัญ:
- เคยมีบั๊กใหญ่จาก `very long string` ทำให้ slot ของตัวแปรถัดไปเหลื่อม
- ถ้า parser เหลื่อม จะเกิดอาการลามทั้งระบบ เช่น:
  - SA มี code แปลก
  - MA frequency เป็น 0
  - QUOTA / Q86A / Q86B อ่านค่าผิด

สิ่งที่ห้ามทำโดยไม่เข้าใจ:
- อย่าเปลี่ยน logic เกี่ยวกับ `slotCount` แบบเดาสุ่ม
- อย่าเอา segment variables ของ long string กลับมา join แบบเดิม
- อย่าแก้ alias short/long name ของตัวแปรโดยไม่เช็กผลกับ `dataset.cases`

ถ้าแก้ parser:
- ต้องทดสอบกับไฟล์ `.sav` จริงที่มี:
  - MA
  - long string
  - numeric SA
  - string variable

### 3.2 MA / MRSET / grouped variable

ไฟล์ที่ต้องระวัง:
- [src/lib/variableGrouping.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableGrouping.ts)

สิ่งที่รู้แล้ว:
- การ group MA ต้องอิง `Name` ของ SPSS เป็นหลัก
- บาง flow ต้อง resolve ทั้ง `short name` และ `long name`
- code ของ grouped variable ต้อง normalize ก่อนเทียบ
- ถ้า grouped variable จับถูกแต่ raw case mapping ไม่ตรง จะเห็นอาการ:
  - base มี แต่ count = 0
  - หรือ n=0 ทั้งตาราง

อย่าแก้:
- `normalizeCode`
- member name resolution
- grouped option key/label mapping

โดยไม่เช็กกับ:
- Edit Variable
- Crosstab result
- Save/Load settings

### 3.3 Settings I/O

ไฟล์:
- [src/lib/settingsIO.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/settingsIO.ts)

สิ่งที่เคยพัง:
- Excel เปิดไฟล์ settings ไม่ได้ เพราะ hidden JSON ยาวเกิน/เขียนไม่ดี
- filter เคยถูก save แค่ใน hidden sheet ทำให้ผู้ใช้เปิดไฟล์แล้วเหมือน “ไม่มี filter”

ตอนนี้ version ล่าสุดคือ:
- `1.4`

ชั้นข้อมูลตอนนี้:
- `Tables` sheet: summary ที่คนมองเห็นได้
- `Filters` sheet: รายละเอียด filter เต็ม
- `_settings` hidden sheet: snapshot ทั้งก้อน

ถ้าจะเพิ่ม schema ใหม่:
- เพิ่ม version ใหม่ใน `AllSettings`
- รองรับ backward compatibility ตอน load
- อย่าลืมอัปเดตทั้ง visible sheet และ hidden sheet

### 3.4 App state ใน App.tsx

ไฟล์:
- [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx)

ข้อเท็จจริง:
- ไฟล์นี้ยังเป็นศูนย์กลางใหญ่ของระบบ
- flow หลักยังอยู่ที่นี่ เช่น:
  - load SPSS
  - compute result
  - batch export
  - save/load settings
  - batch table selection
  - filter plumbing

ก่อนแก้อะไรใน `App.tsx` ให้เช็กผลกระทบกับ:
- active tab state
- multi-select table editing
- filter + design interaction
- generateTable / computeTableResult
- batch export path

## 4. Logic สำคัญที่มีอยู่แล้ว

### 4.1 Design
- `Top` เก็บใน `colVar`
- `Side` เก็บใน `rowVar`
- ใช้ `AxisSpec` จาก [src/lib/appStateUtils.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/appStateUtils.ts)
- รองรับ `Add / Nest`

### 4.2 Filter
- type อยู่ใน [src/types/workspace.ts](c:/Users/songklod/Desktop/Crosstab/src/types/workspace.ts)
- runtime evaluator อยู่ใน [src/lib/filterEngine.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/filterEngine.ts)
- UI อยู่ใน [src/components/FilterCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/FilterCanvas.tsx)
- ตัวกรองใช้กับ raw + labeled cases ผ่าน `getFilteredCaseBundle()` ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx)

หมายเหตุ:
- operator แบบ `in/not_in` ใช้ key ของ option
- ตอนนี้ option label ใน filter แสดง `Code + Label`
- ใน group เดียวกันใช้ `AND/OR`
- ระหว่างหลาย group ใช้ `AND/OR` อีกชั้น

### 4.3 Variable editor
- logic อยู่ใน:
  - [src/lib/variableEditorUtils.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableEditorUtils.ts)
- รองรับ:
  - label override
  - factor
  - order
  - net groups
  - numeric stats

### 4.4 Batch export
- hook อยู่ใน:
  - [src/hooks/useBatchExportFlow.ts](c:/Users/songklod/Desktop/Crosstab/src/hooks/useBatchExportFlow.ts)
- ใช้ settings หลายไฟล์เพื่อรันตารางและ export หลาย workbook
- filter ถูกนำไปใช้แล้วใน batch export path

## 5. สิ่งที่ควรเช็กทุกครั้งก่อนจบงาน

ขั้นต่ำ:
- `npm run lint`
- `npm test`
- `npm run build`

ถ้าแก้ parser / settings / MA / filter:
- โหลด `.sav` จริง
- เปิด `Edit Variable`
- Run Table
- Save Settings
- Load Settings กลับ
- export Excel อย่างน้อย 1 ครั้ง

## 6. อาการที่เคยเจอและการตีความ

- `Count = 0` ทั้งหมดใน MA แต่ base มี:
  - มักเป็นปัญหา grouped mapping หรือ raw code ไม่ match

- `n=0` ทั้งตารางทั้งที่ group ถูก:
  - มักเป็น parser slot เหลื่อม หรือ filter ตัดหมด

- Q86/Q87/Quota มี code แปลก:
  - ให้สงสัย parser ก่อน โดยเฉพาะ long string slot alignment

- Save settings แล้วเปิด Excel เหมือนไม่มี filter:
  - ให้เช็ก `Tables` sheet และ `Filters` sheet
  - อย่าดูแค่ `_settings`

## 7. Deploy

Vercel:
- project linked อยู่ใน [.vercel/project.json](c:/Users/songklod/Desktop/Crosstab/.vercel/project.json)
- public URL ปัจจุบัน:
  - `https://crossify-manager.vercel.app`

คำสั่งที่เคยใช้ได้:
- `npx vercel --prod --yes`
- `npx vercel alias set <deployment> crossify-manager.vercel.app`

หมายเหตุ:
- alias เก่า `crossify-beta.vercel.app` ถูกลบแล้ว

## 8. งานที่น่าทำต่อ

รายการที่เป็นไปได้ในรอบถัดไป:
- เพิ่ม filter summary แบบอ่านง่ายด้านบน
- เพิ่ม quick filter presets
- ลดขนาด/ความซับซ้อนของ `App.tsx` ต่อ
- เพิ่ม test สำหรับ settings `1.4` โดยเฉพาะชีท `Filters`
- เพิ่ม regression test สำหรับ parser ที่มี long string + MA ในไฟล์เดียว

## 9. กฎไม่ให้พัง

ถ้าจะเริ่มแก้อะไรครั้งหน้า ให้ยึดกฎนี้:
- อย่าแก้ parser โดยไม่เข้าใจ `slotCount`
- อย่าแก้ MA grouping โดยไม่ทดสอบกับ `.sav` จริง
- อย่าเปลี่ยน schema settings โดยไม่เพิ่ม backward compatibility
- อย่าแก้ filter UI อย่างเดียว ต้องเช็ก compute path ด้วย
- อย่าเชื่อว่าหน้า UI ถูก = data layer ถูก ต้องเช็ก run result จริง

## 10. บันทึกทุกการแก้ไขลงในนี้เป็น By Day
- ทุกครั้งที่มีการแก้ไขอยากให้บันทึกลงไปทั้งหมด และจุดไหนที่ทำแล้วพังให้บันทึกไว้และมาเรียนรู้ในนี้แล้วห้ามพังซ้ำเป็นอันขาด หรืออันไหนที่เคยดีแล้วถ้าฉันไม่ได้สั่งให้แก้ห้ามปรับอะไรเลย คือ "กฎเหล็ก" 

### 2026-03-27
- เพิ่มตัวบ่งบอกใน `Tables List` ว่า table ไหนมี filter ใช้งานอยู่ โดยใช้ icon filter เล็กถัดจากจุดสถานะ run result
- นิยาม `active filter` ที่ใช้ใน sidebar ให้ตรงกับหน้า Results คือ table ต้องมีอย่างน้อย 1 condition อยู่ใน filter group
- ถ้า table มี `filter.description` จะใช้ข้อความนั้นเป็น tooltip ของ icon เพื่อช่วยเช็กเร็วโดยไม่ต้องเปิดแท็บ Filter
- งานนี้ตั้งใจไม่แตะ logic ประมวลผล filter เดิม และไม่เปลี่ยน schema settings
- เพิ่ม `filter summary` สำหรับหน้า Results โดยแสดงข้อความ `Filter: ...` ตามเงื่อนไขจริงของ table แทนการขึ้นแค่ `Filter active`
- ปรับตำแหน่ง `Filter: ...` ใหม่ให้อยู่ในพื้นที่ว่างซ้ายบนของหัวตารางทั้ง preview และ Excel โดยไม่เพิ่มบรรทัดใหม่เหนือ `Base`
- ปรับใหม่อีกรอบตามงานจริง: ในหน้าเว็บไม่แสดง `Filter` ซ้ำในตัวตาราง ให้เหลือเฉพาะข้อความสีน้ำเงินเหนือ table
- ฝั่ง Excel ใช้แถวบนสุดแถวเดียวเป็น metadata: `A1` = ชื่อ table, `B1` = `<- Back to Index`, และ `Filter` เป็นตัวอักษรสีเทาแบบไม่ merge
- ข้อความสรุป filter ที่ส่งไป Excel ถูกคำนวณจาก table filter ตอน export เพื่อให้หน้าเว็บกับไฟล์ export ใช้ข้อความเดียวกัน
- ปรับชื่อชีท export ให้ใช้ชื่อเดียวกับใน `Tables List` แทนชื่อที่ derive จากตัวแปร
- แก้ flow export เดี่ยวให้ส่ง `tableName` ไปด้วย เพื่อให้ทั้งชื่อชีทและ `A1` ใช้ชื่อเดียวกับ `Tables List`
- ปรับ `Filter` ใน Excel metadata row ให้ไม่ขยายความสูงแถว และให้ข้อความไหลตามแนวนอนแทน
- แก้จุด `buildCrosstabWorkbook()` ที่ยังใช้ `config.rowVar` ตั้งชื่อชีทอยู่ ให้เปลี่ยนมาใช้ `tableName` ก่อนเสมอ
- เอาการขยายความกว้างคอลัมน์ของ `Filter` ออก เพื่อไม่ให้ช่องในตารางถูกยืดตามข้อความ filter
- ปรับ header ปุ่มด้านบนให้แสดงครบตั้งแต่แรก และ disabled ตามเงื่อนไขเดิมแทนการซ่อนบางปุ่ม
- ปรับ layout ปุ่มใหม่ตามแนว `3+4`:
  - Header เหลือ 3 กลุ่ม `Workspace / Tables / Batch`
  - ย้าย `Export Selected / Export All` ลงมาไว้แถวเดียวกับ `Output Options` และ tab bar เพื่อลดความรกบน header หลัก
- ปรับต่ออีกรอบตาม UX ใหม่: คง `Run All` และปุ่ม export เป็นปุ่มตรง ๆ ส่วน `Workspace / Tables / Batch` เปลี่ยนเป็นเมนู dropdown คลิกเปิด
- เอา `Home` ออกจากเมนู `Workspace` และใช้คลิกที่โลโก้ `Crossify` เพื่อกลับหน้าแรกแทน
- ย้าย `Run All` ลงมาไว้ก่อน `Export Selected` ใน action bar แถวรอง
- ปรับสไตล์เมนูย่อยให้มีการ์ดสีอ่อนและไอคอนในแต่ละ action เพื่อให้ดูมีลูกเล่นขึ้นแต่ไม่ฉูดฉาด
- ลดพื้นที่ว่างซ้ายบนของ preview table บนเว็บโดยเอาช่อง header เปล่าที่เกินจำเป็นออก
- เพิ่ม schema settings เป็น `1.5` เพื่อเก็บข้อมูลไฟล์ SPSS ต้นทาง (`fileName` และ `filePath` ถ้า environment ส่งมาให้) ทั้งใน hidden sheet `_settings` และ visible sheet `Source`
- ปรับ flow `Load Settings` ให้ถ้า settings ระบุไฟล์ SPSS ต้นทางไว้และ dataset ปัจจุบันยังไม่ตรง ระบบจะเด้งให้เลือก `.sav` ต่อทันที แล้วค่อย restore tables/settings หลังโหลดไฟล์สำเร็จ
- parser `.sav` เก็บ `sourcePath` เพิ่มจาก `File.path` หรือ `webkitRelativePath` ถ้ามี แต่ต้องจำไว้ว่า browser ปกติอาจไม่เปิดเผย full path เสมอ จึงควร fallback โดยเทียบ `fileName`
- ปรับ UX ตอน `Load Settings` ที่ต้องเลือก `.sav` ต่อ โดยใช้ dialog กลางหน้าจอแทน toast ลอย บอกชื่อไฟล์ SPSS ที่ต้องเลือกชัดเจน และมีปุ่ม `Choose SPSS File` / `Cancel`
- ถ้าผู้ใช้เลือก `.sav` ผิดไฟล์หลังเปิด dialog ระบบจะไม่ restore settings เงียบ ๆ และจะเปิด dialog เดิมกลับมาให้เลือกไฟล์ที่ถูกอีกครั้ง
- เพิ่ม `File System Access API` แบบ progressive enhancement ผ่าน [src/lib/fileAccess.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/fileAccess.ts) และ [src/lib/fileHandleStore.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/fileHandleStore.ts) เพื่อเก็บ `FileSystemFileHandle` ของ `.sav` ใน IndexedDB
- ปรับปุ่ม `Load SPSS` ทั้งบน landing, header และ empty workspace ให้ใช้ native picker ของ browser ที่รองรับก่อน ถ้าไม่รองรับค่อย fallback ไป input/file dialog เดิม
- ตอน `Load Settings` ถ้า settings มี metadata ของไฟล์ SPSS และ browser ยังมี handle เดิมพร้อม permission ระบบจะโหลด `.sav` เดิมให้อัตโนมัติเลยโดยไม่ต้องให้ผู้ใช้เลือกใหม่
- ถ้า auto-load จาก handle ทำไม่ได้ เช่น browser ไม่รองรับ, ไม่มี handle เดิม, หรือ permission หมดอายุ ระบบจะ fallback ไป dialog กลางให้ผู้ใช้เลือกไฟล์เหมือนเดิม
- เพิ่ม flow สำหรับไฟล์ `settings.xlsx` ให้ Save กลับไฟล์เดิมได้ผ่าน File System Access API:
  - ถ้าเป็นการ Save ครั้งแรก ระบบจะเปิด native save picker ให้ผู้ใช้เลือกที่เก็บและชื่อไฟล์
  - หลังจากนั้นการกด `Save` จะเขียนทับไฟล์ settings เดิมไฟล์เดียวกันต่อไป ไม่ต้องดาวน์โหลดไฟล์ใหม่ทุกครั้ง
  - ถ้าเปิด settings ผ่าน flow `Load Settings` แบบ File System Access API ระบบจะจำ handle ของไฟล์นั้นไว้ และ `Save` ครั้งถัดไปจะบันทึกกลับลงไฟล์เดิมโดยตรง
- Browser ที่ไม่รองรับ File System Access API หรือเคสที่ไม่ได้ handle ของไฟล์ settings จะยัง fallback ไปการดาวน์โหลด `crosstab_settings.xlsx` แบบเดิม
- เพิ่ม flow `Rebind SPSS File` แบบเต็มใน dialog ตอน `Load Settings`:
  - มีปุ่มแยก `Choose Matching File` สำหรับเลือกไฟล์เดิมให้ตรง metadata เดิม
  - มีปุ่ม `Rebind SPSS File` สำหรับผูก settings นี้เข้ากับ `.sav` ตัวใหม่/ตำแหน่งใหม่
  - ถ้า rebind สำเร็จและมี handle ของไฟล์ settings ปัจจุบัน ระบบจะเขียน source link ใหม่กลับลง settings file เดิมทันที
  - ถ้า rebind สำเร็จแต่ยังไม่มี handle ของไฟล์ settings ระบบจะใช้งานต่อได้ทันที และแจ้งให้ผู้ใช้กด `Save` เพื่อบันทึก source ใหม่ลงไฟล์ settings
- เพิ่ม schema settings เป็น `1.6` เพื่อรองรับ `sourceMappings` หลายรายการต่อ settings 1 ไฟล์ และ `activeLock` สำหรับ soft lock
- visible sheet ใหม่:
  - `SourceMappings` เก็บหลาย source/path พร้อม owner/machine/last bound info
  - `Lock` เก็บสถานะ lock ปัจจุบันแบบอ่านง่าย
- load ไฟล์ settings เก่า (`1.0` ถึง `1.5`) ยังได้เหมือนเดิม โดยถ้ามีแค่ `sourceDataset` ระบบจะแปลงเป็น mapping เดียวใน memory ให้เอง
- ตอน `Load Settings` ระบบจะลอง match `.sav` จาก `sourceMappings` ทุกตัวก่อน ไม่ได้ยึดแค่ source ล่าสุดตัวเดียวแล้ว
- soft lock ทำงานแบบนี้:
  - คนที่เปิด settings ผ่าน File System Access handle และไม่มี foreign lock จะ acquire lock ลงไฟล์ settings ทันที
  - คนที่เปิดเข้ามาแล้วเห็น lock ของ session อื่นที่ยังไม่หมดอายุ จะเปิดแบบ `read-only` และปุ่ม `Save` ถูกปิด
  - lock นี้ยังเป็น soft lock บนไฟล์ shared drive ไม่ใช่ hard lock ระดับ server/OS จึงลดโอกาสชนกันได้มาก แต่ไม่การันตี 100%
- เพิ่ม `auto-renew lock` ในแอป:
  - ถ้า session ปัจจุบันถือ lock และไฟล์ settings เขียนกลับได้ ระบบจะต่ออายุ lock อัตโนมัติทุก 60 วินาที
  - ถ้า heartbeat เขียนไม่สำเร็จจะไม่เด้ง error รบกวน แต่ผู้ใช้ยังใช้ `Refresh Lock Status` หรือ `Force Take Over` ได้เอง
- เพิ่ม action ใน readonly banner:
  - `Refresh Lock Status` โหลดไฟล์ settings ล่าสุดจาก handle เดิมมาเช็กสถานะ lock ใหม่
  - `Force Take Over` แย่ง lock มาเป็นของ session ปัจจุบันหลังยืนยัน และกลับมาแก้/Save ได้
- เพิ่ม encoding support ใน [src/lib/savParser.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/savParser.ts) แบบเน้นไม่ให้ parser พัง:
  - ขยาย mapping ของ `TextDecoder` ให้รองรับตระกูล `Shift-JIS / CP932`, `GBK / GB18030 / CP936`, `Big5 / CP950`, `EUC-KR / CP949` รวมถึง `windows-1253` ถึง `windows-1258`
  - เพิ่มชั้นตรวจว่า encoding label นั้น browser รองรับจริงก่อนค่อยใช้ เพื่อลดโอกาส `TextDecoder` throw
  - `decodeBytes()` มี fallback chain เป็น `requested -> windows-874 -> utf-8 -> windows-1252 -> ASCII-safe fallback` เพื่อให้เจอ encoding แปลกแล้วยังไม่ล้มทั้ง parser
  - ยังตั้ง `windows-874` เป็น default เดิมไว้เพื่อไม่กระทบไฟล์ไทยที่เคยทำงานได้อยู่แล้ว
- เพิ่ม regression test ใหม่ที่ [src/lib/savParser.test.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/savParser.test.ts) ครอบคลุม alias ของ JPN/CHN/KR และกรณี unsupported encoding ต้องไม่ throw
- รอบนี้ยังไม่ได้แตะ flow memory ของไฟล์ใหญ่ (`file.arrayBuffer()` + เก็บ `cases`/`labeledCases`) ดังนั้นเรื่องไฟล์ `.sav` ระดับหลายร้อย MB ยังถือว่าเสี่ยงด้าน memory เหมือนเดิม แม้ encoding จะรองรับมากขึ้นแล้ว
- เริ่ม optimize ฝั่ง memory สำหรับไฟล์ `.sav` ใหญ่:
  - เอา raw-case alias copy ทั้งก้อนออกจาก [src/lib/savParser.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/savParser.ts) โดยไม่สร้าง `casesWithAliases` ซ้ำอีกหนึ่งชุดแล้ว
  - ฝั่ง [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ไม่เก็บ `labeledCases` เป็น state ถาวรอีกต่อไป แต่ derive จาก `dataset` แบบ `useMemo`
  - ถ้าไม่มี `variableOverrides` ระบบจะใช้ labeled view เดิมตรง ๆ โดยไม่ map/clone ทั้ง dataset ซ้ำอีกชั้น
  - รอบนี้ยังไม่ได้ทำ streaming parse ดังนั้นไฟล์ใหญ่มากระดับหลายร้อย MB ยังไม่การันตี แต่ memory footprint ควรดีขึ้นชัดเจนจากการลด data duplication
- เพิ่ม `Light load mode` สำหรับไฟล์ `.sav` ใหญ่มาก:
  - ถ้าไฟล์มีขนาดตั้งแต่ `150 MB` ขึ้นไป ระบบจะเปิดโหมดนี้อัตโนมัติ
  - ในโหมดนี้จะไม่สร้าง labeled dataset ทั้งก้อนทันทีตอนเปิดไฟล์ แต่จะเลื่อนไปสร้างเฉพาะตอนกดใช้ฟังก์ชันจริง เช่น run table / filter / batch flow
  - ไฟล์เล็กกว่าจะยังทำงานแบบเดิม ไม่มีผลกับ flow ปกติ
  - เพิ่ม badge `Light load mode` ที่ header เพื่อให้รู้ว่าตอนนี้แอปกำลังใช้โหมดประหยัดหน่วยความจำ
- แก้บั๊ก self-lock ตอนพัฒนาใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx): เดิม `settingsSessionId` ถูกสุ่มใหม่ทุกครั้งที่หน้า reload/hot reload ทำให้ lock ของคนเดิมใน tab เดิมถูกมองเป็น foreign lock แล้วขึ้น `Read-only settings mode` เอง
- แนวแก้คือย้าย `settingsSessionId` ไปเก็บใน `sessionStorage` ของ tab ปัจจุบันแทน เพื่อให้ refresh/reload ใน tab เดิมยังถือว่าเป็น session เดิม แต่เปิดคนละ tab/คนละ browser/คนละเครื่องยังเป็นคนละ session ตามเดิม
- เก็บเคสเพิ่มอีกชั้น: ถ้า settings file ยังมี lock ของ `ownerLabel + machineLabel` เดิมแต่ `sessionId` เป็นรอบเก่า ระบบควรถือว่าเป็น self-reclaim ได้ ไม่ใช่ foreign lock ทันที มิฉะนั้นผู้ใช้คนเดียวระหว่างพัฒนาจะยังติด `Read-only` หลอกและต้องกด `Force Take Over` เองทุกครั้ง
- ขยาย schema lock เป็น `1.7` โดยเพิ่ม `status: ACTIVE | EXITED`, `updatedAt`, `exitedAt` ใน `activeLock` และใน sheet `Lock`
- logic ใหม่ของ lock:
  - `ACTIVE` + ยังไม่หมดอายุ = ถือว่าไฟล์กำลังถูกใช้งาน
  - `EXITED` = ไม่ถือเป็น active lock แล้ว ถึงแม้ metadata ของคนก่อนหน้ายังค้างอยู่
  - ตอนปิดหน้า/ปิด browser ระบบจะพยายามเขียน `EXITED` กลับลง settings file แบบ best effort ผ่าน `pagehide`/`beforeunload`
- ยังต้องพึ่ง `expiresAt` อยู่เหมือนเดิม เพราะ browser ไม่รับประกันว่า callback ตอนปิดหน้าจะเขียนไฟล์สำเร็จทุกครั้ง
- ปรับ lock ให้เหมาะกับการใช้หลายเครื่องมากขึ้น:
  - ลดอายุ lock จาก 2 ชั่วโมงเหลือ 3 นาที
  - heartbeat ต่ออายุ lock ทุก 30 วินาที แทนทุก 60 วินาที
  - เพิ่มปุ่ม `Release Lock` ใน banner ตอนไฟล์ settings ถูก link อยู่และไม่ได้ readonly เพื่อให้ผู้ใช้ปล่อย lock เองแบบเชื่อถือได้กว่าการปิด browser เฉย ๆ
  - หลัง `Release Lock` สำเร็จ heartbeat จะหยุด ไม่เขียน `ACTIVE` กลับเองจนกว่าจะมีการ `Save` หรือ acquire lock ใหม่
- เพิ่ม browser warning ตอนผู้ใช้จะปิด tab/browser ขณะยังถือ lock อยู่และยังไม่ได้ `Release Lock`
  - ใช้ `beforeunload` native prompt ของ browser
  - browser สมัยใหม่มักไม่แสดงข้อความ custom เต็ม ๆ แล้ว จะแสดงเป็นคำเตือนมาตรฐานของ browser แทน
- ปรับ UX จาก `Release Lock` เป็นปุ่ม `Exit` ใน banner:
  - ถ้าเป็น editable session ปุ่ม `Exit` จะ `Save + Release Lock` ให้อัตโนมัติ แล้ว unlink settings file session นี้
  - ถ้าเป็น read-only session ปุ่ม `Exit` จะออกจาก settings session นี้ทันทีโดยไม่พยายามเขียนไฟล์
  - หลัง `Exit` สำเร็จระบบจะพากลับหน้า landing/หน้าเริ่มต้นเสมอ เพื่อให้ผู้ใช้รู้สึกว่าออกจากหน้าทำงานแล้วจริง
  - จุดประสงค์คือให้ผู้ใช้จำ flow ง่ายขึ้นว่า “จะเลิกใช้งาน settings ให้กด Exit ก่อน”


## 11. จุดเริ่มต้นที่แนะนำถ้ากลับมาทำต่อ

ลำดับแนะนำ:
1. เปิด [Context.md](c:/Users/songklod/Desktop/Crosstab/Context.md)
2. เปิด [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx)
3. ดูไฟล์ที่เกี่ยวกับงานรอบนั้นโดยตรง
4. รัน `npm test`
5. รัน `npm run build`
6. ถ้าแก้ parser/settings/filter ให้ลองกับ `.sav` และ save/load จริงทันที

- ปรับข้อความไทยที่เพี้ยนในหน้าแรกและข้อความช่วยอธิบายในหน้า `Edit Variable` ของตัว build ที่หน้า local ใช้งานอยู่ (`dist/assets/index-BnhwOk1d.js`) ให้กลับมาอ่านได้ปกติ
- ปรับ popup `Create T2B` ในตัว build ที่หน้า local ใช้งานอยู่ (`dist/assets/index-BnhwOk1d.js`) ให้เล็กลง โดยลดความกว้าง modal, padding, gap และขนาดตัวอักษรของแต่ละตัวเลือก

- Added composite-side derived row support in [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) so sectioned SIDE tables can append `TB/T2B/T3B/...` summary rows and `Mean/Min/Max/StdDev` rows inside each section instead of losing them when another SIDE variable is added.
- Extended scale preset support in [src/lib/variableEditorUtils.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableEditorUtils.ts) with `t3b_low_good`, `t3b_high_good`, `justright_code`, and `justright_centered`, plus regression coverage in [src/lib/variableEditorUtils.test.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableEditorUtils.test.ts).
- Refreshed the variable editor preset UX in [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx): the action button is now styled as `Create T2B`, the chooser popup is narrower, and each preset card uses a Crossify-friendly color tone with compact descriptions.
- Expanded settings persistence in [src/lib/settingsIO.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/settingsIO.ts) to save/load the newer preset labels through `TB_Setting`, keeping backward parsing for older Thai preset labels and bumping workbook metadata to `1.9`.

- เพิ่ม preset ในหน้าแก้ตัวแปรของ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) สำหรับ `สร้างTB(Scale น้อยดี)`, `สร้างTB(Scale มากดี)`, `สร้างT2B(Scale น้อยดี)`, และ `สร้างT2B(Scale มากดี)` โดยผูกปุ่มเมนูใหม่ไว้ในส่วน `Order Controls` ของ modal `Edit Variable` เพื่อให้กดสร้าง factor + summary codes ได้จากจุดเดียว
- ขยาย utility ใน [src/lib/variableEditorUtils.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableEditorUtils.ts) ให้รองรับ `rowKind: 'summary'`, สร้าง preset factor/summary ด้วย `buildScaleSummaryPreset()`, และประกอบแถว editor แบบมี summary ต่อท้ายด้วย `buildVariableEditorRowsWithSummaries()` พร้อม regression tests เพิ่มใน [src/lib/variableEditorUtils.test.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/variableEditorUtils.test.ts)
- ปรับ persistence ของ variable override ใน [src/lib/settingsIO.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/settingsIO.ts) ให้เก็บ/อ่าน `summaries` ผ่าน sheet `VariableSettings` และขยับ hidden settings version เป็น `1.8` โดยยังอ่านไฟล์เก่า `1.0-1.7` ได้ตามเดิม
- ปรับ flow ของหน้า `Edit Variable` ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ให้คัดแยก `code rows` ออกจาก `summary rows` ชัดเจน: การ sort, multi-select, move up/down, net grouping, และการ save จะทำกับ code rows เท่านั้น ส่วน summary rows จะถูกสร้าง/แสดงไว้ล่างสุดและไม่ไปชน logic เดิม
- เพิ่ม post-process ของผลตารางใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ด้วย `appendSummaryRows()` และ `appendSummaryColumns()` เพื่อให้ TB/T2B/BB/B2B ที่สร้างจากหน้า Edit Variable ไปแสดงในผล crosstab ได้จริงทั้งฝั่งแถวและคอลัมน์สำหรับตัวแปร single-level ปกติ โดยคง net rows และ numeric stats เดิมไว้
- ปรับปุ่ม `สร้าง TB/T2B` ในหน้า [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) จาก dropdown เล็กด้านข้างเป็น popup กลางจอที่เลือก preset ได้ชัดขึ้น พร้อมแสดงชื่อ preset ปัจจุบันบนปุ่มหลังเลือกสำเร็จ
- เพิ่มการเก็บ `summaryPreset` ของแต่ละตัวแปรลง `variableOverrides` และเพิ่มชีทใหม่ `TB_Setting` ใน [src/lib/settingsIO.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/settingsIO.ts) เพื่อ save รายการว่า variable ไหนเลือก preset อะไรไว้ โดย load กลับมาแล้วคืนค่า preset เดิมได้

- ปรับแถบสลับแท็บ Design / Filter / Results ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ให้เล็กลงและกระชับขึ้น โดยลด min-width, padding, มุมโค้ง และ spacing ของ segmented control เพื่อให้บาลานซ์กับปุ่มด้านบนมากขึ้นโดยไม่เปลี่ยน behavior เดิม

- ปรับหัวคอลัมน์ Top ใน [src/components/PreviewTable.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/PreviewTable.tsx) ให้ตัดท้ายแบบ ellipsis และใส่ tooltip เต็มข้อความ เพื่อแก้ปัญหา label ยาวไหลชนกันในหน้า Results โดยไม่เพิ่มความสูงของแถวหัวตาราง

- ปรับตำแหน่ง `n=...` ในหัวตารางหน้า Results ของ [src/components/PreviewTable.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/PreviewTable.tsx) ให้ไปอยู่ที่ header level สุดท้ายเสมอ เมื่อ Top มีหลายตัวแปรหรือตั้งค่า Nest เพื่อให้แถว `n=` อยู่ชิดเหนือ `Base` เหมือนรูปแบบ Excel และไม่เหลือแถวว่างคั่นก่อนข้อมูล

- ปรับหน้าเว็บให้ตัวหนังสือนิ่งขึ้นตอน refresh โดยเอา Google Fonts ออกจาก [index.html](c:/Users/songklod/Desktop/Crosstab/index.html) และเปลี่ยน `font-sans` / `font-display` ใน [tailwind.config.js](c:/Users/songklod/Desktop/Crosstab/tailwind.config.js) ไปใช้ local/system font stack แทน เพื่อลดอาการ font swap หรือ text flash ตอนโหลดหน้า

- เพิ่ม quick add flow สำหรับตัวแปรใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) โดยแสดงปุ่มลัด `Top / Side / Filter` ตอน hover และบอก `Quick add target` ปัจจุบัน เพื่อแก้ pain point เรื่องลากตัวแปรไกลเกินไป
- เพิ่ม selected target mode ให้กล่อง `Top / Side` ใน [src/components/DesignCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/DesignCanvas.tsx) และกล่อง filter ใน [src/components/FilterCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/FilterCanvas.tsx) แสดงสถานะ `Quick Add` ชัดเจนเมื่อถูกเลือก
- เพิ่ม handler quick add ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) เพื่อส่งตัวแปรจาก list เข้า `Top`, `Side` หรือ `Filter` ได้ทันทีโดยไม่ต้อง drag ข้ามหน้าจอ และยังคง drag-and-drop เดิมไว้เหมือนเดิม
- เพิ่ม multi-select ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) และ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ให้รองรับการกด `Ctrl / Shift` เลือกหลายตัวแปรแบบ range/selective ได้ใกล้เคียง `Tables List`
- เพิ่ม quick action `Table` บน variable card และเพิ่มปุ่มสร้าง table จากตัวแปรที่เลือกในหัว `Tables List` ของ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) โดยสร้าง table ใหม่ตามจำนวนตัวแปรที่เลือกและตั้งชื่อ table เป็นชื่อตัวแปรอัตโนมัติ
- เพิ่มปุ่ม `Clear All` ให้ทั้งกล่อง `Top` และ `Side` ใน [src/components/DesignCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/DesignCanvas.tsx) เพื่อเคลียร์แกนรวดเดียวโดยไม่ต้องลบทีละตัว
- เพิ่ม drag-and-drop reorder สำหรับตัวแปรที่อยู่ใน `Top` และ `Side` ใน [src/components/DesignCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/DesignCanvas.tsx) โดยลากตัวแปรไปวางก่อน/หลังตัวอื่นได้ และผูก logic ย้ายตำแหน่งผ่าน [src/lib/appStateUtils.ts](c:/Users/songklod/Desktop/Crosstab/src/lib/appStateUtils.ts)
- เพิ่ม warning ในหน้า `Filter` ของ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) เมื่อเลือกหลาย table ที่ตอนนี้ยังใช้ filter คนละชุด เพื่อแจ้งรายชื่อตารางที่ไม่ตรงกันก่อนที่การแก้ filter รอบถัดไปจะถูก apply ไปพร้อมกัน
- เพิ่ม context menu แบบคลิกขวาใน `Tables List` ที่ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) และ [src/components/TableRow.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/TableRow.tsx) เพื่อให้ลบ table เดียวหรือ `Delete Selected` หลาย table ที่เลือกอยู่ได้จากเมนูเดียว
- แก้ `updateFilterTables()` ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ให้เวลาผู้ใช้แก้ filter ขณะเลือกหลาย table ระบบจะใช้ filter ล่าสุดของ active table เป็น source แล้วเขียนทับไปทุก table ที่เลือกจริง แทนการพยายาม patch ตาม `groupId/conditionId` เดิมของแต่ละ table ซึ่งทำให้ค่าที่เลือกอย่าง `BKK/UPC` หลุดไปบาง table เมื่อโครง filter เดิมไม่ตรงกัน
- ปรับตารางหน้า Results ใน [src/components/PreviewTable.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/PreviewTable.tsx) ให้ทรงสม่ำเสมอขึ้น โดยลดความกว้างคอลัมน์คงที่, ลด `min-width` ของ table และจำกัด `max-width` ของหัวโจทย์/หัวคอลัมน์พร้อม ellipsis เพื่อไม่ให้ table แต่ละชุดดูใหญ่เล็กไม่เท่ากันตามความยาวข้อความโจทย์
- ปรับ quick action ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) ให้ย้ายจากการลอยทับด้านข้างไปอยู่เป็นแถวล่างของ card พร้อมเพิ่มความสูงรายการเล็กน้อย เพื่อไม่ให้ปุ่ม `Top / Side / Filter / Table` บังชื่อแปรหรือ label ใน `VariableFolders`
- ปรับ quick action ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) อีกรอบตาม feedback โดยกลับมาใช้ layout บรรทัดเดียว แต่กัน `padding-right` ให้พื้นที่ข้อความและย้ายปุ่มไปอยู่ใน toolbar ลอยเล็ก ๆ ด้านขวา เพื่อไม่ให้รายการสูงเกินไปและยังไม่บังชื่อแปร
- ปรับ quick action ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) อีกรอบให้ไม่โชว์สถานะ target ค้างเป็นสีน้ำเงินในตัวแปรที่เคยคลิก และขยาย toolbar ด้านขวาเล็กน้อย โดยให้เมนูโผล่เฉพาะตอน hover จริงเพื่อลดความรู้สึกว่าเมนูถูกเลือกค้างไว้
- เพิ่ม `Copy / Paste` ใน context menu ของ `Tables List` ที่ [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) โดยสามารถคัดลอก table เดียวหรือหลาย table ที่เลือกไว้ แล้ว paste ชุดที่คัดลอกต่อหลัง row ที่คลิกได้ พร้อม clone filter เป็นชุดใหม่เพื่อลดการชนกันของ `groupId / conditionId`
- ปรับ quick action ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) อีกรอบตาม feedback โดยเปลี่ยนจากปุ่ม 4 เม็ดลอยข้างแถว เป็นปุ่มเมนูเดียว (`More`) ต่อหนึ่ง variable แล้วค่อยเปิด dropdown `Top / Side / Filter / Table` เมื่อต้องการใช้งาน พร้อมเพิ่ม `onClearSelection` จาก [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) เพื่อเคลียร์ variable selection เมื่อคลิกนอก sidebar ลดอาการเหมือนรายการถูกเลือกค้างไว้
- ปรับ `handleVariableSelection()` ใน [src/App.tsx](c:/Users/songklod/Desktop/Crosstab/src/App.tsx) ให้การคลิกตัวแปรแบบธรรมดาไม่ค้าง selection เป็นชุดอีกต่อไป โดยจะเก็บ anchor ไว้สำหรับ `Shift` แต่ค้าง highlight เฉพาะตอนใช้ `Ctrl / Shift` จริง ๆ
- เพิ่ม `onContextMenu` ใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) ให้คลิกขวาที่ตัวแปรแล้วเปิดเมนูเดียวกับปุ่ม 3 จุด (`Top / Side / Filter / Table`) ได้ทันที โดยยังคงปุ่ม 3 จุดไว้เหมือนเดิม
- แก้บั๊ก drag-and-drop reorder ใน [src/components/DesignCanvas.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/DesignCanvas.tsx) โดยเปลี่ยน outer drop zone จาก `onDropCapture` เป็น `onDrop` เพื่อไม่ให้พื้นที่ว่างชั้นนอกแย่ง event ก่อน drop target ของตัวแปรด้านใน ทำให้การลากตัวแปรจากล่างขึ้นบนใน `SIDE` หรือ `TOP` สามารถแทรกก่อนตัวแปรเป้าหมายได้ตามที่คาด
- ปรับเมนู quick action ของ [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) ให้ตรวจพื้นที่ว่างของหน้าจอตอนกดเปิดเมนู แล้วสลับจากเปิดลงล่างเป็นเปิดขึ้นด้านบนอัตโนมัติเมื่อ variable อยู่ใกล้ขอบล่างของ sidebar เพื่อให้เมนู `Top / Side / Filter / Table` มองเห็นได้ครบ
- ปรับเมนู quick action ของ [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) อีกรอบโดย render เป็น portal ไปที่ `document.body` พร้อมคำนวณตำแหน่งแบบ fixed จาก anchor ที่กด เพื่อไม่ให้เมนูถูก clip โดย `overflow-y-auto` ของ sidebar อีกต่อไป แม้คลิกตัวแปรที่อยู่ล่างสุด
- ปรับ interaction เพิ่มใน [src/components/VirtualVarList.tsx](c:/Users/songklod/Desktop/Crosstab/src/components/VirtualVarList.tsx) ให้เมื่อเมนู variable เปิดอยู่แล้ว ผู้ใช้คลิก variable อื่นหรือพื้นที่อื่นใน `VariableFolders` เมนูเดิมจะปิดทันที โดยยังคงไม่ปิดเมื่อคลิกภายในตัวเมนูเอง
