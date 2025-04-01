type DUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';  // Using literal type for role
};

type TData = {
    exists: boolean;
    user: DUser;
};

interface UserData {
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

interface TicketData {
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

interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  date: string;
  status: string;
}

interface Ticket {
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

interface SystemMetric {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
}

interface UserActivity {
  time: string;
  users: number;
}
