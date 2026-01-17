"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Load from localStorage
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password })
            const { token, user } = res.data

            setToken(token)
            setUser(user)
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))

            router.push("/dashboard")
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Login failed"
            }
        }
    }

    const register = async (email, password) => {
        try {
            await axios.post("http://localhost:5000/api/auth/register", { email, password })
            // Auto login after register? Or redirect to login.
            // Let's redirect to login for simplicity or auto-login.
            return await login(email, password);
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Registration failed"
            }
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/")
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
