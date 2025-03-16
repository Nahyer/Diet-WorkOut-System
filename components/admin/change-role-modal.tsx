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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { User, userService } from "@/app/services/user"
import { Label } from "@/components/ui/label"

interface ChangeRoleModalProps {
  user: User;
  onRoleChanged: () => void;
  trigger?: React.ReactNode;
}

export function ChangeRoleModal({ user, onRoleChanged, trigger }: ChangeRoleModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user.role);

  // Handle role change
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await userService.changeUserRole(user.userId, selectedRole, token);
      
      toast({
        title: "Success",
        description: `${user.fullName}'s role has been updated to ${selectedRole}`,
      });
      
      setOpen(false);
      onRoleChanged();
      
    } catch (error) {
      console.error("Error changing user role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change user role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Shield className="h-4 w-4 mr-2" />
            Change Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.fullName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleChangeRole}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedRole === "user" && "Standard access to basic features."}
                {selectedRole === "premium" && "Premium access with additional features and benefits."}
                {selectedRole === "admin" && "Full administrative access to all features and user management."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedRole === user.role}>
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}