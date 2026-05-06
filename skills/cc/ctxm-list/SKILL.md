---
name: ctxm-list
description: "Show all summary files loaded into the current session via ctxm-init or ctxm-load."
argument-hint: "(no args)"
allowed-tools:
  - Bash
---

# ctxm-list

Shows all summary files loaded into the current session.

## Steps

Run:
```bash
node ${CLAUDE_SKILL_DIR}/ctxm.js list-loaded
```

Present the output to the user as-is.
