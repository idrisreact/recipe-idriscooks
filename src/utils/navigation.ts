/**
 * Handles window navigation.
 * This function is extracted to allow easier mocking in tests where window.location
 * cannot be easily modified or tracked (like in JSDOM).
 */
export const navigateTo = (url: string) => {
  window.location.href = url;
};
