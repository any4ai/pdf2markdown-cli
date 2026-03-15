---
name: pdf2markdown-parse
description: |
  Parse PDF and image documents to Markdown (sync). Use when the user has a file path or URL and wants to convert to markdown, says "convert this PDF", "parse this document", or "extract text from PDF". For files under ~30MB.
allowed-tools:
  - Bash(pdf2markdown *)
  - Bash(pdf2md *)
  - Bash(npx pdf2markdown *)
  - Bash(npx pdf2md *)
---

# pdf2markdown parse

Parse PDF or image to Markdown (synchronous). Returns clean markdown or structured JSON. Files up to ~30MB.

## When to use

- You have a file path or URL
- File size under ~30MB
- Primary workflow step for document conversion

## Quick start

```bash
# File path (shorthand)
pdf2markdown document.pdf -o .pdf2markdown/output.md
pdf2md document.pdf -o .pdf2markdown/output.md

# Explicit parse command
pdf2markdown parse document.pdf -o .pdf2markdown/output.md

# From URL
pdf2markdown parse --url "https://example.com/doc.pdf" -o .pdf2markdown/doc.md

# Multiple files to a directory
pdf2markdown parse file1.pdf file2.png -o .pdf2markdown/

# JSON output
pdf2markdown parse document.pdf --format json -o .pdf2markdown/result.json
```

## Options

| Option              | Description                                   |
| ------------------- | --------------------------------------------- |
| `-u, --url <url>`   | Parse from URL instead of file                 |
| `-o, --output`      | Output path or directory                       |
| `-f, --format`      | markdown, json, all (default: all)             |
| `--page-images`     | Include page preview image URLs                |
| `--json`            | Force JSON output                              |
| `--pretty`          | Pretty-print JSON                             |

## Tips

- Always quote URLs — shell interprets `?` and `&` as special characters.
- For large files (>30MB), use [parse-async](../pdf2markdown-parse-async/SKILL.md).
- Output directory: `.pdf2markdown/`

## See also

- [pdf2markdown-parse-async](../pdf2markdown-parse-async/SKILL.md) — large files (up to 100MB)
- [pdf2markdown-cli](../pdf2markdown-cli/SKILL.md) — main workflow
