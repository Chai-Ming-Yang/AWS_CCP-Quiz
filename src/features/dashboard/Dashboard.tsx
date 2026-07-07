import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import rawData from '../../data/aws_questions.json';
import type { QuizDatabase, QuestionGroup } from '../../core/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const db = rawData as QuizDatabase;
  
  const easyGroups = db.easy || [];
  const hardGroups = db.hard || [];

  const [selectedEasy, setSelectedEasy] = useState<string[]>([]);
  const [selectedHard, setSelectedHard] = useState<string[]>([]);

  const toggleEasy = (section: string) => {
    setSelectedEasy(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const toggleHard = (section: string) => {
    setSelectedHard(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const handleStartSession = () => {
    if (selectedEasy.length === 0 && selectedHard.length === 0) return;
    navigate('/exam', { state: { type: 'session', selections: { easy: selectedEasy, hard: selectedHard } } });
  };

  const totalSelectedQs = 
    selectedEasy.reduce((sum, sec) => sum + (easyGroups.find(g => g.section === sec)?.questions.length || 0), 0) +
    selectedHard.reduce((sum, sec) => sum + (hardGroups.find(g => g.section === sec)?.questions.length || 0), 0);

  const renderGroupButtons = (
    groups: QuestionGroup[], 
    selectedList: string[], 
    toggleFn: (s: string) => void,
    colorTheme: 'blue' | 'red'
  ) => {
    if (groups.length === 0) {
      return <div className="text-sm text-slate-500 italic col-span-full text-center py-8">No sections available yet.</div>;
    }

    return groups.map((group) => {
      const isSelected = selectedList.includes(group.section);
      const count = group.questions.length;
      
      return (
        <button
          key={group.section}
          onClick={() => toggleFn(group.section)}
          className={`py-3 px-2 border rounded-xl text-[13px] md:text-sm font-semibold transition-all shadow-sm flex flex-col items-center justify-center gap-2 text-center leading-snug h-full ${
            isSelected 
              ? (colorTheme === 'blue' 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-900/20 transform scale-[1.02]' 
                  : 'bg-rose-600 border-rose-500 text-white shadow-rose-900/20 transform scale-[1.02]')
              : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
          }`}
        >
          <span>{group.section}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
            isSelected 
              ? (colorTheme === 'blue' ? 'bg-blue-800 text-blue-100' : 'bg-rose-800 text-rose-100') 
              : 'bg-slate-900 text-slate-500'
          }`}>
            {count} Qs
          </span>
        </button>
      );
    });
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto md:mt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-50 tracking-tight">
          AWS Certified Cloud Practitioner
        </h1>
        <p className="text-slate-400 mt-2">Select domains across difficulties to build your custom test</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg flex flex-col">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Easy Questions
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {renderGroupButtons(easyGroups, selectedEasy, toggleEasy, 'blue')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg flex flex-col">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Hard Questions
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {renderGroupButtons(hardGroups, selectedHard, toggleHard, 'red')}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg sticky bottom-6 z-10">
        <button
          onClick={handleStartSession}
          disabled={totalSelectedQs === 0}
          className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
        >
          {totalSelectedQs > 0 ? (
            <>
              <PlayCircle className="w-5 h-5" />
              Start Session ({totalSelectedQs} Qs)
            </>
          ) : (
            'Select categories to begin'
          )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;