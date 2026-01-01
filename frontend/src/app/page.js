import Link from 'next/link';
import Logo from '../components/Logo';
import { ArrowRight, BarChart2, CheckCircle, Calendar, LineChart, ShieldCheck, Activity, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* --- Navbar --- */}
      <nav className="fixed w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo className="w-10 h-10 hover:scale-105 transition-transform" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Trading Journal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-400 hover:text-white font-medium transition-colors text-sm">
                Log In
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10"></div>

        <div className="inline-flex items-center bg-slate-900/50 border border-slate-800 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          Optimized for SMC System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          Master Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Trading Discipline</span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop gambling. Start trading. The professional journal designed to track your psychology, strategy, and execution.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register" className="flex items-center justify-center bg-white text-slate-950 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-200 transition shadow-xl">
            Start Journaling Free <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center justify-center bg-slate-900 text-slate-200 border border-slate-800 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-800 transition">
            View Demo
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative mx-auto max-w-5xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden aspect-video flex items-center justify-center">
             {/* ใส่รูป Screenshot ของ Dashboard ตรงนี้ */}
             {/* <img src="/dashboard-preview.png" alt="App Preview" className="w-full h-full object-cover" /> */}
             <div className="text-center p-10">
                <BarChart2 className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Dashboard Preview</p>
                <p className="text-slate-600 text-sm">(Place your screenshot here)</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-24 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Built for Professional Consistency</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We focus on the "Process" not just the "Outcome".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">TKT SMC Logic</h3>
              <p className="text-slate-400 leading-relaxed">
                Pre-trade checklist ensuring you follow Structure, Kill Zones, and Liquidity Sweeps before pulling the trigger.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LineChart className="text-emerald-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stats & Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Visualize your Win Rate, Risk:Reward ratio, and growth curve. Understand your edge in the market.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="text-purple-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Calendar View</h3>
              <p className="text-slate-400 leading-relaxed">
                Daily P/L breakdown in a calendar format. See your green days and learn from the red ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Trading Journal. Designed for Disciplined Traders.
        </p>
      </footer>
    </div>
  );
}