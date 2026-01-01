"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Swal from 'sweetalert2';
import { 
    ArrowLeft, Save, Trash2, Clock, DollarSign, Target, 
    AlertTriangle, CheckCircle, Image as ImageIcon, UploadCloud,
    Maximize2, ExternalLink
} from 'lucide-react';

export default function TradeDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params สำหรับ Next.js 15+ (หรือใช้ const { id } = params สำหรับเวอร์ชันเก่า)
    const unwrappedParams = use(params); 
    const tradeId = unwrappedParams.id;

    const [trade, setTrade] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // State สำหรับฟอร์มปิดออเดอร์
    const [exitForm, setExitForm] = useState({
        status: 'OPEN',
        exit_price: '',
        p_l_amount: '',
        p_l_percent: '',
        note: ''
    });
    const [afterImage, setAfterImage] = useState(null);

    useEffect(() => {
        if (tradeId) fetchTradeDetail();
    }, [tradeId]);

    const fetchTradeDetail = async () => {
        try {
            const res = await api.get(`/trades/${tradeId}`);
            setTrade(res.data);
            
            // Pre-fill ข้อมูล
            setExitForm({
                status: res.data.status === 'OPEN' ? 'CLOSED_PROFIT' : res.data.status,
                exit_price: res.data.exit_price || '',
                p_l_amount: res.data.p_l_amount || '',
                p_l_percent: res.data.p_l_percent || '',
                note: res.data.note || ''
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'ไม่พบข้อมูลออเดอร์',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setExitForm({ ...exitForm, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        
        Object.keys(exitForm).forEach(key => formData.append(key, exitForm[key]));
        if (afterImage) formData.append('image_after', afterImage);

        try {
            await api.put(`/trades/${tradeId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({
                title: 'Updated!',
                text: 'อัปเดตออเดอร์เรียบร้อย',
                icon: 'success',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                router.push('/dashboard');
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'อัปเดตล้มเหลว',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        } finally {
            setSaving(false);
        }
    };

    // Helper Components
    const InfoItem = ({ label, value, color = "text-slate-200" }) => (
        <div className="mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
            <span className={`text-base font-medium ${color}`}>{value || "-"}</span>
        </div>
    );

    const Badge = ({ children, colorClass }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
            {children}
        </span>
    );

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
    if (!trade) return null;

    const imgBefore = trade.images?.find(i => i.image_type === 'BEFORE')?.file_path;
    const imgAfter = trade.images?.find(i => i.image_type === 'AFTER')?.file_path;
    const isBuy = trade.order_type.includes('BUY');

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-slate-500">Ticket #{trade.id.toString().padStart(6, '0')}</span>
                        {/* <button className="text-rose-400 hover:text-rose-300 p-2"><Trash2 size={18}/></button> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Trade Info (Read Only) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Main Info Card */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                        {trade.pair}
                                        <Badge colorClass={isBuy ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}>
                                            {trade.order_type}
                                        </Badge>
                                    </h1>
                                    <div className="flex items-center text-slate-400 text-sm gap-3 mt-2">
                                        <span className="flex items-center gap-1"><Clock size={14}/> {trade.timeframe}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{trade.session} Session</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>{new Date(trade.entry_date).toLocaleString('th-TH')}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-slate-500 mb-1">Lot Size</span>
                                    <span className="text-xl font-mono font-bold text-slate-200">{trade.lot_size}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-500 block mb-1">Entry Price</span>
                                    <span className="font-mono text-lg text-blue-400">{trade.entry_price}</span>
                                </div>
                                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                    <span className="text-xs text-slate-500 block mb-1">Stop Loss</span>
                                    <span className="font-mono text-lg text-rose-400">{trade.sl_price}</span>
                                </div>
                                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                    <span className="text-xs text-slate-500 block mb-1">Take Profit</span>
                                    <span className="font-mono text-lg text-emerald-400">{trade.tp_price}</span>
                                </div>
                            </div>

                            {/* TKT Checklist Summary */}
                            <div className="bg-slate-950/30 rounded-lg p-4 border border-slate-800/50">
                                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-blue-500"/> System Check
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {trade.is_structure_valid && <Badge colorClass="bg-blue-900/20 text-blue-300 border-blue-800">Structure Valid</Badge>}
                                    {trade.is_bias_correct && <Badge colorClass="bg-blue-900/20 text-blue-300 border-blue-800">Bias Correct</Badge>}
                                    {trade.is_kill_zone && <Badge colorClass="bg-purple-900/20 text-purple-300 border-purple-800">Kill Zone</Badge>}
                                    {trade.is_liquidity_sweep && <Badge colorClass="bg-orange-900/20 text-orange-300 border-orange-800">Liq Sweep</Badge>}
                                    {trade.pd_zone !== 'NONE' && <Badge colorClass="bg-slate-800 text-slate-300 border-slate-700">{trade.pd_zone}</Badge>}
                                    {trade.key_level_type !== 'NONE' && <Badge colorClass="bg-slate-800 text-slate-300 border-slate-700">{trade.key_level_type}</Badge>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Before Image */}
                        {imgBefore && (
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                                    <ImageIcon size={16}/> Setup Chart (Before)
                                </h3>
                                <div className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                                    <img 
                                        src={`http://localhost:5000${imgBefore}`} 
                                        alt="Before Chart" 
                                        className="w-full h-auto object-contain max-h-[400px]"
                                    />
                                    <a 
                                        href={`http://localhost:5000${imgBefore}`} 
                                        target="_blank" 
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="flex items-center text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                                            <Maximize2 size={16} className="mr-2"/> View Fullscreen
                                        </span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Action & Result Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl sticky top-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Target className="text-blue-500" size={20}/>
                                Trade Management
                            </h2>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                
                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Status</label>
                                    <select 
                                        name="status" 
                                        value={exitForm.status} 
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="OPEN">🔵 OPEN (Running)</option>
                                        <option value="CLOSED_PROFIT">🟢 CLOSED PROFIT</option>
                                        <option value="CLOSED_LOSS">🔴 CLOSED LOSS</option>
                                        <option value="BE">⚪ BREAK EVEN</option>
                                        <option value="CANCELLED">🚫 CANCELLED</option>
                                    </select>
                                </div>

                                {/* Results Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Exit Price</label>
                                        <input 
                                            type="number" step="0.001" name="exit_price" 
                                            value={exitForm.exit_price} onChange={handleChange}
                                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-3 font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">P/L ($)</label>
                                        <input 
                                            type="number" step="0.01" name="p_l_amount" 
                                            value={exitForm.p_l_amount} onChange={handleChange}
                                            className={`w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono font-bold ${parseFloat(exitForm.p_l_amount) > 0 ? 'text-emerald-400' : parseFloat(exitForm.p_l_amount) < 0 ? 'text-rose-400' : 'text-white'}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* After Image Upload */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">Result Chart (After)</label>
                                    
                                    {/* Preview Area */}
                                    {(imgAfter || afterImage) && (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 relative group">
                                            <img 
                                                src={afterImage ? URL.createObjectURL(afterImage) : `http://localhost:5000${imgAfter}`} 
                                                className="w-full h-32 object-cover opacity-75 group-hover:opacity-100 transition"
                                            />
                                        </div>
                                    )}

                                    <label className="flex items-center justify-center w-full h-12 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-colors">
                                        <div className="flex items-center text-slate-400 text-sm">
                                            <UploadCloud size={16} className="mr-2"/>
                                            {afterImage ? 'Change Image' : (imgAfter ? 'Replace Image' : 'Upload Image')}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setAfterImage(e.target.files[0])} />
                                    </label>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Journal Note</label>
                                    <textarea 
                                        name="note" rows="4" 
                                        value={exitForm.note} onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="Lesson learned, emotions, mistakes..."
                                    ></textarea>
                                </div>

                                {/* Save Button */}
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? 'Saving...' : <><Save size={18}/> Update Trade</>}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}