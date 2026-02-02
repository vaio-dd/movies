const fs = require('fs');
const path = require('path');

function parseMovieFile(content) {
  const movie = {};
  
  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    if (titleMatch) movie.title = titleMatch[1].trim();
    
    const yearMatch = frontmatter.match(/year:\s*(\d{4})/);
    if (yearMatch) movie.year = parseInt(yearMatch[1]);
    
    const watchDateMatch = frontmatter.match(/watch_date:\s*(.+)/);
    if (watchDateMatch) movie.watch_date = watchDateMatch[1].trim();
    
    const imdbRatingMatch = frontmatter.match(/imdb_rating:\s*([\d.]+)/);
    if (imdbRatingMatch) movie.imdb_rating = parseFloat(imdbRatingMatch[1]);
    
    const genreMatch = frontmatter.match(/genre:\s*(.+)/);
    if (genreMatch) movie.genre = genreMatch[1].trim();
    
    const countryMatch = frontmatter.match(/country:\s*(.+)/);
    if (countryMatch) movie.country = countryMatch[1].trim();
    
    const directorMatch = frontmatter.match(/director:\s*(.+)/);
    if (directorMatch) movie.director = directorMatch[1].trim();
    
    const actorsMatch = frontmatter.match(/actors:\s*(.+)/);
    if (actorsMatch) movie.actors = actorsMatch[1].trim();
    
    const plotMatch = frontmatter.match(/plot:\s*([\s\S]*?)(?=\n(?:---|\w+:|$))/);
    if (plotMatch) movie.plot = plotMatch[1].trim();
    
    const memoMatch = frontmatter.match(/memo:\s*(.+)/);
    if (memoMatch) movie.memo = memoMatch[1].trim();
    
    const posterMatch = frontmatter.match(/poster:\s*!\[.*\]\((.+)\)/);
    if (posterMatch) movie.poster = posterMatch[1];
  }
  
  return movie;
}

function parseStaffFile(content, filename) {
  const staff = {
    name: filename.replace('.md', ''),
    filmography: []
  };
  
  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    
    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    if (nameMatch) staff.name = nameMatch[1].trim();
    
    const roleMatch = frontmatter.match(/role:\s*(.+)/);
    if (roleMatch) staff.role = roleMatch[1].trim();
    
    const birthDateMatch = frontmatter.match(/birth_date:\s*(.+)/);
    if (birthDateMatch) staff.birth_date = birthDateMatch[1].trim();
    
    const birthPlaceMatch = frontmatter.match(/birth_place:\s*(.+)/);
    if (birthPlaceMatch) staff.birth_place = birthPlaceMatch[1].trim();
    
    const imageMatch = frontmatter.match(/image:\s*(.+)/);
    if (imageMatch) staff.image = imageMatch[1].trim();
    
    const tmdbIdMatch = frontmatter.match(/tmdb_id:\s*(.+)/);
    if (tmdbIdMatch) staff.tmdb_id = tmdbIdMatch[1].trim();
  }
  
  // Extract filmography from wikilinks
  const filmographyMatches = content.match(/\[\[([^\]]+)\]\]/g);
  if (filmographyMatches) {
    staff.filmography = filmographyMatches.map(link => {
      return link.replace('[[', '').replace(']]', '');
    });
  }
  
  return staff;
}

function parseAllMovies() {
  const moviesDir = path.join(__dirname, '../obsidian/Movies');
  const files = fs.readdirSync(moviesDir).filter(f => f.endsWith('.md'));
  
  const movies = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(moviesDir, file), 'utf8');
    const movie = parseMovieFile(content);
    if (movie.title) {
      movies.push(movie);
    }
  }
  
  return movies;
}

function parseAllStaff() {
  const staffDir = path.join(__dirname, '../obsidian/Staff');
  const files = fs.readdirSync(staffDir).filter(f => f.endsWith('.md'));
  
  const staff = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(staffDir, file), 'utf8');
    const member = parseStaffFile(content, file);
    if (member.name) {
      staff.push(member);
    }
  }
  
  return staff;
}

// Run if executed directly
if (require.main === module) {
  const movies = parseAllMovies();
  fs.writeFileSync(
    path.join(__dirname, 'data/movies.json'),
    JSON.stringify(movies, null, 2)
  );
  console.log(`Parsed ${movies.length} movies`);
  
  const staff = parseAllStaff();
  fs.writeFileSync(
    path.join(__dirname, 'data/staff.json'),
    JSON.stringify(staff, null, 2)
  );
  console.log(`Parsed ${staff.length} staff members`);
}

module.exports = { parseAllMovies, parseAllStaff };
