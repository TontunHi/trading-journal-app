import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trades - Get all trades for a user
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
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
            };
        }

        const trades = await prisma.trade.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(trades);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/trades - Create a new trade
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, asset, currency, timeframe, session, type, entry_price, tp, sl, lot_size, notes } = body;

        const newTrade = await prisma.trade.create({
            data: {
                userId: parseInt(userId),
                asset,
                currency: currency || 'USD',
                timeframe,
                session,
                type,
                entry_price: parseFloat(entry_price),
                tp: tp ? parseFloat(tp) : null,
                sl: sl ? parseFloat(sl) : null,
                lot_size: parseFloat(lot_size),
                notes
                // No images_path - feature removed
            }
        });

        return NextResponse.json(newTrade, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
