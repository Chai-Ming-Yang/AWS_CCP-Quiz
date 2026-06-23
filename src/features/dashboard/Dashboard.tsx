import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, GraduationCap, Flame, PlayCircle } from 'lucide-react';
import { flattenQuestions, getCategoryStats } from '../../core/services/quizService';
import rawData from '../../data/aws_questions.json';
import type { PracticeSet } from '../../core/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const allQuestions = flattenQuestions(rawData as PracticeSet[]);
  const categoryStats = getCategoryStats(allQuestions);
  
  // Frontend Mapping: Clean up names and combine redundant/small categories
  const uiGroups: Record<string, { count: number, rawCategories: string[] }> = {};

  Object.entries(categoryStats).forEach(([rawCat, count]) => {
    let groupName = rawCat;

    // Custom Grouping & Abbreviation Rules
    if (rawCat === "Billing" || rawCat === "Billing and Pricing") {
      groupName = "Billing";
    } else if (rawCat === "Security" || rawCat === "Security and Compliance") {
      groupName = "Security";
    } else if (rawCat === "Architecture and Design" || rawCat === "Technology Core Services" || rawCat === "Cloud Concepts") {
      groupName = "Cloud";
    } else if (rawCat === "Machine Learning") {
      groupName = "ML";
    }

    if (!uiGroups[groupName]) {
      uiGroups[groupName] = { count: 0, rawCategories: [] };
    }
    uiGroups[groupName].count += count;
    uiGroups[groupName].rawCategories.push(rawCat);
  });

  const sortedGroups = Object.keys(uiGroups).sort();

  const handleStartExam = (size: number, isSurvival: boolean = false) => {
    navigate('/exam', { state: { type: 'exam', size, isSurvival } });
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleStartCustomCategory = () => {
    if (selectedGroups.length === 0) return;
    
    // Expand the selected UI groups back into the raw strings needed to filter the JSON
    const rawCategoriesToFetch = selectedGroups.flatMap(group => uiGroups[group].rawCategories);
    navigate('/exam', { state: { type: 'category', category: rawCategoriesToFetch } });
  };

  const totalSelectedQuestions = selectedGroups.reduce((sum, group) => sum + uiGroups[group].count, 0);

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto md:mt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-50 tracking-tight">
          AWS Certified Cloud Practitioner
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Practice Exam Trigger Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg flex flex-col h-fit">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" /> Simulated Practice Exams
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleStartExam(10)}
              className="py-4 px-3 bg-slate-800/80 border border-slate-700 hover:border-blue-500 rounded-xl text-sm font-semibold hover:bg-blue-900/30 text-slate-300 hover:text-blue-400 transition-all text-center shadow-sm"
            >
              10 Qs
            </button>
            <button
              onClick={() => handleStartExam(30)}
              className="py-4 px-3 bg-slate-800/80 border border-slate-700 hover:border-blue-500 rounded-xl text-sm font-semibold hover:bg-blue-900/30 text-slate-300 hover:text-blue-400 transition-all text-center shadow-sm"
            >
              30 Qs
            </button>
            <button
              onClick={() => handleStartExam(65)}
              className="py-4 px-3 bg-slate-800/80 border border-slate-700 hover:border-blue-500 rounded-xl text-sm font-semibold hover:bg-blue-900/30 text-slate-300 hover:text-blue-400 transition-all text-center shadow-sm"
            >
              65 Qs
            </button>
            <button
              onClick={() => handleStartExam(allQuestions.length, true)}
              className="py-4 px-3 bg-orange-950/30 border border-orange-900/50 hover:border-orange-500 rounded-xl text-sm font-bold hover:bg-orange-900/40 text-orange-500 hover:text-orange-400 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
            >
              <Flame className="w-4 h-4 mb-0.5" /> Survival
            </button>
          </div>
        </div>

        {/* Category Practice Trigger Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" /> Custom Domain Focus
            </h2>
          </div>
          
          {/* Uniform Grid Layout for Category Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {sortedGroups.length > 0 ? (
              sortedGroups.map((group) => {
                const isSelected = selectedGroups.includes(group);
                const count = uiGroups[group].count;
                
                return (
                  <button
                    key={group}
                    onClick={() => toggleGroup(group)}
                    className={`py-3 px-2 border rounded-xl text-[13px] md:text-sm font-semibold transition-all shadow-sm flex flex-col items-center justify-center gap-2 text-center leading-snug h-full ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-blue-900/20 transform scale-[1.02]' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <span>{group}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {count} Qs
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-sm text-slate-500 italic col-span-full text-center py-4">No categories found in dataset.</div>
            )}
          </div>

          {/* Dynamic Launch Button */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button
              onClick={handleStartCustomCategory}
              disabled={selectedGroups.length === 0}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {selectedGroups.length > 0 ? (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Session ({totalSelectedQuestions} Qs)
                </>
              ) : (
                'Select categories to begin'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;