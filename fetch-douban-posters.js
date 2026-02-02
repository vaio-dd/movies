const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');

const DOUBAN_SUBJECTS = {
  '10号房的客人': '36894887',
  'K-pop恶魔猎人': '35391124',
  '海洋奇旅': '35603727'
};

const TMDB_API_KEY = '9cdd974964ff636a4400576b4000e59f';

async function fetchDoubanPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://movie.douban.com/'
      },
      timeout: 15000
    };

    protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getDoubanImage(doubanId) {
  const url = `https://movie.douban.com/subject/${doubanId}/`;
  const html = await fetchDoubanPage(url);
  
  // Extract poster from og:image or main image
  const ogMatch = html.match(/og:image["\s]+content="([^"]+)"/);
  const imgMatch = html.match(/<img[^>]+id="mainpic"[^>]+src="([^"]+)"/);
  
  if (ogMatch) return ogMatch[1];
  if (imgMatch) return imgMatch[1];
  return null;
}

async function searchTMDB(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url).then(r => r.json());
  return res.results?.[0] || null;
}

async function updateMoviePoster(title, posterUrl) {
  const moviesPath = '/home/oem/.openclaw/workspace-movie/website/data/movies.json';
  const movies = JSON.parse(require('fs').readFileSync(moviesPath, 'utf8'));
  
  const movie = movies.find(m => m.title === title);
  if (movie) {
    movie.poster = posterUrl;
    require('fs').writeFileSync(moviesPath, JSON.stringify(movies, null, 2));
    console.log(`✅ Updated: ${title}`);
  } else {
    console.log(`❌ Not found: ${title}`);
  }
}

async function processMovie(title, doubanId) {
  console.log(`\nProcessing: ${title} (Douban: ${doubanId})`);
  
  // Try Douban first
  const doubanPoster = await getDoubanImage(doubanId);
  if (doubanPoster) {
    await updateMoviePoster(title, doubanPoster);
    return;
  }
  
  // Fallback to TMDB
  const tmdbResult = await searchTMDB(title);
  if (tmdbResult && tmdbResult.poster_path) {
    const tmdbPoster = `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`;
    await updateMoviePoster(title, tmdbPoster);
    return;
  }
  
  console.log(`❌ No poster found for: ${title}`);
}

// Process one movie
(async () => {
  const title = '10号房的客人';
  const doubanId = DOUBAN_SUBJECTS[title];
  
  if (doubanId) {
    await processMovie(title, doubanId);
  }
})();
