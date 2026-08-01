const { Parser } = require('json2csv');

function generateAttendanceCsv(res, { title, headers, rows }) {
  const data = rows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });

  const parser = new Parser({ fields: headers });
  const csv = parser.parse(data);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.csv"`);
  res.send(csv);
}

module.exports = { generateAttendanceCsv };