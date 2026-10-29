import { convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import { createResponsesCall } from "./responses.server";
import { HELPER_INSTRUCTIONS } from "./guidance";

const bodySchema = z.object({
  threadId: z.string().min(1).max(100),
  messages: z.array(z.any()).min(1).max(100),
});

export async function handleChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json({ error: "The assistant is not configured yet." }, { status: 500 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = parsed.data.messages as UIMessage[];
  const tooLong = messages.some((m) =>
    (m.parts ?? []).some((p) => p.type === "text" && p.text.length > 4000),
  );
  if (tooLong) {
    return Response.json({ error: "Please keep each question under 4,000 characters." }, { status: 400 });
  }

  const modelMessages = await convertToModelMessages(messages);
  const { response } = createResponsesCall(
    request,
    { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
    modelMessages,
    HELPER_INSTRUCTIONS,
  );
  return response();
}
