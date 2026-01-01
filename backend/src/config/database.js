const mysql = require('mysql2');
const dotenv = require('dotenv');

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// แปลงเป็น Promise เพื่อให้ใช้ Async/Await ได้ง่ายๆ
const db = pool.promise();

module.exports = db;