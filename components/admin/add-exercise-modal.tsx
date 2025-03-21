"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Exercise service would be imported in a real implementation
// import { exerciseService } from "@/app/services/exercise"

// Temporary service implementation for the modal
const exerciseService = {
  async createExercise(exerciseData: any): Promise<any> {
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
};

type AddExerciseModalProps = {
  onExerciseAdded: () => void;
};

export function AddExerciseModal({ onExerciseAdded }: AddExerciseModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetMuscleGroup: "",
    equipment: "",
    difficulty: "beginner",
    workoutType: "gym",
    videoUrl: "",
    imageUrl: "",
    caloriesBurnRate: "",
    instructions: ""
  });

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
      };
      
      // Send to API
      await exerciseService.createExercise(exerciseData);
      
      // Show success message
      toast({
        title: "Success",
        description: "Exercise created successfully",
        variant: "success",
      });
      
      // Close modal and refresh data
      setOpen(false);
      onExerciseAdded();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        targetMuscleGroup: "",
        equipment: "",
        difficulty: "beginner",
        workoutType: "gym",
        videoUrl: "",
        imageUrl: "",
        caloriesBurnRate: "",
        instructions: ""
      });
    } catch (error) {
      console.error("Error creating exercise:", error);
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
            <DialogDescription>
              Create a new exercise for your fitness application.
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}