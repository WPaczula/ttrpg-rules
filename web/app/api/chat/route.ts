import { createChatHandler } from '@/lib/chat-handler';
import { CHARACTER_CREATION_PROMPT } from '@/lib/prompts';
import { characterChatTools } from '@/lib/tools';

export const POST = createChatHandler({
  getSystemPrompt: () => CHARACTER_CREATION_PROMPT,
  tools: characterChatTools,
  label: 'Chat',
  useSmartRouting: true,
});
