interface UserProfile {
  height: number
  weight: number
  age: number
  fitnessGoal: string
}

interface Exercise {
  name: string
  sets: number
  reps: number
}

interface WorkoutPlan {
  exercises: Exercise[]
}

export function generateWorkoutPlan(profile: UserProfile): WorkoutPlan {
  const plan: WorkoutPlan = { exercises: [] }

  switch (profile.fitnessGoal) {
    case "weight_loss":
      plan.exercises = [
        { name: "Jumping Jacks", sets: 3, reps: 20 },
        { name: "Bodyweight Squats", sets: 3, reps: 15 },
        { name: "Push-ups", sets: 3, reps: 10 },
        { name: "Mountain Climbers", sets: 3, reps: 20 },
        { name: "Plank", sets: 3, reps: 30 }, // 30 seconds
      ]
      break
    case "muscle_gain":
      plan.exercises = [
        { name: "Squats", sets: 4, reps: 8 },
        { name: "Bench Press", sets: 4, reps: 8 },
        { name: "Deadlifts", sets: 4, reps: 8 },
        { name: "Pull-ups", sets: 3, reps: 8 },
        { name: "Shoulder Press", sets: 3, reps: 10 },
      ]
      break
    case "endurance":
      plan.exercises = [
        { name: "Running", sets: 1, reps: 1 }, // 30 minutes
        { name: "Cycling", sets: 1, reps: 1 }, // 30 minutes
        { name: "Jump Rope", sets: 3, reps: 100 },
        { name: "Burpees", sets: 3, reps: 15 },
        { name: "Mountain Climbers", sets: 3, reps: 30 },
      ]
      break
    default:
      // Default to a general fitness plan
      plan.exercises = [
        { name: "Bodyweight Squats", sets: 3, reps: 15 },
        { name: "Push-ups", sets: 3, reps: 10 },
        { name: "Lunges", sets: 3, reps: 10 },
        { name: "Plank", sets: 3, reps: 30 }, // 30 seconds
        { name: "Jumping Jacks", sets: 3, reps: 20 },
      ]
  }

  return plan
}

