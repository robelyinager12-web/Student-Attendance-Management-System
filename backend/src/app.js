const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Student Attendance Management System API is running' });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;