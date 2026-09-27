import { AIContextPayload, AIStreamChunk } from "../types";

export interface IAIProvider {
  name: string;
  generateText(
    prompt: string, 
    context: AIContextPayload, 
    systemPrompt: string
  ): Promise<{ text: string; tokenUsage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }>;

  generateStream(
    prompt: string, 
    context: AIContextPayload, 
    systemPrompt: string, 
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<{ fullText: string; tokenUsage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }>;
}
