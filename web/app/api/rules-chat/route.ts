import { createChatHandler } from '@/lib/chat-handler';
import { RULES_CHAT_PROMPT } from '@/lib/prompts';
import { createRulesTools } from '@/lib/tools';

export const POST = createChatHandler({
  getSystemPrompt: () => RULES_CHAT_PROMPT,
  tools: createRulesTools,
  label: 'Rules chat',
});
