// app/dashboard/canvas/_components/editor/utils.ts

import { Page } from './types';

export const createNewPage = (size: 'A4' | 'Short' | 'Long' = 'A4'): Page => ({
  id: Math.random().toString(36).substr(2, 9),
  size,
  elements: [],
});

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};