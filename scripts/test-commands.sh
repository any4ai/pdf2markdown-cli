#!/bin/bash
# PDF2Markdown CLI test commands
# Run: bash scripts/test-commands.sh
# Requires login or PDF2MARKDOWN_API_KEY

set -e
CLI="node dist/index.js"

echo "=== 1. Basic commands (no API key) ==="
$CLI --help
$CLI version
$CLI status

echo ""
echo "=== 2. Parse (sync) ==="
echo "From URL (requires network):"
# $CLI parse --url "https://pdf2markdown.io/sample.pdf" -o .pdf2markdown/from-url.md

echo "From local file:"
echo "  $CLI parse your-file.pdf -o .pdf2markdown/output.md"
echo "  $CLI parse file1.pdf file2.png -o .pdf2markdown/"

echo ""
echo "=== 3. Parse-async (large files) ==="
echo "Submit task (large file):"
echo "  $CLI parse-async large.pdf"
echo ""
echo "Check status:"
echo "  $CLI parse-async <task_id> --status"
echo ""
echo "Get result (use -o to save):"
echo "  $CLI parse-async <task_id> --result -o .pdf2markdown/result.md"
echo ""
echo "Submit and wait:"
echo "  $CLI parse-async large.pdf --wait -o .pdf2markdown/output.md"

echo ""
echo "=== 4. Full flow example ==="
echo "# 1) Login"
echo "  $CLI login --api-key \"p2m_live_xxx\""
echo ""
echo "# 2) Sync parse (small file)"
echo "  mkdir -p .pdf2markdown"
echo "  $CLI parse document.pdf -o .pdf2markdown/doc.md"
echo ""
echo "# 3) Async parse (large file)"
echo "  $CLI parse-async large.pdf"
echo "  # Note the task_id, then:"
echo "  $CLI parse-async <task_id> --status"
echo "  $CLI parse-async <task_id> --result -o .pdf2markdown/result.md"
echo ""
echo "# Or wait in one command"
echo "  $CLI parse-async large.pdf --wait -o .pdf2markdown/output.md"
