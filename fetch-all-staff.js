#!/usr/bin/env node
/**
 * Fetch TMDB images for ALL staff from movies
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const TMDB_API_KEY = '9cdd974964ff636a4400576b4000e59f';
const OBSIDIAN_STAFF_DIR = '/home/oem/.openclaw/workspace-movie/obsidian/Staff';
const WEBSITE_DATA_DIR = './data';

// Load movies
const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));

// Collect all unique staff
const staffSet = new Set();

movies.forEach(m => {
    if (m.director) {
        m.director.split(',').forEach(d => {
            const name = d.trim().replace(/\[\[|\]\]/g, '');
            if (name && name !== '[]') staffSet.add(name);
        });
    }
    if (m.actors) {
        m.actors.split(',').forEach(a => {
            const name = a.trim().replace(/\[\[|\]\]/g, '');
            if (name && name !== '[]') staffSet.add(name);
        });
    }
});

const allStaff = Array.from(staffSet).sort();
console.log(`Found ${allStaff.length} unique staff members\n`);

function fetchTMDBImage(name) {
    return new Promise((resolve) => {
        const url = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`;
        
        const req = https.get(url, { timeout: 8000, headers: { 'User-Agent': 'MovieGallery/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0 && result.results[0].profile_path) {
                        resolve({
                            image: `https://image.tmdb.org/t/p/w500${result.results[0].profile_path}`,
                            tmdbId: result.results[0].id,
                            birthDate: result.results[0].birthday || '',
                            birthPlace: result.results[0].place_of_birth || '',
                            knownFor: result.results[0].known_for?.map(m => m.title).slice(0, 3).join(', ') || ''
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

function createStaffNote(name, tmdbInfo) {
    const filename = `${OBSIDIAN_STAFF_DIR}/${name}.md`;
    
    const frontmatter = `---
name: ${name}
role: Staff
birth_date: ${tmdbInfo?.birthDate || ''}
birth_place: ${tmdbInfo?.birthPlace || ''}
image: ${tmdbInfo?.image || ''}
tmdb_id: ${tmdbInfo?.tmdbId || ''}
tags: #staff
---

# ${name}

${tmdbInfo?.image ? `![${name}](${tmdbInfo.image})` : ''}

## Information
${tmdbInfo?.birthDate ? `**Born:** ${tmdbInfo.birthDate}` : ''}
${tmdbInfo?.birthPlace ? `\n**Place:** ${tmdbInfo.birthPlace}` : ''}

## Filmography
`;
    
    // Find films this person worked on
    const filmography = [];
    movies.forEach(m => {
        const directors = (m.director || '').split(',').map(d => d.trim().replace(/\[\[|\]\]/g, ''));
        const actors = (m.actors || '').split(',').map(a => a.trim().replace(/\[\[|\]\]/g, ''));
        
        if (directors.includes(name) || actors.includes(name)) {
            filmography.push(`- [[${m.title}]]`);
        }
    });
    
    const content = frontmatter + filmography.join('\n');
    fs.writeFileSync(filename, content);
}

async function processAllStaff() {
    let found = 0;
    let notFound = 0;
    
    for (let i = 0; i < allStaff.length; i++) {
        const name = allStaff[i];
        process.stdout.write(`[${i + 1}/${allStaff.length}] ${name}... `);
        
        // Check if already has a note with image
        const existingFile = `${OBSIDIAN_STAFF_DIR}/${name}.md`;
        if (fs.existsSync(existingFile)) {
            const existing = fs.readFileSync(existingFile, 'utf8');
            if (existing.includes('image: https://image.tmdb.org')) {
                console.log('✓ already has image');
                found++;
                continue;
            }
        }
        
        const tmdbInfo = await fetchTMDBImage(name);
        
        if (tmdbInfo) {
            createStaffNote(name, tmdbInfo);
            console.log('✓ image fetched');
            found++;
        } else {
            // Create note without image
            createStaffNote(name, null);
            console.log('✗ not found');
            notFound++;
        }
        
        await sleep(250);
        
        // Save progress every 50
        if ((i + 1) % 50 === 0) {
            console.log(`\n--- Progress: ${found} found, ${notFound} not found ---\n`);
        }
    }
    
    console.log(`\n========================================`);
    console.log(`Done!`);
    console.log(`  - With images: ${found}`);
    console.log(`  - Without images: ${notFound}`);
    console.log(`  - Total: ${allStaff.length}`);
    console.log(`========================================\n`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

processAllStaff().catch(console.error);
