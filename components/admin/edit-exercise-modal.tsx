"use client"

import { useEffect, useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Exercise type definition
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
  workoutExercises?: Array<any>;
  exerciseLogs?: Array<any>;
};

// Temporary service implementation for the modal
const exerciseService = {
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
};

type EditExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
  onExerciseUpdated: () => void;
};

export function EditExerciseModal({ 
  isOpen, 
  onClose, 
  exercise,
  onExerciseUpdated 
}: EditExerciseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetMuscleGroup: "",
    equipment: "",
    difficulty: "",
    workoutType: "",
    videoUrl: "",
    imageUrl: "",
    caloriesBurnRate: "",
    instructions: ""
  });

  // Initialize form with exercise data
  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        description: exercise.description,
        targetMuscleGroup: exercise.targetMuscleGroup,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        workoutType: exercise.workoutType,
        videoUrl: exercise.videoUrl || "",
        imageUrl: exercise.imageUrl || "",
        caloriesBurnRate: exercise.caloriesBurnRate ? exercise.caloriesBurnRate.toString() : "",
        instructions: exercise.instructions
      });
    }
  }, [exercise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format the data as needed
      const exerciseData = {
        ...formData,
        caloriesBurnRate: formData.caloriesBurnRate ? parseFloat(formData.caloriesBurnRate) : null,
        videoUrl: formData.videoUrl || null,
        imageUrl: formData.imageUrl || null,
      };
      
      // Send to API
      await exerciseService.updateExercise(exercise.exerciseId, exerciseData);
      
      // Show success message
      toast({
        title: "Success",
        description: "Exercise updated successfully",
        variant: "success",
      });
      
      // Close modal and refresh data
      onClose();
      onExerciseUpdated();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              Update exercise information in your fitness application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-right">
                  Exercise Name*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description" className="text-right">
                  Description*
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetMuscleGroup" className="text-right">
                  Target Muscle Group*
                </Label>
                <Input
                  id="targetMuscleGroup"
                  name="targetMuscleGroup"
                  value={formData.targetMuscleGroup}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="e.g., Chest, Back, Legs"
                />
              </div>

              <div>
                <Label htmlFor="equipment" className="text-right">
                  Equipment*
                </Label>
                <Input
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="e.g., Barbell, Dumbbells, Machine"
                />
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-right">
                  Difficulty*
                </Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => handleSelectChange("difficulty", value)}
                >
                  <SelectTrigger id="difficulty" className="mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="workoutType" className="text-right">
                  Workout Type*
                </Label>
                <Select 
                  value={formData.workoutType} 
                  onValueChange={(value) => handleSelectChange("workoutType", value)}
                >
                  <SelectTrigger id="workoutType" className="mt-1">
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="bodyweight">Bodyweight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caloriesBurnRate" className="text-right">
                  Calories Burn Rate (per min)
                </Label>
                <Input
                  id="caloriesBurnRate"
                  name="caloriesBurnRate"
                  type="number"
                  step="0.1"
                  value={formData.caloriesBurnRate}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="e.g., 8.5"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl" className="text-right">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="https://example.com/video"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="https://example.com/image"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="instructions" className="text-right">
                  Instructions*
                </Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  placeholder="Step-by-step instructions for performing the exercise"
                  rows={5}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}