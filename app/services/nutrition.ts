// services/nutrition.ts
import { activityService, ActivityTypes } from "./activity";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface NutritionPlan {
  id: number;
  name: string;
  description: string;
  calorieTarget: number;
  proteinTarget: number; // in grams
  carbTarget: number; // in grams
  fatTarget: number; // in grams
  meals: Meal[];
}

export interface Meal {
  id: number;
  name: string;
  timeOfDay: string; // e.g., "breakfast", "lunch", "dinner", "snack"
  foods: Food[];
}

export interface Food {
  id: number;
  name: string;
  servingSize: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface NutritionProgress {
  id: number;
  userId: number;
  nutritionPlanId: number;
  dateCompleted: string;
  adherenceRating: number; // 1-5 stars indicating how well they followed the plan
  notes: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: unknown,
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

// Nutrition service functions
export const nutritionService = {
  // Get all nutrition plans
  getAllNutritionPlans: async (token: string): Promise<NutritionPlan[]> => {
    return apiRequest<NutritionPlan[]>('/api/nutrition-plans', 'GET', undefined, token);
  },
  
  // Get nutrition plan by ID
  getNutritionPlanById: async (planId: number, token: string): Promise<NutritionPlan> => {
    return apiRequest<NutritionPlan>(`/api/nutrition-plans/${planId}`, 'GET', undefined, token);
  },
  
  // Complete a nutrition plan and track activity
  completeNutritionPlan: async (
    userId: number, 
    planId: number, 
    progress: Omit<NutritionProgress, 'id' | 'userId' | 'nutritionPlanId'>, 
    token: string
  ): Promise<NutritionProgress> => {
    // First, get the nutrition plan details to include in the activity
    const plan = await nutritionService.getNutritionPlanById(planId, token);
    
    // Make the API request to save the nutrition progress
    const result = await apiRequest<NutritionProgress>(
      `/api/users/${userId}/nutrition-plans/${planId}/complete`, 
      'POST', 
      progress, 
      token
    );
    
    // Track this activity
    activityService.addActivity({
      userId,
      type: ActivityTypes.NUTRITION_PLAN_COMPLETED,
      description: `Completed nutrition plan: ${plan.name}`
    });
    
    return result;
  },
  
  // Get user's nutrition history
  getUserNutritionHistory: async (userId: number, token: string): Promise<NutritionProgress[]> => {
    return apiRequest<NutritionProgress[]>(
      `/api/users/${userId}/nutrition-plans/history`, 
      'GET', 
      undefined, 
      token
    );
  }
};