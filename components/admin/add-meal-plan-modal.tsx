"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"

// Define Nutrition Plan type
type NutritionPlan = {
  nutritionPlanId: number;
  userId: number;
  goal: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsPerDay: number;
  isAiGenerated: boolean;
  restrictions: string;
  createdAt: string;
  updatedAt: string;
};

// Define props for component
interface AddMealPlanModalProps {
  onMealPlanAdded: () => void;
  nutritionPlans: NutritionPlan[];
  preselectedNutritionPlanId?: number;
  trigger?: React.ReactNode;
}

export function AddMealPlanModal({ 
  onMealPlanAdded, 
  nutritionPlans, 
  preselectedNutritionPlanId,
  trigger 
}: AddMealPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [nutritionPlanId, setNutritionPlanId] = useState<number | null>(preselectedNutritionPlanId || null)
  const [dayNumber, setDayNumber] = useState(1)
  const [mealTime, setMealTime] = useState("breakfast")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [calories, setCalories] = useState(400)
  const [protein, setProtein] = useState(25)
  const [carbs, setCarbs] = useState(45)
  const [fat, setFat] = useState(15)
  const [recipe, setRecipe] = useState("")
  
  const { toast } = useToast()
  
  // Effect to set nutritionPlanId when preselected or when nutritionPlans changes
  useEffect(() => {
    if (preselectedNutritionPlanId) {
      setNutritionPlanId(preselectedNutritionPlanId)
    } else if (nutritionPlans.length > 0 && nutritionPlanId === null) {
      setNutritionPlanId(nutritionPlans[0].nutritionPlanId)
    }
  }, [nutritionPlans, preselectedNutritionPlanId, nutritionPlanId])
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nutritionPlanId) {
      toast({
        title: "Error",
        description: "Please select a nutrition plan",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await fetch("http://localhost:8000/api/meal-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nutritionPlanId,
          dayNumber,
          mealTime,
          name,
          description,
          calories,
          protein,
          carbs,
          fat,
          recipe
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to create meal plan")
      }
      
      // Reset form and close modal
      resetForm()
      setIsOpen(false)
      
      // Show success message
      toast({
        title: "Success",
        description: "Meal plan created successfully",
        variant: "success",
      })
      
      // Refresh meal plans list
      onMealPlanAdded()
      
    } catch (error) {
      console.error("Error creating meal plan:", error)
      toast({
        title: "Error",
        description: "Failed to create meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reset form to default values
  const resetForm = () => {
    // Don't reset nutritionPlanId if preselected
    if (!preselectedNutritionPlanId) {
      setNutritionPlanId(nutritionPlans.length > 0 ? nutritionPlans[0].nutritionPlanId : null)
    }
    setDayNumber(1)
    setMealTime("breakfast")
    setName("")
    setDescription("")
    setCalories(400)
    setProtein(25)
    setCarbs(45)
    setFat(15)
    setRecipe("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Meal Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Meal Plan</DialogTitle>
            <DialogDescription>
              Create a new meal for a nutrition plan with specific macronutrients and recipe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!preselectedNutritionPlanId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nutritionPlanId" className="text-right">
                  Nutrition Plan
                </Label>
                <Select
                  value={nutritionPlanId?.toString() || ""}
                  onValueChange={(value) => setNutritionPlanId(Number(value))}
                >
                  <SelectTrigger id="nutritionPlanId" className="col-span-3">
                    <SelectValue placeholder="Select nutrition plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {nutritionPlans.map((plan) => (
                      <SelectItem key={plan.nutritionPlanId} value={plan.nutritionPlanId.toString()}>
                        Plan #{plan.nutritionPlanId} - {plan.goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayNumber" className="text-right">
                Day Number
              </Label>
              <Select
                value={dayNumber.toString()}
                onValueChange={(value) => setDayNumber(Number(value))}
              >
                <SelectTrigger id="dayNumber" className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mealTime" className="text-right">
                Meal Time
              </Label>
              <Select
                value={mealTime}
                onValueChange={setMealTime}
              >
                <SelectTrigger id="mealTime" className="col-span-3">
                  <SelectValue placeholder="Select meal time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="morning_snack">Morning Snack</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="afternoon_snack">Afternoon Snack</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="evening_snack">Evening Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Meal Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., High Protein Breakfast Bowl"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the meal and its benefits"
                rows={2}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                className="col-span-3"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                placeholder="400"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protein" className="text-right">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                className="col-span-3"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                placeholder="25"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carbs" className="text-right">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                className="col-span-3"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                placeholder="45"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fat" className="text-right">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                className="col-span-3"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                placeholder="15"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipe" className="text-right">
                Recipe
              </Label>
              <Textarea
                id="recipe"
                className="col-span-3"
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                placeholder="Instructions for preparing the meal"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}