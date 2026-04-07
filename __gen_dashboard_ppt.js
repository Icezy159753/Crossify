
import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import xlsx from 'xlsx';

// 1. อ่านข้อมูลจาก Excel
const workbook = xlsx.readFile('../Check_Data_Summary 69040.xlsx');
const summaryData = xlsx.utils.sheet_to_json(workbook.Sheets['Summary']);

const pptx = new PptxGenJS();

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addText("Data Summary Dashboard", { x: 1, y: 1, w: 8, h: 1, fontSize: 36, bold: true, color: '363636', align: 'center' });
slide1.addText("Check Result for Sigma BHUT Projects", { x: 1, y: 2, w: 8, h: 0.5, fontSize: 18, color: '666666', align: 'center' });
slide1.addShape(pptx.ShapeType.rect, { x: 1, y: 3.5, w: 8, h: 1.5, fill: { color: 'F1F1F1' } });
slide1.addText(`Total Mismatches Found: ${summaryData.length}`, { x: 1, y: 3.7, w: 8, h: 1, fontSize: 24, bold: true, color: 'D9534F', align: 'center' });

// Slide 2: Summary by File
let slide2 = pptx.addSlide();
slide2.addText("Mismatches by File", { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 24, bold: true, color: '363636' });

const fileCounts = summaryData.reduce((acc, row) => {
    acc[row.File] = (acc[row.File] || 0) + 1;
    return acc;
}, {});

const tableData = [
    [{ text: "File Name", options: { bold: true, fill: '1F4E78', color: 'FFFFFF' } }, { text: "Count", options: { bold: true, fill: '1F4E78', color: 'FFFFFF' } }]
];
Object.entries(fileCounts).forEach(([file, count]) => {
    tableData.push([file, count.toString()]);
});

slide2.addTable(tableData, { x: 0.5, y: 1.5, w: 9, colW: [7, 2], border: { pt: 1, color: 'E1E1E1' } });

// Slide 3: Details
let slide3 = pptx.addSlide();
slide3.addText("Detailed Discrepancies (Top 10)", { x: 0.5, y: 0.2, w: 9, h: 0.5, fontSize: 20, bold: true });

const detailTable = [
    ["File", "Sheet (Ref)", "Sheet (Check)", "Diff"].map(h => ({ text: h, options: { bold: true, fill: 'EEEEEE' } }))
];
summaryData.slice(0, 10).forEach(row => {
    const fileName = row.File.split(' ')[4]; // Shorten name
    detailTable.push([fileName, row['Sheet (เธญเนเธฒเธเธญเธดเธ)'], row['Sheet (เธ•เธฃเธงเธเธชเธญเธ)'], row['เธเธฅเธ•เนเธฒเธ'].toString()]);
});

slide3.addTable(detailTable, { x: 0.2, y: 0.8, w: 9.6, fontSize: 10, colW: [3, 2, 3, 1.6] });

// Save
pptx.writeFile({ fileName: "../Summary_Dashboard_69040.pptx" }).then(fileName => {
    console.log(`Created file: ${fileName}`);
});
