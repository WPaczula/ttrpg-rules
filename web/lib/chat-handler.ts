import { streamText, convertToModelMessages, stepCountIs, ToolLoopAgent, Output } from 'ai';
import { anthropic } from '@/lib/anthropic';
import { validateSessionToken } from '@/lib/auth';
import { ROUTING_INSTRUCTIONS } from '@/lib/prompts';
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

export interface ChatHandlerConfig {
  getSystemPrompt: (body: any) => string | Promise<string>;
  tools: Record<string, any>;
  label: string;
  useSmartRouting?: boolean;
  model?: string;
}

export function createChatHandler(config: ChatHandlerConfig) {
  return async function POST(req: Request) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_session')?.value;
      if (!validateSessionToken(token)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { messages } = body;

      const systemPrompt = await config.getSystemPrompt(body);

      let model;
      if (config.useSmartRouting) {
        const [modelMessages, isCreative] = await Promise.all([
          convertToModelMessages(messages),
          determineIfCreative(messages)
        ]);

        model = selectModel(isCreative);

        const result = streamText({
          model,
          system: systemPrompt,
          messages: modelMessages,
          tools: config.tools,
          stopWhen: stepCountIs(5),
        });

        return result.toUIMessageStreamResponse();
      }

      const modelMessages = await convertToModelMessages(messages);
      model = anthropic(config.model ?? 'claude-haiku-4-5');

      const result = streamText({
        model,
        system: systemPrompt,
        messages: modelMessages,
        tools: config.tools,
        stopWhen: stepCountIs(5),
      });

      return result.toUIMessageStreamResponse();
    } catch (error) {
      console.error(`${config.label} API error:`, error);
      return Response.json(
        { error: `Failed to process ${config.label}` },
        { status: 500 }
      );
    }
  };
}
