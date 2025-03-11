// chatWithAI.ts - API route to handle user input and return AI response
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure API key is set
});

export async function POST(req: NextRequest) {
    try {
        console.log("Received request at /api/chatWithAI");

        const { userInput } = await req.json();
        console.log("Parsed userInput:", userInput);

        if (!userInput) {
            return NextResponse.json({ message: "User input is required" }, { status: 400 });
        }

        console.log("Sending request to OpenAI...");
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userInput }],
        });

        console.log("OpenAI API response received:", aiResponse);
        const botReply = aiResponse.choices[0]?.message?.content;

        if (!botReply) {
            throw new Error("Unexpected OpenAI API response format.");
        }

        return NextResponse.json({ response: botReply }, { status: 200 });
    } catch (error) {
        console.error("OpenAI API error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message: "Internal Server Error", error: errorMessage }, { status: 500 });
    }
}