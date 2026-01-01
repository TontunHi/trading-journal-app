const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// ตั้งค่าให้รับรูปได้หลายรูป (Before และ After)
const tradeUpload = upload.fields([
    { name: 'image_before', maxCount: 1 }, 
    { name: 'image_after', maxCount: 1 }
]);

// POST /api/trades (ต้อง Login + อัปรูปได้)
router.post('/', auth, tradeUpload, tradeController.createTrade);

// GET /api/trades (ดึงรายการเทรดตัวเอง)
router.get('/', auth, tradeController.getMyTrades);
// GET /api/trades/:id (ดึงรายละเอียด 1 ออเดอร์)
router.get('/:id', auth, tradeController.getTradeById);
// PUT /api/trades/:id (อัปเดต/ปิดออเดอร์ - รองรับอัปรูปด้วย)
router.put('/:id', auth, tradeUpload, tradeController.updateTrade);


module.exports = router;