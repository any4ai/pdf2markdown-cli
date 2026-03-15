#!/usr/bin/env node

/**
 * PDF2Markdown CLI
 * Convert PDF and image documents to Markdown.
 * Also available as: pdf2md
 */

import { Command } from 'commander';
import { initializeConfig } from './utils/config';
import { handleParseCommand } from './commands/parse';
import { handleParseAsyncCommand } from './commands/parse-async';
import { handleLoginCommand } from './commands/login';
import { handleLogoutCommand } from './commands/logout';
import { configure, viewConfig } from './commands/config';
import { handleStatusCommand } from './commands/status';
import { handleVersionCommand } from './commands/version';
import { handleInitCommand } from './commands/init';
import { handleSetupCommand } from './commands/setup';
import type { SetupSubcommand } from './commands/setup';
import { ensureAuthenticated, printBanner } from './utils/auth';
import { updateConfig } from './utils/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

initializeConfig();

const AUTH_REQUIRED = ['parse', 'parse-async'];

const program = new Command();

program
  .name('pdf2markdown')
  .description('Convert PDF and image documents to Markdown (alias: pdf2md)')
  .version(pkg.version)
  .option('-k, --api-key <key>', 'API key (or set PDF2MARKDOWN_API_KEY)')
  .option('--api-url <url>', 'API base URL')
  .option('--check', 'Show version and auth status (use "status" command or --check)')
  .hook('preAction', async (thisCommand, actionCommand) => {
    const globalOpts = thisCommand.opts();
    if (globalOpts.apiKey) updateConfig({ apiKey: globalOpts.apiKey });
    if (globalOpts.apiUrl) updateConfig({ apiUrl: globalOpts.apiUrl });

    const name = actionCommand.name();
    if (AUTH_REQUIRED.includes(name)) {
      try {
        await ensureAuthenticated();
      } catch {
        console.error(
          'Not authenticated. Run "pdf2markdown login" or set PDF2MARKDOWN_API_KEY.'
        );
        process.exit(1);
      }
    }
  });

const parseCmd = new Command('parse')
  .description('Parse PDF or image to Markdown (sync, files up to ~30MB)')
  .argument('[files...]', 'File path(s) to parse')
  .option('-u, --url <url>', 'Parse from URL instead of file')
  .option('-o, --output <path>', 'Output path or directory')
  .option('-f, --format <mode>', 'markdown | json | all', 'all')
  .option('--page-images', 'Include page preview image URLs')
  .option('--json', 'Force JSON output')
  .option('--pretty', 'Pretty-print JSON')
  .action(async (files: string[], opts, cmd) => {
    const global = cmd.parent?.opts?.() || {};
    await handleParseCommand({
      files: files.length ? files : undefined,
      url: opts.url,
      output: opts.output,
      format: opts.format,
      pageImages: opts.pageImages,
      json: opts.json,
      pretty: opts.pretty,
      apiKey: global.apiKey,
      apiUrl: global.apiUrl,
    });
  });

const parseAsyncCmd = new Command('parse-async')
  .description('Parse large files asynchronously (up to 100MB)')
  .argument('[file-or-task-id]', 'File path, URL, or task ID')
  .option('-u, --url <url>', 'Parse from URL')
  .option('--status', 'Check task status')
  .option('--result', 'Get task result')
  .option('-o, --output <path>', 'Output path')
  .option('--wait', 'Wait for completion')
  .option('--poll-interval <seconds>', 'Poll interval when waiting', parseFloat)
  .option('--timeout <seconds>', 'Timeout when waiting', parseFloat)
  .action(async (arg: string, opts, cmd) => {
    const global = cmd.parent?.opts?.() || {};
    const isTaskId = arg && /^task_/.test(arg);
    await handleParseAsyncCommand({
      file: !opts.url && arg && !isTaskId ? arg : undefined,
      url: opts.url,
      taskId: isTaskId ? arg : undefined,
      status: opts.status,
      result: opts.result,
      output: opts.output,
      wait: opts.wait,
      pollInterval: opts.pollInterval,
      timeout: opts.timeout,
      apiKey: global.apiKey,
      apiUrl: global.apiUrl,
    });
  });

program.addCommand(parseCmd);
program.addCommand(parseAsyncCmd);

program.command('login').description('Login with API key').option('-k, --api-key <key>', 'API key').option('--api-url <url>', 'API URL').action(handleLoginCommand);

program.command('logout').description('Clear stored credentials').action(handleLogoutCommand);

program
  .command('config')
  .description('Configure API key and URL')
  .option('-k, --api-key <key>', 'API key')
  .option('--api-url <url>', 'API URL')
  .action(configure);

program.command('view-config').description('View current config').action(viewConfig);

program
  .command('init')
  .description('Install CLI, authenticate, and install skills')
  .option('--all', 'Install to all agents')
  .option('-y, --yes', 'Non-interactive')
  .option('--skip-install', 'Skip global install')
  .option('--skip-auth', 'Skip auth')
  .option('--skip-skills', 'Skip skills')
  .option('-k, --api-key <key>', 'API key')
  .action(handleInitCommand);

program
  .command('setup')
  .description('Set up integrations (skills for Cursor, Codex, etc.)')
  .argument('<subcommand>', 'skills')
  .option('-a, --agent <name>', 'Target agent only: cursor, codex, claude, opencode, agents, windsurf, continue, project')
  .action(async (sub: string, opts: { global?: boolean; agent?: string }) => {
    if (sub !== 'skills') {
      console.error('Unknown subcommand. Use: skills');
      process.exit(1);
    }
    await handleSetupCommand('skills' as SetupSubcommand, opts);
  });

program.command('status').description('Show version and auth status').action(handleStatusCommand);

program.command('version').description('Show version').action(() => handleVersionCommand());

const args = process.argv.slice(2);

async function main(): Promise<void> {
  // Global --check shows CLI status (avoids conflict with parse-async --status)
  if (args[0] === '--check') {
    await handleStatusCommand();
    return;
  }

  if (args.length === 0) {
    if (!require('./utils/auth').isAuthenticated()) {
      await ensureAuthenticated();
    }
    printBanner();
    console.log('  Try: pdf2markdown document.pdf -o output.md');
    console.log('       pdf2md document.pdf -o .pdf2markdown/out.md');
    console.log('');
    program.outputHelp();
    return;
  }

  const first = args[0];
  const looksLikeFile =
    !first.startsWith('-') &&
    (first.endsWith('.pdf') ||
      /\.(png|jpg|jpeg|gif|webp|tiff|bmp)$/i.test(first));

  if (looksLikeFile && args[0] !== 'parse' && args[0] !== 'parse-async') {
    args.unshift('parse');
  }

  await program.parseAsync([process.argv[0], process.argv[1], ...args]);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
