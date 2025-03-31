"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react";

// Define types based on your API data structure
type MealPlan = {
  mealPlanId: number;
  nutritionPlanId: number;
  dayNumber: number;
  mealTime?: string;
  name?: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipe?: string;
  nutritionPlan?: {
    goal?: string;
    dailyCalories: number;
  };
};

type NutritionPlan = {
  nutritionPlanId: number;
  userId: number;
  goal?: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsPerDay: number;
  isAiGenerated: boolean;
  restrictions?: string;
  createdAt: string;
  updatedAt: string;
  mealPlans?: MealPlan[];
};

export default function NutritionManagement() {
  const [, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [, setMealPlans] = useState<MealPlan[]>([]);
  const [, setFilteredNutritionPlans] = useState<NutritionPlan[]>([]);
  const [, setFilteredMealPlans] = useState<MealPlan[]>([]);
  const [, setIsLoading] = useState(true);
  const [] = useState("all");
  const [] = useState("");
  const [] = useState("nutrition");

  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const loadNutritionPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:8000/api/nutrition-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch nutrition plans");
      }

      const data = await response.json();
      setNutritionPlans(data);
      setFilteredNutritionPlans(data);
    } catch (error) {
      console.error("Error loading nutrition plans:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMealPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:8000/api/meal-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch meal plans");
      }

      const data = await response.json();
      setMealPlans(data);
      setFilteredMealPlans(data);
    } catch (error) {
      console.error("Error loading meal plans:", error);
      toast({
        title: "Error",
        description: "Failed to load meal plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadNutritionPlans();
      loadMealPlans();
    }
  }, [isAuthenticated, isAdmin, loadNutritionPlans, loadMealPlans]);

  // The rest of the component logic remains unchanged
}

// Removed the conflicting local declaration of useCallback
