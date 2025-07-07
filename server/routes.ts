import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, insertResultSchema, updateAssessmentSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: (process.env.SMTP_HOST || "smtp.gmail.com").trim(),
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: (process.env.SMTP_USER || "your-email@gmail.com").trim(),
    pass: (process.env.SMTP_PASS || "your-app-password").trim(),
  },
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
      const data = insertResultSchema.parse(req.body);
      const result = await storage.createResult(data);
      const emailStatus = await sendResultEmail(data);

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

async function sendResultEmail(resultData: any): Promise<'success' | 'failed'> {
  const { userName, userEmail, companyName, industry, overallScore, categoryBreakdown } = resultData;

  console.log('Attempting to send email with config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
  } catch (error) {
    console.error('Failed to verify SMTP connection:', error);
    // continue anyway
  }

  // Generate category breakdown text
  const breakdownText = Object.entries(categoryBreakdown as Record<string, any>)
    .map(([category, data]: [string, any]) => {
      return `${category}: ${data.score}/${data.maxScore} (${Math.round((data.score / data.maxScore) * 100)}%)`;
    })
    .join('\n');

  const emailContent = `
    <h2>Value Builder Assessment Results</h2>
    <p><strong>Participant:</strong> ${userName}</p>
    <p><strong>Company:</strong> ${companyName || 'Not specified'}</p>
    <p><strong>Industry:</strong> ${industry || 'Not specified'}</p>
    <p><strong>Email:</strong> ${userEmail}</p>

    <h3>Overall Score: ${overallScore}/100</h3>

    <h3>Category Breakdown:</h3>
    <pre>${breakdownText}</pre>

    <p>This assessment was completed on ${new Date().toLocaleDateString()}.</p>
  `;

  const attemptSend = async () => {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER || "noreply@valuebuilder.com",
        to: userEmail,
        subject: "Your Value Builder Assessment Results",
        html: emailContent,
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER || "noreply@valuebuilder.com",
        to: "aoseni@duxvitaecapital.com",
        subject: `New Value Builder Assessment: ${userName}`,
        html: emailContent,
      });

      return true;
    } catch (err) {
      console.error('Email sending failed:', err);
      return false;
    }
  };

  let success = await attemptSend();
  if (!success) {
    console.log('Retrying email send...');
    success = await attemptSend();
  }

  return success ? 'success' : 'failed';
}