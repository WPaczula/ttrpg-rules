import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validatePassword } from '@/lib/auth';
import { buildAdversaryChatPrompt } from '@/lib/prompts';
import { adversaryChatTools } from '@/lib/tools';

export async function POST(req: Request) {
  try {
    const { messages, password, pcCount = 4, pcTier = 1 } = await req.json();

    if (!validatePassword(password)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
