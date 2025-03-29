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
import { useToast } from "@/components/ui/use-toast"
import { User, userService } from "@/app/services/user"
import { activityService } from "@/app/services/activity"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Clock } from "lucide-react"

interface SuspendUserModalProps {
  user: User;
  onUserSuspended?: () => void;
  trigger?: React.ReactNode;
}

export function SuspendUserModal({ user, onUserSuspended, trigger }: SuspendUserModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuspendUser = async () => {
    setIsSubmitting(true);
    
    try {
      // Use the client-side suspension function
      await userService.suspendUser(user.userId, reason);
      
      // Track this activity
      activityService.addActivity({
        userId: user.userId,
        type: "account_suspended",
        description: `Account temporarily suspended for 24 hours. Reason: ${reason || "No reason provided"}`
      });
      
      toast({
        title: "User Suspended",
        description: `${user.fullName}&apos;s account has been suspended for 24 hours.`,
        variant: "success",
      });
      
      if (onUserSuspended) {
        onUserSuspended();
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Temporarily Suspend User
          </DialogTitle>
          <DialogDescription>
            This will suspend {user.fullName}&apos;s account for 24 hours. They will not be able
            to log in during this period. The suspension will automatically expire after 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
              <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">
                Suspension will automatically expire after 24 hours. The user will see the reason you provide when they try to log in.
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for suspension (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for suspension..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shown to the user when they attempt to log in.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleSuspendUser} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Suspending..." : "Suspend for 24 Hours"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}