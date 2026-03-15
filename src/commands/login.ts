/**
 * Login command for PDF2Markdown CLI
 */

import * as readline from 'readline';
import { saveCredentials, getConfigDirectoryPath } from '../utils/credentials';
import { updateConfig, getApiKey } from '../utils/config';
import { isAuthenticated } from '../utils/auth';

const DEFAULT_API_URL = 'https://pdf2markdown.io';

export interface LoginOptions {
  apiKey?: string;
  apiUrl?: string;
}

export async function handleLoginCommand(
  options: LoginOptions = {}
): Promise<void> {
  const apiUrl = (options.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');

  if (isAuthenticated() && !options.apiKey) {
    console.log('Already logged in.');
    console.log(`Credentials: ${getConfigDirectoryPath()}`);
    console.log('\nTo login with a different account:');
    console.log('  pdf2markdown logout');
    console.log('  pdf2markdown login');
    return;
  }

  if (options.apiKey) {
    const key = options.apiKey.trim();
    if (!key) {
      console.error('Error: API key cannot be empty');
      process.exit(1);
    }
    if (!key.startsWith('p2m_') && !key.startsWith('p2m-')) {
      console.log('Note: PDF2Markdown API keys typically start with p2m_');
    }
    try {
      saveCredentials({ apiKey: key, apiUrl });
      updateConfig({ apiKey: key, apiUrl });
      console.log('✓ Login successful!');
    } catch (error) {
      console.error(
        'Error saving credentials:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      process.exit(1);
    }
    return;
  }

  console.log('\nGet your API key from https://pdf2markdown.io/dashboard\n');
  try {
    const apiKey = await new Promise<string>((resolve) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('Enter your PDF2Markdown API key: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!apiKey) {
      console.error('Error: API key cannot be empty');
      process.exit(1);
    }

    saveCredentials({ apiKey, apiUrl });
    updateConfig({ apiKey, apiUrl });
    console.log('\n✓ Login successful!');
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}
