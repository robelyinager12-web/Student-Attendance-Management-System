require('dotenv').config();
const app = require('./src/app');
const syncDatabase = require('./src/utils/syncDatabase');

const PORT = process.env.PORT || 5000;

async function start() {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();