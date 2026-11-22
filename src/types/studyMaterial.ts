import { Timestamp } from 'firebase/firestore';

export type ClassLevel = 'Class 9' | 'Class 10';
export type BoardType = 'BSEB' | 'CBSE';
export type SubjectType = 'Mathematics' | 'Science' | 'Social Science' | 'Hindi' | 'Sanskrit';
export type MaterialType =
  | 'Notes'
  | 'Revision'
  | 'Previous Year Question (PYQ)'
  | 'Sample Paper'
  | 'Model Paper';
export type MaterialStatus = 'draft' | 'published';

export const CLASS_OPTIONS: ClassLevel[] = ['Class 9', 'Class 10'];
export const BOARD_OPTIONS: BoardType[] = ['BSEB', 'CBSE'];
export const SUBJECT_OPTIONS: SubjectType[] = [
  'Mathematics',
  'Science',
  'Social Science',
  'Hindi',
  'Sanskrit',
];
export const MATERIAL_TYPE_OPTIONS: MaterialType[] = [
  'Notes',
  'Revision',
  'Previous Year Question (PYQ)',
  'Sample Paper',
  'Model Paper',
];

export interface StudyMaterial {
  materialId: string;
  title: string;
  class: ClassLevel;
  board: BoardType;
  subject: SubjectType;
  chapter: string;
  examYear?: string;
  materialType: MaterialType | string;
  description: string;
  storagePath: string;
  downloadUrl: string;
  status: MaterialStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  createdBy: string;
}

/**
 * Maps legacy materialType values to the 5 primary categories for seamless filtering.
 */
export function normalizeMaterialType(type: string): MaterialType {
  if (type === 'Revision' || type === 'Revision Notes') return 'Revision';
  if (type === 'Model Paper') return 'Model Paper';
  if (type === 'Sample Paper' || type === 'Sample Papers') return 'Sample Paper';
  if (type === 'Previous Year Question (PYQ)' || type === 'PYQ') {
    return 'Previous Year Question (PYQ)';
  }
  return 'Notes';
}
