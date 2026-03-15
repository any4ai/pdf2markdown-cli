/**
 * Parse command - sync PDF/image to Markdown
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseDocument, type ParseResult } from '../utils/client';
import { getApiKey, getApiUrl } from '../utils/config';

export interface ParseCommandOptions {
  files?: string[];
  url?: string;
  output?: string;
  format?: 'markdown' | 'json' | 'all';
  pageImages?: boolean;
  json?: boolean;
  pretty?: boolean;
  apiKey?: string;
  apiUrl?: string;
}

function extractMarkdown(result: ParseResult): string {
  const data = result.data?.result;
  if (!data) return '';
  if (data.markdown) return data.markdown;
  if (data.pages?.length) {
    return data.pages.map((p) => p.md).join('\n\n');
  }
  return '';
}

export async function handleParseCommand(
  options: ParseCommandOptions
): Promise<void> {
  const apiKey = options.apiKey || getApiKey();
  if (!apiKey) {
    console.error('Error: API key required. Run "pdf2markdown login" or set PDF2MARKDOWN_API_KEY.');
    process.exit(1);
  }

  const files = options.files || [];
  const url = options.url;

  if (files.length === 0 && !url) {
    console.error('Error: Provide a file path or --url');
    process.exit(1);
  }

  const outputFormat = options.format || 'all';
  const outputPath = options.output;

  if (url) {
    const result = await parseDocument(
      { input: url, output: outputFormat, pageImages: options.pageImages },
      apiKey,
      options.apiUrl
    );
    outputParseResult(result, outputPath, outputFormat, options.json, options.pretty);
    return;
  }

  for (const file of files) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }

    const buf = fs.readFileSync(resolved);
    const base64 = buf.toString('base64');
    const filename = path.basename(resolved);

    const result = await parseDocument(
      { base64, filename, output: outputFormat, pageImages: options.pageImages },
      apiKey,
      options.apiUrl
    );

    const outPath = outputPath
      ? (files.length > 1
          ? path.join(outputPath, filename.replace(/\.\w+$/, '.md'))
          : outputPath)
      : undefined;
    outputParseResult(result, outPath, outputFormat, options.json, options.pretty);
  }
}

function outputParseResult(
  result: ParseResult,
  outputPath?: string,
  format?: string,
  forceJson?: boolean,
  pretty?: boolean
): void {
  const data = result.data?.result;
  if (!data) {
    console.error('No result from API');
    process.exit(1);
  }

  const wantsJson = forceJson || format === 'json';
  const out = wantsJson
    ? JSON.stringify(data, null, pretty ? 2 : undefined)
    : data.markdown ?? data.pages?.map((p) => p.md).join('\n\n') ?? '';

  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, out, 'utf-8');
    console.log(`Saved to ${outputPath}`);
  } else {
    console.log(out);
  }
}
