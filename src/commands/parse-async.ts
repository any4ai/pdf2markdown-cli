/**
 * Parse-async command - async PDF/image parsing for large files
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  parseDocumentAsync,
  getTaskStatus,
  getTaskResult,
} from '../utils/client';
import { getApiKey } from '../utils/config';

function parseStatus(res: Awaited<ReturnType<typeof getTaskStatus>>): string {
  const s = res as { data?: { status?: string }; status?: string };
  return s.data?.status ?? s.status ?? 'unknown';
}

function clearStatusLine() {
  process.stdout.write('\r\x1b[K');
}

async function pollUntilCompleted(
  taskId: string,
  apiKey: string,
  options: ParseAsyncCommandOptions
): Promise<string> {
  const pollInterval = (options.pollInterval ?? 5) * 1000;
  const timeout = options.timeout ? options.timeout * 1000 : 0;
  const start = Date.now();

  while (true) {
    if (timeout && Date.now() - start > timeout) {
      throw new Error('Timeout waiting for task');
    }
    const statusRes = await getTaskStatus(taskId, apiKey, options.apiUrl);
    const status = parseStatus(statusRes);
    if (status === 'completed') return taskId;
    if (status === 'failed') {
      throw new Error('Task failed');
    }
    process.stdout.write(`  Status: ${status}...\r`);
    await new Promise((r) => setTimeout(r, pollInterval));
  }
}

export interface ParseAsyncCommandOptions {
  file?: string;
  url?: string;
  taskId?: string;
  status?: boolean;
  result?: boolean;
  output?: string;
  wait?: boolean;
  pollInterval?: number;
  timeout?: number;
  format?: 'markdown' | 'json' | 'all';
  apiKey?: string;
  apiUrl?: string;
}

export async function handleParseAsyncCommand(
  options: ParseAsyncCommandOptions
): Promise<void> {
  const apiKey = options.apiKey || getApiKey();
  if (!apiKey) {
    console.error('Error: API key required. Run "pdf2markdown login".');
    process.exit(1);
  }

  const taskId = options.taskId;

  if (taskId) {
    if (options.status) {
      const statusRes = await getTaskStatus(taskId, apiKey, options.apiUrl);
      console.log(parseStatus(statusRes));
      return;
    }
    if (options.result) {
      let result = await getTaskResult(taskId, apiKey, options.apiUrl).catch(() => null);
      let md = result?.data?.result
        ? (result.data.result.markdown ?? result.data.result.pages?.map((p: { md?: string }) => p.md).filter(Boolean).join('\n\n') ?? '')
        : '';
      if (options.wait && !md) {
        await pollUntilCompleted(taskId, apiKey, options);
        result = await getTaskResult(taskId, apiKey, options.apiUrl);
        const r = result.data?.result;
        md = r?.markdown ?? r?.pages?.map((p: { md?: string }) => p.md).filter(Boolean).join('\n\n') ?? '';
      } else if (!options.wait && !result) {
        throw new Error('Failed to get result');
      }
      if (options.output) {
        fs.mkdirSync(path.dirname(options.output), { recursive: true });
        fs.writeFileSync(options.output, md, 'utf-8');
        clearStatusLine();
        console.log(`Saved to ${options.output}`);
      } else {
        clearStatusLine();
        if (md) {
          console.log(md);
        } else {
          console.error('Result empty. Use -o to save. Raw:', JSON.stringify(result, null, 2).slice(0, 500));
        }
      }
      return;
    }
  }

  const file = options.file;
  const url = options.url;
  if (!file && !url) {
    console.error('Error: Provide file, --url, or task ID with --status/--result');
    process.exit(1);
  }

  let input: string | undefined;
  let base64: string | undefined;
  let filename: string | undefined;

  if (url) {
    input = url;
  } else if (file) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }
    base64 = fs.readFileSync(resolved).toString('base64');
    filename = path.basename(resolved);
  }

  const submitRes = await parseDocumentAsync(
    { input, base64, filename, output: options.format || 'all' },
    apiKey,
    options.apiUrl
  );

  const id = submitRes.data?.task_id;
  if (!id) {
    console.error('No task_id in response');
    process.exit(1);
  }

  console.log(`Task submitted: ${id}`);

  if (!options.wait) {
    console.log(`Check status: pdf2markdown parse-async ${id} --status`);
    console.log(`Get result:  pdf2markdown parse-async ${id} --result -o output.md`);
    return;
  }

  const pollInterval = (options.pollInterval ?? 5) * 1000;
  const timeout = options.timeout ? options.timeout * 1000 : 0;
  const start = Date.now();

  while (true) {
    if (timeout && Date.now() - start > timeout) {
      console.error('Timeout waiting for task');
      process.exit(1);
    }

    const statusRes = await getTaskStatus(id, apiKey, options.apiUrl);
    const status = parseStatus(statusRes);

    if (status === 'completed') {
      const result = await getTaskResult(id, apiKey, options.apiUrl);
      const md =
        result.data?.result?.markdown ??
        result.data?.result?.pages?.map((p) => p.md).join('\n\n') ??
        '';
      clearStatusLine();
      if (options.output) {
        fs.mkdirSync(path.dirname(options.output), { recursive: true });
        fs.writeFileSync(options.output, md, 'utf-8');
        console.log(`Saved to ${options.output}`);
      } else {
        console.log(md);
      }
      return;
    }

    if (status === 'failed') {
      console.error('Task failed');
      process.exit(1);
    }

    process.stdout.write(`  Status: ${status}...\r`);
    await new Promise((r) => setTimeout(r, pollInterval));
  }
}
