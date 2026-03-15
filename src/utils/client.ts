/**
 * PDF2Markdown API client
 */

import { getApiKey, getApiUrl } from './config';

const DEFAULT_BASE = 'https://pdf2markdown.io';
const DEFAULT_TIMEOUT_MS = 120_000; // 2 min for large PDFs

export interface ParseOptions {
  input?: string;
  base64?: string;
  filename?: string;
  output?: 'markdown' | 'json' | 'all';
  pageImages?: boolean;
}

export interface ParseResult {
  code: string;
  data?: {
    result?: {
      markdown?: string;
      pages?: Array<{ page_idx: number; md: string }>;
    };
    uid?: string;
  };
}

export interface ParseError {
  error?: {
    code: string;
    message: string;
  };
}

export async function parseDocument(
  options: ParseOptions,
  apiKey?: string,
  apiUrl?: string
): Promise<ParseResult> {
  const key = apiKey || getApiKey();
  if (!key) {
    throw new Error('API key is required');
  }

  const base = (apiUrl || getApiUrl()).replace(/\/$/, '');
  const url = `${base}/api/v1/parse`;

  const body: Record<string, unknown> = {
    output: options.output ?? 'all',
    page_images: options.pageImages ?? false,
  };

  if (options.input) {
    body.input = options.input;
  } else if (options.base64) {
    body.base64 = options.base64;
    if (options.filename) body.filename = options.filename;
  } else {
    throw new Error('Either input (URL) or base64 is required');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    const cause = (e as Error & { cause?: Error }).cause;
    const msg = cause?.message || (e as Error).message;
    throw new Error(
      `Network error: ${msg}. Check internet connection and https://pdf2markdown.io status.`
    );
  }
  clearTimeout(timeout);

  let data: ParseResult | ParseError;
  try {
    data = (await res.json()) as ParseResult | ParseError;
  } catch {
    throw new Error(`API returned invalid JSON (${res.status})`);
  }

  if (!res.ok) {
    const err = data as ParseError;
    throw new Error(
      err.error?.message || `API error: ${res.status} ${res.statusText}`
    );
  }
  return data as ParseResult;
}

/** Async parse: submit job */
export async function parseDocumentAsync(
  options: ParseOptions,
  apiKey?: string,
  apiUrl?: string
): Promise<{ code: string; data: { task_id: string; status: string } }> {
  const key = apiKey || getApiKey();
  if (!key) throw new Error('API key is required');

  const base = (apiUrl || getApiUrl()).replace(/\/$/, '');
  const url = `${base}/api/v1/parse/async`;

  const body: Record<string, unknown> = {
    output: options.output ?? 'all',
    page_images: options.pageImages ?? false,
  };
  if (options.input) body.input = options.input;
  else if (options.base64) {
    body.base64 = options.base64;
    if (options.filename) body.filename = options.filename;
  } else {
    throw new Error('Either input (URL) or base64 is required');
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        (data as ParseError).error?.message || `API error: ${res.status}`
      );
    }
    return data;
  } catch (e) {
    if ((e as Error).message.startsWith('API error:')) throw e;
    const cause = (e as Error & { cause?: Error }).cause;
    const msg = cause?.message || (e as Error).message;
    throw new Error(`Network error: ${msg}. Check internet and pdf2markdown.io.`);
  }
}

/** Get async task status */
export async function getTaskStatus(
  taskId: string,
  apiKey?: string,
  apiUrl?: string
): Promise<{ code: string; data: { status: string } }> {
  const key = apiKey || getApiKey();
  if (!key) throw new Error('API key is required');

  const base = (apiUrl || getApiUrl()).replace(/\/$/, '');
  const url = `${base}/api/v1/tasks/${taskId}/status`;

  const res = await fetch(url, {
    headers: { 'X-API-Key': key },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      (data as ParseError).error?.message || `API error: ${res.status}`
    );
  }
  return data;
}

/** Get async task result - fetches presigned URL and returns actual parse result */
export async function getTaskResult(
  taskId: string,
  apiKey?: string,
  apiUrl?: string
): Promise<ParseResult> {
  const key = apiKey || getApiKey();
  if (!key) throw new Error('API key is required');

  const base = (apiUrl || getApiUrl()).replace(/\/$/, '');
  const url = `${base}/api/v1/tasks/${taskId}/result`;

  const res = await fetch(url, {
    headers: { 'X-API-Key': key },
  });
  const data = (await res.json()) as Record<string, unknown> | ParseError;
  if (!res.ok) {
    throw new Error(
      (data as ParseError).error?.message || `API error: ${res.status}`
    );
  }

  // Async API returns presigned URL in result.url - fetch the actual JSON
  const resultUrl = (data as { result?: { url?: string } }).result?.url;
  if (resultUrl) {
    const downloadRes = await fetch(resultUrl);
    if (!downloadRes.ok) {
      throw new Error(`Failed to download result: ${downloadRes.status}`);
    }
    const actual = (await downloadRes.json()) as ParseResult;
    return actual;
  }

  // Fallback: API might return inline result
  return data as ParseResult;
}
