/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWelcomeMessage } from "@/constants/translations";
import { connectDB } from "@/libs/mongoose";
import { supabase } from "@/libs/supabase/supabase";
import { ChatHistory } from "@/models/chat_history";
import { Locale } from "@/types/internationalization";
import { getHealthPrompt } from "@/utils/ai_prompts";
import { getUserId } from "@/utils/request";
import { String } from "@/utils/string";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const locale = searchParams.get('locale') as Locale;
//   const userId = getUserId(request);
//   await connectDB();
  
//   const {
//     data: { first_name },
//   } = await supabase.from("profiles").select("*").eq("id", userId).single();

//   const welcomeMessage = getWelcomeMessage(locale).replace('***', String.extractWord(`${first_name}`, 0));
//   const history = await ChatHistory.find({ userId }).lean();

//   if (history.length === 0) {
//     await ChatHistory.insertOne({ role: "system", content: welcomeMessage, userId, locale });
//     return Response.json({ status: "success", data: await ChatHistory.find({ userId }).lean() }, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control": "no-cache",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });
//   }
//   return Response.json({ status: "success", data: history }, {
//     status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control": "no-cache",
//         "Access-Control-Allow-Origin": "*",
//       },
//   });
// }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') as Locale;
  const userId = getUserId(request);
  
  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  });

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const processRequest = async () => {
        try {
          await connectDB();
          
          const { data: { first_name } } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          const welcomeMessage = getWelcomeMessage(locale)
            .replace('***', String.extractWord(`${first_name}`, 0));

          const history = await ChatHistory.find({ userId }).lean();

          if (history.length === 0) {
            await ChatHistory.insertOne({ 
              role: "system", 
              content: welcomeMessage, 
              userId, 
              locale 
            });
            
            const newHistory = await ChatHistory.find({ userId }).lean();
            sendEvent({ 
              status: "success", 
              data: newHistory,
              type: "initial_message" 
            });
          } else {
            sendEvent({ 
              status: "success", 
              data: history,
              type: "existing_history" 
            });
          }

          // Optional: Send a completion event
          sendEvent({ 
            status: "complete", 
            type: "stream_end" 
          });

        } catch (error: any) {
          sendEvent({ 
            status: "error", 
            message: error.message,
            type: "error" 
          });
        } finally {
          // controller.close();
        }
      };

      processRequest();
    }
  });

  return new Response(stream, { headers });
}

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key is not configured" }),
      { status: 500 }
    );
  }

  try {
    await connectDB();
    const userId = getUserId(request);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { message, locale } = (await request.json()) as any;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Create a TransformStream for better control
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const chatHistory = await ChatHistory.find({ userId }).lean();
    const messages: Array<
      ChatCompletionMessageParam & { userId: string; locale: string }
    > = [];

    for (const chat of chatHistory) {
      messages.push({
        role: chat.role,
        content: chat.content,
        userId: chat.userId,
        locale: chat.locale,
      });
    }

    // Start the streaming process
    (async () => {
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "Start conversation with the expression 'I am your AI Doctor'.",
            },
            { role: "system", content: getHealthPrompt(locale) },
            ...messages,
            {
              role: "system",
              content: `Make sure you reply in ${locale} language`,
            },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        });

        let aiResponse = "";

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content || "";
          aiResponse += content;
          if (content) {
            const sseData = `data: ${JSON.stringify({
              type: "chunk",
              content: content,
            })}\n\n`;

            try {
              await writer.write(encoder.encode(sseData));
            } catch (writeError) {
              console.error("Write error:", writeError);
              break; // Client disconnected
            }
          }
        }

        console.log(aiResponse);

        await ChatHistory.insertMany([
          { role: "user", content: message, userId, locale },
          { role: "system", content: aiResponse, userId, locale },
        ]);

        // Send completion signal
        const doneData = `data: ${JSON.stringify({
          type: "done",
        })}\n\n`;

        try {
          await writer.write(encoder.encode(doneData));
        } catch (writeError) {
          console.error("Write error on done:", writeError);
        }
      } catch (error) {
        console.error("Stream error:", error);

        // Send error signal
        const errorData = `data: ${JSON.stringify({
          type: "error",
          message: "Error processing stream",
        })}\n\n`;

        try {
          await writer.write(encoder.encode(errorData));
        } catch (writeError) {
          console.error("Write error on error:", writeError);
        }
      } finally {
        try {
          await writer.close();
        } catch (closeError) {
          console.error("Writer close error:", closeError);
        }
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      },
    });
  } catch (error) {
    console.error("ChatGPT API Error:", error);

    const encoder = new TextEncoder();
    const errorData = `data: ${JSON.stringify({
      type: "error",
      message: "Error processing request",
    })}\n\n`;

    return new Response(encoder.encode(errorData), {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, authorization",
    },
  });
}
