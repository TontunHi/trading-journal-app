"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Swal from 'sweetalert2';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Save, CreditCard, Calendar } from 'lucide-react';

export default function BalancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Helper: ดึงวันที่ปัจจุบัน YYYY-MM-DD
    const getCurrentDate = () => {
        return new Date().toISOString().slice(0, 10);
    };

    const [form, setForm] = useState({
        type: 'PROFIT',
        amount: '',
        currency: 'USD',
        log_date: getCurrentDate(), // เก็บแค่วันที่ (YYYY-MM-DD)
        note: ''
    });

    const types = [
        { id: 'PROFIT', label: 'Profit (กำไร)', icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
        { id: 'LOSS', label: 'Loss (ขาดทุน)', icon: TrendingDown, color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10' },
        { id: 'DEPOSIT', label: 'Deposit (ฝาก)', icon: Wallet, color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
        { id: 'WITHDRAW', label: 'Withdraw (ถอน)', icon: CreditCard, color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
    ];

    // ฟังก์ชันตั้งเวลาลัด
    const setQuickDate = (mode) => {
        const date = new Date();
        if (mode === 'YESTERDAY') {
            date.setDate(date.getDate() - 1);
        }
        setForm(prev => ({ ...prev, log_date: date.toISOString().slice(0, 10) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Logic: เอาวันที่ที่เลือก + เวลาปัจจุบัน (เพื่อให้ Database เรียงลำดับได้)
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 8); // "HH:MM:SS"
        const fullDateTime = `${form.log_date} ${timeString}`; 

        // สร้าง Payload ใหม่เพื่อส่งไป
        const payload = {
            ...form,
            log_date: fullDateTime 
        };

        try {
            await api.post('/balance', payload);
            Swal.fire({
                title: 'Saved!',
                text: 'บันทึกรายการเรียบร้อย',
                icon: 'success',
                background: '#1e293b',
                color: '#fff',
                showConfirmButton: false,
                timer: 1500
            }).then(() => router.push('/dashboard'));
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'บันทึกไม่สำเร็จ', icon: 'error', background: '#1e293b', color: '#fff' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center mb-8">
                    <button onClick={() => router.back()} className="text-slate-400 hover:text-white mr-4 p-2 rounded-full hover:bg-slate-800 transition"><ArrowLeft /></button>
                    <h1 className="text-2xl font-bold text-white">Quick Balance Log</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 1. Type Selection Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {types.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setForm({ ...form, type: t.id })}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 ${
                                    form.type === t.id 
                                    ? `${t.bg} ${t.border} ring-2 ring-offset-2 ring-offset-slate-950 ring-blue-500/50 scale-[1.02]` 
                                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <t.icon className={`w-8 h-8 mb-2 ${form.type === t.id ? t.color : 'text-slate-500'}`} />
                                <span className={`text-sm font-bold ${form.type === t.id ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* 2. Amount Input & Currency Toggle */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
                        
                        <div>
                            <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Amount & Currency</label>
                            <div className="relative flex items-center">
                                {/* ช่องกรอกเงิน */}
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pr-32 text-3xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-700 font-mono"
                                    placeholder="0.00"
                                />
                                
                                {/* ปุ่มสลับสกุลเงิน */}
                                <div className="absolute right-2 flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, currency: 'USD' })}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                            form.currency === 'USD' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        USD
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, currency: 'USC' })}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                            form.currency === 'USC' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        USC
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Date Picker (Calendar Popup) */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Date (MM/DD/YY)</label>
                                
                                {/* Quick Date Buttons */}
                                <div className="flex space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuickDate('YESTERDAY')}
                                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition"
                                    >
                                        Yesterday
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuickDate('TODAY')}
                                        className="text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded transition"
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative group cursor-pointer">
                                {/* input type="date" จะเรียก Calendar Popup อัตโนมัติ */}
                                <input
                                    type="date"
                                    required
                                    value={form.log_date}
                                    onChange={(e) => setForm({ ...form, log_date: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                />
                                <Calendar className="absolute left-3 top-3.5 text-slate-500 w-5 h-5 pointer-events-none group-hover:text-blue-400 transition-colors" />
                            </div>
                        </div>

                        {/* 4. Note Input */}
                        <div>
                            <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Note (Optional)</label>
                            <textarea
                                rows="3"
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-700 text-sm"
                                placeholder="บันทึกช่วยจำ..."
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.99]"
                    >
                        {loading ? 'Saving...' : <><Save size={20} /> Save Log</>}
                    </button>
                </form>
            </div>
        </div>
    );
}