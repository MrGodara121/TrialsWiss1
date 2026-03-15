// ===== CONFIGURATION =====
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const SITE_URL = 'https://trialswiss.com';

// ===== STATE MANAGEMENT =====
let currentLang = localStorage.getItem('lang') || 'en';
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadContent();
    setupEventListeners();
});

function initializeApp() {
    // Set dark mode
    if (isDarkMode) {
        document.body.classList.add('dark');
        document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    }
    
    // Hide loader after page load
    setTimeout(() => {
        document.getElementById('loader').classList.add('fade-out');
    }, 500);
    
    // Load dynamic content
    loadHeroStats();
    loadClientLogos();
    loadFeatures();
    loadPricing();
    loadTestimonials();
    loadCantonOptions();
    loadSpecializationOptions();
}

function setupEventListeners() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    
    // Language selector
    document.getElementById('langBtn').addEventListener('click', toggleLanguageDropdown);
    document.querySelectorAll('.lang-dropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(link.dataset.lang);
        });
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Modal triggers
    document.getElementById('loginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showModal('loginModal');
    });
    
    document.getElementById('signupBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showModal('signupModal');
    });
    
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('loginModal');
        showModal('signupModal');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('signupModal');
        showModal('loginModal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.closest('.modal').id);
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    // Back to top
    document.getElementById('backToTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Show/hide back to top button
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Score slider
    const scoreSlider = document.getElementById('minScore');
    if (scoreSlider) {
        scoreSlider.addEventListener('input', (e) => {
            document.getElementById('scoreValue').textContent = e.target.value + '+';
        });
    }
}

// ===== LANGUAGE FUNCTIONS =====
function toggleLanguageDropdown() {
    document.getElementById('langDropdown').classList.toggle('show');
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.getElementById('langBtn').innerHTML = `<i class="fas fa-globe"></i> ${lang.toUpperCase()} <i class="fas fa-chevron-down"></i>`;
    document.getElementById('langDropdown').classList.remove('show');
    loadContent();
}

// ===== THEME FUNCTIONS =====
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    const icon = document.querySelector('.theme-toggle i');
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ===== MODAL FUNCTIONS =====
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = '';
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('show');
}

// ===== API CALLS =====
async function callAPI(action, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification('API connection error', 'error');
        return { error: error.message };
    }
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== CONTENT LOADING =====
async function loadContent() {
    const data = await callAPI('getContent', { lang: currentLang });
    if (data.success) {
        // Update page content based on language
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (data.content[key]) {
                el.textContent = data.content[key];
            }
        });
    }
}

async function loadHeroStats() {
    const data = await callAPI('getHeroStats');
    if (data.success) {
        document.getElementById('heroStats').innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${data.stats.sites}</span>
                <span class="stat-label">Sites Analyzed</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${data.stats.sponsors}</span>
                <span class="stat-label">Sponsors</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${data.stats.countries}</span>
                <span class="stat-label">Countries</span>
            </div>
        `;
    }
}

async function loadClientLogos() {
    const clients = [
        'Novartis', 'Roche', 'Swissmedic', 'IQVIA', 'ICON'
    ];
    
    let html = '';
    clients.forEach(client => {
        html += `<div class="logo-item">${client}</div>`;
    });
    document.getElementById('clientLogos').innerHTML = html;
}

async function loadFeatures() {
    const features = [
        {
            icon: 'fa-robot',
            title: 'AI Site Scoring',
            description: '94% accurate prediction for hospital performance',
            link: '#'
        },
        {
            icon: 'fa-calculator',
            title: 'Cost Estimator',
            description: '95% accurate recruitment cost estimation',
            link: '#'
        },
        {
            icon: 'fa-eye',
            title: 'Competitor Tracking',
            description: 'Real-time alerts for competitor trials',
            link: '#'
        },
        {
            icon: 'fa-map-marked-alt',
            title: 'Demographics Map',
            description: '26 cantons patient population data',
            link: '#'
        },
        {
            icon: 'fa-clock',
            title: 'Swissmedic Timeline',
            description: '28-day average approval tracking',
            link: '#'
        },
        {
            icon: 'fa-user-md',
            title: 'Investigator Profiler',
            description: '500+ Swiss investigators with H-index',
            link: '#'
        }
    ];
    
    let html = '';
    features.forEach(f => {
        html += `
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="fas ${f.icon}"></i>
                </div>
                <h3>${f.title}</h3>
                <p>${f.description}</p>
                <a href="${f.link}" class="feature-link">
                    Learn More <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
    });
    document.getElementById('featuresGrid').innerHTML = html;
}

async function loadPricing() {
    const plans = [
        {
            name: 'Free Trial',
            price: '0',
            period: '7 days',
            features: ['50 API calls', '10 hospitals', '20 investigators', 'Email support'],
            popular: false
        },
        {
            name: 'Pro',
            price: '499',
            period: 'month',
            features: ['500 API calls/month', 'Full database', 'AI scoring', 'Cost estimator', 'Competitor tracking', '24h support'],
            popular: true
        },
        {
            name: 'Enterprise',
            price: '1,999',
            period: 'month',
            features: ['5,000 API calls', 'Unlimited everything', 'Dedicated manager', 'Custom reports', '24/7 phone support', 'On-site training'],
            popular: false
        }
    ];
    
    let html = '';
    plans.forEach(p => {
        const popularClass = p.popular ? 'popular' : '';
        const popularBadge = p.popular ? '<span class="popular-badge">MOST POPULAR</span>' : '';
        
        html += `
            <div class="pricing-card ${popularClass}">
                ${popularBadge}
                <div class="plan-name">${p.name}</div>
                <div class="plan-price">
                    <span class="price">$${p.price}</span>
                    <span class="price-period">/${p.period}</span>
                </div>
                <ul class="plan-features">
                    ${p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <button class="btn-primary" onclick="subscribe('${p.name}')">Get Started</button>
            </div>
        `;
    });
    document.getElementById('pricingGrid').innerHTML = html;
}

async function loadTestimonials() {
    const testimonials = [
        {
            rating: 5,
            text: "This platform cut our site selection time from 8 weeks to just 3 weeks. The Swissmedic integration is seamless.",
            name: "Dr. Sarah Keller",
            title: "Head of Clinical Operations",
            company: "Novartis"
        },
        {
            rating: 5,
            text: "Incredibly accurate cost estimates. Saved us millions on our Phase III trial.",
            name: "Dr. Markus Weber",
            title: "Clinical Trial Manager",
            company: "Roche"
        },
        {
            rating: 5,
            text: "The competitor tracking feature is a game-changer. We always know what others are doing.",
            name: "Dr. Anna Fischer",
            title: "CEO",
            company: "SwissCRO"
        }
    ];
    
    let html = '';
    testimonials.forEach((t, index) => {
        const activeClass = index === 0 ? 'active' : '';
        html += `
            <div class="testimonial-card ${activeClass}">
                <div class="testimonial-rating">${'★'.repeat(t.rating)}</div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${t.name.charAt(0)}</div>
                    <div class="author-info">
                        <h4>${t.name}</h4>
                        <p>${t.title}, ${t.company}</p>
                    </div>
                </div>
            </div>
        `;
    });
    document.getElementById('testimonialsSlider').innerHTML = html;
    
    // Auto-rotate testimonials
    let current = 0;
    setInterval(() => {
        const cards = document.querySelectorAll('.testimonial-card');
        cards[current].classList.remove('active');
        current = (current + 1) % cards.length;
        cards[current].classList.add('active');
    }, 5000);
}

async function loadCantonOptions() {
    const cantons = ['Zurich', 'Bern', 'Basel-Stadt', 'Geneva', 'Vaud', 'Aargau', 'St. Gallen', 'Lucerne', 'Ticino', 'Valais'];
    let html = '<option value="">All Cantons</option>';
    cantons.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });
    document.getElementById('canton').innerHTML = html;
}

async function loadSpecializationOptions() {
    const specializations = ['Oncology', 'Cardiology', 'Neurology', 'Immunology', 'Infectious Diseases', 'Rare Diseases'];
    let html = '<option value="">All Specializations</option>';
    specializations.forEach(s => {
        html += `<option value="${s}">${s}</option>`;
    });
    document.getElementById('specialization').innerHTML = html;
}

// ===== HOSPITAL SEARCH =====
async function searchHospitals() {
    const canton = document.getElementById('canton').value;
    const spec = document.getElementById('specialization').value;
    const minScore = document.getElementById('minScore').value;
    
    document.getElementById('hospitalResults').innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Searching hospitals...</div>';
    
    const data = await callAPI('searchHospitals', { canton, specialization: spec, min_score: minScore });
    
    if (data.success && data.hospitals.length > 0) {
        let html = `
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Hospital</th>
                            <th>City</th>
                            <th>Canton</th>
                            <th>AI Score</th>
                            <th>Trials</th>
                            <th>Success Rate</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.hospitals.forEach(h => {
            const scoreClass = h.score >= 90 ? 'score-excellent' : h.score >= 80 ? 'score-good' : 'score-average';
            html += `
                <tr>
                    <td><strong>${h.name}</strong></td>
                    <td>${h.city}</td>
                    <td>${h.canton}</td>
                    <td><span class="score-badge ${scoreClass}">${h.score}</span></td>
                    <td>${h.trials_completed}</td>
                    <td>${h.success_rate}%</td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        document.getElementById('hospitalResults').innerHTML = html;
    } else {
        document.getElementById('hospitalResults').innerHTML = '<div class="loading-placeholder">No hospitals found matching your criteria</div>';
    }
}

// ===== COST CALCULATOR =====
async function calculateCost() {
    const patients = document.getElementById('patients').value;
    const phase = document.getElementById('phase').value;
    const area = document.getElementById('therapeuticArea').value;
    
    document.getElementById('costResult').innerHTML = '<div class="loading-placeholder"><i class="fas fa-spinner fa-spin"></i> Calculating...</div>';
    document.getElementById('costResult').classList.add('show');
    
    const data = await callAPI('calculateCost', { patients, phase, therapeutic_area: area });
    
    if (data.success) {
        document.getElementById('costResult').innerHTML = `
            <div class="result-card">
                <h3>Estimated Cost</h3>
                <div class="result-amount">CHF ${data.total_cost.toLocaleString()}</div>
                <div class="result-details">
                    <p><strong>Per Patient:</strong> CHF ${data.cost_per_patient.toLocaleString()}</p>
                    <p><strong>Estimated Time:</strong> ${data.estimated_months} months</p>
                    <p><strong>Patients:</strong> ${data.patients_needed}</p>
                </div>
                <button class="btn-primary" onclick="downloadReport()">Download Report</button>
            </div>
        `;
    }
}

function downloadReport() {
    showNotification('Report will be sent to your email', 'success');
}

// ===== AUTH FUNCTIONS =====
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const apiKey = document.getElementById('loginKey').value;
    
    const data = await callAPI('login', { email, api_key: apiKey });
    
    if (data.success) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        hideModal('loginModal');
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const company = document.getElementById('signupCompany').value;
    const agreed = document.getElementById('agreeTerms').checked;
    
    if (!agreed) {
        showNotification('Please agree to terms', 'error');
        return;
    }
    
    const data = await callAPI('signup', { name, email, company });
    
    if (data.success) {
        hideModal('signupModal');
        showNotification('Account created! Check your email for API key.', 'success');
    } else {
        showNotification('Signup failed', 'error');
    }
}

function subscribe(plan) {
    if (!currentUser) {
        showModal('loginModal');
        return;
    }
    
    window.location.href = `https://paypal.me/trialswiss/${plan === 'Pro' ? '499' : '1999'}`;
}

// ===== COOKIE CONSENT =====
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookieConsent').classList.remove('show');
}

// Check cookie consent
if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => {
        document.getElementById('cookieConsent').classList.add('show');
    }, 2000);
}
