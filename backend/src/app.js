const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

// ---- Core Middleware ----
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Static Files (profile images) ----
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---- Health Check ----
app.get('/', (req, res) => {
  res.json({ message: 'Student Attendance Management System API is running' });
});

// ---- Rate Limiter (applied to all /api routes) ----
app.use('/api', apiLimiter);

// ---- All API Routes (mounted once through index) ----
app.use('/api', require('./routes/index'));

// ---- 404 & Error Handlers (always last) ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;