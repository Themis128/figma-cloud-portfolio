// Chat API endpoint — proxies to the local RAG chatbot (FastAPI on port 8001)
import { Router, Request, Response } from "express";

const router = Router();

const BOT_URL = process.env.BOT_URL ?? "http://localhost:8001";

interface HistoryMessage {
  role: string;
  content: string;
}

// POST /api/chat — proxy to the local RAG + LLM chatbot
router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: HistoryMessage[];
    };

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Forward to the FastAPI bot
    const botResponse = await fetch(`${BOT_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmedMessage, history: history ?? [] }),
    });

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      return res.status(botResponse.status).json({
        error: `Bot error ${botResponse.status}: ${errorText}`,
      });
    }

    if (!botResponse.body) {
      return res.status(502).json({ error: "No response body from bot" });
    }

    // Stream SSE events through to the frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = (botResponse.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Chat request failed: ${msg}` });
  }
});

export default router;
