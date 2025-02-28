"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService, RegisterData } from "../services/auth"

type User = {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  [key: string]: any; // For other user properties
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, email: string, password: string, additionalData?: Partial<RegisterData>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login({ email, password })
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)
      
      setUser(response.user)
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const register = async (
    fullName: string, 
    email: string, 
    password: string,
    additionalData?: Partial<RegisterData>
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const userData: RegisterData = {
        fullName,
        email,
        password,
        ...additionalData
      }
      
      const response = await authService.register(userData)
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)
      
      setUser(response.user)
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        register, 
        loading, 
        error,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}