import {
  useThemePreference as useThemePreferenceContext,
  type ThemePreferenceContextValue,
} from '../contexts/ThemePreferenceContext';

/**
 * Returns the shared mobile theme preference actions and current mode.
 */
export function useThemePreference(): ThemePreferenceContextValue {
  return useThemePreferenceContext();
}

export default useThemePreference;
