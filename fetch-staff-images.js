#!/usr/bin/env node
/**
 * Fetch TMDB images for staff and update Obsidian notes
 */

const fs = require('fs');
const https = require('https');

// TMDB API key
const TMDB_API_KEY = '9cdd974964ff636a4400576b4000e59f';

const STAFF_DIR = '/home/oem/.openclaw/workspace-movie/obsidian/Staff';

// Staff name translations for TMDB search
const staffTranslations = {
    '克里斯托弗·诺兰': 'Christopher Nolan',
    '丹尼尔·克雷格': 'Daniel Craig',
    '史蒂文·斯皮尔伯格': 'Steven Spielberg',
    '周星驰': 'Stephen Chow',
    '基努·里维斯': 'Keanu Reeves',
    '莱昂纳多·迪卡普里奥': 'Leonardo DiCaprio',
    '汤姆·汉克斯': 'Tom Hanks',
    '威尔·史密斯': 'Will Smith',
    '大卫·芬奇': 'David Fincher',
    '罗兰·艾默里奇': 'Roland Emmerich',
    '宫崎骏': 'Hayao Miyazaki',
    '李安': 'Ang Lee',
    '马丁·斯科塞斯': 'Martin Scorsese',
    '张艺谋': 'Yimou Zhang',
    '冯小刚': 'Xiaogang Feng',
    '郭帆': 'Fan Guo',
    '日高范子': 'Noriko Hidaka',
    '系井重里': 'Shigesato Itoi',
    'RARU': 'RARU',
};

// Get all staff files
const staffFiles = fs.readdirSync(STAFF_DIR).filter(f => f.endsWith('.md'));

function fetchTMDBImage(name) {
    return new Promise((resolve) => {
        const englishName = staffTranslations[name] || name;
        const query = encodeURIComponent(englishName);
        const url = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${query}`;
        
        const req = https.get(url, { timeout: 8000, headers: { 'User-Agent': 'MovieGallery/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0 && result.results[0].profile_path) {
                        const imageUrl = `https://image.tmdb.org/t/p/w500${result.results[0].profile_path}`;
                        resolve({ imageUrl, tmdbId: result.results[0].id });
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

async function fetchAllStaffImages() {
    console.log(`Processing ${staffFiles.length} staff members...\n`);
    
    let updated = 0;
    let notFound = 0;
    
    for (let i = 0; i < staffFiles.length; i++) {
        const filename = staffFiles[i];
        const staffName = filename.replace('.md', '');
        console.log(`[${i + 1}/${staffFiles.length}] ${staffName}...`);
        
        const filePath = `${STAFF_DIR}/${filename}`;
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already has TMDB image
        if (content.includes('image.tmdb.org')) {
            console.log(`  ✓ Already has image`);
            continue;
        }
        
        const result = await fetchTMDBImage(staffName);
        
        if (result) {
            // Add image to frontmatter
            const imageLine = `image: ${result.imageUrl}\n`;
            const tmdbLine = `tmdb_id: ${result.tmdbId}\n`;
            
            // Insert after birth_place line
            content = content.replace(
                /(birth_place: .*\n)/,
                `$1${imageLine}${tmdbLine}`
            );
            
            // Add image at top of content
            content = content.replace(
                /(## Filmography)/,
                `![${staffName}](${result.imageUrl})\n\n$1`
            );
            
            fs.writeFileSync(filePath, content);
            updated++;
            console.log(`  ✓ Image added`);
        } else {
            notFound++;
            console.log(`  ✗ Not found on TMDB`);
        }
        
        await sleep(250);
    }
    
    console.log(`\nDone! ${updated} images added, ${notFound} not found`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllStaffImages().catch(console.error);
