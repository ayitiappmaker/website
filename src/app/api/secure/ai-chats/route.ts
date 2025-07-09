import { getHealthPrompt } from '@/utils/ai_prompts';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function GET(request: Request) {
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key is not configured' }),
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message');
    const locale = searchParams.get('locale') || 'ht';

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Create a TransformStream for better control
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Start the streaming process
    (async () => {
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: getHealthPrompt(locale) },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content || '';
          
          if (content) {
            const sseData = `data: ${JSON.stringify({
              type: 'chunk',
              content: content
            })}\n\n`;
            
            try {
              await writer.write(encoder.encode(sseData));
            } catch (writeError) {
              console.error('Write error:', writeError);
              break; // Client disconnected
            }
          }
        }
        
        // Send completion signal
        const doneData = `data: ${JSON.stringify({
          type: 'done'
        })}\n\n`;
        
        try {
          await writer.write(encoder.encode(doneData));
        } catch (writeError) {
          console.error('Write error on done:', writeError);
        }
        
      } catch (error) {
        console.error('Stream error:', error);
        
        // Send error signal
        const errorData = `data: ${JSON.stringify({
          type: 'error',
          message: 'Error processing stream'
        })}\n\n`;
        
        try {
          await writer.write(encoder.encode(errorData));
        } catch (writeError) {
          console.error('Write error on error:', writeError);
        }
      } finally {
        try {
          await writer.close();
        } catch (closeError) {
          console.error('Writer close error:', closeError);
        }
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      }
    });
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    
    const encoder = new TextEncoder();
    const errorData = `data: ${JSON.stringify({
      type: 'error',
      message: 'Error processing request'
    })}\n\n`;
    
    return new Response(encoder.encode(errorData), {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS(_request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}