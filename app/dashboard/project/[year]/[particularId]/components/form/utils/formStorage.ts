// app/dashboard/project/[year]/[particularId]/components/form/utils/formStorage.ts

const FORM_STORAGE_KEY = "project_form_draft";

export const getSavedDraft = () => {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading form draft:", error);
  }
  return null;
};

export const saveDraft = (values: any) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    console.error("Error saving form draft:", error);
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing form draft:", error);
  }
};