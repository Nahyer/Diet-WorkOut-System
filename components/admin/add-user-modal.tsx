// components/admin/add-user-modal.tsx
"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AddUserModalProps {
  onUserAdded: () => void;
}

export function AddUserModal({ onUserAdded }: AddUserModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "male",
    height: 170,
    weight: 70,
    role: "user",
    fitnessGoal: "weight_loss",
    experienceLevel: "beginner",
    preferredWorkoutType: "gym",
    activityLevel: "moderately_active",
    medicalConditions: "",
    dietaryRestrictions: ""
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user");
      }
      
      // Success
      toast({
        title: "Success",
        description: "User added successfully",
      });
      
      // Reset form and close modal
      setFormState({
        fullName: "",
        email: "",
        password: "",
        dateOfBirth: "",
        gender: "male",
        height: 170,
        weight: 70,
        role: "user",
        fitnessGoal: "weight_loss",
        experienceLevel: "beginner",
        preferredWorkoutType: "gym",
        activityLevel: "moderately_active",
        medicalConditions: "",
        dietaryRestrictions: ""
      });
      
      setOpen(false);
      
      // Refresh user list
      onUserAdded();
      
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-500 hover:bg-red-600">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with all required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formState.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formState.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formState.height.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formState.weight.toString()}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fitnessGoal">Fitness Goal *</Label>
                <Select
                  value={formState.fitnessGoal}
                  onValueChange={(value) => handleSelectChange("fitnessGoal", value)}
                >
                  <SelectTrigger id="fitnessGoal">
                    <SelectValue placeholder="Select fitness goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select
                  value={formState.experienceLevel}
                  onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredWorkoutType">Preferred Workout Type *</Label>
                <Select
                  value={formState.preferredWorkoutType}
                  onValueChange={(value) => handleSelectChange("preferredWorkoutType", value)}
                >
                  <SelectTrigger id="preferredWorkoutType">
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level *</Label>
              <Select
                value={formState.activityLevel}
                onValueChange={(value) => handleSelectChange("activityLevel", value)}
              >
                <SelectTrigger id="activityLevel">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extra_active">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Input
                id="medicalConditions"
                name="medicalConditions"
                value={formState.medicalConditions}
                onChange={handleInputChange}
                placeholder="Any relevant medical conditions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formState.dietaryRestrictions}
                onChange={handleInputChange}
                placeholder="Any dietary restrictions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}