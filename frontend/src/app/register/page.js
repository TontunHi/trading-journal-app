"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import Swal from 'sweetalert2';
import { UserPlus, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return Swal.fire({
                title: 'Error',
                text: 'รหัสผ่านไม่ตรงกัน',
                icon: 'error',
                background: '#1e293b',
                color: '#fff'
            });
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            Swal.fire({
                title: 'Success',
                text: 'สมัครสมาชิกสำเร็จ!',
                icon: 'success',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                router.push('/login');
            });

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
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
                        <UserPlus size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-slate-400 text-sm mt-2">Start your journey to disciplined trading</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Username</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-600"
                                placeholder="TraderPro"
                                required
                            />
                            <User className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                        </div>
                    </div>
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
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase">Confirm Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
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
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-blue-900/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}