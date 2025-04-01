"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Search, Filter, MoreHorizontal, Download, Trash2, Eye, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

// Define Exercise type based on your backend schema
type Exercise = {
  exerciseId: number;
  name: string;
  description: string;
  targetMuscleGroup: string;
  equipment: string;
  difficulty: string;
  workoutType: string;
  videoUrl: string | null;
  imageUrl: string | null;
  caloriesBurnRate: number | null;
  instructions: string;
  workoutExercises?: Array<{
    sets: number;
    reps: number;
    restPeriod: number;
    workoutSession: {
      name: string;
      description: string | null;
    };
  }>;
  exerciseLogs?: Array<any>;
};

// Define a service for handling exercise data
const exerciseService = {
  async getAllExercises(): Promise<Exercise[]> {
    try {
      const response = await fetch('http://localhost:8000/api/exercises');
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  async getExerciseById(id: number): Promise<Exercise> {
    try {
      const response = await fetch(`http://localhost:8000/api/exercises/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercise');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      throw error;
    }
  },

  async createExercise(exerciseData: Omit<Exercise, 'exerciseId'>): Promise<Exercise> {
    try {
      const response = await fetch('http://localhost:8000/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });
      if (!response.ok) {
        throw new Error('Failed to create exercise');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  async updateExercise(id: number, exerciseData: Partial<Exercise>): Promise<Exercise> {
    try {
      const response = await fetch(`http://localhost:8000/api/exercises/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });
      if (!response.ok) {
        throw new Error('Failed to update exercise');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating exercise with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteExercise(id: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:8000/api/exercises/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }
    } catch (error) {
      console.error(`Error deleting exercise with ID ${id}:`, error);
      throw error;
    }
  },

  async bulkDeleteExercises(ids: number[]): Promise<void> {
    try {
      await Promise.all(ids.map(id => this.deleteExercise(id)));
    } catch (error) {
      console.error('Error bulk deleting exercises:', error);
      throw error;
    }
  },
};

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Success message dialog state
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Exercise to view
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedExercises, setPaginatedExercises] = useState<Exercise[]>([]);

  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Unique muscle groups for filter
  const muscleGroups = Array.from(new Set(exercises.map(ex => ex.targetMuscleGroup.toLowerCase())));

  // Export exercises as PDF
  const exportExercises = () => {
    try {
      if (filteredExercises.length === 0) {
        toast({
          title: "Error",
          description: "No exercises available to export.",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF();
      doc.text("Exercise Management Export", 20, 20);

      const tableData = filteredExercises.map(exercise => [
        exercise.name,
        exercise.targetMuscleGroup,
        exercise.difficulty,
        exercise.equipment || "None",
      ]);

      autoTable(doc, {
        head: [["Name", "Target Muscle Group", "Difficulty", "Equipment"]],
        body: tableData,
        startY: 30,
      });

      doc.save(`exercises-export-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({
        title: "Success",
        description: "Exercises exported successfully as PDF.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting exercises:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export exercises. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load exercises from API
  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      const exerciseData = await exerciseService.getAllExercises();
      setExercises(exerciseData);
      setFilteredExercises(exerciseData);
    } catch (error) {
      console.error("Error loading exercises:", error);
      toast({
        title: "Error",
        description: "Failed to load exercises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed the semicolon

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadExercises();
    }
  }, [isAuthenticated, isAdmin, loadExercises]);

  // Filter exercises based on search query and filters
  useEffect(() => {
    let result = [...exercises];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(query) ||
          exercise.description.toLowerCase().includes(query) ||
          exercise.targetMuscleGroup.toLowerCase().includes(query)
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter(
        (exercise) => exercise.difficulty.toLowerCase() === difficultyFilter
      );
    }

    // Apply muscle group filter
    if (muscleGroupFilter !== "all") {
      result = result.filter((exercise) =>
        exercise.targetMuscleGroup.toLowerCase().includes(muscleGroupFilter.toLowerCase())
      );
    }

    // Reset to first page when filters change
    setCurrentPage(1);
    setFilteredExercises(result);
  }, [exercises, searchQuery, difficultyFilter, muscleGroupFilter]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedExercises(filteredExercises.slice(startIndex, endIndex));
  }, [filteredExercises, currentPage, itemsPerPage]);

  // Open delete confirmation dialog for a single exercise
  const confirmDeleteExercise = (exerciseId: number) => {
    setExerciseToDelete(exerciseId);
    setIsBulkDelete(false);
    setIsDeleteDialogOpen(true);
  };

  // Open delete confirmation dialog for multiple exercises
  const confirmDeleteSelected = () => {
    setIsBulkDelete(true);
    setIsDeleteDialogOpen(true);
  };

  // Handle exercise deletion
  const handleDeleteExercise = async () => {
    try {
      if (isBulkDelete) {
        // Bulk delete exercises
        await exerciseService.bulkDeleteExercises(selectedExercises);
        
        // Update the exercises list - remove deleted exercises
        setExercises(exercises.filter(exercise => !selectedExercises.includes(exercise.exerciseId)));
        setSelectedExercises([]);
        
        toast({
          title: "Success",
          description: `${selectedExercises.length} exercises deleted successfully`,
          variant: "default",
          duration: 3000,
        });
      } else if (exerciseToDelete) {
        // Delete a single exercise
        await exerciseService.deleteExercise(exerciseToDelete);
        
        // Update the exercises list - remove the deleted exercise
        setExercises(exercises.filter(exercise => exercise.exerciseId !== exerciseToDelete));
        
        toast({
          title: "Success",
          description: "Exercise deleted successfully",
          variant: "default",
          duration: 3000,
        });
      }
      
      // Close the confirmation dialog
      setIsDeleteDialogOpen(false);
      setExerciseToDelete(null);
      
      // Show success dialog with appropriate message
      if (isBulkDelete) {
        setSuccessMessage(`${selectedExercises.length} exercises have been successfully deleted.`);
      } else {
        const exerciseName = exercises.find(e => e.exerciseId === exerciseToDelete)?.name || "Exercise";
        setSuccessMessage(`${exerciseName} has been successfully deleted.`);
      }
      setIsSuccessDialogOpen(true);
      
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise(s). Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle exercise selection
  const toggleExerciseSelection = (exerciseId: number) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  // Open view dialog
  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsViewDialogOpen(true);
  };

  // Format difficulty for display
  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete 
                ? `This will delete ${selectedExercises.length} selected exercises. This action cannot be undone.`
                : "This exercise will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExercise} className="bg-red-500 hover:bg-red-600">
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

      {/* View Exercise Dialog */}
      <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedExercise?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p><strong>Description:</strong> {selectedExercise?.description}</p>
                <p><strong>Target Muscle Group:</strong> {selectedExercise?.targetMuscleGroup}</p>
                <p><strong>Difficulty:</strong> {selectedExercise?.difficulty}</p>
                <p><strong>Equipment:</strong> {selectedExercise?.equipment || "None"}</p>
                <p><strong>Workout Type:</strong> {selectedExercise?.workoutType}</p>
                <p><strong>Instructions:</strong> {selectedExercise?.instructions}</p>
                {selectedExercise?.caloriesBurnRate && (
                  <p><strong>Calories Burn Rate:</strong> {selectedExercise.caloriesBurnRate} kcal/min</p>
                )}
                {selectedExercise?.videoUrl && (
                  <p><strong>Video URL:</strong> <a href={selectedExercise.videoUrl} target="_blank" rel="noopener noreferrer">{selectedExercise.videoUrl}</a></p>
                )}
                {selectedExercise?.imageUrl && (
                  <p><strong>Image URL:</strong> <a href={selectedExercise.imageUrl} target="_blank" rel="noopener noreferrer">{selectedExercise.imageUrl}</a></p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercise Management</h2>
          <p className="text-muted-foreground">Manage and monitor exercises</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={exportExercises}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search exercises..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by muscle group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {muscleGroups.map(group => (
                    <SelectItem key={group} value={group}>
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              {selectedExercises.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={confirmDeleteSelected}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          <CardDescription>A list of all exercises in your application.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading exercises...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300" 
                          checked={selectedExercises.length === filteredExercises.length && filteredExercises.length > 0}
                          onChange={() => {
                            if (selectedExercises.length === filteredExercises.length) {
                              setSelectedExercises([]);
                            } else {
                              setSelectedExercises(filteredExercises.map(exercise => exercise.exerciseId));
                            }
                          }}
                        />
                        Exercise
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Target Muscle Group</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Difficulty</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Equipment</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExercises.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        No exercises found.
                      </td>
                    </tr>
                  ) : (
                    paginatedExercises.map((exercise) => (
                      <tr key={exercise.exerciseId} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-gray-300"
                              checked={selectedExercises.includes(exercise.exerciseId)}
                              onChange={() => toggleExerciseSelection(exercise.exerciseId)}
                            />
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">{exercise.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{exercise.targetMuscleGroup}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{formatDifficulty(exercise.difficulty)}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{exercise.equipment || "None"}</div>
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
                              <DropdownMenuItem onClick={() => handleViewExercise(exercise)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => confirmDeleteExercise(exercise.exerciseId)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Exercise
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
                totalPages={Math.ceil(filteredExercises.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}