// Real Estate Web Application JavaScript

// Firebase Configuration (Mock setup for demo purposes)
const firebaseConfig = {
    // Note: In production, these would be real Firebase credentials
    apiKey: "demo-api-key",
    authDomain: "dreamproperties-demo.firebaseapp.com",
    projectId: "dreamproperties-demo",
    storageBucket: "dreamproperties-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// Global state management
let currentUser = null;
let allProperties = [];
let filteredProperties = [];
let currentPage = 1;
const propertiesPerPage = 12;

// API endpoint
const API_ENDPOINT = 'https://68b826bcb715405043274639.mockapi.io/api/properties/PropertyListing';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProperties();
    checkAuthState();
});

// Initialize application
function initializeApp() {
    // Setup routing
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    
    // Setup mobile navigation
    setupMobileNavigation();
    
    // Setup navigation click handlers
    setupNavigationHandlers();
}

// Setup navigation click handlers
function setupNavigationHandlers() {
    // Navigation menu links
    const navLinks = document.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = href.substring(1);
                window.location.hash = page;
            });
        }
    });
    
    // View All Properties button
    const viewAllBtn = document.querySelector('a[href="#properties"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'properties';
        });
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
    
    // Search functionality
    const heroSearchBtn = document.querySelector('.hero-search button');
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', searchProperties);
    }
    
    // Filter functionality
    const searchBtn = document.querySelector('.filters-bar .btn--primary');
    const clearBtn = document.querySelector('.filters-bar .btn--outline');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
}

// Routing system
function handleRouting() {
    const hash = window.location.hash.slice(1) || 'home';
    showPage(hash);
    updateNavigation(hash);
}

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show current page
    const currentPage = document.getElementById(`${pageId}-page`);
    if (currentPage) {
        currentPage.classList.add('active');
        
        // Load page-specific content
        if (pageId === 'properties') {
            displayAllProperties();
        }
    } else {
        // Fallback to home if page doesn't exist
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.classList.add('active');
            window.location.hash = 'home';
        }
    }
}

function updateNavigation(currentPage) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkPage = href.slice(1);
            if (linkPage === currentPage) {
                link.style.color = 'var(--color-primary)';
                link.style.fontWeight = 'var(--font-weight-semibold)';
            } else {
                link.style.color = 'var(--color-text)';
                link.style.fontWeight = 'var(--font-weight-medium)';
            }
        }
    });
}

// Mobile navigation
function setupMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// API Functions
async function loadProperties() {
    try {
        showLoadingState();
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        
        allProperties = await response.json();
        filteredProperties = [...allProperties];
        
        displayFeaturedProperties();
        displayPropertiesByType('sale');
        
    } catch (error) {
        console.error('Error loading properties:', error);
        showErrorState('Failed to load properties. Please try again later.');
    }
}

function showLoadingState() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.textContent = 'Loading properties...';
        el.style.display = 'block';
    });
}

function showErrorState(message) {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.textContent = message;
        el.style.display = 'block';
    });
}

// Display Functions
function displayFeaturedProperties() {
    const container = document.getElementById('featuredPropertiesGrid');
    if (!container) return;
    
    const featuredProperties = allProperties.slice(0, 6);
    
    if (featuredProperties.length === 0) {
        container.innerHTML = '<div class="loading">No featured properties available.</div>';
        return;
    }
    
    container.innerHTML = featuredProperties.map(property => 
        createPropertyCard(property, true)
    ).join('');
}

function displayPropertiesByType(type) {
    const container = document.getElementById('propertiesGrid');
    if (!container) return;
    
    // For demo purposes, we'll randomly assign properties to sale/rent
    const typeProperties = allProperties.filter((_, index) => {
        return type === 'sale' ? index % 2 === 0 : index % 2 === 1;
    }).slice(0, 8);
    
    if (typeProperties.length === 0) {
        container.innerHTML = '<div class="loading">No properties available for this type.</div>';
        return;
    }
    
    container.innerHTML = typeProperties.map(property => 
        createPropertyCard(property, false, type)
    ).join('');
}

function displayAllProperties() {
    const container = document.getElementById('allPropertiesGrid');
    if (!container) return;
    
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
    
    if (paginatedProperties.length === 0) {
        container.innerHTML = '<div class="loading">No properties found matching your criteria.</div>';
        return;
    }
    
    container.innerHTML = paginatedProperties.map(property => 
        createPropertyCard(property, false, Math.random() > 0.5 ? 'sale' : 'rent')
    ).join('');
    
    updatePagination();
}

function createPropertyCard(property, isFeatured = false, type = 'sale') {
    const badge = isFeatured ? 'Featured' : (type === 'sale' ? 'For Sale' : 'For Rent');
    const contactInfo = currentUser ? 
        `<div class="owner-contact">${property.contactNumber}</div>` : 
        `<button class="btn btn--primary btn--sm contact-btn" onclick="redirectToLogin()">Login to View Contact</button>`;
    
    // Ensure image URL is valid, provide fallback if needed
    const imageUrl = property.image || `https://picsum.photos/320/200?random=${property.id}`;
    
    return `
        <div class="property-card">
            <div class="property-image" style="background-image: url('${imageUrl}')">
                <div class="property-badge">${badge}</div>
            </div>
            <div class="property-content">
                <h3 class="property-title">${property.name}</h3>
                <div class="property-location">
                    📍 ${property.buildingNumber} ${property.city}, ${property.state}, ${property.country}
                </div>
                <div class="property-details">
                    <div class="property-owner">
                        <div class="owner-info">
                            <div class="owner-name">👤 ${property.ownerName}</div>
                            ${contactInfo}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Property Tab Switching
function showPropertyTab(type) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    const activeButton = Array.from(tabButtons).find(btn => 
        btn.textContent.toLowerCase().includes(type === 'sale' ? 'sale' : 'rent')
    );
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Display properties for selected type
    displayPropertiesByType(type);
}

// Make showPropertyTab globally accessible
window.showPropertyTab = showPropertyTab;

// Setup tab button event listeners
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.textContent.toLowerCase().includes('sale') ? 'sale' : 'rent';
                showPropertyTab(type);
            });
        });
    }, 100);
});

// Search and Filter Functions
function searchProperties() {
    const searchTerm = document.getElementById('heroSearch')?.value.toLowerCase() || '';
    const filterType = document.getElementById('heroFilter')?.value || '';
    
    // Redirect to properties page with filters applied
    window.location.hash = 'properties';
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        
        if (searchInput) searchInput.value = searchTerm;
        if (typeFilter) typeFilter.value = filterType;
        
        applyFilters();
    }, 100);
}

// Make searchProperties globally accessible
window.searchProperties = searchProperties;

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const typeFilter_value = typeFilter ? typeFilter.value : '';
    
    filteredProperties = allProperties.filter(property => {
        const matchesSearch = !searchTerm || 
            property.name.toLowerCase().includes(searchTerm) ||
            property.city.toLowerCase().includes(searchTerm) ||
            property.state.toLowerCase().includes(searchTerm) ||
            property.country.toLowerCase().includes(searchTerm) ||
            property.ownerName.toLowerCase().includes(searchTerm);
        
        // For demo purposes, we'll randomly assign type filtering
        const matchesType = !typeFilter_value || Math.random() > 0.3;
        
        return matchesSearch && matchesType;
    });
    
    currentPage = 1;
    displayAllProperties();
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = '';
    
    filteredProperties = [...allProperties];
    currentPage = 1;
    displayAllProperties();
}

// Pagination
function updatePagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            Previous
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Next
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayAllProperties();
}

// Make changePage globally accessible
window.changePage = changePage;

// Authentication Functions (Mock implementation)
function checkAuthState() {
    // Check if user is logged in (mock implementation)
    const savedUser = localStorage.getItem('dreamproperties_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        } catch (e) {
            localStorage.removeItem('dreamproperties_user');
        }
    }
}

function updateAuthUI() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    
    if (currentUser) {
        navAuth.innerHTML = `
            <span style="color: var(--color-text); margin-right: var(--space-12);">Welcome, ${currentUser.name}</span>
            <button class="btn btn--outline btn--sm" onclick="logout()">Logout</button>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="#login" class="btn btn--outline btn--sm">Login</a>
            <a href="#signup" class="btn btn--primary btn--sm">Sign Up</a>
        `;
        
        // Re-setup navigation handlers for new buttons
        setTimeout(setupNavigationHandlers, 100);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Mock authentication (in production, use Firebase Auth)
    if (email && password.length >= 6) {
        // Simulate API call delay
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            currentUser = {
                email: email,
                name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                uid: 'mock-uid-' + Date.now()
            };
            
            localStorage.setItem('dreamproperties_user', JSON.stringify(currentUser));
            updateAuthUI();
            
            showModal('Success', 'Login successful! Welcome back.');
            setTimeout(() => {
                window.location.hash = 'home';
                closeModal();
            }, 1500);
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1000);
    } else {
        showModal('Error', 'Please enter a valid email and password (minimum 6 characters).');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const termsAccepted = formData.get('terms');
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showModal('Error', 'Please fill in all required fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showModal('Error', 'Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showModal('Error', 'Password must be at least 6 characters long.');
        return;
    }
    
    if (!termsAccepted) {
        showModal('Error', 'Please accept the Terms & Conditions.');
        return;
    }
    
    // Mock user registration
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        showModal('Success', 'Account created successfully! Please log in to continue.');
        setTimeout(() => {
            window.location.hash = 'login';
            closeModal();
        }, 1500);
        
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        event.target.reset();
    }, 1000);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('dreamproperties_user');
    updateAuthUI();
    showModal('Success', 'You have been logged out successfully.');
    setTimeout(() => {
        window.location.hash = 'home';
        closeModal();
    }, 1000);
}

// Make logout globally accessible
window.logout = logout;

function redirectToLogin() {
    showModal('Login Required', 'Please log in to view property contact information.');
    setTimeout(() => {
        window.location.hash = 'login';
        closeModal();
    }, 1500);
}

// Make redirectToLogin globally accessible
window.redirectToLogin = redirectToLogin;

// Newsletter Signup
function handleNewsletterSignup(event) {
    event.preventDefault();
    
    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value : '';
    
    if (email && email.includes('@')) {
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Subscribing...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showModal('Success', 'Thank you for subscribing to our newsletter!');
            event.target.reset();
            
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            setTimeout(closeModal, 2000);
        }, 1000);
    } else {
        showModal('Error', 'Please enter a valid email address.');
    }
}

// Modal Functions
function showModal(title, message) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    if (modal && modalTitle && modalMessage) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Make closeModal globally accessible
window.closeModal = closeModal;

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Handle escape key to close modal
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Error handling for failed image loads
document.addEventListener('error', function(event) {
    if (event.target.classList && event.target.classList.contains('property-image')) {
        // Handle background image failures
        const propertyId = Math.floor(Math.random() * 1000);
        event.target.style.backgroundImage = `url('https://picsum.photos/320/200?random=${propertyId}')`;
    }
}, true);

// Performance optimization: Lazy loading setup
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupLazyLoading, 500);
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for production
        console.log('Service Worker support detected - ready for offline functionality');
    });
}

// Additional helper to ensure proper page loading
window.addEventListener('load', function() {
    // Ensure proper initial page state
    if (!window.location.hash) {
        window.location.hash = 'home';
    }
    handleRouting();
});