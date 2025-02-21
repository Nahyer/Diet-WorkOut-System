"use client"

import { useState } from "react"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import {
  FileText,
  Download,
  Filter,
  Users,
  Activity,
  TrendingUp,
  Dumbbell,
  Apple,
  Share2,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RevenueChart } from "@/components/admin/reports/revenue-chart"
import { UserActivityChart } from "@/components/admin/reports/user-activity-chart"
import { WorkoutMetricsChart } from "@/components/admin/reports/workout-metrics-chart"
import { NutritionDistributionChart } from "@/components/admin/reports/nutrition-distribution-chart"

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">View and analyze comprehensive system metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            <Progress value={75} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180 since last week</p>
            <Progress value={45} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Completion</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last week</p>
            <Progress value={85} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutrition Goals</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last week</p>
            <Progress value={78} className="mt-2 h-1" />
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
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue trends and projections</CardDescription>
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
                <RevenueChart />
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-xs text-muted-foreground">Feb 15, 2024 at 14:30</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Report"}
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
                <p className="text-xs text-muted-foreground">Feb 15, 2024 at 15:45</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue and transaction analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-yellow-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Last Generated</p>
                <p className="text-xs text-muted-foreground">Feb 15, 2024 at 16:20</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

