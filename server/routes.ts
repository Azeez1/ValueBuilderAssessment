import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, insertResultSchema, updateAssessmentSchema, type AssessmentAnswer, type CategoryScore } from "@shared/schema";

import { generateHTMLReport } from "./htmlReportGenerator";
import { generateAIInsights, generateCategoryInsight, generateFallbackAnalysis } from "./openaiService";
import { calculateCategoryScores, calculateOverallScore } from "../client/src/lib/scoring";
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

  // HTML report preview with full AI analysis
  app.get("/api/reports/preview/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Try cached insights first
      const cached = await storage.getCachedInsights(sessionId);
      if (cached) {
        const html = await generateHTMLReport({
          userName: (req.query.userName as string) || "User",
          userEmail: (req.query.userEmail as string) || "",
          companyName: req.query.companyName as string | undefined,
          industry: req.query.industry as string | undefined,
          overallScore: cached.overallScore,
          categoryScores: cached.categoryScores,
          aiInsights: cached.insights,
        });

        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "private, max-age=300");
        return res.send(html);
      }

      const assessment = await storage.getAssessmentBySessionId(sessionId);

      if (!assessment || !assessment.answers) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      const categoryScores =
        assessment.categoryScores || calculateCategoryScores(assessment.answers);
      const overallScore =
        assessment.totalScore || calculateOverallScore(categoryScores);

      console.log("Generating executive AI insights...");
      const executiveInsights = await generateAIInsights(
        assessment.answers,
        categoryScores,
        overallScore,
        req.query.companyName as string | undefined,
        req.query.industry as string | undefined
      );

      console.log("Generating category-specific insights...");
      const enhancedCategoryScores: Record<string, CategoryScore> = { ...categoryScores };

      for (const [category, score] of Object.entries(categoryScores)) {
        if (score.score < 80) {
          console.log(`Generating AI analysis for ${category} (score: ${score.score})...`);
          try {
            const categoryInsight = await generateCategoryInsight(
              category,
              score.score,
              assessment.answers
            );
            enhancedCategoryScores[category] = {
              ...score,
              analysis: categoryInsight,
            };
          } catch (err) {
            console.error(`Failed to generate insight for ${category}:`, err);
            enhancedCategoryScores[category] = {
              ...score,
              analysis: generateFallbackAnalysis(category, score.score),
            };
          }
        }
      }

      // Cache for future use
      await storage.updateAssessment(sessionId, {
        categoryScores: enhancedCategoryScores,
        totalScore: overallScore,
      });

      await storage.cacheInsights(sessionId, {
        sessionId,
        insights: executiveInsights,
        categoryScores: enhancedCategoryScores,
        overallScore,
      });

      const html = await generateHTMLReport({
        userName: (req.query.userName as string) || "User",
        userEmail: (req.query.userEmail as string) || "",
        companyName: req.query.companyName as string | undefined,
        industry: req.query.industry as string | undefined,
        overallScore,
        categoryScores: enhancedCategoryScores,
        aiInsights: executiveInsights,
      });

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error('Report preview error:', error);
      res.status(500).json({ error: "Failed to generate report preview" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}

async function sendResultEmail(resultData: any) {
  const {
    userName,
    userEmail,
    companyName,
    industry,
    overallScore,
    sessionId,
  } = resultData;
  let enhancedCategoryScores = resultData.categoryBreakdown as Record<string, CategoryScore>;
  let executiveInsights = "";
  let finalScore = overallScore;

  console.log('Attempting to send email with config:', {
    host: smtpHost,
    port: smtpPort,
    user: smtpUser,
    secure: smtpPort === 465,
    passExists: !!smtpPass,
  });

  // Try cached insights first
  const cached = await storage.getCachedInsights(sessionId);
  if (cached) {
    enhancedCategoryScores = cached.categoryScores;
    executiveInsights = cached.insights;
    finalScore = cached.overallScore;
  } else {
    const assessment = await storage.getAssessmentBySessionId(sessionId);
    if (!assessment || !assessment.answers) {
      console.error('No assessment found for email generation');
      return 'failed';
    }

    const answers = assessment.answers as Record<string, AssessmentAnswer>;
    const categoryScores = assessment.categoryScores || calculateCategoryScores(answers);
    finalScore = assessment.totalScore || calculateOverallScore(categoryScores);

    console.log('Generating executive AI insights for email...');
    executiveInsights = await generateAIInsights(
      answers,
      categoryScores,
      finalScore,
      companyName,
      industry,
    );

    console.log('Generating category-specific insights for email...');
    enhancedCategoryScores = { ...categoryScores };

    for (const [category, score] of Object.entries(categoryScores) as [string, CategoryScore][]) {
      if (score.score < 80) {
        console.log(`Generating AI analysis for ${category} (score: ${score.score})...`);
        try {
          const categoryInsight = await generateCategoryInsight(
            category,
            score.score,
            answers,
          );
          enhancedCategoryScores[category] = {
            ...score,
            analysis: categoryInsight,
          };
        } catch (err) {
          console.error(`Failed to generate insight for ${category}:`, err);
          enhancedCategoryScores[category] = {
            ...score,
            analysis: generateFallbackAnalysis(category, score.score),
          };
        }
      }
    }

    await storage.cacheInsights(sessionId, {
      sessionId,
      insights: executiveInsights,
      categoryScores: enhancedCategoryScores,
      overallScore: finalScore,
    });
  }

  // Generate complete HTML report
  console.log('Generating complete HTML report for email attachment...');
  const html = await generateHTMLReport({
    userName,
    userEmail,
    companyName,
    industry,
    overallScore: finalScore,
    categoryScores: enhancedCategoryScores,
    aiInsights: executiveInsights,
  });

  console.log('Preparing HTML report for email...');

  const htmlAttachment = {
    filename: `ValueBuilder_Report_${
      companyName ? companyName.replace(/\s+/g, '_') : userName.replace(/\s+/g, '_')
    }_${new Date().toISOString().split('T')[0]}.html`,
    content: html,
    contentType: 'text/html',
  };

  const strongAreas = Object.values(enhancedCategoryScores).filter((s) => s.score >= 80).length;
  const priorityAreas = Object.values(enhancedCategoryScores).filter((s) => s.score < 60).length;
  const grade = getGrade(finalScore);

  const emailContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Value Builder Assessment Completed</h2>
      <p>Dear ${userName},</p>
      <p>Thank you for completing the Value Builder Assessment. Your comprehensive report is attached to this email.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #111827; margin-top: 0;">Your Assessment Summary:</h3>
        <p style="font-size: 24px; font-weight: bold; color: ${getScoreColor(finalScore)}; margin: 10px 0;">
          Overall Score: ${finalScore}/100 (Grade: ${grade})
        </p>
        <p style="margin: 5px 0;">• <strong>${strongAreas}</strong> Strong Areas (80+ score)</p>
        <p style="margin: 5px 0;">• <strong>${priorityAreas}</strong> Priority Areas for Improvement</p>
        <p style="margin: 5px 0;">• <strong>14</strong> Business Categories Analyzed</p>
      </div>

      <h3 style="color: #1e40af;">Your Complete Report Includes:</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Executive Analysis & Strategic Insights</strong> - AI-powered analysis of your business</li>
        <li><strong>Performance Summary</strong> - Detailed scores for all 14 assessment categories</li>
        <li><strong>Priority Areas</strong> - Specific areas requiring immediate attention</li>
        <li><strong>Category Deep-Dives</strong> - Comprehensive analysis of each business area</li>
        <li><strong>Actionable Recommendations</strong> - Specific steps to improve business value</li>
      </ul>

      <div style="background: #f0f9ff; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0;">
        <h4 style="color: #1e40af; margin-top: 0;">How to Use Your Report:</h4>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Open the attached HTML file in your web browser</li>
          <li>Review the Executive Analysis for strategic insights</li>
          <li>Focus on red-scored categories (below 60) first</li>
          <li>Use your browser's print function to save as PDF if needed</li>
        </ol>
      </div>

      <p><strong>Next Steps:</strong></p>
      <p>We recommend reviewing your report with your leadership team and creating an action plan based on the priority areas identified. The report provides specific, actionable recommendations for each category.</p>

      <p style="margin-top: 30px;">Best regards,<br>
      <strong>Value Builder Assessment Team</strong><br>
      <a href="mailto:${smtpUser}" style="color: #1e40af;">${smtpUser}</a></p>
    </div>
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
    // Send to user
    console.log('Sending complete report to user:', userEmail);
    const userMailInfo = await transporter.sendMail({
      from: `"Value Builder Assessment" <${smtpUser}>`,
      to: userEmail,
      subject: `Your Value Builder Assessment Results - Score: ${finalScore}/100`,
      html: emailContent,
      attachments: [htmlAttachment],
    });
    console.log('Email sent to user successfully:', userMailInfo.messageId);

    // Send to admin
    console.log('Sending complete report to admin:', smtpUser);
    const adminMailInfo = await transporter.sendMail({
      from: `"Value Builder Assessment" <${smtpUser}>`,
      to: smtpUser,
      subject: `New Assessment: ${userName} (${companyName || 'No Company'}) - Score: ${finalScore}/100`,
      html: emailContent,
      attachments: [htmlAttachment],
    });
    console.log('Email sent to admin successfully:', adminMailInfo.messageId);

    return 'success';
  } catch (error: any) {
    console.error('Email sending failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('Error command:', error.command);
    if (error.response) console.error('SMTP Response:', error.response);
    return 'failed';
  }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}
