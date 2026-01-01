const db = require('../config/database');

exports.addLog = async (req, res) => {
    try {
        // รับ currency เพิ่ม
        const { type, amount, currency, log_date, note } = req.body;
        const userId = req.user.id;

        // เพิ่ม currency ใน SQL Insert
        await db.query(
            `INSERT INTO balance_logs (user_id, type, amount, currency, log_date, note) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, type, amount, currency || 'USD', log_date, note]
        );

        res.status(201).json({ message: 'บันทึกรายการสำเร็จ' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.query(
            `SELECT * FROM balance_logs WHERE user_id = ? ORDER BY log_date DESC`, 
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }
};