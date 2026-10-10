import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { CATEGORIES } from '../constants/Categories';

import type {
  Address,
  ApiOrder,
  ApiProduct,
  ApiResponse,
  ApiUser,
  CartItem,
  HomeCategoryCard,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductFilters,
  User,
} from './types';

function resolveBaseApiUrl(): string {
  const configuredUrl =
    trimEnvValue(process.env.EXPO_PUBLIC_API_URL) ||
    trimEnvValue(process.env.NEXT_PUBLIC_API_URL);

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  return 'https://stree-sarees-com.vercel.app/api';
}

export const BASE_API_URL = resolveBaseApiUrl();
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_PRODUCT_DESCRIPTION = 'No description available.';
export const PLACEHOLDER_PRODUCT_IMAGE =
  'https://stree-sarees-com.vercel.app/placeholder.svg';
const DEMO_SESSION_TOKEN = 'demo-session-token';

function resolveWebsiteOrigin(): string {
  try {
    const apiUrl = new URL(BASE_API_URL);
    if (isLocalHostname(apiUrl.hostname) || isPrivateIpv4Hostname(apiUrl.hostname)) {
      return 'https://stree-sarees-com.vercel.app';
    }

    return apiUrl.origin;
  } catch {
    return 'https://stree-sarees-com.vercel.app';
  }
}

/**
 * Turns site-relative media paths into absolute URLs the mobile image loader can fetch.
 */
export function resolveMediaUrl(value?: string | null): string {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    return '';
  }

  if (/^(https?:|data:|file:|content:|blob:)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  if (normalized.startsWith('/')) {
    return `${resolveWebsiteOrigin()}${normalized}`;
  }

  return normalized;
}

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

export interface MobileOrderSubmissionPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  items: OrderItem[];
  total_amount: number;
  status: 'NEW';
}

export interface MobileOrderSubmissionOptions {
  accessToken?: string | null;
  userId?: string | null;
}

interface ProductLike {
  id?: string | null;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  price?: number | null;
  mrp?: number | null;
  image?: string | null;
  images?: string[] | null;
  category?: string | null;
  fabric?: string | null;
  occasion?: string | null;
  description?: string | null;
  rating?: number | null;
  reviews?: number | null;
  inStock?: boolean | null;
  stockQty?: number | null;
  stock_qty?: number | null;
  is_active?: boolean | null;
  colors?: string[] | null;
  careInstructions?: string[] | null;
  care_instructions?: string[] | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

interface CategoryNameLike {
  name?: string | null;
}

interface PostgrestErrorLike {
  code?: string | null;
  message?: string | null;
}

interface UserLike {
  id?: string | null;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  defaultAddress?: Partial<Address> | null;
  default_address?: Partial<Address> | null;
  user_metadata?: {
    name?: string | null;
    full_name?: string | null;
    phone?: string | null;
    default_address?: Partial<Address> | null;
  } | null;
}

interface OrderLike {
  id?: string | null;
  date?: string | null;
  created_at?: string | null;
  status?: string | null;
  items?: OrderItemLike[] | CartItem[] | null;
  total?: number | null;
  total_amount?: number | null;
  address?: Partial<Address> | null;
  customer_name?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

interface OrderItemLike {
  id?: string | null;
  productId?: string | null;
  title?: string | null;
  name?: string | null;
  price?: number | null;
  quantity?: number | null;
  qty?: number | null;
  image?: string | null;
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  NEW: 'confirmed',
  pending: 'pending',
  CONFIRMED: 'confirmed',
  confirmed: 'confirmed',
  SHIPPED: 'shipped',
  shipped: 'shipped',
  DELIVERED: 'delivered',
  delivered: 'delivered',
  CANCELLED: 'cancelled',
  cancelled: 'cancelled',
};

export class ApiClientError extends Error {
  public readonly statusCode?: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function trimEnvValue(value?: string): string {
  return typeof value === 'string' ? value.trim() : '';
}

export const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => Promise.reject(createApiClientError(error))
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiEnvelope<T>(value: unknown): value is ApiResponse<T> {
  return isRecord(value) && 'success' in value;
}

function resolveImages(product: ProductLike): string[] {
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image): image is string =>
          typeof image === 'string' && image.trim().length > 0
      )
    : [];

  const primaryImage =
    typeof product.image === 'string' && product.image.trim().length > 0
      ? [product.image.trim()]
      : [];

  return Array.from(new Set([...primaryImage, ...images]));
}

function resolveCareInstructions(product: ProductLike): string[] {
  const instructions = Array.isArray(product.careInstructions)
    ? product.careInstructions
    : Array.isArray(product.care_instructions)
      ? product.care_instructions
      : [];

  return instructions.filter(
    (instruction): instruction is string =>
      typeof instruction === 'string' && instruction.trim().length > 0
  );
}

function createApiClientError(error: AxiosError): ApiClientError {
  return new ApiClientError(
    getApiErrorMessage(error),
    error.response?.status,
    error.response?.data
  );
}

function createSupabaseRestHeaders(
  config: SupabasePublicConfig,
  prefer?: string
): AxiosRequestConfig['headers'] {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${config.anonKey}`,
    apikey: config.anonKey,
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function createSupabaseMutationHeaders(
  config: SupabasePublicConfig,
  accessToken?: string,
  prefer?: string
): AxiosRequestConfig['headers'] {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken || config.anonKey}`,
    apikey: config.anonKey,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function sanitizeSupabaseSearchTerm(value: string): string {
  return value.trim().replace(/[,*()]/g, ' ').replace(/\s+/g, ' ');
}

function parseContentRangeTotal(contentRange?: string): number | undefined {
  if (typeof contentRange !== 'string') {
    return undefined;
  }

  const totalToken = contentRange.split('/')[1];
  const total = Number(totalToken);
  return Number.isFinite(total) ? total : undefined;
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();

  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]'
  );
}

function isPrivateIpv4Hostname(hostname: string): boolean {
  const parts = hostname.trim().split('.');

  if (parts.length !== 4) {
    return false;
  }

  const octets = parts.map((part) => Number.parseInt(part, 10));

  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

/**
 * Returns the public Supabase configuration available to the mobile app.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url =
    trimEnvValue(process.env.EXPO_PUBLIC_SUPABASE_URL) ||
    trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    trimEnvValue(process.env.SUPABASE_URL);
  const anonKey =
    trimEnvValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
    trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trimEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ||
    trimEnvValue(process.env.SUPABASE_ANON_KEY) ||
    trimEnvValue(process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY);

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ''),
    anonKey,
  };
}

export function shouldPreferDirectSupabaseAccess(): boolean {
  if (!getSupabasePublicConfig()) {
    return false;
  }

  try {
    const hostname = new URL(BASE_API_URL).hostname;
    return isLocalHostname(hostname) || isPrivateIpv4Hostname(hostname);
  } catch {
    return false;
  }
}

export function shouldUseDirectSupabaseFallback(error: unknown): boolean {
  if (!getSupabasePublicConfig()) {
    return false;
  }

  if (shouldPreferDirectSupabaseAccess()) {
    return true;
  }

  if (error instanceof ApiClientError) {
    return (
      typeof error.statusCode !== 'number' ||
      ![400, 401, 403].includes(error.statusCode)
    );
  }

  if (axios.isAxiosError(error)) {
    return (
      typeof error.response?.status !== 'number' ||
      ![400, 401, 403].includes(error.response.status)
    );
  }

  return true;
}

export function shouldPreferSupabaseCatalogReads(): boolean {
  return shouldPreferDirectSupabaseAccess();
}

export function shouldUseSupabaseCatalogFallback(error: unknown): boolean {
  return shouldUseDirectSupabaseFallback(error);
}

/**
 * Sets or clears the bearer token header for subsequent API requests.
 */
export function setApiAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

/**
 * Builds product query params from the mobile filter model.
 */
export function buildProductQueryParams(
  filters: ProductFilters = {}
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.category && filters.category !== 'All') {
    params.category = filters.category;
  }

  if (typeof filters.minPrice === 'number') {
    params.minPrice = filters.minPrice;
  }

  if (typeof filters.maxPrice === 'number') {
    params.maxPrice = filters.maxPrice;
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim();
  }

  if (typeof filters.page === 'number' && filters.page > 0) {
    params.page = filters.page;
  }

  if (typeof filters.limit === 'number' && filters.limit > 0) {
    params.limit = filters.limit;
  }

  return params;
}

/**
 * Fetches products directly from Supabase public REST when the legacy API is unavailable.
 */
export async function fetchSupabaseProducts(
  filters: ProductFilters = {}
): Promise<{ items: Product[]; meta: { page: number; limit: number; total?: number; hasMore: boolean } }> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new ApiClientError(
      'Supabase public configuration is missing for the mobile catalogue.'
    );
  }

  const page = typeof filters.page === 'number' && filters.page > 0 ? filters.page : 1;
  const limit = typeof filters.limit === 'number' && filters.limit > 0 ? filters.limit : 12;
  const offset = (page - 1) * limit;
  const query = new URLSearchParams();

  query.append('select', '*');
  query.append('is_active', 'eq.true');
  query.append('stock_qty', 'gt.0');
  query.append('order', 'created_at.desc');
  query.append('offset', String(offset));
  query.append('limit', String(limit + 1));

  if (filters.category && filters.category !== 'All') {
    query.append('category', `eq.${filters.category}`);
  }

  if (typeof filters.minPrice === 'number') {
    query.append('price', `gte.${filters.minPrice}`);
  }

  if (typeof filters.maxPrice === 'number') {
    query.append('price', `lte.${filters.maxPrice}`);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const searchTerm = sanitizeSupabaseSearchTerm(filters.search);
    query.append(
      'or',
      `(title.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*,fabric.ilike.*${searchTerm}*)`
    );
  }

  const response = await axios.get<unknown[]>(
    `${config.url}/rest/v1/products?${query.toString()}`,
    {
      headers: createSupabaseRestHeaders(config, 'count=exact'),
      timeout: REQUEST_TIMEOUT_MS,
    }
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  const hasMore = rows.length > limit;
  const items = rows
    .slice(0, limit)
    .filter(isRecord)
    .map((row) => normalizeProduct(row as ProductLike));
  const total = parseContentRangeTotal(response.headers['content-range']);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasMore,
    },
  };
}

/**
 * Fetches a single active product directly from Supabase public REST.
 */
export async function fetchSupabaseProductById(id: string): Promise<Product | null> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new ApiClientError(
      'Supabase public configuration is missing for product details.'
    );
  }

  const query = new URLSearchParams();
  query.append('select', '*');
  query.append('id', `eq.${id}`);
  query.append('is_active', 'eq.true');
  query.append('limit', '1');

  const response = await axios.get<unknown[]>(
    `${config.url}/rest/v1/products?${query.toString()}`,
    {
      headers: createSupabaseRestHeaders(config),
      timeout: REQUEST_TIMEOUT_MS,
    }
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  const product = rows.find(isRecord);

  return product ? normalizeProduct(product as ProductLike) : null;
}

/**
 * Loads home category cards directly from Supabase so mobile catalogue discovery
 * still works when the configured API points at an unreachable local server.
 */
export async function fetchSupabaseHomeCategories(): Promise<HomeCategoryCard[]> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new ApiClientError(
      'Supabase public configuration is missing for home categories.'
    );
  }

  const headers = createSupabaseRestHeaders(config);
  const [managedCategoriesResult, categoryProductsResult] = await Promise.allSettled([
    axios.get<unknown[]>(
      `${config.url}/rest/v1/site_categories?select=name&order=name.asc`,
      {
        headers,
        timeout: REQUEST_TIMEOUT_MS,
      }
    ),
    axios.get<unknown[]>(
      `${config.url}/rest/v1/products?select=category,images,created_at&is_active=eq.true&stock_qty=gt.0&category=not.is.null&order=created_at.desc`,
      {
        headers,
        timeout: REQUEST_TIMEOUT_MS,
      }
    ),
  ]);

  if (categoryProductsResult.status !== 'fulfilled') {
    const reason = categoryProductsResult.reason;
    throw axios.isAxiosError(reason)
      ? createApiClientError(reason)
      : new ApiClientError(getApiErrorMessage(reason));
  }

  const counts = new Map<string, number>();
  const previewImages = new Map<string, string>();
  const productRows = Array.isArray(categoryProductsResult.value.data)
    ? categoryProductsResult.value.data
    : [];

  for (const row of productRows) {
    if (!isRecord(row)) {
      continue;
    }

    const category =
      typeof row.category === 'string' && row.category.trim().length > 0
        ? row.category.trim()
        : null;

    if (!category) {
      continue;
    }

    counts.set(category, (counts.get(category) ?? 0) + 1);

    if (!previewImages.has(category)) {
      previewImages.set(category, resolveImages(row as ProductLike)[0] ?? '');
    }
  }

  const managedCategories =
    managedCategoriesResult.status === 'fulfilled' &&
    Array.isArray(managedCategoriesResult.value.data)
      ? managedCategoriesResult.value.data
          .filter(isRecord)
          .map((row) => {
            const name = (row as CategoryNameLike).name;
            return typeof name === 'string' && name.trim().length > 0
              ? name.trim()
              : null;
          })
          .filter((name): name is string => Boolean(name))
      : [];

  const categoryNames = Array.from(
    new Set([...CATEGORIES, ...managedCategories, ...counts.keys()])
  );

  return categoryNames.map((name) => ({
    name,
    image: previewImages.get(name) ?? '',
    count: counts.get(name) ?? 0,
  }));
}

function isMissingOrdersUserIdColumn(error: PostgrestErrorLike | null | undefined): boolean {
  return (
    error?.code === 'PGRST204' &&
    typeof error.message === 'string' &&
    error.message.includes("'user_id' column")
  );
}

function extractOrderIdFromPayload(
  payload: unknown,
  fallbackOrderId: string
): string {
  if (!isRecord(payload)) {
    return fallbackOrderId;
  }

  if (typeof payload.orderId === 'string' && payload.orderId.trim().length > 0) {
    return payload.orderId.trim();
  }

  if (typeof payload.id === 'string' && payload.id.trim().length > 0) {
    return payload.id.trim();
  }

  if (isRecord(payload.data)) {
    return extractOrderIdFromPayload(payload.data, fallbackOrderId);
  }

  return fallbackOrderId;
}

async function insertSupabaseOrderRecord(
  record: MobileOrderSubmissionPayload & { user_id?: string | null },
  options: MobileOrderSubmissionOptions = {}
): Promise<void> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new ApiClientError(
      'Supabase public configuration is missing for mobile order placement.'
    );
  }

  const accessToken = trimEnvValue(options.accessToken ?? undefined);

  try {
    await axios.post(`${config.url}/rest/v1/orders`, record, {
      headers: createSupabaseMutationHeaders(
        config,
        accessToken || undefined,
        'return=minimal'
      ),
      timeout: REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createApiClientError(error);
    }

    throw new ApiClientError(getApiErrorMessage(error));
  }
}

export async function submitOrderViaSupabase(
  payload: MobileOrderSubmissionPayload,
  options: MobileOrderSubmissionOptions = {}
): Promise<string> {
  const userId =
    typeof options.userId === 'string' && options.userId.trim().length > 0
      ? options.userId.trim()
      : null;

  try {
    await insertSupabaseOrderRecord(
      userId ? { ...payload, user_id: userId } : payload,
      options
    );
    return payload.id;
  } catch (error) {
    if (
      userId &&
      error instanceof ApiClientError &&
      isMissingOrdersUserIdColumn(error.details as PostgrestErrorLike | undefined)
    ) {
      await insertSupabaseOrderRecord(payload, options);
      return payload.id;
    }

    if (
      options.accessToken &&
      error instanceof ApiClientError &&
      typeof error.statusCode === 'number' &&
      [401, 403].includes(error.statusCode)
    ) {
      await insertSupabaseOrderRecord(payload);
      return payload.id;
    }

    throw error;
  }
}

function resolveOrderAccessToken(token?: string | null): string | undefined {
  const normalized = typeof token === 'string' ? token.trim() : '';

  if (!normalized || normalized === DEMO_SESSION_TOKEN) {
    return undefined;
  }

  return normalized;
}

/**
 * Resolves a usable product image URL for order payloads.
 * The backend rejects cart lines without a non-empty image string.
 */
export function resolveOrderItemImage(
  image?: string | null,
  images?: Array<string | null | undefined> | null
): string {
  const primary =
    typeof image === 'string' && image.trim().length > 0 ? image.trim() : '';

  if (primary) {
    return primary;
  }

  const fromGallery = Array.isArray(images)
    ? images.find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && candidate.trim().length > 0
      )
    : undefined;

  return fromGallery?.trim() || PLACEHOLDER_PRODUCT_IMAGE;
}

export async function submitMobileOrder(
  payload: MobileOrderSubmissionPayload,
  options: MobileOrderSubmissionOptions = {}
): Promise<string> {
  const accessToken = resolveOrderAccessToken(options.accessToken);
  const sanitizedPayload: MobileOrderSubmissionPayload = {
    ...payload,
    items: payload.items.map((item) => ({
      ...item,
      image: resolveOrderItemImage(item.image),
    })),
  };

  const postOrder = async (token?: string): Promise<string> => {
    const response = await api.post<unknown>('/orders', sanitizedPayload, {
      headers: createOptionalAuthHeaders(token),
      timeout: 30000,
    });
    return extractOrderIdFromPayload(response.data, sanitizedPayload.id);
  };

  try {
    return await postOrder(accessToken);
  } catch (error) {
    if (
      accessToken &&
      error instanceof ApiClientError &&
      error.statusCode === 401
    ) {
      try {
        return await postOrder();
      } catch (retryError) {
        error = retryError;
      }
    }

    const message = getApiErrorMessage(error).toLowerCase();

    if (
      message.includes('network error') ||
      message.includes('timeout') ||
      message.includes('could not reach') ||
      message.includes('unable to connect')
    ) {
      throw new ApiClientError(
        'Could not reach the Stree order service. Start the website server or set EXPO_PUBLIC_API_URL to the live site /api so order emails can be sent.'
      );
    }

    throw error;
  }
}

/**
 * Extracts data from either a raw payload or a { success, data } API envelope.
 */
export function unwrapApiData<T>(payload: ApiResponse<T> | T): T {
  if (!isApiEnvelope<T>(payload)) {
    return payload;
  }

  if (!payload.success) {
    throw new ApiClientError(payload.error ?? payload.message ?? 'Request failed.');
  }

  if (typeof payload.data === 'undefined') {
    throw new ApiClientError('Response did not include any data.');
  }

  return payload.data;
}

/**
 * Normalizes address data into the mobile app shape.
 */
export function normalizeAddress(address?: Partial<Address> | null): Address {
  return {
    name: typeof address?.name === 'string' ? address.name.trim() : '',
    phone: typeof address?.phone === 'string' ? address.phone.trim() : '',
    line1: typeof address?.line1 === 'string' ? address.line1.trim() : '',
    line2:
      typeof address?.line2 === 'string' && address.line2.trim().length > 0
        ? address.line2.trim()
        : undefined,
    city: typeof address?.city === 'string' ? address.city.trim() : '',
    state: typeof address?.state === 'string' ? address.state.trim() : '',
    pincode: typeof address?.pincode === 'string' ? address.pincode.trim() : '',
  };
}

/**
 * Normalizes product payloads from the current backend or future public API.
 */
export function normalizeProduct(product: ProductLike): Product {
  const images = resolveImages(product);
  const stockQty =
    typeof product.stockQty === 'number'
      ? product.stockQty
      : typeof product.stock_qty === 'number'
        ? product.stock_qty
        : undefined;
  const name =
    typeof product.name === 'string' && product.name.trim().length > 0
      ? product.name.trim()
      : typeof product.title === 'string' && product.title.trim().length > 0
        ? product.title.trim()
        : 'Untitled Saree';
  const category =
    typeof product.category === 'string' && product.category.trim().length > 0
      ? product.category.trim()
      : 'Sarees';
  const description =
    typeof product.description === 'string' && product.description.trim().length > 0
      ? product.description.trim()
      : DEFAULT_PRODUCT_DESCRIPTION;
  const careInstructions = resolveCareInstructions(product);

  return {
    id: typeof product.id === 'string' ? product.id : '',
    name,
    slug:
      typeof product.slug === 'string' && product.slug.trim().length > 0
        ? product.slug.trim()
        : undefined,
    price: typeof product.price === 'number' ? product.price : 0,
    image: images[0] ?? '',
    images,
    category,
    fabric:
      typeof product.fabric === 'string' && product.fabric.trim().length > 0
        ? product.fabric.trim()
        : 'Handpicked',
    occasion:
      typeof product.occasion === 'string' && product.occasion.trim().length > 0
        ? product.occasion.trim()
        : category,
    description,
    rating: typeof product.rating === 'number' ? product.rating : 0,
    reviews: typeof product.reviews === 'number' ? product.reviews : 0,
    inStock:
      typeof product.inStock === 'boolean'
        ? product.inStock
        : Boolean(product.is_active ?? true) && (stockQty === undefined || stockQty > 0),
    stockQty,
    mrp: typeof product.mrp === 'number' ? product.mrp : null,
    colors: Array.isArray(product.colors)
      ? product.colors.filter(
          (color): color is string =>
            typeof color === 'string' && color.trim().length > 0
        )
      : [],
    careInstructions,
    createdAt:
      typeof product.createdAt === 'string'
        ? product.createdAt
        : typeof product.created_at === 'string'
          ? product.created_at
          : undefined,
    updatedAt:
      typeof product.updatedAt === 'string'
        ? product.updatedAt
        : typeof product.updated_at === 'string'
          ? product.updated_at
          : undefined,
  };
}

/**
 * Normalizes order payloads to the mobile app shape.
 */
export function normalizeOrder(order: OrderLike): Order {
  const items = Array.isArray(order.items)
    ? order.items.map((item, index) => normalizeOrderItem(item, order.id ?? '', index))
    : [];
  const rawStatus =
    typeof order.status === 'string' ? ORDER_STATUS_MAP[order.status] : undefined;
  const address = normalizeAddress({
    name:
      typeof order.address?.name === 'string'
        ? order.address.name
        : typeof order.customer_name === 'string'
          ? order.customer_name
          : '',
    phone:
      typeof order.address?.phone === 'string'
        ? order.address.phone
        : typeof order.phone === 'string'
          ? order.phone
          : '',
    line1:
      typeof order.address?.line1 === 'string'
        ? order.address.line1
        : typeof order.address_line1 === 'string'
          ? order.address_line1
          : '',
    line2:
      typeof order.address?.line2 === 'string'
        ? order.address.line2
        : typeof order.address_line2 === 'string'
          ? order.address_line2
          : undefined,
    city:
      typeof order.address?.city === 'string'
        ? order.address.city
        : typeof order.city === 'string'
          ? order.city
          : '',
    state:
      typeof order.address?.state === 'string'
        ? order.address.state
        : typeof order.state === 'string'
          ? order.state
          : '',
    pincode:
      typeof order.address?.pincode === 'string'
        ? order.address.pincode
        : typeof order.pincode === 'string'
          ? order.pincode
          : '',
  });

  return {
    id: typeof order.id === 'string' ? order.id : '',
    date:
      typeof order.date === 'string'
        ? order.date
        : typeof order.created_at === 'string'
          ? order.created_at
          : '',
    status: rawStatus ?? 'pending',
    items,
    total:
      typeof order.total === 'number'
        ? order.total
        : typeof order.total_amount === 'number'
          ? order.total_amount
          : 0,
    address,
  };
}

/**
 * Normalizes user payloads to the mobile app shape.
 */
export function normalizeUser(user?: UserLike | null): User | null {
  if (!user) {
    return null;
  }

  const nameCandidates = [
    user.name,
    user.full_name,
    user.user_metadata?.name,
    user.user_metadata?.full_name,
  ];
  const resolvedName =
    nameCandidates.find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0
    ) ?? 'Stree Customer';
  const defaultAddress =
    user.defaultAddress ?? user.default_address ?? user.user_metadata?.default_address;

  return {
    id: typeof user.id === 'string' ? user.id : '',
    name: resolvedName.trim(),
    email: typeof user.email === 'string' ? user.email.trim() : '',
    phone:
      typeof user.phone === 'string'
        ? user.phone.trim()
        : typeof user.user_metadata?.phone === 'string'
          ? user.user_metadata.phone.trim()
          : '',
    defaultAddress: defaultAddress ? normalizeAddress(defaultAddress) : undefined,
  };
}

function createOptionalAuthHeaders(
  token?: string
): AxiosRequestConfig['headers'] | undefined {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

/**
 * Converts thrown network errors into a user-facing message.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Unable to connect to Stree right now.'
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim().length > 0) {
      return responseData.trim();
    }

    if (isRecord(responseData)) {
      const apiError =
        typeof responseData.error === 'string'
          ? responseData.error
          : typeof responseData.message === 'string'
            ? responseData.message
            : undefined;

      if (apiError && apiError.trim().length > 0) {
        return apiError.trim();
      }
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallback;
}

/**
 * Sends a GET request and unwraps the response payload.
 */
export async function getRequest<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<ApiResponse<T> | T>(url, config);
  return unwrapApiData(response.data);
}

/**
 * Sends a POST request and unwraps the response payload.
 */
export async function postRequest<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await api.post<ApiResponse<TResponse> | TResponse>(
    url,
    payload,
    config
  );
  return unwrapApiData(response.data);
}

/**
 * Sends a PUT request and unwraps the response payload.
 */
export async function putRequest<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await api.put<ApiResponse<TResponse> | TResponse>(
    url,
    payload,
    config
  );
  return unwrapApiData(response.data);
}

/**
 * Sends a PATCH request and unwraps the response payload.
 */
export async function patchRequest<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await api.patch<ApiResponse<TResponse> | TResponse>(
    url,
    payload,
    config
  );
  return unwrapApiData(response.data);
}

/**
 * Sends a DELETE request and unwraps the response payload.
 */
export async function deleteRequest<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<ApiResponse<T> | T>(url, config);
  return unwrapApiData(response.data);
}

/**
 * Loads the signed-in customer profile from the app backend.
 */
export async function fetchCurrentUser(
  token?: string,
  config?: AxiosRequestConfig
): Promise<User | null> {
  const user = await getRequest<ApiUser>('/mobile-auth/me', {
    ...config,
    headers: {
      ...(createOptionalAuthHeaders(token) ?? {}),
      ...(config?.headers ?? {}),
    },
  });

  return normalizeUser(user);
}

/**
 * Loads the same managed home categories used by the web homepage.
 */
export async function fetchHomeCategories(): Promise<HomeCategoryCard[]> {
  const normalizeCategories = (categories: unknown): HomeCategoryCard[] =>
    Array.isArray(categories)
      ? categories
          .filter(
            (
              category
            ): category is HomeCategoryCard =>
              Boolean(
                category &&
                  typeof category.name === 'string' &&
                  typeof category.image === 'string' &&
                  typeof category.count === 'number'
              )
          )
          .map((category) => ({
            ...category,
            image: resolveMediaUrl(category.image),
          }))
      : [];

  if (shouldPreferSupabaseCatalogReads()) {
    return fetchSupabaseHomeCategories();
  }

  try {
    const categories = await getRequest<HomeCategoryCard[]>('/home-categories');
    return normalizeCategories(categories);
  } catch (error) {
    if (shouldUseSupabaseCatalogFallback(error)) {
      return fetchSupabaseHomeCategories();
    }

    throw error;
  }
}

/**
 * Persists profile updates through the app backend and returns the latest server copy.
 */
export async function updateCurrentUserProfile(
  updates: Partial<User>,
  token?: string,
  config?: AxiosRequestConfig
): Promise<User | null> {
  const user = await patchRequest<ApiUser, Partial<User>>(
    '/mobile-auth/profile',
    updates,
    {
      ...config,
      headers: {
        ...(createOptionalAuthHeaders(token) ?? {}),
        ...(config?.headers ?? {}),
      },
    }
  );

  return normalizeUser(user);
}

/**
 * Loads authenticated order history from the app backend.
 */
export async function fetchMyOrders(token?: string): Promise<Order[]> {
  const orders = await getRequest<ApiOrder[]>('/mobile-auth/orders', {
    headers: createOptionalAuthHeaders(token),
  });

  return Array.isArray(orders) ? orders.map((order) => normalizeOrder(order)) : [];
}

function normalizeOrderItem(
  item: OrderItemLike,
  orderId: string,
  index: number
): CartItem {
  const image =
    typeof item.image === 'string' && item.image.trim().length > 0
      ? item.image.trim()
      : '';
  const name =
    typeof item.name === 'string' && item.name.trim().length > 0
      ? item.name.trim()
      : typeof item.title === 'string' && item.title.trim().length > 0
        ? item.title.trim()
        : 'Untitled Saree';

  return {
    id:
      typeof item.id === 'string' && item.id.trim().length > 0
        ? item.id.trim()
        : typeof item.productId === 'string' && item.productId.trim().length > 0
          ? item.productId.trim()
          : `${orderId}-${index}`,
    name,
    price: typeof item.price === 'number' ? item.price : 0,
    image,
    images: image ? [image] : [],
    category: 'Sarees',
    fabric: 'Handpicked',
    occasion: 'Occasion Wear',
    description: DEFAULT_PRODUCT_DESCRIPTION,
    rating: 0,
    reviews: 0,
    inStock: true,
    colors: [],
    careInstructions: [],
    quantity: typeof item.quantity === 'number' ? item.quantity : item.qty ?? 1,
  };
}
