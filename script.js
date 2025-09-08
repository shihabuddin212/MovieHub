/**
 * Movie App - Main JavaScript File
 * Handles movie data fetching, search functionality, modal interactions, and UI updates
 */

class MovieApp {
    constructor() {
        this.movies = [];
        this.filteredMovies = [];
        this.isLoading = false;
        this.searchTimeout = null;
        
        // DOM Elements
        this.elements = {
            searchInput: document.getElementById('searchInput'),
            moviesContainer: document.getElementById('moviesContainer'),
            movieModal: document.getElementById('movieModal'),
            closeModal: document.getElementById('closeModal'),
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            noResultsState: document.getElementById('noResultsState'),
            retryBtn: document.getElementById('retryBtn'),
            // Modal elements
            modalPoster: document.getElementById('modalPoster'),
            modalTitle: document.getElementById('modalTitle'),
            modalYear: document.getElementById('modalYear'),
            modalRating: document.getElementById('modalRating'),
            modalGenre: document.getElementById('modalGenre'),
            modalDescription: document.getElementById('modalDescription')
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.loadMovies();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Modal events
        this.elements.closeModal.addEventListener('click', () => {
            this.closeModal();
        });

        this.elements.movieModal.addEventListener('click', (e) => {
            if (e.target === this.elements.movieModal) {
                this.closeModal();
            }
        });

        // Retry button
        this.elements.retryBtn.addEventListener('click', () => {
            this.loadMovies();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });

        // Focus management for accessibility
        this.elements.searchInput.addEventListener('focus', () => {
            this.elements.searchInput.parentElement.classList.add('focused');
        });

        this.elements.searchInput.addEventListener('blur', () => {
            this.elements.searchInput.parentElement.classList.remove('focused');
        });
    }

    /**
     * Load movies from JSON file
     */
    async loadMovies() {
        this.showLoading();
        
        try {
            const response = await fetch('movies.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.movies = data;
            this.filteredMovies = [...this.movies];
            
            this.hideLoading();
            this.renderMovies();
            
        } catch (error) {
            console.error('Error loading movies:', error);
            this.showError();
        }
    }

    /**
     * Handle search input with debouncing
     */
    handleSearch(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search to avoid too many operations
        this.searchTimeout = setTimeout(() => {
            this.searchMovies(query);
        }, 300);
    }

    /**
     * Search movies by title
     */
    searchMovies(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredMovies = [...this.movies];
        } else {
            this.filteredMovies = this.movies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderMovies();
    }

    /**
     * Render movies to the DOM
     */
    renderMovies() {
        if (this.filteredMovies.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideAllStates();
        this.elements.moviesContainer.style.display = 'grid';
        
        // Clear existing content
        this.elements.moviesContainer.innerHTML = '';
        
        // Create movie cards
        this.filteredMovies.forEach((movie, index) => {
            const movieCard = this.createMovieCard(movie, index);
            this.elements.moviesContainer.appendChild(movieCard);
        });
    }

    /**
     * Create a movie card element
     */
    createMovieCard(movie, index) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${movie.title}`);
        
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title} Poster" loading="lazy">
                <div class="movie-rating">${movie.rating}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.year}</p>
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => {
            this.openModal(movie);
        });

        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openModal(movie);
            }
        });

        return card;
    }

    /**
     * Open movie details modal
     */
    openModal(movie) {
        // Populate modal content
        this.elements.modalPoster.src = movie.poster;
        this.elements.modalPoster.alt = `${movie.title} Poster`;
        this.elements.modalTitle.textContent = movie.title;
        this.elements.modalYear.textContent = movie.year;
        this.elements.modalRating.textContent = movie.rating;
        this.elements.modalGenre.textContent = movie.genre;
        this.elements.modalDescription.textContent = movie.description;

        // Show modal
        this.elements.movieModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus management for accessibility
        setTimeout(() => {
            this.elements.closeModal.focus();
        }, 100);
    }

    /**
     * Close movie details modal
     */
    closeModal() {
        this.elements.movieModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    /**
     * Check if modal is open
     */
    isModalOpen() {
        return this.elements.movieModal.style.display === 'block';
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.isLoading = true;
        this.hideAllStates();
        this.elements.loadingState.style.display = 'block';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.isLoading = false;
        this.elements.loadingState.style.display = 'none';
    }

    /**
     * Show error state
     */
    showError() {
        this.hideAllStates();
        this.elements.errorState.style.display = 'block';
    }

    /**
     * Show no results state
     */
    showNoResults() {
        this.hideAllStates();
        this.elements.noResultsState.style.display = 'block';
    }

    /**
     * Hide all states
     */
    hideAllStates() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.noResultsState.style.display = 'none';
        this.elements.moviesContainer.style.display = 'none';
    }
}

/**
 * Utility functions
 */
const Utils = {
    /**
     * Debounce function to limit the rate of function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format movie rating with proper decimal places
     */
    formatRating(rating) {
        return parseFloat(rating).toFixed(1);
    },

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the movie app
    window.movieApp = new MovieApp();
    
    // Add some enhancement for user experience
    addEnhancements();
});

/**
 * Additional enhancements for better user experience
 */
function addEnhancements() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for fade-in animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe movie cards as they're created
        const observeNewCards = () => {
            document.querySelectorAll('.movie-card').forEach(card => {
                if (!card.hasAttribute('data-observed')) {
                    card.setAttribute('data-observed', 'true');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    observer.observe(card);
                }
            });
        };

        // Initial observation
        setTimeout(observeNewCards, 100);

        // Re-observe when new cards are added
        const originalAppendChild = Element.prototype.appendChild;
        Element.prototype.appendChild = function(child) {
            const result = originalAppendChild.call(this, child);
            if (this.id === 'moviesContainer') {
                setTimeout(observeNewCards, 100);
            }
            return result;
        };
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search with Ctrl+F or Cmd+F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });

    // Add touch support for mobile devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

/**
 * Error handling for unhandled promises
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Optionally show user-friendly error message
});

/**
 * Service Worker registration for offline support (optional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered: ', registration))
        //     .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}
