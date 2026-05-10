import { API_URL } from '../constants/config';

const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '');
const MEDIA_BASE = MEDIA_BASE_URL.endsWith('/')
  ? MEDIA_BASE_URL.slice(0, -1)
  : MEDIA_BASE_URL;

const FIGMA_MCP_ASSET_URL = /^https:\/\/www\.figma\.com\/api\/mcp\/asset\//i;
const KNOWN_DEAD_IMAGE_URL = /images\.unsplash\.com\/photo-1501386761578-0a55d2858e5b/i;

const normalizeLocalhost = (url: string) =>
  url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/|$)/i, MEDIA_BASE);

export const resolveImageUrl = (input?: string | null) => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (FIGMA_MCP_ASSET_URL.test(trimmed)) return null;
  if (KNOWN_DEAD_IMAGE_URL.test(trimmed)) return null;
  if (/^(data|file|content):/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return normalizeLocalhost(trimmed);
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${MEDIA_BASE}${trimmed}`;
  return `${MEDIA_BASE}/${trimmed}`;
};
