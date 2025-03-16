// services/user.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  fullName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  role?: string;
  fitnessGoal?: string;
  experienceLevel?: string;
  preferredWorkoutType?: string;
  activityLevel?: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
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
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API error: ${response.status}`);
  }
  
  // Check if there's content to parse
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

// User service functions
export const userService = {
  // Get all users (admin only)
  getAllUsers: async (token: string): Promise<User[]> => {
    return apiRequest<User[]>('/api/users', 'GET', undefined, token);
  },
  
  // Get user by ID
  getUserById: async (userId: number, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}`, 'GET', undefined, token);
  },
  
  // Update user
  updateUser: async (userId: number, userData: UserUpdateData, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}`, 'PUT', userData, token);
  },
  
  // Delete user (admin only)
  deleteUser: async (userId: number, token: string): Promise<void> => {
    return apiRequest<void>(`/api/users/${userId}`, 'DELETE', undefined, token);
  },
  
  // Change user role (admin only)
  changeUserRole: async (userId: number, role: string, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}/role`, 'PUT', { role }, token);
  },
  
  // Suspend user (admin only)
  suspendUser: async (userId: number, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}/suspend`, 'PUT', undefined, token);
  },
  
  // Activate user (admin only)
  activateUser: async (userId: number, token: string): Promise<User> => {
    return apiRequest<User>(`/api/users/${userId}/activate`, 'PUT', undefined, token);
  }
};