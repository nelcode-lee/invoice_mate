const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const clientRoutes = require('./routes/clients');
const invoiceRoutes = require('./routes/invoices');
const expenseRoutes = require('./routes/expenses');
const settingRoutes = require('./routes/settings');
// const subscriptionRoutes = require('./routes/subscriptions');
const mtdRoutes = require('./routes/mtd');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/mtd', mtdRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - fixed pattern
app.use('/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 UK Invoice App API running on port ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://0.0.0.0:${PORT}/api/auth`);
  console.log(`🏢 Company endpoints: http://0.0.0.0:${PORT}/api/companies`);
  console.log(`👥 Client endpoints: http://0.0.0.0:${PORT}/api/clients`);
  console.log(`📄 Invoice endpoints: http://0.0.0.0:${PORT}/api/invoices`);
  console.log(`💰 Expense endpoints: http://0.0.0.0:${PORT}/api/expenses`);
  console.log(`⚙️ Settings endpoints: http://0.0.0.0:${PORT}/api/settings`);
  console.log(`🌐 Accessible from: http://192.168.1.182:${PORT}`);
}); 