
const PptxGenJS = require('pptxgenjs');
const xlsx = require('xlsx');

async function run() {
    try {
        const workbook = xlsx.readFile('../Check_Data_Summary 69040.xlsx');
        const summaryData = xlsx.utils.sheet_to_json(workbook.Sheets['Summary']);

        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE'; // ใช้หน้าจอแนวกว้าง (16:9)

        // --- Slide 1: Professional Title ---
        let slide1 = pptx.addSlide();
        slide1.background = { color: 'F8F9FA' };
        slide1.addText("DATA QUALITY DASHBOARD", { x: 0, y: 1.5, w: '100%', h: 1, fontSize: 44, bold: true, color: '1F4E78', align: 'center', fontFace: 'Calibri' });
        slide1.addText("Sigma BHUT Validation Results Summary", { x: 0, y: 2.5, w: '100%', h: 0.5, fontSize: 20, color: '666666', align: 'center' });
        slide1.addShape(pptx.ShapeType.line, { x: 3, y: 3.2, w: 7, h: 0, line: { color: '1F4E78', width: 2 } });
        slide1.addText(`Found ${summaryData.length} Discrepancies Across ${new Set(summaryData.map(r => r.File)).size} Files`, { x: 0, y: 4, w: '100%', h: 1, fontSize: 18, italic: true, color: 'D9534F', align: 'center' });

        // --- Slide 2: Bar Chart (Count by File) ---
        let slide2 = pptx.addSlide();
        slide2.addText("Mismatches per File", { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 28, bold: true, color: '1F4E78' });

        const fileCounts = summaryData.reduce((acc, row) => {
            const name = (row.File || "Unknown").split(' ').slice(4, 6).join(' '); // ย่อชื่อไฟล์
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const chartData = [
            {
                name: "Mismatch Count",
                labels: Object.keys(fileCounts),
                values: Object.values(fileCounts)
            }
        ];

        slide2.addChart(pptx.ChartType.bar, chartData, {
            x: 0.5, y: 1.0, w: 12, h: 5.5,
            showTitle: false,
            barDir: 'col',
            chartColors: ['1F4E78', 'E15759'],
            dataLabelFontSize: 14,
            showValue: true,
            valAxisLabelFontSize: 12,
            catAxisLabelFontSize: 12
        });

        // --- Slide 3: Pie Chart (By Question Category) ---
        let slide3 = pptx.addSlide();
        slide3.addText("Discrepancies by Question Group", { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 28, bold: true, color: '1F4E78' });

        const qGroups = summaryData.reduce((acc, row) => {
            const sheet = row['Sheet (เธ•เธฃเธงเธเธชเธญเธ)'] || "Other";
            const group = sheet.split('_')[0] || "Other"; // ดึงพวก Q7, Q20
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {});

        const pieData = [
            {
                name: "Question Groups",
                labels: Object.keys(qGroups),
                values: Object.values(qGroups)
            }
        ];

        slide3.addChart(pptx.ChartType.pie, pieData, {
            x: 1, y: 1.2, w: 11, h: 5,
            showLegend: true,
            legendPos: 'r',
            showValue: true,
            showPercent: true,
            chartColors: ['1F4E78', '4E79A7', '76B7B2', '59A14F', 'EDC948', 'F28E2B', 'E15759'],
            dataLabelFontSize: 14,
            dataLabelColor: 'FFFFFF'
        });

        // --- Slide 4: Detailed Summary Table ---
        let slide4 = pptx.addSlide();
        slide4.addText("Detailed Issues (First 15 items)", { x: 0.5, y: 0.2, w: 12, h: 0.5, fontSize: 22, bold: true, color: '1F4E78' });

        const detailTable = [
            ["File Info", "Ref Sheet", "Check Sheet", "Diff", "Status"].map(h => ({ text: h, options: { bold: true, fill: '1F4E78', color: 'FFFFFF', align: 'center' } }))
        ];

        summaryData.slice(0, 15).forEach(row => {
            const shortFile = (row.File || "").split(' ').slice(4, 7).join(' ');
            detailTable.push([
                shortFile,
                row['Sheet (เธญเนเธฒเธเธญเธดเธ)'] || "-",
                row['Sheet (เธ•เธฃเธงเธเธชเธญเธ)'] || "-",
                { text: (row['เธเธฅเธ•เนเธฒเธ'] || "0").toString(), options: { color: 'D9534F', bold: true, align: 'center' } },
                "Mismatch"
            ]);
        });

        slide4.addTable(detailTable, {
            x: 0.2, y: 1.0, w: 12.9,
            fontSize: 10,
            colW: [4, 2, 4, 1.5, 1.4],
            border: { pt: 0.5, color: 'CCCCCC' },
            valign: 'middle'
        });

        // Finalize
        const fileName = "../Beautiful_Dashboard_69040.pptx";
        await pptx.writeFile({ fileName });
        console.log(`Successfully created visual dashboard: ${fileName}`);

    } catch (err) {
        console.error("Dashboard creation failed:", err);
    }
}

run();
