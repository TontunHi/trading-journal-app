"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { 
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from 'date-fns';
import { th } from 'date-fns/locale'; 
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar as CalendarIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function CalendarPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [trades, setTrades] = useState([]);
    const [balanceLogs, setBalanceLogs] = useState([]);
    const [dailyData, setDailyData] = useState({}); 
    // เพิ่ม State deposit และ withdraw ใน monthlyStats
    const [monthlyStats, setMonthlyStats] = useState({ profit: 0, win: 0, loss: 0, count: 0, deposit: 0, withdraw: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tradesRes, balanceRes] = await Promise.all([
                api.get('/trades'),
                api.get('/balance')
            ]);
            setTrades(tradesRes.data);
            setBalanceLogs(balanceRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (trades.length === 0 && balanceLogs.length === 0) return;

        const currentMonthTrades = trades.filter(t => 
            isSameMonth(new Date(t.exit_date || t.entry_date), currentDate) && 
            t.status !== 'OPEN' && t.status !== 'CANCELLED'
        );

        // 1. คำนวณยอดรายวัน (Map Data)
        const map = {};

        trades.forEach(t => {
            if (t.status === 'OPEN' || t.status === 'CANCELLED' || !t.p_l_amount) return;
            const dateKey = format(new Date(t.exit_date || t.entry_date), 'yyyy-MM-dd');
            
            if (!map[dateKey]) map[dateKey] = { amount: 0, count: 0, deposit: 0, withdraw: 0 };
            
            map[dateKey].amount += parseFloat(t.p_l_amount);
            map[dateKey].count += 1;
        });

        balanceLogs.forEach(b => {
            const dateKey = format(new Date(b.log_date), 'yyyy-MM-dd');
            if (!map[dateKey]) map[dateKey] = { amount: 0, count: 0, deposit: 0, withdraw: 0 };

            let val = parseFloat(b.amount);
            if (b.currency === 'USC') val = val / 100;

            if (b.type === 'PROFIT') map[dateKey].amount += val;
            else if (b.type === 'LOSS') map[dateKey].amount -= val;
            else if (b.type === 'DEPOSIT') map[dateKey].deposit += val;
            else if (b.type === 'WITHDRAW') map[dateKey].withdraw += val;
        });

        setDailyData(map);

        // 2. สรุปยอดเดือนนี้ (Monthly Stats)
        let totalProfit = 0;
        let win = 0;
        let loss = 0;
        let totalDeposit = 0; // ตัวแปรเก็บยอดฝาก
        let totalWithdraw = 0; // ตัวแปรเก็บยอดถอน

        // รวม Trade
        currentMonthTrades.forEach(t => {
            const pl = parseFloat(t.p_l_amount);
            totalProfit += pl;
            if (pl > 0) win++;
            if (pl < 0) loss++;
        });

        // รวม Balance Logs
        balanceLogs.filter(b => isSameMonth(new Date(b.log_date), currentDate)).forEach(b => {
            let val = parseFloat(b.amount);
            if (b.currency === 'USC') val = val / 100;

            if (b.type === 'PROFIT') {
                totalProfit += val;
                win++;
            } else if (b.type === 'LOSS') {
                totalProfit -= val;
                loss++;
            } else if (b.type === 'DEPOSIT') {
                totalDeposit += val; // บวกยอดฝาก
            } else if (b.type === 'WITHDRAW') {
                totalWithdraw += val; // บวกยอดถอน
            }
        });

        setMonthlyStats({ 
            profit: totalProfit, 
            win, 
            loss,
            count: win + loss,
            deposit: totalDeposit,
            withdraw: totalWithdraw
        });

    }, [trades, balanceLogs, currentDate]);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
                    
                    {/* Left: Back & Title */}
                    <div className="flex items-center self-start xl:self-auto w-full xl:w-auto">
                        <button onClick={() => router.push('/dashboard')} className="mr-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                                <CalendarIcon size={24} className="text-blue-500" />
                                Trading Calendar
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">Performance overview by day</p>
                        </div>
                    </div>

                    {/* Middle: Month Navigator */}
                    <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 shadow-lg">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"><ChevronLeft size={20} /></button>
                        <span className="w-40 text-center font-bold text-slate-200">{format(currentDate, 'MMMM yyyy', { locale: th })}</span>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"><ChevronRight size={20} /></button>
                    </div>

                    {/* Right: Monthly Summary (ปรับปรุงใหม่) */}
                    <div className="bg-slate-900/50 px-5 py-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-6 justify-center xl:justify-end w-full xl:w-auto">
                        
                        {/* P/L Section */}
                        <div className="text-right min-w-[100px]">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Monthly Net P/L</p>
                            <p className={`text-xl font-bold font-mono ${monthlyStats.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {monthlyStats.profit > 0 ? '+' : ''}{monthlyStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>

                        {/* Stats Section: W/L & Dep/Wth */}
                        <div className="flex gap-6">
                            {/* Win / Loss */}
                            <div className="flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Win: <span className="text-emerald-400 font-bold">{monthlyStats.win}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Loss: <span className="text-rose-400 font-bold">{monthlyStats.loss}</span>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>

                            {/* Deposit / Withdraw (เพิ่มส่วนนี้) */}
                            <div className="flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400" title="Total Deposit">
                                    <ArrowDownCircle size={12} className="text-blue-400" /> 
                                    Depeposit: <span className="text-blue-400 font-bold font-mono">+{monthlyStats.deposit.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400" title="Total Withdraw">
                                    <ArrowUpCircle size={12} className="text-purple-400" /> 
                                    Withdraw: <span className="text-purple-400 font-bold font-mono">-{monthlyStats.withdraw.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-7 bg-slate-950/50 border-b border-slate-800">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[140px] bg-slate-800 gap-[1px] border-b border-slate-800">
                        {days.map((day) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const data = dailyData[dateKey];
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <div 
                                    key={day.toString()} 
                                    className={`relative p-2 transition-all hover:bg-slate-800/80 group flex flex-col justify-between
                                        ${!isCurrentMonth ? 'bg-slate-950/80 text-slate-600' : 'bg-slate-900 text-slate-300'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full 
                                            ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {data?.count > 0 && (
                                            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 rounded border border-slate-700">
                                                {data.count}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 items-end mt-1">
                                        {data?.deposit > 0 && (
                                            <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 w-max self-end">
                                                <ArrowDownCircle size={10} />
                                                +{data.deposit.toLocaleString()}
                                            </div>
                                        )}
                                        {data?.withdraw > 0 && (
                                            <div className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 w-max self-end">
                                                <ArrowUpCircle size={10} />
                                                -{data.withdraw.toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    {data !== undefined && Math.abs(data.amount) > 0.001 && (
                                        <div className="mt-auto">
                                            <div className={`
                                                w-full py-1 md:py-1.5 rounded-lg text-center border backdrop-blur-sm transition-transform group-hover:scale-105
                                                ${data.amount > 0 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}
                                            `}>
                                                <p className="font-bold font-mono text-xs md:text-sm tracking-tight">
                                                    {data.amount > 0 ? '+' : ''}{data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}