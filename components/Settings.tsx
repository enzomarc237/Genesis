
import React, { useState } from 'react';
import { AIConfig, AIProvider } from '../types';
import { PROVIDERS, GEMINI_MODELS } from '../constants';
import { AIService } from '../services/aiService';

interface SettingsProps {
  config: AIConfig;
  onUpdate: (config: AIConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdate }) => {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchModels = async () => {
    setFetching(true);
    setError(null);
    try {
      const models = await AIService.fetchAvailableModels(config);
      if (models.length > 0) {
        onUpdate({ 
          ...config, 
          models, 
          selectedModel: models.includes(config.selectedModel) ? config.selectedModel : models[0] 
        });
      } else {
        setError("No models found or connection failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch models");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">AI Configuration</h2>
        <p className="text-slate-400">Configure your global AI providers to power the Project Genesis studio.</p>
      </div>

      <div className="glass p-8 rounded-2xl space-y-8">
        {/* Provider Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Provider</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROVIDERS.map(p => (
              <button
                key={p}
                onClick={() => onUpdate({ ...config, provider: p as AIProvider })}
                className={`px-4 py-3 rounded-xl text-sm transition-all border ${
                  config.provider === p 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-100' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500">API Key</label>
            {config.provider === 'Gemini' && (
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Using system default (process.env)</span>
            )}
          </div>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => onUpdate({ ...config, apiKey: e.target.value })}
            placeholder={config.provider === 'Gemini' ? "Optional override for environment key..." : `Enter your ${config.provider} API Key`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-700"
          />
          {config.provider === 'Ollama' && (
            <p className="text-xs text-slate-500 italic">Ensure Ollama is running locally with CORS enabled if required.</p>
          )}
        </div>

        {/* Model Selection */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-4">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Active Model</label>
            <select
              value={config.selectedModel}
              onChange={(e) => onUpdate({ ...config, selectedModel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {config.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={handleFetchModels}
            disabled={fetching}
            className="h-[58px] px-8 bg-slate-100 text-slate-950 font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            {fetching ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : 'Fetch Models'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Image Gen Settings */}
      <div className="glass p-8 rounded-2xl space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-500">✦</span> Visual Studio Settings
        </h3>
        <div className="space-y-4">
           <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Image Generation Model</label>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => onUpdate({ ...config, imageModel: 'gemini-2.5-flash-image' })}
                className={`p-4 rounded-xl border text-left transition-all ${config.imageModel === 'gemini-2.5-flash-image' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="font-bold text-slate-100">Gemini 2.5 Flash Image</div>
                <div className="text-xs text-slate-400 mt-1">Free tier optimized. High speed, great for rapid ideation.</div>
              </button>
              <button 
                onClick={() => onUpdate({ ...config, imageModel: 'gemini-3-pro-image-preview' })}
                className={`p-4 rounded-xl border text-left transition-all ${config.imageModel === 'gemini-3-pro-image-preview' ? 'bg-purple-600/10 border-purple-500' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="font-bold text-slate-100">Gemini 3 Pro Image</div>
                <div className="text-xs text-slate-400 mt-1">High quality 4K renders. Requires billing/paid project.</div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
