const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const hpp = require('hpp');

const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { securityScan } = require('./utils/securityCheck');

const app = express();

// ---- Security Headers (helmet) ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ---- CORS ----
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---- Request Logging ----
app.use(morgan('dev'));

// ---- Body Parsing ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---- Prevent HTTP Parameter Pollution ----
app.use(hpp());
// ---- Security Scan (SQL injection + XSS detection) ----
app.use(securityScan);

// ---- Serve Uploaded Files ----
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---- Health Check ----
app.get('/', (req, res) => {
  res.json({
    message: 'Student Attendance Management System API is running',
    version: '1.0.0',
    status: 'healthy',
  });
});

// ---- Rate Limit all /api routes ----
app.use('/api', apiLimiter);

// ---- All Routes ----
app.use('/api', require('./routes/index'));

// ---- 404 & Error Handlers ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;