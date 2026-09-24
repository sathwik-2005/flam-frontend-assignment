import { StudySet } from '../types/result';

const STORAGE_KEY = 'flam_study_sessions_v1';

export function saveStudySet(set: StudySet): StudySet[] {
  try {
    const existing = getSavedStudySets();
    const filtered = existing.filter((s) => s.id !== set.id);
    const updated = [set, ...filtered].slice(0, 20); // Keep max 20 sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save study set to LocalStorage:', err);
    return [];
  }
}

export function getSavedStudySets(): StudySet[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function deleteStudySet(id: string): StudySet[] {
  try {
    const existing = getSavedStudySets();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
