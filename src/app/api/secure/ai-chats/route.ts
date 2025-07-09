import { getHealthPrompt } from '@/utils/ai_prompts';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return Response.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { message, locale = 'ht' } = await request.json();

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: getHealthPrompt(locale) },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return Response.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    return Response.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}