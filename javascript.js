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

    // Update nav active state for regular buttons
    document.querySelectorAll('.nav-links button[id^="link-"]').forEach(btn => {
        btn.classList.remove('active-link');
        btn.removeAttribute('aria-current');
    });

    // Update dropdown trigger active state
    const dropdownTrigger = document.getElementById('link-services');
    if (dropdownTrigger) {
        if (pageId === 'services') {
            dropdownTrigger.classList.add('active-link');
            dropdownTrigger.setAttribute('aria-current', 'page');
        } else {
            dropdownTrigger.classList.remove('active-link');
            dropdownTrigger.removeAttribute('aria-current');
        }
    }

    const activeBtn = document.getElementById(`link-${pageId}`);
    if (activeBtn && pageId !== 'services') {
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

/**
 * Scroll to a specific section within the current page.
 * @param {string} sectionId
 */
function scrollToSection(sectionId) {
    setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
            const offset = 120;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, 150);
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
    startSlideshowTimer();
}

function setCurrentSlide(slideNum) {
    renderSlides(activeSlideIndex = slideNum);
    startSlideshowTimer();
}

function renderSlides(targetIndex) {
    const slides = document.getElementsByClassName('news-slide');
    const dots   = document.getElementsByClassName('slide-dot');

    if (!slides.length) return;

    if (targetIndex > slides.length) activeSlideIndex = 1;
    if (targetIndex < 1)             activeSlideIndex = slides.length;

    Array.from(slides).forEach(s => { s.style.display = 'none'; });
    Array.from(dots).forEach(d => {
        d.classList.remove('slide-active');
        d.removeAttribute('aria-selected');
    });

    const activeSlide = slides[activeSlideIndex - 1];
    if (activeSlide) {
        activeSlide.style.display = 'block';
        activeSlide.classList.remove('fade');
        void activeSlide.offsetWidth;
        activeSlide.classList.add('fade');
    }

    if (dots[activeSlideIndex - 1]) {
        dots[activeSlideIndex - 1].classList.add('slide-active');
        dots[activeSlideIndex - 1].setAttribute('aria-selected', 'true');
    }
}

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

    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

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
        // Also clear image preview on reset
        resetImageUpload();
    }
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('submissionModal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        closeModal();
    }
    const docModal = document.getElementById('docRequestModal');
    if (docModal && docModal.classList.contains('active') && e.target === docModal) {
        closeDocModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('submissionModal');
        if (modal && modal.classList.contains('active')) closeModal();
        const docModal = document.getElementById('docRequestModal');
        if (docModal && docModal.classList.contains('active')) closeDocModal();
    }
});


// ============================================================
// DOCUMENT REQUEST MODAL
// ============================================================

const docInfo = {
    clearance: {
        title: '📋 Barangay Clearance',
        body: `Requirements:\n• Valid Government-Issued ID (1 original + 1 photocopy)\n• Community Tax Certificate (Cedula) — current year\n• Duly accomplished request form (available at the hall)\n\nProcessing Time: 15–30 minutes\nFee: ₱50.00\n\nNote: The applicant must be physically present and a registered resident of Barangay CINCO.`
    },
    residency: {
        title: '🏠 Certificate of Residency',
        body: `Requirements:\n• Valid Government-Issued ID with current address\n• Community Tax Certificate (Cedula) — current year\n• Proof of residency (e.g. utility bill, lease contract)\n\nProcessing Time: 15–30 minutes\nFee: ₱50.00\n\nNote: Must show proof that you have lived in Barangay CINCO for at least 6 months.`
    },
    indigency: {
        title: '📑 Barangay Indigency Certificate',
        body: `Requirements:\n• Valid Government-Issued ID\n• Proof of financial need or recommendation from Purok Leader\n• Community Tax Certificate (Cedula)\n\nProcessing Time: 20–30 minutes\nFee: FREE (for qualified individuals)\n\nNote: Certificate is issued to residents who cannot financially afford certain services. Subject to barangay evaluation.`
    },
    business: {
        title: '🏢 Business Permit Clearance',
        body: `Requirements:\n• DTI / SEC / CDA Registration\n• Lease contract or proof of business address within Barangay CINCO\n• Valid Government-Issued ID of proprietor\n• Previous year's barangay clearance (for renewal)\n\nProcessing Time: 30–60 minutes\nFee: Varies by business type (₱200.00 – ₱500.00)\n\nNote: Required annually for all businesses operating within the barangay.`
    },
    moral: {
        title: '🎖️ Certificate of Good Moral Character',
        body: `Requirements:\n• Valid Government-Issued ID\n• Community Tax Certificate (Cedula)\n• No pending cases within the barangay\n\nProcessing Time: 15–20 minutes\nFee: ₱50.00\n\nNote: For employment, scholarship, or travel purposes. The barangay reserves the right to verify the applicant's record.`
    },
    id: {
        title: '🪪 Barangay ID Request',
        body: `Requirements:\n• 2x2 ID photo (white background, 2 copies)\n• Valid Government-Issued ID\n• Proof of residency in Barangay CINCO\n• Community Tax Certificate (Cedula)\n\nProcessing Time: 3–5 working days\nFee: ₱100.00\n\nNote: The Barangay ID is recognized as a valid alternate identification. Claim date will be provided upon filing.`
    },
    cedula: {
        title: '📜 Cedula / Community Tax Certificate',
        body: `Requirements:\n• Valid Government-Issued ID\n• Previous year's Cedula (for renewal reference)\n• Proof of income (optional, for tax computation)\n\nProcessing Time: 10–20 minutes\nFee: Based on income (minimum ₱5.00 + additional tax)\n\nNote: Cedula is required for most government and legal transactions. Must be renewed every year.`
    }
};

function openDocInfo(docType) {
    const info = docInfo[docType];
    if (!info) return;

    const modal    = document.getElementById('docRequestModal');
    const title    = document.getElementById('docModalTitle');
    const body     = document.getElementById('docModalBody');

    if (!modal || !title || !body) return;

    title.textContent = info.title;
    body.textContent  = info.body;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 60);
}

function closeDocModal() {
    const modal = document.getElementById('docRequestModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
}


// ============================================================
// DISASTER ACCORDION TOGGLE
// ============================================================

function toggleDisaster(id) {
    const card = document.getElementById(`disaster-${id}`);
    if (!card) return;

    const isOpen = card.classList.contains('is-open');
    const btn    = card.querySelector('.disaster-header');

    // Close all others
    document.querySelectorAll('.disaster-card.is-open').forEach(c => {
        if (c !== card) {
            c.classList.remove('is-open');
            const b = c.querySelector('.disaster-header');
            if (b) b.setAttribute('aria-expanded', 'false');
        }
    });

    if (isOpen) {
        card.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
        card.classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
}


// ============================================================
// IMAGE UPLOAD — Contact Form
// ============================================================

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    displayImagePreview(file);
}

function displayImagePreview(file) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview     = document.getElementById('uploadPreview');
        const previewImg  = document.getElementById('previewImg');

        if (placeholder) placeholder.style.display = 'none';
        if (preview)     preview.style.display = 'block';
        if (previewImg)  previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeImage(event) {
    event.stopPropagation(); // Prevent re-opening file dialog
    resetImageUpload();
}

function resetImageUpload() {
    const fileInput  = document.getElementById('concern-image');
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview    = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');

    if (fileInput)    fileInput.value = '';
    if (previewImg)   previewImg.src = '';
    if (placeholder)  placeholder.style.display = 'block';
    if (preview)      preview.style.display = 'none';
}

function handleDragOver(event) {
    event.preventDefault();
    const area = document.getElementById('imageUploadArea');
    if (area) area.classList.add('drag-over');
}

function handleDragLeave(event) {
    const area = document.getElementById('imageUploadArea');
    if (area) area.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    const area = document.getElementById('imageUploadArea');
    if (area) area.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const fileInput = document.getElementById('concern-image');
        if (fileInput) {
            // Create a DataTransfer to assign file to input
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
        }
        displayImagePreview(file);
    }
}


// ============================================================
// SCROLL-TRIGGERED REVEAL (INTERSECTION OBSERVER)
// ============================================================

let scrollObserver = null;

function observeScrollElements() {
    if (scrollObserver) {
        document.querySelectorAll('.scroll-fade:not(.reveal-visible)').forEach(el => {
            scrollObserver.observe(el);
        });
        return;
    }

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                scrollObserver.unobserve(entry.target);
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
                    const navLinks   = document.getElementById('navLinks');
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
// FACILITY FILTER
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
            const first = form.querySelector('.field-error');
            if (first) first.focus();
        }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('field-error'));
    });
}


// ============================================================
// INITIALISE ON DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    showPage('history');

    initTheme();
    initMobileNav();
    initScrollHeader();
    initializeNewsSlideshow();
    observeScrollElements();
    initContactForm();
});