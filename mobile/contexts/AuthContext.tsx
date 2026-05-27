import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import axios, { type AxiosRequestConfig } from 'axios';

import {
  getStorageItem,
  removeStorageItems,
  setStorageItem,
  STORAGE_KEYS,
} from '../lib/storage';
import {
  api,
  fetchCurrentUser as fetchCurrentAppUser,
  getSupabasePublicConfig,
  normalizeUser,
  setApiAuthToken,
  updateCurrentUserProfile,
} from '../lib/api';
import type { ApiUser, AuthState, User } from '../lib/types';

interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
}

interface SupabaseAuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: ApiUser | null;
}

interface RegisterApiEnvelope {
  success?: boolean;
  data?: SupabaseAuthResponse;
  error?: string;
  message?: string;
}

export interface AuthContextValue extends AuthState {
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkToken: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const DEMO_EMAIL = 'demo@stree.app';
export const DEMO_PASSWORD = 'Stree123!';
const DEMO_TOKEN = 'demo-session-token';
const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Stree Demo',
  email: DEMO_EMAIL,
  phone: '9876543210',
  defaultAddress: {
    name: 'Stree Demo',
    phone: '9876543210',
    line1: '12 Demo Lane',
    line2: 'Near City Market',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
};

function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  return {
    url: config.url,
    anonKey: config.anonKey,
  };
}

function createSupabaseHeaders(
  config: SupabaseAuthConfig,
  token?: string
): AxiosRequestConfig['headers'] {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${token ?? config.anonKey}`,
    'Content-Type': 'application/json',
  };
}

function createAuthError(message: string): Error {
  return new Error(message);
}

function isDemoSessionToken(token?: string | null): boolean {
  return typeof token === 'string' && token === DEMO_TOKEN;
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      typeof error.response?.data === 'object' &&
      error.response?.data !== null &&
      'msg' in error.response.data &&
      typeof error.response.data.msg === 'string'
        ? error.response.data.msg
        : typeof error.response?.data === 'object' &&
            error.response?.data !== null &&
            'message' in error.response.data &&
            typeof error.response.data.message === 'string'
          ? error.response.data.message
          : undefined;

    if (responseMessage?.trim()) {
      return responseMessage.trim();
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

function sanitizeStoredUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const user = value as User;

  if (
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.phone !== 'string'
  ) {
    return null;
  }

  return user;
}

async function requestPasswordLogin(
  config: SupabaseAuthConfig,
  email: string,
  password: string
): Promise<SupabaseAuthResponse> {
  const response = await axios.post<SupabaseAuthResponse>(
    `${config.url}/auth/v1/token?grant_type=password`,
    {
      email,
      password,
    },
    {
      headers: createSupabaseHeaders(config),
    }
  );

  return response.data;
}

async function requestPasswordSignup(
  config: SupabaseAuthConfig,
  name: string,
  email: string,
  password: string
): Promise<SupabaseAuthResponse> {
  const response = await axios.post<SupabaseAuthResponse>(
    `${config.url}/auth/v1/signup`,
    {
      email,
      password,
      data: {
        name,
        full_name: name,
      },
    },
    {
      headers: createSupabaseHeaders(config),
    }
  );

  return response.data;
}

async function requestInstantSignup(
  name: string,
  email: string,
  password: string
): Promise<SupabaseAuthResponse> {
  const response = await api.post<RegisterApiEnvelope | SupabaseAuthResponse>(
    '/mobile-auth/register',
    {
      name,
      email,
      password,
    }
  );

  const payload = response.data as RegisterApiEnvelope & SupabaseAuthResponse;
  return payload.data ?? payload;
}

async function requestCurrentUser(
  config: SupabaseAuthConfig,
  token: string
): Promise<ApiUser> {
  const response = await axios.get<ApiUser>(`${config.url}/auth/v1/user`, {
    headers: createSupabaseHeaders(config, token),
  });

  return response.data;
}

async function requestSessionRefresh(
  config: SupabaseAuthConfig,
  refreshToken: string
): Promise<SupabaseAuthResponse> {
  const response = await axios.post<SupabaseAuthResponse>(
    `${config.url}/auth/v1/token?grant_type=refresh_token`,
    {
      refresh_token: refreshToken,
    },
    {
      headers: createSupabaseHeaders(config),
    }
  );

  return response.data;
}

async function requestLogout(
  config: SupabaseAuthConfig,
  token: string
): Promise<void> {
  await axios.post(
    `${config.url}/auth/v1/logout`,
    {},
    {
      headers: createSupabaseHeaders(config, token),
    }
  );
}

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides persisted authentication state and Supabase-backed auth actions.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    token: null,
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const persistLocalSession = useCallback(
    async (token: string, user: User, nextRefreshToken: string | null = null): Promise<void> => {
      await Promise.all([
        setStorageItem(STORAGE_KEYS.authToken, token),
        setStorageItem(STORAGE_KEYS.authRefreshToken, nextRefreshToken),
        setStorageItem(STORAGE_KEYS.authUser, user),
      ]);

      setApiAuthToken(isDemoSessionToken(token) ? null : token);
      setRefreshToken(nextRefreshToken);
      setAuthState({
        isLoggedIn: true,
        token,
        user,
      });
      setError(null);
    },
    []
  );

  const persistSession = useCallback(
    async (session: SupabaseAuthResponse): Promise<void> => {
      const token = typeof session.access_token === 'string' ? session.access_token : null;
      const nextRefreshToken =
        typeof session.refresh_token === 'string' ? session.refresh_token : null;
      const fallbackUser = normalizeUser(session.user ?? null);

      if (!token) {
        throw createAuthError('Authentication response was incomplete. Please try again.');
      }

      setApiAuthToken(token);
      const user =
        (await fetchCurrentAppUser(token).catch(() => fallbackUser)) ?? fallbackUser;

      if (!user) {
        throw createAuthError('Authentication response was incomplete. Please try again.');
      }

      await persistLocalSession(token, user, nextRefreshToken);
    },
    [persistLocalSession]
  );

  const clearSession = useCallback(async (): Promise<void> => {
    await removeStorageItems([
      STORAGE_KEYS.authToken,
      STORAGE_KEYS.authRefreshToken,
      STORAGE_KEYS.authUser,
    ]).catch(() => undefined);
    setApiAuthToken(null);
    setRefreshToken(null);
    setAuthState({
      isLoggedIn: false,
      token: null,
      user: null,
    });
    setError(null);
  }, []);

  const checkToken = useCallback(async (): Promise<boolean> => {
    const config = getSupabaseAuthConfig();
    const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
      getStorageItem<string>(STORAGE_KEYS.authToken),
      getStorageItem<string>(STORAGE_KEYS.authRefreshToken),
      getStorageItem<User>(STORAGE_KEYS.authUser),
    ]);
    const activeToken = storedToken;
    const activeRefreshToken = storedRefreshToken;
    const safeUser = sanitizeStoredUser(storedUser);

    if (!activeToken) {
      await clearSession();
      return false;
    }

    if (isDemoSessionToken(activeToken)) {
      setApiAuthToken(null);
      setAuthState({
        isLoggedIn: true,
        token: activeToken,
        user: safeUser ?? DEMO_USER,
      });
      setRefreshToken(null);
      setError(null);
      return true;
    }

    setApiAuthToken(activeToken);

    try {
      const user =
        (await fetchCurrentAppUser(activeToken).catch(async () => {
          if (!config) {
            return safeUser;
          }

          const apiUser = await requestCurrentUser(config, activeToken);
          return normalizeUser(apiUser);
        })) ?? safeUser;

      if (!user) {
        throw createAuthError('Unable to load your account details.');
      }

      await setStorageItem(STORAGE_KEYS.authUser, user);
      setApiAuthToken(activeToken);
      setAuthState({
        isLoggedIn: true,
        token: activeToken,
        user,
      });
      setRefreshToken(activeRefreshToken ?? null);
      setError(null);
      return true;
    } catch (tokenError) {
      if (!activeRefreshToken) {
        await clearSession();
        setError(getAuthErrorMessage(tokenError, 'Your session has expired. Please sign in again.'));
        return false;
      }

      if (!config) {
        await clearSession();
        setError('Your session has expired. Please sign in again.');
        return false;
      }

      try {
        const refreshedSession = await requestSessionRefresh(config, activeRefreshToken);
        await persistSession(refreshedSession);
        return true;
      } catch (refreshError) {
        await clearSession();
        setError(
          getAuthErrorMessage(refreshError, 'Your session has expired. Please sign in again.')
        );
        return false;
      }
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async (): Promise<void> => {
      try {
        const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
          getStorageItem<string>(STORAGE_KEYS.authToken),
          getStorageItem<string>(STORAGE_KEYS.authRefreshToken),
          getStorageItem<User>(STORAGE_KEYS.authUser),
        ]);

        if (!isMounted) {
          return;
        }

        const safeUser = sanitizeStoredUser(storedUser);

        if (storedToken) {
          setApiAuthToken(isDemoSessionToken(storedToken) ? null : storedToken);
          setRefreshToken(storedRefreshToken);
          setAuthState({
            isLoggedIn: true,
            token: storedToken,
            user: isDemoSessionToken(storedToken) ? safeUser ?? DEMO_USER : safeUser,
          });
        }

        if (storedToken) {
          await checkToken();
        }
      } catch {
        if (isMounted) {
          await clearSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [checkToken, clearSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const config = getSupabaseAuthConfig();

      if (
        normalizedEmail === DEMO_EMAIL &&
        normalizedPassword === DEMO_PASSWORD
      ) {
        setLoading(true);
        setError(null);

        try {
          await persistLocalSession(DEMO_TOKEN, DEMO_USER);
          return;
        } finally {
          setLoading(false);
        }
      }

      if (!config) {
        const message =
          'Supabase auth is not configured for the mobile app. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.';
        setError(message);
        throw createAuthError(message);
      }

      if (!normalizedEmail || !normalizedPassword) {
        const message = 'Email and password are required.';
        setError(message);
        throw createAuthError(message);
      }

      setLoading(true);
      setError(null);

      try {
        const session = await requestPasswordLogin(
          config,
          normalizedEmail,
          normalizedPassword
        );
        await persistSession(session);
      } catch (loginError) {
        const message = getAuthErrorMessage(loginError, 'Unable to sign you in right now.');
        setError(message);
        throw createAuthError(message);
      } finally {
        setLoading(false);
      }
    },
    [persistLocalSession, persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const config = getSupabaseAuthConfig();
      let serverRegistrationMessage: string | null = null;

      if (!config) {
        const message =
          'Supabase auth is not configured for the mobile app. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.';
        setError(message);
        throw createAuthError(message);
      }

      if (!normalizedName || !normalizedEmail || !normalizedPassword) {
        const message = 'Name, email, and password are required.';
        setError(message);
        throw createAuthError(message);
      }

      if (normalizedPassword.length < 6) {
        const message = 'Password must be at least 6 characters long.';
        setError(message);
        throw createAuthError(message);
      }

      setLoading(true);
      setError(null);

      try {
        try {
          const session = await requestInstantSignup(
            normalizedName,
            normalizedEmail,
            normalizedPassword
          );

          if (session.access_token && session.user) {
            await persistSession(session);
            return;
          }
        } catch (instantSignupError) {
          serverRegistrationMessage = getAuthErrorMessage(
            instantSignupError,
            'Instant account creation is unavailable right now.'
          );
        }

        const session = await requestPasswordSignup(config, normalizedName, normalizedEmail, normalizedPassword);

        if (!session.access_token || !session.user) {
          const message =
            session.user
              ? 'Registration succeeded, but your account requires email verification before signing in.'
              : serverRegistrationMessage ??
                'Registration succeeded, but your account requires email verification before signing in.';
          setError(message);
          throw createAuthError(message);
        }

        await persistSession(session);
      } catch (registerError) {
        const message = getAuthErrorMessage(
          registerError,
          'Unable to create your account right now.'
        );
        setError(message);
        throw createAuthError(message);
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(async (): Promise<void> => {
    const config = getSupabaseAuthConfig();
    const activeToken = authState.token;

    setLoading(true);

    try {
      if (config && activeToken && !isDemoSessionToken(activeToken)) {
        await requestLogout(config, activeToken);
      }
    } catch {
    } finally {
      await clearSession();
      setLoading(false);
    }
  }, [authState.token, clearSession]);

  const updateUser = useCallback(
    async (updates: Partial<User>): Promise<void> => {
      const activeToken = authState.token;

      if (!authState.user) {
        return;
      }

      if (!activeToken || isDemoSessionToken(activeToken)) {
        setAuthState((currentState) => {
          if (!currentState.user) {
            return currentState;
          }

          const nextUser: User = {
            ...currentState.user,
            ...updates,
            defaultAddress: updates.defaultAddress ?? currentState.user.defaultAddress,
          };

          void setStorageItem(STORAGE_KEYS.authUser, nextUser).catch(() => undefined);

          return {
            ...currentState,
            user: nextUser,
          };
        });
        return;
      }

      const nextUser = await updateCurrentUserProfile(updates, activeToken);

      if (!nextUser) {
        throw createAuthError('Unable to save your profile right now.');
      }

      await setStorageItem(STORAGE_KEYS.authUser, nextUser).catch(() => undefined);
      setError(null);
      setAuthState((currentState) => {
        if (!currentState.user) {
          return currentState;
        }

        return {
          ...currentState,
          user: nextUser,
        };
      });
    },
    [authState.token, authState.user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: authState.isLoggedIn,
      user: authState.user,
      token: authState.token,
      loading,
      initialized,
      error,
      login,
      register,
      logout,
      checkToken,
      updateUser,
    }),
    [
      authState.isLoggedIn,
      authState.token,
      authState.user,
      checkToken,
      error,
      initialized,
      loading,
      login,
      logout,
      register,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the active authentication context.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export default AuthProvider;
