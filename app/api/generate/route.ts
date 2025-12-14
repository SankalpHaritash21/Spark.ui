// src/app/api/generate/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// 1. Setup the Google AI client (New SDK)
// It automatically looks for GEMINI_API_KEY in process.env,
// but we pass it explicitly to be safe.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // 2. Get the prompt from the frontend
    const { prompt } = await req.json();

    // 3. The System Prompt (Rules for the AI)
    const systemPrompt = `
      You are an expert React developer. 
      Return ONLY the full React code for the component requested.

      RULES:
      1. Return ONLY the code. No markdown backticks.
      2. Use 'export default function App()'.
      3. Use Tailwind CSS.
      4. Use 'lucide-react' for icons. 
         ⚠️ IMPORTANT: Verify icon names. 
        - use 'ListMusic' instead of 'Playlist'
        - use 'Loader2' instead of 'Spinner'
        - use 'X' instead of 'Close'
      5. Assume the code runs in Sandpack (no local file imports).
    `;

    // 4. Generate the code using the NEW SDK syntax
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Changing to 1.5-flash as 2.5 is not yet public
      contents: systemPrompt + "\n\nUser Request: " + prompt,
    });

    // 5. Clean up the response
    // In the new SDK, response.text is a getter function or property depending on version.
    // We access the text safely.
    const rawText = response.text || "";
    const cleanCode = rawText
      .replace(/```jsx/g, "")
      .replace(/```/g, "")
      .trim();

    // 6. Send code back to frontend
    return NextResponse.json({ code: cleanCode });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
