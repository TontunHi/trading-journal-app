"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Swal from 'sweetalert2';
import { Save, ArrowLeft, UploadCloud, CheckCircle, AlertCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function AddTradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        pair: 'XAUUSD',
        session: 'LONDON',
        order_type: 'BUY',
        timeframe: 'M15',
        bias_trend: 'BULLISH',
        entry_price: '',
        sl_price: '',
        tp_price: '',
        lot_size: '0.01',
        entry_date: new Date().toISOString().slice(0, 16),
        is_structure_valid: false,
        is_bias_correct: false,
        pd_zone: 'NONE',
        key_level_type: 'NONE',
        is_kill_zone: false,
        is_liquidity_sweep: false,
        pa_pattern: 'NONE',
        is_volume_spike: false,
        note: ''
    });

    const [files, setFiles] = useState({ before: null, after: null });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (files.before) formData.append('image_before', files.before);
        if (files.after) formData.append('image_after', files.after);

        try {
            await api.post('/trades', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({
                title: 'Saved!',
                text: 'บันทึกออเดอร์เรียบร้อย',
                icon: 'success',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                router.push('/dashboard');
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || error.message,
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    // Component ย่อยสำหรับ Input
    const InputField = ({ label, name, type = "text", value, onChange, icon: Icon, required = false, step, placeholder, colorClass = "text-white" }) => (
        <div className="relative group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    step={step}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full bg-slate-800 border border-slate-700 text-sm rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-600 ${colorClass}`}
                />
                {Icon && <Icon className="absolute left-3 top-3.5 text-slate-500 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />}
            </div>
        </div>
    );

    // Component สำหรับ Select
    const SelectField = ({ label, name, value, onChange, options }) => (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.val} value={opt.val}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    // Component สำหรับ Checkbox
    const CheckboxField = ({ label, name, checked, onChange }) => (
        <label className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${checked ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
            <span className={`text-sm font-medium ${checked ? 'text-blue-200' : 'text-slate-300'}`}>{label}</span>
        </label>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="font-medium">Back</span>
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        New Trade Entry
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Card 1: Main Info */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800/50">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            General Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* แก้ไข: PAIR เป็น Dropdown */}
                            <SelectField 
                                label="Pair" name="pair" value={form.pair} onChange={handleChange}
                                options={[
                                    {val: 'XAUUSD', label: 'XAUUSD'},
                                    {val: 'EURUSD', label: 'EURUSD'},
                                    {val: 'GBPUSD', label: 'GBPUSD'},
                                    {val: 'USDJPY', label: 'USDJPY'},
                                    {val: 'BTCUSD', label: 'BTCUSD'},
                                    {val: 'OTHER', label: 'Other'}
                                ]}
                            />
                            <SelectField 
                                label="Session" name="session" value={form.session} onChange={handleChange}
                                options={[
                                    {val: 'ASIA', label: 'Asia (07:00 - 13:00)'},
                                    {val: 'LONDON', label: 'London (14:00 - 17:00)'},
                                    {val: 'NY_AM', label: 'NY (20:00 - 23:00)'},
                                    {val: 'OTHER', label: 'Other'}
                                ]}
                            />
                             <SelectField 
                                label="Order Type" name="order_type" value={form.order_type} onChange={handleChange}
                                options={[
                                    {val: 'BUY', label: 'BUY 🟢'}, {val: 'SELL', label: 'SELL 🔴'},
                                    {val: 'BUY_LIMIT', label: 'BUY LIMIT'}, {val: 'SELL_LIMIT', label: 'SELL LIMIT'}
                                ]}
                            />
                            {/* แก้ไข: Timeframe เพิ่มตัวเลือกตามที่ขอ */}
                            <SelectField 
                                label="Timeframe" name="timeframe" value={form.timeframe} onChange={handleChange}
                                options={[
                                    'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'
                                ].map(t => ({val: t, label: t}))}
                            />
                        </div>
                    </div>

                    {/* Card 2: Risk & Price */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800/50">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                            Execution & Risk
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <InputField 
                                label="Entry Price" name="entry_price" type="number" step="0.001" 
                                value={form.entry_price} onChange={handleChange} icon={DollarSign} required
                            />
                            <InputField 
                                label="Stop Loss" name="sl_price" type="number" step="0.001" 
                                value={form.sl_price} onChange={handleChange} icon={AlertCircle} 
                                colorClass="text-red-400" required
                            />
                            <InputField 
                                label="Take Profit" name="tp_price" type="number" step="0.001" 
                                value={form.tp_price} onChange={handleChange} icon={CheckCircle} 
                                colorClass="text-green-400" required
                            />
                            <InputField 
                                label="Lot Size" name="lot_size" type="number" step="0.01" 
                                value={form.lot_size} onChange={handleChange} icon={DollarSign} required
                            />
                        </div>
                    </div>

                    {/* Card 3: TKT Checklist */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />
                                TKT Confirmation
                            </h2>
                            {/* ลบ: System v7.0 ออกตามที่ขอ */}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <CheckboxField label="Structure Valid (BOS)" name="is_structure_valid" checked={form.is_structure_valid} onChange={handleChange} />
                            <CheckboxField label="Bias Correct" name="is_bias_correct" checked={form.is_bias_correct} onChange={handleChange} />
                            <CheckboxField label="Kill Zone Time" name="is_kill_zone" checked={form.is_kill_zone} onChange={handleChange} />
                            <CheckboxField label="Liquidity Sweep" name="is_liquidity_sweep" checked={form.is_liquidity_sweep} onChange={handleChange} />
                            <CheckboxField label="Volume Spike" name="is_volume_spike" checked={form.is_volume_spike} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                             <SelectField 
                                label="PD Zone" name="pd_zone" value={form.pd_zone} onChange={handleChange}
                                options={[
                                    {val: 'NONE', label: '- Select -'}, {val: 'DISCOUNT', label: 'Discount (Low)'}, {val: 'PREMIUM', label: 'Premium (High)'}
                                ]}
                            />
                            <SelectField 
                                label="Key Level" name="key_level_type" value={form.key_level_type} onChange={handleChange}
                                options={[
                                    {val: 'NONE', label: '- Select -'}, {val: 'OB', label: 'Order Block'}, {val: 'FVG', label: 'Fair Value Gap'}, {val: 'BREAKER', label: 'Breaker Block'}
                                ]}
                            />
                            <SelectField 
                                label="PA Pattern" name="pa_pattern" value={form.pa_pattern} onChange={handleChange}
                                options={[
                                    {val: 'NONE', label: '- Select -'}, {val: 'SOLO', label: 'SOLO (Pinbar)'}, {val: 'DUO', label: 'DUO (Engulfing)'}, {val: 'TRIO', label: 'TRIO (Star)'}
                                ]}
                            />
                        </div>
                    </div>

                    {/* Card 4: Evidence & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800/50">
                            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Trading Note</label>
                            <textarea 
                                name="note" rows="5" onChange={handleChange} 
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed placeholder-slate-600"
                                placeholder="Write your analysis, emotions, or mistakes here..."
                            ></textarea>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800/50 flex flex-col justify-center items-center text-center">
                            <label className="block w-full cursor-pointer group">
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 hover:border-blue-500 hover:bg-slate-800 transition-all">
                                    <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm text-slate-400 group-hover:text-slate-200">Upload Before Chart</span>
                                    <input type="file" name="before" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>
                            </label>
                            {files.before && <p className="mt-2 text-xs text-green-400 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Selected</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                    >
                        {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Trade Journal</>}
                    </button>

                </form>
            </div>
        </div>
    );
}