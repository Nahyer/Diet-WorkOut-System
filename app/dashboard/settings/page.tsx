"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Bell, LogOut, Loader2, Shield, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
import { Switch } from "@/components/ui/switch"
import { TUser } from "@/lib/auth"

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
  const { user, loading: authLoading, isAuthenticated, logout, apiRequest } = useAuth()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<ProfileDataWithPassword | null>(null)
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  //fetch user profile data from the server
  const fetchUserData = async (id: string) => {
    const response = await apiRequest(`${API_URL}/api/users/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch user data")
    }
    return response.json()
  }
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
  // Effect to populate form with user data when available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          if (!user.id) return 
          console.log("🚀 ~ fetchUserProfile ~ user:", user)
          const userData = await fetchUserData(user.id)
          console.log("🚀 ~ fetchUserProfile ~ userData:", userData)
          if (!userData) return console.error("User data is missing")
          // Populate profile data with user data
          const formattedData = {
            fullName: userData.name || "",
            email: userData.email || "",
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().slice(0, 10) : "",
            gender: userData.gender || "",
            height: userData.height?.toString() || "",
            weight: userData.weight?.toString() || "",
            fitnessGoal: userData.fitnessGoal || "weight_loss",
            experienceLevel: userData.experienceLevel || "beginner",
            preferredWorkoutType: userData.preferredWorkoutType || "home",
            activityLevel: userData.activityLevel || "sedentary",
            medicalConditions: userData.medicalConditions || "",
            dietaryRestrictions: userData.dietaryRestrictions || "",
            password: "",
            newPassword: "",
            confirmPassword: ""
          }
          setProfileData(formattedData)
          setOriginalData(formattedData) // Save original data
          setHasChanges(false)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          toast({
            title: "Error",
            description: "There was a problem fetching your profile data.",
            variant: "destructive",
          })
        }
      }
    }
    fetchUserProfile();
  }, [user])

  useEffect(() => {
    if (originalData) {
      const passwordFieldsChanged = profileData.password || profileData.newPassword || profileData.confirmPassword
      const dataChanged = Object.keys(originalData).some(key => {
        if (key === 'password' || key === 'newPassword' || key === 'confirmPassword') return false
        return originalData[key as keyof ProfileDataWithPassword] !== profileData[key as keyof ProfileDataWithPassword]
      })
      setHasChanges(dataChanged || !!passwordFieldsChanged)
    }
  }, [profileData, originalData])

  const handleProfileDataChange = (field: keyof ProfileDataWithPassword, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Basic email validation
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Password validation
    if (profileData.newPassword) {
      if (profileData.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long"
      }
      
      if (profileData.newPassword !== profileData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }
      
      if (!profileData.password) {
        errors.password = "Current password is required to set a new password"
      }
    }
    
    // Numeric validation for height and weight
    if (profileData.height && isNaN(Number(profileData.height))) {
      errors.height = "Height must be a number"
    }
    
    if (profileData.weight && isNaN(Number(profileData.weight))) {
      errors.weight = "Weight must be a number"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle profile form submission
  const handleProfileUpdate = async () => {
    if (!user || !hasChanges) return
    
    // Validate form data
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
      return
    }
    
    // Validate password if trying to change it
    if (profileData.newPassword) {
      try {
        // Verify current password
        const verifyResult = await apiRequest(`${API_URL}/api/auth/verify-password`, {
          method: 'POST',
          body: JSON.stringify({
            email: profileData.email,
            password: profileData.password
          })
        })
        
        if (!verifyResult.ok) {
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
      // Build the update data object
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
        dietaryRestrictions: profileData.dietaryRestrictions,
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
      
      const response = await apiRequest(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      // Clear password fields
      setProfileData({
        ...profileData,
        password: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      setOriginalData(profileData) // Update original data
      setHasChanges(false) // Reset changes flag
      
      // Show success message with different content based on whether password was changed
      if (updateData.password) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully. You'll need to sign in again.",
          variant: "default",
          duration: 5000,
          className: "bg-amber-600 text-white border-amber-700",
        })
        
        // Logout after 5 seconds
        setTimeout(() => {
          logout()
          router.push("/login")
        }, 5000)
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
          variant: "default",
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
  const handleLogout = async () => {
    logout()
    router.push("/login")
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is missing")
      }
      
      const userId = user.id
      await apiRequest(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE'
      })
      
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

  // Display error message for field
  const getFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      return (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" /> {formErrors[fieldName]}
        </p>
      )
    }
    return null
  }

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-500" />
          <p className="text-xl">Loading your profile...</p>
        </div>
      </div>
    )
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
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
              <CardDescription>View and update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid gap-4 mt-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileData.fullName}
                      onChange={(e) => handleProfileDataChange('fullName', e.target.value)}
                      className={formErrors.fullName ? "border-red-500" : ""}
                    />
                    {getFieldError('fullName')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => handleProfileDataChange('email', e.target.value)}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {getFieldError('email')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleProfileDataChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profileData.gender} 
                      onValueChange={(value) => handleProfileDataChange('gender', value)}
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
                      onChange={(e) => handleProfileDataChange('height', e.target.value)}
                      className={formErrors.height ? "border-red-500" : ""}
                    />
                    {getFieldError('height')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      value={profileData.weight}
                      onChange={(e) => handleProfileDataChange('weight', e.target.value)}
                      className={formErrors.weight ? "border-red-500" : ""}
                    />
                    {getFieldError('weight')}
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
                      onValueChange={(value) => handleProfileDataChange('fitnessGoal', value)}
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
                      onValueChange={(value) => handleProfileDataChange('activityLevel', value)}
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
                      onValueChange={(value) => handleProfileDataChange('experienceLevel', value)}
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
                      onValueChange={(value) => handleProfileDataChange('preferredWorkoutType', value)}
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
                    onChange={(e) => handleProfileDataChange('medicalConditions', e.target.value)}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input 
                    id="dietaryRestrictions" 
                    value={profileData.dietaryRestrictions}
                    onChange={(e) => handleProfileDataChange('dietaryRestrictions', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                onClick={handleProfileUpdate} 
                disabled={saving || !hasChanges}
                className={`w-full sm:w-auto ${hasChanges ? "bg-red-500 hover:bg-red-600" : "bg-red-300"}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Profile
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={() => setActiveTab("security")} className="w-full sm:w-auto">
                <Shield className="mr-2 h-4 w-4" /> Manage Security
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-3">Update your password to keep your account secure</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input 
                      id="current_password" 
                      type="password"
                      placeholder="Enter your current password"
                      value={profileData.password}
                      onChange={(e) => handleProfileDataChange('password', e.target.value)}
                      className={formErrors.password ? "border-red-500" : ""}
                    />
                    {getFieldError('password')}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input 
                      id="new_password" 
                      type="password"
                      placeholder="Enter new password"
                      value={profileData.newPassword}
                      onChange={(e) => handleProfileDataChange('newPassword', e.target.value)}
                      className={formErrors.newPassword ? "border-red-500" : ""}
                    />
                    {getFieldError('newPassword')}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input 
                      id="confirm_password" 
                      type="password"
                      placeholder="Re-enter new password"
                      value={profileData.confirmPassword}
                      onChange={(e) => handleProfileDataChange('confirmPassword', e.target.value)}
                      className={formErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {getFieldError('confirmPassword')}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Account Deletion</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete My Account</Button>
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
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleProfileUpdate} 
                disabled={saving || !hasChanges}
                className="bg-red-500 hover:bg-red-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Security Settings
                  </>
                )}
              </Button>
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
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the app</p>
                  </div>
                  <Switch id="dark-mode" defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help us improve by allowing anonymous analytics</p>
                  </div>
                  <Switch id="analytics" defaultChecked={true} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-500 hover:bg-red-600">
                <Save className="mr-2 h-4 w-4" /> Save Preferences
              </Button>
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
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
                
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
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-500 hover:bg-red-600">
                <Save className="mr-2 h-4 w-4" /> Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}