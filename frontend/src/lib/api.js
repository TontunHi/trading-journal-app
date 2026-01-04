import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', // เชื่อมต่อ API (อ่านจาก Env หรือใช้ localhost)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: ถ้ามี Token ในเครื่อง ให้แนบไปด้วยทุกครั้ง (สำหรับระบบสมาชิก)
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;