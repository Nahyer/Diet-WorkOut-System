"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft, Dumbbell, Scale, Target, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function OnboardingDialog() {
  const [step, setStep] = React.useState(1)
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    height: "",
    weight: "",
    goal: "weight_loss",
    experience: "beginner",
    workoutType: "home",
    duration: "30",
    activityLevel: "moderate",
    medicalConditions: "",
    dietaryRestrictions: "",
  })

  const totalSteps = 4

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Handle form submission
      console.log("Form submitted:", formData)
      setOpen(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-semibold">
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Your Account</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="mt-6">
            {step === 1 && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Enter your height"
                    value={formData.height}
                    onChange={(e) => updateFormData("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter your weight"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 pt-4">
                <Label>What's your primary fitness goal?</Label>
                <RadioGroup
                  value={formData.goal}
                  onValueChange={(value) => updateFormData("goal", value)}
                  className="grid grid-cols-3 gap-4"
                >
                  <Label
                    htmlFor="weight_loss"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="weight_loss" id="weight_loss" className="sr-only" />
                    <Scale className="mb-3 h-6 w-6" />
                    Weight Loss
                  </Label>
                  <Label
                    htmlFor="muscle_gain"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="muscle_gain" id="muscle_gain" className="sr-only" />
                    <Dumbbell className="mb-3 h-6 w-6" />
                    Muscle Gain
                  </Label>
                  <Label
                    htmlFor="maintenance"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="maintenance" id="maintenance" className="sr-only" />
                    <Target className="mb-3 h-6 w-6" />
                    Maintenance
                  </Label>
                </RadioGroup>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workoutType">Preferred Workout Type</Label>
                  <Select value={formData.workoutType} onValueChange={(value) => updateFormData("workoutType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Workouts</SelectItem>
                      <SelectItem value="gym">Gym Workouts</SelectItem>
                      <SelectItem value="outdoor">Outdoor Activities</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="yoga">Yoga/Pilates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value) => updateFormData("activityLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="athletic">Athletic (2x training/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Input
                    id="medicalConditions"
                    placeholder="List any medical conditions (optional)"
                    value={formData.medicalConditions}
                    onChange={(e) => updateFormData("medicalConditions", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input
                    id="dietaryRestrictions"
                    placeholder="List any dietary restrictions (optional)"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => updateFormData("dietaryRestrictions", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={step === 1} className="w-24">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} className="w-24 bg-red-500 hover:bg-red-600">
              {step === totalSteps ? (
                <>
                  Done <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

