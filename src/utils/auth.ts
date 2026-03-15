/**
 * Authentication for PDF2Markdown CLI
 */

import { getApiKey } from './config';
import { saveCredentials } from './credentials';
import { updateConfig } from './config';

export function isAuthenticated(): boolean {
  const key = getApiKey();
  return !!key && key.length > 0;
}

export function printBanner(): void {
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../../package.json');
  const version = pkg.version || 'unknown';
  console.log('');
  console.log(`  ${bold}pdf2markdown${reset} ${dim}cli v${version}${reset}`);
  console.log(`  ${dim}Convert PDF and images to Markdown${reset}`);
  console.log('');
}

export async function ensureAuthenticated(): Promise<string> {
  const key = getApiKey();
  if (key) return key;
  throw new Error(
    'Not authenticated. Run "pdf2markdown login" or set PDF2MARKDOWN_API_KEY.'
  );
}
