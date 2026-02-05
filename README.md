# Movie Web App Documentation

**Location:** `/home/oem/.openclaw/workspace-movie/website/`
**Created:** 2026-02-05

---

## Overview

A personal movie gallery web application that displays your movie collection with:
- **278 movies** tracked with metadata
- **734 staff members** (actors, directors, crew)
- Search and filter functionality
- Grid and compact list views
- Detail modals for movies and staff
- Poster images from TMDB (The Movie Database)

---

## Project Structure

```
website/
├── index.html              # Main HTML page
├── app.js                  # Frontend JavaScript (20KB)
├── styles.css              # Styling (13KB)
├── server.js               # Simple Node.js static server
├── package.json            # Node dependencies
├── parse-movies.js         # Script to parse movie/staff markdown files
├── fetch-*.js              # Various poster fetching scripts
├── .git/                   # Git repository
├── .gitignore              # Ignores node_modules/, data/, posters/
├── assets/                 # Static assets
└── data/
    ├── movies.json         # Generated movie data (parsed from Obsidian)
    ├── movies.json.backup  # Backup of movie data
    ├── movies_updated.json # Updated movie data
    └── staff.json          # Generated staff data (parsed from Obsidian)
```

---

## Data Source

### Obsidian Vault Integration

The app parses movie and staff data from an **Obsidian vault** located at:
- **Movies:** `../obsidian/Movies/*.md`
- **Staff:** `../obsidian/Staff/*.md`

### Markdown Format

#### Movie Files (`obsidian/Movies/{title}.md`)

```yaml
---
title: Movie Title
year: 2024
watch_date: "2026-01-31 Friday"
imdb_rating: 8.5
genre: Action, Drama, Thriller
country: USA
director: Director Name
actors: [[Actor Name]], [[Another Actor]]
plot: Movie plot summary here.
poster: https://image.tmdb.org/t/p/w500/xxxx.jpg
memo: Personal notes about the movie
---

Additional notes or wikilinks...
```

#### Staff Files (`obsidian/Staff/{name}.md`)

```yaml
---
name: Actor/Director Name
role: Actor
birth_date: 1970-01-01
birth_place: City, Country
image: https://example.com/photo.jpg
tmdb_id: 12345
---

Filmography:
- [[Movie 1]]
- [[Movie 2]]
```

### Parsing Script (`parse-movies.js`)

```bash
node parse-movies.js
```

This script:
1. Reads all `.md` files from `../obsidian/Movies/`
2. Extracts YAML frontmatter
3. Parses: title, year, watch_date, imdb_rating, genre, country, director, actors, plot, poster, memo
4. Writes `data/movies.json`

And similarly for staff:
1. Reads all `.md` files from `../obsidian/Staff/`
2. Extracts: name, role, birth_date, birth_place, image, tmdb_id
3. Parses filmography from wikilinks `[[Movie Name]]`
4. Writes `data/staff.json`

---

## Running the App

### Start the Server

```bash
cd /home/oem/.openclaw/workspace-movie/website
node server.js
```

**Server Details:**
- **Port:** 8080
- **Host:** 0.0.0.0 (accessible from LAN)
- **URL:** http://0.0.0.0:8080/

### Install Dependencies

```bash
npm install
```

Only dependency: `jsdom` (for testing/scripts)

---

## Features

### Movie View

| Feature | Description |
|---------|-------------|
| Search | Filter by title, plot, actors |
| Year Filter | Dropdown of all release years |
| Genre Filter | Dropdown of all genres |
| Rating Filter | 6+, 7+, 8+, 9+ ratings |
| Grid View | Card layout with poster, rating, year |
| Compact View | List layout ordered by watch date |
| Modal Detail | Full movie info: plot, director, actors |

### Staff View

| Feature | Description |
|---------|-------------|
| Browse Staff | Grid of actor/director cards |
| Staff Detail | Role, birth info, filmography |
| Clickable Filmography | Jump to movie details |

### UI Features

- **Color-coded posters:** Consistent colors based on movie title hash
- **Fallback posters:** Auto-generated placeholder if TMDB image missing
- **Responsive:** Works on desktop and mobile
- **Stats footer:** Shows total movies and staff count

---

## API Reference

### JSON Data Files

#### `data/movies.json`

```json
[
  {
    "title": "Movie Title",
    "year": 2024,
    "watch_date": "2026-01-31 Friday",
    "imdb_rating": 8.5,
    "genre": "Action, Drama",
    "country": "USA",
    "director": "Director Name",
    "actors": "[[Actor 1]], [[Actor 2]]",
    "plot": "Plot summary...",
    "poster": "https://image.tmdb.org/t/p/w500/xxx.jpg",
    "memo": "Personal notes"
  }
]
```

#### `data/staff.json`

```json
[
  {
    "name": "Actor Name",
    "role": "Actor",
    "birth_date": "1970-01-01",
    "birth_place": "City, Country",
    "image": "https://example.com/img.jpg",
    "filmography": ["Movie 1", "Movie 2"]
  }
]
```

---

## Poster Fetching Scripts

Various scripts exist for fetching posters from different sources:

| Script | Source |
|--------|--------|
| `fetch-tmdb-posters.js` | TMDB API |
| `fetch-imdb-posters.js` | IMDb |
| `fetch-douban-posters.js` | Douban (Chinese) |
| `fetch-posters.js` | Generic poster fetcher |
| `fetch-posters-v2.js` | Improved generic fetcher |
| `fetch-real-posters.js` | Real poster images |
| `update-posters.js` | Update existing posters |

**Usage:**
```bash
node fetch-tmdb-posters.js
```

---

## Updating Data

### After Adding New Movies in Obsidian

```bash
cd /home/oem/.openclaw/workspace-movie/website
node parse-movies.js
```

This regenerates `data/movies.json` and `data/staff.json` from your Obsidian vault.

### Refresh Posters

```bash
node fetch-tmdb-posters.js
```

---

## Adding New Movies

### Step 1: Create Obsidian Note

Create `obsidian/Movies/{Movie Title}.md`:

```yaml
---
title: New Movie
year: 2024
watch_date: "2026-02-05 Wednesday"
imdb_rating: 7.5
genre: Comedy, Drama
country: USA
director: Director Name
actors: [[Actor 1]]
plot: Brief plot summary.
poster: https://image.tmdb.org/t/p/w500/xxxx.jpg
memo: Watched with family
---
```

### Step 2: Parse Data

```bash
node parse-movies.js
```

### Step 3: Refresh App

The app auto-loads from `data/movies.json` on refresh.

---

## Configuration

### Server Port

Edit `server.js`:

```javascript
const PORT = 8080;  // Change to desired port
```

### Styling

Edit `styles.css` for:
- Colors
- Grid layout
- Card styles
- Modal styles
- Compact view layout

---

## Dependencies

```json
{
  "dependencies": {
    "jsdom": "^27.4.0"
  }
}
```

---

## Known Issues

1. **Missing posters:** Some older movies may not have TMDB posters
2. **Chinese titles:** Some movies use Chinese titles in Obsidian
3. **Actor wikilinks:** Actors use `[[Name]]` format - may not match staff entries exactly

---

## File Sizes

| File | Size | Purpose |
|------|------|---------|
| `data/movies.json` | ~3,500 lines | 278 movies |
| `data/staff.json` | ~8,300 lines | 734 staff |
| `app.js` | ~20KB | Frontend logic |
| `styles.css` | ~13KB | Styling |
| `index.html` | ~3KB | HTML structure |

---

## Tips

1. **Backup data:** `movies.json.backup` exists for recovery
2. **Quick reload:** Server serves static files - just refresh browser
3. **Debug mode:** Check browser console for `console.log` output
4. **Staff consistency:** Use exact names in `[[wikilinks]]` for proper linking

---

## Future Improvements

- [ ] Add movie recommendations
- [ ] Import from CSV/JSON
- [ ] Export functionality
- [ ] Watchlist tracking
- [ ] Rating sorting
- [ ] Dark mode toggle
- [ ] Mobile app version

---

*Document generated 2026-02-05*
