const db = require('../config/database');

const User = {
    // ฟังก์ชันสร้าง User ใหม่ (สำหรับ Register)
    create: async (userData) => {
        const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
        const [result] = await db.query(sql, [
            userData.username, 
            userData.email, 
            userData.password_hash
        ]);
        return result;
    },

    // ฟังก์ชันค้นหา User จาก Email (สำหรับ Login)
    findByEmail: async (email) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.query(sql, [email]);
        return rows[0]; // ส่งคืน User คนแรกที่เจอ (หรือ undefined ถ้าไม่เจอ)
    },

    // ฟังก์ชันค้นหา User จาก ID (เผื่อใช้ในอนาคต)
    findById: async (id) => {
        const sql = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }
};

module.exports = User;