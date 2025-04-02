"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Dumbbell,
  Apple,
  Timer,
  Flame,
} from "lucide-react";
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
import { format, differenceInDays, startOfDay } from "date-fns";

interface DashboardData {
  user: { fullName: string };
  streak: number;
  todaysWorkout: { name: string; description: string; duration: number; targetMuscleGroups: string } | null;
  caloriesToday: number;
  weightData: { date: string; weight: number }[];
  goals: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    workoutCompleted: boolean;
  };
}

interface WorkoutSession {
  sessionId: number;
  dayNumber: number;
  name: string;
  description: string;
  targetMuscleGroups: string;
  duration: number;
}

interface WorkoutPlan {
  planId: number;
  createdAt: string;
  sessions: WorkoutSession[];
}

interface ConsumedMeal {
  mealPlanId: number;
  dayNumber: number;
  consumedAt: string;
  calories: number;
}

interface MealPlan {
  mealPlanId: number;
  calories: number;
}

export default function Dashboard() {
  const { getUserId, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user ID for unique localStorage keys
  const userId = getUserId();

  // Use the fullName from the API response (data.user.fullName)
  const firstName = data?.user?.fullName ? data.user.fullName.split(" ")[0] : "User";

  // Function to calculate the current streak
  function calculateStreak() {
    if (!userId) return 0;

    const streakKey = `userStreak_${userId}`;
    const lastLoginKey = `lastLoginDate_${userId}`;

    const lastLoginDateStr = localStorage.getItem(lastLoginKey);
    const storedStreakStr = localStorage.getItem(streakKey);

    const today = startOfDay(new Date());
    const todayStr = format(today, "yyyy-MM-dd");

    let currentStreak = storedStreakStr && !isNaN(parseInt(storedStreakStr))
      ? parseInt(storedStreakStr)
      : 0;

    if (!lastLoginDateStr) {
      currentStreak = 1;
    } else {
      const lastLoginDate = startOfDay(new Date(lastLoginDateStr));
      if (lastLoginDateStr === todayStr) {
        // No change to streak
      } else {
        const dayDiff = differenceInDays(today, lastLoginDate);
        if (dayDiff === 1) {
          currentStreak += 1;
        } else if (dayDiff > 1 || dayDiff < 0) {
          currentStreak = 1;
        }
      }
    }

    localStorage.setItem(streakKey, currentStreak.toString());
    localStorage.setItem(lastLoginKey, todayStr);

    return currentStreak;
  }

  const calculateCurrentDayNumber = (createdAt: string): number => {
    const startDate = startOfDay(new Date(createdAt));
    const today = startOfDay(new Date());
    const diffDays = differenceInDays(today, startDate);
    const dayNumber = (diffDays % 7) + 1;
    return dayNumber > 0 ? dayNumber : 1;
  };

  const getTodaysWorkout = (workoutPlan: WorkoutPlan | null) => {
    if (!workoutPlan || !workoutPlan.sessions || workoutPlan.sessions.length === 0) {
      return null;
    }

    const dayNumber = calculateCurrentDayNumber(workoutPlan.createdAt);
    console.log(`Calculated day number for dashboard: ${dayNumber}`);

    const todaysSession = workoutPlan.sessions.find(session => session.dayNumber === dayNumber);

    return todaysSession ? {
      name: todaysSession.name,
      description: todaysSession.description,
      duration: todaysSession.duration,
      targetMuscleGroups: todaysSession.targetMuscleGroups,
    } : null;
  };

  const calculateCaloriesToday = (consumedMeals: ConsumedMeal[], mealPlans: MealPlan[]) => {
    if (!consumedMeals || consumedMeals.length === 0) {
      return 0;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const todaysMeals = consumedMeals.filter(meal =>
      format(new Date(meal.consumedAt), "yyyy-MM-dd") === today
    );

    let totalCalories = 0;

    todaysMeals.forEach(meal => {
      if (meal.calories) {
        totalCalories += meal.calories;
      } else {
        const mealPlan = mealPlans.find(mp => mp.mealPlanId === meal.mealPlanId);
        totalCalories += mealPlan ? mealPlan.calories : 300;
      }
    });

    return totalCalories;
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated || !userId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:8000/api/dashboard/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const dashboardData: DashboardData = await response.json();
        console.log("Dashboard data from API:", dashboardData);

        const workoutResponse = await fetch(`http://localhost:8000/api/workout-plans/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let workoutPlan: WorkoutPlan | null = null;
        if (workoutResponse.ok) {
          const plans = await workoutResponse.json();
          if (plans && plans.length > 0) {
            workoutPlan = plans[0];
          }
        }

        const today = new Date();
        const startOfDayDate = startOfDay(today);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const mealsResponse = await fetch(
          `http://localhost:8000/api/meal-consumption?userId=${userId}&startDate=${startOfDayDate.toISOString()}&endDate=${endOfDay.toISOString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const consumedMeals: ConsumedMeal[] = mealsResponse.ok ? await mealsResponse.json() : [];

        const mealPlansResponse = await fetch(
          `http://localhost:8000/api/nutrition-plans?userId=${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let mealPlans: MealPlan[] = [];
        if (mealPlansResponse.ok) {
          const plans = await mealPlansResponse.json();
          if (plans && plans.length > 0 && plans[0].mealPlans) {
            mealPlans = plans[0].mealPlans;
          }
        }

        const currentStreak = calculateStreak();
        const todaysWorkout = getTodaysWorkout(workoutPlan);
        const caloriesToday = calculateCaloriesToday(consumedMeals, mealPlans);

        setData({
          ...dashboardData,
          streak: currentStreak,
          todaysWorkout: todaysWorkout || dashboardData.todaysWorkout,
          caloriesToday,
        });
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    const handleMealConsumed = () => {
      fetchDashboardData();
    };

    window.addEventListener("mealConsumed", handleMealConsumed);

    return () => {
      window.removeEventListener("mealConsumed", handleMealConsumed);
    };
  }, [isAuthenticated, userId, calculateStreak, getTodaysWorkout]); // Added dependencies

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading dashboard</div>;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h2>
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
            <CardTitle className="text-xs font-medium">Today\'s Workout</CardTitle>
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
              {data.goals?.calories ? `Goal: ${data.goals.calories} calories` : "Track your daily intake"}
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
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weight"
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
            <CardTitle>Today\'s Focus</CardTitle>
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