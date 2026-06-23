import type { Question, PracticeSet } from '../types';

export const shuffleQuestions = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const flattenQuestions = (data: PracticeSet[]): Question[] => {
  return data.flatMap(set => set.questions);
};

export const generateExam = (allQuestions: Question[], size: number): Question[] => {
  return shuffleQuestions(allQuestions).slice(0, size);
};

/**
 * Filter questions by an array of selected categories.
 */
export const filterByCategories = (allQuestions: Question[], categories: string[]): Question[] => {
  return shuffleQuestions(allQuestions.filter(q => categories.includes(q.category)));
};

/**
 * Pure function to extract categories and their exact question counts.
 */
export const getCategoryStats = (allQuestions: Question[]): Record<string, number> => {
  return allQuestions.reduce((acc, q) => {
    if (q.category) {
      acc[q.category] = (acc[q.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};