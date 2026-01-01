const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // เก็บใน folder นี้
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่: userID_timestamp_random.jpg ป้องกันชื่อซ้ำ
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// กรองเฉพาะไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาด 5MB
    fileFilter: fileFilter
});

module.exports = upload;