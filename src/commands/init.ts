/**
 * Init command - install CLI, authenticate, install skills
 * Cross-platform: macOS, Windows, Linux
 */

import { execSync } from 'child_process';
import { isAuthenticated } from '../utils/auth';
import { saveCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';
import { handleSetupCommand } from './setup';

export interface InitOptions {
  all?: boolean;
  yes?: boolean;
  skipInstall?: boolean;
  skipAuth?: boolean;
  skipSkills?: boolean;
  apiKey?: string;
}

function getPackageManager(): string {
  if (process.env.npm_config_user_agent?.includes('pnpm')) return 'pnpm';
  if (process.env.npm_config_user_agent?.includes('yarn')) return 'yarn';
  try {
    execSync('pnpm --version', { encoding: 'utf-8', stdio: 'pipe' });
    return 'pnpm';
  } catch {
    try {
      execSync('yarn --version', { encoding: 'utf-8', stdio: 'pipe' });
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}

function installGlobalCommand(pm: string): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm add -g pdf2markdown-cli';
    case 'yarn':
      return 'yarn global add pdf2markdown-cli';
    default:
      return 'npm install -g pdf2markdown-cli';
  }
}

export async function handleInitCommand(options: InitOptions = {}): Promise<void> {
  const green = '\x1b[32m';
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';

  if (!options.skipInstall) {
    const pm = getPackageManager();
    const cmd = installGlobalCommand(pm);
    console.log(`\n  Installing pdf2markdown-cli globally (${pm})...`);
    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`  ${green}✓${reset} CLI installed\n`);
    } catch {
      console.log(`  ${dim}Failed. Try: npx pdf2markdown  or  npx pdf2md${reset}\n`);
    }
  }

  if (!options.skipAuth) {
    if (isAuthenticated() && !options.apiKey) {
      console.log(`  ${green}✓${reset} Already authenticated\n`);
    } else if (options.apiKey) {
      saveCredentials({ apiKey: options.apiKey });
      updateConfig({ apiKey: options.apiKey });
      console.log(`  ${green}✓${reset} Authenticated with API key\n`);
    } else {
      console.log('  Run "pdf2markdown login" to authenticate.\n');
    }
  }

  if (!options.skipSkills) {
    console.log('  Installing skills...');
    await handleSetupCommand('skills', { global: true });
    console.log(`  ${green}✓${reset} Skills installed\n`);
  }

  console.log('  You\'re all set! Try:');
  console.log('    pdf2markdown document.pdf -o .pdf2markdown/output.md');
  console.log('    pdf2md document.pdf -o .pdf2markdown/output.md');
  console.log('');
}
