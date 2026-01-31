
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Icons, GEMINI_MODELS } from './constants';
import { AIConfig } from './types';
import LandingPage from './components/LandingPage';
import Generator from './components/Generator';
import IdeaGenerator from './components/IdeaGenerator';
import ChatBot from './components/ChatBot';
import ImageStudio from './components/ImageStudio';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [config, setConfig] = useState<AIConfig>({
    provider: 'Gemini',
    apiKey: '',
    selectedModel: 'gemini-3-pro-preview',
    models: GEMINI_MODELS,
    imageModel: 'gemini-2.5-flash-image'
  });

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-950">
        {/* Sidebar */}
        <nav className="w-20 md:w-64 border-r border-slate-900 flex flex-col bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="p-6 mb-8 flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
               <span className="font-black text-white italic">G</span>
             </div>
             <span className="hidden md:block font-black text-xl tracking-tighter uppercase italic">Genesis</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-2 px-4">
            <NavItem to="/" icon={<Icons.Clipboard />} label="Studio" />
            <NavItem to="/ideas" icon={<Icons.LightBulb />} label="Ideas" />
            <NavItem to="/chat" icon={<Icons.Chat />} label="Assistant" />
            <NavItem to="/visuals" icon={<Icons.Image />} label="Visuals" />
          </div>

          <div className="p-4 border-t border-slate-900">
            <NavItem to="/settings" icon={<Icons.Settings />} label="Settings" />
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="h-full overflow-y-auto scroll-smooth">
            <Routes>
              <Route path="/" element={<Generator config={config} />} />
              <Route path="/ideas" element={<IdeaGenerator config={config} />} />
              <Route path="/chat" element={<ChatBot config={config} />} />
              <Route path="/visuals" element={<ImageStudio config={config} />} />
              <Route path="/settings" element={<Settings config={config} onUpdate={setConfig} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
        isActive ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
      }`}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-500' : ''}`}>
        {icon}
      </div>
      <span className="hidden md:block font-semibold text-sm">{label}</span>
    </Link>
  );
};

export default App;
