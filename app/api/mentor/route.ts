import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  console.log("🟢 API Route Hit: Incoming request from Dashboard!");

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("🔴 ERROR: GEMINI_API_KEY is missing from your .env.local file!");
      return NextResponse.json({ error: "API Key is missing from the backend environment." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const { profile, stats } = await request.json();
    
    if (!profile || !stats) {
      console.error("🔴 ERROR: Missing profile or stats data!");
      return NextResponse.json({ error: "Missing frontend data payload" }, { status: 400 });
    }

    const topTags = stats.chartData.map((t: any) => `${t.name}: ${t.value} solved`).join(', ');

    const prompt = `
      You are an elite Competitive Programming Coach. 
      Analyze this Codeforces profile and give structured, technical, motivating feedback in exactly 3 clear bullet points:
      - Current Rating: ${profile.rating || 'Unrated'}
      - Peak Rating: ${profile.maxRating || 'Unrated'}
      - Total Solved: ${stats.totalSolved}
      - Top Solved Topics: ${topTags}

      Format your response with bold headers for each bullet point:
      1. **Strengths Analysis:**
      2. **Core Growth Gap:**
      3. **Next Daily Action Item:**
    `;

    console.log("🟢 Sending data to Gemini AI...");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log("🟢 AI Success! Sending advice back to browser.");
    return NextResponse.json({ advice: response.text });

  } catch (error: any) {
    console.error("🔴 FATAL BACKEND ERROR:");
    console.error(error);
    return NextResponse.json({ error: error.message || "The AI server crashed unexpectedly." }, { status: 500 });
  }
}