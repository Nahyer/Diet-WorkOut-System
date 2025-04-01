"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { RecentUser, Ticket, UserActivity, UserData, TicketData, SystemMetric } from "@/Types"


// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function AdminDashboard() {
    const { user, isAdmin, apiRequest, loading: authLoading, getUserId } = useAuth();
  
  // State for dashboard data
  const [userData, setUserData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  })
  console.log("🚀 ~ AdminDashboard ~ userData:", userData)

  const [systemData] = useState({
    uptime: "99.9%",
    responseTime: "45ms"
  })

  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for ticket dialog
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [updatingTicket, setUpdatingTicket] = useState(false)

  // Get admin's name
  const adminName = user?.name || "Admin"

  // Helper function for API requests
  const fetchData = async (endpoint: string) => {
    try {
      const response = await apiRequest(`${API_URL}${endpoint}`);
      if (!response.ok && response.status === 404) {
        return []
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      return null;
    }
  };

  // Helper function to update ticket status
  const updateTicketStatus = async (ticketId: number, status: string, adminResponse?: string) => {
    setUpdatingTicket(true)
    try {
      
      // Prepare request body based on API expectations
      // Using snake_case for API compatibility
      const requestBody: any = { 
        status: status.replace('-', '_') // Convert from 'in-progress' to 'in_progress' if needed
      }
      
      if (adminResponse) {
        requestBody.admin_response = adminResponse
      }
      
      // Add timestamps when necessary
      if (status === 'resolved') {
        requestBody.resolved_at = new Date().toISOString()
      }
      
      console.log('Updating ticket with:', requestBody)
      
      const response = await apiRequest(`${API_URL}/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error response:', errorData)
        throw new Error(`Failed to update ticket: ${response.status}`)
      }
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                status,
                adminResponse: adminResponse || ticket.adminResponse
              } 
            : ticket
        )
      )
      
      return await response.json()
    } catch (error) {
      console.error(`Error updating ticket ${ticketId}:`, error)
      return null
    } finally {
      setUpdatingTicket(false)
    }
  }

  // Improved format date function with better error handling
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      // Try to parse the date string
      const date = new Date(dateStr)
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date format:', dateStr)
        return 'Invalid date'
      }
      
      // Format it in a user-friendly way
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      console.error('Error formatting date:', e)
      return 'Invalid date'
    }
  }

  // Generate mock system metrics data (replace with real API data when available)
  const generateSystemMetrics = () => {
    const hours = 24
    const now = new Date()
    const data: SystemMetric[] = []
    
    for (let i = hours; i > 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cpu: 20 + Math.random() * 30,  // CPU usage between 20-50%
        memory: 30 + Math.random() * 40, // Memory usage between 30-70%
        requests: Math.floor(50 + Math.random() * 150) // 50-200 requests
      })
    }
    
    return data
  }

  //!Mock seen replace
  // Generate mock user activity data (replace with real API data when available)
  const generateUserActivity = () => {
    const hours = 24
    const now = new Date()
    const data: UserActivity[] = []
    
    let userCount = 100 + Math.random() * 50
    
    for (let i = hours; i > 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      
      // Simulate fluctuations
      userCount = Math.max(50, userCount + (Math.random() * 20 - 10))
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        users: Math.floor(userCount)
      })
    }
    
    return data
  }

  // Get user name handling different field formats
  const getUserName = (user: UserData): string => {
    return user.fullName || user.full_name || 'Unknown User'
  }

 
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      
      try {
        // Fetch all users
        const usersData: UserData[] = await fetchData('/api/users') || []
        if (usersData && usersData.length > 0) {
          console.log('Sample user data:', usersData[0])
          
          // Calculate user statistics
          const total = usersData.length
          
          // Active users calculation
          const active = usersData.filter(user => {
            const lastActive = user.lastActive || user.last_active
            return lastActive && new Date(lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          }).length
          
          // New users this month
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const newThisMonth = usersData.filter(user => {
            const createdDate = user.createdAt || user.created_at
            if (!createdDate) return false
            
            try {
              const date = new Date(createdDate)
              return !isNaN(date.getTime()) && 
                    date.getMonth() === currentMonth && 
                    date.getFullYear() === currentYear
            } catch (e) {
              console.error('Error parsing date for new users:', e)
              return false
            }
          }).length
          
          setUserData({
            totalUsers: total,
            activeUsers: active,
            newUsersThisMonth: newThisMonth
          })
          
          // Get registrations within the last 48 hours
          const last48Hours = new Date(Date.now() - 48 * 60 * 60 * 1000)
          
          // Debug the created date format from the API
          console.log('Looking for registrations after:', last48Hours.toISOString())
          
          // Process the recent registrations
          const recentRegistrations = usersData
            .filter(user => {
              // Get the createdAt value - handle both camelCase and snake_case
              const createdAt = user.createdAt || user.created_at
              
              // Skip if no createdAt value
              if (!createdAt) {
                console.log(`User ${user.id} has no creation date`)
                return false
              }
              
              try {
                // Parse the date and ensure it's valid
                const createdDate = new Date(createdAt)
                
                if (isNaN(createdDate.getTime())) {
                  console.log(`User ${user.id} has invalid date: ${createdAt}`)
                  return false
                }
                
                // Check if it's within the last 48 hours
                const isRecent = createdDate >= last48Hours
                
                console.log(`User ${user.id}: Created at ${createdDate.toISOString()}, Is recent: ${isRecent}`)
                
                return isRecent
              } catch (e) {
                console.error(`Error parsing date for user ${user.id}:`, e)
                return false
              }
            })
            .sort((a, b) => {
              // Sort by creation date (newest first)
              const dateA = new Date(a.createdAt || a.created_at || 0).getTime()
              const dateB = new Date(b.createdAt || b.created_at || 0).getTime()
              return dateB - dateA
            })
            .slice(0, 5) // Show at most 5 recent registrations
          
          console.log(`Found ${recentRegistrations.length} recent registrations`)
          
          // Map to the required format for the UI
          const mappedUsers: RecentUser[] = recentRegistrations.map(user => ({
            id: user.userId!,
            name: getUserName(user),
            email: user.email,
            date: formatDate(user.createdAt || user.created_at),
            status: user.isActive || user.is_active ? "active" : "inactive"
          }))
          
          setRecentUsers(mappedUsers)
        }
        
        // Fetch support tickets
        const ticketsData: TicketData[] = await fetchData('/api/support-tickets') || []
        if (ticketsData && ticketsData.length > 0) {
          console.log('Sample ticket data:', ticketsData[0])
          
          // Get all tickets for the admin view
          const formattedTickets: Ticket[] = ticketsData.map(ticket => ({
            id: ticket.ticketId || ticket.ticket_id || 0,
            user: ticket.user?.fullName || ticket.user?.full_name || `User #${ticket.userId || ticket.user_id}`,
            userId: ticket.userId || ticket.user_id || 0,
            subject: ticket.subject,
            message: ticket.message,
            status: (ticket.status || "").replace('_', '-'), // Convert status format if needed ('in_progress' to 'in-progress')
            category: ticket.category,
            createdAt: formatDate(ticket.createdAt || ticket.created_at),
            adminResponse: ticket.adminResponse || ticket.admin_response
          }))
          
          setTickets(formattedTickets)
        }
        
        // Set system metrics and user activity (mock data for now)
        setSystemMetrics(generateSystemMetrics())
        setUserActivity(generateUserActivity())
        
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [authLoading,isAdmin])

  // Function to view a specific ticket
  const viewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setAdminResponse(ticket.adminResponse || "")
    setTicketDialogOpen(true)
    
    // If status is 'new', update it to 'open' when admin views it
    if (ticket.status === 'new') {
      updateTicketStatus(ticket.id, 'open')
      // Update the selected ticket status locally as well
      setSelectedTicket(prev => prev ? { ...prev, status: 'open' } : null)
    }
  }

  // Function to update ticket status with response
  const handleTicketAction = async (action: 'in-progress' | 'resolved' | 'closed') => {
    if (!selectedTicket) return
    
    try {
      // Update ticket with appropriate status and admin response
      const result = await updateTicketStatus(selectedTicket.id, action, adminResponse)
      
      if (result) {
        // Success message
        console.log(`Ticket successfully marked as ${action}`)
        
        // Close dialog after action
        setTicketDialogOpen(false)
        setSelectedTicket(null)
      } else {
        // Handle error
        console.error(`Failed to mark ticket as ${action}`)
      }
    } catch (error) {
      console.error('Error in ticket action:', error)
    }
  }

  // Redirect if user is not an admin
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary"/>
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Loading dashboard data...</h2>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Error loading dashboard</h2>
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Define badge variants based on status/priority
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive'
      case 'open': return 'destructive'
      case 'in-progress': return 'default'
      case 'resolved': return 'secondary'
      case 'closed': return 'outline'
      default: return 'secondary'
    }
  }
  
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'workout': return 'destructive'
      case 'diet': return 'default'
      case 'account': return 'secondary'
      case 'billing': return 'destructive'
      case 'general': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {adminName}!</h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening in your system today.</p>
        </div>
      </div>

      {/* User Statistics & System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{userData.newUsersThisMonth} from this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.uptime}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemData.responseTime}</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* System Performance Metrics */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Server metrics over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cpu" 
                    name="CPU Usage (%)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="memory" 
                    name="Memory Usage (%)" 
                    stroke="#82ca9d" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="requests" 
                    name="Requests/hour" 
                    stroke="#ffc658" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Users Tracking */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>User activity over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Active Users" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>User registrations in the last 48 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow key={user.id.toString()}>
                      <TableCell>#{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.date}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "secondary" : "outline"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No recent registrations found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Recent support requests from users</CardDescription>
            </div>
            <Button onClick={() => window.location.href = "/admin/tickets"}>View All Tickets</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? (
                  tickets.slice(0, 5).map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>T-{ticket.id}</TableCell>
                      <TableCell>{ticket.user}</TableCell>
                      <TableCell className="max-w-xs truncate" title={ticket.subject}>
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryVariant(ticket.category)}>
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.createdAt}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => viewTicket(ticket)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No support tickets found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id} - {selectedTicket?.subject}</DialogTitle>
            <DialogDescription>Submitted by {selectedTicket?.user} on {selectedTicket?.createdAt}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="font-semibold">Status:</div>
              <div className="col-span-3">
                <Badge variant={getStatusVariant(selectedTicket?.status || "")}>
                  {selectedTicket?.status}
                </Badge>
              </div>
              
              <div className="font-semibold">Category:</div>
              <div className="col-span-3">
                <Badge variant={getCategoryVariant(selectedTicket?.category || "")}>
                  {selectedTicket?.category}
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="font-semibold">Message:</div>
              <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                {selectedTicket?.message}
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="font-semibold">Admin Response:</div>
              <Textarea 
                placeholder="Type your response to the user here..." 
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedTicket?.status === 'new' || selectedTicket?.status === 'open' ? (
                <Button 
                  variant="default" 
                  onClick={() => handleTicketAction('in-progress')}
                  disabled={updatingTicket}
                >
                  {updatingTicket ? 'Updating...' : 'Mark In Progress'}
                </Button>
              ) : null}
              
              {selectedTicket?.status === 'in-progress' ? (
                <Button 
                  variant="default" 
                  onClick={() => handleTicketAction('resolved')}
                  disabled={updatingTicket}
                >
                  {updatingTicket ? 'Updating...' : 'Mark Resolved'}
                </Button>
              ) : null}
              
              {selectedTicket?.status === 'resolved' ? (
                <Button 
                  variant="default" 
                  onClick={() => handleTicketAction('closed')}
                  disabled={updatingTicket}
                >
                  {updatingTicket ? 'Updating...' : 'Close Ticket'}
                </Button>
              ) : null}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setTicketDialogOpen(false)}
              disabled={updatingTicket}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}