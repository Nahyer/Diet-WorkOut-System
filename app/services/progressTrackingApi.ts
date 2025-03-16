// services/progressTrackingApi.ts

export interface ProgressTrackingData {
    id?: string;
    userId: string;
    date: string;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    arms?: number;
    strengths?: {
      exercise: string;
      previous: number;
      current: number;
    }[];
    photos?: {
      before?: string;
      after?: string;
    };
    achievements?: {
      title: string;
      description: string;
      icon: string;
      progress: number;
      color: string;
    }[];
    notes?: string;
  }
  
  export const fetchProgressTracking = async (userId: string): Promise<ProgressTrackingData[]> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/progress/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch progress tracking data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchProgressTracking:', error);
      throw error;
    }
  };
  
  export const createProgressRecord = async (progressData: ProgressTrackingData): Promise<ProgressTrackingData> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to create progress record: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in createProgressRecord:', error);
      throw error;
    }
  };
  
  export const updateProgressRecord = async (id: string, progressData: ProgressTrackingData): Promise<ProgressTrackingData> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/progress/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update progress record: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in updateProgressRecord:', error);
      throw error;
    }
  };
  
  export const deleteProgressRecord = async (id: string): Promise<void> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/progress/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to delete progress record: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error in deleteProgressRecord:', error);
      throw error;
    }
  };
  
  // Helper function to transform API data into a format suitable for charts
  export const transformProgressData = (data: ProgressTrackingData[]) => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Extract weight data
    const weightData = sortedData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      weight: item.weight || 0
    }));
    
    // Extract measurements data
    const measurementsData = sortedData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
      chest: item.chest || 0,
      waist: item.waist || 0,
      arms: item.arms || 0
    }));
    
    // Extract strength data
    const strengthData = sortedData.length > 0 && sortedData[sortedData.length - 1].strengths 
      ? sortedData[sortedData.length - 1].strengths 
      : [];
    
    // Extract achievements
    const achievements = sortedData.length > 0 && sortedData[sortedData.length - 1].achievements 
      ? sortedData[sortedData.length - 1].achievements 
      : [];
    
    // Calculate summary stats
    const totalWeightLoss = sortedData.length >= 2 
      ? (sortedData[0].weight || 0) - (sortedData[sortedData.length - 1].weight || 0) 
      : 0;
    
    const monthlyWeightLoss = sortedData.length >= 2 
      ? (sortedData[sortedData.length - 2].weight || 0) - (sortedData[sortedData.length - 1].weight || 0) 
      : 0;
    
    return {
      weightData,
      measurementsData,
      strengthData,
      achievements,
      summary: {
        totalWeightLoss,
        monthlyWeightLoss,
        currentWeight: sortedData.length > 0 ? sortedData[sortedData.length - 1].weight || 0 : 0,
        progressPercentage: 75, // You'll need to calculate this based on goals
        strengthIncrease: 25, // You'll need to calculate this based on actual data
        bodyFat: sortedData.length > 0 ? sortedData[sortedData.length - 1].bodyFat || 0 : 0,
        achievementsCompleted: achievements ? achievements.filter(a => a.progress === 100).length : 0,
        totalAchievements: achievements ? achievements.length : 0
      },
      photos: sortedData.length > 0 && sortedData[sortedData.length - 1].photos 
        ? sortedData[sortedData.length - 1].photos 
        : { before: null, after: null }
    };
  };