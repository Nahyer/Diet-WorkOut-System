// services/email.ts
import { activityService } from "./activity";

export interface EmailData {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  subject: string;
  message: string;
}

// Email service functions
export const emailService = {
  /**
   * Send an email to a user
   * In a real application, this would call a backend API
   * For now, we'll simulate success after a short delay
   */
  sendEmail: async (emailData: EmailData): Promise<{ success: boolean }> => {
    try {
      // In a real application, you would use this:
      /*
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      
      return await response.json();
      */
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the email to console (for development purposes)
      console.log('Email sent:', {
        from: `${emailData.fromName} <${emailData.fromEmail}>`,
        to: `${emailData.toName} <${emailData.toEmail}>`,
        subject: emailData.subject,
        message: emailData.message
      });
      
      // Return a successful response
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
  
  /**
   * Send a welcome email to a new user
   */
  sendWelcomeEmail: async (userId: number, userName: string, userEmail: string): Promise<{ success: boolean }> => {
    const emailData: EmailData = {
      fromEmail: 'support@yourfitnessapp.com',
      fromName: 'Fitness App Support',
      toEmail: userEmail,
      toName: userName,
      subject: 'Welcome to Fitness App!',
      message: `Hello ${userName},\n\nWelcome to Fitness App! We're excited to have you join our community.\n\nHere are some tips to get started:\n- Complete your profile\n- Set your fitness goals\n- Explore our workout programs\n\nIf you have any questions, feel free to contact our support team.\n\nBest regards,\nThe Fitness App Team`
    };
    
    const result = await emailService.sendEmail(emailData);
    
    // Track this welcome email activity
    activityService.addActivity({
      userId,
      type: 'email_received',
      description: 'Received welcome email'
    });
    
    return result;
  },
  
  /**
   * Send a notification email about a new feature or event
   */
  sendNotificationEmail: async (users: { id: number, name: string, email: string }[], subject: string, message: string): Promise<{ success: boolean, count: number }> => {
    try {
      // In a real app, you might use a batch email API endpoint
      // Here we'll just send them one by one
      let successCount = 0;
      
      for (const user of users) {
        const emailData: EmailData = {
          fromEmail: 'notifications@yourfitnessapp.com',
          fromName: 'Fitness App Notifications',
          toEmail: user.email,
          toName: user.name,
          subject,
          message
        };
        
        try {
          await emailService.sendEmail(emailData);
          
          // Track this notification email activity
          activityService.addActivity({
            userId: user.id,
            type: 'email_received',
            description: `Received notification: "${subject}"`
          });
          
          successCount++;
        } catch (error) {
          console.error(`Failed to send notification to user ${user.id}:`, error);
          // Continue trying other users even if one fails
        }
      }
      
      return { 
        success: successCount > 0,
        count: successCount
      };
    } catch (error) {
      console.error('Error sending notification emails:', error);
      throw error;
    }
  }
};