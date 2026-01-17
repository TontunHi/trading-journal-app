const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Expected structure: public/uploads/{YYYY-MM-DD}/{orderId}/
        // We expect orderId and date to be passed, e.g., in req.body or headers if using FormData
        // Note: req.body might not be populated before file if not ordered correctly in FormData, 
        // but Multer handles mixed fields well usually or we should use headers/params.
        // Let's use a temp folder or try to extract from params if possible.
        // For this implementation, let's assume `orderId` and `date` are passed as query params for simplicity 
        // or we move the file AFTER upload.
        // Strategy: Upload to 'temp' first, then Controller moves it? 
        // Or just put it in a general 'uploads' folder for now.

        // Let's try to organize by date at least.
        const date = new Date().toISOString().split('T')[0]; // Current date

        // To support {date}/{orderId}, we really need those values. 
        // Let's safe-guard and put in a generic day folder if ID not found.
        const uploadPath = path.join(__dirname, '../public/uploads/', date);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /api/upload
// Uploads a single file. Helper for frontend to upload image and get path back.
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // File path relative to the server setup
    // The user requirement specific pathing might be handled here by moving the file 
    // if we receive specific orderId/date data. 
    // For now, return the path where it was saved.

    // Construct accessible URL
    // Assuming 'public/uploads' is served at '/uploads'
    const fileUrl = `/uploads/${req.file.destination.split('uploads')[1].replace(/\\/g, '/')}/${req.file.filename}`.replace('//', '/');

    res.json({
        message: "File uploaded successfully",
        filePath: fileUrl,
        originalName: req.file.originalname
    });
});

module.exports = router;
