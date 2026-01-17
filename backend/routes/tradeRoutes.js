const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/trades/stats
router.get('/stats', async (req, res) => {
    try {
        const { userId, currency } = req.query; // Add currency param
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const uId = parseInt(userId);
        const currencyFilter = currency || "USD"; // Default to USD if not specified

        // 1. Calculate Trade PnL (Filtered by Currency)
        const tradeAgg = await prisma.trade.aggregate({
            where: {
                userId: uId,
                status: 'CLOSED',
                currency: currencyFilter
            },
            _sum: { pnl: true },
            _count: { pnl: true }
        });

        // 2. Win Rate & Profit Factor (Filtered by Currency)
        const wins = await prisma.trade.count({
            where: { userId: uId, status: 'CLOSED', pnl: { gt: 0 }, currency: currencyFilter }
        });
        const losses = await prisma.trade.count({
            where: { userId: uId, status: 'CLOSED', pnl: { lte: 0 }, currency: currencyFilter }
        });

        const grossProfit = await prisma.trade.aggregate({
            where: { userId: uId, status: 'CLOSED', pnl: { gt: 0 }, currency: currencyFilter },
            _sum: { pnl: true }
        });
        const grossLoss = await prisma.trade.aggregate({
            where: { userId: uId, status: 'CLOSED', pnl: { lt: 0 }, currency: currencyFilter },
            _sum: { pnl: true }
        });

        // 3. Deposits/Withdrawals (Filtered by Currency)
        const moneyAgg = await prisma.dailySummary.aggregate({
            where: {
                userId: uId,
                currency_type: currencyFilter
            },
            _sum: { deposit: true, withdrawal: true, manual_pnl: true }
        });

        const totalTradePnL = tradeAgg._sum.pnl || 0;
        const totalManualPnL = moneyAgg._sum.manual_pnl || 0;
        const totalDeposit = moneyAgg._sum.deposit || 0;
        const totalWithdrawal = moneyAgg._sum.withdrawal || 0;

        const currentBalance = totalDeposit - totalWithdrawal + totalTradePnL + totalManualPnL;
        const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
        const profitFactor = (grossLoss._sum.pnl && Math.abs(grossLoss._sum.pnl) > 0)
            ? (grossProfit._sum.pnl || 0) / Math.abs(grossLoss._sum.pnl)
            : (grossProfit._sum.pnl > 0 ? 999 : 0); // Handle div by 0

        res.json({
            currency: currencyFilter,
            balance: currentBalance,
            winRate: winRate,
            profitFactor: profitFactor,
            totalTrades: tradeAgg._count.pnl
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/trades
// Supports query params: userId (required), status, asset, date (YYYY-MM-DD)
router.get('/', async (req, res) => {
    try {
        const { userId, status, date } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const where = { userId: parseInt(userId) };
        if (status) where.status = status;

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.createdAt = {
                gte: startOfDay,
                lte: endOfDay
            }
        }

        const trades = await prisma.trade.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/trades
router.post('/', async (req, res) => {
    try {
        const { userId, asset, currency, timeframe, session, type, entry_price, tp, sl, lot_size, notes, images_path } = req.body;

        const newTrade = await prisma.trade.create({
            data: {
                userId: parseInt(userId),
                asset,
                currency,
                timeframe,
                session,
                type,
                entry_price: parseFloat(entry_price),
                tp: tp ? parseFloat(tp) : null,
                sl: sl ? parseFloat(sl) : null,
                lot_size: parseFloat(lot_size),
                notes,
                images_path,
                // defaults: status=OPEN
            }
        });
        res.status(201).json(newTrade);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/trades/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Handle numeric conversions if necessary
        // Handle numeric conversions
        const floatFields = ['entry_price', 'exit_price', 'pnl', 'lot_size', 'tp', 'sl'];
        floatFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (updateData[field] === "" || updateData[field] === null) {
                    // entry_price and lot_size are required, so only set null for others
                    if (field === 'entry_price' || field === 'lot_size') {
                        // If required field is somehow cleared, we might want to throw error or just let it fail/keep old value? 
                        // Better to keep it if it's valid, but if it is "", parse it. 
                        // Actually, if it is "", parseFloat is NaN. 
                        // Let's assume frontend validation prevents empty required fields, 
                        // but for safety, if "", delete the key so it doesn't update (since this uses PATCH-like semantics)
                        delete updateData[field];
                    } else {
                        updateData[field] = null;
                    }
                } else {
                    const val = parseFloat(updateData[field]);
                    if (!isNaN(val)) updateData[field] = val;
                }
            }
        });

        const updatedTrade = await prisma.trade.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json(updatedTrade);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/trades/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.trade.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Trade deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
