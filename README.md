# ctxm — Cross-Branch Context Manager

A tree-style, cross-branch context manager for non-autonomous AI coding sessions for complex problems.


## Why CTXM ? 
To start off, A complex problem is one that is bigger in nature and ***needs to be broken down*** into multiple sub-problems. 

For ex: building a login flow - session/token management, OAuth integration, password reset, etc. Each with their own decisions and constraints that may impact the others.

The problem is big enough that it has to be broken down into modular sub-problems that have to be worked on, individually. 

If you are working **alongside AI** (non-autonomously), this is usually done via conversation branch/forks to maintain a healthy context window.

But now we are left with context that doesn't get recorded across branches - why option A was chosen over B, which approaches were tried and rejected, constraints discovered mid-session, open questions left for later. This context is lost the moment a branch-session ends.

**ctxm** captures this in particular (ignoring recoverable context like code). Each branch gets a `summary.md` with non-recoverable context from that session. When you start a child branch, ctxm automatically loads the parent's context so that decisions, constraints and information don't get rediscovered.

### Note: This skill is currently incompatible with `/compact` and other AI summarization commands.


## How it works

Branches follow a tree convention. For ex: `auth/session-management` is a child of `auth`. Starting a session on a child automatically loads all context from its ancestors.

The branch name can have any number of nodes like `auth/oauth/provider-selection` for example. The better the tree constructed from the branch names, the better context sharing works.

```
.ctxm/
├── metadata.json
└── branches/
    └── auth/
        ├── oauth/
        │   └── provider-selection/
        │       └── summary.md           ← non-recoverable context from this branch
        ├── session-management/          
        │   └── summary.md
        └── ...
```

`/ctxm-init auth/password-reset` would automatically load the summaries from `session-management`, `oauth/provider-selection`, and any other existing branches **recursively** under `auth/`.

The underlying file-system is the **escape-hatch**. You can simply move/rename branch folders to restructure the tree easily.

## Skills

| Skill | When to use |
|---|---|
| `/ctxm-init [branch]` | Start of a session - sets active branch, loads parent context |
| `/ctxm-summarize` | End of a session - extract and save non-recoverable context |
| `/ctxm-load <path...>` | Load context from arbitrary tree paths at any point in the session |
| `/ctxm-list` | See what summary files are loaded in the current session. For tracking purposes only ! |
| `/ctxm-set <branch>` | Change active branch without resetting loaded context |

## Installation

```bash
bash install.sh
```

This copies the skill directories into `~/.claude/skills/`, making them available globally in Claude Code.

## Porting to other platforms

`shared/ctxm/ctxm.js` is the platform-agnostic core. Each platform needs its own skill wrappers (SKILL.md files) under `skills/<platform>/` that call it via `node`.

- `skills/cc/` — Claude Code
- `skills/codex/` — (WIP)
- `skills/opencode/` — (WIP)


## Why ctxm over something like [ClaudeMem](https://github.com/thedotmack/claude-mem)

The primary difference is in scope and control to the dev. The dev maintains the sub-problem tree based on the initial problem. A well-structured tree keeps additional context scope to minimum while having a higher quality of injected context.
