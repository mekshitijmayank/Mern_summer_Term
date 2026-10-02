const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Support a shared root .env for local development.
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Route files
const auth = require('./routes/auth.routes');
const properties = require('./routes/property.routes');
const agents = require('./routes/agent.routes');
const inquiries = require('./routes/inquiry.routes');
const favorites = require('./routes/favorite.routes');
const admin = require('./routes/admin.routes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Set up public folder for static upload fallbacks
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const { createInquiry } = require('./controllers/inquiry.controller');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/agents', agents);
app.use('/api/inquiries', inquiries);
app.use('/api/favorites', favorites);
app.use('/api/admin', admin);
app.post('/api/contact', createInquiry);

// Base route checker
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the GharFind API Service' });
});

// Mount error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

let server;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'default_dev_jwt_secret_key_12345';
  }

  // Attempt DB connection in background without blocking server startup
  connectDB().catch((err) => {
    console.warn(`MongoDB Connection Warning: ${err.message}`);
  });

  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(`Server startup failed: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
