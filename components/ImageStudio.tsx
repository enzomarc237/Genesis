
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { AspectRatio, ImageSize, AIConfig } from '../types';
import { Icons } from '../constants';

interface ImageStudioProps {
  config: AIConfig;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ config }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'analyze'>('create');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');

  const handleCreate = async () => {
    // Only Pro model requires the special key selection dialog
    if (config.imageModel === 'gemini-3-pro-image-preview') {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
    }

    setLoading(true);
    try {
      const url = await GeminiService.generateImage(prompt, { 
        aspectRatio, 
        imageSize,
        model: config.imageModel // Use the selected model from config
      });
      setGeneratedUrl(url);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes("Requested entity was not found.")) {
        if (window.aistudio) await window.aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    try {
      const url = await GeminiService.editImage(uploadedImage, prompt);
      setGeneratedUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    try {
      const result = await GeminiService.analyzeImage(uploadedImage, prompt || "Describe this image in detail.");
      setAnalysis(result || "No findings.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="flex bg-slate-900 rounded-xl p-1">
            {(['create', 'edit', 'analyze'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === m ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Engine: {config.imageModel.split('-')[1]}</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'create' ? "A sleek futuristic smartphone with a translucent screen..." :
                mode === 'edit' ? "Add a retro aesthetic and remove background..." :
                "Ask about the image elements..."
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
            />

            {mode === 'create' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left duration-300">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r as AspectRatio)}
                        className={`py-2 text-[10px] rounded border transition-all ${aspectRatio === r ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-bold uppercase">Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1K', '2K', '4K'].map(s => (
                      <button
                        key={s}
                        onClick={() => setImageSize(s as ImageSize)}
                        disabled={config.imageModel === 'gemini-2.5-flash-image' && s !== '1K'}
                        className={`py-2 text-[10px] rounded border transition-all ${imageSize === s ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100' : 'bg-slate-900 border-slate-800 text-slate-400 disabled:opacity-30'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(mode === 'edit' || mode === 'analyze') && (
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase">Source Image</label>
                <input type="file" onChange={handleFileUpload} className="hidden" id="img-upload" accept="image/*" />
                <label htmlFor="img-upload" className="flex items-center justify-center p-4 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-blue-500 transition-all text-slate-500 gap-2 bg-slate-950">
                  {uploadedImage ? 'Change Image' : <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Upload File</>}
                </label>
                {uploadedImage && <img src={uploadedImage} className="w-full rounded-lg h-32 object-cover border border-slate-700 mt-2 shadow-lg" alt="Upload" />}
              </div>
            )}

            <button
              onClick={mode === 'create' ? handleCreate : mode === 'edit' ? handleEdit : handleAnalyze}
              disabled={loading || !prompt || ((mode === 'edit' || mode === 'analyze') && !uploadedImage)}
              className="w-full py-4 bg-white text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>{mode === 'create' ? 'Generate' : mode === 'edit' ? 'Modify' : 'Analyze'}</>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl min-h-[400px] flex items-center justify-center relative overflow-hidden bg-slate-950/50 shadow-2xl">
          {mode === 'analyze' && analysis ? (
             <div className="p-8 prose prose-invert max-w-none w-full animate-in fade-in zoom-in duration-500 overflow-y-auto max-h-[600px] custom-scrollbar">
               <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                 <Icons.Sparkles /> Analysis Result
               </h3>
               <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis}</p>
             </div>
          ) : generatedUrl ? (
            <img 
              src={generatedUrl} 
              className="w-full h-full object-contain animate-in fade-in zoom-in duration-700" 
              alt="Generated" 
            />
          ) : (
            <div className="text-slate-700 flex flex-col items-center gap-4">
              <Icons.Image />
              <p className="text-sm font-medium">Your visual creation will appear here</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-xs">Consulting Visual Engine...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
