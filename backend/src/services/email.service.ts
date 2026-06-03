import { Resend } from "resend";
import { config } from "../utils/config";

const resend = new Resend(config.resendApiKey);

export class EmailService {
  async sendTaskAssignmentEmail(
    userEmail: string,
    userName: string,
    taskTitle: string,
    projectTitle: string
  ) {
    if (!config.resendApiKey) {
      console.warn("Resend API Key is missing. Email not sent.");
      return;
    }

    try {
      await resend.emails.send({
        from: "ApexTask <notifications@apextask.dev>",
        to: userEmail,
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hello ${userName || "there"},</h2>
            <p>You have been assigned to a new task in the <strong>${projectTitle}</strong> project.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0; color: #111827;">${taskTitle}</h3>
            </div>
            <p>
              <a href="${config.frontendUrl}/projects" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px;">View Task</a>
            </p>
            <p style="color: #6b7280; font-size: 0.875rem; margin-top: 30px;">
              This is an automated notification from ApexTask.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
}

export const emailService = new EmailService();
