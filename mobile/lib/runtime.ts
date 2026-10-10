function trimEnvValue(value?: string): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readBooleanEnv(value?: string): boolean {
  const normalized = trimEnvValue(value).toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

export const DEMO_EMAIL = trimEnvValue(process.env.EXPO_PUBLIC_DEMO_EMAIL);
export const DEMO_PASSWORD = trimEnvValue(process.env.EXPO_PUBLIC_DEMO_PASSWORD);
export const isDemoLoginEnabled =
  readBooleanEnv(process.env.EXPO_PUBLIC_ENABLE_DEMO_LOGIN) &&
  DEMO_EMAIL.length > 0 &&
  DEMO_PASSWORD.length > 0;
