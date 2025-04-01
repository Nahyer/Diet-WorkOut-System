"use client";

import { useState, useEffect } from "react";
import { Download, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userService } from "@/app/services/user";
import { Pagination } from "@/components/common/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable directly

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

// Define predefined date range options
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
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        // Fetch users using userService.getActiveUsers
        const userData = await userService.getActiveUsers(token);

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

        // For simplicity, assume "change" is 0 since we don't have previous period data
        const metrics: KeyMetrics = {
          activeUsers: {
            count: activeUsersCount,
            change: 0,
          },
          newUsers: {
            count: newUsersCount,
            change: 0,
          },
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

  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6">Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">View and analyze user-related metrics</p>
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
          <Button onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics?.activeUsers.count.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(keyMetrics?.activeUsers.change || 0)} since last period
            </p>
            <Progress
              value={((keyMetrics?.activeUsers.count || 0) / 5000) * 100} // Assuming 5000 as a max for visualization
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics?.newUsers.count.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">
              {formatChange(keyMetrics?.newUsers.change || 0)} since last period
            </p>
            <Progress
              value={((keyMetrics?.newUsers.count || 0) / 1000) * 100} // Assuming 1000 as a max for visualization
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-3">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>User growth trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Growth Trend */}
              <div>
                <h3 className="text-lg font-semibold mb-2">User Growth Over Time</h3>
                {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No user growth data available for this period.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Generation Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
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
            {/* User List Table with Pagination */}
            {users.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">All Users</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                        <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>{user.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(users.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <p className="text-muted-foreground">No users found.</p>
            )}
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("user-activity")}
              disabled={isGenerating["user-activity"]}
            >
              {isGenerating["user-activity"] ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}