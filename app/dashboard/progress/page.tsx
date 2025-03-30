"use client";

import { useState, useEffect } from "react";
import { Download, Share2, TrendingUp, Ruler, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchProgressTracking, createProgressRecord, transformProgressData } from "../../services/progressTrackingApi";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

export default function ProgressPage() {
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([]);
  const [measurementsData, setMeasurementsData] = useState<
    { date: string; chest: number; waist: number; arms: number }[]
  >([]);
  const [summary, setSummary] = useState({
    totalWeightChange: 0,
    monthlyWeightChange: 0,
    currentWeight: 0,
    bodyFatPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weight: "",
    bodyFatPercentage: "",
    chest: "",
    waist: "",
    arms: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const progressData = await fetchProgressTracking(user.id.toString());
        const transformed = transformProgressData(progressData);
        setWeightData(transformed.weightData);
        setMeasurementsData(transformed.measurementsData);
        setSummary(transformed.summary);
        setLoading(false);
      } catch {
        setError("Failed to load progress data.");
        toast({
          title: "Error",
          description: "Failed to load your progress data.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const newRecord = {
        userId: user.id,
        date: new Date().toISOString().split("T")[0], // Today’s date
        weight: formData.weight ? Number(formData.weight) : null,
        bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : null,
        chest: formData.chest ? Number(formData.chest) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        arms: formData.arms ? Number(formData.arms) : null,
      };

      await createProgressRecord(newRecord);

      // Refresh data
      const progressData = await fetchProgressTracking(user.id.toString());
      const transformed = transformProgressData(progressData);
      setWeightData(transformed.weightData);
      setMeasurementsData(transformed.measurementsData);
      setSummary(transformed.summary);

      // Clear form
      setFormData({
        weight: "",
        bodyFatPercentage: "",
        chest: "",
        waist: "",
        arms: "",
      });

      toast({
        title: "Success",
        description: "Progress recorded successfully!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share Progress functionality
  const handleShareProgress = async () => {
    const shareText = `
      My Fitness Progress:
      - Current Weight: ${summary.currentWeight.toFixed(1)} kg
      - Total Weight Change: ${Math.abs(summary.totalWeightChange).toFixed(1)} kg
      - Body Fat: ${summary.bodyFatPercentage.toFixed(1)}%
      - Monthly Change: ${Math.abs(summary.monthlyWeightChange).toFixed(1)} kg
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Fitness Progress",
          text: shareText,
        });
        toast({
          title: "Success",
          description: "Progress shared successfully!",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to share progress.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Copied",
          description: "Progress summary copied to clipboard!",
        });
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy progress.",
          variant: "destructive",
        });
      });
    }
  };

  // Export Report functionality
  const handleExportReport = () => {
    const reportContent = `
      Fitness Progress Report - ${new Date().toLocaleDateString()}
      
      Summary:
      - Current Weight: ${summary.currentWeight.toFixed(1)} kg
      - Total Weight Change: ${Math.abs(summary.totalWeightChange).toFixed(1)} kg
      - Monthly Change: ${Math.abs(summary.monthlyWeightChange).toFixed(1)} kg
      - Body Fat Percentage: ${summary.bodyFatPercentage.toFixed(1)}%
      
      Weight History:
      ${weightData.map((entry) => `${entry.date}: ${entry.weight} kg`).join("\n")}
      
      Measurements History:
      ${measurementsData
        .map((entry) => `${entry.date}: Chest ${entry.chest} cm, Waist ${entry.waist} cm, Arms ${entry.arms} cm`)
        .join("\n")}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fitness_Progress_Report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report exported successfully!",
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Monitor your fitness journey</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleShareProgress}>
            <Share2 className="mr-2 h-4 w-4" /> Share Progress
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Your Progress</CardTitle>
          <CardDescription>Add your current measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 75.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="bodyFatPercentage">Body Fat (%)</Label>
              <Input
                id="bodyFatPercentage"
                name="bodyFatPercentage"
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage}
                onChange={handleInputChange}
                placeholder="e.g., 20"
              />
            </div>
            <div>
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                name="chest"
                type="number"
                step="0.1"
                value={formData.chest}
                onChange={handleInputChange}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                name="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={handleInputChange}
                placeholder="e.g., 80"
              />
            </div>
            <div>
              <Label htmlFor="arms">Arms (cm)</Label>
              <Input
                id="arms"
                name="arms"
                type="number"
                step="0.1"
                value={formData.arms}
                onChange={handleInputChange}
                placeholder="e.g., 35"
              />
            </div>
            <Button type="submit" className="mt-7 md:col-span-5">
              <Plus className="mr-2 h-4 w-4" /> Save Progress
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.abs(summary.totalWeightChange).toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              {Math.abs(summary.monthlyWeightChange).toFixed(1)} kg this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.currentWeight.toFixed(1)} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <Ruler className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.bodyFatPercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="measurements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Track your weight over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                      />
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
      </Tabs>
    </div>
  );
}