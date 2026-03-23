import { createChatHandler } from '@/lib/chat-handler';
import { buildAdversaryChatPrompt } from '@/lib/prompts';
import { adversaryChatTools } from '@/lib/tools';

export const POST = createChatHandler({
  getSystemPrompt: (body) => {
    const pcCount = Math.max(1, Math.min(10, Number(body.pcCount ?? 4)));
    const pcTier = Math.max(1, Math.min(4, Number(body.pcTier ?? 1)));
    return buildAdversaryChatPrompt(pcCount, pcTier);
  },
  tools: adversaryChatTools,
  label: 'Adversary chat',
  useSmartRouting: true,
});
