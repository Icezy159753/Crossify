
import fs from 'fs';

const filePath = 'index.html';
let content = fs.readFileSync(filePath, 'utf8');

// ลบ Mojibake ที่อยู่ใน indexOf
content = content.replace(/&& p\.textContent\.indexOf\('เน€เธ[^']+'\) !== -1/g, '');

// ลบ Mojibake ที่อยู่ใน innerHTML หรือ textContent
content = content.replace(/>เน€เธ[^<]+</g, '>Enabled<');
content = content.replace(/placeholder="เน€เธ[^"]+"/g, 'placeholder="e.g. A, B, C"');

// ลบ Mojibake ที่เหลือใน comment หรือ string อื่นๆ
content = content.replace(/เน€เธ[เธ-โ]+[เธ-โย]+[เธ-โยย]+[เธ-โยยย]*/g, ' ');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Deep cleaned index.html successfully');
