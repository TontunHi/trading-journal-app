const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// ฟังก์ชันสมัครสมาชิก
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. ตรวจสอบว่ามี Email นี้ในระบบหรือยัง
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email นี้ถูกใช้งานแล้ว' });
        }

        // 2. เข้ารหัสรหัสผ่าน (Hash Password)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. บันทึกลงฐานข้อมูล
        await User.create({
            username,
            email,
            password_hash: passwordHash
        });

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
    }
};

// ฟังก์ชันเข้าสู่ระบบ
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. ค้นหา User จาก Email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 2. ตรวจสอบรหัสผ่าน (Compare Hash)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 3. สร้าง JWT Token (บัตรผ่าน)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token อายุ 1 วัน
        );

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
    }
};