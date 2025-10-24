import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve current directory (since ES modules don’t have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧩 Load .env from backend folder
dotenv.config({ path: path.resolve("./src/backend/.env") });

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message received." });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await response.json();
    console.log("🔍 Gemini raw response:", JSON.stringify(data, null, 2)); // 👈 Log full API response

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No reply received from Gemini.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error calling Gemini API:", error);
    res.status(500).json({
      reply: "⚠️ Error connecting to Gemini API. Please try again later.",
    });
  }
});
console.log("✅ Loaded Gemini API key:", process.env.GEMINI_API_KEY ? "Yes" : "No");

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
