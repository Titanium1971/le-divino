import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import { chatTools } from "@/lib/chat/tools";
import { handleToolCall } from "@/lib/chat/tool-handlers";
import {
  getOrCreateClient,
  getOrCreateConversation,
  getConversationHistory,
  saveMessage,
} from "@/lib/supabase/chat";
import type { ChatRequestBody } from "@/lib/types/chat";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const { sessionId, message, locale, clientEmail, clientName } = body;

  if (!sessionId || !message) {
    return new Response(
      JSON.stringify({ error: "Missing sessionId or message" }),
      { status: 400 },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Load or create client profile
  let client = null;
  if (clientEmail) {
    try {
      client = await getOrCreateClient(supabase, clientEmail, clientName, locale);
    } catch (e) {
      console.error("[chat] Client lookup error:", e);
    }
  }

  // Get or create conversation
  const conversation = await getOrCreateConversation(
    supabase,
    sessionId,
    locale,
    client?.id,
  );

  // Load conversation history
  const history = await getConversationHistory(supabase, conversation.id);

  // Save user message
  await saveMessage(supabase, conversation.id, "user", message);

  // Build system prompt
  const systemPrompt = await buildSystemPrompt(locale, client);

  // Build messages array for Claude
  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  // Create streaming response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: string) {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        let fullResponse = "";
        let currentMessages = [...messages];

        // Loop for tool calling (Claude may call multiple tools)
        let continueLoop = true;
        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            system: systemPrompt,
            messages: currentMessages,
            tools: chatTools,
          });

          // Process response content blocks
          let hasToolUse = false;
          const toolResults: Anthropic.MessageParam[] = [];

          for (const block of response.content) {
            if (block.type === "text") {
              // Add line break between successive text blocks
              const prefix = fullResponse.length > 0 && !fullResponse.endsWith("\n") ? "\n\n" : "";
              fullResponse += prefix + block.text;
              sendEvent(
                JSON.stringify({ type: "text", content: prefix + block.text }),
              );
            } else if (block.type === "tool_use") {
              hasToolUse = true;
              sendEvent(JSON.stringify({ type: "thinking" }));

              // Execute tool
              const result = await handleToolCall(
                block.name,
                block.input as Record<string, unknown>,
                locale,
              );

              // Save tool interaction
              await saveMessage(
                supabase,
                conversation.id,
                "tool",
                result,
                { name: block.name, input: block.input },
                null,
              );

              toolResults.push({
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: result,
                  },
                ],
              });
            }
          }

          if (hasToolUse && toolResults.length > 0) {
            // Add assistant response + tool results to continue the conversation
            currentMessages = [
              ...currentMessages,
              { role: "assistant", content: response.content },
              ...toolResults,
            ];
            // Continue loop — Claude will process tool results
          } else {
            continueLoop = false;
          }
        }

        // Save assistant response
        if (fullResponse) {
          await saveMessage(
            supabase,
            conversation.id,
            "assistant",
            fullResponse,
          );
        }

        sendEvent(JSON.stringify({ type: "done" }));
        controller.close();
      } catch (err) {
        console.error("[chat] Error:", err);
        sendEvent(
          JSON.stringify({
            type: "error",
            content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          }),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
