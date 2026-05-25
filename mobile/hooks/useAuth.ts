import {
  useAuth as useAuthContext,
  type AuthContextValue,
} from '../contexts/AuthContext';

/**
 * Returns the shared authentication state and actions for the mobile app.
 */
export function useAuth(): AuthContextValue {
  return useAuthContext();
}

export default useAuth;
