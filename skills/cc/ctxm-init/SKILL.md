---
name: ctxm-init
description: "Start a new ctxm branch session: sets the active tree-branch-name, silently loads parent context into context, and emits a session-start marker."
argument-hint: "[tree-branch-name] — e.g. auth/token-storage"
allowed-tools:
  - Bash
---

# ctxm-init

Starts a new ctxm session for a branch. Run this at the beginning of a work session.

## Steps

1. Run `node ${CLAUDE_SKILL_DIR}/ctxm.js clear` to reset the active branch and clear the loaded list.

2. If `$1` was provided, use it as `<branch>`. Otherwise ask the user:
   > Which branch are you starting? (e.g. `auth/token-storage`)

3. Run `node ${CLAUDE_SKILL_DIR}/ctxm.js set <branch>`.

4. Determine the parent:
   ```bash
   parent=$(node ${CLAUDE_SKILL_DIR}/ctxm.js parent <branch>)
   ```
   - If empty → tell the user: "No parent branch — starting fresh, no prior context loaded."
   - If non-empty → run `node ${CLAUDE_SKILL_DIR}/ctxm.js find-and-read <parent>`.
     The script loads all `summary.md` files recursively under the parent into your context (via Bash tool result) and prints a count line at the end.
     In your text response, report only which files were loaded and the count. **Do not repeat or summarise the file contents** — they are already in your context.

5. Output the session-start marker as a standalone line in your response:
   ```
   <!-- ctxm-session-start branch=<branch> ts=<ISO8601 timestamp> -->
   ```
