require('dotenv').config();
const app = require('./src/app');
const syncDatabase = require('./src/utils/syncDatabase');

const PORT = process.env.PORT || 5000;

async function start() {
  await syncDatabase();

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
      console.error(`Run this command to fix it: taskkill /F /IM node.exe`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

start();