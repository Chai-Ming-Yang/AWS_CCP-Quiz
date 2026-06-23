import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Skull } from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore';
import { flattenQuestions, generateExam, filterByCategories } from '../../core/services/quizService';
import { evaluateQuiz } from '../../core/services/scoringService';
import rawData from '../../data/aws_questions.json';
import type { Question, PracticeSet } from '../../core/types';

const ActiveExam: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordAttempt } = useQuizStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Set<string>>(new Set());
  const [isSurvivalDead, setIsSurvivalDead] = useState(false);
  
  // Updated config payload: category is now a string array
  const config = location.state as { type: 'exam' | 'category'; size?: number; category?: string[]; isSurvival?: boolean } | null;

  useEffect(() => {
    if (!config) return;

    const allQuestions = flattenQuestions(rawData as PracticeSet[]);
    let selectedQuestions: Question[] = [];

    if (config.type === 'exam' && config.size) {
      selectedQuestions = generateExam(allQuestions, config.size);
    } else if (config.type === 'category' && config.category && config.category.length > 0) {
      selectedQuestions = filterByCategories(allQuestions, config.category);
    }

    setQuestions(selectedQuestions);
    setHasLoaded(true);
  }, [config]);

  if (!config) return <Navigate to="/" replace />;
  if (!hasLoaded) return <div className="p-8 text-center text-slate-500">Loading exam engine...</div>;
  
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-4">
        <p>No questions found for this selection.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  
  const hasSelectedAnswer = userAnswers[currentQuestion.id] !== undefined;
  const isRevealed = revealedQuestions.has(currentQuestion.id);
  const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.correctAnswer;

  const handleSelectOption = (optionIndex: number) => {
    if (isRevealed) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleConfirmAnswer = () => {
    if (!hasSelectedAnswer || isRevealed) return;
    setRevealedQuestions(prev => new Set(prev).add(currentQuestion.id));

    if (config.isSurvival && userAnswers[currentQuestion.id] !== currentQuestion.correctAnswer) {
      setIsSurvivalDead(true);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !config.isSurvival) setCurrentIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    const activeQuestions = config.isSurvival ? questions.slice(0, currentIndex + 1) : questions;
    const result = evaluateQuiz(activeQuestions, userAnswers);
    
    // Pass the first category or "Mixed" as context for the history log
    const categoryContext = config.category ? (config.category.length > 1 ? 'Mixed Domains' : config.category[0]) : undefined;
    recordAttempt(result, config.type, categoryContext);
    
    navigate('/results', { state: { result, questions: activeQuestions, userAnswers }, replace: true });
  };

  // Determine the header label dynamically
  const headerLabel = config.isSurvival 
    ? 'Survival Mode' 
    : config.type === 'exam' 
      ? 'Practice Exam' 
      : config.category && config.category.length === 1 
        ? `${config.category[0]} Focus` 
        : 'Targeted Domain Focus';

  return (
    <div className="max-w-3xl mx-auto flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden min-h-[60vh]">
      {/* Header & Progress */}
      <div className="bg-slate-950/50 border-b border-slate-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${config.isSurvival ? 'text-orange-500' : 'text-slate-400'}`}>
            {headerLabel}
          </span>
          <span className={`text-sm font-semibold ${config.isSurvival ? 'text-orange-400' : 'text-slate-300'}`}>
            {config.isSurvival ? `Streak: ${currentIndex}` : `${currentIndex + 1} / ${questions.length}`}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${config.isSurvival ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Body */}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <span className="inline-block px-2.5 py-1 bg-indigo-950/50 border border-indigo-900/50 text-indigo-400 text-[10px] font-bold rounded mb-4">
            {currentQuestion.category}
          </span>
          <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = userAnswers[currentQuestion.id] === idx;
            const isActuallyCorrect = currentQuestion.correctAnswer === idx;

            let buttonStyle = 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 text-slate-300';
            let icon = null;

            if (isRevealed) {
              if (isActuallyCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-100 shadow-md';
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
              } else if (isSelected) {
                buttonStyle = 'border-red-500 bg-red-950/30 text-red-100 shadow-md';
                icon = <XCircle className="w-4 h-4 text-red-400" />;
              } else {
                buttonStyle = 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-40 cursor-not-allowed';
              }
            } else if (isSelected) {
              buttonStyle = 'border-blue-500 bg-blue-950/30 text-blue-100 shadow-md transform scale-[1.01]';
              icon = <div className="w-2.5 h-2.5 bg-white rounded-full"></div>;
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 ${buttonStyle}`}
              >
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  (isRevealed && isActuallyCorrect) ? 'border-emerald-500 bg-emerald-500/20' :
                  (isRevealed && isSelected && !isActuallyCorrect) ? 'border-red-500 bg-red-500/20' :
                  (!isRevealed && isSelected) ? 'border-blue-500 bg-blue-500' :
                  'border-slate-500 bg-slate-900'
                }`}>
                  {icon}
                </div>
                <span className="text-sm leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Block */}
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

      {/* Navigation Footer */}
      <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between mt-auto">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || config.isSurvival}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            (currentIndex === 0 || config.isSurvival) ? 'text-slate-700 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {!isRevealed ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={!hasSelectedAnswer}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed border border-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-900/20"
          >
            Confirm Answer
          </button>
        ) : isSurvivalDead ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-900/20 transition-all animate-pulse"
          >
            Game Over <Skull className="w-4 h-4" />
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
            onClick={handleNext}
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