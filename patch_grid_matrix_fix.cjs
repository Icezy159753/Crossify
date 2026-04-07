const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const correctGridMatrixCode = `
      function buildGridMatrix(origResult, varObj, dataset, overrides) {
        if (!varObj || !varObj.isGridUserCreated || !varObj.gridMembers) return null;
        var members = varObj.gridMembers;
        var ov = overrides[varObj.name] || {};
        var labels = ov.labels || varObj.valueLabels || {};
        var scaleCodes = Array.isArray(ov.order) ? ov.order.slice() : Object.keys(labels);
        var filteredScale = cxFilterOutSummaryCodes(scaleCodes);

        var colValues = members.map(m => m.label || m.name);
        var rowValues = filteredScale;
        var grandTotal = dataset.cases.length; 
        
        var countsMap = {};
        rowValues.forEach(code => {
           countsMap[code] = {};
           colValues.forEach(c => { countsMap[code][c] = 0; });
        });
        
        dataset.cases.forEach(c => {
           members.forEach((m, cIdx) => {
              var v = c[m.name];
              if (v == null || v === '') return;
              var k = String(v);
              var colKey = colValues[cIdx];
              if (countsMap[k] && countsMap[k][colKey] !== undefined) {
                 countsMap[k][colKey]++;
              }
           });
        });

        var colTotalsN = [];
        members.forEach((m, cIdx) => {
           var colTot = 0;
           dataset.cases.forEach(c => {
              var v = c[m.name];
              if (v != null && v !== '') colTot++;
           });
           colTotalsN.push(colTot);
        });

        var rowTotalsN = rowValues.map(code => {
            return colValues.reduce((sum, col) => sum + countsMap[code][col], 0);
        });

        var counts = rowValues.map(code => {
            return colValues.map(col => countsMap[code][col]);
        });
        
        // If they ask for TOP, we compute Top 2 Box etc., but for now basic.
        // We will just supply a standard CrosstabResult object:

        var res = {
           rowVar: varObj.name,
           colVar: '',
           rowLabel: "Scale: " + (varObj.label || varObj.name),
           colLabel: "Attributes (Members)",
           rowValues: rowValues,
           colValues: colValues,
           rowTypes: rowValues.map(r => 'data'),
           rowLevelLabels: ["Scale"],
           colLevelLabels: ["Attributes"],
           rowPaths: rowValues.map((v) => {
              // try to map label
              return [labels[v] || v];
           }),
           colPaths: colValues.map(v => [v]),
           counts: counts,
           rowTotalsN: rowTotalsN,
           colTotalsN: colTotalsN,
           grandTotal: grandTotal,
           __cxGridMatrix: true,
           __cxAugmented: true
        };
        
        // Emulate summary rows if ov.order has Top 2 Box etc.
        var fullOrder = Array.isArray(ov.order) ? ov.order.slice() : [];
        if (fullOrder.length > rowValues.length) {
          // there are summary codes like T2B, B2B, Mean
          var extendedRowValues = [];
          var extendedRowPaths = [];
          var extendedRowTypes = [];
          var extendedCounts = [];
          var extendedRowTotalsN = [];
          
          fullOrder.forEach(code => {
            var rawCode = String(code).trim().toLowerCase();
            if (!isSummaryKey(rawCode)) {
                var idx = rowValues.indexOf(code);
                if (idx !== -1) {
                  extendedRowValues.push(code);
                  extendedRowPaths.push([labels[code] || code]);
                  extendedRowTypes.push('data');
                  extendedCounts.push(counts[idx]);
                  extendedRowTotalsN.push(rowTotalsN[idx]);
                }
                return;
            }
            
            // It's a summary code (Mean, Top 2 Box...)
            extendedRowValues.push(code);
            var slb1 = labels[code] || (rawCode==='mean'?'Mean':rawCode==='t2b'?'Top 2 Box':rawCode==='t3b'?'Top 3 Box':rawCode==='b2b'?'Bottom 2 Box':code);
            extendedRowPaths.push([slb1]);
            extendedRowTypes.push(rawCode === 'mean' ? 'stat' : 'summary');
            
            var sumCnts = colValues.map(c => 0);
            var sumTotN = 0;
            
            if (rawCode === 'mean') {
               // calculate mean per col
               colValues.forEach((cVal, cIdx) => {
                  var sum = 0, cc = 0;
                  var mName = members[cIdx].name;
                  dataset.cases.forEach(c => {
                     var v = c[mName];
                     if (v != null && v !== '') {
                        var n = Number(v);
                        if (!isNaN(n)) { sum += n; cc++; }
                     }
                  });
                  sumCnts[cIdx] = cc > 0 ? (sum / cc) : 0;
               });
               // total mean
               var tS = 0, tC = 0;
               members.forEach(m => {
                  dataset.cases.forEach(c => {
                     var v = c[m.name];
                     if (v != null && v !== '') { var n = Number(v); if (!isNaN(n)) { tS += n; tC++; } }
                  });
               });
               sumTotN = tC > 0 ? (tS / tC) : 0;
            } else {
               // target codes (e.g. 4,5 for T2B)
               var targetCodes = cxResolveSummaryGroup(rawCode, scaleCodes) || [];
               colValues.forEach((cVal, cIdx) => {
                  var mName = members[cIdx].name;
                  var c=0;
                  dataset.cases.forEach(row => {
                     var v = row[mName];
                     if (v != null && v !== '' && targetCodes.includes(String(v))) c++;
                  });
                  sumCnts[cIdx] = c;
               });
               sumTotN = sumCnts.reduce((a,b)=>a+b, 0);
            }
            
            extendedCounts.push(sumCnts);
            extendedRowTotalsN.push(sumTotN);
          });
          
          res.rowValues = extendedRowValues;
          res.rowPaths = extendedRowPaths;
          res.rowTypes = extendedRowTypes;
          res.counts = extendedCounts;
          res.rowTotalsN = extendedRowTotalsN;
        }

        return res;
      }
`;

html = html.replace(/function buildGridMatrix[\s\S]*?res\.__cxAugmented = true;\n        return res;\n      }/, correctGridMatrixCode.trim());

fs.writeFileSync(file, html, 'utf8');
console.log('Fixed matrix format.');
