
import React, { useState } from 'react';
import { AIService } from '../services/aiService';
import { ProductDocs, AIConfig } from '../types';
import { Icons } from '../constants';

interface GeneratorProps {
  config: AIConfig;
}

const Generator: React.FC<GeneratorProps> = ({ config }) => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof ProductDocs>('prd');
  const [docs, setDocs] = useState<ProductDocs | null>(null);

  const generateDocs = async () => {
    if (!concept) return;
    setLoading(true);
    try {
      const response = await AIService.generateText(
        `Create a comprehensive suite of product documentation for this idea: "${concept}".
        You MUST return the content in a format I can parse into four sections: 
        1. PRD (Problem, Goals, User Stories, Features)
        2. TECHNICAL SPECS (Tech stack, API endpoints, Data schema)
        3. DESIGN SYSTEM (Color palette, Typography, UI Components, UX Flow)
        4. DEV PLAN (Phase 1-4 timeline with tasks)
        
        Label each clearly like [PRD_START], [PRD_END], [SPECS_START] etc.`,
        config,
        { 
          useThinking: config.provider === 'Gemini',
          systemInstruction: "You are a world-class Product Manager and Technical Architect. Your documentation is precise, innovative, and thorough." 
        }
      );

      const text = response.text;
      const extract = (start: string, end: string) => {
        const regex = new RegExp(`${start}([\\s\\S]*?)${end}`);
        return text.match(regex)?.[1]?.trim() || "Information not found.";
      };

      setDocs({
        prd: extract('\\[PRD_START\\]', '\\[PRD_END\\]'),
        specs: extract('\\[SPECS_START\\]', '\\[SPECS_END\\]'),
        design: extract('\\[DESIGN_START\\]', '\\[DESIGN_END\\]'),
        plans: extract('\\[PLANS_START\\]', '\\[PLANS_END\\]'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!docs) return;
    const content = `
# PROJECT CONCEPT: ${concept}
---
## PRD
${docs.prd}
---
## TECHNICAL SPECS
${docs.specs}
---
## DESIGN SYSTEM
${docs.design}
---
## DEVELOPMENT PLAN
${docs.plans}
    `;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_Genesis_${concept.slice(0, 10).replace(/\s/g, '_')}.md`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      {!docs ? (
        <div className="max-w-2xl mx-auto py-20 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold leading-tight">From Zero to <span className="gradient-text">Plan</span>.</h1>
            <p className="text-xl text-slate-400">Current Intelligence: <span className="text-blue-500 font-mono">{config.selectedModel}</span></p>
          </div>
          <div className="space-y-4">
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="A mobile app for neighborhood tool sharing with real-time tracking..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none placeholder:text-slate-700 shadow-xl"
            />
            <button
              onClick={generateDocs}
              disabled={loading || !concept}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-white/5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Generating Blueprint...
                </>
              ) : (
                <><Icons.Sparkles /> Blueprint Your Idea</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setDocs(null)}
                className="p-2 text-slate-500 hover:text-white transition-all bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h2 className="text-xl font-bold truncate max-w-md text-slate-200">{concept}</h2>
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Markdown
            </button>
          </div>

          <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
            {(Object.keys(docs) as Array<keyof ProductDocs>).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="glass p-8 rounded-3xl min-h-[500px] prose prose-invert max-w-none shadow-2xl">
            <div className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
              {docs[activeTab]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
