// backend/src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const balanceRoutes = require('./routes/balanceRoutes');

// โหลดค่า Config
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend (Next.js) เรียกใช้งานได้
app.use(express.json()); // อ่านข้อมูล JSON ที่ส่งมาได้
app.use(express.urlencoded({ extended: true })); // อ่านข้อมูลจาก Form ได้

//เรียกใช้ Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/balance', balanceRoutes);

// Static Folder สำหรับรูปภาพ (localhost:5000/uploads/...)
app.use('/uploads', express.static('public/uploads'));

// Test Route (หน้าแรก)
app.get('/', (req, res) => {
    res.send('Trading Journal API is running...');
});

// Test Database Connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ 
            status: 'success', 
            message: 'Database connected successfully!', 
            result: rows[0].solution 
        });
    } catch (error) {
        console.error('Database Connection Error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to connect to database', 
            error: error.message 
        });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`🌐 Test DB connection at http://localhost:${port}/test-db`);
});