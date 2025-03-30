// services/activity.ts

export interface ActivityItem {
    id: string;
    userId: number | string;
    type: string;
    description: string;
    timestamp: string;
  }
  
  // Constants for activity types
  export const ActivityTypes = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    PROFILE_UPDATE: 'profile_update',
    WORKOUT_COMPLETED: 'workout_completed',
    NUTRITION_PLAN_COMPLETED: 'nutrition_plan_completed',
    PASSWORD_CHANGED: 'password_changed',
    ROLE_CHANGED: 'role_changed',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    ACCOUNT_DELETED: 'account_deleted'
  };
  
  // Key for storing activities in localStorage
  const USER_ACTIVITIES_KEY = 'user_activities';
  
  /**
   * Get all activities from localStorage
   */
  export const getAllActivities = (): ActivityItem[] => {
    if (typeof window === 'undefined') return [];
    
    const activitiesJson = localStorage.getItem(USER_ACTIVITIES_KEY);
    if (!activitiesJson) return [];
    
    try {
      const activities = JSON.parse(activitiesJson);
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('Error parsing activities from localStorage:', error);
      return [];
    }
  };
  
  /**
   * Get activities for a specific user
   */
  export const getUserActivities = (userId: number | string): ActivityItem[] => {
    const activities = getAllActivities();
    
    // Filter activities for this user only
    return activities.filter(activity => activity.userId == userId); // Using == to handle number/string type differences
  };
  
  /**
   * Add a new activity to localStorage
   */
  export const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>): ActivityItem => {
    // Get current activities
    const activities = getAllActivities();
    
    // Create the new activity with id and timestamp
    const newActivity: ActivityItem = {
      id: generateId(),
      ...activity,
      timestamp: new Date().toISOString()
    };
    
    // Add to the beginning for most recent first
    const updatedActivities = [newActivity, ...activities];
    
    // Clean up old activities (only keep last 24 hours)
    const cleanedActivities = cleanupOldActivities(updatedActivities);
    
    // Save back to localStorage
    localStorage.setItem(USER_ACTIVITIES_KEY, JSON.stringify(cleanedActivities));
    
    return newActivity;
  };
  
  /**
   * Clean up activities older than 24 hours
   */
  const cleanupOldActivities = (activities: ActivityItem[]): ActivityItem[] => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate > twentyFourHoursAgo;
    });
  };
  
  /**
   * Generate a unique ID for activities
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };
  
  // Export the activity service
  export const activityService = {
    getAllActivities,
    getUserActivities,
    addActivity,
    ActivityTypes
  };