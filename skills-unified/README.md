# skills-unified

Single-skill variant for platforms that don't support skill composition (e.g. Clawhub).

Contains one self-contained skill with full parse + parse-async documentation. Copy `pdf2markdown/` to the agent's skills directory.

```bash
# Example: Clawhub
cp -r skills-unified/pdf2markdown /path/to/clawhub/skills/
```

For multi-skill platforms (Cursor, Codex, etc.), use `skills/` instead and run `pdf2markdown setup skills`.
