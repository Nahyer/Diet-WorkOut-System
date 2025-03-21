// services/workout.ts
import { activityService, ActivityTypes } from "./activity";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Workout {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  caloriesBurned: number;
  difficultyLevel: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  restTime: number; // in seconds
  instructions: string;
}

export interface WorkoutProgress {
  id: number;
  userId: number;
  workoutId: number;
  dateCompleted: string;
  rating: number; // 1-5 stars
  notes: string;
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
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

// Workout service functions
export const workoutService = {
  // Get all workouts
  getAllWorkouts: async (token: string): Promise<Workout[]> => {
    return apiRequest<Workout[]>('/api/workouts', 'GET', undefined, token);
  },
  
  // Get workout by ID
  getWorkoutById: async (workoutId: number, token: string): Promise<Workout> => {
    return apiRequest<Workout>(`/api/workouts/${workoutId}`, 'GET', undefined, token);
  },
  
  // Complete a workout and track activity
  completeWorkout: async (userId: number, workoutId: number, progress: Omit<WorkoutProgress, 'id' | 'userId' | 'workoutId'>, token: string): Promise<WorkoutProgress> => {
    // First, get the workout details to include in the activity
    const workout = await workoutService.getWorkoutById(workoutId, token);
    
    // Make the API request to save the workout progress
    const result = await apiRequest<WorkoutProgress>(
      `/api/users/${userId}/workouts/${workoutId}/complete`, 
      'POST', 
      progress, 
      token
    );
    
    // Track this activity
    activityService.addActivity({
      userId,
      type: ActivityTypes.WORKOUT_COMPLETED,
      description: `Completed workout: ${workout.name}`
    });
    
    return result;
  },
  
  // Get user's workout history
  getUserWorkoutHistory: async (userId: number, token: string): Promise<WorkoutProgress[]> => {
    return apiRequest<WorkoutProgress[]>(
      `/api/users/${userId}/workouts/history`, 
      'GET', 
      undefined, 
      token
    );
  }
};