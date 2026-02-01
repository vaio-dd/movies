#!/usr/bin/env node
/**
 * Generate nice colored poster placeholders for all movies
 */

const fs = require('fs');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Nice color palette for movie posters
const colors = [
    { bg: '1a237e', fg: 'ffffff', name: 'Indigo' },
    { bg: '2e7d32', fg: 'ffffff', name: 'Green' },
    { bg: 'c62828', fg: 'ffffff', name: 'Red' },
    { bg: '4a148c', fg: 'ffffff', name: 'Purple' },
    { bg: 'e65100', fg: 'ffffff', name: 'Orange' },
    { bg: '006064', fg: 'ffffff', name: 'Cyan' },
    { bg: '3e2723', fg: 'ffffff', name: 'Brown' },
    { bg: '33691e', fg: 'ffffff', name: 'Olive' },
    { bg: 'ad1457', fg: 'ffffff', name: 'Pink' },
    { bg: '263238', fg: 'ffffff', name: 'Dark' },
    { bg: '1565c0', fg: 'ffffff', name: 'Blue' },
    { bg: '43a047', fg: 'ffffff', name: 'Light Green' },
    { bg: 'fb8c00', fg: 'ffffff', name: 'Amber' },
    { bg: '6d4c41', fg: 'ffffff', name: 'Light Brown' },
    { bg: '5e35b1', fg: 'ffffff', name: 'Deep Purple' },
];

function getColorForMovie(title) {
    // Generate consistent color based on title
    const colors2 = [
        '1a237e', '283593', '303f9f', '3949ab', '3f51b5',
        '1b5e20', '2e7d32', '388e3c', '43a047', '4caf50',
        'b71c1c', 'c62828', 'd32f2f', 'e53935', 'ef5350',
        '4a148c', '6a1b9a', '7b1fa2', '8e24aa', 'ab47bc',
        'e65100', 'f57c00', 'ff9800', 'ffa726', 'ffb74d',
        '006064', '00838f', '0097a7', '00acc1', '00bcd4',
        '4e342e', '5d4037', '6d4c41', '795548', '8d6e63',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = ((hash << 5) - hash) + title.charCodeAt(i);
        hash = hash & hash;
    }
    return colors2[Math.abs(hash) % colors2.length];
}

function generatePosterUrl(title) {
    const bgColor = getColorForMovie(title);
    // Truncate title for URL
    const shortTitle = title.length > 15 ? title.substring(0, 15) + '...' : title;
    return `https://placehold.co/200x300/${bgColor}/ffffff?text=${encodeURIComponent(shortTitle)}`;
}

// Generate posters for all movies
console.log(`Generating posters for ${movies.length} movies...\n`);

movies.forEach((movie, i) => {
    const oldPoster = movie.poster || 'none';
    movie.poster = generatePosterUrl(movie.title);
    console.log(`[${i + 1}/${movies.length}] ${movie.title}`);
});

// Save
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));

console.log(`\nDone! All ${movies.length} movies have colored poster placeholders.`);
