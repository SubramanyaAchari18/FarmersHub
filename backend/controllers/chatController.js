

import { GoogleGenAI } from "@google/genai";

// 1. Initialize Gemini client

// 2. Guardrail (System Prompt)
const systemPrompt = `
You are 'FarmerBot,' a helpful AI assistant for the 'Farmers Hub' platform.

**Your rules are:**
1. You are an expert in agriculture. Your **only** purpose is to answer questions about farming, crops, soil health, pesticides, fertilizers, government schemes, weather for farming, and livestock.
2. You **must not** answer any questions that are *not* related to agriculture.
3. If a user asks about a non-agricultural topic, you **must** politely refuse. For example: 'I am sorry, I am an agricultural assistant and can only answer questions about farming.'
4. If the user's question is in a different language, you **must** answer in that same language.
5. Be concise and friendly.
`;

export const askBot = async (req, res, next) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({apiKey:API_KEY});
  console.log("Here 1")
  // console.log(API_KEY)
  try {
    // Ensure API is configured
    if (!ai) {
      return res.status(503).json({
        error: "Chat service temporarily unavailable. Missing API key.",
      });
    }
    console.log("Here 2")
    
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided." });
    }
    console.log("Here 3")
    
    // 3. Format messages for Gemini
    // Skip any initial greeting like "Namaste!"
    const formattedMessages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...messages.slice(1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];
    
    console.log("Here 4")
    // 4. Choose model
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedMessages,
    });
    console.log(result.text)
    console.log("Here 5")

    // 6. Extract text from Gemini response
    const text = result?.text || "Sorry, I couldn’t generate a response.";

    // 7. Send response to frontend
    res.json({ text });

  } catch (err) {
    console.error("AI chat error:", err);
    next(err);
  }
};