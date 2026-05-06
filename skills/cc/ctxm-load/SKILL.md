---
name: ctxm-load
description: "Load additional summary context from specified tree paths into the current session. Does not change the active branch."
argument-hint: "<tree-path-1> [tree-path-2 ...] — e.g. auth/rbac other-feature"
allowed-tools:
  - Bash
---

# ctxm-load

Loads summary files from one or more tree paths into the current session context.
Use this when you need context from branches outside the current branch's ancestry.

## Steps

For each path given in `$@`, run:
```bash
node ${CLAUDE_SKILL_DIR}/ctxm.js find-and-read <path>
```

The script reads all `summary.md` files recursively under that path into your context (via Bash tool result) and prints a count line at the end.

In your text response, report only which paths were processed and how many files were loaded per path. **Do not repeat or summarise the file contents** — they are already in your context.

Example user-facing output:
```
Loaded context from `auth/rbac`:
  - .ctxm/branches/auth/rbac/summary.md
  - .ctxm/branches/auth/rbac/permissions/summary.md
(2 file(s))
```
