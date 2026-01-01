"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';
import api from '../../lib/api';
import { 
    LogOut, Plus, TrendingUp, TrendingDown, Activity, 
    Calendar, ArrowUpRight, Search, Wallet, BarChart3 
} from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, winRate: 0, profit: 0 });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchTrades();
    }, []);

    const fetchTrades = async () => {
        try {
            const res = await api.get('/trades');
            setTrades(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error("Error fetching trades:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const closedTrades = data.filter(t => t.status !== 'OPEN' && t.status !== 'CANCELLED');
        const wins = closedTrades.filter(t => t.status === 'CLOSED_PROFIT').length;
        const totalClosed = closedTrades.length;
        const winRate = totalClosed > 0 ? ((wins / totalClosed) * 100).toFixed(1) : 0;
        const totalProfit = data.reduce((sum, t) => sum + (parseFloat(t.p_l_amount) || 0), 0);

        setStats({
            total: data.length,
            winRate: winRate,
            profit: totalProfit
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Component: Status Badge
    const StatusBadge = ({ status }) => {
        const styles = {
            OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            CLOSED_PROFIT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            CLOSED_LOSS: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            BE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            CANCELLED: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        };
        // แปลงข้อความให้ดูสวยงาม (ตัด _ ออก)
        const label = status.replace('CLOSED_', '').replace('_', ' ');
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.OPEN}`}>
                {label}
            </span>
        );
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Data...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            
            {/* --- Navbar --- */}
            <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <Logo className="w-10 h-10 hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                                Trading Journal
                            </span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex flex-col text-right mr-2">
                                <span className="text-sm font-medium text-slate-200">{user?.username}</span>
                                <span className="text-xs text-slate-500">Pro Member</span>
                            </div>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                
                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Trades */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart3 size={80} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Trades</p>
                        <div className="flex items-baseline space-x-2">
                            <h3 className="text-4xl font-bold text-white">{stats.total}</h3>
                            <span className="text-sm text-slate-500">Orders</span>
                        </div>
                    </div>

                    {/* Card 2: Win Rate */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={80} className="text-blue-500" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Win Rate</p>
                        <div className="flex items-baseline space-x-2">
                            <h3 className={`text-4xl font-bold ${parseFloat(stats.winRate) >= 50 ? 'text-blue-400' : 'text-slate-200'}`}>
                                {stats.winRate}%
                            </h3>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.winRate}%` }}></div>
                        </div>
                    </div>

                    {/* Card 3: Net P/L */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet size={80} className={stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Net P/L</p>
                        <div className="flex items-center space-x-2">
                            <h3 className={`text-4xl font-bold ${stats.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {stats.profit > 0 ? '+' : ''}{stats.profit.toLocaleString()}
                            </h3>
                            <span className="text-lg text-slate-500">$</span>
                        </div>
                    </div>
                </div>

                {/* --- Action Bar --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-200 flex items-center">
                        Recent Trades
                        <span className="ml-3 text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
                            {trades.length} Records
                        </span>
                    </h2>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button 
                            onClick={() => router.push('/dashboard/calendar')} 
                            className="flex-1 md:flex-none flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl border border-slate-800 transition-all hover:border-slate-600 text-sm font-medium"
                        >
                            <Calendar size={18} className="mr-2" /> Calendar
                        </button>
                        <button 
                            onClick={() => router.push('/dashboard/balance')} 
                            className="flex-1 md:flex-none flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl border border-slate-800 transition-all hover:border-slate-600 text-sm font-medium"
                        >
                            <Wallet size={18} className="mr-2" /> Balance
                        </button>    
                        <button 
                            onClick={() => router.push('/dashboard/add')} 
                            className="flex-1 md:flex-none flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all text-sm font-bold"
                        >
                            <Plus size={18} className="mr-2" /> New Entry
                        </button>
                    </div>
                </div>

                {/* --- Trades Table --- */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/30">
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pair</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Session</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Side</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {trades.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <BarChart3 size={48} className="mb-4 opacity-20" />
                                                <p>No trades recorded yet.</p>
                                                <p className="text-sm mt-1">Start by adding your first trade entry.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    trades.map((trade) => (
                                        <tr key={trade.id} className="group hover:bg-slate-800/50 transition-colors">
                                            <td className="p-5">
                                                <div className="text-sm text-slate-300 font-medium">
                                                    {new Date(trade.entry_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(trade.entry_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="font-bold text-slate-200 tracking-wide">{trade.pair}</span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                                    trade.session === 'LONDON' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                                    trade.session === 'NY_AM' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                    {trade.session}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`font-bold ${trade.order_type.includes('BUY') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {trade.order_type}
                                                </span>
                                            </td>
                                            <td className="p-5 text-slate-300 text-sm font-mono">
                                                {trade.entry_price}
                                            </td>
                                            <td className="p-5">
                                                <StatusBadge status={trade.status} />
                                            </td>
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={() => router.push(`/dashboard/trade/${trade.id}`)} 
                                                    className="text-slate-500 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                                                >
                                                    <ArrowUpRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}