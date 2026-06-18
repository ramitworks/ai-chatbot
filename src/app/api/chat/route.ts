import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { getPersona } from "@/lib/personas";

// Allow streamed responses up to 30s (Vercel serverless default-friendly).
export const maxDuration = 30;

// Accept either common env var name so setup is forgiving.
const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

const google = createGoogleGenerativeAI({ apiKey });

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function POST(req: Request) {
  if (!apiKey) {
    return Response.json(
      {
        error:
          "No Gemini API key configured. Add GOOGLE_GENERATIVE_AI_API_KEY to your environment (free key at https://aistudio.google.com/apikey).",
      },
      { status: 500 },
    );
  }

  let body: { messages: UIMessage[]; persona?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, persona } = body;
  const { system } = getPersona(persona);

  try {
    const result = streamText({
      model: google(MODEL),
      system,
      messages: await convertToModelMessages(messages),
    });

    // Surface provider errors to the client as a readable message.
    return result.toUIMessageStreamResponse({
      onError(error) {
        console.error("[chat] stream error:", error);
        return error instanceof Error
          ? error.message
          : "The model failed to respond. Please try again.";
      },
    });
  } catch (error) {
    console.error("[chat] route error:", error);
    return Response.json(
      { error: "Failed to start the chat stream." },
      { status: 500 },
    );
  }
}
