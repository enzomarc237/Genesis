
import { GoogleGenAI, Type, GenerateContentResponse, GenerateContentParameters } from "@google/genai";

/**
 * Robust handling of Gemini API calls following the strict requirements.
 */
export class GeminiService {
  private static getClient() {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  static async generateText(prompt: string, options: { 
    model?: string, 
    systemInstruction?: string, 
    useSearch?: boolean,
    useThinking?: boolean
  } = {}) {
    // Creating a new instance right before making an API call ensures it uses the most up-to-date key
    const ai = this.getClient();
    const modelName = options.model || (options.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview');
    
    const config: any = {
      systemInstruction: options.systemInstruction,
    };

    if (options.useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (options.useThinking) {
      // The maximum thinking budget for 2.5 Pro is 32768, and for 2.5/3 Flash is 24576.
      const budget = modelName.includes('pro') ? 32768 : 24576;
      config.thinkingConfig = { thinkingBudget: budget };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config,
    });

    return {
      text: response.text || "",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  static async generateImage(prompt: string, config: { 
    aspectRatio?: string, 
    imageSize?: string,
    model?: string
  }) {
    const ai = this.getClient();
    const modelName = config.model || 'gemini-2.5-flash-image';
    
    // imageSize is only supported for gemini-3-pro-image-preview (Gempix 2 recipe)
    // Constructing the config object conditionally to avoid INVALID_ARGUMENT errors on Flash models
    const imageConfig: any = {
      aspectRatio: config.aspectRatio || "1:1",
    };

    if (modelName === 'gemini-3-pro-image-preview') {
      imageConfig.imageSize = config.imageSize || "1K";
    }
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return imageUrl;
  }

  static async editImage(base64Image: string, prompt: string, mimeType: string = 'image/png') {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
              mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return imageUrl;
  }

  static async analyzeImage(base64Image: string, prompt: string, mimeType: string = 'image/png') {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
              mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text;
  }
}
