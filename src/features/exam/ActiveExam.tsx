import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Square, CheckSquare } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import { filterBySections, shuffleQuestions } from '../../core/services/quizService';
import { evaluateQuiz } from '../../core/services/scoringService';
import rawData from '../../data/aws_questions.json';
import type { Question, QuizDatabase } from '../../core/types';

interface ExamConfig {
  type: 'session';
  selections: {
    easy: string[];
    hard: string[];
  };
}

const ActiveExam: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordAttempt } = useQuizStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [optionPlacements, setOptionPlacements] = useState<Record<string, number[]>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());
  
  const config = location.state as ExamConfig | null;

  useEffect(() => {
    if (!config) return;

    const db = rawData as QuizDatabase;
    const easyQs = filterBySections(db.easy || [], config.selections.easy);
    const hardQs = filterBySections(db.hard || [], config.selections.hard);
    
    const combinedQuestions = shuffleQuestions([...easyQs, ...hardQs]);

    // Generate isolated randomized order layouts for the choices of every item
    const layoutMap: Record<string, number[]> = {};
    combinedQuestions.forEach(q => {
      const regularIndices = q.options.map((_, i) => i);
      const shuffledIndices = [...regularIndices];
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
      layoutMap[q.id] = shuffledIndices;
    });

    setOptionPlacements(layoutMap);
    setQuestions(combinedQuestions);
    setHasLoaded(true);
  }, [config]);

  if (!config) return <Navigate to="/" replace />;
  if (!hasLoaded) return <div className="p-8 text-center text-slate-500">Loading exam engine...</div>;
  if (questions.length === 0) return <Navigate to="/" replace />;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  
  const currentSelections = userAnswers[currentQuestion.id] || [];
  
  // Detect if the question is configured as single select vs multi-select array rules
  const isMultiSelect = currentQuestion.correctAnswers !== undefined;
  
  const targetAnswers = isMultiSelect && currentQuestion.correctAnswers
    ? currentQuestion.correctAnswers 
    : (currentQuestion.correctAnswer !== undefined ? [currentQuestion.correctAnswer] : []);

  const requiredCount = targetAnswers.length;
  
  // Unlocks verification step once user has supplied the correct absolute number of requirements
  const hasMetQuota = currentSelections.length === requiredCount;
  const isRevealed = revealedQuestions.has(currentQuestion.id);

  const isCorrect = isRevealed && 
    currentSelections.length === requiredCount &&
    [...currentSelections].sort().every((val, i) => val === [...targetAnswers].sort()[i]);

  const handleToggleOption = (originalIdx: number) => {
    if (isRevealed) return;
    
    setUserAnswers(prev => {
      const active = prev[currentQuestion.id] || [];
      
      // PARADIGM B: Single-Select Radio Mechanism (correctAnswer: X)
      if (!isMultiSelect) {
        // Instantly switch to the clicked option. No need to click to deselect.
        return { ...prev, [currentQuestion.id]: [originalIdx] };
      }
      
      // PARADIGM A: Multi-Select Checkbox Mechanism (correctAnswers: [...])
      if (active.includes(originalIdx)) {
        // Deselect if already active
        return { ...prev, [currentQuestion.id]: active.filter(i => i !== originalIdx) };
      }
      
      if (active.length < requiredCount) {
        // Add option up to maximum allowed answers quota
        return { ...prev, [currentQuestion.id]: [...active, originalIdx] };
      }
      
      return prev;
    });
  };

  const handleConfirmAnswer = () => {
    if (!hasMetQuota || isRevealed) return;
    setRevealedQuestions(prev => new Set(prev).add(currentQuestion.id));
  };

  const handleSubmit = () => {
    const result = evaluateQuiz(questions, userAnswers);
    const totalSelectedSecs = config.selections.easy.length + config.selections.hard.length;
    const context = totalSelectedSecs > 1 
      ? 'Mixed Domains' 
      : (config.selections.easy[0] || config.selections.hard[0]);

    recordAttempt(result, config.type, context);
    navigate('/results', { state: { result, questions, userAnswers }, replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden min-h-[60vh]">
      <div className="bg-slate-950/50 border-b border-slate-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Targeted Domain Focus
          </span>
          <span className="text-sm font-semibold text-slate-300">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded mb-4 ${
            isMultiSelect 
              ? 'bg-amber-950/50 border border-amber-900/50 text-amber-400' 
              : 'bg-blue-950/50 border border-blue-900/50 text-blue-400'
          }`}>
            {isMultiSelect ? `Select ${requiredCount} Answers` : 'Select 1 Answer'}
          </span>
          <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          {optionPlacements[currentQuestion.id]?.map((originalIdx) => {
            const isSelected = currentSelections.includes(originalIdx);
            const isActuallyCorrect = targetAnswers.includes(originalIdx);
            const textValue = currentQuestion.options[originalIdx];

            let buttonStyle = 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 text-slate-300';
            
            // Render smooth circles for radio types, squares for multi-select checkboxes
            let icon = isMultiSelect 
              ? <Square className="w-5 h-5 text-slate-600 shrink-0" />
              : <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0" />;

            if (isRevealed) {
              if (isActuallyCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-100 shadow-md';
                icon = isMultiSelect
                  ? <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  : <div className="w-5 h-5 rounded-full border border-emerald-500 bg-emerald-500/20 flex items-center justify-center shrink-0"><div className="w-2 h-2 bg-emerald-400 rounded-full" /></div>;
              } else if (isSelected) {
                buttonStyle = 'border-red-500 bg-red-950/30 text-red-100 shadow-md';
                icon = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
              } else {
                buttonStyle = 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-40 cursor-not-allowed';
              }
            } else if (isSelected) {
              buttonStyle = 'border-blue-500 bg-blue-950/30 text-blue-100 shadow-md transform scale-[1.01]';
              icon = isMultiSelect
                ? <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                : <div className="w-5 h-5 rounded-full border border-blue-500 bg-blue-500 flex items-center justify-center shrink-0"><div className="w-2.5 h-2.5 bg-white rounded-full" /></div>;
            }

            return (
              <button
                key={originalIdx}
                onClick={() => handleToggleOption(originalIdx)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 ${buttonStyle}`}
              >
                <div className="mt-0.5">{icon}</div>
                <span className="text-sm leading-snug">{textValue}</span>
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className={`mt-8 p-5 rounded-xl border transition-all duration-500 animate-fadeIn ${
            isCorrect ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-red-950/20 border-red-900/40'
          }`}>
            <h3 className={`text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isCorrect ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isCorrect ? 'Correct' : 'Incorrect'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between mt-auto">
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            currentIndex === 0 ? 'text-slate-700 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {!isRevealed ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={!hasMetQuota}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed border border-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/20"
          >
            Confirm Answer
          </button>
        ) : isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
          >
            Finish Exam <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
          >
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveExam;