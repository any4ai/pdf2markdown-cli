# PDF2Markdown CLI

Convert PDF and image documents to clean Markdown. Also available as `pdf2md`.

## Skills (AI Coding Agents)

Install PDF2Markdown skills for Cursor, Codex, Claude Code, OpenCode, etc., so agents can convert PDFs to markdown via the CLI.

```bash
# Install to all detected agents
pdf2markdown setup skills
# or
pdf2md setup skills

# Install to a specific agent
pdf2markdown setup skills --agent cursor
pdf2md setup skills --agent opencode
```

**Supported agents:** `cursor`, `codex`, `claude`, `opencode`, `agents`, `windsurf`, `continue`, `project` (project installs to `.cursor/skills` and `.opencode/skills`).

See [skills/pdf2markdown-cli/rules/install.md](skills/pdf2markdown-cli/rules/install.md) for full setup.

---

## Installation

Supports macOS, Windows, and Linux.

```bash
# npm
npm install -g pdf2markdown-cli

# pnpm / yarn
pnpm add -g pdf2markdown-cli
yarn global add pdf2markdown-cli
```

Or use without installing:

```bash
npx -y pdf2markdown-cli document.pdf -o output.md
```

After global install, both `pdf2markdown` and `pdf2md` are available.

One-shot setup (install, auth, and skills):

```bash
npx -y pdf2markdown-cli init -y
```

## Quick start

1. Get your API key from [pdf2markdown.io/dashboard](https://pdf2markdown.io/dashboard).
2. Login:

   ```bash
   pdf2markdown login
   # or
   pdf2markdown login --api-key "p2m_live_xxxx"
   ```

3. Convert a document:

   ```bash
   pdf2markdown document.pdf -o output.md
   pdf2md document.pdf -o .pdf2markdown/output.md
   ```

## Commands

Use `pdf2markdown` or `pdf2md` (same CLI):

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `parse`        | Sync parse (files up to ~30MB)       |
| `parse-async`  | Async parse for large files (100MB)  |
| `login`        | Authenticate with API key            |
| `logout`       | Clear credentials                    |
| `status`       | Show version and auth status         |
| `init`         | Install CLI, auth, and skills        |
| `setup skills` | Install skills for AI coding agents  |
| `setup skills --agent <name>` | Install to specific agent  |

## Examples

Both `pdf2markdown` and `pdf2md` work the same:

```bash
# Shorthand: file as first argument
pdf2markdown document.pdf -o output.md
pdf2md document.pdf -o .pdf2markdown/output.md

# From URL
pdf2markdown parse --url "https://example.com/doc.pdf" -o doc.md

# Multiple files
pdf2markdown parse file1.pdf file2.png -o .pdf2markdown/

# Large file (async) — submit and wait
pdf2markdown parse-async large.pdf --wait -o output.md

# Or step by step: submit → status → result
pdf2md parse-async large.pdf
pdf2md parse-async task_xxx --status
pdf2md parse-async task_xxx --result -o output.md
```

## Supported formats

PDF, JPEG, PNG, GIF, WebP, TIFF, BMP

## Testing

```bash
pnpm run build
pnpm run test
```

See [TESTING.md](TESTING.md) for details.

## Documentation

- [PDF2Markdown API Docs](https://pdf2markdown.io/docs)
- [Parse Documents](https://pdf2markdown.io/docs/parse)
