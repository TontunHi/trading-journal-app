const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth, format } = require('date-fns');
const prisma = new PrismaClient();

// GET /api/calendar/summary
// Query: userId, month (YYYY-MM), currency (USD/USC)
router.get('/summary', async (req, res) => {
    try {
        const { userId, month, currency } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        const date = month ? new Date(month) : new Date();
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        // Fetch Trades in this month
        const trades = await prisma.trade.findMany({
            where: {
                userId: parseInt(userId),
                currency: currency || 'USD',
                status: 'CLOSED',
                updatedAt: { // Using updatedAt as close date approx, or we should strictly use a 'closedAt' field
                    gte: start,
                    lte: end
                }
            }
        });

        // Group Trades by Date
        const tradeSummary = {};
        trades.forEach(trade => {
            const day = format(new Date(trade.updatedAt), 'yyyy-MM-dd');
            if (!tradeSummary[day]) tradeSummary[day] = 0;
            tradeSummary[day] += (trade.pnl || 0);
        });

        // Fetch Manual Daily Summaries (Deposits/Withdrawals/Manual PnL)
        const dailySummaries = await prisma.dailySummary.findMany({
            where: {
                userId: parseInt(userId),
                currency_type: currency || 'USD',
                date: {
                    gte: start,
                    lte: end
                }
            }
        });

        // Merge Data
        const mergedData = {};

        // Init with trade data
        for (const [day, pnl] of Object.entries(tradeSummary)) {
            mergedData[day] = {
                pnl: pnl,
                deposit: 0,
                withdrawal: 0
            };
        }

        // Merge manual data
        dailySummaries.forEach(ds => {
            const day = format(new Date(ds.date), 'yyyy-MM-dd');
            if (!mergedData[day]) {
                mergedData[day] = { pnl: 0, deposit: 0, withdrawal: 0 };
            }
            if (ds.manual_pnl) mergedData[day].pnl += ds.manual_pnl; // Add manual PnL if any
            mergedData[day].deposit += ds.deposit;
            mergedData[day].withdrawal += ds.withdrawal;
        });

        res.json(mergedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/calendar/daily-summary
// Update or Create Daily Summary
router.post('/daily-summary', async (req, res) => {
    try {
        const { userId, date, deposit, withdrawal, manual_pnl, currency } = req.body;

        // Upsert
        const summary = await prisma.dailySummary.upsert({
            where: {
                userId_date_currency_type: {
                    userId: parseInt(userId),
                    date: new Date(date),
                    currency_type: currency || 'USD'
                }
            },
            update: {
                deposit: parseFloat(deposit || 0),
                withdrawal: parseFloat(withdrawal || 0),
                manual_pnl: parseFloat(manual_pnl || 0)
            },
            create: {
                userId: parseInt(userId),
                date: new Date(date),
                currency_type: currency || 'USD',
                deposit: parseFloat(deposit || 0),
                withdrawal: parseFloat(withdrawal || 0),
                manual_pnl: parseFloat(manual_pnl || 0)
            }
        });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
