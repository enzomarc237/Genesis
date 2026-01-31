
import React from 'react';
import { Icons } from '../constants';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
             <span className="font-black text-white italic">G</span>
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase italic">Genesis</span>
        </div>
        <button 
          onClick={onStart}
          className="px-6 py-2 bg-slate-100 text-slate-950 rounded-full font-bold hover:bg-white transition-all text-sm"
        >
          Launch Studio
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto w-full text-center space-y-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-blue-400 text-xs font-bold uppercase tracking-widest animate-bounce">
          Powered by Gemini 3 Intelligence
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
          Ideate. <span className="gradient-text">Generate.</span><br />
          Dominate.
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed">
          The ultimate AI product discovery suite. From napkin ideas to production-ready plans in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={onStart}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all hover:scale-105"
          >
            Get Started for Free
          </button>
          <button className="px-10 py-5 glass hover:bg-slate-900 text-white rounded-2xl font-bold text-lg transition-all">
            View Sample Blueprint
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 w-full text-left">
          <div className="glass p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
               <Icons.LightBulb />
            </div>
            <h3 className="font-bold text-lg">Idea Ignition</h3>
            <p className="text-slate-400 text-sm">Rapid brainstorming fueled by Gemini 3 Flash. Find your edge instantly.</p>
          </div>
          <div className="glass p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
               <Icons.Clipboard />
            </div>
            <h3 className="font-bold text-lg">Full-Scale Plans</h3>
            <p className="text-slate-400 text-sm">PRDs, Specs, Designs, and Timeline. Every document you need, exportable.</p>
          </div>
          <div className="glass p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
               <Icons.Image />
            </div>
            <h3 className="font-bold text-lg">Visual Studio</h3>
            <p className="text-slate-400 text-sm">Generate high-fidelity UI concepts and product shots in 4K resolution.</p>
          </div>
        </div>
      </main>

      <footer className="p-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        © 2024 Genesis Studio. Built for the creators of tomorrow.
      </footer>
    </div>
  );
};

export default LandingPage;
