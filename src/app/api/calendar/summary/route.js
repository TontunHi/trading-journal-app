import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import prisma from '@/lib/prisma';

// GET /api/calendar/summary - Get calendar summary for a month
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const month = searchParams.get('month');
        const currency = searchParams.get('currency') || 'USD';

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const date = month ? new Date(month) : new Date();
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        // Fetch Trades in this month
        const trades = await prisma.trade.findMany({
            where: {
                userId: parseInt(userId),
                currency: currency,
                status: 'CLOSED',
                updatedAt: {
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

        // Fetch Manual Daily Summaries
        const dailySummaries = await prisma.dailySummary.findMany({
            where: {
                userId: parseInt(userId),
                currency_type: currency,
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
            if (ds.manual_pnl) mergedData[day].pnl += ds.manual_pnl;
            mergedData[day].deposit += ds.deposit;
            mergedData[day].withdrawal += ds.withdrawal;
        });

        return NextResponse.json(mergedData);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
