"use client"

import { useState } from "react"
import { Settings, Shield, Zap, Brain, Dumbbell, Apple, Save, RotateCcw, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function SystemSettings() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage your application configuration and parameters</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button className="bg-red-500 hover:bg-red-600">
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      {isMaintenanceMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode Active</AlertTitle>
          <AlertDescription>
            The system is currently in maintenance mode. Only administrators can access the application.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="mr-2 h-4 w-4" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="workout">
            <Dumbbell className="mr-2 h-4 w-4" />
            Workout System
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <Apple className="mr-2 h-4 w-4" />
            Nutrition System
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system parameters and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict access during updates
                  </p>
                </div>
                <Switch checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} />
              </div>
              <Separator />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>System Name</Label>
                  <Input placeholder="Fitness Studio" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" placeholder="support@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>CPU Usage</Label>
                    <Badge variant="outline">45%</Badge>
                  </div>
                  <Progress value={45} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Memory Usage</Label>
                    <Badge variant="outline">60%</Badge>
                  </div>
                  <Progress value={60} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Storage Usage</Label>
                    <Badge variant="outline">25%</Badge>
                  </div>
                  <Progress value={25} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Parameters</CardTitle>
              <CardDescription>Configure AI model behavior and sensitivity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Model Selection</Label>
                  <Select defaultValue="gpt4">
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4">GPT-4</SelectItem>
                      <SelectItem value="gpt3">GPT-3.5</SelectItem>
                      <SelectItem value="custom">Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Response Temperature</Label>
                  <Slider defaultValue={[0.7]} max={1} step={0.1} />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input type="number" placeholder="2048" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed AI response logging</p>
                  </div>
                  <Switch checked={debugMode} onCheckedChange={setDebugMode} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout System Configuration</CardTitle>
              <CardDescription>Manage workout planning and progression parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Default Rest Period (seconds)</Label>
                  <Input type="number" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label>Progression Rate</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger>
                      <SelectValue placeholder="Select progression rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Workout Duration (minutes)</Label>
                  <Input type="number" placeholder="90" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition System Configuration</CardTitle>
              <CardDescription>Configure nutrition planning and tracking parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Default Calorie Range (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" placeholder="85" />
                    <span>to</span>
                    <Input type="number" placeholder="115" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Macro Distribution</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-24">Protein:</Label>
                      <Input type="number" placeholder="30" />
                      <span>%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-24">Carbs:</Label>
                      <Input type="number" placeholder="50" />
                      <span>%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-24">Fat:</Label>
                      <Input type="number" placeholder="20" />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>Configure system performance and caching settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cache Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable system-wide caching</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Cache Duration (minutes)</Label>
                  <Input type="number" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label>Max Concurrent Connections</Label>
                  <Input type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Request Timeout (seconds)</Label>
                  <Input type="number" placeholder="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger>
                      <SelectValue placeholder="Select password policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Enable API request rate limiting</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

