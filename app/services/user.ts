// services/user.ts
import { activityService, ActivityTypes } from "./activity";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Local storage keys
const DELETED_USERS_KEY = 'deleted_users';
const SUSPENDED_USERS_KEY = 'suspended_users';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  weight: number;
  fitnessGoal: string;
  experienceLevel: string;
  preferredWorkoutType: string;
  activityLevel: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateData {
  fullName: string;
  email: string;
  password?: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  weight: number;
  role: string;
  fitnessGoal: string;
  experienceLevel: string;
  preferredWorkoutType: string;
  activityLevel: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
}

// Interface for suspended user data
interface SuspendedUserData {
  userId: number;
  expiresAt: string; // ISO date string
  reason?: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any,
  token?: string
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  console.log(`Making ${method} request to ${url}`, data);
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("API error:", errorData);
    throw new Error(errorData?.message || `API error: ${response.status}`);
  }
  
  // Check if there's content to parse
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

// Function to determine what was updated by comparing old and new values
const determineUpdates = (oldUser: User, newUserData: UserUpdateData): string[] => {
  const updates: string[] = [];
  
  if (oldUser.fullName !== newUserData.fullName) updates.push("name");
  if (oldUser.email !== newUserData.email) updates.push("email");
  if (newUserData.password) updates.push("password");
  if (oldUser.dateOfBirth !== newUserData.dateOfBirth) updates.push("date of birth");
  if (oldUser.gender !== newUserData.gender) updates.push("gender");
  if (oldUser.height !== newUserData.height) updates.push("height");
  if (oldUser.weight !== newUserData.weight) updates.push("weight");
  if (oldUser.role !== newUserData.role) updates.push("role");
  if (oldUser.fitnessGoal !== newUserData.fitnessGoal) updates.push("fitness goal");
  if (oldUser.experienceLevel !== newUserData.experienceLevel) updates.push("experience level");
  if (oldUser.preferredWorkoutType !== newUserData.preferredWorkoutType) updates.push("preferred workout type");
  if (oldUser.activityLevel !== newUserData.activityLevel) updates.push("activity level");
  if (oldUser.medicalConditions !== newUserData.medicalConditions) updates.push("medical conditions");
  if (oldUser.dietaryRestrictions !== newUserData.dietaryRestrictions) updates.push("dietary restrictions");
  
  return updates;
};

// Format updates for activity description
const formatUpdateDescription = (updates: string[]): string => {
  if (updates.length === 0) return "profile information";
  if (updates.length === 1) return updates[0];
  if (updates.length === 2) return `${updates[0]} and ${updates[1]}`;
  
  const lastItem = updates.pop();
  return `${updates.join(", ")}, and ${lastItem}`;
};

// Local storage functions for handling deleted users
const getDeletedUsers = (): number[] => {
  if (typeof window === 'undefined') return []; // For server-side rendering
  
  const deletedUsersString = localStorage.getItem(DELETED_USERS_KEY);
  if (!deletedUsersString) return [];
  
  try {
    return JSON.parse(deletedUsersString);
  } catch (e) {
    console.error('Error parsing deleted users from localStorage:', e);
    return [];
  }
};

const addDeletedUser = (userId: number): void => {
  if (typeof window === 'undefined') return; // For server-side rendering
  
  const deletedUsers = getDeletedUsers();
  if (!deletedUsers.includes(userId)) {
    deletedUsers.push(userId);
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deletedUsers));
  }
};

const addDeletedUsers = (userIds: number[]): void => {
  if (typeof window === 'undefined') return; // For server-side rendering
  
  const deletedUsers = getDeletedUsers();
  const newDeletedUsers = [...deletedUsers];
  
  userIds.forEach(userId => {
    if (!newDeletedUsers.includes(userId)) {
      newDeletedUsers.push(userId);
    }
  });
  
  localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(newDeletedUsers));
};

// Functions for handling suspended users
const getSuspendedUsers = (): SuspendedUserData[] => {
  if (typeof window === 'undefined') return []; // For server-side rendering
  
  const suspendedUsersString = localStorage.getItem(SUSPENDED_USERS_KEY);
  if (!suspendedUsersString) return [];
  
  try {
    return JSON.parse(suspendedUsersString);
  } catch (e) {
    console.error('Error parsing suspended users from localStorage:', e);
    return [];
  }
};

const suspendUser = (userId: number, reason?: string): void => {
  if (typeof window === 'undefined') return; // For server-side rendering
  
  // Calculate expiration time (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const suspendedUsers = getSuspendedUsers();
  
  // Remove any existing suspension for this user
  const filteredUsers = suspendedUsers.filter(user => user.userId !== userId);
  
  // Add the new suspension
  filteredUsers.push({
    userId,
    expiresAt: expiresAt.toISOString(),
    reason
  });
  
  localStorage.setItem(SUSPENDED_USERS_KEY, JSON.stringify(filteredUsers));
};

const checkUserSuspension = (userId: number): { isSuspended: boolean; expiresAt?: Date; reason?: string } => {
  if (typeof window === 'undefined') return { isSuspended: false }; // For server-side rendering
  
  const suspendedUsers = getSuspendedUsers();
  const suspension = suspendedUsers.find(user => user.userId === userId);
  
  if (!suspension) return { isSuspended: false };
  
  const expiresAt = new Date(suspension.expiresAt);
  const now = new Date();
  
  // If the suspension has expired, remove it and return not suspended
  if (now > expiresAt) {
    const updatedSuspensions = suspendedUsers.filter(user => user.userId !== userId);
    localStorage.setItem(SUSPENDED_USERS_KEY, JSON.stringify(updatedSuspensions));
    return { isSuspended: false };
  }
  
  return { 
    isSuspended: true, 
    expiresAt,
    reason: suspension.reason
  };
};

const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

// User service functions
export const userService = {
  // Get all users (admin only)
  getAllUsers: async (token: string): Promise<User[]> => {
    return apiRequest<User[]>('/api/users', 'GET', undefined, token);
  },
  
  // Get active (non-deleted) users
  getActiveUsers: async (token: string): Promise<User[]> => {
    const users = await apiRequest<User[]>('/api/users', 'GET', undefined, token);
    const deletedUsers = getDeletedUsers();
    
    // Filter out deleted users
    const activeUsers = users.filter(user => !deletedUsers.includes(user.userId));
    
    // Get suspension status for each user
    const suspendedUsers = getSuspendedUsers();
    
    // Add status field to users based on suspension status
    return activeUsers.map(user => {
      const suspension = suspendedUsers.find(s => s.userId === user.userId);
      const isSuspended = suspension && new Date(suspension.expiresAt) > new Date();
      
      return {
        ...user,
        status: isSuspended ? 'suspended' : 'active'
      };
    });
  },
  
  // Get user by ID
  getUserById: async (userId: number, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}`, 'GET', undefined, token);
  },
  
  // Update user and track the activity
  updateUser: async (userId: number, userData: UserUpdateData, token: string): Promise<User> => {
    // First get the current user data to compare with updates
    const currentUser = await userService.getUserById(userId, token);
    
    // Send the update request
    const result = await apiRequest<User>(`/api/users/${userId}`, 'PUT', userData, token);
    
    // Determine what was updated
    const updates = determineUpdates(currentUser, userData);
    
    // Check for role change and track it specifically
    if (updates.includes("role")) {
      activityService.addActivity({
        userId,
        type: ActivityTypes.ROLE_CHANGED,
        description: `Role was changed from ${currentUser.role} to ${userData.role}`
      });
      
      // Remove role from general updates list
      const roleIndex = updates.indexOf("role");
      if (roleIndex > -1) {
        updates.splice(roleIndex, 1);
      }
    }
    
    // If there are other updates, track those too
    if (updates.length > 0) {
      const updateDescription = formatUpdateDescription(updates);
      activityService.addActivity({
        userId,
        type: ActivityTypes.PROFILE_UPDATE,
        description: `Updated ${updateDescription}`
      });
    }
    
    // If password was changed, track that separately
    if (userData.password) {
      activityService.addActivity({
        userId,
        type: ActivityTypes.PASSWORD_CHANGED,
        description: "Password was changed"
      });
    }
    
    return result;
  },
  
  // Soft delete user - store deleted status in localStorage instead of database
  softDeleteUser: async (userId: number, token?: string): Promise<void> => {
    // Add user to the deleted users list in localStorage
    addDeletedUser(userId);
    
    // Track this action
    activityService.addActivity({
      userId,
      type: ActivityTypes.ACCOUNT_DELETED,
      description: "User account was marked as deleted by administrator"
    });
  },

  // Bulk soft delete multiple users
  bulkSoftDeleteUsers: async (userIds: number[], token?: string): Promise<void> => {
    // Add all users to the deleted users list in localStorage
    addDeletedUsers(userIds);
    
    // Track activity for each deleted user
    userIds.forEach(userId => {
      activityService.addActivity({
        userId,
        type: ActivityTypes.ACCOUNT_DELETED,
        description: "User account was marked as deleted by administrator"
      });
    });
  },
  
  // Check if a user is deleted
  isUserDeleted: (userId: number): boolean => {
    const deletedUsers = getDeletedUsers();
    return deletedUsers.includes(userId);
  },
  
  // Delete user (admin only) - Keep this for reference
  deleteUser: async (userId: number, token: string): Promise<void> => {
    return apiRequest<void>(`/api/users/${userId}`, 'DELETE', undefined, token);
  },
  
  // Suspend user for 24 hours (client-side implementation)
  suspendUser: async (userId: number, reason?: string): Promise<void> => {
    // Store suspension details in localStorage
    suspendUser(userId, reason);
    
    // Return a resolved promise for API compatibility
    return Promise.resolve();
  },
  
  // Check if a user is suspended and when the suspension expires
  checkSuspension: (userId: number): { isSuspended: boolean; message?: string } => {
    const suspension = checkUserSuspension(userId);
    
    if (!suspension.isSuspended) {
      return { isSuspended: false };
    }
    
    let message = "Your account is temporarily suspended";
    
    if (suspension.expiresAt) {
      const timeRemaining = formatTimeRemaining(suspension.expiresAt);
      message += `. You can access your account again in ${timeRemaining}.`;
    }
    
    if (suspension.reason) {
      message += ` Reason: ${suspension.reason}`;
    }
    
    return { 
      isSuspended: true, 
      message 
    };
  },
  
  // End suspension immediately (for admin use)
  endSuspension: (userId: number): void => {
    if (typeof window === 'undefined') return; // For server-side rendering
    
    const suspendedUsers = getSuspendedUsers();
    const updatedSuspensions = suspendedUsers.filter(user => user.userId !== userId);
    localStorage.setItem(SUSPENDED_USERS_KEY, JSON.stringify(updatedSuspensions));
    
    // Track this activity
    activityService.addActivity({
      userId,
      type: "account_activated",
      description: "Account suspension was ended by administrator"
    });
  }
};