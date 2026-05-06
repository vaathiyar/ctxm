#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

// ── Root resolution ───────────────────────────────────────────────────────────
// Walk up from CWD looking for a .ctxm directory (mirrors how git finds .git).
// Falls back to CWD if none found, so `set` can bootstrap a fresh project.
function findRoot(dir = process.cwd()) {
    while (dir !== path.dirname(dir)) {
        if (fs.existsSync(path.join(dir, '.ctxm'))) return dir;
        dir = path.dirname(dir);
    }
    return process.cwd();
}

const root  = findRoot();
const ctxm  = path.join(root, '.ctxm');
const gmeta = path.join(ctxm, 'metadata.json');

// ── JSON helpers ──────────────────────────────────────────────────────────────
function readJson(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function getKey(file, key) {
    return readJson(file)[key] || '';
}

function setKey(file, key, value) {
    const d = readJson(file);
    d[key] = value;
    writeJson(file, d);
}

function delKey(file, key) {
    if (!fs.existsSync(file)) return;
    const d = readJson(file);
    delete d[key];
    writeJson(file, d);
}

function arrAppend(file, key, value) {
    const d = readJson(file);
    const arr = Array.isArray(d[key]) ? d[key] : [];
    if (!arr.includes(value)) arr.push(value);
    d[key] = arr;
    writeJson(file, d);
}

function arrList(file, key) {
    return readJson(file)[key] || [];
}

// ── File helpers ──────────────────────────────────────────────────────────────
// Recursively find all summary.md files under a directory, sorted by path.
function findSummaries(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    function walk(d) {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name === 'summary.md') results.push(full);
        }
    }
    walk(dir);
    return results.sort();
}

// ── Commands ──────────────────────────────────────────────────────────────────
const [,, cmd, ...args] = process.argv;

switch (cmd) {

    case 'get': {
        // No trailing newline — callers use $() capture which strips it anyway,
        // but being explicit avoids surprises in non-bash contexts.
        process.stdout.write(getKey(gmeta, 'current_branch'));
        break;
    }

    case 'set': {
        const branch = args[0];
        if (!branch) { console.error('ctxm: set requires a branch name'); process.exit(1); }
        fs.mkdirSync(path.join(ctxm, 'branches', branch), { recursive: true });
        setKey(gmeta, 'current_branch', branch);
        break;
    }

    case 'clear': {
        const current = getKey(gmeta, 'current_branch');
        delKey(gmeta, 'current_branch');
        if (current) {
            delKey(path.join(ctxm, 'branches', current, 'metadata.json'), 'loaded');
        }
        break;
    }

    case 'parent': {
        const branch = args[0];
        if (!branch) { console.error('ctxm: parent requires a branch name'); process.exit(1); }
        const p = path.dirname(branch);
        process.stdout.write(p === '.' ? '' : p);
        break;
    }

    case 'find': {
        const branch = args[0];
        if (!branch) { console.error('ctxm: find requires a branch name'); process.exit(1); }
        const paths = findSummaries(path.join(ctxm, 'branches', branch));
        for (const p of paths) console.log(p);
        break;
    }

    case 'find-and-read': {
        const branch = args[0];
        if (!branch) { console.error('ctxm: find-and-read requires a branch name'); process.exit(1); }
        const bdir = path.join(ctxm, 'branches', branch);
        if (!fs.existsSync(bdir)) {
            console.log(`(ctxm: no .ctxm/branches/${branch} directory found — nothing loaded)`);
            break;
        }
        const current = getKey(gmeta, 'current_branch');
        const paths = findSummaries(bdir);
        for (const p of paths) {
            console.log(`=== ${p} ===`);
            process.stdout.write(fs.readFileSync(p, 'utf8'));
            console.log('');
            if (current) {
                arrAppend(path.join(ctxm, 'branches', current, 'metadata.json'), 'loaded', p);
            }
        }
        console.log(`(ctxm: loaded ${paths.length} summary file(s) from ${branch})`);
        break;
    }

    case 'list-loaded': {
        const current = getKey(gmeta, 'current_branch');
        if (!current) { console.log('No active branch. Run: ctxm.sh set <branch>'); break; }
        const bmeta = path.join(ctxm, 'branches', current, 'metadata.json');
        const loaded = arrList(bmeta, 'loaded');
        if (!loaded.length) { console.log('No summary files loaded in this session.'); break; }
        for (const p of loaded) {
            let first = '(file missing)';
            if (fs.existsSync(p)) first = fs.readFileSync(p, 'utf8').split('\n')[0] || '';
            console.log(`  ${p} — ${first}`);
        }
        break;
    }

    case 'append-summary': {
        const current = getKey(gmeta, 'current_branch');
        if (!current) {
            console.error('ctxm: no active branch. Run: ctxm.sh set <branch>');
            process.exit(1);
        }
        const sfile = path.join(ctxm, 'branches', current, 'summary.md');
        fs.mkdirSync(path.dirname(sfile), { recursive: true });
        fs.appendFileSync(sfile, fs.readFileSync(0, 'utf8')); // fd 0 = stdin
        console.log(`(ctxm: appended to ${sfile})`);
        break;
    }

    default: {
        console.log('Usage: ctxm.sh <command> [args]\n');
        console.log('Commands:');
        console.log('  get                     Print active branch name');
        console.log('  set <branch>            Set active branch, create dir');
        console.log('  clear                   Clear active branch + loaded list');
        console.log('  parent <branch>         Print parent path (empty if root)');
        console.log('  find <branch>           List summary.md paths under branch');
        console.log('  find-and-read <branch>  Read all summary.md files under branch into context');
        console.log('  list-loaded             Show files loaded this session');
        console.log('  append-summary          Append stdin to current branch\'s summary.md');
        process.exit(1);
    }
}
