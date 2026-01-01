const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ message: 'ไม่มีสิทธิ์เข้าถึง (No Token)' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ฝังข้อมูล user ลงใน req
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
};