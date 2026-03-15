---
name: pdf2markdown
description: |
  Convert PDF and image documents to clean Markdown via the PDF2Markdown CLI. Use when the user wants to extract text from PDFs, convert PDFs to markdown, parse document structure, or process images (JPEG, PNG, GIF, WebP, TIFF, BMP) into structured content. Also use when they say "convert this PDF", "parse this document", or "extract text from PDF". Must be pre-installed and authenticated.
allowed-tools:
  - Bash(pdf2markdown *)
  - Bash(pdf2md *)
  - Bash(npx pdf2markdown *)
  - Bash(npx pdf2md *)
---

# PDF2Markdown CLI

Convert PDF and image documents to Markdown. Supports both `pdf2markdown` and `pdf2md` commands.

Run `pdf2markdown --help` or `pdf2md <command> --help` for options.

## Prerequisites

Install and authenticate. Check with `pdf2markdown --status`.

```bash
pdf2markdown login
# or set PDF2MARKDOWN_API_KEY
```

Install skills: `pdf2markdown setup skills` (optionally `--agent cursor` for Cursor only).

If not ready, see [rules/install.md](rules/install.md). For output handling, see [rules/security.md](rules/security.md).

## Workflow

1. **Parse (sync)** - Files under ~30MB. Use `parse` or shorthand.
2. **Parse-async** - Large files (up to 100MB). Use `parse-async --wait`.

| Need                | Command        | Skill                                                 |
| ------------------- | -------------- | ----------------------------------------------------- |
| Convert PDF/image   | `parse`        | [pdf2markdown-parse](../pdf2markdown-parse/SKILL.md)   |
| Large file (async)  | `parse-async`  | [pdf2markdown-parse-async](../pdf2markdown-parse-async/SKILL.md) |

## Quick start

```bash
# Shorthand: file as first argument
pdf2markdown document.pdf -o .pdf2markdown/output.md
pdf2md document.pdf -o .pdf2markdown/output.md

# From URL
pdf2markdown parse --url "https://example.com/doc.pdf" -o .pdf2markdown/doc.md

# Multiple files
pdf2markdown parse file1.pdf file2.png -o .pdf2markdown/
```

## Output & Organization

Write results to `.pdf2markdown/` with `-o`. Add `.pdf2markdown/` to `.gitignore`.

```bash
pdf2markdown document.pdf -o .pdf2markdown/doc.md
pdf2markdown parse file1.pdf file2.pdf -o .pdf2markdown/
```

Naming: `.pdf2markdown/{name}.md`. For large outputs, use `grep`, `head`, or incremental reads.

## Documentation

- [PDF2Markdown API Docs](https://pdf2markdown.io/docs)
