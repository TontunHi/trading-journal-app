const db = require('../config/database');

const toDecimal = (value) => {
    if (value === '' || value === null || value === undefined || isNaN(value)) {
        return null;
    }
    return parseFloat(value);
};

exports.createTrade = async (req, res) => {
    // ใช้ Connection แยก เพื่อรองรับ Transaction (ถ้าบันทึกตารางไหนพลาด ให้ยกเลิกทั้งหมด)
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); // เริ่ม Transaction

        // 1. รับข้อมูลจาก Frontend (ผ่าน FormData)
        const data = req.body;
        const userId = req.user.id; // ได้มาจาก JWT Middleware

        // 2. Insert ลงตาราง trading_logs (ข้อมูลหลัก)
        const [logResult] = await connection.query(
            `INSERT INTO trading_logs 
            (user_id, pair, session, order_type, timeframe, bias_trend, entry_price, sl_price, tp_price, entry_date, lot_size, note) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                data.pair || 'XAUUSD', 
                data.session, 
                data.order_type, 
                data.timeframe, 
                data.bias_trend, 
                data.entry_price, 
                data.sl_price, 
                data.tp_price, 
                data.entry_date, 
                data.lot_size, 
                data.note
            ]
        );
        
        const logId = logResult.insertId; // ได้ ID ของออเดอร์ที่เพิ่งสร้าง

        // 3. Insert ลงตาราง trade_checklists (เงื่อนไข TKT SMC)
        await connection.query(
            `INSERT INTO trade_checklists 
            (log_id, is_structure_valid, is_bias_correct, pd_zone, key_level_type, is_kill_zone, is_liquidity_sweep, pa_pattern, is_volume_spike) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                logId,
                data.is_structure_valid === 'true', // แปลง String เป็น Boolean
                data.is_bias_correct === 'true',
                data.pd_zone,
                data.key_level_type,
                data.is_kill_zone === 'true',
                data.is_liquidity_sweep === 'true',
                data.pa_pattern,
                data.is_volume_spike === 'true'
            ]
        );

        // 4. Insert ลงตาราง trade_images (ถ้ามีรูปภาพ)
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => {
                // ระบุประเภทรูป: ถ้าชื่อ field คือ image_before ให้เป็น BEFORE
                const type = file.fieldname === 'image_before' ? 'BEFORE' : 'AFTER';
                const filePath = '/uploads/' + file.filename;
                
                return connection.query(
                    `INSERT INTO trade_images (log_id, image_type, file_path) VALUES (?, ?, ?)`,
                    [logId, type, filePath]
                );
            });
            await Promise.all(imagePromises);
        }

        await connection.commit(); // ยืนยันการบันทึก
        res.status(201).json({ message: 'บันทึกออเดอร์สำเร็จ!', tradeId: logId });

    } catch (error) {
        await connection.rollback(); // ย้อนกลับถ้ามี Error
        console.error('Create Trade Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
        connection.release(); // คืน Connection
    }
};

exports.getMyTrades = async (req, res) => {
    try {
        const userId = req.user.id;
        // ดึงข้อมูลเบื้องต้นไปโชว์ Dashboard
        const [rows] = await db.query(
            `SELECT * FROM trading_logs WHERE user_id = ? ORDER BY entry_date DESC`, 
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }
};

// ฟังก์ชันดึงออเดอร์เดียว (สำหรับหน้า Detail)
exports.getTradeById = async (req, res) => {
    try {
        const userId = req.user.id;
        const tradeId = req.params.id;

        // ดึงข้อมูล Logs + Checklist
        const [rows] = await db.query(`
            SELECT t.*, 
                   c.is_structure_valid, c.is_bias_correct, c.pd_zone, c.key_level_type, 
                   c.is_kill_zone, c.is_liquidity_sweep, c.pa_pattern, c.is_volume_spike
            FROM trading_logs t
            LEFT JOIN trade_checklists c ON t.id = c.log_id
            WHERE t.id = ? AND t.user_id = ?
        `, [tradeId, userId]);

        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบออเดอร์นี้' });

        // ดึงรูปภาพ
        const [images] = await db.query(`SELECT image_type, file_path FROM trade_images WHERE log_id = ?`, [tradeId]);
        
        const trade = rows[0];
        trade.images = images; // ยัดรูปภาพเข้าไปใน Object

        res.json(trade);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }
};

// ฟังก์ชันอัปเดตออเดอร์ (ปิดออเดอร์ / แก้ไข Note / เพิ่มรูป After)
exports.updateTrade = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const tradeId = req.params.id;
        const userId = req.user.id;
        const data = req.body;

        // 1. ตรวจสอบความเป็นเจ้าของ
        const [check] = await connection.query('SELECT id FROM trading_logs WHERE id = ? AND user_id = ?', [tradeId, userId]);
        if (check.length === 0) return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขออเดอร์นี้' });

        // 2. อัปเดตข้อมูลใน trading_logs
        // รองรับการแก้ Status, ราคาปิด, P/L, และ Note
        await connection.query(`
            UPDATE trading_logs 
            SET status = ?, 
                exit_price = ?, 
                p_l_amount = ?, 
                p_l_percent = ?, 
                exit_date = ?, 
                note = ?
            WHERE id = ?
        `, [
            data.status, 
            toDecimal(data.exit_price),
            toDecimal(data.p_l_amount),
            toDecimal(data.p_l_percent),
            data.exit_date ? new Date(data.exit_date) : new Date(), 
            data.note,
            tradeId
        ]);

        // 3. ถ้ามีการอัปรูป After มาใหม่ ให้บันทึกเพิ่ม
        if (req.files && req.files['image_after']) {
            const file = req.files['image_after'][0];
            const filePath = '/uploads/' + file.filename;
            
            // ลบรูป After เก่าออกก่อน (ถ้าต้องการ) หรือจะ Insert ทับ/เพิ่ม ก็แล้วแต่ Logic
            // ในที่นี้ขอใช้วิธีลบของเก่าที่เป็น type AFTER ออกก่อนเพื่อกันซ้ำ
            await connection.query('DELETE FROM trade_images WHERE log_id = ? AND image_type = "AFTER"', [tradeId]);

            await connection.query(
                `INSERT INTO trade_images (log_id, image_type, file_path) VALUES (?, ?, ?)`,
                [tradeId, 'AFTER', filePath]
            );
        }

        await connection.commit();
        res.json({ message: 'อัปเดตออเดอร์สำเร็จ' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'อัปเดตล้มเหลว' });
    } finally {
        connection.release();
    }
};