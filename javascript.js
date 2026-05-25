/**
 * Barangay CINCO — Digital Community Portal
 * javascript.js — Complete Implementation
 * Covers: routing, dark mode, mobile nav, forms, reCAPTCHA,
 *         appointment, modals, FAQ, scroll effects, slideshow,
 *         image upload, disaster accordion, officials modal,
 *         document request, date validation, tracking numbers.
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
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the target section
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    // Clear all active-link states
    document.querySelectorAll('.nav-links button[id^="link-"]').forEach(btn => {
        btn.classList.remove('active-link');
        btn.removeAttribute('aria-current');
    });

    // Set active-link on the matching nav button
    const activeBtn = document.getElementById(`link-${pageId}`);
    if (activeBtn) {
        activeBtn.classList.add('active-link');
        activeBtn.setAttribute('aria-current', 'page');
    }

    // Close mobile menu when navigating
    closeMobileNav();

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger scroll observer for newly revealed elements
    setTimeout(observeScrollElements, 100);
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

    // Wrap around
    if (targetIndex > slides.length) activeSlideIndex = 1;
    if (targetIndex < 1)             activeSlideIndex = slides.length;

    // Hide all slides and deselect dots
    Array.from(slides).forEach(s => { s.style.display = 'none'; });
    Array.from(dots).forEach(d => {
        d.classList.remove('slide-active');
        d.removeAttribute('aria-selected');
    });

    // Show active slide with fade animation
    const activeSlide = slides[activeSlideIndex - 1];
    if (activeSlide) {
        activeSlide.style.display = 'block';
        activeSlide.classList.remove('fade');
        void activeSlide.offsetWidth; // Force reflow for animation restart
        activeSlide.classList.add('fade');
    }

    // Highlight active dot
    const activeDot = dots[activeSlideIndex - 1];
    if (activeDot) {
        activeDot.classList.add('slide-active');
        activeDot.setAttribute('aria-selected', 'true');
    }
}

// Pause slideshow when tab is hidden to save resources
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

function closeMobileNav() {
    const navLinks   = document.getElementById('navLinks');
    const menuToggle = document.getElementById('menuToggle');
    if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
}

function initMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks   = document.getElementById('navLinks');

    if (!menuToggle || !navLinks) return;

    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('show');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking outside the nav
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            closeMobileNav();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('show')) {
            closeMobileNav();
            menuToggle.focus();
        }
    });
}


// ============================================================
// DARK / LIGHT THEME TOGGLE
// ============================================================

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    // Default to light; respect saved preference
    const saved = localStorage.getItem('theme') || 'light';

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
// MODAL UTILITIES
// ============================================================

/**
 * Generic modal opener — adds .active, sets aria-hidden=false, focuses close button.
 */
function openModalById(modalId, focusBtnSelector = '.modal-close-btn') {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const btn = modal.querySelector(focusBtnSelector);
    if (btn) setTimeout(() => btn.focus(), 60);
}

/**
 * Generic modal closer — removes .active, sets aria-hidden=true.
 */
function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

// Close modal when clicking the overlay backdrop
document.addEventListener('click', (e) => {
    ['submissionModal', 'appointmentModal', 'docRequestModal', 'officialModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && modal.classList.contains('active') && e.target === modal) {
            closeModalById(id);
        }
    });
});

// Close any open modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ['submissionModal', 'appointmentModal', 'docRequestModal', 'officialModal'].forEach(id => {
            const modal = document.getElementById(id);
            if (modal && modal.classList.contains('active')) {
                closeModalById(id);
            }
        });
    }
});


// ============================================================
// CONTACT FORM MODAL (Success)
// ============================================================

function openModal() {
    openModalById('submissionModal');
}

function closeModal() {
    closeModalById('submissionModal');
    // Reset form and image preview
    const form = document.getElementById('services-form');
    if (form) form.reset();
    resetImageUpload();
    // Reset reCAPTCHA if loaded
    if (typeof grecaptcha !== 'undefined') {
        try { grecaptcha.reset(contactRecaptchaWidgetId); } catch (err) { /* not yet rendered */ }
    }
}


// ============================================================
// APPOINTMENT MODAL (Success)
// ============================================================

function openAppointmentModal(trackingNumber, apptSummary) {
    const modal       = document.getElementById('appointmentModal');
    const bodyEl      = document.getElementById('apptModalBody');
    const trackingEl  = document.getElementById('apptTrackingNumber');

    if (bodyEl && apptSummary) {
        bodyEl.innerHTML = apptSummary;
    }

    if (trackingEl && trackingNumber) {
        trackingEl.style.display = 'block';
        trackingEl.innerHTML = `
            <div class="tracking-label">Your Tracking Number</div>
            <div class="tracking-code">${trackingNumber}</div>
            <div class="tracking-hint">Screenshot or write this down for reference.</div>
        `;
    }

    openModalById('appointmentModal');
}

function closeAppointmentModal() {
    closeModalById('appointmentModal');
    const form = document.getElementById('appointment-form');
    if (form) form.reset();
    // Hide "Other Concern" field
    const otherGroup = document.getElementById('appt-other-group');
    if (otherGroup) otherGroup.style.display = 'none';
    // Deselect time slots
    document.querySelectorAll('.timeslot-option').forEach(opt => opt.classList.remove('selected'));
    // Reset reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        try { grecaptcha.reset(apptRecaptchaWidgetId); } catch (err) { /* not yet rendered */ }
    }
    // Reset min date on date picker
    initAppointmentDateConstraints();
}


// ============================================================
// DOCUMENT REQUEST MODAL
// ============================================================

const docInfo = {
    clearance: {
        title: '📋 Barangay Clearance',
        body: `<strong>Requirements:</strong>
<ul>
  <li>Valid Government-Issued ID (1 original + 1 photocopy)</li>
  <li>Community Tax Certificate (Cedula) — current year</li>
  <li>Duly accomplished request form (available at the hall)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>15–30 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>₱50.00</strong></span>
</div>
<p class="doc-modal-note">The applicant must be physically present and a registered resident of Barangay CINCO.</p>`
    },
    residency: {
        title: '🏠 Certificate of Residency',
        body: `<strong>Requirements:</strong>
<ul>
  <li>Valid Government-Issued ID with current address</li>
  <li>Community Tax Certificate (Cedula) — current year</li>
  <li>Proof of residency (e.g. utility bill, lease contract)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>15–30 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>₱50.00</strong></span>
</div>
<p class="doc-modal-note">Must show proof of residency in Barangay CINCO for at least 6 months.</p>`
    },
    indigency: {
        title: '📑 Barangay Indigency Certificate',
        body: `<strong>Requirements:</strong>
<ul>
  <li>Valid Government-Issued ID</li>
  <li>Proof of financial need or recommendation from Purok Leader</li>
  <li>Community Tax Certificate (Cedula)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>20–30 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>FREE</strong> (for qualified individuals)</span>
</div>
<p class="doc-modal-note">Subject to barangay evaluation. Certificate is issued to residents who cannot financially afford certain services.</p>`
    },
    business: {
        title: '🏢 Business Permit Clearance',
        body: `<strong>Requirements:</strong>
<ul>
  <li>DTI / SEC / CDA Registration</li>
  <li>Lease contract or proof of business address within Barangay CINCO</li>
  <li>Valid Government-Issued ID of proprietor</li>
  <li>Previous year's barangay clearance (for renewal)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>30–60 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>₱200.00 – ₱500.00</strong> (varies by type)</span>
</div>
<p class="doc-modal-note">Required annually for all businesses operating within the barangay.</p>`
    },
    moral: {
        title: '🎖️ Certificate of Good Moral Character',
        body: `<strong>Requirements:</strong>
<ul>
  <li>Valid Government-Issued ID</li>
  <li>Community Tax Certificate (Cedula)</li>
  <li>No pending cases within the barangay</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>15–20 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>₱50.00</strong></span>
</div>
<p class="doc-modal-note">For employment, scholarship, or travel purposes. The barangay reserves the right to verify the applicant's record.</p>`
    },
    id: {
        title: '🪪 Barangay ID Request',
        body: `<strong>Requirements:</strong>
<ul>
  <li>2x2 ID photo (white background, 2 copies)</li>
  <li>Valid Government-Issued ID</li>
  <li>Proof of residency in Barangay CINCO</li>
  <li>Community Tax Certificate (Cedula)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>3–5 working days</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>₱100.00</strong></span>
</div>
<p class="doc-modal-note">Claim date will be provided upon filing. The Barangay ID is recognized as a valid alternate identification.</p>`
    },
    cedula: {
        title: '📜 Cedula / Community Tax Certificate',
        body: `<strong>Requirements:</strong>
<ul>
  <li>Valid Government-Issued ID</li>
  <li>Previous year's Cedula (for renewal reference)</li>
  <li>Proof of income (optional, for tax computation)</li>
</ul>
<div class="doc-meta-row">
  <span class="doc-meta-item">⏱ Processing: <strong>10–20 minutes</strong></span>
  <span class="doc-meta-item">💰 Fee: <strong>Based on income</strong> (min. ₱5.00)</span>
</div>
<p class="doc-modal-note">Required for most government and legal transactions. Must be renewed every year.</p>`
    }
};

function openDocInfo(docType) {
    const info = docInfo[docType];
    if (!info) return;

    const modal  = document.getElementById('docRequestModal');
    const title  = document.getElementById('docModalTitle');
    const body   = document.getElementById('docModalBody');

    if (!modal || !title || !body) return;

    title.textContent = info.title;
    body.innerHTML    = info.body; // Use innerHTML for rich formatting

    openModalById('docRequestModal', '.modal-close-btn--maroon');
}

function closeDocModal() {
    closeModalById('docRequestModal');
}


// ============================================================
// OFFICIAL DETAIL MODAL
// ============================================================

/**
 * Opens the official's profile modal.
 * @param {string} imgSrc   - Path to the official's photo
 * @param {string} role     - Official's role/title
 * @param {string} name     - Official's full name
 * @param {string} desc     - Description / responsibilities
 */
function openOfficialModal(imgSrc, role, name, desc) {
    const modal    = document.getElementById('officialModal');
    const imgEl    = document.getElementById('officialModalImg');
    const roleEl   = document.getElementById('officialModalRole');
    const titleEl  = document.getElementById('officialModalTitle');
    const descEl   = document.getElementById('officialModalDesc');

    if (!modal) return;

    if (imgEl)   { imgEl.src = imgSrc; imgEl.alt = name; }
    if (roleEl)  roleEl.textContent  = role;
    if (titleEl) titleEl.textContent = name;
    if (descEl)  descEl.textContent  = desc;

    openModalById('officialModal', '.modal-x-close');
}

function closeOfficialModal() {
    closeModalById('officialModal');
}

// Allow keyboard activation on official cards (Enter / Space)
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('official-card')) {
        e.preventDefault();
        e.target.click();
    }
});


// ============================================================
// DISASTER ACCORDION
// ============================================================

function toggleDisaster(id) {
    const card = document.getElementById(`disaster-${id}`);
    if (!card) return;

    const isOpen = card.classList.contains('is-open');
    const btn    = card.querySelector('.disaster-header');

    // Close all other open cards
    document.querySelectorAll('.disaster-card.is-open').forEach(c => {
        if (c !== card) {
            c.classList.remove('is-open');
            const b = c.querySelector('.disaster-header');
            if (b) b.setAttribute('aria-expanded', 'false');
        }
    });

    // Toggle this one
    if (isOpen) {
        card.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
        card.classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
}


// ============================================================
// FAQ ACCORDION
// ============================================================

function toggleFaq(btn) {
    const item     = btn.closest('.faq-item');
    const answer   = item && item.querySelector('.faq-answer');
    const chevron  = btn.querySelector('.faq-chevron');
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Collapse all other FAQ items
    document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(otherBtn => {
        if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherItem    = otherBtn.closest('.faq-item');
            const otherAnswer  = otherItem?.querySelector('.faq-answer');
            const otherChevron = otherBtn.querySelector('.faq-chevron');
            if (otherItem)    otherItem.classList.remove('is-open');
            if (otherAnswer)  otherAnswer.classList.remove('open');
            if (otherChevron) otherChevron.style.transform = '';
        }
    });

    // Toggle this item
    btn.setAttribute('aria-expanded', String(!isOpen));
    if (item)    item.classList.toggle('is-open', !isOpen);
    if (answer)  answer.classList.toggle('open', !isOpen);
    if (chevron) chevron.style.transform = !isOpen ? 'rotate(90deg)' : '';
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
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (JPG, PNG, GIF).');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be under 10MB.');
        return;
    }

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
    const fileInput   = document.getElementById('concern-image');
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview     = document.getElementById('uploadPreview');
    const previewImg  = document.getElementById('previewImg');

    if (fileInput)   fileInput.value = '';
    if (previewImg)  previewImg.src  = '';
    if (placeholder) placeholder.style.display = 'block';
    if (preview)     preview.style.display = 'none';
}

function handleDragOver(event) {
    event.preventDefault();
    const area = document.getElementById('imageUploadArea');
    if (area) area.classList.add('drag-over');
}

function handleDragLeave() {
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
        // Observer already created — just watch any new un-revealed elements
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
// HIDE HEADER ON SCROLL DOWN / SHOW ON SCROLL UP
// ============================================================

function initScrollHeader() {
    const header = document.getElementById('headerWrapper');
    if (!header) return;

    let lastY    = 0;
    let ticking  = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const currentY = window.scrollY;

                if (currentY > lastY && currentY > 140) {
                    // Scrolling down — hide header
                    header.classList.add('scroll-hide');
                    closeMobileNav(); // Also close nav if open
                } else {
                    // Scrolling up — show header
                    header.classList.remove('scroll-hide');
                }

                lastY   = currentY <= 0 ? 0 : currentY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}


// ============================================================
// FACILITY FILTER (About page)
// ============================================================

function filterSelection(category) {
    const cards          = document.getElementsByClassName('facility-card');
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

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
    });
}


// ============================================================
// RECAPTCHA WIDGET IDs (for multi-form reset support)
// ============================================================

let contactRecaptchaWidgetId = null;
let apptRecaptchaWidgetId    = null;

/**
 * Called by the reCAPTCHA API after it loads (via onload callback).
 * Explicitly renders reCAPTCHA widgets so we can track widget IDs.
 */
function onRecaptchaLoad() {
    const contactContainer = document.getElementById('contact-recaptcha');
    const apptContainer    = document.getElementById('appt-recaptcha');

    if (contactContainer && typeof grecaptcha !== 'undefined') {
        contactRecaptchaWidgetId = grecaptcha.render(contactContainer, {
            sitekey: '6LeBevosAAAAABz58r9cTLM-Zt-FCiPMAGf9jKqa',
            theme:   getRecaptchaTheme()
        });
    }

    if (apptContainer && typeof grecaptcha !== 'undefined') {
        apptRecaptchaWidgetId = grecaptcha.render(apptContainer, {
            sitekey: '6LeBevosAAAAABz58r9cTLM-Zt-FCiPMAGf9jKqa',
            theme:   getRecaptchaTheme()
        });
    }
}

function getRecaptchaTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Checks whether a reCAPTCHA widget has been completed.
 * @param {number|null} widgetId
 * @returns {boolean}
 */
function isRecaptchaVerified(widgetId) {
    if (typeof grecaptcha === 'undefined') return false;
    try {
        const response = widgetId !== null
            ? grecaptcha.getResponse(widgetId)
            : grecaptcha.getResponse();
        return response.length > 0;
    } catch (err) {
        return false;
    }
}


// ============================================================
// CONTACT / CONCERN FORM VALIDATION & SUBMISSION
// ============================================================

function initContactForm() {
    const form = document.getElementById('services-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;

        // Validate required text/textarea/select fields
        form.querySelectorAll('[required]').forEach(field => {
            clearFieldError(field);
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            }
        });

        // Email format check
        const emailField = form.querySelector('#Email');
        if (emailField && emailField.value.trim() && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address.');
            valid = false;
        }

        // Philippine mobile number format check
        const mobileField = form.querySelector('#Mobile');
        if (mobileField && mobileField.value.trim() && !isValidPHMobile(mobileField.value)) {
            showFieldError(mobileField, 'Please enter a valid Philippine mobile number (e.g. 09XX-XXX-XXXX).');
            valid = false;
        }

        // reCAPTCHA check
        const captchaError = document.getElementById('contact-recaptcha-error');
        if (!isRecaptchaVerified(contactRecaptchaWidgetId)) {
            if (captchaError) captchaError.style.display = 'block';
            valid = false;
        } else {
            if (captchaError) captchaError.style.display = 'none';
        }

        if (valid) {
            openModal();
        } else {
            // Focus first error
            const firstError = form.querySelector('.field-error');
            if (firstError) firstError.focus();
        }
    });

    // Remove error state on input
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
    });

    // Hide captcha error when completed
    const captchaEl = document.getElementById('contact-recaptcha');
    if (captchaEl) {
        // Observe attribute changes (reCAPTCHA sets data-* when completed)
        const observer = new MutationObserver(() => {
            if (isRecaptchaVerified(contactRecaptchaWidgetId)) {
                const errEl = document.getElementById('contact-recaptcha-error');
                if (errEl) errEl.style.display = 'none';
            }
        });
        observer.observe(captchaEl, { attributes: true, subtree: true, childList: true });
    }
}


// ============================================================
// APPOINTMENT FORM — VALIDATION & SUBMISSION
// ============================================================

/**
 * Shows/hides the "Other Concern" textarea based on appointment type selection.
 * Called via inline onchange in the HTML.
 * @param {string} value - Selected option value
 */
function handleApptTypeChange(value) {
    const otherGroup = document.getElementById('appt-other-group');
    const otherTextarea = document.getElementById('appt-other-concern');
    if (!otherGroup) return;

    if (value === 'Other Concern') {
        otherGroup.style.display = 'block';
        if (otherTextarea) otherTextarea.setAttribute('required', 'required');
    } else {
        otherGroup.style.display = 'none';
        if (otherTextarea) {
            otherTextarea.removeAttribute('required');
            clearFieldError(otherTextarea);
        }
    }
}

/**
 * Sets date constraints on the appointment date picker:
 * - Minimum date: next business day (or today if before 4PM)
 * - Disable weekends via oninput validation
 */
function initAppointmentDateConstraints() {
    const dateInput = document.getElementById('appt-date');
    if (!dateInput) return;

    const today = new Date();
    // Cutoff at 4:00 PM — next day if after cutoff
    const cutoffHour = 16;
    let minDate = new Date(today);

    if (today.getHours() >= cutoffHour) {
        minDate.setDate(minDate.getDate() + 1);
    }

    // Skip to Monday if min date falls on weekend
    while (minDate.getDay() === 0 || minDate.getDay() === 6) {
        minDate.setDate(minDate.getDate() + 1);
    }

    // Set max date: 60 days from today
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    dateInput.min = formatDateInput(minDate);
    dateInput.max = formatDateInput(maxDate);

    // Validate that selected date is a weekday
    dateInput.addEventListener('change', () => {
        const selected = new Date(dateInput.value + 'T00:00:00');
        const day = selected.getDay();
        if (day === 0 || day === 6) {
            showFieldError(dateInput, 'Please select a weekday (Monday – Friday). The office is closed on weekends.');
            dateInput.value = '';
        } else {
            clearFieldError(dateInput);
        }
    });
}

function formatDateInput(date) {
    const y  = date.getFullYear();
    const m  = String(date.getMonth() + 1).padStart(2, '0');
    const d  = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Handles time slot selection UI (radio button group styled as cards).
 * Highlights the selected slot visually.
 */
function initTimeslotSelection() {
    const grid = document.getElementById('timeslotGrid');
    if (!grid) return;

    grid.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.name === 'appt_time') {
            // Remove selected class from all options
            grid.querySelectorAll('.timeslot-option').forEach(opt => opt.classList.remove('selected'));
            // Add to the parent label of the checked radio
            e.target.closest('.timeslot-option')?.classList.add('selected');

            // Update hidden input and clear error
            const hiddenInput = document.getElementById('appt-time-hidden');
            if (hiddenInput) hiddenInput.value = e.target.value;
            const timeslotErr = document.getElementById('timeslot-error');
            if (timeslotErr) timeslotErr.style.display = 'none';
        }
    });
}

/**
 * Generates a random appointment tracking number.
 * Format: BC5-YYYYMMDD-XXXX (e.g. BC5-20260524-7A3F)
 */
function generateTrackingNumber() {
    const now     = new Date();
    const dateStr = formatDateInput(now).replace(/-/g, '');
    const rand    = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BC5-${dateStr}-${rand}`;
}

function initAppointmentForm() {
    const form = document.getElementById('appointment-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;

        // Validate required fields
        form.querySelectorAll('[required]').forEach(field => {
            clearFieldError(field);
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            }
        });

        // Appointment type
        const apptType = form.querySelector('#appt-type');
        if (apptType && !apptType.value) {
            showFieldError(apptType, 'Please select a request type.');
            valid = false;
        }

        // Date validation
        const dateInput = form.querySelector('#appt-date');
        if (dateInput && dateInput.value) {
            const selected = new Date(dateInput.value + 'T00:00:00');
            const day = selected.getDay();
            if (day === 0 || day === 6) {
                showFieldError(dateInput, 'Please select a weekday (Monday – Friday).');
                valid = false;
            }
        }

        // Time slot
        const selectedTime = form.querySelector('input[name="appt_time"]:checked');
        const timeslotErr  = document.getElementById('timeslot-error');
        if (!selectedTime) {
            if (timeslotErr) timeslotErr.style.display = 'block';
            valid = false;
        } else {
            if (timeslotErr) timeslotErr.style.display = 'none';
        }

        // Contact number
        const contactField = form.querySelector('#appt-contact');
        if (contactField && contactField.value.trim() && !isValidPHMobile(contactField.value)) {
            showFieldError(contactField, 'Please enter a valid Philippine mobile number.');
            valid = false;
        }

        // Email (optional but validated if provided)
        const emailField = form.querySelector('#appt-email');
        if (emailField && emailField.value.trim() && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address.');
            valid = false;
        }

        // reCAPTCHA check
        const captchaError = document.getElementById('appt-recaptcha-error');
        if (!isRecaptchaVerified(apptRecaptchaWidgetId)) {
            if (captchaError) captchaError.style.display = 'block';
            valid = false;
        } else {
            if (captchaError) captchaError.style.display = 'none';
        }

        if (!valid) {
            const firstError = form.querySelector('.field-error');
            if (firstError) firstError.focus();
            return;
        }

        // Build confirmation summary
        const nameVal    = form.querySelector('#appt-name')?.value || '';
        const typeVal    = apptType?.options[apptType?.selectedIndex]?.text || '';
        const dateVal    = dateInput?.value
            ? new Date(dateInput.value + 'T00:00:00').toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
            : '';
        const timeVal    = selectedTime?.value || '';
        const trackingNo = generateTrackingNumber();

        const summary = `
            <p>Thank you, <strong>${escapeHtml(nameVal)}</strong>! Your appointment has been received.</p>
            <div class="appt-confirm-grid">
                <div class="appt-confirm-row"><span>Request:</span><strong>${escapeHtml(typeVal)}</strong></div>
                <div class="appt-confirm-row"><span>Date:</span><strong>${escapeHtml(dateVal)}</strong></div>
                <div class="appt-confirm-row"><span>Time:</span><strong>${escapeHtml(timeVal)}</strong></div>
            </div>
            <p class="appt-confirm-note">We will confirm your schedule via SMS or email. Please arrive 10 minutes before your scheduled time.</p>
        `;

        openAppointmentModal(trackingNo, summary);
    });

    // Live error clearing on input
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
        field.addEventListener('change', () => clearFieldError(field));
    });

    // Hide captcha error when completed
    const captchaEl = document.getElementById('appt-recaptcha');
    if (captchaEl) {
        const observer = new MutationObserver(() => {
            if (isRecaptchaVerified(apptRecaptchaWidgetId)) {
                const errEl = document.getElementById('appt-recaptcha-error');
                if (errEl) errEl.style.display = 'none';
            }
        });
        observer.observe(captchaEl, { attributes: true, subtree: true, childList: true });
    }
}


// ============================================================
// FORM HELPER UTILITIES
// ============================================================

/**
 * Marks a form field as invalid and shows a message.
 * @param {HTMLElement} field
 * @param {string} message
 */
function showFieldError(field, message) {
    field.classList.add('field-error');
    field.setAttribute('aria-invalid', 'true');

    // Look for an existing error message element just after the field
    let errEl = field.nextElementSibling;
    if (!errEl || !errEl.classList.contains('inline-error')) {
        errEl = document.createElement('p');
        errEl.className = 'inline-error field-error-msg';
        field.parentNode.insertBefore(errEl, field.nextSibling);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
}

/**
 * Removes error state from a field.
 * @param {HTMLElement} field
 */
function clearFieldError(field) {
    field.classList.remove('field-error');
    field.removeAttribute('aria-invalid');

    const errEl = field.nextElementSibling;
    if (errEl && errEl.classList.contains('inline-error')) {
        errEl.style.display = 'none';
        errEl.textContent = '';
    }
}

/**
 * Validates a Philippine mobile number format.
 * Accepts: 09XXXXXXXXX, +639XXXXXXXXX, 09XX-XXX-XXXX
 */
function isValidPHMobile(value) {
    const cleaned = value.replace(/[\s\-()]/g, '');
    return /^(09|\+639)\d{9}$/.test(cleaned);
}

/**
 * Basic email format validation.
 */
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Escapes HTML special characters to prevent XSS in innerHTML.
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}


// ============================================================
// SERVICE CATEGORY TABS
// ============================================================

/**
 * Switches the active service category tab panel.
 * @param {string} tabId - 'documents' | 'office' | 'business' | 'community'
 */
function switchServiceTab(tabId) {
    // Deactivate all tab buttons
    document.querySelectorAll('.service-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    // Hide all tab panels (with fade-out)
    document.querySelectorAll('.service-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Activate selected tab button
    const activeBtn = document.getElementById(`tab-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }

    // Show selected panel (with slight delay for smooth transition)
    const activePanel = document.getElementById(`svc-${tabId}`);
    if (activePanel) {
        requestAnimationFrame(() => {
            activePanel.classList.add('active');
        });
    }
}


// ============================================================
// GLOBAL SEARCH ENGINE
// ============================================================

/**
 * Search index — each entry maps keywords to a destination page + section.
 * The system also performs live text searches across all visible page content.
 */
const SEARCH_INDEX = [
    // Documents & Certificates
    { keywords: ['clearance','barangay clearance','cedula','residency','certificate','indigency','good moral','moral','id','barangay id','document','documents'], page: 'services', section: 'request-documents-section', label: 'Barangay Clearance & Documents', desc: 'Request official documents at the Barangay Hall', icon: '📋' },
    { keywords: ['cedula','community tax','tax certificate'], page: 'services', section: 'request-documents-section', label: 'Cedula / Community Tax Certificate', desc: 'Annual tax certificate required for transactions', icon: '📜' },
    { keywords: ['residency','certificate of residency'], page: 'services', section: 'request-documents-section', label: 'Certificate of Residency', desc: 'Proof of residence in Barangay CINCO', icon: '🏠' },

    // Appointment
    { keywords: ['appointment','schedule','book','visit','reserve'], page: 'services', section: 'schedule-appointment-section', label: 'Schedule an Appointment', desc: 'Book your visit to the Barangay Hall', icon: '📅' },

    // Business & Permits
    { keywords: ['permit','business permit','business','clearance business','renewal'], page: 'services', section: 'serviceCategoryTabs', label: 'Business Permit Clearance', desc: 'Required for all businesses operating in the barangay', icon: '💼', tab: 'business' },

    // Officials
    { keywords: ['official','officials','captain','kagawad','secretary','treasurer','sk','council','barangay captain','padellon'], page: 'officials', section: null, label: 'Barangay Officials', desc: 'Meet the elected officials of Barangay CINCO', icon: '⚖️' },
    { keywords: ['contact','concern','complaint','inquiry','report'], page: 'officials', section: 'services-form-container', label: 'Submit a Concern', desc: 'Contact the Barangay and file a concern', icon: '📞' },

    // Announcements
    { keywords: ['announcement','announcements','news','notice','event','events','update','cooperative'], page: 'announcements', section: null, label: 'Announcements & News', desc: 'Latest news and community notices', icon: '📰' },
    { keywords: ['job fair','job','employment','career','opportunity'], page: 'announcements', section: null, label: 'Job Fair & Career Opportunities', desc: 'Employment opportunities and job fair events', icon: '💼' },

    // FAQ
    { keywords: ['faq','question','how to','requirements','processing','fee'], page: 'faq', section: null, label: 'Frequently Asked Questions', desc: 'Quick answers to common resident questions', icon: '❓' },
    { keywords: ['office hours','hours','schedule','open','closed'], page: 'faq', section: null, label: 'Office Hours & Schedule', desc: 'When the Barangay Hall is open', icon: '🕐' },

    // Safety & Preparedness
    { keywords: ['hotline','emergency','911','police','fire','ambulance','rescue','disaster'], page: 'safety', section: null, label: 'Emergency Hotlines', desc: 'Emergency contacts for police, fire, ambulance', icon: '🚨' },
    { keywords: ['typhoon','flood','earthquake','fire safety','landslide','preparedness','disaster','safety'], page: 'safety', section: null, label: 'Disaster Preparedness Guide', desc: 'How to prepare before, during, and after disasters', icon: '⛈️' },

    // About
    { keywords: ['about','history','mission','vision','cinco','barangay cinco','location','map'], page: 'history', section: null, label: 'About Barangay CINCO', desc: 'History, mission, vision and community information', icon: '🏛' },
    { keywords: ['population','households','purok','statistics','facts'], page: 'history', section: null, label: 'Barangay Statistics', desc: 'Population, households, and community data', icon: '📊' },

    // Health & Community Programs
    { keywords: ['health','medical','check-up','consultation','clinic','health center'], page: 'services', section: 'serviceCategoryTabs', label: 'Health Services', desc: 'Free medical consultations at the Health Center', icon: '❤️', tab: 'community' },
    { keywords: ['senior','senior citizen','elderly','pwd','disability'], page: 'services', section: 'serviceCategoryTabs', label: 'Senior Citizen Assistance', desc: 'Benefits and services for senior citizens', icon: '👴', tab: 'community' },
    { keywords: ['waste','garbage','segregation','clean-up','environment'], page: 'services', section: 'serviceCategoryTabs', label: 'Waste Management', desc: 'Garbage collection schedule and guidelines', icon: '♻️', tab: 'community' },
    { keywords: ['program','programs','youth','sk','livelihood','training','community'], page: 'services', section: 'serviceCategoryTabs', label: 'Community Programs', desc: 'Health, youth, livelihood, and environmental programs', icon: '🤝', tab: 'community' },
];

let searchDebounceTimer = null;
let currentSearchQuery  = '';

/** Called by quick search chips below the search bar */
function doQuickSearch(query) {
    const input = document.getElementById('globalSearchInput');
    if (input) {
        input.value = query;
        input.focus();
        handleGlobalSearch(query);
    }
}

/** Initialize global search bar listeners */
function initGlobalSearch() {
    const input     = document.getElementById('globalSearchInput');
    const clearBtn  = document.getElementById('searchClearBtn');
    const dropdown  = document.getElementById('searchSuggestions');

    if (!input) return;

    input.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        clearBtn.style.display = q ? 'flex' : 'none';

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => handleGlobalSearch(q), 180);
    });

    input.addEventListener('focus', () => {
        if (currentSearchQuery) {
            showSuggestions();
        }
    });

    // Keyboard navigation for suggestions
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.search-suggestion-item');
        const activeItem = dropdown.querySelector('.search-suggestion-item.focused');
        let idx = Array.from(items).indexOf(activeItem);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            idx = Math.min(idx + 1, items.length - 1);
            items.forEach(i => i.classList.remove('focused'));
            if (items[idx]) items[idx].classList.add('focused');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            idx = Math.max(idx - 1, 0);
            items.forEach(i => i.classList.remove('focused'));
            if (items[idx]) items[idx].classList.add('focused');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItem) {
                activeItem.click();
            } else if (currentSearchQuery) {
                executeFirstResult();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            input.blur();
        }
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.style.display = 'none';
        hideSuggestions();
        currentSearchQuery = '';
        input.focus();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        const searchSection = document.getElementById('globalSearchSection');
        if (searchSection && !searchSection.contains(e.target)) {
            hideSuggestions();
        }
    });
}

function handleGlobalSearch(query) {
    currentSearchQuery = query.toLowerCase();

    if (!currentSearchQuery) {
        hideSuggestions();
        return;
    }

    const results = getSearchResults(currentSearchQuery);
    renderSuggestions(results, currentSearchQuery);
    showSuggestions();
}

function getSearchResults(query) {
    const results = [];
    const seen    = new Set();

    // First pass: keyword-based index matches (exact and partial)
    SEARCH_INDEX.forEach(entry => {
        const match = entry.keywords.some(kw => kw.includes(query) || query.includes(kw) || kw.startsWith(query.split(' ')[0]));
        if (match && !seen.has(entry.label)) {
            results.push({ ...entry, matchType: 'index' });
            seen.add(entry.label);
        }
    });

    // Second pass: text search across all section headings and content
    const allSections = document.querySelectorAll('.dashboard-block, .history-section, .disaster-card, .hotline-card, .doc-card, .event-card, .official-card');
    allSections.forEach(section => {
        const text = section.innerText.toLowerCase();
        if (text.includes(query)) {
            // Find the closest heading for label
            const heading = section.querySelector('h2, h3, h4, .block-title, .disaster-title, .hotline-name');
            const label   = heading ? heading.textContent.trim() : 'Section';

            // Determine which page this section is in
            const page = section.closest('.page-section');
            if (page && !seen.has(label)) {
                const pageId = page.id;
                const sectionId = section.id || null;
                results.push({ label, desc: 'Match found in page content', icon: '🔍', page: pageId, section: sectionId, matchType: 'content' });
                seen.add(label);
            }
        }
    });

    return results.slice(0, 8); // Cap at 8 results
}

function renderSuggestions(results, query) {
    const inner    = document.getElementById('searchSuggestionsInner');
    const noResult = document.getElementById('searchNoResults');

    if (!inner) return;
    inner.innerHTML = '';

    if (!results.length) {
        noResult.style.display = 'flex';
        return;
    }

    noResult.style.display = 'none';

    results.forEach((result, i) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item' + (i === 0 ? ' focused' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        item.setAttribute('tabindex', '-1');

        const highlightedLabel = highlightMatch(result.label, query);
        const badge = result.matchType === 'index' ? `<span class="search-badge search-badge--${result.page}">${getPageBadge(result.page)}</span>` : '<span class="search-badge search-badge--content">Content</span>';

        item.innerHTML = `
            <span class="search-sug-icon">${result.icon || '🔍'}</span>
            <div class="search-sug-body">
                <div class="search-sug-label">${highlightedLabel} ${badge}</div>
                <div class="search-sug-desc">${escapeHtml(result.desc || '')}</div>
            </div>
            <svg class="search-sug-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        `;

        item.addEventListener('click', () => navigateToResult(result));
        item.addEventListener('mouseenter', () => {
            inner.querySelectorAll('.search-suggestion-item').forEach(i => i.classList.remove('focused'));
            item.classList.add('focused');
        });

        inner.appendChild(item);
    });
}

function highlightMatch(text, query) {
    const safe  = escapeHtml(text);
    const safeQ = escapeHtml(query);
    const regex = new RegExp(`(${safeQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return safe.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function getPageBadge(pageId) {
    const map = { history: 'About', announcements: 'News', faq: 'FAQ', safety: 'Safety', services: 'Services', officials: 'Officials' };
    return map[pageId] || 'Page';
}

function navigateToResult(result) {
    hideSuggestions();
    const input = document.getElementById('globalSearchInput');
    if (input) input.blur();

    // Switch to the correct page
    showPage(result.page);

    // If a service tab needs to be activated
    if (result.tab) {
        setTimeout(() => switchServiceTab(result.tab), 100);
    }

    // Scroll to specific section
    if (result.section) {
        scrollToSection(result.section);
    }

    // Highlight matching sections briefly
    setTimeout(() => highlightSearchResult(result.section || result.page), 400);
}

function executeFirstResult() {
    const results = getSearchResults(currentSearchQuery);
    if (results.length) navigateToResult(results[0]);
}

function highlightSearchResult(sectionId) {
    const el = sectionId ? document.getElementById(sectionId) : null;
    if (!el) return;

    el.classList.add('search-result-highlight');
    setTimeout(() => el.classList.remove('search-result-highlight'), 2200);
}

function showSuggestions() {
    const dropdown = document.getElementById('searchSuggestions');
    const input    = document.getElementById('globalSearchInput');
    if (dropdown) dropdown.style.display = 'block';
    if (input)    input.setAttribute('aria-expanded', 'true');
}

function hideSuggestions() {
    const dropdown = document.getElementById('searchSuggestions');
    const input    = document.getElementById('globalSearchInput');
    if (dropdown) dropdown.style.display = 'none';
    if (input)    input.setAttribute('aria-expanded', 'false');
}


// ============================================================
// ANNOUNCEMENTS SECTION — Optional filter/search
// ============================================================

/**
 * Filters announcement cards by category tag.
 * Expects cards with data-category attribute.
 * @param {string} category - 'all' or specific category
 */
function filterAnnouncements(category) {
    const cards = document.querySelectorAll('.announcement-card');

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
            card.classList.add('show');
        } else {
            card.style.display = 'none';
            card.classList.remove('show');
        }
    });

    // Update active state on filter buttons
    document.querySelectorAll('.announcement-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
}

/**
 * Search through announcement cards by text content.
 * @param {string} query
 */
function searchAnnouncements(query) {
    const q     = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.announcement-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
}

function initAnnouncementsSection() {
    const searchInput = document.getElementById('announcement-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => searchAnnouncements(e.target.value));
    }

    // Attach filter buttons if present
    document.querySelectorAll('.announcement-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterAnnouncements(btn.dataset.filter || 'all'));
    });
}


// ============================================================
// KEYBOARD ACCESSIBILITY HELPERS
// ============================================================

/**
 * Allow Enter/Space to trigger click on elements with role="button".
 */
function initKeyboardAccessibility() {
    document.addEventListener('keydown', (e) => {
        const el = e.target;
        if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute('role') === 'button') {
            e.preventDefault();
            el.click();
        }
    });
}


// ============================================================
// LOADING ANIMATION (Optional page reveal)
// ============================================================

function initPageLoadAnimation() {
    document.body.classList.add('page-loaded');
}


// ============================================================
// INITIALISE ON DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // Show the "About" page by default on first load
    showPage('history');

    // Core UI setup
    initTheme();
    initMobileNav();
    initScrollHeader();
    initKeyboardAccessibility();
    initPageLoadAnimation();

    // Features
    initializeNewsSlideshow();
    observeScrollElements();
    initContactForm();
    initAppointmentForm();
    initAppointmentDateConstraints();
    initTimeslotSelection();
    initAnnouncementsSection();
    initGlobalSearch();
});