"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react";

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
    // Implement bulk deletion logic if your API supports it
    // For now, we'll delete exercises one by one
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
  const [] = useState<number[]>([]);
  const [, setIsLoading] = useState(true);
  const [difficultyFilter] = useState("all");
  const [muscleGroupFilter] = useState("all");
  const [searchQuery] = useState("");

  // Delete confirmation dialog state
  const [] = useState(false);
  const [] = useState<number | null>(null);
  const [] = useState(false);

  // Success message dialog state
  const [] = useState(false);
  const [] = useState("");

  // Exercise to edit or view
  const [] = useState<Exercise | null>(null);
  const [] = useState(false);
  const [] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [, setPaginatedExercises] = useState<Exercise[]>([]);

  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
  }, [toast]);

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

  // The rest of the component remains unchanged
}

// Removed conflicting local declaration of useCallback
