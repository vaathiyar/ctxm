---
name: ctxm-set
description: "Set the active tree-branch-name for the current session without resetting loaded context."
argument-hint: "<tree-branch-name> — e.g. auth/token-storage"
allowed-tools:
  - Bash
---

# ctxm-set

Sets the active branch name.

## Steps

Run:
```bash
node ${CLAUDE_SKILL_DIR}/ctxm.js set <$1>
```
