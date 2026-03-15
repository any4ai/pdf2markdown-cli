/**
 * Logout command - clear stored credentials
 */

import { deleteCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';

export async function handleLogoutCommand(): Promise<void> {
  try {
    deleteCredentials();
    updateConfig({ apiKey: undefined });
    console.log('Logged out. Credentials cleared.');
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}
