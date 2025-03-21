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
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { User } from "@/app/services/user"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

interface ChangeRoleModalProps {
  user: User;
  onRoleChanged?: () => void;
  trigger?: React.ReactNode;
}

export function ChangeRoleModal({ user, onRoleChanged, trigger }: ChangeRoleModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the initial role when the modal opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset to the current user role when opening the modal
    if (newOpen) {
      setSelectedRole(user.role);
    }
  };

  const handleRoleChange = async () => {
    // Don't do anything if the role hasn't changed
    if (selectedRole === user.role) {
      setOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Make the API call directly to update just the role
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      console.log(`Updating user ${user.userId} role to ${selectedRole}`);
      
      const response = await fetch(`${API_URL}/api/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Include all required fields from the user object
          fullName: user.fullName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          height: Number(user.height),
          weight: Number(user.weight),
          role: selectedRole,
          fitnessGoal: user.fitnessGoal,
          experienceLevel: user.experienceLevel,
          preferredWorkoutType: user.preferredWorkoutType,
          activityLevel: user.activityLevel,
          medicalConditions: user.medicalConditions || '',
          dietaryRestrictions: user.dietaryRestrictions || ''
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API error:", errorData);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }
      
      toast({
        title: "Role Updated",
        description: `${user.fullName}'s role has been changed to ${selectedRole}`,
      });
      
      if (onRoleChanged) {
        onRoleChanged();
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({
        title: "Error",
        description: "Failed to change user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Change Role</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Change User Role</span>
          </DialogTitle>
          <DialogDescription>
            Update permissions for {user.fullName} by changing their role
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Current role: <span className="font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></p>
          </div>
          
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="user" id="user" className="mt-1" />
              <div>
                <Label htmlFor="user" className="font-medium">User (Basic)</Label>
                <p className="text-sm text-muted-foreground">Standard access to the platform with basic features</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="premium" id="premium" className="mt-1" />
              <div>
                <Label htmlFor="premium" className="font-medium">Premium User</Label>
                <p className="text-sm text-muted-foreground">Full access to all workout and nutrition plans</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="admin" id="admin" className="mt-1" />
              <div>
                <Label htmlFor="admin" className="font-medium">Administrator</Label>
                <p className="text-sm text-muted-foreground">Complete system access and user management capabilities</p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRoleChange} 
            disabled={isSubmitting || selectedRole === user.role}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            {isSubmitting ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}