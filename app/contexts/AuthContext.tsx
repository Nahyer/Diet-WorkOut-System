"use client"

import type React from "react"
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react"
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation"
import { activityService } from "../services/activity";
import { User } from "next-auth";
import { RegisterData } from "../services/auth";



type AuthContextType = {
  user: User | null;
  isOAuthUser: boolean;
  redirectUrl: string | undefined;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, email: string, password: string, additionalData?: Partial<RegisterData>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Add a helper method to get user ID consistently
  getUserId: () => string | number | null;
  getApiToken: () => string | null;
  // Add a method to track user activities
  trackActivity: (type: string, description: string) => void;
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(session?.redirectTo);
  const loading = status === "loading";
  const user = session?.user ?? null;
  const isAuthenticated = status === "authenticated";
  const isAdmin = user?.role === "admin";
	const isOAuthUser = session?.provider === "google" 
   

  
  useMemo(() => {
    if (session?.redirectTo) {
      setRedirectUrl(session.redirectTo);
    }
  }, [session?.redirectTo]);



  // Helper function to get user ID consistently
  const getUserId = useCallback((): string | number | null => {
    if (!user) return null;
    return user.id ?? (user.userId ?? null);
  }, [user]);

   // Helper function to get API token
   const getApiToken = (): string | null => {
    // Get token from session
    return session?.apiToken || null;
  };

   // Function to make authenticated requests
  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
   const token = getApiToken();
   
   if (!token) {
    throw new Error("Not authenticated");
   }
   
   const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
   };
   
   return fetch(url, {
    ...options,
    headers,
   });
  }, [getApiToken]);

  // Function to track user activities
  const trackActivity = useCallback((type: string, description: string) => {
    const userId = getUserId();
    if (userId) {
      activityService.addActivity({
        userId,
        type,
        description
      });
    }
  }, [getUserId]);

  const login = async (email: string, password: string) => {
    // setLoading(true);
    setError(null);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      if (!result?.ok) {
        throw new Error(result?.error || "Login failed");
      };
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } 
  };

  // Logout function using Auth.js
  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/"); // Redirect to home page after logout
  }, [router]);

  const register = useCallback(async (
    fullName: string,
    email: string,
    password: string,
    additionalData?: any
  ) => {
    setError(null);
    
    try {      
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        ...additionalData,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }
    
    // Login automatically after registration
    await login(email, password);

    // Redirect to dashboard after registration
    router.push("/dashboard");
  } catch (err) {
    console.error("Registration error:", err);
    setError(err instanceof Error ? err.message : "Registration failed");
    throw err;
  } 
}, [login, router, setError]);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signIn("google", { callbackUrl: "/dashboard",redirect: false });
      if (!result?.ok) {
        throw new Error(result?.error || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err instanceof Error ? err.message : "Google login failed");
    }
  }

  const contextValue = useMemo(() => ({
    user,
    loading,
    redirectUrl,
    error,
    login,
    logout,
    register,
    loginWithGoogle,
    isAuthenticated,
    isAdmin,
    getUserId,
    isOAuthUser,
    trackActivity,
    getApiToken,
    apiRequest
  }), [user, loading, error, isAuthenticated, isAdmin, redirectUrl, logout, register, getUserId, trackActivity, apiRequest]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );

};

// Create a NextAuth wrapper component
export function NextAuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};










      // Track registration activity
      // const userId = normalizedUser.id || normalizedUser.userId;
      // if (userId) {
      //   activityService.addActivity({
      //     userId,
      //     type: ActivityTypes.LOGIN,
      //     description: `${normalizedUser.fullName} created an account and logged in`
      //   });
      // }

      // Track login activity
      // if (userId) {
      //   activityService.addActivity({
      //     userId,
      //     type: ActivityTypes.LOGIN,
      //     description: `${normalizedUser.fullName} logged in`
      //   });
      // }
      
      // Track logout activity before removing user data
    // if (user) {
    //   const userId = getUserId();
    //   if (userId) {
    //     activityService.addActivity({
    //       userId,
    //       type: ActivityTypes.LOGOUT,
    //       description: `${user.fullName} logged out`
    //     });
    //   }
    // }

    //  // Update streak information on login
    //  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    //  const lastLoginDate = localStorage.getItem("lastLoginDate");
    // if (!lastLoginDate) {
    //   // First time login, initialize streak to 1
    //   localStorage.setItem("userStreak", "1");
    // } else if (lastLoginDate !== today) {
    //   // Check if last login was yesterday
    //   const lastDate = new Date(lastLoginDate);
    //   const todayDate = new Date(today);
      
    //   const timeDiff = todayDate.getTime() - lastDate.getTime();
    //   const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
    //   if (dayDiff === 1) {
    //     // Consecutive day, increment streak
    //     const currentStreak = parseInt(localStorage.getItem("userStreak") || "0");
    //     localStorage.setItem("userStreak", (currentStreak + 1).toString());
    //   } else if (dayDiff > 1) {
    //     // Streak broken, reset to 1
    //     localStorage.setItem("userStreak", "1");
    //   }
    // }

//     "use client"

// import { useSession } from "next-auth/react";
// // ... other imports

// export const AuthProvider = ({ children }) => {
//   const { data: session } = useSession();
  
//   // Helper function to get API token
//   const getApiToken = (): string | null => {
//     // Get token from session
//     return session?.apiToken || null;
//   };
  
//   // Function to make authenticated requests
//   const apiRequest = async (url: string, options: RequestInit = {}) => {
//     const token = getApiToken();
    
//     if (!token) {
//       throw new Error("Not authenticated");
//     }
    
//     const headers = {
//       ...options.headers,
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };
    
//     return fetch(url, {
//       ...options,
//       headers,
//     });
//   };
  
//   // Rest of your AuthProvider remains the same
//   // ...
// }