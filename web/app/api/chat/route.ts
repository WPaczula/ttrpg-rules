import { streamText, convertToModelMessages, stepCountIs, ToolLoopAgent, Output } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validatePassword } from '@/lib/auth';
import { CHARACTER_CREATION_PROMPT, ROUTING_INSTRUCTIONS, DND_PROMPT } from '@/lib/prompts';
import { rulesTools, dndTools } from '@/lib/tools';
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
    model: anthropic('claude-3-5-haiku-latest'),
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
  return anthropic(isCreative ? 'claude-3-7-sonnet-latest' : 'claude-3-5-haiku-latest');
}

export async function POST(req: Request) {
  try {
    const { messages, password, game = 'daggerheart' } = await req.json();

    if (!validatePassword(password)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [modelMessages, isCreative] = await Promise.all([
      convertToModelMessages(messages),
      determineIfCreative(messages)
    ]);

    const tools = game === 'dnd' ? dndTools : rulesTools;
    const systemPrompt = game === 'dnd' ? DND_PROMPT : CHARACTER_CREATION_PROMPT;

    const result = streamText({
      model: selectModel(isCreative),
      system: systemPrompt,
      messages: modelMessages,
      tools,
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
