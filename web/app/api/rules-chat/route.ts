import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validateSessionToken } from '@/lib/auth';
import { RULES_CHAT_PROMPT } from '@/lib/prompts';
import { rulesTools } from '@/lib/tools';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_session')?.value;
    if (!validateSessionToken(token)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: anthropic('claude-haiku-4-5'),
      system: RULES_CHAT_PROMPT,
      messages: modelMessages,
      tools: rulesTools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Rules chat API error:', error);
    return Response.json(
      { error: 'Failed to process rules chat' },
      { status: 500 }
    );
  }
}
