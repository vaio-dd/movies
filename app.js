// Movie Gallery Application

let movies = [];
let filteredMovies = [];

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('search');
const yearFilter = document.getElementById('yearFilter');
const genreFilter = document.getElementById('genreFilter');
const ratingFilter = document.getElementById('ratingFilter');
const resetBtn = document.getElementById('resetFilters');
const noResults = document.getElementById('noResults');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// Initialize
async function init() {
    try {
        const response = await fetch('data/movies.json');
        movies = await response.json();
        filteredMovies = [...movies];
        
        populateFilters();
        renderMovies();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to load movies:', error);
        movieGrid.innerHTML = '<p class="no-results">Failed to load movies</p>';
    }
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique years
    const years = [...new Set(movies.map(m => m.year))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Get unique genres
    const allGenres = movies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : []);
    const genres = [...new Set(allGenres)].sort();
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// Generate a consistent color based on movie title
function getColorForMovie(title) {
    const colors = [
        '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5', // Blue
        '#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50', // Green
        '#b71c1c', '#c62828', '#d32f2f', '#e53935', '#ef5350', // Red
        '#4a148c', '#6a1b9a', '#7b1fa2', '#8e24aa', '#ab47bc', // Purple
        '#e65100', '#f57c00', '#ff9800', '#ffa726', '#ffb74d', // Orange
        '#006064', '#00838f', '#0097a7', '#00acc1', '#00bcd4', // Cyan
        '#4e342e', '#5d4037', '#6d4c41', '#795548', '#8d6e63', // Brown
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Get poster URL or generate colored placeholder
function getPosterUrl(movie) {
    if (movie.poster && movie.poster.includes('m.media-amazon.com')) {
        return movie.poster;
    }
    // Generate placeholder with movie title
    const color = getColorForMovie(movie.title);
    const encodedTitle = encodeURIComponent(movie.title);
    return `https://via.placeholder.com/200x300/${color.replace('#', '')}/ffffff?text=${encodedTitle}`;
}

// Render movie grid
function renderMovies() {
    if (filteredMovies.length === 0) {
        movieGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    movieGrid.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card" data-id="${movie.title}">
            <div class="poster-container">
                <img src="${getPosterUrl(movie)}" 
                     alt="${movie.title}" 
                     class="poster"
                     onerror="this.src='${getPosterUrl(movie)}'">
                ${movie.imdb_rating ? `<span class="rating-badge">★ ${movie.imdb_rating}</span>` : ''}
            </div>
            <div class="card-content">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${movie.year}</span>
                </div>
                ${movie.watch_date ? `<div class="watch-date">📅 ${formatWatchDate(movie.watch_date)}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movie = movies.find(m => m.title === card.dataset.id);
            if (movie) showMovieDetail(movie);
        });
    });
}

// Show movie detail modal
function showMovieDetail(movie) {
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${getPosterUrl(movie)}" 
                 alt="${movie.title}" 
                 class="modal-poster"
                 onerror="this.src='${getPosterUrl(movie)}'">
            <div class="modal-info">
                <h2>${movie.title}</h2>
                <div class="modal-meta">
                    ${movie.year ? `<span class="meta-tag"><strong>Year:</strong> ${movie.year}</span>` : ''}
                    ${movie.imdb_rating ? `<span class="meta-tag"><strong>Rating:</strong> ★ ${movie.imdb_rating}</span>` : ''}
                    ${movie.genre ? `<span class="meta-tag"><strong>Genre:</strong> ${movie.genre}</span>` : ''}
                    ${movie.country ? `<span class="meta-tag"><strong>Country:</strong> ${movie.country}</span>` : ''}
                    ${movie.runtime ? `<span class="meta-tag"><strong>Runtime:</strong> ${movie.runtime} min</span>` : ''}
                </div>
            </div>
        </div>
        
        ${movie.director ? `
            <div class="modal-section">
                <h3>Director</h3>
                <p>${movie.director}</p>
            </div>
        ` : ''}
        
        ${movie.actors ? `
            <div class="modal-section">
                <h3>Cast</h3>
                <p>${movie.actors.replace(/\[\[/g, '').replace(/\]\]/g, '')}</p>
            </div>
        ` : ''}
        
        ${movie.plot ? `
            <div class="modal-section">
                <h3>Plot</h3>
                <p>${movie.plot}</p>
            </div>
        ` : ''}
        
        <div class="watch-info">
            ${movie.watch_date ? `<p><strong>Watched:</strong> ${formatWatchDate(movie.watch_date)}</p>` : ''}
            ${movie.memo ? `<p class="memo-text">📝 Memo: ${movie.memo}</p>` : ''}
        </div>
    `;
    
    movieModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    movieModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Format watch date
function formatWatchDate(dateStr) {
    if (!dateStr) return '';
    // Handle format like "2026-01-31 Friday"
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
        const date = new Date(match[1]);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    return dateStr;
}

// Filter movies
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const yearValue = yearFilter.value;
    const genreValue = genreFilter.value;
    const ratingValue = ratingFilter.value;
    
    filteredMovies = movies.filter(movie => {
        // Search filter
        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            (movie.genre && movie.genre.toLowerCase().includes(searchTerm)) ||
            (movie.director && movie.director.toLowerCase().includes(searchTerm));
        
        // Year filter
        const matchesYear = !yearValue || movie.year === parseInt(yearValue);
        
        // Genre filter
        const matchesGenre = !genreValue || 
            (movie.genre && movie.genre.includes(genreValue));
        
        // Rating filter
        const matchesRating = !ratingValue || 
            (movie.imdb_rating && movie.imdb_rating >= parseFloat(ratingValue));
        
        return matchesSearch && matchesYear && matchesGenre && matchesRating;
    });
    
    renderMovies();
}

// Reset filters
function resetFilters() {
    searchInput.value = '';
    yearFilter.value = '';
    genreFilter.value = '';
    ratingFilter.value = '';
    filteredMovies = [...movies];
    renderMovies();
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterMovies);
    yearFilter.addEventListener('change', filterMovies);
    genreFilter.addEventListener('change', filterMovies);
    ratingFilter.addEventListener('change', filterMovies);
    resetBtn.addEventListener('click', resetFilters);
    
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Start the app
init();
