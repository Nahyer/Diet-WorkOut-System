// pages/dashboard.tsx
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

export default function Dashboard() {
  const { user, getUserId, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "User";

  useEffect(() => {
    async function fetchDashboardData() {
      if (!isAuthenticated || !getUserId()) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/dashboard/${getUserId()}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const dashboardData: DashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
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
            <p className="text-[10px] text-muted-foreground"></p>
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