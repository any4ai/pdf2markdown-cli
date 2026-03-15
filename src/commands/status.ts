/**
 * Status command - version, auth status
 */

import * as fs from 'fs';
import * as path from 'path';
import { isAuthenticated } from '../utils/auth';
import { getConfig, getApiKey } from '../utils/config';
import { loadCredentials } from '../utils/credentials';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

type AuthSource = 'env' | 'stored' | 'none';

function getAuthSource(): AuthSource {
  if (process.env.PDF2MARKDOWN_API_KEY) return 'env';
  const stored = loadCredentials();
  if (stored?.apiKey) return 'stored';
  return 'none';
}

export async function handleStatusCommand(): Promise<void> {
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const green = '\x1b[32m';
  const red = '\x1b[31m';

  const authSource = getAuthSource();
  const authenticated = isAuthenticated();

  console.log('');
  console.log(`  ${bold}pdf2markdown${reset} ${dim}cli v${pkg.version}${reset}`);
  console.log('');

  if (authenticated) {
    const label =
      authSource === 'env'
        ? 'via PDF2MARKDOWN_API_KEY'
        : 'via stored credentials';
    console.log(`  ${green}●${reset} Authenticated ${dim}${label}${reset}`);
  } else {
    console.log(`  ${red}●${reset} Not authenticated`);
    console.log(`  ${dim}Run 'pdf2markdown login' or set PDF2MARKDOWN_API_KEY${reset}`);
  }

  const cwd = process.cwd();
  const outDir = path.join(cwd, '.pdf2markdown');
  let dirExists = false;
  let fileCount = 0;
  try {
    const stat = fs.statSync(outDir);
    if (stat.isDirectory()) {
      dirExists = true;
      fileCount = fs.readdirSync(outDir).filter((n) => !n.startsWith('.')).length;
    }
  } catch {
    // ignore
  }

  console.log(
    `  ${dim}.pdf2markdown/:${reset} ${dirExists ? `${fileCount} files` : 'not found'}`
  );
  console.log('');
}
