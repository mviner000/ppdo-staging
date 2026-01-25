const FORM_STORAGE_KEY = "breakdown_form_draft";

/**
 * Load saved draft from localStorage
 * @returns Saved draft object or null
 */
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

/**
 * Save draft to localStorage
 * @param values - Form values to save
 */
export const saveDraft = (values: any) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    console.error("Error saving form draft:", error);
  }
};

/**
 * Clear draft from localStorage
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing form draft:", error);
  }
};