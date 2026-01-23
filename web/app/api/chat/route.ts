import { anthropic } from '@/lib/anthropic';
import { validatePassword } from '@/lib/auth';
import { CHARACTER_CREATION_PROMPT } from '@/lib/prompts';
import { RULES_TOOLS, executeTool } from '@/lib/tools';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    const { messages, password } = await req.json();

    // Validate password
    if (!validatePassword(password)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert messages to Anthropic format
    const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })
    );

    // Call Anthropic
    let response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 4096,
      system: CHARACTER_CREATION_PROMPT,
      messages: anthropicMessages,
      tools: RULES_TOOLS,
    });

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => ({
          type: 'tool_result' as const,
          tool_use_id: toolUse.id,
          content: await executeTool(toolUse.name, toolUse.input as Record<string, unknown>),
        }))
      );

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 4096,
        system: CHARACTER_CREATION_PROMPT,
        messages: [
          ...anthropicMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
        tools: RULES_TOOLS,
      });
    }

    // Extract text response
    const textContent = response.content.find(
      (block): block is Anthropic.Messages.TextBlock => block.type === 'text'
    );

    return Response.json({
      content: textContent?.text || '',
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}
