"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import { Play, Pause, RotateCcw, ChevronRight, Search, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

// Mock data
const workoutEvents = [
  {
    title: "Chest & Triceps",
    start: new Date(2024, 1, 15, 10, 0),
    end: new Date(2024, 1, 15, 11, 30),
  },
  {
    title: "Legs",
    start: new Date(2024, 1, 17, 14, 0),
    end: new Date(2024, 1, 17, 15, 30),
  },
]

const exercises = [
  {
    name: "Bench Press",
    type: "Chest",
    sets: 3,
    reps: 10,
    weight: "185 lbs",
    thumbnail: "/placeholder.svg?height=150&width=250",
  },
  {
    name: "Tricep Dips",
    type: "Triceps",
    sets: 3,
    reps: 12,
    weight: "Bodyweight",
    thumbnail: "/placeholder.svg?height=150&width=250",
  },
  {
    name: "Push-Ups",
    type: "Chest",
    sets: 3,
    reps: 15,
    weight: "Bodyweight",
    thumbnail: "/placeholder.svg?height=150&width=250",
  },
]

export default function WorkoutsPage() {
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Plan</h1>
          <p className="text-muted-foreground">Manage your workout schedule and exercises</p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600">
          <Plus className="mr-2 h-4 w-4" /> New Workout
        </Button>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="workout">Today's Workout</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <Calendar
                localizer={localizer}
                events={workoutEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Workout Details */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Workout: Chest & Triceps</CardTitle>
                <CardDescription>February 15, 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {exercises.map((exercise, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.weight}
                        </p>
                      </div>
                      <Badge variant="secondary">{exercise.type}</Badge>
                    </div>
                    <Progress value={33} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rest Timer */}
            <Card>
              <CardHeader>
                <CardTitle>Rest Timer</CardTitle>
                <CardDescription>Track your rest periods between sets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="text-6xl font-bold tabular-nums">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="icon" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setTimer(0)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center space-x-2">
                  {[30, 60, 90, 120].map((seconds) => (
                    <Button key={seconds} variant="outline" size="sm" onClick={() => setTimer(seconds)}>
                      {seconds}s
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Exercise Library */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => (
              <Card key={index} className="overflow-hidden">
                <img
                  src={exercise.thumbnail || "/placeholder.svg"}
                  alt={exercise.name}
                  className="aspect-video object-cover"
                />
                <CardHeader>
                  <CardTitle>{exercise.name}</CardTitle>
                  <CardDescription>{exercise.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                      <p className="font-medium">{exercise.weight}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

