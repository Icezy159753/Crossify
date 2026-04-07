
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

// ลบอักขระ Mojibake ที่ยาวผิดปกติ (เน€เธ...) ซึ่งเป็นตัวการทำให้ Vite พัง
// เราจะเน้นไปที่จุดแจ้งเตือน alert และคอมเมนต์ที่เสีย
content = content.replace(/alert\(['"]([^'"]+)['"]\)/g, (match, p1) => {
    if (p1.includes('เน€')) {
        // ถ้ามีการแจ้งเตือนที่เสีย ให้เหลือแค่ภาษาอังกฤษสั้นๆ
        if (p1.includes('Paste')) return "alert('Paste failed (Context Error)');";
        if (p1.includes('Delete')) return "alert('Delete failed (Context Error)');";
        return "alert('Operation failed');";
    }
    return match;
});

// ลบขยะใน comment หรือที่แทรกอยู่ใน string อื่นๆ
content = content.replace(/เน€เธ[เธ-โ]+[เธ-โย]+[เธ-โยย]+[เธ-โยยย]*/g, ' ');
content = content.replace(/เน€เธยเนยเธเนโฌย/g, ' - '); // ขีดกลางที่เสีย
content = content.replace(/เน€เธยเนโฌยเนยเธ/g, ' ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned index.html successfully');
