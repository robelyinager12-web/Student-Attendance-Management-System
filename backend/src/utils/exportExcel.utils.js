const ExcelJS = require('exceljs');

async function generateAttendanceExcel(res, { title, headers, rows }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.substring(0, 31)); // Excel sheet name limit

  sheet.addRow(headers).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  sheet.columns.forEach((column) => {
    column.width = 20;
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generateAttendanceExcel };