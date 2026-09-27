import { IAIProvider } from "./base";
import { AIContextPayload, AIStreamChunk } from "../types";

export class GeminiProvider implements IAIProvider {
  name = 'Google Gemini';

  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
  }

  private getModel(): string {
    return process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  async generateText(
    prompt: string,
    context: AIContextPayload,
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n[USER QUESTION]\n${prompt}` }] }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = data.usageMetadata;

      return {
        text,
        tokenUsage: usage ? {
          prompt_tokens: usage.promptTokenCount,
          completion_tokens: usage.candidatesTokenCount,
          total_tokens: usage.totalTokenCount
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
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let fullText = '';
    let totalPromptTokens = 0;
    let totalCandidatesTokens = 0;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n[USER QUESTION]\n${prompt}` }] }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini SSE stream responded with status ${res.status}: ${errorText}`);
      }

      if (!res.body) {
        throw new Error("No response body available from Gemini streaming endpoint.");
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
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const partText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (partText) {
                fullText += partText;
                onChunk({
                  token: partText,
                  isDone: false
                });
              }
              if (parsed.usageMetadata) {
                totalPromptTokens = parsed.usageMetadata.promptTokenCount || totalPromptTokens;
                totalCandidatesTokens = parsed.usageMetadata.candidatesTokenCount || totalCandidatesTokens;
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }

      // Signal completion with metadata
      onChunk({
        token: '',
        isDone: true,
        metadata: {
          intent: context.intent,
          location: context.location.name,
          provider: 'Google Gemini',
          model,
          dataAgeSeconds: context.weather.dataAgeSeconds,
          confidence: 'High',
          sources: [context.weather.dataSource, 'Google Gemini']
        }
      });

      return {
        fullText,
        tokenUsage: {
          prompt_tokens: totalPromptTokens,
          completion_tokens: totalCandidatesTokens,
          total_tokens: totalPromptTokens + totalCandidatesTokens
        }
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const geminiProvider = new GeminiProvider();
