const fs = require('fs');
const path = require('path');
const https = require('https');

// Read existing movies data
const moviesData = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));

const outputFile = './data/movies_updated.json';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPoster(movieTitle, year) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${movieTitle} ${year} movie poster`);
    const url = `https://v2.sg.media-imdb.com/suggestion/p/${query}.json`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const suggestions = JSON.parse(data);
          if (suggestions && suggestions.length > 0) {
            // Get the poster image URL from the suggestion
            const posterUrl = `https://m.media-amazon.com/images/M/${suggestions[0].i.imageUrl.split('/').pop()}`;
            resolve(posterUrl);
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

async function updatePosters() {
  console.log(`Updating posters for ${moviesData.length} movies...`);
  
  let updated = 0;
  for (let i = 0; i < moviesData.length; i++) {
    const movie = moviesData[i];
    console.log(`[${i+1}/${moviesData.length}] ${movie.title}...`);
    
    const poster = await fetchPoster(movie.title, movie.year);
    if (poster) {
      movie.poster = poster;
      updated++;
    }
    
    // Rate limiting - be nice to IMDb
    await delay(300);
    
    // Save progress every 10 movies
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(outputFile, JSON.stringify(moviesData, null, 2));
      console.log(`Progress saved (${updated} posters updated)`);
    }
  }
  
  // Final save
  fs.writeFileSync(outputFile, JSON.stringify(moviesData, null, 2));
  console.log(`\nDone! Updated ${updated} posters`);
}

updatePosters();
