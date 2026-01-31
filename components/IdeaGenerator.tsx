
import React, { useState } from 'react';
import { AIService } from '../services/aiService';
import { Icons } from '../constants';
import { AIConfig } from '../types';

interface IdeaGeneratorProps {
  config: AIConfig;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ config }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await AIService.generateText(
        `Generate 5 innovative product ideas or features related to: "${topic}". Provide short, catchy names and a one-sentence value proposition for each.`,
        config,
        { systemInstruction: "You are an expert product strategist specialized in blue ocean opportunities." }
      );
      const lines = response.text.split('\n').filter(l => l.trim().length > 5);
      setIdeas(lines);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Spark Innovation</h1>
        <p className="text-slate-400">Current Engine: <span className="text-blue-400 font-mono text-sm">{config.selectedModel}</span> ({config.provider})</p>
      </div>

      <div className="relative group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's on your mind? e.g., AI for Sustainable Gardening"
          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-6 py-5 pr-40 text-lg focus:outline-none transition-all"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : <><Icons.Sparkles /> Brainstorm</>}
        </button>
      </div>

      <div className="grid gap-4">
        {ideas.map((idea, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border-slate-800 hover:border-slate-600 transition-all group animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-slate-200 text-lg font-medium">{idea}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-white transition-all">
                <Icons.Clipboard />
              </button>
            </div>
          </div>
        ))}
      </div>

      {ideas.length === 0 && !loading && (
        <div className="py-20 text-center space-y-4 opacity-40">
          <div className="inline-flex p-4 rounded-full bg-slate-900 text-slate-600">
            <Icons.LightBulb />
          </div>
          <p className="text-slate-500">Your next big idea starts here.</p>
        </div>
      )}
    </div>
  );
};

export default IdeaGenerator;
