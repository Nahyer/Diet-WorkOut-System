import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/app/services/auth"
import { userService } from "@/app/services/user"
import { activityService, ActivityTypes } from "@/app/services/activity"

const REDIRECT_URL = {
    DASHBOARD: "/dashboard",
    REGISTER: "/register?source=google"
  };
  

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    // Use existing auth service for login
                    const response = await authService.login({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    const user = response.user;

                    // Check for suspension
                    if (user.id || user.userId) {
                        const userId = user.id || user.userId;
                        const suspensionCheck = userService.checkSuspension(Number(userId));

                        if (suspensionCheck.isSuspended) {
                            throw new Error(suspensionCheck.message || "Your account is temporarily suspended");
                        }
                    }

                    // Return the user and token for session
                    return {
                        id: user.id?.toString() || user.userId?.toString() || "",
                        email: user.email,
                        name: user.fullName,
                        role: user.role,
                        token: response.token
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },

        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope:
                        'openid email profile',
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            }
        })
    ],

    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {

            // For Google sign-ins, check if the user exists in your database
            // If not, create a new user record
            if (account?.provider === "google" && user.email) {

                try {
                    const existingUserResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/users/by-email?email=${encodeURIComponent(user.email)}`
                    );

                    if (existingUserResponse.ok) {
                        const data = await existingUserResponse.json();


                        if (data.exists) {
                            console.log("Existing user found, proceeding with sign in");
                            user.id = data.userId; // Set the user ID from your database
                            user.role = data.role; // Set the user role from your database
                            user.redirectTo = REDIRECT_URL.DASHBOARD; // Redirect to dashboard for existing users

                            return true;
                        }

                        user.id = ""; // Set to empty string or null if user doesn't exist
                        user.role = "user"; // Default role for new users
                        console.log("New user, redirecting to registration page");
                        user.redirectTo = REDIRECT_URL.REGISTER; // Redirect to registration page for new users

                        return true;

                        //`/register?source=google&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || '')}&image=${encodeURIComponent(user.image || '')}&providerId=${user.id}`
                    } else {
                        console.error("Error checking if user exists:", await existingUserResponse.text());
                        // Let them sign in anyway and we'll handle registration later
                        return true;
                    }
                } catch (error) {
                    console.error("Error checking user existence:", error);
                    return true;
                }

            }
            return true;
        },


        async jwt({ token, user, account, trigger, session }) {

            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role ?? "user";
            console.log("🚀 ~ jwt ~ user:", user)


                // For credentials sign-ins, save the user ID and token
                if (account?.provider === "credentials") {
                    // Your Hono server returns a token, use it as is
                    token.apiToken = user.token; // This is the JWT from your Hono server
                }

                if (account?.provider === "google") {
                    // After user is verified to exist in your system (in signIn callback)
                    // Get a token from your Hono server
                    if (user.redirectTo) token.redirectTo = user.redirectTo; // Redirect URL for new users
                    if (user.email) {
                        try {
                            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: user.email,
                                    oauthProvider: 'google',
                                    oauthId: account.providerAccountId
                                })
                            });

                            if (response.ok) {
                                const data = await response.json();
                                // Store the Hono-issued token
                                token.apiToken = data.token;
                                token.id= data.user.userId?.toString() // Set the user ID from your database
                            }
                        } catch (error) {
                            console.error("Failed to get Hono token for OAuth user:", error);
                        }
                    }
                }

            }

            // Update session when it changes
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }


            return token;
        },

        async session({ session, token }) {
            if (token) {
                
                session.user = {
                    id: token.id as string,
                    name: token.name!,
                    email: token.email!,
                    role: token.role as string ?? "user",
                    
                };
                session.provider = token.provider as string;
                session.apiToken = token.apiToken as string;
                session.expiresAt = token.expiresAt as number;

                if (token.redirectTo) {
                    session.redirectTo = token.redirectTo as string;
                }
                
            }
            return session;
        },
     
      
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    events: {
        async signOut({ token }) {
            // Track logout activity
            if (token?.id) {
                activityService.addActivity({
                    userId: token.id as string,
                    type: ActivityTypes.LOGOUT,
                    description: `${token.name ?? 'User'} logged out`,
                });
            }
        },
    },

    secret: process.env.NEXTAUTH_SECRET
}


declare module "next-auth" {
    interface Session {
        apiToken?: string;
        expiresAt?: number;
        provider?: string;
        redirectTo?: string; // Redirect URL for new users
        user: {
            id: string;
            userId?: number;
            name: string;
            email: string;
            role?: string;
            token?: string; // API token
            [key: string]: any; // For other user properties
        } & DefaultSession["user"]
    }

     interface User {
        id: string;
        userId?: number;
        name: string;
        email: string;
        role?: string;
        token?: string; // API token
        redirectTo?: string; // Redirect URL for new users
        [key: string]: any; // For other user properties
    }
}

export interface TUser {
    id: string;
    userId?: number;
    name: string;
    email: string;
    role?: string;
    token?: string; // API token
    [key: string]: any; // For other user properties
}
