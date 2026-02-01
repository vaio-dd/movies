#!/usr/bin/env node
/**
 * Watch Obsidian Movies folder and auto-update the website data
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const OBSIDIAN_PATH = '/home/oem/.openclaw/workspace-movie/obsidian/Movies';
const PARSE_SCRIPT = './parse-movies.js';
const SERVER_RESTART = 'pkill -f "node server.js" 2>/dev/null; node server.js &';

let debounceTimer = null;

// Check if Obsidian Movies folder exists
if (!fs.existsSync(OBSIDIAN_PATH)) {
    console.log(`[Watch] Obsidian Movies folder not found: ${OBSIDIAN_PATH}`);
    console.log('[Watch] Waiting for folder to appear...');
    
    // Check periodically
    const checkInterval = setInterval(() => {
        if (fs.existsSync(OBSIDIAN_PATH)) {
            clearInterval(checkInterval);
            console.log('[Watch] Obsidian Movies folder detected, starting watch...');
            startWatch();
        }
    }, 5000);
    return;
}

startWatch();

function startWatch() {
    console.log(`[Watch] Watching for changes in: ${OBSIDIAN_PATH}`);
    console.log('[Watch] Press Ctrl+C to stop\n');
    
    // Initial parse
    runParse();
    
    // Watch for file changes
    fs.watch(OBSIDIAN_PATH, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        console.log(`[Watch] Detected change: ${eventType} - ${filename}`);
        
        // Debounce to avoid multiple rapid updates
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
            runParse();
        }, 1000);
    });
}

function runParse() {
    console.log('[Watch] Parsing movies from Obsidian...');
    
    exec(`node ${PARSE_SCRIPT}`, (error, stdout, stderr) => {
        if (error) {
            console.error('[Watch] Parse error:', error.message);
            return;
        }
        
        if (stderr) {
            console.error('[Watch] Parse stderr:', stderr);
        }
        
        console.log('[Watch] Parse complete, restarting server...');
        
        // Restart server to pick up changes
        exec(SERVER_RESTART, (err) => {
            if (err) {
                console.error('[Watch] Server restart error:', err.message);
                return;
            }
            console.log('[Watch] Server restarted successfully!\n');
        });
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Watch] Stopping watch...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[Watch] Stopping watch...');
    process.exit(0);
});
