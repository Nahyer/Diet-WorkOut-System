"use client"

import { useState } from "react"
import { Camera, Download, Award, TrendingUp, Ruler, Dumbbell, Share2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Mock data
const weightData = [
  { date: "Jan", weight: 185 },
  { date: "Feb", weight: 183 },
  { date: "Mar", weight: 181 },
  { date: "Apr", weight: 179 },
  { date: "May", weight: 178 },
  { date: "Jun", weight: 176 },
]

const measurementsData = [
  { date: "Jan", chest: 42, waist: 34, arms: 15 },
  { date: "Feb", chest: 42.5, waist: 33.5, arms: 15.2 },
  { date: "Mar", chest: 43, waist: 33, arms: 15.5 },
  { date: "Apr", chest: 43.5, waist: 32.5, arms: 15.7 },
  { date: "May", chest: 44, waist: 32, arms: 16 },
  { date: "Jun", chest: 44.5, waist: 31.5, arms: 16.2 },
]

const strengthData = [
  { exercise: "Bench Press", previous: 185, current: 225 },
  { exercise: "Squat", previous: 225, current: 275 },
  { exercise: "Deadlift", previous: 275, current: 315 },
  { exercise: "Shoulder Press", previous: 115, current: 135 },
]

const achievements = [
  {
    title: "Weight Loss Champion",
    description: "Lost 10 pounds",
    icon: TrendingUp,
    progress: 100,
    color: "text-green-500",
  },
  {
    title: "Strength Warrior",
    description: "Increased all lifts by 20%",
    icon: Dumbbell,
    progress: 80,
    color: "text-blue-500",
  },
  {
    title: "Consistency King",
    description: "Worked out 20 days in a row",
    icon: Award,
    progress: 75,
    color: "text-yellow-500",
  },
]

export default function ProgressPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your fitness journey</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {}}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Progress
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9 lbs</div>
            <p className="text-xs text-muted-foreground">-2 lbs this month</p>
            <Progress value={75} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strength Increase</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+25%</div>
            <p className="text-xs text-muted-foreground">Across major lifts</p>
            <Progress value={85} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <Ruler className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18%</div>
            <p className="text-xs text-muted-foreground">-2% from start</p>
            <Progress value={65} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 new this month</p>
            <Progress value={80} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="photos">Progress Photos</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Photos</CardTitle>
              <CardDescription>Track your visual progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold">Before Photo</h3>
                      <p className="mt-1 text-sm text-gray-500">Upload your starting point photo</p>
                      <Button className="mt-4" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Photo
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold">After Photo</h3>
                      <p className="mt-1 text-sm text-gray-500">Upload your current photo</p>
                      <Button className="mt-4" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="weight" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Track your key measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="chest" stroke="#ef4444" />
                      <Line type="monotone" dataKey="waist" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="arms" stroke="#eab308" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strength" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strength Progress</CardTitle>
              <CardDescription>Track your lifting improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exercise" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="previous" fill="#94a3b8" name="Previous" />
                    <Bar dataKey="current" fill="#ef4444" name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                    <Progress value={achievement.progress} className="w-1/2 h-2" />
                  </div>
                  <CardTitle className="mt-4">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

