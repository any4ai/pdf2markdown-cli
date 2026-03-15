/**
 * Config and view-config commands
 */

import { saveCredentials, loadCredentials, getConfigDirectoryPath } from '../utils/credentials';
import { updateConfig } from '../utils/config';

const DEFAULT_API_URL = 'https://pdf2markdown.io';

export interface ConfigOptions {
  apiKey?: string;
  apiUrl?: string;
}

export async function configure(options: ConfigOptions = {}): Promise<void> {
  const updates: { apiKey?: string; apiUrl?: string } = {};
  if (options.apiKey) updates.apiKey = options.apiKey;
  if (options.apiUrl) {
    updates.apiUrl = options.apiUrl.replace(/\/$/, '');
  }
  if (Object.keys(updates).length === 0) {
    console.log('No options provided. Use --api-key or --api-url');
    return;
  }
  const stored = loadCredentials();
  const merged = { ...stored, ...updates };
  saveCredentials(merged);
  updateConfig(merged);
  console.log('✓ Config updated');
}

export function viewConfig(): void {
  const stored = loadCredentials();
  const apiKey = stored?.apiKey;
  const apiUrl = stored?.apiUrl || process.env.PDF2MARKDOWN_API_URL || DEFAULT_API_URL;

  console.log('');
  console.log('  PDF2Markdown CLI Config');
  console.log('  -----------------------');
  console.log(`  API URL:  ${apiUrl}`);
  console.log(`  API Key:  ${apiKey ? `${apiKey.slice(0, 12)}...` : '(not set)'}`);
  console.log(`  Storage:  ${getConfigDirectoryPath()}`);
  console.log('');
}
