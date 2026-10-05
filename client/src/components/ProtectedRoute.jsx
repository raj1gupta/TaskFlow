import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-4 animate-pulse">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
