import { IAIProvider } from "./base";
import { AIContextPayload, AIStreamChunk } from "../types";

export class OpenAIProvider implements IAIProvider {
  name = 'OpenAI';

  private getApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateText(
    prompt: string,
    context: AIContextPayload,
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server.");
    }

    const model = this.getModel();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 800
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return {
        text: data.choices?.[0]?.message?.content || '',
        tokenUsage: data.usage ? {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens
        } : undefined
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateStream(
    prompt: string,
    context: AIContextPayload,
    systemPrompt: string,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<{ fullText: string; tokenUsage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server.");
    }

    const model = this.getModel();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let fullText = '';

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 800,
          stream: true
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI stream error ${res.status}: ${errorText}`);
      }

      if (!res.body) {
        throw new Error("No response body available from OpenAI streaming endpoint.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                onChunk({
                  token: delta,
                  isDone: false
                });
              }
            } catch {
              // Ignore malformed JSON
            }
          }
        }
      }

      onChunk({
        token: '',
        isDone: true,
        metadata: {
          intent: context.intent,
          location: context.location.name,
          provider: 'OpenAI',
          model,
          dataAgeSeconds: context.weather.dataAgeSeconds,
          confidence: 'High',
          sources: [context.weather.dataSource, 'OpenAI']
        }
      });

      const words = fullText.split(/\s+/).length;
      return {
        fullText,
        tokenUsage: {
          prompt_tokens: Math.round(prompt.length / 4),
          completion_tokens: Math.round(words * 1.3),
          total_tokens: Math.round(prompt.length / 4 + words * 1.3)
        }
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const openAIProvider = new OpenAIProvider();
