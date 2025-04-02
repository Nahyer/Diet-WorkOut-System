"use client"

import {
  Download,
  Filter,
  Users,
  Activity,
  Dumbbell,
  Apple,
  Share2,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserActivityChart } from "@/components/admin/reports/user-activity-chart"
import { WorkoutMetricsChart } from "@/components/admin/reports/workout-metrics-chart"
import { NutritionDistributionChart } from "@/components/admin/reports/nutrition-distribution-chart"

import { useState, useEffect } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable directly
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"

// Define types for the data
type User = {
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

interface KeyMetrics {
  activeUsers: {
    count: number;
    change: number;
  };
  newUsers: {
    count: number;
    change: number;
  };
  workoutCompletion: {
    percentage: number;
    change: number;
  };
  nutritionGoals: {
    percentage: number;
    change: number;
  };
}

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
}

interface ReportMetadata {
  lastGenerated: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

const dateRangeOptions = [
  { label: "Last 7 Days", value: "last7days" },
  { label: "Last 30 Days", value: "last30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 3 Months", value: "last3months" },
];

// Function to calculate date range based on the selected option
const calculateDateRange = (range: string): DateRange => {
  const today = new Date();
  switch (range) {
    case "last7days":
      return { from: subDays(today, 7), to: today };
    case "last30days":
      return { from: subDays(today, 30), to: today };
    case "thisMonth":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "lastMonth":
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    case "last3months":
      return { from: subMonths(today, 3), to: today };
    default:
      return { from: subDays(today, 7), to: today }; // Default to last 7 days
  }
};

export default function ReportsPage() {
  const router = useRouter();
  const { 
    isAdmin, 
    loading: authLoading, 
    isAuthenticated,
    apiRequest 
  } = useAuth();
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState<string>("last7days");
  const [dateRange, setDateRange] = useState<DateRange>(calculateDateRange("last7days"));
  const [keyMetrics, setKeyMetrics] = useState<KeyMetrics | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [userActivityReport, setUserActivityReport] = useState<ReportMetadata | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({
    "user-activity": false,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 users per page
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);


  // Update date range when the selected range changes
  useEffect(() => {
    const newDateRange = calculateDateRange(selectedRange);
    setDateRange(newDateRange);
  }, [selectedRange]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(users.slice(startIndex, endIndex));
  }, [users, currentPage, itemsPerPage]);

  // Fetch data when the date range changes
  useEffect(() => {
    async function fetchData() {
      // Only fetch data if user is authenticated and is an admin
      if (!isAuthenticated || !isAdmin) return;
      
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        // Fetch users using apiRequest from AuthContext
        const response = await apiRequest(`${API_URL}/api/users/active`);
        if (!response.ok) {
          throw new Error("Failed to fetch users. Please try again.");
        }
        
        const userData = await response.json();

        // Process users to add calculated fields
        const processedUsers = userData.map((user: User) => ({
          ...user,
          lastActive: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : 'Never',
          status: "active", // All users from getActiveUsers are active
        }));
        setUsers(processedUsers);

        // Calculate key metrics
        const activeUsersCount = processedUsers.length; // All users from getActiveUsers are active
        const newUsersCount = processedUsers.filter((user: User) =>
          isWithinInterval(new Date(user.createdAt), {
            start: dateRange.from,
            end: dateRange.to,
          })
        ).length;

         // Fetch workout completion statistics
         const workoutStatsResponse = await apiRequest(`${API_URL}/api/stats/workouts?from=${format(dateRange.from, 'yyyy-MM-dd')}&to=${format(dateRange.to, 'yyyy-MM-dd')}`);
         let workoutCompletionPercentage = 75.8; // Default fallback value
         let workoutCompletionChange = 1.2; // Default fallback value
         
         if (workoutStatsResponse.ok) {
          const workoutStats = await workoutStatsResponse.json();
          workoutCompletionPercentage = workoutStats.completionRate || workoutCompletionPercentage;
          workoutCompletionChange = workoutStats.change || workoutCompletionChange;
        }
        
        // Fetch nutrition goal statistics
        const nutritionStatsResponse = await apiRequest(`${API_URL}/api/stats/nutrition?from=${format(dateRange.from, 'yyyy-MM-dd')}&to=${format(dateRange.to, 'yyyy-MM-dd')}`);
        let nutritionGoalsPercentage = 68.5; // Default fallback value
        let nutritionGoalsChange = 3; // Default fallback value
        
        if (nutritionStatsResponse.ok) {
          const nutritionStats = await nutritionStatsResponse.json();
          console.log("🚀 ~ fetchData ~ nutritionStats:", nutritionStats)
          nutritionGoalsPercentage = nutritionStats.completionRate ;
          nutritionGoalsChange = nutritionStats.change ;
        }

        // For simplicity, we'll use the fetched data or fallbacks
        const metrics: KeyMetrics = {
          activeUsers: {
            count: activeUsersCount,
            change: 5, // This would ideally come from the API
          },
          newUsers: {
            count: newUsersCount,
            change: 3, // This would ideally come from the API
          },
          workoutCompletion: {
            percentage: workoutCompletionPercentage,
            change: workoutCompletionChange,
          },
          nutritionGoals: {
            percentage: nutritionGoalsPercentage,
            change: nutritionGoalsChange,
          }
        };
        setKeyMetrics(metrics);


        // Calculate user growth over time
        const userGrowthMap: { [key: string]: number } = {};
        processedUsers.forEach((user: User) => {
          const registrationDate = format(new Date(user.createdAt), "yyyy-MM-dd");
          if (
            isWithinInterval(new Date(user.createdAt), {
              start: dateRange.from,
              end: dateRange.to,
            })
          ) {
            userGrowthMap[registrationDate] = (userGrowthMap[registrationDate] || 0) + 1;
          }
        });

        const userGrowth = Object.keys(userGrowthMap)
          .sort()
          .map((date) => ({
            date,
            count: userGrowthMap[date],
          }));
        setAnalyticsData({ userGrowth });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load report data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange, toast]);

  // Export users as PDF
  const exportUsers = () => {
    try {
      const doc = new jsPDF();
      doc.text("Users Export", 20, 20);

      const tableData = users.map((user) => [
        user.fullName,
        user.email,
        user.role,
        format(new Date(user.createdAt), "MMM d, yyyy"),
        user.lastActive || "Never",
        user.status || "active",
      ]);

      autoTable(doc, {
        head: [["Full Name", "Email", "Role", "Registered", "Last Active", "Status"]],
        body: tableData,
        startY: 30,
      });

      doc.save(`users-export-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({
        title: "Success",
        description: "Users exported successfully as PDF.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting users:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export users. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle report generation
  const handleGenerateReport = (type: "user-activity") => {
    setIsGenerating((prev) => ({ ...prev, [type]: true }));
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      // Generate PDF report client-side using jsPDF
      const doc = new jsPDF();
      doc.text("User Activity Report", 20, 20);
      doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 30);

      const tableData = users.map((user) => [
        user.fullName,
        user.email,
        user.role,
        format(new Date(user.createdAt), "MMM d, yyyy"),
        user.lastActive || "Never",
        user.status || "active",
      ]);

      autoTable(doc, {
        head: [["Full Name", "Email", "Role", "Registered", "Last Active", "Status"]],
        body: tableData,
        startY: 40,
      });

      doc.save(`user-activity-report-${startDate}-to-${endDate}.pdf`);
      setUserActivityReport({
        lastGenerated: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Report generated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Format change value for display
  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}`;
  };

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">View and analyze comprehensive system metrics</p>
        </div>
        <div className="flex items-center space-x-2">
        <Select onValueChange={setSelectedRange} defaultValue="last7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
          </span>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics?.activeUsers.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(keyMetrics?.activeUsers.change || 0)} since last period
            </p>
            <Progress 
              value={keyMetrics?.activeUsers.count ? Math.min(100, (keyMetrics.activeUsers.count / 5000) * 100) : 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Completion</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics?.workoutCompletion.percentage.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(keyMetrics?.workoutCompletion.change || 0)} from last period
            </p>
            <Progress 
              value={keyMetrics?.workoutCompletion.percentage || 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutrition Goals</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics?.nutritionGoals.percentage.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(keyMetrics?.nutritionGoals.change || 0)} from last period
            </p>
            <Progress 
              value={keyMetrics?.nutritionGoals.percentage || 0} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="workout">Workout</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Monthly user registration trends</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                      <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                      <DropdownMenuItem>Last 3 months</DropdownMenuItem>
                      <DropdownMenuItem>Last year</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {analyticsData && analyticsData.userGrowth && (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={analyticsData.userGrowth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <UserActivityChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Comprehensive system analytics and trends</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">{/* Add detailed analytics content */}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="workout" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workout Metrics</CardTitle>
                  <CardDescription>Performance and completion statistics</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <WorkoutMetricsChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nutrition Distribution</CardTitle>
                  <CardDescription>Macro and micronutrient analysis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <NutritionDistributionChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Generation Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity Report</CardTitle>
            <CardDescription>Comprehensive user engagement analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Last Generated</p>
                <p className="text-xs text-muted-foreground">
                  {userActivityReport?.lastGenerated 
                    ? format(new Date(userActivityReport.lastGenerated), "MMM d, yyyy 'at' HH:mm") 
                    : "Never"}
                </p>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleGenerateReport("user-activity")} 
              disabled={isGenerating["user-activity"]}
            >
              {isGenerating["user-activity"] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System performance and health statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Last Generated</p>
                <p className="text-xs text-muted-foreground">Never</p>
              </div>
            </div>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

