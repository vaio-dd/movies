#!/usr/bin/env node
/**
 * Movie Poster Fetcher using TMDB API
 * Free API with good international title support
 */

const fs = require('fs');
const https = require('https');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Get free key at https://www.themoviedb.org/settings/api
const DELAY_MS = 100; // Rate limit

// Read movies data
let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// TMDB API functions
function fetchFromTMDB(title, year) {
    return new Promise((resolve) => {
        // Search for movie
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
        
        https.get(searchUrl, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0) {
                        const movie = result.results[0];
                        if (movie.poster_path) {
                            const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                            resolve(posterUrl);
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// Fallback: generate nice placeholder
function generatePlaceholder(title) {
    const colors = [
        '1a237e', '283593', '2e7d32', 'c62828', '4a148c',
        'e65100', '006064', '3e2723', '33691e', 'ad1457'
    ];
    const hash = title.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const color = colors[Math.abs(hash) % colors.length];
    return `https://placehold.co/200x300/${color}/ffffff?text=${encodeURIComponent(title.substring(0, 20))}`;
}

async function fetchAllPosters() {
    console.log(`Processing ${movies.length} movies...\n`);
    
    let updated = 0;
    let fallback = 0;
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        console.log(`[${i + 1}/${movies.length}] ${movie.title} (${movie.year})...`);
        
        let posterUrl = null;
        
        // Try TMDB if API key is set
        if (TMDB_API_KEY !== 'YOUR_TMDB_API_KEY') {
            posterUrl = await fetchFromTMDB(movie.title, movie.year);
        }
        
        // Fallback to placeholder if no poster found
        if (!posterUrl) {
            posterUrl = generatePlaceholder(movie.title);
            fallback++;
        }
        
        movie.poster = posterUrl;
        if (posterUrl && !posterUrl.includes('placehold.co')) {
            updated++;
        }
        
        await sleep(DELAY_MS);
        
        // Save progress
        if ((i + 1) % 50 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`Progress saved (${updated} real posters, ${fallback} placeholders)\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    console.log(`\nDone! ${updated} real posters, ${fallback} placeholders`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
