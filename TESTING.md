# PDF2Markdown CLI Testing Guide

## Prerequisites

- Node.js >= 18
- PDF2Markdown API key: https://pdf2markdown.io/dashboard

## Quick start

```bash
pnpm install && pnpm run build
node dist/index.js login --api-key "p2m_live_xxxx"
```

---

## 1. Basic commands (no API key required)

```bash
node dist/index.js --help
node dist/index.js version
node dist/index.js status

node dist/index.js parse --help
node dist/index.js parse-async --help
```

---

## 2. Authentication

```bash
# Login
node dist/index.js login --api-key "p2m_live_xxxx"

# View config
node dist/index.js view-config

# Logout
node dist/index.js logout
```

---

## 3. Parse (sync, files up to ~30MB)

```bash
mkdir -p .pdf2markdown

# Local file
node dist/index.js parse document.pdf -o .pdf2markdown/doc.md

# From URL
node dist/index.js parse --url "https://example.com/sample.pdf" -o .pdf2markdown/out.md

# Shorthand
node dist/index.js document.pdf -o .pdf2markdown/doc.md
```

---

## 4. Parse-async (large files, up to 100MB)

### 4.1 Step by step: submit → check status → get result

```bash
# 1) Submit task
node dist/index.js parse-async large.pdf
# Output: Task submitted: task_xxx

# 2) Check status
node dist/index.js parse-async task_xxx --status

# 3) Get result (use -o to save)
node dist/index.js parse-async task_xxx --result -o .pdf2markdown/result.md
```

### 4.2 One-shot: submit and wait

```bash
node dist/index.js parse-async large.pdf --wait -o .pdf2markdown/output.md
```

### 4.3 Parse-async from URL

```bash
node dist/index.js parse-async --url "https://example.com/large.pdf" --wait -o .pdf2markdown/out.md
```

---

## 5. Full test flow

```bash
# 1. Build
pnpm run build

# 2. Login
node dist/index.js login --api-key "YOUR_API_KEY"

# 3. Sync parse
node dist/index.js parse your.pdf -o .pdf2markdown/sync.md

# 4. Async parse (large file)
node dist/index.js parse-async your.pdf
# Note the task_id, then when complete:
node dist/index.js parse-async task_xxx --status
node dist/index.js parse-async task_xxx --result -o .pdf2markdown/async.md

# Or wait in one command
node dist/index.js parse-async your.pdf --wait -o .pdf2markdown/async.md
```

---

## 6. Automated tests (no API calls)

```bash
pnpm run test
```

---

## 7. Global install

```bash
npm install -g .
pdf2markdown status
pdf2md document.pdf -o out.md
```
