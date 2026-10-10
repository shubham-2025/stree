import type { User } from "@supabase/supabase-js";

import { createRequestClient, getRequestAccessToken } from "@/lib/supabase/request";

type AddressLike = {
  name?: unknown;
  phone?: unknown;
  line1?: unknown;
  line2?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
};

export class MobileAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "MobileAuthError";
  }
}

export interface MobileRequestContext {
  accessToken: string;
  client: ReturnType<typeof createRequestClient>;
  user: User;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function coalesceString(...values: unknown[]): string {
  for (const value of values) {
    const normalized = asTrimmedString(value);
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

function normalizeAddress(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const address = value as AddressLike;
  const normalized = {
    name: asTrimmedString(address.name),
    phone: asTrimmedString(address.phone),
    line1: asTrimmedString(address.line1),
    line2: asTrimmedString(address.line2) || undefined,
    city: asTrimmedString(address.city),
    state: asTrimmedString(address.state),
    pincode: asTrimmedString(address.pincode),
  };

  if (
    !normalized.name &&
    !normalized.phone &&
    !normalized.line1 &&
    !normalized.line2 &&
    !normalized.city &&
    !normalized.state &&
    !normalized.pincode
  ) {
    return null;
  }

  return normalized;
}

function fallbackNameFromEmail(email?: string | null) {
  const localPart = email?.split("@")[0]?.trim();
  if (!localPart) {
    return "Stree Customer";
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function buildMobileApiUser(user: User) {
  const metadata = isRecord(user.user_metadata) ? user.user_metadata : {};
  const name = coalesceString(
    metadata.name,
    metadata.full_name,
    user.email ? fallbackNameFromEmail(user.email) : ""
  );
  const phone = coalesceString(metadata.phone);
  const defaultAddress = normalizeAddress(metadata.default_address);

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    full_name: name,
    phone,
    defaultAddress: defaultAddress ?? undefined,
    default_address: defaultAddress ?? undefined,
  };
}

export function mergeMobileUserMetadata(
  user: User,
  updates: {
    name?: string;
    phone?: string;
    defaultAddress?: unknown;
  }
) {
  const currentMetadata = isRecord(user.user_metadata)
    ? { ...user.user_metadata }
    : {};

  if (typeof updates.name === "string") {
    currentMetadata.name = updates.name;
    currentMetadata.full_name = updates.name;
  }

  if (typeof updates.phone === "string") {
    currentMetadata.phone = updates.phone;
  }

  if ("defaultAddress" in updates) {
    currentMetadata.default_address = normalizeAddress(updates.defaultAddress);
  }

  return currentMetadata;
}

export async function requireMobileRequestContext(
  request: Request
): Promise<MobileRequestContext> {
  const accessToken = getRequestAccessToken(request);
  if (!accessToken) {
    throw new MobileAuthError("Authentication required.", 401);
  }

  const client = createRequestClient(accessToken);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new MobileAuthError(
      "Your session is invalid or has expired. Please sign in again.",
      401
    );
  }

  return { accessToken, client, user };
}

export async function getOptionalMobileRequestContext(request: Request) {
  const accessToken = getRequestAccessToken(request);
  if (!accessToken) {
    return {
      accessToken: null,
      client: createRequestClient(),
      user: null,
    };
  }

  const client = createRequestClient(accessToken);
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  // Treat invalid/demo tokens as anonymous so COD checkout still works.
  if (error || !user) {
    return {
      accessToken: null,
      client: createRequestClient(),
      user: null,
    };
  }

  return {
    accessToken,
    client,
    user,
  };
}
