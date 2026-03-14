import { streamText, convertToModelMessages, stepCountIs, ToolLoopAgent, Output } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validateSessionToken } from '@/lib/auth';
import { CHARACTER_CREATION_PROMPT, ROUTING_INSTRUCTIONS } from '@/lib/prompts';
import { rulesTools } from '@/lib/tools';
import { cookies } from 'next/headers';
import z from 'zod';

const routingSchema = z.object({
  isCreative: z.boolean(),
  reason: z.string().optional()
});

function serializeMessages(messages: any[]) {
  return messages.slice(-2).map((m: any) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
  }));
}

async function determineIfCreative(messages: any[]): Promise<boolean> {
  const agent = new ToolLoopAgent({
    model: anthropic('claude-haiku-4-5'),
    instructions: ROUTING_INSTRUCTIONS,
    stopWhen: stepCountIs(1),
    output: Output.object({ schema: routingSchema }),
  });

  const recentContext = serializeMessages(messages);
  const { output } = await agent.generate({
    prompt: `Based on this conversation, should the response be CREATIVE or FACTUAL?\n\n${JSON.stringify(recentContext)}`
  });

  return output?.isCreative ?? false;
}

function selectModel(isCreative: boolean) {
  return anthropic(isCreative ? 'claude-sonnet-4-6' : 'claude-haiku-4-5');
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_session')?.value;
    if (!validateSessionToken(token)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    const [modelMessages, isCreative] = await Promise.all([
      convertToModelMessages(messages),
      determineIfCreative(messages)
    ]);

    const result = streamText({
      model: selectModel(isCreative),
      system: CHARACTER_CREATION_PROMPT,
      messages: modelMessages,
      tools: rulesTools,
      stopWhen: stepCountIs(5),
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
