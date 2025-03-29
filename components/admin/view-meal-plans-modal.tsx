"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Utensils } from "lucide-react"

type MealPlan = {
  mealPlanId: number;
  nutritionPlanId: number;
  dayNumber: number;
  mealTime: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipe: string;
};

interface ViewMealPlansModalProps {
  nutritionPlanId: number;
  trigger?: React.ReactNode;
}

export function ViewMealPlansModal({ nutritionPlanId, trigger }: ViewMealPlansModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [activeDay, setActiveDay] = useState("1")
  
  const { toast } = useToast()

  // Function to format meal time string
  const formatMealTime = (mealTime: string) => {
    return mealTime.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }
  
  // Function to get badge color based on meal time
  const getMealTimeBadgeColor = (mealTime: string) => {
    switch (mealTime) {
      case 'breakfast':
        return 'bg-orange-100 text-orange-800';
      case 'morning_snack':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-green-100 text-green-800';
      case 'afternoon_snack':
        return 'bg-blue-100 text-blue-800';
      case 'dinner':
        return 'bg-purple-100 text-purple-800';
      case 'evening_snack':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Load meal plans when the modal is opened
  const loadMealPlans = useCallback(async () => {
    if (!isOpen) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await fetch(`http://localhost:8000/api/nutrition-plans/${nutritionPlanId}/meal-plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch meal plans")
      }
      
      const data = await response.json()
      setMealPlans(data)
      
      // Set active day to the first day that has meal plans
      if (data.length > 0) {
        const days = [...new Set(data.map(meal => meal.dayNumber))]
        if (days.length > 0) {
          setActiveDay(days[0].toString())
        }
      }
      
    } catch (error) {
      console.error("Error loading meal plans:", error)
      toast({
        title: "Error",
        description: "Failed to load meal plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, nutritionPlanId, toast]);
  
  // Effect to load meal plans when the modal is opened
  useEffect(() => {
    loadMealPlans();
  }, [isOpen, nutritionPlanId, loadMealPlans]);

  // Get unique day numbers for tabs
  const uniqueDays = [...new Set(mealPlans.map(meal => meal.dayNumber))].sort((a, b) => a - b);
  
  // Filter meals for the active day
  const mealsForActiveDay = mealPlans.filter(meal => meal.dayNumber === Number(activeDay));
  
  // Sort meals by a logical meal time order
  const mealTimeOrder = {
    breakfast: 1,
    morning_snack: 2,
    lunch: 3,
    afternoon_snack: 4,
    dinner: 5,
    evening_snack: 6
  };
  
  const sortedMeals = mealsForActiveDay.sort((a, b) => {
    const orderA = mealTimeOrder[a.mealTime as keyof typeof mealTimeOrder] || 99;
    const orderB = mealTimeOrder[b.mealTime as keyof typeof mealTimeOrder] || 99;
    return orderA - orderB;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Utensils className="mr-2 h-4 w-4" />
            View Meal Plans
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meal Plans for Nutrition Plan #{nutritionPlanId}</DialogTitle>
          <DialogDescription>
            View all meals organized by day for this nutrition plan.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading meal plans...</p>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground">No meal plans found for this nutrition plan.</p>
            <Button className="mt-4" onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        ) : (
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              {uniqueDays.map((day) => (
                <TabsTrigger key={day} value={day.toString()}>
                  Day {day}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeDay} className="space-y-4">
              {sortedMeals.map((meal) => (
                <Card key={meal.mealPlanId}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meal.name}</CardTitle>
                        <CardDescription>
                          <Badge className={getMealTimeBadgeColor(meal.mealTime)}>
                            {formatMealTime(meal.mealTime)}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{meal.calories} kcal</span>
                        <p className="text-sm text-muted-foreground">
                          P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold">Description</h4>
                        <p className="text-sm">{meal.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Recipe</h4>
                        <p className="text-sm">{meal.recipe}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}