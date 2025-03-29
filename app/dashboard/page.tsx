"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Activity,
  Dumbbell,
  Apple,
  Calendar,
  TrendingUp,
  Timer,
  Flame,
  Plus,
  ChevronRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  user: { fullName: string };
  streak: number;
  todaysWorkout: { name: string; description: string; duration: number; targetMuscleGroups: string } | null;
  caloriesToday: number;
  weightData: { date: string; weight: number }[]; // Updated to match Progress Tracking
  goals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    workoutCompleted: boolean;
  };
}

// Type for workout session
interface WorkoutSession {
  sessionId: number;
  dayNumber: number;
  name: string;
  description: string;
  targetMuscleGroups: string;
  duration: number;
}

// Type for workout plan
interface WorkoutPlan {
  planId: number;
  sessions: WorkoutSession[];
}

// Type for consumed meal
interface ConsumedMeal {
  mealPlanId: number;
  dayNumber: number;
  consumedAt: string;
  calories: number;
}

// Type for meal plans
interface MealPlan {
  mealPlanId: number;
  calories: number;
}

export default function Dashboard() {
  const { user, getUserId, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [consumedMeals, setConsumedMeals] = useState<ConsumedMeal[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "User";

  // Function to calculate the current streak
  const calculateStreak = () => {
    // Get the last login date (or streak update) from localStorage
    const lastLoginDate = localStorage.getItem("lastLoginDate");
    const storedStreak = localStorage.getItem("userStreak");
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    let currentStreak = storedStreak ? parseInt(storedStreak) : 0;
    
    if (!lastLoginDate) {
      // First time login, set streak to 1
      currentStreak = 1;
    } else if (lastLoginDate !== today) {
      // Check if the last login was yesterday
      const lastDate = new Date(lastLoginDate);
      const todayDate = new Date(today);
      
      // Calculate the difference in days
      const timeDiff = todayDate.getTime() - lastDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        // Consecutive day, increment streak
        currentStreak += 1;
      } else if (dayDiff > 1) {
        // Streak broken, reset to 1
        currentStreak = 1;
      }
      // If dayDiff === 0, it's the same day, keep streak unchanged
    }
    
    // Save the updated streak and today's date
    localStorage.setItem("userStreak", currentStreak.toString());
    localStorage.setItem("lastLoginDate", today);
    
    return currentStreak;
  };

  // Function to get today's workout based on the current day number (always starting with day 1)
  const getTodaysWorkout = (workoutPlan: WorkoutPlan | null) => {
    if (!workoutPlan || !workoutPlan.sessions || workoutPlan.sessions.length === 0) {
      return null;
    }
    
    // Always use day 1 as today's workout to match the workout section behavior
    // This aligns with how your workout section initializes with day 1
    const dayNumber = 1;
    
    // Find the workout session for day 1
    const todaysSession = workoutPlan.sessions.find(session => session.dayNumber === dayNumber);
    
    if (todaysSession) {
      return {
        name: todaysSession.name,
        description: todaysSession.description,
        duration: todaysSession.duration,
        targetMuscleGroups: todaysSession.targetMuscleGroups
      };
    }
    
    return null;
  };

  // Calculate total calories consumed today - only counting actual calories, not protein
  const calculateCaloriesToday = (consumedMeals: ConsumedMeal[], mealPlans: MealPlan[]) => {
    if (!consumedMeals || consumedMeals.length === 0) {
      return 0;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Filter meals consumed today
    const todaysMeals = consumedMeals.filter(meal => 
      new Date(meal.consumedAt).toISOString().split('T')[0] === today
    );
    
    // Sum up calories from today's consumed meals - only calories, not protein or other macros
    let totalCalories = 0;
    
    // If the API isn't providing the right calorie data, we can add a fallback
    // This is a simplified version that avoids double-counting or adding proteins
    
    // Depending on your API, you may need to adjust this logic
    // For now, we'll just use a fixed value per meal if your API data structure doesn't match
    
    // Option 1: If meals have proper calorie data
    todaysMeals.forEach(meal => {
      if (meal.calories) {
        totalCalories += meal.calories;
      } else {
        // Option 2: If we need to look up the calorie data
        const mealPlan = mealPlans.find(mp => mp.mealPlanId === meal.mealPlanId);
        if (mealPlan) {
          totalCalories += mealPlan.calories;
        } else {
          // Option 3: Fallback to a reasonable default if needed
          totalCalories += 300; // Average meal calories as fallback
        }
      }
    });
    
    return totalCalories;
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated || !getUserId()) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = getUserId();

        // Fetch dashboard data
        const response = await fetch(`http://localhost:8000/api/dashboard/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const dashboardData: DashboardData = await response.json();
        
        // Fetch workout plan
        const workoutResponse = await fetch(`http://localhost:8000/api/workout-plans/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        let workoutPlanData = null;
        if (workoutResponse.ok) {
          const plans = await workoutResponse.json();
          if (plans && plans.length > 0) {
            workoutPlanData = plans[0]; // Get the first (most recent) workout plan
          }
        }
        
        // Fetch consumed meals for today
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        const mealsResponse = await fetch(
          `http://localhost:8000/api/meal-consumption?userId=${userId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        let consumedMealsData: ConsumedMeal[] = [];
        if (mealsResponse.ok) {
          consumedMealsData = await mealsResponse.json();
        }
        
        // Fetch meal plans to get calorie information
        const mealPlansResponse = await fetch(
          `http://localhost:8000/api/nutrition-plans?userId=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        let mealPlansData: MealPlan[] = [];
        if (mealPlansResponse.ok) {
          const plans = await mealPlansResponse.json();
          if (plans && plans.length > 0 && plans[0].mealPlans) {
            mealPlansData = plans[0].mealPlans;
          }
        }
        
        // Calculate the current streak
        const currentStreak = calculateStreak();
        
        // Get today's workout
        const todaysWorkout = getTodaysWorkout(workoutPlanData);
        
        // Calculate calories consumed today
        const caloriesToday = calculateCaloriesToday(consumedMealsData, mealPlansData);
        
        // Update the dashboard data
        setData({
          ...dashboardData,
          streak: currentStreak,
          todaysWorkout: todaysWorkout || dashboardData.todaysWorkout,
          caloriesToday
        });
        
        // Store the fetched data
        setWorkoutPlan(workoutPlanData);
        setConsumedMeals(consumedMealsData);
        setMealPlans(mealPlansData);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    
    // Set up an event listener for meal consumption updates
    const handleMealConsumed = () => {
      fetchDashboardData();
    };
    
    window.addEventListener("mealConsumed", handleMealConsumed);
    
    return () => {
      window.removeEventListener("mealConsumed", handleMealConsumed);
    };
  }, [isAuthenticated, getUserId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading dashboard</div>;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h2>
        <Button className="bg-red-500 hover:bg-red-600">
          <Plus className="mr-2 h-4 w-4" /> New Workout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-red-500 to-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium text-white">Current Streak</CardTitle>
            <Flame className="h-3 w-3 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{data.streak} Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Today's Workout</CardTitle>
            <Dumbbell className="h-3 w-3 text-black-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold break-words">
              {data.todaysWorkout?.name || "Rest Day"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {data.todaysWorkout
                ? `${data.todaysWorkout.targetMuscleGroups} - ${data.todaysWorkout.duration} mins`
                : "No workout scheduled"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Calories Today</CardTitle>
            <Apple className="h-3 w-3 text-green-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{data.caloriesToday}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {data.goals?.calories ? `Goal: ${data.goals.calories} calories` : 'Track your daily intake'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /> {/* Updated to use full date */}
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weight" // Updated to match Progress Tracking
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <CardDescription>Your daily fitness priorities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Dumbbell className="mr-2 h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Workout Focus</p>
                <p className="text-sm text-muted-foreground">
                  {data.todaysWorkout
                    ? data.todaysWorkout.targetMuscleGroups
                    : "Rest & Recovery"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Apple className="mr-2 h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium">Nutrition Goal</p>
                <p className="text-sm text-muted-foreground">
                  {data.goals.calories
                    ? `Reach ${data.goals.calories} calories`
                    : "Maintain balanced intake"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Timer className="mr-2 h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Activity Time</p>
                <p className="text-sm text-muted-foreground">
                  {data.todaysWorkout
                    ? `${data.todaysWorkout.duration} minutes`
                    : "Active recovery day"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}