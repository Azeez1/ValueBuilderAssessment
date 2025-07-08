import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, insertResultSchema, updateAssessmentSchema, AssessmentAnswer, CategoryScore } from "@shared/schema";
import { generatePDFReport } from "./pdfGenerator";
import { z } from "zod";
import nodemailer from "nodemailer";

// Email configuration - FIXED VERSION
const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = (process.env.SMTP_USER || "aoseni@duxvitaecapital.com").trim();
const smtpPass = (process.env.SMTP_PASS || "").trim();

console.log('Email config debug:', {
  host: smtpHost,
  port: smtpPort,
  user: smtpUser,
  passExists: !!smtpPass,
  secure: smtpPort === 587
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service directly for better compatibility
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Add immediate verification after creating transporter
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP setup error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data" });
    }
  });

  app.put("/api/assessments/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const data = updateAssessmentSchema.parse(req.body);
      const assessment = await storage.updateAssessment(sessionId, data);

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data" });
    }
  });

  app.get("/api/assessments/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const assessment = await storage.getAssessmentBySessionId(sessionId);

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assessment" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const testInfo = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER, // Send test email to yourself
        subject: "Value Builder Assessment - Email Test",
        text: "This is a test email to verify SMTP configuration is working properly.",
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify that the SMTP configuration is working properly for the Value Builder Assessment platform.</p>
          <p>If you receive this email, the email delivery system is functioning correctly.</p>
        `
      });

      console.log("Test email sent successfully:", testInfo.messageId);
      res.json({ success: true, messageId: testInfo.messageId });
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ error: "Failed to send test email", details: error.message });
    }
  });

  // Results routes
  app.post("/api/results", async (req, res) => {
    try {
      const { sessionId, ...body } = req.body;
      const data = insertResultSchema.parse(body);
      const result = await storage.createResult(data);
      const emailStatus = await sendResultEmail({ ...data, sessionId });

      res.json({ ...result, emailStatus });
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(400).json({ error: "Invalid result data" });
    }
  });

  app.get("/api/results", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email parameter required" });
      }

      const results = await storage.getResultsByEmail(email);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendResultEmail(resultData: any) {
  const { userName, userEmail, companyName, industry, overallScore, categoryBreakdown, sessionId } = resultData;

  console.log('Attempting to send email with config:', {
    host: smtpHost,
    port: smtpPort,
    user: smtpUser,
    secure: smtpPort === 465,
    passExists: !!smtpPass
  });

  // Get full assessment with answers
  const assessment = await storage.getAssessmentBySessionId(sessionId);
  const answers = (assessment?.answers || {}) as Record<string, AssessmentAnswer>;

  // Generate PDF report
  console.log('Generating PDF report...');
  const pdfBuffer = await generatePDFReport(
    userName,
    userEmail,
    companyName,
    industry,
    overallScore,
    categoryBreakdown,
    answers
  );
  console.log('PDF generated successfully');

  const emailContent = `
      <h2>Value Builder Assessment Completed</h2>
      <p>Dear ${userName},</p>
      <p>Thank you for completing the Value Builder Assessment. Your comprehensive report is attached to this email.</p>
      <p><strong>Your Overall Score: ${overallScore}/100</strong></p>
      <p>The attached PDF contains:</p>
      <ul>
        <li>Detailed breakdown of all 14 assessment categories</li>
        <li>Priority areas for improvement</li>
        <li>Strategic recommendations</li>
        <li>Performance analysis</li>
      </ul>
      <p>Best regards,<br>Value Builder Assessment Team</p>
    `;

  // Add SMTP verification first
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error: any) {
    console.error('SMTP verification failed:', error.message);
    return 'failed';
  }

  try {
    const mailOptions = {
      from: `"Value Builder Assessment" <${smtpUser}>`,
      to: userEmail,
      subject: 'Your Value Builder Assessment Report',
      html: emailContent,
      attachments: [{
        filename: `ValueBuilder_Report_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer
      }]
    };

    // Send to user
    console.log('Sending email to user:', userEmail);
    const userMailInfo = await transporter.sendMail(mailOptions);
    console.log('Report sent to user', userMailInfo.messageId);

    // Send to admin
    console.log('Sending email to admin:', smtpUser);
    const adminMailInfo = await transporter.sendMail({
      ...mailOptions,
      to: 'aoseni@duxvitaecapital.com',
      subject: `New Assessment: ${userName} (${companyName}) - Score: ${overallScore}`,
      html: emailContent + `<p>User Email: ${userEmail}</p>`
    });
    console.log('Report sent to admin', adminMailInfo.messageId);

    return 'success';

  } catch (error: any) {
    console.error('Email sending failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('Error command:', error.command);
    if (error.response) console.error('SMTP Response:', error.response);
    return 'failed';
  }
}
