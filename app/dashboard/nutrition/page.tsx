"use client"

import { useState } from "react"
import { Plus, Search, Apple, Droplets, Coffee, Sun, Moon, UtensilsCrossed, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

// Mock data
const macroData = [
  { name: "Protein", value: 150, goal: 180, color: "#ef4444" },
  { name: "Carbs", value: 200, goal: 250, color: "#3b82f6" },
  { name: "Fats", value: 65, goal: 70, color: "#eab308" },
]

const waterData = [
  { time: "8AM", amount: 250 },
  { time: "10AM", amount: 500 },
  { time: "12PM", amount: 750 },
  { time: "2PM", amount: 1000 },
  { time: "4PM", amount: 1250 },
  { time: "6PM", amount: 1500 },
]

const meals = [
  {
    type: "Breakfast",
    time: "8:00 AM",
    foods: [
      { name: "Oatmeal with fruits", calories: 350, protein: 12, image: "/placeholder.svg?height=100&width=100" },
      { name: "Greek Yogurt", calories: 120, protein: 15, image: "/placeholder.svg?height=100&width=100" },
    ],
  },
  {
    type: "Lunch",
    time: "1:00 PM",
    foods: [
      { name: "Grilled Chicken Salad", calories: 450, protein: 35, image: "/placeholder.svg?height=100&width=100" },
      { name: "Quinoa", calories: 180, protein: 8, image: "/placeholder.svg?height=100&width=100" },
    ],
  },
  {
    type: "Dinner",
    time: "7:00 PM",
    foods: [
      { name: "Salmon with Vegetables", calories: 520, protein: 40, image: "/placeholder.svg?height=100&width=100" },
      { name: "Sweet Potato", calories: 150, protein: 2, image: "/placeholder.svg?height=100&width=100" },
    ],
  },
]

const recipes = [
  {
    name: "Protein Smoothie Bowl",
    calories: 380,
    protein: 25,
    time: "10 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    name: "Chicken Stir-Fry",
    calories: 450,
    protein: 35,
    time: "20 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    name: "Greek Salad",
    calories: 320,
    protein: 15,
    time: "15 min",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function NutritionPage() {
  const [waterIntake, setWaterIntake] = useState(1500)
  const waterGoal = 2500

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
          <p className="text-muted-foreground">Track your meals and nutritional goals</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Shopping List
          </Button>
          <Button className="bg-red-500 hover:bg-red-600">
            <Plus className="mr-2 h-4 w-4" />
            Log Meal
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calories Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,850 / 2,200</div>
            <p className="text-xs text-muted-foreground">350 calories remaining</p>
            <Progress value={75} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Water Intake Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {waterIntake}ml / {waterGoal}ml
            </div>
            <p className="text-xs text-muted-foreground">{waterGoal - waterIntake}ml remaining</p>
            <Progress value={(waterIntake / waterGoal) * 100} className="mt-3 h-2" />
            <div className="mt-3 flex gap-2">
              {[250, 500, 750].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setWaterIntake(Math.min(waterIntake + amount, waterGoal))}
                >
                  +{amount}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Protein Intake Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein Intake</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120g / 150g</div>
            <p className="text-xs text-muted-foreground">30g remaining</p>
            <Progress value={80} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="meals">Daily Meals</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          {meals.map((meal, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {meal.type === "Breakfast" && <Coffee className="h-5 w-5 text-orange-500" />}
                    {meal.type === "Lunch" && <Sun className="h-5 w-5 text-yellow-500" />}
                    {meal.type === "Dinner" && <Moon className="h-5 w-5 text-blue-500" />}
                    <div>
                      <CardTitle>{meal.type}</CardTitle>
                      <CardDescription>{meal.time}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {meal.foods.map((food, foodIndex) => (
                    <div key={foodIndex} className="flex items-center space-x-4">
                      <img
                        src={food.image || "/placeholder.svg"}
                        alt={food.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.calories} cal • {food.protein}g protein
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="macros">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Macro Distribution</CardTitle>
                <CardDescription>Daily macro nutrient breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  {macroData.map((macro, index) => (
                    <div key={index}>
                      <div className="text-sm font-medium">{macro.name}</div>
                      <div className="text-2xl font-bold" style={{ color: macro.color }}>
                        {Math.round((macro.value / macro.goal) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {macro.value}g / {macro.goal}g
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Water Intake</CardTitle>
                <CardDescription>Today's hydration tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={waterData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search recipes..." className="pl-9" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe, index) => (
              <Card key={index} className="overflow-hidden">
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.name} className="aspect-video object-cover" />
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                  <CardDescription>
                    {recipe.calories} cal • {recipe.protein}g protein • {recipe.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Recipe</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

