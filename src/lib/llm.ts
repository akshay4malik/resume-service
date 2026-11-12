/**
 * @file src/lib/llm.ts
 * @description Centralized LLM client supporting OpenAI API models.
 * Reads OPENAI_API_KEY and OPENAI_MODEL from environment variables.
 */

import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('[llm] OPENAI_API_KEY is not defined in environment variables.');
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o';
}

/**
 * Executes a text completion prompt with OpenAI chat completions.
 */
export async function generateCompletion({
  systemPrompt,
  userPrompt,
  temperature = 0.1,
  responseFormatJson = false,
}: {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  responseFormatJson?: boolean;
}): Promise<string> {
  const openai = getOpenAIClient();
  const model = getOpenAIModel();

  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt });

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    ...(responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
  });

  return completion.choices[0]?.message?.content || '';
}

