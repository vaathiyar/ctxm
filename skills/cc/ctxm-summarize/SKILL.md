---
name: ctxm-summarize
description: "Capture non-recoverable context from the current session into the active branch's summary.md."
argument-hint: "(no args)"
allowed-tools:
  - Bash
---

# ctxm-summarize

Captures non-recoverable context from the current session. Run before ending a branch session.

## Steps

1. Run `node ${CLAUDE_SKILL_DIR}/ctxm.js get` to get the active branch name.

2. Scan the conversation from the most recent `<!-- ctxm-session-start -->` marker to now.
   If no marker exists, scan from the start of the conversation.

3. Extract ONLY information that meets ALL of these criteria:
   - Was decided, discussed, or discovered in this window
   - Cannot be recovered by reading the codebase, files, configs, or documentation
   - A future session or sibling branch would benefit from knowing it

   **Include:**
   - Decisions and their reasoning (why A over B, what would change the decision)
   - Rejected alternatives and why (the most commonly lost context)
   - Discovered constraints (limits, edge cases, compatibility issues)
   - Open questions (unresolved, needs future input)
   - Cross-branch dependencies ("this branch assumes X about branch Y")
   - User preferences or opinions that shaped the work

   **Exclude:**
   - Code, functions, class names, implementation details — recoverable from files
   - File paths, directory structures — recoverable from filesystem
   - Config values, env vars, dependency versions — recoverable from config
   - General technology knowledge — recoverable from docs
   - Play-by-play of the conversation
   - Summaries of what was built

   **The test:** If someone could recover this by reading the codebase and its docs, exclude it.

4. Prepend a **single-line TL;DR** at the very top summarising the session in one sentence.

5. Format as:
   ```markdown
   TL;DR: <one sentence summary>

   # <branch> — Session (YYYY-MM-DD)

   <extracted context in natural language>
   ```

6. Show the draft to the user and ask: "Any edits before I save?"

7. After the user approves or provides edits, append via stdin:
   ```bash
   node ${CLAUDE_SKILL_DIR}/ctxm.js append-summary <<'EOF'
   TL;DR: <summary>

   # <branch> — Session (YYYY-MM-DD)

   <content>
   EOF
   ```

8. Report the file path that was updated (printed by the script).
