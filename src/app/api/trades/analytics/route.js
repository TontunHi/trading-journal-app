import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const period = searchParams.get('period') || 'month';
        const currency = searchParams.get('currency') || 'USD';
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        if (!userId) {
            return NextResponse.json({ 
                chartData: [],
                summary: {
                    totalTrades: 0, winners: 0, losers: 0, winRate: '0.0',
                    totalPnl: '0.00', profitFactor: '0.00', avgWin: '0.00',
                    avgLoss: '0.00', bestTrade: '0.00', worstTrade: '0.00'
                }
            });
        }

        const now = new Date();
        let startDate, endDate = now;
        
        // If custom date range is provided
        if (startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Use preset periods
            switch (period) {
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date(now);
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date(now);
                    startDate.setMonth(now.getMonth() - 1);
            }
        }

        // Get all closed trades within period
        const trades = await prisma.trade.findMany({
            where: {
                userId: parseInt(userId),
                status: 'CLOSED',
                currency: currency,
                createdAt: { 
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                pnl: true,
                createdAt: true,
                type: true,
                asset: true
            }
        });

        // If no trades, return empty data
        if (trades.length === 0) {
            return NextResponse.json({
                period,
                currency,
                chartData: [],
                summary: {
                    totalTrades: 0, winners: 0, losers: 0, winRate: '0.0',
                    totalPnl: '0.00', profitFactor: '0.00', avgWin: '0.00',
                    avgLoss: '0.00', bestTrade: '0.00', worstTrade: '0.00'
                }
            });
        }

        // Calculate cumulative P/L for chart
        let cumulativePnl = 0;
        const chartData = trades.map(trade => {
            cumulativePnl += parseFloat(trade.pnl || 0);
            return {
                date: trade.createdAt.toISOString().split('T')[0],
                pnl: parseFloat(trade.pnl || 0),
                cumulative: cumulativePnl,
                type: trade.type,
                asset: trade.asset
            };
        });

        // Aggregate by date for cleaner chart
        const aggregatedData = chartData.reduce((acc, item) => {
            const existing = acc.find(d => d.date === item.date);
            if (existing) {
                existing.pnl += item.pnl;
                existing.cumulative = item.cumulative;
                existing.trades = (existing.trades || 1) + 1;
            } else {
                acc.push({ ...item, trades: 1 });
            }
            return acc;
        }, []);

        // Stats summary
        const totalPnl = trades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const winners = trades.filter(t => parseFloat(t.pnl || 0) > 0);
        const losers = trades.filter(t => parseFloat(t.pnl || 0) < 0);
        const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0;
        
        const grossProfit = winners.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const grossLoss = Math.abs(losers.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

        const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
        const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;

        // Best/Worst trade
        const bestTrade = trades.reduce((best, t) => 
            parseFloat(t.pnl || 0) > parseFloat(best?.pnl || -Infinity) ? t : best, trades[0]);
        const worstTrade = trades.reduce((worst, t) => 
            parseFloat(t.pnl || 0) < parseFloat(worst?.pnl || Infinity) ? t : worst, trades[0]);

        return NextResponse.json({
            period,
            currency,
            chartData: aggregatedData,
            summary: {
                totalTrades: trades.length,
                winners: winners.length,
                losers: losers.length,
                winRate: winRate.toFixed(1),
                totalPnl: totalPnl.toFixed(2),
                profitFactor: isFinite(profitFactor) ? profitFactor.toFixed(2) : 'N/A',
                avgWin: avgWin.toFixed(2),
                avgLoss: avgLoss.toFixed(2),
                bestTrade: bestTrade ? parseFloat(bestTrade.pnl || 0).toFixed(2) : '0.00',
                worstTrade: worstTrade ? parseFloat(worstTrade.pnl || 0).toFixed(2) : '0.00'
            }
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            chartData: [],
            summary: {
                totalTrades: 0, winners: 0, losers: 0, winRate: '0.0',
                totalPnl: '0.00', profitFactor: '0.00', avgWin: '0.00',
                avgLoss: '0.00', bestTrade: '0.00', worstTrade: '0.00'
            }
        });
    }
}
