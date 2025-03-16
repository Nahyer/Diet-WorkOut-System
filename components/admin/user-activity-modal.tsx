// components/admin/user-activity-modal.tsx
"use client"

import { useState, useEffect } from "react"
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

interface UserActivityModalProps {
  user: User;
  trigger?: React.ReactNode;
}

// Mock activity data - Replace with real API data
interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
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

  const loadUserActivities = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, fetch from API
      // const token = localStorage.getItem("token");
      // const response = await fetch(`${API_URL}/api/users/${user.userId}/activities`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setActivities(data);
      
      // Mock data for now
      setTimeout(() => {
        setActivities([
          {
            id: "1",
            type: "login",
            description: "User logged in",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
          },
          {
            id: "2",
            type: "profile_update",
            description: "User updated profile information",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
          },
          {
            id: "3",
            type: "workout_completed",
            description: "User completed a workout session",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
          },
          {
            id: "4",
            type: "login",
            description: "User logged in",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
          },
          {
            id: "5",
            type: "subscription_updated",
            description: "User upgraded to premium plan",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
          }
        ]);
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
  };

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

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return '🔑';
      case 'logout':
        return '🚪';
      case 'profile_update':
        return '✏️';
      case 'workout_completed':
        return '💪';
      case 'subscription_updated':
        return '💳';
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
            Recent activity for {user.fullName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center p-4">
              <p>No activity recorded for this user.</p>
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
                          {formatTimestamp(activity.timestamp)}
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