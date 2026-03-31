const excelModule = await import('./exceljs-BMcsBZ_F.js');
const loadExcelJs = excelModule && typeof excelModule.r === 'function' ? excelModule.r : null;
const exceljs = loadExcelJs ? loadExcelJs() : excelModule;
const shim = { default: exceljs };

export const e = shim;
export default shim;