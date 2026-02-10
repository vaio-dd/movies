// Movie Gallery Application with Staff Support

let movies = [];
let staff = [];
let filteredMovies = [];
let currentView = 'movies';
let listViewMode = 'ultra-compact'; // 'grid', 'compact', or 'ultra-compact'
let sortOrder = localStorage.getItem('movieGallerySortOrder') || 'DESC'; // 'ASC' (oldest first) or 'DESC' (newest first)
let currentLanguage = localStorage.getItem('movieGalleryLanguage') || 'zh'; // 'zh' for Chinese, 'en' for English
let searchDropdownVisible = false;

// View mode icons
const VIEW_ICONS = {
    'grid': '▦',
    'compact': '☰',
    'ultra-compact': '≡'
};

// Language labels (show current language)
const LANGUAGE_LABELS = {
    'zh': '🇨🇳',
    'en': '🇺🇸'
};

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const staffGrid = document.getElementById('staffGrid');
const searchInput = document.getElementById('search');
const yearFilter = document.getElementById('yearFilter');
const genreFilter = document.getElementById('genreFilter');
const ratingFilter = document.getElementById('ratingFilter');
const viewGrid = document.getElementById('viewGrid');
const viewCompact = document.getElementById('viewCompact');
const viewUltraCompact = document.getElementById('viewUltraCompact');
const resetBtn = document.getElementById('resetFilters');
const noResults = document.getElementById('noResults');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const staffModal = document.getElementById('staffModal');
const staffModalBody = document.getElementById('staffModalBody');
const staffModalClose = document.getElementById('staffModalClose');
const navMovies = document.getElementById('navMovies');
const navStaff = document.getElementById('navStaff');
const searchDropdown = document.getElementById('searchDropdown');
const viewToggle = document.getElementById('viewToggle');
const langToggle = document.getElementById('langToggle');
const searchToggle = document.getElementById('searchToggle');
const sortToggle = document.getElementById('sortToggle');

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('movieGalleryLanguage', currentLanguage);
    updateLanguageButton();
    renderMovies();
    if (currentView === 'movies') {
        populateFilters();
    }
}

// Update language button text
function updateLanguageButton() {
    if (langToggle) {
        langToggle.textContent = LANGUAGE_LABELS[currentLanguage];
        langToggle.title = currentLanguage === 'zh' ? 'Switch to English' : '切换到中文';
    }
}

// Toggle search dropdown
function toggleSearchDropdown() {
    searchDropdownVisible = !searchDropdownVisible;
    if (searchDropdownVisible) {
        searchDropdown.classList.remove('hidden');
        searchToggle.classList.add('active');
        searchInput.focus();
    } else {
        searchDropdown.classList.add('hidden');
        searchToggle.classList.remove('active');
    }
}

// Cycle through view modes
function cycleViewMode() {
    const viewModes = ['grid', 'compact', 'ultra-compact'];
    const currentIndex = viewModes.indexOf(listViewMode);
    const nextIndex = (currentIndex + 1) % viewModes.length;
    listViewMode = viewModes[nextIndex];
    
    // Update toolbar button
    if (viewToggle) {
        viewToggle.textContent = VIEW_ICONS[listViewMode];
    }
    
    // Update view buttons in dropdown
    document.getElementById('viewGrid').classList.toggle('active', listViewMode === 'grid');
    document.getElementById('viewCompact').classList.toggle('active', listViewMode === 'compact');
    document.getElementById('viewUltraCompact').classList.toggle('active', listViewMode === 'ultra-compact');
    
    localStorage.setItem('movieGalleryViewMode', listViewMode);
    renderMovies();
}

// Set specific view mode
function setViewMode(mode) {
    listViewMode = mode;
    
    // Update toolbar button
    if (viewToggle) {
        viewToggle.textContent = VIEW_ICONS[mode];
    }
    
    // Update dropdown buttons
    document.getElementById('viewGrid').classList.toggle('active', mode === 'grid');
    document.getElementById('viewCompact').classList.toggle('active', mode === 'compact');
    document.getElementById('viewUltraCompact').classList.toggle('active', mode === 'ultra-compact');
    
    // Update grid classes
    movieGrid.classList.remove('compact', 'ultra-compact');
    
    localStorage.setItem('movieGalleryViewMode', listViewMode);
    renderMovies();
}

// Helper function to get title based on language
function getLocalizedTitle(movie) {
    if (currentLanguage === 'en' && movie.title_en) {
        return movie.title_en;
    }
    return movie.title;
}

// Helper function to get genre based on language
function getLocalizedGenre(movie) {
    if (currentLanguage === 'en' && movie.genre_en) {
        return movie.genre_en;
    }
    return movie.genre;
}

// Initialize
async function init() {
    try {
        const [moviesRes, staffRes] = await Promise.all([
            fetch('data/movies.json'),
            fetch('data/staff.json')
        ]);
        movies = await moviesRes.json();
        staff = await staffRes.json();
        filteredMovies = [...movies];
        
        // Sort by watch_date descending, then by title alphabetically
        filteredMovies.sort((a, b) => {
            const dateA = a.watch_date || '';
            const dateB = b.watch_date || '';
            
            // Primary sort: watch_date descending
            if (dateB !== dateA) {
                return dateB.localeCompare(dateA);
            }
            
            // Secondary sort: title alphabetically (A-Z)
            return a.title.localeCompare(b.title);
        });
        
        populateFilters();
        renderMovies();
        setupEventListeners();
        updateLanguageButton();
        
        // Restore view mode from localStorage or default to ultra-compact
        listViewMode = localStorage.getItem('movieGalleryViewMode') || 'ultra-compact';
        if (viewToggle) {
            viewToggle.textContent = VIEW_ICONS[listViewMode];
        }
        document.getElementById('viewUltraCompact').classList.toggle('active', listViewMode === 'ultra-compact');
        document.getElementById('viewGrid').classList.toggle('active', listViewMode === 'grid');
        document.getElementById('viewCompact').classList.toggle('active', listViewMode === 'compact');
        
        renderMovies();
    } catch (error) {
        console.error('Failed to load data:', error);
        movieGrid.innerHTML = '<p class="no-results">Failed to load data</p>';
    }
}

// Populate filter dropdowns
function populateFilters() {
    const years = [...new Set(movies.map(m => m.year))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    const allGenres = movies.flatMap(m => m.genre ? m.genre.split(',').map(g => g.trim()) : []);
    const genres = [...new Set(allGenres)].sort();
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// Generate a consistent color based on title
function getColorForTitle(title) {
    const colors = [
        '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5',
        '#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50',
        '#b71c1c', '#c62828', '#d32f2f', '#e53935', '#ef5350',
        '#4a148c', '#6a1b9a', '#7b1fa2', '#8e24aa', '#ab47bc',
        '#e65100', '#f57c00', '#ff9800', '#ffa726', '#ffb74d',
        '#006064', '#00838f', '#0097a7', '#00acc1', '#00bcd4',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getPosterUrl(movie) {
    if (movie.poster) return movie.poster;
    const color = getColorForTitle(movie.title);
    return `https://placehold.co/200x300/${color.replace('#', '')}/ffffff?text=${encodeURIComponent(movie.title)}`;
}

function getStaffImageUrl(staffMember) {
    if (staffMember.image) return staffMember.image;
    const color = getColorForTitle(staffMember.name);
    return `https://placehold.co/200x300/${color.replace('#', '')}/ffffff?text=${encodeURIComponent(staffMember.name.substring(0, 10))}`;
}

// Render movie grid
function renderMovies() {
    if (filteredMovies.length === 0) {
        movieGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Use ultra-compact view by default
    if (listViewMode === 'ultra-compact') {
        renderUltraCompactView();
        return;
    }
    
    // Use compact view
    if (listViewMode === 'compact') {
        renderCompactView();
        return;
    }
    
    movieGrid.classList.remove('compact');
    movieGrid.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card" data-id="${movie.title}">
            <div class="poster-container">
                <img src="${getPosterUrl(movie)}" 
                     alt="${getLocalizedTitle(movie)}" 
                     class="poster"
                     onerror="this.src='${getPosterUrl(movie)}'">
                ${movie.imdb_rating ? `<span class="rating-badge">★ ${movie.imdb_rating}</span>` : ''}
            </div>
            <div class="card-content">
                <h3 class="movie-title">${getLocalizedTitle(movie)}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${movie.year}</span>
                </div>
                ${movie.watch_date ? `<div class="watch-date">📅 ${formatWatchDate(movie.watch_date)}</div>` : ''}
                <div class="card-extra">
                    ${movie.director ? `<div class="card-director">🎬 ${movie.director}</div>` : ''}
                    ${movie.genre ? `<div class="card-genre">${getLocalizedGenre(movie).split(',')[0]}</div>` : ''}
                    ${movie.actors && movie.actors !== '[]' ? `<div class="card-actors">🎭 ${movie.actors.replace(/\[\[|\]\]/g, '')}</div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movie = movies.find(m => m.title === card.dataset.id);
            if (movie) showMovieDetail(movie);
        });
    });
}

// Render compact view - simple list ordered by watch date
function renderCompactView() {
    if (filteredMovies.length === 0) {
        movieGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    movieGrid.classList.add('compact');
    movieGrid.innerHTML = `
        <div class="compact-container">
            ${filteredMovies.map(movie => `
                <div class="compact-item" data-id="${movie.title}">
                    <img src="${getPosterUrl(movie)}" 
                         alt="${getLocalizedTitle(movie)}" 
                         class="compact-poster"
                         onerror="this.src='${getPosterUrl(movie)}'">
                    <div class="compact-info">
                        <span class="compact-title">${getLocalizedTitle(movie)}</span>
                        <div class="compact-meta">
                            <span class="compact-date">${movie.watch_date ? formatWatchDate(movie.watch_date) : ''}</span>
                            ${movie.imdb_rating ? `<span class="compact-rating">★ ${movie.imdb_rating}</span>` : ''}
                            ${movie.genre ? `<span class="compact-genre">${getLocalizedGenre(movie).split(',')[0]}</span>` : ''}
                        </div>
                    </div>
                    <div class="compact-extra">
                        ${movie.director ? `<span class="compact-director" title="${movie.director}">🎬 ${movie.director}</span>` : ''}
                        ${movie.actors && movie.actors !== '[]' ? `<span class="compact-actors" title="${movie.actors.replace(/\[\[|\]\]/g, '')}">🎭 ${movie.actors.replace(/\[\[|\]\]/g, '')}</span>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add click listeners
    document.querySelectorAll('.compact-item').forEach(item => {
        item.addEventListener('click', () => {
            const movie = movies.find(m => m.title === item.dataset.id);
            if (movie) showMovieDetail(movie);
        });
    });
}

// Render ultra-compact view - single line per movie, no posters, grouped by year
function renderUltraCompactView() {
    if (filteredMovies.length === 0) {
        movieGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Sort ALL movies based on sortOrder
    const sortedMovies = [...filteredMovies].sort((a, b) => {
        const dateA = a.watch_date ? a.watch_date.split(' ')[0] : '';
        const dateB = b.watch_date ? b.watch_date.split(' ')[0] : '';
        if (sortOrder === 'ASC') {
            return dateA.localeCompare(dateB); // Oldest first
        } else {
            return dateB.localeCompare(dateA); // Newest first
        }
    });
    
    // Group sorted movies by year from watch_date
    const moviesByYear = {};
    sortedMovies.forEach(movie => {
        let year = 'Unknown';
        if (movie.watch_date) {
            year = movie.watch_date.split(' ')[0].substring(0, 4);
        }
        if (!moviesByYear[year]) {
            moviesByYear[year] = [];
        }
        moviesByYear[year].push(movie);
    });
    
    // Sort years based on sortOrder
    const sortedYears = Object.keys(moviesByYear).sort((a, b) => {
        if (sortOrder === 'ASC') {
            return parseInt(a) - parseInt(b); // Oldest year first
        } else {
            return parseInt(b) - parseInt(a); // Newest year first
        }
    });
    
    movieGrid.classList.add('ultra-compact');
    
    let html = '<div class="ultra-compact-container">';
    let globalCounter = 1;
    
    // Calculate starting number based on sort order
    if (sortOrder === 'DESC') {
        // DESC: newest first = highest number first, so start from total
        globalCounter = sortedMovies.length;
    }
    
    sortedYears.forEach(year => {
        const moviesInYear = moviesByYear[year];
        html += `<div class="ultra-compact-year-header">${year}（${moviesInYear.length}部）</div>`;
        
        moviesInYear.forEach(movie => {
            // Extract MMDD from watch_date
            let mmdd = '';
            if (movie.watch_date) {
                const parts = movie.watch_date.split(' ');
                if (parts.length > 0) {
                    mmdd = parts[0].substring(5);
                }
            }
            
            html += `
                <div class="ultra-compact-item" data-id="${movie.title}">
                    <span class="ultra-num">${globalCounter}.</span>
                    <span class="ultra-title">${getLocalizedTitle(movie)}</span>
                    <span class="ultra-date">${mmdd}</span>
                    <span class="ultra-genre">${movie.genre ? getLocalizedGenre(movie).split(',')[0] : ''}</span>
                </div>
            `;
            
            if (sortOrder === 'ASC') {
                globalCounter++;
            } else {
                globalCounter--;
            }
        });
    });
    
    html += '</div>';
    movieGrid.innerHTML = html;
    
    // Add click listeners
    document.querySelectorAll('.ultra-compact-item').forEach(item => {
        item.addEventListener('click', () => {
            const movie = movies.find(m => m.title === item.dataset.id);
            if (movie) showMovieDetail(movie);
        });
    });
}

// Render staff grid
function renderStaff() {
    if (staff.length === 0) {
        staffGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    staffGrid.innerHTML = staff.map(member => `
        <div class="staff-card" data-name="${member.name}">
            <img src="${getStaffImageUrl(member)}" 
                 alt="${member.name}" 
                 class="staff-photo"
                 onerror="this.src='${getStaffImageUrl(member)}'">
            <div class="staff-info">
                <h3 class="staff-name">${member.name}</h3>
                <span class="staff-role">${member.role || 'Staff'}</span>
                <span class="staff-count">${member.filmography?.length || 0} films</span>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', () => {
            const member = staff.find(s => s.name === card.dataset.name);
            if (member) showStaffDetail(member);
        });
    });
}

// Show movie detail modal
function showMovieDetail(movie) {
    // Create clickable staff links
    const actorLinks = movie.actors ? movie.actors.split(',').map(a => {
        const name = a.trim().replace('[[', '').replace(']]', '');
        const staffMember = staff.find(s => s.name === name);
        if (staffMember) {
            return `<a href="#" class="staff-link" data-staff="${name}">${name}</a>`;
        }
        return name;
    }).join(', ') : '';
    
    const directorLink = movie.director ? (() => {
        const staffMember = staff.find(s => s.name === movie.director);
        if (staffMember) {
            return `<a href="#" class="staff-link" data-staff="${movie.director}">${movie.director}</a>`;
        }
        return movie.director;
    })() : '';
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${getPosterUrl(movie)}" 
                 alt="${getLocalizedTitle(movie)}" 
                 class="modal-poster"
                 onerror="this.src='${getPosterUrl(movie)}'">
            <div class="modal-info">
                <h2>${getLocalizedTitle(movie)}</h2>
                <div class="modal-meta">
                    ${movie.year ? `<span class="meta-tag"><strong>Year:</strong> ${movie.year}</span>` : ''}
                    ${movie.imdb_rating ? `<span class="meta-tag"><strong>Rating:</strong> ★ ${movie.imdb_rating}</span>` : ''}
                    ${movie.genre ? `<span class="meta-tag"><strong>Genre:</strong> ${getLocalizedGenre(movie)}</span>` : ''}
                    ${movie.country ? `<span class="meta-tag"><strong>Country:</strong> ${movie.country}</span>` : ''}
                </div>
            </div>
        </div>
        
        ${directorLink ? `
            <div class="modal-section">
                <h3>Director</h3>
                <p>${directorLink}</p>
            </div>
        ` : ''}
        
        ${actorLinks ? `
            <div class="modal-section">
                <h3>Cast</h3>
                <p>${actorLinks}</p>
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
    
    // Add click listeners for staff links
    document.querySelectorAll('.staff-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const staffName = link.dataset.staff;
            const staffMember = staff.find(s => s.name === staffName);
            if (staffMember) {
                closeModal();
                showStaffDetail(staffMember);
            }
        });
    });
    
    movieModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Show staff detail modal
function showStaffDetail(member) {
    const filmographyList = member.filmography?.map(title => {
        const movie = movies.find(m => m.title === title);
        if (movie) {
            return `<a href="#" class="movie-link" data-movie="${title}">${title} (${movie.year})</a>`;
        }
        return `<span>${title}</span>`;
    }).join(', ') || '';
    
    staffModalBody.innerHTML = `
        <div class="modal-header">
            <img src="${getStaffImageUrl(member)}" 
                 alt="${member.name}" 
                 class="modal-poster"
                 onerror="this.src='${getStaffImageUrl(member)}'">
            <div class="modal-info">
                <h2>${member.name}</h2>
                <div class="modal-meta">
                    ${member.role ? `<span class="meta-tag"><strong>Role:</strong> ${member.role}</span>` : ''}
                    ${member.birth_date ? `<span class="meta-tag"><strong>Born:</strong> ${member.birth_date}</span>` : ''}
                    ${member.birth_place ? `<span class="meta-tag"><strong>Place:</strong> ${member.birth_place}</span>` : ''}
                </div>
            </div>
        </div>
        
        ${member.filmography?.length > 0 ? `
            <div class="modal-section">
                <h3>Filmography (${member.filmography.length} films)</h3>
                <p>${filmographyList}</p>
            </div>
        ` : ''}
    `;
    
    // Add click listeners for movie links
    document.querySelectorAll('.movie-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const movieTitle = link.dataset.movie;
            const movie = movies.find(m => m.title === movieTitle);
            if (movie) {
                closeStaffModal();
                showMovieDetail(movie);
            }
        });
    });
    
    staffModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    movieModal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeStaffModal() {
    staffModal.classList.remove('active');
    document.body.style.overflow = '';
}

function formatWatchDate(dateStr) {
    if (!dateStr) return '';
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

function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const yearValue = yearFilter.value;
    const genreValue = genreFilter.value;
    const ratingValue = ratingFilter.value;
    const viewValue = listViewMode;
    
    filteredMovies = movies.filter(movie => {
        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            (movie.genre && movie.genre.toLowerCase().includes(searchTerm)) ||
            (movie.director && movie.director.toLowerCase().includes(searchTerm));
        
        const matchesYear = !yearValue || movie.year === parseInt(yearValue);
        const matchesGenre = !genreValue || (movie.genre && movie.genre.includes(genreValue));
        const matchesRating = !ratingValue || (movie.imdb_rating && movie.imdb_rating >= parseFloat(ratingValue));
        
        return matchesSearch && matchesYear && matchesGenre && matchesRating;
    });
    
    // Always sort by watch date (descending - newest first), then by title alphabetically
    filteredMovies.sort((a, b) => {
        const dateA = a.watch_date || '';
        const dateB = b.watch_date || '';
        
        // Primary sort: watch_date descending
        if (dateB !== dateA) {
            return dateB.localeCompare(dateA);
        }
        
        // Secondary sort: title alphabetically (A-Z)
        return a.title.localeCompare(b.title);
    });
    
    // Render based on view mode
    if (listViewMode === 'ultra-compact') {
        renderUltraCompactView();
    } else if (listViewMode === 'compact') {
        renderCompactView();
    } else {
        renderMovies();
    }
}

function resetFilters() {
    searchInput.value = '';
    yearFilter.value = '';
    genreFilter.value = '';
    ratingFilter.value = '';
    filteredMovies = [...movies];
    renderMovies();
}

function switchView(view) {
    currentView = view;
    const footerStats = document.getElementById('footerStats');
    
    if (view === 'movies') {
        navMovies.classList.add('active');
        navStaff.classList.remove('active');
        movieGrid.classList.remove('hidden');
        staffGrid.classList.add('hidden');
        searchDropdown.classList.add('hidden');
        searchInput.placeholder = 'Search movies...';
        filteredMovies = [...movies];
        footerStats.textContent = `Movie Gallery • ${movies.length} Movies • ${staff.length} Staff Members`;
        renderMovies();
    } else {
        navMovies.classList.remove('active');
        navStaff.classList.add('active');
        movieGrid.classList.add('hidden');
        staffGrid.classList.remove('hidden');
        searchDropdown.classList.add('hidden');
        searchInput.placeholder = 'Search staff...';
        footerStats.textContent = `Staff Directory • ${staff.length} Staff Members • ${movies.length} Movies`;
        renderStaff();
    }
}

function setupEventListeners() {
    searchInput.addEventListener('input', () => {
        if (currentView === 'movies') {
            filterMovies();
        } else {
            const term = searchInput.value.toLowerCase();
            const filtered = staff.filter(s => 
                s.name.toLowerCase().includes(term) ||
                (s.role && s.role.toLowerCase().includes(term))
            );
            staffGrid.innerHTML = filtered.map(member => `
                <div class="staff-card" data-name="${member.name}">
                    <img src="${getStaffImageUrl(member)}" 
                         alt="${member.name}" 
                         class="staff-photo"
                         onerror="this.src='${getStaffImageUrl(member)}'">
                    <div class="staff-info">
                        <h3 class="staff-name">${member.name}</h3>
                        <span class="staff-role">${member.role || 'Staff'}</span>
                        <span class="staff-count">${member.filmography?.length || 0} films</span>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.staff-card').forEach(card => {
                card.addEventListener('click', () => {
                    const member = staff.find(s => s.name === card.dataset.name);
                    if (member) showStaffDetail(member);
                });
            });
        }
    });
    
    yearFilter.addEventListener('change', filterMovies);
    genreFilter.addEventListener('change', filterMovies);
    ratingFilter.addEventListener('change', filterMovies);
    
    // View buttons in dropdown
    viewGrid.addEventListener('click', () => setViewMode('grid'));
    viewCompact.addEventListener('click', () => setViewMode('compact'));
    viewUltraCompact.addEventListener('click', () => setViewMode('ultra-compact'));
    
    if (sortToggle) {
        sortToggle.addEventListener('click', () => {
            sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
            sortToggle.textContent = sortOrder;
            if (listViewMode === 'ultra-compact') {
                renderUltraCompactView();
            }
        });
    }
    
    resetBtn.addEventListener('click', resetFilters);
    
    navMovies.addEventListener('click', (e) => { e.preventDefault(); switchView('movies'); });
    navStaff.addEventListener('click', (e) => { e.preventDefault(); switchView('staff'); });
    
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => { if (e.target === movieModal) closeModal(); });
    
    staffModalClose.addEventListener('click', closeStaffModal);
    staffModal.addEventListener('click', (e) => { if (e.target === staffModal) closeStaffModal(); });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeStaffModal();
            // Also close search dropdown
            if (searchDropdownVisible) {
                toggleSearchDropdown();
            }
        }
    });
    
    // Toolbar buttons
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
    
    if (viewToggle) {
        viewToggle.addEventListener('click', cycleViewMode);
    }
    
    if (sortToggle) {
        sortToggle.addEventListener('click', () => {
            sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
            localStorage.setItem('movieGallerySortOrder', sortOrder);
            sortToggle.textContent = sortOrder;
            if (listViewMode === 'ultra-compact') {
                renderUltraCompactView();
            }
        });
        // Set initial state
        sortToggle.textContent = sortOrder;
    }
    
    if (searchToggle) {
        searchToggle.addEventListener('click', toggleSearchDropdown);
    }
    
    // Close search dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (searchDropdownVisible && 
            !searchDropdown.contains(e.target) && 
            !searchToggle.contains(e.target)) {
            toggleSearchDropdown();
        }
    });
}

init();
