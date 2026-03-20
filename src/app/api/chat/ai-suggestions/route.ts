import connectDb from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { message, role } = await req.json();
    const prompt = `You are a professional delivery assistant chatbot.

Your task:
👉 If role is "user" → generate 3 short WhatsApp-style reply suggestions that a user could send to the delivery boy.
👉 If role is "delivery_boy" → generate 3 short WhatsApp-style reply suggestions that a delivery boy could send to the user.

⚠️ Follow these rules:
- Replies must match the context of the last message.
- Keep replies short, human-like (max 10 words).
- Use emojis naturally (max one per reply).
- No generic replies like "Okay" or "Thank you".
- Must be helpful, respectful, and relevant to delivery, status, help, or location.
- NO numbering, NO extra instructions, NO extra text.
- Just return comma-separated reply suggestions.

Return only the three reply suggestions, comma-separated.

Role: ${role}
Last message from user: ${message}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );
    const data = await res.json();
    const resplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let suggestions = [];

    if (resplyText) {
      suggestions = resplyText
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }

    // fallback if AI fails
    if (suggestions.length === 0) {
      suggestions =
        role === "delivery_boy"
          ? ["I'm nearby 🚚", "Reaching in 5 mins", "Please share location"]
          : ["Where are you?", "How far are you?", "Please come fast"];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      {
        message: `get suggestion error ${error}`,
      },
      { status: 500 },
    );
  }
}
