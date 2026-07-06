import type { Question, QuestionGroup } from '../types';

export const shuffleQuestions = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const flattenGroups = (groups: QuestionGroup[]): Question[] => {
  const allQuestions = groups.flatMap(g => g.questions);
  const uniqueMap = new Map<string, Question>();
  
  for (const q of allQuestions) {
    if (!uniqueMap.has(q.id)) {
      uniqueMap.set(q.id, q);
    }
  }
  
  return Array.from(uniqueMap.values());
};

export const filterBySections = (groups: QuestionGroup[], sections: string[]): Question[] => {
  const filteredGroups = groups.filter(g => sections.includes(g.section));
  return shuffleQuestions(flattenGroups(filteredGroups));
};