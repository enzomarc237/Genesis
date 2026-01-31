
import { AIConfig } from '../types';
import { GeminiService } from './geminiService';

export class AIService {
  static async generateText(prompt: string, config: AIConfig, options: { 
    systemInstruction?: string, 
    useSearch?: boolean,
    useThinking?: boolean 
  } = {}) {
    // If provider is Gemini, use the dedicated GeminiService which follows the strict SDK rules
    if (config.provider === 'Gemini') {
      return await GeminiService.generateText(prompt, {
        model: config.selectedModel,
        systemInstruction: options.systemInstruction,
        useSearch: options.useSearch,
        useThinking: options.useThinking
      });
    }

    // Generic implementation for OpenAI-compatible APIs (OpenRouter/OpenAI/Ollama)
    const baseUrl = this.getBaseUrl(config.provider);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const body = {
      model: config.selectedModel,
      messages: [
        ...(options.systemInstruction ? [{ role: 'system', content: options.systemInstruction }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    };

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        groundingChunks: []
      };
    } catch (error) {
      console.error(`AI Generation Error (${config.provider}):`, error);
      throw error;
    }
  }

  private static getBaseUrl(provider: string): string {
    switch (provider) {
      case 'OpenAI': return 'https://api.openai.com/v1';
      case 'OpenRouter': return 'https://openrouter.ai/api/v1';
      case 'Ollama': return 'http://localhost:11434/v1';
      default: return '';
    }
  }

  static async fetchAvailableModels(config: AIConfig): Promise<string[]> {
    if (config.provider === 'Gemini') {
      return [
        'gemini-3-pro-preview',
        'gemini-3-flash-preview',
        'gemini-2.5-flash-lite-latest'
      ];
    }

    const baseUrl = this.getBaseUrl(config.provider);
    const headers: Record<string, string> = {};
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    try {
      const isOllama = config.provider === 'Ollama';
      // For Ollama, try the native tags endpoint if needed, but the /v1/models is also common.
      // We try the OpenAI standard first as defined in the baseUrl, but adjust logic for responses.
      const endpoint = '/models';
      const response = await fetch(`${baseUrl}${endpoint}`, { headers });
      
      if (!response.ok) {
        // Fallback for Ollama native if /v1/models fails
        if (isOllama) {
          const nativeUrl = baseUrl.replace('/v1', '') + '/api/tags';
          const nativeResp = await fetch(nativeUrl);
          if (nativeResp.ok) {
            const nativeData = await nativeResp.json();
            return nativeData.models?.map((m: any) => m.name) || [];
          }
        }
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // OpenAI/OpenRouter standard: { data: [ { id: "..." } ] }
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((m: any) => m.id);
      }
      
      // Ollama native standard: { models: [ { name: "..." } ] }
      if (data.models && Array.isArray(data.models)) {
        return data.models.map((m: any) => m.name);
      }
      
      return [];
    } catch (error) {
      console.error("Fetch models error:", error);
      return [];
    }
  }
}
