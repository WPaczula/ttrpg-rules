import { createChatHandler } from '@/lib/chat-handler';
import { CHARACTER_CREATION_PROMPT } from '@/lib/prompts';
import { createCharacterChatTools } from '@/lib/tools';

export const POST = createChatHandler({
  getSystemPrompt: () => CHARACTER_CREATION_PROMPT,
  tools: createCharacterChatTools,
  label: 'Chat',
  useSmartRouting: true,
});
