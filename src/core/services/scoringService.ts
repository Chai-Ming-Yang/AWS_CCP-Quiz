import type { Question, QuizResult } from '../types';

/**
 * Evaluates user selections against both single-choice and multi-choice configurations.
 */
export const evaluateQuiz = (
  questions: Question[], 
  userAnswers: Record<string, number[]>
): QuizResult => {
  let score = 0;
  const wrongQuestions: string[] = [];

  questions.forEach(q => {
    const selectedIndices = userAnswers[q.id] || [];
    
    // Normalize target correct options into a single array format
    const correctIndices = q.correctAnswers !== undefined 
      ? q.correctAnswers 
      : (q.correctAnswer !== undefined ? [q.correctAnswer] : []);

    const sortedSelections = [...selectedIndices].sort((a, b) => a - b);
    const sortedExpected = [...correctIndices].sort((a, b) => a - b);

    const isCorrect = 
      sortedSelections.length === sortedExpected.length &&
      sortedSelections.every((val, index) => val === sortedExpected[index]);

    if (isCorrect) {
      score += 1;
    } else {
      wrongQuestions.push(q.id);
    }
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    wrongQuestions
  };
};