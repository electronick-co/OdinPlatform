import Anthropic from "@anthropic-ai/sdk";
import { env } from "@odin/config";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function askClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = msg.content[0];
  if (!block || block.type !== "text") throw new Error("Unexpected content type from Claude");
  return block.text;
}
