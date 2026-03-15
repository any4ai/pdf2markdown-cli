---
name: pdf2markdown-parse-async
description: |
  Parse large PDF/image documents asynchronously (up to 100MB). Use when the file is large, sync parse fails with size error, or the user says "parse async" or "background parse".
allowed-tools:
  - Bash(pdf2markdown *)
  - Bash(pdf2md *)
  - Bash(npx pdf2markdown *)
  - Bash(npx pdf2md *)
---

# pdf2markdown parse-async

Parse large PDF or image files asynchronously. Supports files up to 100MB.

## When to use

- File larger than ~30MB (sync limit)
- Sync parse returns file_too_large error
- User wants background/async processing

## Quick start

```bash
# Submit and wait for result
pdf2markdown parse-async large.pdf --wait -o .pdf2markdown/output.md

# From URL
pdf2markdown parse-async --url "https://cdn.example.com/big.pdf" --wait -o .pdf2markdown/doc.md

# Submit only (no wait)
pdf2markdown parse-async large.pdf
# Returns task_id, then:
pdf2markdown parse-async task_abc123 --status
pdf2markdown parse-async task_abc123 --result -o .pdf2markdown/output.md
```

## Options

| Option                | Description                         |
| --------------------- | ----------------------------------- |
| `-u, --url <url>`     | Parse from URL                       |
| `--status`            | Check task status (with task ID)     |
| `--result`            | Get task result (with task ID)       |
| `-o, --output`        | Output path for result               |
| `--wait`              | Wait for completion before returning|
| `--poll-interval <s>` | Poll interval when waiting (default: 5) |
| `--timeout <s>`       | Timeout when waiting                 |

## Workflow

1. Submit: `pdf2markdown parse-async large.pdf` → receive `task_id`
2. Poll (optional): `pdf2markdown parse-async <task_id> --status`
3. Get result: `pdf2markdown parse-async <task_id> --result -o output.md`

Or use `--wait` to do all in one command.

## See also

- [pdf2markdown-parse](../pdf2markdown-parse/SKILL.md) — sync parse for smaller files
- [pdf2markdown-cli](../pdf2markdown-cli/SKILL.md) — main workflow
