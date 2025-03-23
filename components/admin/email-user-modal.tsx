// components/admin/email-user-modal.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { User } from "@/app/services/user"
import { activityService, ActivityTypes } from "@/app/services/activity"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Paperclip, Sparkles } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"
import { emailService } from "@/app/services/email"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface EmailUserModalProps {
  user: User;
  trigger?: React.ReactNode;
}

export function EmailUserModal({ user, trigger }: EmailUserModalProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isHTML, setIsHTML] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  
  // Set the admin's email when the modal opens
  useEffect(() => {
    if (open && currentUser) {
      setFromEmail(currentUser.email);
      setFromName(currentUser.fullName);
    }
  }, [open, currentUser]);

  // Generate email preview
  useEffect(() => {
    if (isHTML) {
      // Add some basic styling for HTML emails
      const htmlPreview = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px; background-color: #f9f9f9; border-bottom: 1px solid #eee;">
            <h2 style="margin: 0; color: #333;">${subject || 'No Subject'}</h2>
          </div>
          <div style="padding: 20px; background-color: white;">
            ${message}
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            Sent from <strong>${fromName || 'Admin'}</strong> (${fromEmail || 'admin@example.com'})
          </div>
        </div>
      `;
      setPreviewHtml(htmlPreview);
    }
  }, [subject, message, fromName, fromEmail, isHTML]);

  const handleSendEmail = async () => {
    // Validate input
    if (!fromEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Send the email using our email service
      await emailService.sendEmail({
        fromEmail,
        fromName,
        toEmail: user.email,
        toName: user.fullName,
        subject,
        message: isHTML ? message : message.replace(/\n/g, '<br />')
      }, token);
      
      // Track this activity
      activityService.addActivity({
        userId: user.userId,
        type: "email_sent",
        description: `Admin sent email: "${subject}"`
      });
      
      toast({
        title: "Email Sent",
        description: `Your message has been sent to ${user.email}`,
      });
      
      setOpen(false);
      
      // Reset form
      setSubject("");
      setMessage("");
      setIsHTML(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get email signature
  const getEmailSignature = () => {
    if (!currentUser) return "";
    
    if (isHTML) {
      return `
        <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          <strong>${currentUser.fullName}</strong><br />
          ${currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "Administrator"}<br />
          ${fromEmail}
        </p>
      `;
    }
    
    return `\n\nRegards,\n${currentUser.fullName}\n${currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "Administrator"}`;
  };

  // Function to insert template
  const insertTemplate = (templateName: string) => {
    const templates = {
      welcome: `Dear ${user.fullName},\n\nWelcome to our fitness platform! We're excited to have you join our community.\n\nHere are some tips to get started:\n- Complete your profile for personalized recommendations\n- Check out our workout plans tailored to your goals\n- Track your progress in the dashboard\n\nIf you have any questions, feel free to reply to this email.\n\nBest regards,`,
      reminder: `Hello ${user.fullName},\n\nThis is a friendly reminder about your fitness goals. We've noticed you haven't logged in recently.\n\nRemember, consistency is key to achieving your fitness objectives. Even a short workout is better than no workout!\n\nLet us know if there's anything we can do to help you stay on track.\n\nCheering you on,`,
      achievement: `Congratulations ${user.fullName}!\n\nWe wanted to recognize your recent achievements in your fitness journey. Your dedication and hard work are inspiring!\n\nKeep up the great work, and remember we're here to support you every step of the way.\n\nBest regards,`
    };
    
    setMessage(templates[templateName as keyof typeof templates]);
    
    if (templateName === 'welcome') {
      setSubject('Welcome to our Fitness Platform!');
    } else if (templateName === 'reminder') {
      setSubject('Your Fitness Journey - A Gentle Reminder');
    } else if (templateName === 'achievement') {
      setSubject('Congratulations on Your Fitness Achievement!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>Compose Email</span>
          </DialogTitle>
          <DialogDescription>
            Send an email message to {user.fullName}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview" disabled={!message}>Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="py-4">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Email Templates */}
                  <div className="mb-6 flex items-center justify-between">
                    <Label className="text-sm font-medium">Email Templates:</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => insertTemplate('welcome')}
                        type="button"
                      >
                        Welcome
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => insertTemplate('reminder')}
                        type="button"
                      >
                        Reminder
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => insertTemplate('achievement')}
                        type="button"
                      >
                        Achievement
                      </Button>
                    </div>
                  </div>
                  
                  {/* From field */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="from" className="text-right font-medium">From:</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="fromName"
                        placeholder="Your name"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">&lt;</span>
                      <Input
                        id="fromEmail"
                        placeholder="Your email address"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="flex-1"
                        type="email"
                      />
                      <span className="text-muted-foreground">&gt;</span>
                    </div>
                  </div>
                  
                  {/* To field (read-only) */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="to" className="text-right font-medium">To:</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="to"
                        value={`${user.fullName} <${user.email}>`}
                        className="flex-1"
                        disabled
                      />
                    </div>
                  </div>
                  
                  {/* Subject field */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subject" className="text-right font-medium">Subject:</Label>
                    <div className="col-span-3">
                      <Input
                        id="subject"
                        placeholder="Email subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* HTML Toggle */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right font-medium">Format:</div>
                    <div className="col-span-3 flex items-center gap-2">
                      <Switch
                        checked={isHTML}
                        onCheckedChange={setIsHTML}
                        id="html-mode"
                      />
                      <Label htmlFor="html-mode" className="text-sm cursor-pointer">
                        Enable HTML formatting
                      </Label>
                    </div>
                  </div>
                  
                  {/* Message field */}
                  <div className="grid grid-cols-4 gap-4">
                    <Label htmlFor="message" className="text-right font-medium mt-2">Message:</Label>
                    <div className="col-span-3">
                      <Textarea
                        id="message"
                        placeholder="Write your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={10}
                        className="w-full font-sans resize-y"
                      />
                      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setMessage(prev => prev + getEmailSignature())}
                          type="button"
                          className="gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Add Signature
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="gap-1 opacity-40"
                          disabled
                        >
                          <Paperclip className="h-3 w-3" />
                          Attach File (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">From: {fromName} &lt;{fromEmail}&gt;</div>
                    <div className="text-sm text-muted-foreground">Preview Mode</div>
                  </div>
                  <div className="border-b pb-2">
                    <div className="font-medium">To: {user.fullName} &lt;{user.email}&gt;</div>
                  </div>
                  <div className="border-b pb-4">
                    <div className="font-medium text-lg">{subject || "No Subject"}</div>
                  </div>
                  <div className="py-4 min-h-[200px]">
                    {isHTML ? (
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    ) : (
                      <div className="whitespace-pre-line">{message}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            This email will be sent from your admin account
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Sending..." : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}