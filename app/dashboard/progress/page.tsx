"use client"

import { useState, useEffect } from "react"
import { Camera, Download, Award, TrendingUp, Ruler, Dumbbell, Share2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { fetchProgressTracking, createProgressRecord, updateProgressRecord, transformProgressData, ProgressTrackingData } from "../../services/progressTrackingApi"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "../../contexts/AuthContext" // Assuming you have an auth context

export default function ProgressPage() {
  // State for transformed data
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([])
  const [measurementsData, setMeasurementsData] = useState<{ date: string; chest: number; waist: number; arms: number }[]>([])
  const [strengthData, setStrengthData] = useState<{ exercise: string; previous: number; current: number }[]>([])
  const [achievements, setAchievements] = useState<{ title: string; description: string; icon: string; progress: number; color: string }[]>([])
  const [summary, setSummary] = useState({
    totalWeightLoss: 0,
    monthlyWeightLoss: 0,
    currentWeight: 0,
    progressPercentage: 0,
    strengthIncrease: 0,
    bodyFat: 0,
    achievementsCompleted: 0,
    totalAchievements: 0
  })
  const [photos, setPhotos] = useState<{ before: string | null; after: string | null }>({
    before: null,
    after: null
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth() // Assuming your auth context provides the current user

  // Fetch progress data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true)
        const progressData = await fetchProgressTracking(user.id.toString())
        
        // Transform the data for charts and display
        const transformed = transformProgressData(progressData)
        
        setWeightData(transformed.weightData)
        setMeasurementsData(transformed.measurementsData)
        setStrengthData(transformed.strengthData || [])
        setAchievements(transformed.achievements || [])
        setSummary(transformed.summary)
        setPhotos({
          before: transformed.photos?.before ?? null,
          after: transformed.photos?.after ?? null
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching progress data:', err)
        setError('Failed to load progress data. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load your progress data. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id, toast])

  // Function to handle adding a new progress record
  const handleAddProgressRecord = async (data: Partial<ProgressTrackingData>) => {
    if (!user?.id) return;
    
    try {
      const newRecord: ProgressTrackingData = {
        userId: user?.id?.toString() || "",
        date: new Date().toISOString(),
        ...data
      }
      
      await createProgressRecord(newRecord)
      
      // Refresh the data
      const progressData = await fetchProgressTracking(user.id.toString())
      const transformed = transformProgressData(progressData)
      
      setWeightData(transformed.weightData)
      setMeasurementsData(transformed.measurementsData)
      setStrengthData(transformed.strengthData || [])
      setAchievements(transformed.achievements || [])
      setSummary(transformed.summary)
      setPhotos({
        before: transformed.photos?.before ?? null,
        after: transformed.photos?.after ?? null
      })
      
      toast({
        title: "Success",
        description: "Your progress has been recorded!",
      })
    } catch (err) {
      console.error('Error adding progress record:', err)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to handle progress photo upload
  const handlePhotoUpload = async (type: 'before' | 'after', file: File) => {
    if (!user?.id || !file) return;
    
    try {
      // Create a file reader to convert the file to base64
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        const base64String = reader.result
        
        // Get the most recent progress record or create a new one
        let progressData = user?.id ? await fetchProgressTracking(user.id.toString()) : []
        let latestRecord = progressData.length > 0 ? progressData[progressData.length - 1] : null
        
        if (latestRecord) {
          // Update the existing record
          const updatedPhotos = {
            ...latestRecord.photos,
            [type]: base64String
          }
          
          await updateProgressRecord(latestRecord.id!, {
            ...latestRecord,
            photos: updatedPhotos
          })
        } else {
          // Create a new record
          const newRecord = {
            userId: user?.id?.toString() || "",
            date: new Date().toISOString(),
            photos: {
              [type]: base64String
            }
          }
          
          await createProgressRecord(newRecord)
        }
        
        // Update the local state
        setPhotos(prev => ({
          ...prev,
          [type]: base64String
        }))
        
        toast({
          title: "Success",
          description: `Your ${type} photo has been uploaded!`,
        })
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(`Error uploading ${type} photo:`, err)
      toast({
        title: "Error",
        description: `Failed to upload your ${type} photo. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading your fitness data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your fitness journey</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {}}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Progress
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalWeightLoss} lbs</div>
            <p className="text-xs text-muted-foreground">-{summary.monthlyWeightLoss} lbs this month</p>
            <Progress value={summary.progressPercentage} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strength Increase</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summary.strengthIncrease}%</div>
            <p className="text-xs text-muted-foreground">Across major lifts</p>
            <Progress value={85} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <Ruler className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.bodyFat}%</div>
            <p className="text-xs text-muted-foreground">-2% from start</p>
            <Progress value={65} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.achievementsCompleted}</div>
            <p className="text-xs text-muted-foreground">{summary.achievementsCompleted} of {summary.totalAchievements} complete</p>
            <Progress value={summary.achievementsCompleted / summary.totalAchievements * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="photos">Progress Photos</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Photos</CardTitle>
              <CardDescription>Track your visual progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {photos.before ? (
                    <div className="aspect-square relative rounded-lg border overflow-hidden">
                      <img 
                        src={photos.before} 
                        alt="Before photo" 
                        className="object-cover w-full h-full"
                      />
                      <Button 
                        className="absolute bottom-4 right-4" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('before-photo-input')?.click()}
                      >
                        Update
                      </Button>
                      <input 
                        id="before-photo-input"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files && handlePhotoUpload('before', e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold">Before Photo</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload your starting point photo</p>
                        <Button 
                          className="mt-4" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('before-photo-input')?.click()}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Photo
                        </Button>
                        <input 
                          id="before-photo-input"
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => e.target.files && handlePhotoUpload('before', e.target.files[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {photos.after ? (
                    <div className="aspect-square relative rounded-lg border overflow-hidden">
                      <img 
                        src={photos.after} 
                        alt="After photo" 
                        className="object-cover w-full h-full"
                      />
                      <Button 
                        className="absolute bottom-4 right-4" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('after-photo-input')?.click()}
                      >
                        Update
                      </Button>
                      <input 
                        id="after-photo-input"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => e.target.files && handlePhotoUpload('after', e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square relative rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold">After Photo</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload your current photo</p>
                        <Button 
                          className="mt-4" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('after-photo-input');
                            if (input) input.click();
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Photo
                        </Button>
                        <input 
                          id="after-photo-input"
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => e.target.files && handlePhotoUpload('after', e.target.files[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="weight" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Track your key measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="chest" stroke="#ef4444" />
                      <Line type="monotone" dataKey="waist" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="arms" stroke="#eab308" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strength" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strength Progress</CardTitle>
              <CardDescription>Track your lifting improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exercise" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="previous" fill="#94a3b8" name="Previous" />
                    <Bar dataKey="current" fill="#ef4444" name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement, index) => {
              // Get the proper icon component
              let IconComponent;
              switch(achievement.icon) {
                case 'TrendingUp':
                  IconComponent = TrendingUp;
                  break;
                case 'Dumbbell':
                  IconComponent = Dumbbell;
                  break;
                case 'Award':
                  IconComponent = Award;
                  break;
                default:
                  IconComponent = Award;
              }
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <IconComponent className={`h-8 w-8 ${achievement.color}`} />
                      <Progress value={achievement.progress} className="w-1/2 h-2" />
                    </div>
                    <CardTitle className="mt-4">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}