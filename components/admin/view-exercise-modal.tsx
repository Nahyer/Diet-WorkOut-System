"use client"

import { Dumbbell, Video, Image as ImageIcon, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

type ViewExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
};

export function ViewExerciseModal({ 
  isOpen, 
  onClose, 
  exercise 
}: ViewExerciseModalProps) {
  // Get badge variant for difficulty
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'default';
      case 'intermediate':
        return 'secondary';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-red-500" />
            {exercise.name}
          </DialogTitle>
          <DialogDescription>
            Exercise details and usage information
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Description</h3>
            <p>{exercise.description}</p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Target Muscle Group</h3>
              <p className="text-base font-semibold capitalize">{exercise.targetMuscleGroup}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Equipment</h3>
              <p className="text-base font-semibold">{exercise.equipment}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
              <Badge 
                variant={getDifficultyBadgeVariant(exercise.difficulty)} 
                className="capitalize mt-1"
              >
                {exercise.difficulty}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Workout Type</h3>
              <p className="text-base font-semibold capitalize">{exercise.workoutType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Calories Burn Rate</h3>
              <p className="text-base font-semibold">
                {exercise.caloriesBurnRate ? `${exercise.caloriesBurnRate} kcal/min` : 'Not specified'}
              </p>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Instructions</h3>
            <div className="bg-slate-50 p-4 rounded-md">
              {exercise.instructions.split('\n').map((step, index) => (
                <p key={index} className="mb-2">{step}</p>
              ))}
            </div>
          </div>

          {/* Media Links */}
          {(exercise.videoUrl || exercise.imageUrl) && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Media</h3>
                <div className="flex flex-wrap gap-4">
                  {exercise.videoUrl && (
                    <a 
                      href={exercise.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Video className="h-4 w-4" />
                      <span>Watch Tutorial Video</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {exercise.imageUrl && (
                    <a 
                      href={exercise.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>View Exercise Image</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="w-full relative h-64">
                    <Image 
                      src={`http://localhost:8000/exercises/image/${exercise.exerciseId}`} 
                      alt={`Exercise demonstration for ${exercise.name}`}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-md"
                      priority
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Workout Usage */}
          {exercise.workoutExercises && exercise.workoutExercises.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Used in Workouts</h3>
                <div className="grid gap-3">
                  {exercise.workoutExercises.map((workoutExercise, index) => (
                    <Card key={index}>
                      <CardHeader className="py-2">
                        <CardTitle className="text-base">{workoutExercise.workoutSession.name}</CardTitle>
                        {workoutExercise.workoutSession.description && (
                          <CardDescription>{workoutExercise.workoutSession.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="font-medium">{workoutExercise.sets}</span> sets
                          </div>
                          <div>
                            <span className="font-medium">{workoutExercise.reps}</span> reps
                          </div>
                          <div>
                            <span className="font-medium">{workoutExercise.restPeriod}</span> sec rest
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}