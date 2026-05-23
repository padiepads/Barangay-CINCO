/**
 * Barangay CINCO — Digital Community Portal
 * Improved JavaScript — Optimized & Accessible
 */

'use strict';

// ============================================================
// SINGLE PAGE ROUTER
// ============================================================

/**
 * Switches the visible page section and updates nav state.
 * @param {string} pageId - The id of the section to show.
 */
function showPage(pageId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    // Update nav active state
    document.querySelectorAll('.nav-links button[id^="link-"]').forEach(btn => {
        btn.classList.remove('active-link');
        btn.removeAttribute('aria-current');
    });

    const activeBtn = document.getElementById(`link-${pageId}`);
    if (activeBtn) {
        activeBtn.classList.add('active-link');
        activeBtn.setAttribute('aria-current', 'page');
    }

    // Close mobile menu on page change
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-run scroll observer for newly visible elements
    setTimeout(observeScrollElements, 80);
}


// ============================================================
// NEWS SLIDESHOW
// ============================================================

let activeSlideIndex = 1;
let slideshowTimer = null;
const SLIDE_INTERVAL_MS = 7000;

function initializeNewsSlideshow() {
    renderSlides(activeSlideIndex);
    startSlideshowTimer();
}

function startSlideshowTimer() {
    stopSlideshowTimer();
    slideshowTimer = setInterval(() => moveSlides(1), SLIDE_INTERVAL_MS);
}

function stopSlideshowTimer() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
    }
}

function moveSlides(offset) {
    renderSlides(activeSlideIndex += offset);
    startSlideshowTimer(); // Reset timer on manual navigation
}

function setCurrentSlide(slideNum) {
    renderSlides(activeSlideIndex = slideNum);
    startSlideshowTimer();
}

function renderSlides(targetIndex) {
    const slides = document.getElementsByClassName('news-slide');
    const dots   = document.getElementsByClassName('slide-dot');

    if (!slides.length) return;

    // Wrap around
    if (targetIndex > slides.length) activeSlideIndex = 1;
    if (targetIndex < 1)             activeSlideIndex = slides.length;

    // Hide all, remove active dots
    Array.from(slides).forEach(s => { s.style.display = 'none'; });
    Array.from(dots).forEach(d => {
        d.classList.remove('slide-active');
        d.removeAttribute('aria-selected');
    });

    // Show active
    const activeSlide = slides[activeSlideIndex - 1];
    if (activeSlide) {
        activeSlide.style.display = 'block';
        // Restart fade animation
        activeSlide.classList.remove('fade');
        void activeSlide.offsetWidth; // reflow
        activeSlide.classList.add('fade');
    }

    if (dots[activeSlideIndex - 1]) {
        dots[activeSlideIndex - 1].classList.add('slide-active');
        dots[activeSlideIndex - 1].setAttribute('aria-selected', 'true');
    }
}

// Pause slideshow when tab/window is hidden (performance)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopSlideshowTimer();
    } else {
        startSlideshowTimer();
    }
});


// ============================================================
// MOBILE NAVIGATION TOGGLE
// ============================================================

function initMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks   = document.getElementById('navLinks');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('show');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    });
}


// ============================================================
// DARK / LIGHT THEME TOGGLE
// ============================================================

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const saved    = localStorage.getItem('theme') || 'light';

    applyTheme(saved, themeBtn);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next    = current === 'dark' ? 'light' : 'dark';
            applyTheme(next, themeBtn);
            localStorage.setItem('theme', next);
        });
    }
}

function applyTheme(theme, btn) {
    document.documentElement.setAttribute('data-theme', theme);
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
}


// ============================================================
// CONTACT FORM MODAL
// ============================================================

function openModal() {
    const modal = document.getElementById('submissionModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Focus trap: move focus into modal
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) setTimeout(() => closeBtn.focus(), 60);
    }
}

function closeModal() {
    const modal = document.getElementById('submissionModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        const form = document.getElementById('services-form');
        if (form) form.reset();
    }
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('submissionModal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('submissionModal');
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
});


// ============================================================
// SCROLL-TRIGGERED REVEAL (INTERSECTION OBSERVER)
// ============================================================

let scrollObserver = null;

function observeScrollElements() {
    if (scrollObserver) {
        // Observe any newly-visible unfaded elements
        document.querySelectorAll('.scroll-fade:not(.reveal-visible)').forEach(el => {
            scrollObserver.observe(el);
        });
        return;
    }

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                scrollObserver.unobserve(entry.target); // Observe once
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.scroll-fade').forEach(el => scrollObserver.observe(el));
}


// ============================================================
// HIDE HEADER ON SCROLL DOWN
// ============================================================

function initScrollHeader() {
    const header = document.getElementById('headerWrapper');
    if (!header) return;

    let lastY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentY = window.scrollY;

                if (currentY > lastY && currentY > 140) {
                    header.classList.add('scroll-hide');
                    // Also close mobile nav when hiding header
                    const navLinks = document.getElementById('navLinks');
                    const menuToggle = document.getElementById('menuToggle');
                    if (navLinks && navLinks.classList.contains('show')) {
                        navLinks.classList.remove('show');
                        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                    }
                } else {
                    header.classList.remove('scroll-hide');
                }

                lastY = currentY <= 0 ? 0 : currentY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}


// ============================================================
// FACILITY FILTER (kept for future use / re-enabling filter buttons)
// ============================================================

function filterSelection(category) {
    const cards = document.getElementsByClassName('facility-card');
    const filterCategory = category === 'all' ? '' : category;

    Array.from(cards).forEach(card => {
        if (!filterCategory || card.classList.contains(filterCategory)) {
            card.classList.remove('hide');
            card.classList.add('show');
        } else {
            card.classList.remove('show');
            card.classList.add('hide');
        }
    });
}


// ============================================================
// FORM VALIDATION — Enhanced
// ============================================================

function initContactForm() {
    const form = document.getElementById('services-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic client-side validation
        let valid = true;
        const required = form.querySelectorAll('[required]');

        required.forEach(field => {
            field.classList.remove('field-error');
            if (!field.value.trim()) {
                field.classList.add('field-error');
                valid = false;
            }
        });

        if (valid) {
            openModal();
        } else {
            // Focus first invalid field
            const first = form.querySelector('.field-error');
            if (first) first.focus();
        }
    });

    // Remove error styling on input
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('field-error'));
    });
}


// ============================================================
// INITIALISE ON DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Boot default page
    showPage('history');

    // Initialise all modules
    initTheme();
    initMobileNav();
    initScrollHeader();
    initializeNewsSlideshow();
    observeScrollElements();
    initContactForm();
});