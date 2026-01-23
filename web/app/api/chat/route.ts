import { streamText } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validatePassword } from '@/lib/auth';
import { CHARACTER_CREATION_PROMPT } from '@/lib/prompts';
import { rulesTools } from '@/lib/tools';

export async function POST(req: Request) {
  try {
    const { messages, password } = await req.json();

    // Validate password
    if (!validatePassword(password)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = streamText({
      model: anthropic('claude-3-5-haiku-latest'),
      system: CHARACTER_CREATION_PROMPT,
      messages,
      tools: rulesTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}
