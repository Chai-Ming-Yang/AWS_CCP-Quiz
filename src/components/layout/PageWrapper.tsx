import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { CloudLightning, RotateCcw } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';

const PageWrapper: React.FC = () => {
  const { attempts, clearHistory } = useQuizStore();
  const navigate = useNavigate();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all your practice history and statistics?')) {
      clearHistory();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Navigation Header - Hidden on mobile (hidden md:block) */}
      <header className="hidden md:block bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-400 tracking-tight">
            <CloudLightning className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span>AWS CCP <span className="text-slate-400 font-medium text-base">Quiz Engine</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {attempts > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/30"
                title="Clear all local progress"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Stats
              </button>
            )}
            <div className="text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              Attempts: <span className="font-bold text-slate-100">{attempts}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Static AWS Practice Engine • Local Persistence Engine Only
      </footer>
    </div>
  );
};

export default PageWrapper;