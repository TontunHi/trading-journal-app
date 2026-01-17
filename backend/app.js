const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static File Serving (for images)
// Images will be accessible at http://localhost:5000/uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// API Route Definitions
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Trading Journal API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
