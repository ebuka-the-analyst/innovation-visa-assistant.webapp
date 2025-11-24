import { Request, Response } from "express";
import { storage } from "./storage";

// File upload handler - stores metadata and base64 content in database
export async function uploadFile(req: Request, res: Response) {
  try {
    const { toolId, userId } = req.body;
    const file = req.file;

    if (!file || !toolId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert file buffer to base64 for database storage (suitable for small files < 1MB)
    const fileContent = file.buffer ? file.buffer.toString('base64') : null;

    const uploadedFile = await storage.createUploadedFile({
      toolId,
      userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      blobUrl: fileContent, // Store base64 content in blobUrl field for now
    });

    return res.status(200).json({
      success: true,
      fileId: uploadedFile.id,
      fileMetadata: {
        id: uploadedFile.id,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize,
        fileType: uploadedFile.fileType,
        uploadedAt: uploadedFile.uploadedAt,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
}

// Get files for a tool
export async function getToolFiles(req: Request, res: Response) {
  try {
    const { toolId } = req.params;
    const userId = req.user?.id;

    if (!toolId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const files = await storage.getToolFiles(toolId, userId);

    // Return files without base64 content for list view
    const filesMetadata = files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      uploadedAt: file.uploadedAt,
    }));

    return res.status(200).json({
      success: true,
      files: filesMetadata,
      message: "Files retrieved",
    });
  } catch (error) {
    console.error("Get files error:", error);
    return res.status(500).json({ error: "Failed to retrieve files" });
  }
}

// Delete file
export async function deleteFile(req: Request, res: Response) {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    if (!fileId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify file belongs to user before deleting
    const file = await storage.getUploadedFile(fileId);
    if (!file || file.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this file" });
    }

    await storage.deleteUploadedFile(fileId);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
}

// Track analytics
export async function trackToolEvent(req: Request, res: Response) {
  try {
    const { toolId, action, userId } = req.body;

    if (!toolId || !action || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const analytic = await storage.createToolAnalytic({
      toolId,
      userId,
      action, // "save" | "export" | "share" | "upload" | "download"
      metadata: req.body.metadata || {},
    });

    return res.status(200).json({
      success: true,
      analytic: {
        id: analytic.id,
        toolId: analytic.toolId,
        action: analytic.action,
        timestamp: analytic.createdAt,
      },
      message: "Event tracked",
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return res.status(500).json({ error: "Failed to track event" });
  }
}

// Get analytics dashboard data
export async function getAnalyticsDashboard(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse dates
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    // Get user analytics from database
    const analytics = await storage.getUserAnalytics(userId, start, end);

    // Aggregate analytics data
    const eventBreakdown: { [key: string]: number } = {};
    const toolUsage: { [key: string]: number } = {};

    analytics.forEach(analytic => {
      // Count by action type
      eventBreakdown[analytic.action] = (eventBreakdown[analytic.action] || 0) + 1;
      
      // Count by tool
      toolUsage[analytic.toolId] = (toolUsage[analytic.toolId] || 0) + 1;
    });

    // Get top 3 most used tools
    const mostUsedTools = Object.entries(toolUsage)
      .map(([toolId, count]) => ({ name: toolId, uses: count, trend: "+0%" }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 3);

    return res.status(200).json({
      success: true,
      analytics: {
        totalEvents: analytics.length,
        mostUsedTools,
        eventBreakdown: {
          saves: eventBreakdown.save || 0,
          exports: eventBreakdown.export || 0,
          shares: eventBreakdown.share || 0,
          uploads: eventBreakdown.upload || 0,
          downloads: eventBreakdown.download || 0,
        },
      },
      period: { startDate: start, endDate: end },
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return res.status(500).json({ error: "Failed to get analytics" });
  }
}
