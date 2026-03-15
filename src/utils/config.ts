/**
 * Global configuration for PDF2Markdown CLI
 */

import { loadCredentials } from './credentials';

export interface GlobalConfig {
  apiKey?: string;
  apiUrl?: string;
}

let globalConfig: GlobalConfig = {};

const DEFAULT_API_URL = 'https://pdf2markdown.io';

export function initializeConfig(config: Partial<GlobalConfig> = {}): void {
  const storedCredentials = loadCredentials();
  globalConfig = {
    apiKey:
      config.apiKey ||
      process.env.PDF2MARKDOWN_API_KEY ||
      storedCredentials?.apiKey,
    apiUrl:
      config.apiUrl ||
      process.env.PDF2MARKDOWN_API_URL ||
      storedCredentials?.apiUrl ||
      DEFAULT_API_URL,
  };
}

export function getConfig(): GlobalConfig {
  return { ...globalConfig };
}

export function updateConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config };
  if (config.apiKey === undefined) globalConfig.apiKey = undefined;
  if (config.apiUrl === undefined) globalConfig.apiUrl = undefined;
}

export function getApiKey(providedKey?: string): string | undefined {
  if (providedKey) return providedKey;
  if (globalConfig.apiKey) return globalConfig.apiKey;
  if (process.env.PDF2MARKDOWN_API_KEY) return process.env.PDF2MARKDOWN_API_KEY;
  const storedCredentials = loadCredentials();
  return storedCredentials?.apiKey;
}

export function getApiUrl(): string {
  return (
    globalConfig.apiUrl ||
    process.env.PDF2MARKDOWN_API_URL ||
    loadCredentials()?.apiUrl ||
    DEFAULT_API_URL
  );
}

export function isCustomApiUrl(apiUrl?: string): boolean {
  const url = apiUrl || globalConfig.apiUrl;
  return !!url && url !== DEFAULT_API_URL;
}

export function validateConfig(apiKey?: string): void {
  if (isCustomApiUrl()) return;
  const key = getApiKey(apiKey);
  if (!key) {
    throw new Error(
      'API key is required. Set PDF2MARKDOWN_API_KEY, use --api-key, or run "pdf2markdown login".'
    );
  }
}
