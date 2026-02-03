import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/calendar/daily-summary - Upsert daily summary
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, date, deposit, withdrawal, manual_pnl, currency } = body;

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

        return NextResponse.json(summary);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
