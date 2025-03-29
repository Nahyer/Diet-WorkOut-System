"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService, RegisterData } from "../services/auth"
import { activityService, ActivityTypes } from "../services/activity"
import { userService } from "../services/user" // Import user service for suspension checks

// Update the User type to include both id and userId for flexibility
type User = {
  id?: string | number;
  userId?: string | number;
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
  isAdmin: boolean;
  // Add a helper method to get user ID consistently
  getUserId: () => string | number | null;
  // Add a method to track user activities
  trackActivity: (type: string, description: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to normalize user data
const normalizeUserData = (userData: any): User => {
  if (!userData) return userData;
  
  // Ensure the user object has both id and userId properties
  const normalized = { ...userData };
  
  if (normalized.id !== undefined && normalized.userId === undefined) {
    normalized.userId = normalized.id;
  } else if (normalized.userId !== undefined && normalized.id === undefined) {
    normalized.id = normalized.userId;
  }
  
  return normalized;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Helper function to get user ID consistently
  const getUserId = (): string | number | null => {
    if (!user) return null;
    return user.id !== undefined ? user.id : (user.userId !== undefined ? user.userId : null);
  };

  // Function to track user activities
  const trackActivity = (type: string, description: string) => {
    const userId = getUserId();
    if (userId) {
      activityService.addActivity({
        userId,
        type,
        description
      });
    }
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = normalizeUserData(JSON.parse(storedUser));
        
        // Check if the user is suspended before setting as authenticated
        const userId = parsedUser.id || parsedUser.userId;
        if (userId) {
          const suspensionCheck = userService.checkSuspension(Number(userId));
          
          if (suspensionCheck.isSuspended) {
            // User is suspended, don't authenticate them
            setError(suspensionCheck.message || "Your account is temporarily suspended");
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          } else {
            // User is not suspended, proceed with authentication
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        } else {
          // No userId found, proceed with normal authentication
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        // Clear invalid stored data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      // Normalize user data to ensure consistency
      const normalizedUser = normalizeUserData(response.user);
      
      // Check if the user is suspended
      const userId = normalizedUser.id || normalizedUser.userId;
      if (userId) {
        const suspensionCheck = userService.checkSuspension(Number(userId));
        
        if (suspensionCheck.isSuspended) {
          // If user is suspended, throw an error with the suspension message
          throw new Error(suspensionCheck.message || "Your account is temporarily suspended");
        }
      }
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", response.token);
      
      // Update streak information on login
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const lastLoginDate = localStorage.getItem("lastLoginDate");
      
      if (!lastLoginDate) {
        // First time login, initialize streak to 1
        localStorage.setItem("userStreak", "1");
      } else if (lastLoginDate !== today) {
        // Check if last login was yesterday
        const lastDate = new Date(lastLoginDate);
        const todayDate = new Date(today);
        
        const timeDiff = todayDate.getTime() - lastDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day, increment streak
          const currentStreak = parseInt(localStorage.getItem("userStreak") || "0");
          localStorage.setItem("userStreak", (currentStreak + 1).toString());
        } else if (dayDiff > 1) {
          // Streak broken, reset to 1
          localStorage.setItem("userStreak", "1");
        }
      }
      
      // Update last login date
      localStorage.setItem("lastLoginDate", today);
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      // Track login activity
      if (userId) {
        activityService.addActivity({
          userId,
          type: ActivityTypes.LOGIN,
          description: `${normalizedUser.fullName} logged in`
        });
      }
      
      // Redirect based on user role
      if (normalizedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Track logout activity before removing user data
    if (user) {
      const userId = getUserId();
      if (userId) {
        activityService.addActivity({
          userId,
          type: ActivityTypes.LOGOUT,
          description: `${user.fullName} logged out`
        });
      }
    }
    
    authService.logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/");
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    additionalData?: Partial<RegisterData>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData: RegisterData = {
        fullName,
        email,
        password,
        ...additionalData
      };
      
      const response = await authService.register(userData);
      
      // Normalize user data to ensure consistency
      const normalizedUser = normalizeUserData(response.user);
      
      // Store user data and token
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", response.token);
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      // Track registration activity
      const userId = normalizedUser.id || normalizedUser.userId;
      if (userId) {
        activityService.addActivity({
          userId,
          type: ActivityTypes.LOGIN,
          description: `${normalizedUser.fullName} created an account and logged in`
        });
      }
      
      // Redirect to dashboard after registration
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an admin
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        register, 
        isAuthenticated,
        isAdmin,
        getUserId,
        trackActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};