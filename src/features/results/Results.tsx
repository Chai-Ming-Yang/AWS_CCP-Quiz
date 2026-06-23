import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { QuizResult, Question } from '../../core/types';

interface ResultsState {
  result: QuizResult;
  questions: Question[];
  userAnswers: Record<string, number>;
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  if (!state) return <Navigate to="/" replace />;

  const { result, questions, userAnswers } = state;
  const isPassing = result.percentage >= 70;

  const wrongQuestionDetails = questions.filter(q => result.wrongQuestions.includes(q.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Score Banner */}
      <div className={`p-8 rounded-xl shadow-lg text-center border ${
        isPassing ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-red-950/30 border-red-900/50'
      }`}>
        <div className="flex justify-center mb-4">
          {isPassing ? (
            <CheckCircle className="w-16 h-16 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
          )}
        </div>
        <h1 className={`text-3xl font-black mb-2 ${isPassing ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPassing ? 'Assessment Passed' : 'Assessment Failed'}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm font-medium mt-6">
          <div className="bg-slate-900 px-5 py-2.5 rounded-lg border border-slate-800 shadow-sm">
            Score: <span className="text-lg font-bold text-slate-100 ml-2">{result.score} / {result.total}</span>
          </div>
          <div className="bg-slate-900 px-5 py-2.5 rounded-lg border border-slate-800 shadow-sm">
            Percentage: <span className="text-lg font-bold text-slate-100 ml-2">{result.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>

      {/* Detailed Review Section */}
      {wrongQuestionDetails.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> Incorrect Answers Review
          </h2>
          <div className="space-y-4">
            {wrongQuestionDetails.map((q, index) => {
              const userAnswerIndex = userAnswers[q.id];
              const userAnswerText = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "No answer provided";
              const correctAnswerText = q.options[q.correctAnswer];

              return (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-sm shrink-0 border border-slate-700">
                      {index + 1}
                    </span>
                    <div className="space-y-4 w-full">
                      <h3 className="text-base font-semibold text-slate-100">{q.text}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
                          <span className="block text-[10px] font-bold text-red-500 uppercase mb-1">Your Answer</span>
                          <span className="text-red-200">{userAnswerText}</span>
                        </div>
                        <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg">
                          <span className="block text-[10px] font-bold text-emerald-500 uppercase mb-1">Correct Answer</span>
                          <span className="text-emerald-200">{correctAnswerText}</span>
                        </div>
                      </div>

                      <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-lg mt-4">
                        <span className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Explanation</span>
                        <p className="text-sm text-blue-100/90 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;