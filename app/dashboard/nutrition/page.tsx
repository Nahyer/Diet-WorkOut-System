"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Apple, Droplets, Coffee, Sun, Moon, UtensilsCrossed, Download, List, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/app/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for nutrition plan data
interface MealPlan {
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
  consumed?: boolean;
}

interface NutritionPlan {
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
  mealPlans: MealPlan[];
}

interface WaterIntakeRecord {
  dayNumber: number;
  amount: number;
}

interface ConsumedMeal {
  mealPlanId: number;
  dayNumber: number;
  consumedAt: string;
}

export default function NutritionPage() {
  const { getUserId } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterIntakeRecords, setWaterIntakeRecords] = useState<WaterIntakeRecord[]>([]);
  const [consumedMeals, setConsumedMeals] = useState<ConsumedMeal[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const waterGoal = 2500;

  // Fetch nutrition plan and consumed meals on component mount
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        
        if (!userId) {
          console.error("User ID not available");
          setLoading(false);
          return;
        }

        // Fetch nutrition plan
        const planResponse = await fetch(`http://localhost:8000/api/nutrition-plans?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!planResponse.ok) {
          throw new Error(`Error fetching nutrition plan: ${planResponse.status}`);
        }

        const planData = await planResponse.json();
        
        if (planData && planData.length > 0) {
          setNutritionPlan(planData[0]);
          
          // Initialize water intake records for each day
          const days = new Set(planData[0].mealPlans.map((meal: MealPlan) => meal.dayNumber));
          const initialWaterIntakes: WaterIntakeRecord[] = Array.from(days).map(day => ({
            dayNumber: Number(day),
            amount: 0
          }));
          setWaterIntakeRecords(initialWaterIntakes);
        } else {
          console.log("No nutrition plan found for user");
        }

        // Fetch consumed meals for the week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);

        const consumedResponse = await fetch(`http://localhost:8000/api/meal-consumption?userId=${userId}&startDate=${startOfWeek.toISOString()}&endDate=${endOfWeek.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!consumedResponse.ok) {
          throw new Error(`Error fetching consumed meals: ${consumedResponse.status}`);
        }

        const consumedData = await consumedResponse.json();
        setConsumedMeals(consumedData);
      } catch (error) {
        console.error("Failed to fetch nutrition data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
    
    // Initialize shopping list from localStorage if available
    const savedItems = localStorage.getItem('shoppingList');
    if (savedItems) {
      try {
        setShoppingItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Error parsing shopping list from localStorage:", e);
        setShoppingItems([]);
      }
    }
  }, [getUserId]);

  // Save shopping list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  // Format the goal text for display
  const formatGoalText = (goal: string) => {
    return goal
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get array of unique day numbers from meal plans
  const getAvailableDays = () => {
    if (!nutritionPlan?.mealPlans || nutritionPlan.mealPlans.length === 0) {
      return [1, 2, 3, 4, 5, 6, 7];
    }

    const days = new Set(nutritionPlan.mealPlans.map(meal => meal.dayNumber));
    return Array.from(days).sort((a, b) => a - b);
  };

  // Filter meals for the selected day
  const getMealsForDay = (dayNumber: number) => {
    if (!nutritionPlan?.mealPlans) return [];
    
    return nutritionPlan.mealPlans
      .filter(meal => meal.dayNumber === dayNumber)
      .sort((a, b) => {
        const mealOrder = { 
          breakfast: 1, 
          snack: 2, 
          lunch: 3, 
          dinner: 4 
        };
        const timeA = mealOrder[a.mealTime as keyof typeof mealOrder] || 99;
        const timeB = mealOrder[b.mealTime as keyof typeof mealOrder] || 99;
        return timeA - timeB;
      })
      .map(meal => ({
        ...meal,
        consumed: isMealConsumed(meal.mealPlanId, meal.dayNumber)
      }));
  };

  // Check if a meal has been consumed
  const isMealConsumed = (mealPlanId: number, dayNumber: number): boolean => {
    return consumedMeals.some(meal => 
      meal.mealPlanId === mealPlanId && 
      meal.dayNumber === dayNumber &&
      new Date(meal.consumedAt).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    );
  };

  // Mark a meal as consumed
  const markMealAsConsumed = async (mealPlanId: number, dayNumber: number) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch('http://localhost:8000/api/meals/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, mealPlanId }),
      });

      if (!response.ok) throw new Error('Failed to mark meal as consumed');
      
      const { consumption } = await response.json();
      setConsumedMeals(prev => [...prev, { mealPlanId, dayNumber, consumedAt: consumption.consumedAt }]);
    } catch (error) {
      console.error('Error marking meal as consumed:', error);
    }
  };

  // Calculate total consumed nutrition for the day based on consumed meals
  const calculateDayConsumption = (meals: MealPlan[]) => {
    return meals.reduce((acc, meal) => {
      if (meal.consumed) {
        return {
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat
        };
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Prepare macro data for the pie chart for consumed meals on the selected day
  const prepareDayMacroData = (meals: MealPlan[]) => {
    const consumed = calculateDayConsumption(meals);
    
    const totalDailyTarget = nutritionPlan ? 
      nutritionPlan.proteinGrams + nutritionPlan.carbsGrams + nutritionPlan.fatGrams : 0;
      
    const targetPercentages = {
      protein: nutritionPlan ? Math.round((nutritionPlan.proteinGrams / totalDailyTarget) * 100) : 0,
      carbs: nutritionPlan ? Math.round((nutritionPlan.carbsGrams / totalDailyTarget) * 100) : 0,
      fat: nutritionPlan ? Math.round((nutritionPlan.fatGrams / totalDailyTarget) * 100) : 0
    };
    
    const totalConsumed = consumed.protein + consumed.carbs + consumed.fat;
    
    if (totalConsumed === 0) return [];
    
    return [
      { 
        name: "Protein", 
        value: consumed.protein, 
        percentage: Math.round((consumed.protein / totalConsumed) * 100), 
        targetPercentage: targetPercentages.protein,
        color: "#ef4444" 
      },
      { 
        name: "Carbs", 
        value: consumed.carbs, 
        percentage: Math.round((consumed.carbs / totalConsumed) * 100), 
        targetPercentage: targetPercentages.carbs,
        color: "#3b82f6" 
      },
      { 
        name: "Fats", 
        value: consumed.fat, 
        percentage: Math.round((consumed.fat / totalConsumed) * 100), 
        targetPercentage: targetPercentages.fat,
        color: "#eab308" 
      }
    ];
  };

  // Get current water intake for selected day
  const getCurrentWaterIntake = () => {
    const record = waterIntakeRecords.find(record => record.dayNumber === selectedDay);
    return record ? record.amount : 0;
  };

  // Update water intake for current day
  const updateWaterIntake = (amount: number) => {
    setWaterIntakeRecords(prev => {
      const updated = [...prev];
      const index = updated.findIndex(record => record.dayNumber === selectedDay);
      
      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          amount: Math.min(updated[index].amount + amount, waterGoal)
        };
      } else {
        updated.push({
          dayNumber: selectedDay,
          amount: Math.min(amount, waterGoal)
        });
      }
      
      return updated;
    });
  };

  // Handle adding item to shopping list
  const addShoppingItem = () => {
    if (newItem.trim()) {
      setShoppingItems(prev => [...prev, newItem.trim()]);
      setNewItem("");
    }
  };

  // Handle removing item from shopping list
  const removeShoppingItem = (index: number) => {
    setShoppingItems(prev => prev.filter((_, i) => i !== index));
  };

  // Generate and download shopping list as text
  const downloadShoppingList = () => {
    const listDate = new Date().toLocaleDateString();
    let content = `Shopping List - ${listDate}\n\n`;
    
    shoppingItems.forEach((item) => {
      content += `□ ${item}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopping-list.txt';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p>{data.value}g ({data.percentage}% of consumed)</p>
          <p className="text-xs text-gray-500">Target: {data.targetPercentage}% of daily</p>
        </div>
      );
    }
    return null;
  };

  // Meal icon mapping
  const getMealIcon = (mealTime: string) => {
    switch(mealTime.toLowerCase()) {
      case 'breakfast':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case 'snack':
        return <Apple className="h-5 w-5 text-green-500" />;
      case 'lunch':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'dinner':
        return <Moon className="h-5 w-5 text-blue-500" />;
      default:
        return <UtensilsCrossed className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format meal time for display
  const formatMealTime = (mealTime: string) => {
    return mealTime.charAt(0).toUpperCase() + mealTime.slice(1);
  };

  const availableDays = getAvailableDays();
  const selectedDayMeals = getMealsForDay(selectedDay);
  const consumed = calculateDayConsumption(selectedDayMeals);
  const dayMacroData = prepareDayMacroData(selectedDayMeals);
  const currentWaterIntake = getCurrentWaterIntake();

  const remaining = nutritionPlan ? {
    calories: nutritionPlan.dailyCalories - consumed.calories,
    protein: nutritionPlan.proteinGrams - consumed.protein,
    carbs: nutritionPlan.carbsGrams - consumed.carbs,
    fat: nutritionPlan.fatGrams - consumed.fat
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const caloriesProgress = nutritionPlan 
    ? Math.min(100, (consumed.calories / nutritionPlan.dailyCalories) * 100)
    : 0;
  
  const proteinProgress = nutritionPlan 
    ? Math.min(100, (consumed.protein / nutritionPlan.proteinGrams) * 100)
    : 0;
    
  const carbsProgress = nutritionPlan 
    ? Math.min(100, (consumed.carbs / nutritionPlan.carbsGrams) * 100)
    : 0;
    
  const fatProgress = nutritionPlan 
    ? Math.min(100, (consumed.fat / nutritionPlan.fatGrams) * 100)
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[500px]">
        <p>Loading your nutrition plan...</p>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
            <p className="text-muted-foreground">No nutrition plan found</p>
          </div>
          <Button className="bg-red-500 hover:bg-red-600">
            <Plus className="mr-2 h-4 w-4" />
            Create Nutrition Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
          <p className="text-muted-foreground">
            {formatGoalText(nutritionPlan.goal)} Plan • 
            {nutritionPlan.restrictions ? ` ${nutritionPlan.restrictions} • ` : ' '}
            {nutritionPlan.mealsPerDay} meals per day
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setShowShoppingList(true)}>
            <List className="mr-2 h-4 w-4" />
            Shopping List
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumed.calories} / {nutritionPlan.dailyCalories}
            </div>
            <p className="text-xs text-muted-foreground">{remaining.calories} calories remaining</p>
            <Progress value={caloriesProgress} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Based on consumed meals for Day {selectedDay}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWaterIntake}ml / {waterGoal}ml
            </div>
            <p className="text-xs text-muted-foreground">{waterGoal - currentWaterIntake}ml remaining</p>
            <Progress value={(currentWaterIntake / waterGoal) * 100} className="mt-3 h-2" />
            <div className="mt-3 flex gap-2 justify-center">
              {[250, 500, 750].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => updateWaterIntake(amount)}
                >
                  +{amount}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein Intake</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumed.protein}g / {nutritionPlan.proteinGrams}g
            </div>
            <p className="text-xs text-muted-foreground">{remaining.protein}g remaining</p>
            <Progress value={proteinProgress} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Based on consumed meals for Day {selectedDay}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        {availableDays.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(day)}
          >
            Day {day}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="meals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="meals">Daily Meals</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="recipes">Meal Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          {selectedDayMeals.length > 0 ? (
            selectedDayMeals.map((meal) => (
              <Card key={meal.mealPlanId} className={meal.consumed ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getMealIcon(meal.mealTime)}
                      <div>
                        <CardTitle>{meal.name}</CardTitle>
                        <CardDescription>{formatMealTime(meal.mealTime)}</CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{meal.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`meal-${meal.mealPlanId}`}
                      checked={meal.consumed}
                      onChange={() => !meal.consumed && markMealAsConsumed(meal.mealPlanId, meal.dayNumber)}
                      disabled={meal.consumed}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor={`meal-${meal.mealPlanId}`} className="text-sm">
                      {meal.consumed ? "Consumed" : "Mark as consumed"}
                    </label>
                  </div>
                  {meal.consumed && (
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center text-green-500 text-sm">
                            <Check size={16} className="mr-1" /> Added to your daily totals
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This meal&apos;s nutritional values are included in your daily totals</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p>No meals planned for day {selectedDay}.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="macros">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Day {selectedDay} Macro Distribution</CardTitle>
                <CardDescription>Real-time consumed nutrients breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dayMacroData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {dayMacroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  {dayMacroData.length > 0 ? (
                    dayMacroData.map((macro, index) => (
                      <div key={index}>
                        <div className="text-sm font-medium">{macro.name}</div>
                        <div className="text-2xl font-bold" style={{ color: macro.color }}>
                          {macro.percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {macro.value}g consumed
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Target: {macro.targetPercentage}% of diet
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6">
                      <p>No meals consumed for day {selectedDay}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Mark meals as consumed to see your macro distribution
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrient Targets</CardTitle>
                <CardDescription>Day {selectedDay} progress (consumed meals)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Calories</span>
                    <span className="text-sm font-medium">
                      {consumed.calories} / {nutritionPlan.dailyCalories}
                    </span>
                  </div>
                  <Progress value={caloriesProgress} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm font-medium">
                      {consumed.protein}g / {nutritionPlan.proteinGrams}g
                    </span>
                  </div>
                  <Progress value={proteinProgress} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Carbs</span>
                    <span className="text-sm font-medium">
                      {consumed.carbs}g / {nutritionPlan.carbsGrams}g
                    </span>
                  </div>
                  <Progress value={carbsProgress} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Fat</span>
                    <span className="text-sm font-medium">
                      {consumed.fat}g / {nutritionPlan.fatGrams}g
                    </span>
                  </div>
                  <Progress value={fatProgress} className="h-2" />
                </div>

                <div className="pt-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    {selectedDayMeals.filter(meal => meal.consumed).length} of {selectedDayMeals.length} meals consumed today
                  </p>
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

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {selectedDayMeals.map((meal) => (
              <Card key={meal.mealPlanId} className={meal.consumed ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {getMealIcon(meal.mealTime)}
                    <div>
                      <CardTitle>{meal.name}</CardTitle>
                      <CardDescription>
                        {formatMealTime(meal.mealTime)} • Day {meal.dayNumber} • {meal.consumed ? "Consumed" : "Not consumed"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-sm">{meal.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Nutrition</h4>
                      <p className="text-sm">
                        {meal.calories} calories • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Recipe</h4>
                      <p className="text-sm">{meal.recipe}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`recipe-meal-${meal.mealPlanId}`}
                      checked={meal.consumed}
                      onChange={() => !meal.consumed && markMealAsConsumed(meal.mealPlanId, meal.dayNumber)}
                      disabled={meal.consumed}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor={`recipe-meal-${meal.mealPlanId}`} className="text-sm">
                      {meal.consumed ? "Consumed" : "Mark as consumed"}
                    </label>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shopping List</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Add item (e.g., Eggs, Greek Yogurt, Chicken)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addShoppingItem();
                }
              }}
              className="flex-1"
            />
            <Button onClick={addShoppingItem}>Add</Button>
          </div>
          
          <ScrollArea className="h-72 rounded-md border p-4">
            {shoppingItems.length > 0 ? (
              <div className="space-y-2">
                {shoppingItems.map((item, _index) => (
                  <div key={_index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id={`item-${_index}`} className="h-4 w-4" />
                      <label htmlFor={`item-${_index}`} className="text-sm">{item}</label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShoppingItem(_index)}
                      className="h-8 px-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Your shopping list is empty</p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShoppingItems([])}
              disabled={shoppingItems.length === 0}
            >
              Clear All
            </Button>
            <Button 
              onClick={downloadShoppingList}
              disabled={shoppingItems.length === 0}
              className="bg-red-500 hover:bg-red-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}