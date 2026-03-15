/**
 * OS-level credential storage for PDF2Markdown CLI
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface StoredCredentials {
  apiKey?: string;
  apiUrl?: string;
}

function getConfigDir(): string {
  const homeDir = os.homedir();
  const platform = os.platform();

  switch (platform) {
    case 'darwin':
      return path.join(
        homeDir,
        'Library',
        'Application Support',
        'pdf2markdown-cli'
      );
    case 'win32':
      return path.join(homeDir, 'AppData', 'Roaming', 'pdf2markdown-cli');
    default:
      return path.join(homeDir, '.config', 'pdf2markdown-cli');
  }
}

function getCredentialsPath(): string {
  return path.join(getConfigDir(), 'credentials.json');
}

function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
  }
}

function setSecurePermissions(filePath: string): void {
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Ignore on Windows
  }
}

export function loadCredentials(): StoredCredentials | null {
  try {
    const credentialsPath = getCredentialsPath();
    if (!fs.existsSync(credentialsPath)) {
      return null;
    }
    const data = fs.readFileSync(credentialsPath, 'utf-8');
    return JSON.parse(data) as StoredCredentials;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: StoredCredentials): void {
  ensureConfigDir();
  const credentialsPath = getCredentialsPath();
  const existing = loadCredentials();
  const merged: StoredCredentials = { ...existing, ...credentials };
  fs.writeFileSync(credentialsPath, JSON.stringify(merged, null, 2), 'utf-8');
  setSecurePermissions(credentialsPath);
}

export function deleteCredentials(): void {
  try {
    const credentialsPath = getCredentialsPath();
    if (fs.existsSync(credentialsPath)) {
      fs.unlinkSync(credentialsPath);
    }
  } catch (error) {
    throw new Error(
      `Failed to delete credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function getConfigDirectoryPath(): string {
  return getConfigDir();
}
