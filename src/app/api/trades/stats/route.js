import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trades/stats - Get trading statistics
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const currency = searchParams.get('currency') || 'USD';

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const uId = parseInt(userId);
        const currencyFilter = currency;

        // 1. Calculate Trade PnL
        const tradeAgg = await prisma.trade.aggregate({
            where: {
                userId: uId,
                status: 'CLOSED',
                currency: currencyFilter
            },
            _sum: { pnl: true },
            _count: { pnl: true }
        });

        // 2. Win Rate & Profit Factor
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

        // 3. Deposits/Withdrawals
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
            : (grossProfit._sum.pnl > 0 ? 999 : 0);

        return NextResponse.json({
            currency: currencyFilter,
            balance: currentBalance,
            winRate: winRate,
            profitFactor: profitFactor,
            totalTrades: tradeAgg._count.pnl
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
