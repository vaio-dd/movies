#!/usr/bin/env node
/**
 * Generate beautiful gradient posters with movie info
 */

const fs = require('fs');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Beautiful gradient colors (hex pairs)
const gradients = [
    ['1a237e', '283593'], // Indigo
    ['2e7d32', '388e3c'], // Green
    ['c62828', 'd32f2f'], // Red
    ['4a148c', '7b1fa2'], // Purple
    ['e65100', 'ff9800'], // Orange
    ['006064', '00bcd4'], // Cyan
    ['3e2723', '6d4c41'], // Brown
    ['33691e', '689f38'], // Olive
    ['ad1457', 'f06292'], // Pink
    ['263238', '546e7a'], // Dark Gray
    ['1565c0', '42a5f5'], // Blue
    ['5e35b1', '7e57c2'], // Deep Purple
];

function getGradient(title) {
    const hash = title.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
}

function createPosterUrl(title, year) {
    const [bg1, bg2] = getGradient(title);
    const shortTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
    const text = encodeURIComponent(`${shortTitle}\n(${year})`);
    // Use proper gradient format
    return `https://placehold.co/200x300/${bg1},${bg2}/ffffff?text=${text}&font=roboto&fontSize=12`;
}

console.log(`Generating beautiful posters for ${movies.length} movies...\n`);

let updated = 0;
for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const posterUrl = createPosterUrl(movie.title, movie.year);
    
    if (movie.poster !== posterUrl) {
        movie.poster = posterUrl;
        updated++;
    }
    
    if ((i + 1) % 50 === 0) {
        console.log(`[${i + 1}/${movies.length}] ${movie.title}`);
    }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));

console.log(`\nDone! ${updated} posters updated.`);
