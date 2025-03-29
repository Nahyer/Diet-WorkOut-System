"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Bell, LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/app/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define a complete profile data type that includes password fields
interface ProfileDataWithPassword {
  fullName: string;
  email: string;
  password: string; // Current password
  newPassword: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  experienceLevel: string;
  preferredWorkoutType: string;
  activityLevel: string;
  medicalConditions: string;
  dietaryRestrictions: string;
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile state with password fields included
  const [profileData, setProfileData] = useState<ProfileDataWithPassword>({
    fullName: "",
    email: "",
    password: "", // Current password
    newPassword: "",  // Optional - only if changing
    confirmPassword: "", // For validation
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "weight_loss",
    experienceLevel: "beginner",
    preferredWorkoutType: "home",
    activityLevel: "sedentary",
    medicalConditions: "",
    dietaryRestrictions: ""
  })
  
  const [saving, setSaving] = useState(false)
  // Initialize profile image from localStorage for persistence
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Add a function to get user-specific localStorage key
  const getUserSpecificKey = (key: string) => {
    if (!user) return key;
    const userId = user.id || user.userId;
    return `${key}_${userId}`;
  };
  
  // Add this effect to load the profile image when the user is loaded
  useEffect(() => {
    if (user) {
      const userId = user.id || user.userId;
      if (userId) {
        // Use user-specific key for profile image
        const userProfileImage = localStorage.getItem(getUserSpecificKey("profileImage"));
        setProfileImage(userProfileImage);
      }
    }
  }, [user]);

  // Effect to populate form with user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData, // Keep password fields as they are
        fullName: user.fullName || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        height: user.height?.toString() || "",
        weight: user.weight?.toString() || "",
        fitnessGoal: user.fitnessGoal || "weight_loss",
        experienceLevel: user.experienceLevel || "beginner",
        preferredWorkoutType: user.preferredWorkoutType || "home",
        activityLevel: user.activityLevel || "sedentary",
        medicalConditions: user.medicalConditions || "",
        dietaryRestrictions: user.dietaryRestrictions || ""
      })
    }
  }, [user])

  // Handle photo change
  const handlePhotoChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file selection with persistent storage
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          // Save profile image to localStorage with user-specific key
          const userId = user.id || user.userId;
          if (userId) {
            localStorage.setItem(getUserSpecificKey("profileImage"), imageData);
            setProfileImage(imageData);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form submission
  const handleProfileUpdate = async () => {
    if (!user) return
    
    // Validate password if trying to change it
    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New password and confirmation do not match.",
          variant: "destructive",
        })
        return
      }
      
      if (!profileData.password) {
        toast({
          title: "Current Password Required",
          description: "Please enter your current password to change to a new one.",
          variant: "destructive",
        })
        return
      }

      // Verify current password is correct
      try {
        const loginCheck = await fetch(`http://localhost:8000/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: profileData.email,
            password: profileData.password
          })
        })
        
        if (!loginCheck.ok) {
          toast({
            title: "Incorrect Password",
            description: "Your current password is incorrect. Please try again.",
            variant: "destructive",
          })
          return
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "There was a problem verifying your password."
        toast({
          title: "Password Verification Failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }
    }
    
    setSaving(true)
    try {
      // Build the update data object based on your backend fields
      const updateData: any = {
        fullName: profileData.fullName,
        email: profileData.email,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        height: profileData.height ? Number(profileData.height) : undefined,
        weight: profileData.weight ? Number(profileData.weight) : undefined,
        fitnessGoal: profileData.fitnessGoal,
        experienceLevel: profileData.experienceLevel,
        preferredWorkoutType: profileData.preferredWorkoutType,
        activityLevel: profileData.activityLevel,
        medicalConditions: profileData.medicalConditions,
        dietaryRestrictions: profileData.dietaryRestrictions
      }
      
      // Add password fields if changing password
      if (profileData.newPassword) {
        updateData.password = profileData.newPassword
      }
      
      // Make API call to update user
      const userId = user.id || user.userId
      if (!userId) {
        throw new Error("User ID is missing")
      }
      
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile')
      }
      
      // Update local storage with new user data (excluding password)
      const { password: _, newPassword: __, confirmPassword: ___, ...userDataToStore } = updateData
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const newUserData = { ...storedUser, ...userDataToStore }
      localStorage.setItem('user', JSON.stringify(newUserData))
      
      // Clear password fields
      setProfileData({
        ...profileData,
        password: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      // Show success message with different content based on whether password was changed
      if (updateData.password) {
        // Create a custom alert dialog for password change instead of toast
        const passwordChangeAlert = document.createElement('div');
        passwordChangeAlert.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        passwordChangeAlert.innerHTML = `
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all animate-bounce-once">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Changed Successfully!</h3>
              <div class="h-2 w-full bg-gray-200 rounded-full mt-4 mb-3">
                <div class="h-full bg-red-600 rounded-full w-0 progress-bar"></div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Your profile has been updated with your new password. For security reasons, you'll be redirected to the login page in a few seconds.
              </p>
              <p class="font-semibold text-red-600 dark:text-red-400 mb-2">
                Please sign in again with your new password.
              </p>
            </div>
          </div>
        `;
        document.body.appendChild(passwordChangeAlert);
        
        // Animate the progress bar
        const progressBar = passwordChangeAlert.querySelector('.progress-bar');
        let width = 0;
        const interval = setInterval(() => {
          if (width >= 100) {
            clearInterval(interval);
          } else {
            width += 2;

            if (progressBar && progressBar instanceof HTMLElement) progressBar.style.width = width + '%';

          }
        }, 80); // Will take about 4 seconds to fill
        
        // Redirect after animation completes
        setTimeout(() => {
          if (passwordChangeAlert) {
            passwordChangeAlert.classList.add('fade-out');
            setTimeout(() => {
              document.body.removeChild(passwordChangeAlert);
              logout();
              router.push("/login");
            }, 500);
          }
        }, 4500);
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
          @keyframes bounce-once {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-bounce-once {
            animation: bounce-once 1s ease-in-out;
          }
          .fade-out {
            opacity: 0;
            transition: opacity 0.5s;
          }
          .progress-bar {
            transition: width 0.1s linear;
          }
        `;
        document.head.appendChild(style);
      } else {
        // Standard success toast for profile updates only
        toast({
          title: "Profile Updated Successfully!",
          description: "Your profile information has been saved.",
          variant: "default",
          duration: 3000,
          className: "bg-green-600 text-white border-green-700",
        })
      }
    } catch (err) {
      console.error("Profile update error:", err)
      const errorMessage = err instanceof Error ? err.message : "There was a problem updating your profile. Please try again."
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle user logout
  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      if (!user || !user.userId) {
        throw new Error("User ID is missing")
      }
      
      const userId = user.id || user.userId
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete account')
      }
      
      // Log user out after account deletion
      logout()
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "default",
      })
      
      router.push("/")
    } catch (err) {
      console.error("Account deletion error:", err)
      const errorMessage = err instanceof Error ? err.message : "There was a problem deleting your account. Please try again."
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
      <p>Loading your profile...</p>
    </div>
  }
  
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>You will need to sign in again to access your account.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>View and update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarImage src="/api/placeholder/200/200" alt="Profile" />
                  )}
                  <AvatarFallback>{profileData.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" onClick={handlePhotoChange}>
                    <Camera className="mr-2 h-4 w-4" /> Change Photo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelected}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Click to upload a profile picture
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid gap-4 mt-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profileData.gender} 
                      onValueChange={(value) => setProfileData({...profileData, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      value={profileData.height}
                      onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      value={profileData.weight}
                      onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Fitness Information</h3>
                <div className="grid gap-4 mt-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                    <Select 
                      value={profileData.fitnessGoal} 
                      onValueChange={(value) => setProfileData({...profileData, fitnessGoal: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select 
                      value={profileData.activityLevel} 
                      onValueChange={(value) => setProfileData({...profileData, activityLevel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                        <SelectItem value="extreme">Extremely Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select 
                      value={profileData.experienceLevel} 
                      onValueChange={(value) => setProfileData({...profileData, experienceLevel: value})}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="preferredWorkoutType">Preferred Workout Type</Label>
                    <Select 
                      value={profileData.preferredWorkoutType} 
                      onValueChange={(value) => setProfileData({...profileData, preferredWorkoutType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Workouts</SelectItem>
                        <SelectItem value="gym">Gym Workouts</SelectItem>
                        <SelectItem value="outdoor">Outdoor Activities</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Input 
                    id="medicalConditions" 
                    value={profileData.medicalConditions}
                    onChange={(e) => setProfileData({...profileData, medicalConditions: e.target.value})}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input 
                    id="dietaryRestrictions" 
                    value={profileData.dietaryRestrictions}
                    onChange={(e) => setProfileData({...profileData, dietaryRestrictions: e.target.value})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Change Password (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-3">Fill in these fields only if you want to change your password</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Your Current Password</Label>
                    <Input 
                      id="current_password" 
                      type="text"
                      placeholder="Enter your current password"
                      value={profileData.password}
                      onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input 
                      id="new_password" 
                      type="text"
                      placeholder="Enter new password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input 
                      id="confirm_password" 
                      type="text"
                      placeholder="Re-enter new password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handleProfileUpdate} 
                disabled={saving}
                className="flex-1 mr-2 bg-red-500 hover:bg-red-600"
              >
                {saving ? "Saving Changes..." : "Save All Changes"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all data from
                      our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleDeleteAccount}
                    >
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Units</Label>
                  <Select defaultValue="metric">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lb, in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-500 hover:bg-red-600">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="workout-reminders">Workout Reminders</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="workout-reminders">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="workout-days">Workout Days Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="progress-updates">Progress Updates</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger id="progress-updates">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email-preferences">Email Notifications</Label>
                  <Select defaultValue="important">
                    <SelectTrigger id="email-preferences">
                      <SelectValue placeholder="Select email preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="important">Important Only</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-500 hover:bg-red-600">Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}