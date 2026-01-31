
export type AIProvider = 'OpenAI' | 'OpenRouter' | 'Gemini' | 'Ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  selectedModel: string;
  models: string[];
  imageModel: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface ProductDocs {
  prd: string;
  specs: string;
  design: string;
  plans: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  imageUrl?: string;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';
