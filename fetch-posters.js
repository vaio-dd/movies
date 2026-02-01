#!/usr/bin/env node
/**
 * Movie Poster Fetcher
 * Fetches posters from IMDb using their suggest API with proper rate limiting
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';
const BACKUP_FILE = './data/movies.json.backup';

const DELAY_MS = 200; // Rate limit - 5 requests per second max
const MAX_RETRIES = 3;

// Read movies data
let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup first
fs.writeFileSync(BACKUP_FILE, JSON.stringify(movies, null, 2));
console.log(`Backup created at ${BACKUP_FILE}`);

// Download image and get buffer
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                resolve(null);
                return;
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', () => resolve(null));
        }).on('error', () => resolve(null));
    });
}

// Fetch poster suggestions from IMDb
function fetchPosterFromIMDb(title, year) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${title} ${year} movie poster`);
        const url = `https://v2.sg.media-imdb.com/suggestion/p/${query}.json`;
        
        const req = https.get(url, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const suggestions = JSON.parse(data);
                    if (suggestions && suggestions.length > 0 && suggestions[0].i) {
                        // Get the poster image URL
                        const imageId = suggestions[0].i.imageUrl.split('/').pop();
                        const posterUrl = `https://m.media-amazon.com/images/M/${imageId}`;
                        resolve(posterUrl);
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

// Alternative: Use OMDB API if available
async function fetchFromOMDB(title, year) {
    // This would require an API key - skipping for now
    return null;
}

// Sleep function for rate limiting
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Process all movies
async function fetchAllPosters() {
    let updated = 0;
    let failed = 0;
    let alreadyHad = 0;
    
    console.log(`Processing ${movies.length} movies...\n`);
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        const progress = `[${i + 1}/${movies.length}]`;
        
        // Skip if already has a real IMDb poster
        if (movie.poster && movie.poster.includes('m.media-amazon.com')) {
            alreadyHad++;
            if ((i + 1) % 20 === 0) {
                console.log(`${progress} ${movie.title} - already has poster`);
            }
            continue;
        }
        
        console.log(`${progress} Fetching: ${movie.title} (${movie.year})...`);
        
        let posterUrl = null;
        for (let retry = 0; retry < MAX_RETRIES && !posterUrl; retry++) {
            posterUrl = await fetchPosterFromIMDb(movie.title, movie.year);
            if (!posterUrl && retry < MAX_RETRIES - 1) {
                await sleep(1000); // Wait before retry
            }
        }
        
        if (posterUrl) {
            movie.poster = posterUrl;
            updated++;
        } else {
            failed++;
        }
        
        // Rate limiting
        await sleep(DELAY_MS);
        
        // Save progress every 50 movies
        if ((i + 1) % 50 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress saved: ${updated} updated, ${failed} failed ---\n`);
        }
    }
    
    // Final save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    console.log(`\n========================================`);
    console.log(`Done!`);
    console.log(`  - Already had posters: ${alreadyHad}`);
    console.log(`  - Successfully updated: ${updated}`);
    console.log(`  - Failed: ${failed}`);
    console.log(`  - Total movies: ${movies.length}`);
    console.log(`========================================\n`);
    
    // Print sample of updated movies
    console.log('Sample of updated movies:');
    movies.filter(m => m.poster && m.poster.includes('m.media-amazon.com')).slice(0, 5).forEach(m => {
        console.log(`  - ${m.title} (${m.year})`);
    });
}

fetchAllPosters().catch(console.error);
