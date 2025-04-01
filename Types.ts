export type DUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';  // Using literal type for role
};

export type TData = {
    exists: boolean;
    user: DUser;
};

export interface UserData {
  userId: number;
  user_id?: number;
  id?: number;
  fullName?: string;
  full_name?: string;
  email: string;
  createdAt?: string;
  created_at?: string;
  lastActive?: string;
  last_active?: string;
  isActive?: boolean;
  is_active?: boolean;
  role?: string;
  [key: string]: any;
}

export interface TicketData {
  ticketId: number;
  ticket_id?: number;
  userId: number;
  user_id?: number;
  subject: string;
  message: string;
  status: string;
  adminResponse?: string;
  admin_response?: string;
  category: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  resolvedAt?: string;
  resolved_at?: string;
  user?: {
    fullName?: string;
    full_name?: string;
    email: string;
  };
}

export interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  date: string;
  status: string;
}

export interface Ticket {
  id: number;
  user: string;
  userId: number;
  subject: string;
  message: string;
  status: string;
  category: string;
  createdAt: string;
  adminResponse?: string;
}

export interface SystemMetric {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
}

export interface UserActivity {
  time: string;
  users: number;
}

// Define User type based on your backend schema
export type SUser = {
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
  lastActive?: string;
  status?: string;
};

export interface TUser {
  id: string;
  userId?: number;
  name: string;
  email: string;
  role?: string;
  token?: string; // API token
  [key: string]: any; // For other user properties
}
