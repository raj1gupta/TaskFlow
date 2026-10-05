import React from 'react';
import { Zap, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Zap className="w-8 h-8 text-indigo-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        The page or view you are looking for does not exist in your workspace.
      </p>
      <a
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </a>
    </div>
  );
};

export default NotFound;
