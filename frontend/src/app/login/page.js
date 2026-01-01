"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import Swal from 'sweetalert2';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            Swal.fire({
                icon: 'success',
                title: 'Welcome Back',
                text: 'เข้าสู่ระบบสำเร็จ!',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#fff'
            }).then(() => {
                router.push('/dashboard');
            });

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                        <LogIn size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-slate-400 text-sm mt-2">Enter your credentials to access your journal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
                                placeholder="name@example.com"
                                required
                            />
                            <Mail className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}