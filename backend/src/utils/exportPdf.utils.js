const PDFDocument = require('pdfkit');

function generateAttendancePdf(res, { title, headers, rows }) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  doc.pipe(res);

  doc.fontSize(16).text(title, { align: 'center' });
  doc.moveDown();

  const colWidth = 500 / headers.length;
  let y = doc.y;

  doc.fontSize(10).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, 30 + i * colWidth, y, { width: colWidth });
  });

  doc.moveDown();
  doc.font('Helvetica');

  rows.forEach((row) => {
    y = doc.y;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), 30 + i * colWidth, y, { width: colWidth });
    });
    doc.moveDown();
  });

  doc.end();
}

module.exports = { generateAttendancePdf };