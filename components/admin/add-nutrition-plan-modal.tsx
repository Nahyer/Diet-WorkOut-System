"use client"

import { useState } from "react"
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

// Define props for component
interface AddNutritionPlanModalProps {
  onNutritionPlanAdded: () => void;
  trigger?: React.ReactNode;
}

export function AddNutritionPlanModal({ onNutritionPlanAdded, trigger }: AddNutritionPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [goal, setGoal] = useState("weight_loss")
  const [dailyCalories, setDailyCalories] = useState(2000)
  const [proteinGrams, setProteinGrams] = useState(150)
  const [carbsGrams, setCarbsGrams] = useState(200)
  const [fatGrams, setFatGrams] = useState(67)
  const [mealsPerDay, setMealsPerDay] = useState(4)
  const [restrictions, setRestrictions] = useState("")
  
  const { toast } = useToast()
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await fetch("http://localhost:8000/api/nutrition-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          goal,
          dailyCalories,
          proteinGrams,
          carbsGrams,
          fatGrams,
          mealsPerDay,
          isAiGenerated: false,
          restrictions: restrictions || "None"
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to create nutrition plan")
      }
      
      // Reset form and close modal
      resetForm()
      setIsOpen(false)
      
      // Show success message
      toast({
        title: "Success",
        description: "Nutrition plan created successfully",
        variant: "success",
      })
      
      // Refresh nutrition plans list
      onNutritionPlanAdded()
      
    } catch (error) {
      console.error("Error creating nutrition plan:", error)
      toast({
        title: "Error",
        description: "Failed to create nutrition plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reset form to default values
  const resetForm = () => {
    setGoal("weight_loss")
    setDailyCalories(2000)
    setProteinGrams(150)
    setCarbsGrams(200)
    setFatGrams(67)
    setMealsPerDay(4)
    setRestrictions("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Nutrition Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Nutrition Plan</DialogTitle>
            <DialogDescription>
              Create a new nutrition plan with macronutrient goals and dietary requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Goal
              </Label>
              <Select
                value={goal}
                onValueChange={setGoal}
              >
                <SelectTrigger id="goal" className="col-span-3">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dailyCalories" className="text-right">
                Daily Calories
              </Label>
              <Input
                id="dailyCalories"
                type="number"
                className="col-span-3"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(Number(e.target.value))}
                placeholder="2000"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proteinGrams" className="text-right">
                Protein (g)
              </Label>
              <Input
                id="proteinGrams"
                type="number"
                className="col-span-3"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(Number(e.target.value))}
                placeholder="150"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carbsGrams" className="text-right">
                Carbs (g)
              </Label>
              <Input
                id="carbsGrams"
                type="number"
                className="col-span-3"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(Number(e.target.value))}
                placeholder="200"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fatGrams" className="text-right">
                Fat (g)
              </Label>
              <Input
                id="fatGrams"
                type="number"
                className="col-span-3"
                value={fatGrams}
                onChange={(e) => setFatGrams(Number(e.target.value))}
                placeholder="67"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mealsPerDay" className="text-right">
                Meals Per Day
              </Label>
              <Select
                value={mealsPerDay.toString()}
                onValueChange={(value) => setMealsPerDay(Number(value))}
              >
                <SelectTrigger id="mealsPerDay" className="col-span-3">
                  <SelectValue placeholder="Select number of meals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meals</SelectItem>
                  <SelectItem value="4">4 meals</SelectItem>
                  <SelectItem value="5">5 meals</SelectItem>
                  <SelectItem value="6">6 meals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restrictions" className="text-right">
                Restrictions
              </Label>
              <Textarea
                id="restrictions"
                className="col-span-3"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="E.g., vegetarian, gluten-free, lactose intolerant"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}