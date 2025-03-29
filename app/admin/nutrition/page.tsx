"use client"

import { useState, useEffect } from "react"
import { Search, Filter, PlusCircle, MoreHorizontal, Download, Trash2, Utensils, Apple } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/common/pagination"
import { AddNutritionPlanModal } from "@/components/admin/add-nutrition-plan-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ViewMealPlansModal } from "@/components/admin/view-meal-plans-modal"
import { AddMealPlanModal } from "@/components/admin/add-meal-plan-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types based on your API data structure
type MealPlan = {
  mealPlanId: number;
  nutritionPlanId: number;
  dayNumber: number;
  mealTime?: string;
  name?: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipe?: string;
  nutritionPlan?: {
    goal?: string;
    dailyCalories: number;
  };
};

type NutritionPlan = {
  nutritionPlanId: number;
  userId: number;
  goal?: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  mealsPerDay: number;
  isAiGenerated: boolean;
  restrictions?: string;
  createdAt: string;
  updatedAt: string;
  mealPlans?: MealPlan[];
};

export default function NutritionManagement() {
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [filteredNutritionPlans, setFilteredNutritionPlans] = useState<NutritionPlan[]>([]);
  const [filteredMealPlans, setFilteredMealPlans] = useState<MealPlan[]>([]);
  // const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [goalFilter, setGoalFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("nutrition"); // "nutrition" or "meals"
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  // const [ setIsBulkDelete] = useState(false);
  const [deleteType, setDeleteType] = useState<"nutrition" | "meal">("nutrition");
  
  // Success message dialog state
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedItems, setPaginatedItems] = useState<NutritionPlan[] | MealPlan[]>([]);
  
  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Calculate stats
  const nutritionStats = {
    totalPlans: nutritionPlans.length,
    weightLossPlans: nutritionPlans.filter(plan => plan.goal === "weight_loss").length,
    muscleGainPlans: nutritionPlans.filter(plan => plan.goal === "muscle_gain").length,
    maintenancePlans: nutritionPlans.filter(plan => plan.goal === "maintenance").length,
  };
  
  const mealStats = {
    totalMeals: mealPlans.length,
    highProteinMeals: mealPlans.filter(meal => meal.protein > 25).length,
    lowCalorieMeals: mealPlans.filter(meal => meal.calories < 300).length,
    breakfastOptions: mealPlans.filter(meal => meal.mealTime === "breakfast").length,
  };

  // Load nutrition plans from API
  const loadNutritionPlans = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch("http://localhost:8000/api/nutrition-plans", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch nutrition plans");
      }
      
      const data = await response.json();
      setNutritionPlans(data);
      setFilteredNutritionPlans(data);
    } catch (error) {
      console.error("Error loading nutrition plans:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load meal plans from API
  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch("http://localhost:8000/api/meal-plans", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch meal plans");
      }
      
      const data = await response.json();
      setMealPlans(data);
      setFilteredMealPlans(data);
    } catch (error) {
      console.error("Error loading meal plans:", error);
      toast({
        title: "Error",
        description: "Failed to load meal plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadNutritionPlans();
      loadMealPlans();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter nutrition plans
  useEffect(() => {
    let result = [...nutritionPlans];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        plan => 
          (plan.goal?.toLowerCase() || "").includes(query) || 
          (plan.restrictions?.toLowerCase() || "").includes(query) ||
          plan.dailyCalories.toString().includes(query)
      );
    }
    
    // Apply goal filter
    if (goalFilter !== "all") {
      result = result.filter(plan => plan.goal === goalFilter);
    }
    
    // Reset to first page when filters change
    setCurrentPage(1);
    setFilteredNutritionPlans(result);
  }, [nutritionPlans, searchQuery, goalFilter]);
  
  // Filter meal plans
  useEffect(() => {
    let result = [...mealPlans];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        meal => 
          (meal.name?.toLowerCase() || "").includes(query) || 
          (meal.description?.toLowerCase() || "").includes(query) ||
          (meal.mealTime?.toLowerCase() || "").includes(query)
      );
    }
    
    // Reset to first page when filters change
    setCurrentPage(1);
    setFilteredMealPlans(result);
  }, [mealPlans, searchQuery]);
  
  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    if (activeView === "nutrition") {
      setPaginatedItems(filteredNutritionPlans.slice(startIndex, endIndex));
    } else {
      setPaginatedItems(filteredMealPlans.slice(startIndex, endIndex));
    }
  }, [filteredNutritionPlans, filteredMealPlans, currentPage, itemsPerPage, activeView]);

  // Open delete confirmation dialog for a single plan
  const confirmDeletePlan = (id: number, type: "nutrition" | "meal") => {
    setPlanToDelete(id);
    setDeleteType(type);
    // setIsBulkDelete(false);
    setIsDeleteDialogOpen(true);
  };

  // Handle plan deletion
  const handleDeletePlan = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      if (deleteType === "nutrition" && planToDelete) {
        // Delete nutrition plan
        const response = await fetch(`http://localhost:8000/api/nutrition-plans/${planToDelete}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete nutrition plan");
        }
        
        // Update the plans list
        setNutritionPlans(nutritionPlans.filter(plan => plan.nutritionPlanId !== planToDelete));
        
        setSuccessMessage("Nutrition plan has been successfully deleted.");
      } else if (deleteType === "meal" && planToDelete) {
        // Delete meal plan
        const response = await fetch(`http://localhost:8000/api/meal-plans/${planToDelete}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete meal plan");
        }
        
        // Update the plans list
        setMealPlans(mealPlans.filter(meal => meal.mealPlanId !== planToDelete));
        
        setSuccessMessage("Meal plan has been successfully deleted.");
      }
      
      // Close the confirmation dialog
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
      setIsSuccessDialogOpen(true);
      
      toast({
        title: "Success",
        description: "Plan deleted successfully",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format goal string for display
  const formatGoal = (goal?: string) => {
    if (!goal) return "Not specified";
    return goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Format meal time string for display
  const formatMealTime = (mealTime?: string) => {
    if (!mealTime) return "Not specified";
    return mealTime.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Get color for goal badge
  const getGoalBadgeColor = (goal?: string) => {
    if (!goal) return 'bg-gray-100 text-gray-800';
    
    switch (goal) {
      case 'weight_loss':
        return 'bg-blue-100 text-blue-800';
      case 'muscle_gain':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "nutrition" 
                ? "This will delete the nutrition plan and all associated meal plans." 
                : "This will delete the selected meal plan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Success Message Dialog */}
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Success
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nutrition Management</h2>
          <p className="text-muted-foreground">Manage nutrition plans and meal plans</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {activeView === "nutrition" ? (
            <AddNutritionPlanModal onNutritionPlanAdded={loadNutritionPlans} />
          ) : (
            <AddMealPlanModal onMealPlanAdded={loadMealPlans} nutritionPlans={nutritionPlans.map(np => ({ ...np, restrictions: np.restrictions || "" }))} />
          )}
        </div>
      </div>

      {/* Tabs for switching between Nutrition Plans and Meal Plans */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nutrition" className="flex items-center">
            <Apple className="mr-2 h-4 w-4" />
            Nutrition Plans
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center">
            <Utensils className="mr-2 h-4 w-4" />
            Meal Plans
          </TabsTrigger>
        </TabsList>
        
        {/* Search and Filters */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={activeView === "nutrition" ? "Search nutrition plans..." : "Search meal plans..."} 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeView === "nutrition" && (
                  <Select value={goalFilter} onValueChange={setGoalFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Goals</SelectItem>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Plans Content */}
        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Plans</CardTitle>
              <CardDescription>A list of all nutrition plans in your application.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading nutrition plans...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Goal</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Daily Calories</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Macros (P/C/F)</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Restrictions</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Meals/Day</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(paginatedItems as NutritionPlan[]).length === 0 ? (
                        <tr key="no-nutrition-plans-row">
                          <td colSpan={7} className="p-4 text-center">
                            No nutrition plans found.
                          </td>
                        </tr>
                      ) : (
                        (paginatedItems as NutritionPlan[]).map((plan) => (
                          <tr key={plan.nutritionPlanId} className="border-b">
                            <td className="p-4">{plan.nutritionPlanId}</td>
                            <td className="p-4">
                              <Badge className={getGoalBadgeColor(plan.goal)}>
                                {formatGoal(plan.goal)}
                              </Badge>
                            </td>
                            <td className="p-4">{plan.dailyCalories} kcal</td>
                            <td className="p-4">
                              {plan.proteinGrams}g / {plan.carbsGrams}g / {plan.fatGrams}g
                            </td>
                            <td className="p-4">
                              {plan.restrictions || "None"}
                            </td>
                            <td className="p-4">{plan.mealsPerDay}</td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <ViewMealPlansModal 
                                    nutritionPlanId={plan.nutritionPlanId}
                                    trigger={
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Utensils className="mr-2 h-4 w-4" /> View Meal Plans
                                      </DropdownMenuItem>
                                    }
                                  />
                                  <AddMealPlanModal 
                                    nutritionPlans={[{ ...plan, restrictions: plan.restrictions || "" }]}
                                    preselectedNutritionPlanId={plan.nutritionPlanId}
                                    onMealPlanAdded={loadMealPlans}
                                    trigger={
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Plan
                                      </DropdownMenuItem>
                                    }
                                  />
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => confirmDeletePlan(plan.nutritionPlanId, "nutrition")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Plan
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredNutritionPlans.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Nutrition Plans Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats.totalPlans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weight Loss Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats.weightLossPlans}</div>
                <p className="text-xs text-muted-foreground">
                  {nutritionStats.totalPlans > 0 
                    ? `${Math.round((nutritionStats.weightLossPlans / nutritionStats.totalPlans) * 100)}% of total plans` 
                    : '0% of total plans'
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muscle Gain Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats.muscleGainPlans}</div>
                <p className="text-xs text-muted-foreground">
                  {nutritionStats.totalPlans > 0 
                    ? `${Math.round((nutritionStats.muscleGainPlans / nutritionStats.totalPlans) * 100)}% of total plans` 
                    : '0% of total plans'
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nutritionStats.maintenancePlans}</div>
                <p className="text-xs text-muted-foreground">
                  {nutritionStats.totalPlans > 0 
                    ? `${Math.round((nutritionStats.maintenancePlans / nutritionStats.totalPlans) * 100)}% of total plans` 
                    : '0% of total plans'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meal Plans Content */}
        <TabsContent value="meals">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plans</CardTitle>
              <CardDescription>A list of all meal plans in your application.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading meal plans...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Day/Meal</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Calories</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Macros (P/C/F)</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Nutrition Plan</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(paginatedItems as MealPlan[]).length === 0 ? (
                        <tr key="no-meal-plans-row">
                          <td colSpan={7} className="p-4 text-center">
                            No meal plans found.
                          </td>
                        </tr>
                      ) : (
                        (paginatedItems as MealPlan[]).map((meal) => (
                          <tr key={meal.mealPlanId} className="border-b">
                            <td className="p-4">{meal.mealPlanId}</td>
                            <td className="p-4">
                              <div className="font-medium">{meal.name || "Unnamed Meal"}</div>
                              <div className="text-sm text-muted-foreground">
                                {meal.description && meal.description.length > 50 
                                  ? meal.description.substring(0, 50) + '...' 
                                  : meal.description || "No description"}
                              </div>
                            </td>
                            <td className="p-4">
                              Day {meal.dayNumber || "?"} / {formatMealTime(meal.mealTime)}
                            </td>
                            <td className="p-4">{meal.calories} kcal</td>
                            <td className="p-4">
                              {meal.protein}g / {meal.carbs}g / {meal.fat}g
                            </td>
                            <td className="p-4">
                              {meal.nutritionPlan?.goal ? (
                                <Badge className={getGoalBadgeColor(meal.nutritionPlan.goal)}>
                                  {formatGoal(meal.nutritionPlan.goal)}
                                </Badge>
                              ) : (
                                `Plan #${meal.nutritionPlanId}`
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => confirmDeletePlan(meal.mealPlanId, "meal")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Meal
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredMealPlans.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Meal Plans Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealStats.totalMeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Protein Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealStats.highProteinMeals}</div>
                <p className="text-xs text-muted-foreground">
                  {mealStats.totalMeals > 0 
                    ? `${Math.round((mealStats.highProteinMeals / mealStats.totalMeals) * 100)}% of total meals` 
                    : '0% of total meals'
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Calorie Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealStats.lowCalorieMeals}</div>
                <p className="text-xs text-muted-foreground">
                  {mealStats.totalMeals > 0 
                    ? `${Math.round((mealStats.lowCalorieMeals / mealStats.totalMeals) * 100)}% of total meals` 
                    : '0% of total meals'
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Breakfast Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealStats.breakfastOptions}</div>
                <p className="text-xs text-muted-foreground">
                  {mealStats.totalMeals > 0 
                    ? `${Math.round((mealStats.breakfastOptions / mealStats.totalMeals) * 100)}% of total meals` 
                    : '0% of total meals'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}