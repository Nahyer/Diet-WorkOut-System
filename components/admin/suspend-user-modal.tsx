// components/admin/suspend-user-modal.tsx
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
import { Ban } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { User, userService } from "@/app/services/user"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SuspendUserModalProps {
  user: User;
  onUserSuspended: () => void;
  trigger?: React.ReactNode;
}

export function SuspendUserModal({ user, onUserSuspended, trigger }: SuspendUserModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  // Handle user suspension
  const handleSuspendUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // In a real implementation, send reason to API
      // await fetch(`${API_URL}/api/users/${user.userId}/suspend`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ reason })
      // });
      
      // For now, use the user service without sending reason
      await userService.suspendUser(user.userId, token);
      
      toast({
        title: "User Suspended",
        description: `${user.fullName} has been suspended from the platform.`,
      });
      
      setOpen(false);
      onUserSuspended();
      
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user",
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
          <Button size="sm" variant="ghost" className="text-red-600">
            <Ban className="h-4 w-4 mr-2" />
            Suspend User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suspend User Account</DialogTitle>
          <DialogDescription>
            This will prevent {user.fullName} from accessing the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSuspendUser}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for suspension</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for suspending this user"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                The user will be notified about their suspension. They will not be able to access their account until an administrator reactivates it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Suspending..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}