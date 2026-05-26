import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Insights Route
  app.post("/api/ai/insights", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }
      
      const { data, type } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let prompt = "";
      if (type === "dashboard") {
        prompt = `You are an expert financial analyst. Analyze this business data and provide a short, punchy 3-sentence insight about financial health and what to focus on next. Return plain text only.\nData: ${JSON.stringify(data)}`;
      } else if (type === "email_draft") {
        prompt = `You are a professional executive assistant. Draft a concise, polite email response or message based on this context. Return plain text only without subject line. Context: ${JSON.stringify(data)}`;
      } else {
        prompt = `Provide a helpful insight on this business data: ${JSON.stringify(data)}`;
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
      } catch (error: any) {
        console.warn("gemini-2.5-flash failed, falling back to gemini-2.0-flash", error.message);
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
      }

      res.json({ result: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate AI content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
