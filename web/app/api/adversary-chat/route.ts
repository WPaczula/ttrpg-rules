import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validateSessionToken } from '@/lib/auth';
import { buildAdversaryChatPrompt } from '@/lib/prompts';
import { adversaryChatTools } from '@/lib/tools';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_session')?.value;
    if (!validateSessionToken(token)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, pcCount = 4, pcTier = 1 } = await req.json();

    const modelMessages = await convertToModelMessages(messages);
    const systemPrompt = buildAdversaryChatPrompt(
      Math.max(1, Math.min(10, Number(pcCount))),
      Math.max(1, Math.min(4, Number(pcTier)))
    );

    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: modelMessages,
      tools: adversaryChatTools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Adversary chat API error:', error);
    return Response.json(
      { error: 'Failed to process adversary chat' },
      { status: 500 }
    );
  }
}
