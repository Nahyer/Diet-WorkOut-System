// components/admin/user-activity-modal.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { User } from "@/app/services/user"
import { Card, CardContent } from "@/components/ui/card"
import { activityService, ActivityItem, ActivityTypes } from "@/app/services/activity"

interface UserActivityModalProps {
  user: User;
  trigger?: React.ReactNode;
}

export function UserActivityModal({ user, trigger }: UserActivityModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Load user activities when modal opens
  useEffect(() => {
    if (open) {
      loadUserActivities();
    }
  }, [open]);

  const loadUserActivities = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Short delay to simulate API call - can be removed in production
      setTimeout(() => {
        // Get activities from localStorage
        const userActivities = activityService.getUserActivities(user.userId);
        
        // If no activities found, add a placeholder message
        if (userActivities.length === 0) {
          // Add a message to explain no activities are found
          toast({
            title: "No Activities",
            description: "No recent activities found for this user in the last 24 hours.",
          });
        }
        
        setActivities(userActivities);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading user activities:", error);
      toast({
        title: "Error",
        description: "Failed to load user activities",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [user.userId, toast]);

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format time ago (e.g., "5 minutes ago")
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case ActivityTypes.LOGIN:
        return '🔑';
      case ActivityTypes.LOGOUT:
        return '🚪';
      case ActivityTypes.PROFILE_UPDATE:
        return '✏️';
      case ActivityTypes.WORKOUT_COMPLETED:
        return '💪';
      case ActivityTypes.NUTRITION_PLAN_COMPLETED:
        return '🥗';
      case ActivityTypes.SUBSCRIPTION_UPDATED:
        return '💳';
      case ActivityTypes.PASSWORD_CHANGED:
        return '🔒';
      case ActivityTypes.ROLE_CHANGED:
        return '🛡️';
      default:
        return '📝';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Activity className="h-4 w-4 mr-2" />
            View Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Activity</DialogTitle>
          <DialogDescription>
            Recent activity for {user.fullName} (last 24 hours)
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center p-4">
              <p>No activity recorded for this user in the last 24 hours.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(activity.timestamp)} ({getTimeAgo(activity.timestamp)})
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}