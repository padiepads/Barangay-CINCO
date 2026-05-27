'use strict';

// ============================================================
// SINGLE PAGE ROUTER
// ============================================================

function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    document.querySelectorAll('.nav-links button[id^="link-"]').forEach(btn => {
        btn.classList.remove('active-link');
        btn.removeAttribute('aria-current');
    });

    const activeBtn = document.getElementById(`link-${pageId}`);
    if (activeBtn) {
        activeBtn.classList.add('active-link');
        activeBtn.setAttribute('aria-current', 'page');
    }

    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(observeScrollElements, 100);
}

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

    const activeDot = dots[activeSlideIndex - 1];
    if (activeDot) {
        activeDot.classList.add('slide-active');
        activeDot.setAttribute('aria-selected', 'true');
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

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('show');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            closeMobileNav();
        }
    });

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
// SEARCH BAR TOGGLE (expand/collapse on icon click)
// ============================================================

function initSearchBarToggle() {
    const toggleBtn    = document.getElementById('navSearchToggle');
    const expandPanel  = document.getElementById('navSearchExpand');
    const closeBtn     = document.getElementById('navSearchClose');
    const searchInput  = document.getElementById('navSearchInput');
    const wrapper      = document.getElementById('navSearchWrapper');

    if (!toggleBtn || !expandPanel) return;

    // Create nav search dropdown (appended to body for z-index)
    let navDropdown = document.getElementById('navSearchDropdown');
    if (!navDropdown) {
        navDropdown = document.createElement('div');
        navDropdown.id = 'navSearchDropdown';
        navDropdown.className = 'nav-search-dropdown';
        navDropdown.setAttribute('role', 'listbox');
        navDropdown.setAttribute('aria-label', 'Search suggestions');
        navDropdown.style.display = 'none';
        document.body.appendChild(navDropdown);

        if (!document.getElementById('navSearchDropdownStyles')) {
            const style = document.createElement('style');
            style.id = 'navSearchDropdownStyles';
            style.textContent = `
                .nav-search-dropdown {
                    position: fixed;
                    background: var(--surface, #fff);
                    border: 1.5px solid var(--border, #eceae3);
                    border-radius: 12px;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
                    z-index: 99999;
                    overflow: hidden;
                    min-width: 300px;
                    max-width: 420px;
                    animation: navDropIn 0.18s cubic-bezier(0.16,1,0.3,1) both;
                }
                @keyframes navDropIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: none; }
                }
                .nav-search-dropdown .search-suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 11px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border, #eceae3);
                    transition: background 0.15s ease;
                    font-family: 'DM Sans', system-ui, sans-serif;
                }
                .nav-search-dropdown .search-suggestion-item:last-child { border-bottom: none; }
                .nav-search-dropdown .search-suggestion-item:hover,
                .nav-search-dropdown .search-suggestion-item.focused {
                    background: var(--surface-alt, #f5f4f0);
                }
                .nav-search-dropdown .search-sug-icon {
                    font-size: 1.2rem;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--surface-alt, #f5f4f0);
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                .nav-search-dropdown .search-sug-body { flex: 1; min-width: 0; }
                .nav-search-dropdown .search-sug-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-heading, #1a1a1a);
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                    white-space: normal;
                }
                .nav-search-dropdown .search-sug-desc {
                    font-size: 0.75rem;
                    color: var(--text-secondary, #6b6660);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .nav-search-dropdown .search-sug-arrow { color: var(--text-secondary, #6b6660); flex-shrink: 0; }
                .nav-search-dropdown .search-suggestion-item:hover .search-sug-arrow,
                .nav-search-dropdown .search-suggestion-item.focused .search-sug-arrow { color: #7b0d1e; }
                .nav-search-dropdown .search-no-results {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 22px 16px;
                    color: var(--text-secondary, #6b6660);
                    font-size: 0.875rem;
                    gap: 8px;
                    text-align: center;
                    font-family: 'DM Sans', system-ui, sans-serif;
                }
                .nav-search-dropdown .search-highlight {
                    background: rgba(200,147,42,0.25);
                    color: #7b0d1e;
                    border-radius: 2px;
                    padding: 0 2px;
                    font-weight: 700;
                }
                [data-theme="dark"] .nav-search-dropdown { background: #1e1c19; border-color: #2e2c28; box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
                [data-theme="dark"] .nav-search-dropdown .search-suggestion-item:hover,
                [data-theme="dark"] .nav-search-dropdown .search-suggestion-item.focused { background: #252320; }
                [data-theme="dark"] .nav-search-dropdown .search-sug-icon { background: #252320; }
                [data-theme="dark"] .nav-search-dropdown .search-sug-label { color: #f0ece4; }
                [data-theme="dark"] .nav-search-dropdown .search-highlight { background: rgba(200,147,42,0.2); color: #e6aa3a; }
                [data-theme="dark"] .nav-search-dropdown .search-suggestion-item:hover .search-sug-arrow,
                [data-theme="dark"] .nav-search-dropdown .search-suggestion-item.focused .search-sug-arrow { color: #d4a040; }
            `;
            document.head.appendChild(style);
        }
    }

    function positionNavDropdown() {
        const rect = expandPanel.getBoundingClientRect();
        navDropdown.style.top   = (rect.bottom + 8) + 'px';
        navDropdown.style.right = (window.innerWidth - rect.right) + 'px';
        navDropdown.style.left  = 'auto';
    }

    function openNavSearch() {
        expandPanel.classList.add('expanded');
        expandPanel.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        setTimeout(() => { if (searchInput) searchInput.focus(); }, 60);
    }

    function closeNavSearch() {
        expandPanel.classList.remove('expanded');
        expandPanel.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (searchInput) searchInput.value = '';
        hideNavDropdown();
    }

    function hideNavDropdown() { navDropdown.style.display = 'none'; }

    function showNavDropdown() {
        positionNavDropdown();
        navDropdown.style.display = 'block';
    }

    function renderNavSuggestions(results, query) {
        navDropdown.innerHTML = '';
        if (!results.length) {
            navDropdown.innerHTML = `
                <div class="search-no-results">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span>No results found for "<strong>${escapeHtml(query)}</strong>"</span>
                    <span style="font-size:0.75rem;">Try a different keyword</span>
                </div>`;
            showNavDropdown();
            return;
        }
        results.forEach((result, i) => {
            const item = document.createElement('div');
            item.className = 'search-suggestion-item' + (i === 0 ? ' focused' : '');
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
            item.setAttribute('tabindex', '-1');
            const badge = result.matchType === 'index'
                ? `<span class="search-badge search-badge--${result.page}">${getPageBadge(result.page)}</span>`
                : '<span class="search-badge search-badge--content">Match</span>';
            item.innerHTML = `
                <span class="search-sug-icon">${result.icon || '&#128269;'}</span>
                <div class="search-sug-body">
                    <div class="search-sug-label">${highlightMatch(result.label, query)} ${badge}</div>
                    <div class="search-sug-desc">${escapeHtml(result.desc || '')}</div>
                </div>
                <svg class="search-sug-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`;
            item.addEventListener('click', () => { closeNavSearch(); navigateToResult(result); });
            item.addEventListener('mouseenter', () => {
                navDropdown.querySelectorAll('.search-suggestion-item').forEach(el => {
                    el.classList.remove('focused'); el.setAttribute('aria-selected', 'false');
                });
                item.classList.add('focused'); item.setAttribute('aria-selected', 'true');
            });
            navDropdown.appendChild(item);
        });
        showNavDropdown();
    }

    function handleNavSearch(query) {
        const q = query.toLowerCase().trim();
        if (!q) { hideNavDropdown(); return; }
        const results = getSearchResults(q);
        renderNavSuggestions(results, q);
    }

    if (searchInput) {
        let navSearchTimer = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(navSearchTimer);
            navSearchTimer = setTimeout(() => handleNavSearch(e.target.value), 180);
        });
        searchInput.addEventListener('keydown', (e) => {
            const items  = navDropdown.querySelectorAll('.search-suggestion-item');
            const focused = navDropdown.querySelector('.search-suggestion-item.focused');
            let idx = Array.from(items).indexOf(focused);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                idx = Math.min(idx + 1, items.length - 1);
                items.forEach(el => { el.classList.remove('focused'); el.setAttribute('aria-selected', 'false'); });
                if (items[idx]) { items[idx].classList.add('focused'); items[idx].setAttribute('aria-selected', 'true'); }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                idx = Math.max(idx - 1, 0);
                items.forEach(el => { el.classList.remove('focused'); el.setAttribute('aria-selected', 'false'); });
                if (items[idx]) { items[idx].classList.add('focused'); items[idx].setAttribute('aria-selected', 'true'); }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (focused) { focused.click(); }
                else if (searchInput.value.trim()) {
                    const q = searchInput.value.toLowerCase().trim();
                    const results = getSearchResults(q);
                    if (results.length) { closeNavSearch(); navigateToResult(results[0]); }
                }
            } else if (e.key === 'Escape') {
                closeNavSearch(); toggleBtn.focus();
            }
        });
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = expandPanel.classList.contains('expanded');
        isExpanded ? closeNavSearch() : openNavSearch();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeNavSearch(); });
    }

    document.addEventListener('click', (e) => {
        if (wrapper && !wrapper.contains(e.target) && !navDropdown.contains(e.target)) {
            closeNavSearch();
        }
    });

    window.addEventListener('resize', () => {
        if (navDropdown.style.display !== 'none') positionNavDropdown();
    });
}


// ============================================================
// MODAL UTILITIES
// ============================================================

function openModalById(modalId, focusBtnSelector = '.modal-close-btn') {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const btn = modal.querySelector(focusBtnSelector);
    if (btn) setTimeout(() => btn.focus(), 60);
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

// Close modal when clicking the overlay backdrop
document.addEventListener('click', (e) => {
    ['submissionModal', 'appointmentModal', 'docRequestModal', 'officialModal', 'eventDetailModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && modal.classList.contains('active') && e.target === modal) {
            closeModalById(id);
        }
    });
});

// Close any open modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ['submissionModal', 'appointmentModal', 'docRequestModal', 'officialModal', 'eventDetailModal'].forEach(id => {
            const modal = document.getElementById(id);
            if (modal && modal.classList.contains('active')) {
                closeModalById(id);
            }
        });
    }
});


// ============================================================
// TOAST / SUBMISSION POPUP NOTIFICATION
// ============================================================

function showToast(message, duration = 4000) {
    // Remove any existing toast
    const existing = document.getElementById('submissionToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'submissionToast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <span class="toast-icon">✅</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" aria-label="Close notification" onclick="dismissToast()">✕</button>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('toast-visible'));
    });

    // Auto-dismiss
    if (duration > 0) {
        setTimeout(() => dismissToast(), duration);
    }
}

function dismissToast() {
    const toast = document.getElementById('submissionToast');
    if (!toast) return;
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// Inject toast styles dynamically if not already in CSS
function injectToastStyles() {
    if (document.getElementById('toastStyleTag')) return;
    const style = document.createElement('style');
    style.id = 'toastStyleTag';
    style.textContent = `
        #submissionToast {
            position: fixed;
            bottom: 28px;
            right: 24px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--color-primary, #8B1A1A);
            color: #fff;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.22);
            font-size: 0.95rem;
            font-weight: 500;
            max-width: 380px;
            min-width: 260px;
            opacity: 0;
            transform: translateY(20px) scale(0.97);
            transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
            pointer-events: none;
        }
        #submissionToast.toast-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        .toast-icon { font-size: 1.2rem; flex-shrink: 0; }
        .toast-message { flex: 1; line-height: 1.4; }
        .toast-close {
            background: none;
            border: none;
            color: rgba(255,255,255,0.75);
            font-size: 1rem;
            cursor: pointer;
            padding: 0 0 0 4px;
            line-height: 1;
            flex-shrink: 0;
            transition: color 0.2s;
        }
        .toast-close:hover { color: #fff; }
        @media (max-width: 480px) {
            #submissionToast {
                bottom: 16px;
                right: 12px;
                left: 12px;
                max-width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}


// ============================================================
// CONTACT FORM MODAL (Success)
// ============================================================

function openModal() {
    openModalById('submissionModal');
    showToast('Your form has been submitted successfully.');
}

function closeModal() {
    closeModalById('submissionModal');
    const form = document.getElementById('services-form');
    if (form) form.reset();
    resetImageUpload();
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
    showToast('Your appointment has been submitted successfully.');
}

function closeAppointmentModal() {
    closeModalById('appointmentModal');
    const form = document.getElementById('appointment-form');
    if (form) form.reset();
    const otherGroup = document.getElementById('appt-other-group');
    if (otherGroup) otherGroup.style.display = 'none';
    document.querySelectorAll('.timeslot-option').forEach(opt => opt.classList.remove('selected'));
    initAppointmentDateConstraints();
}


// ============================================================
// EVENT CARD MODAL
// ============================================================

// Legacy 7-arg call signature used in HTML onclick attributes:
// openEventModal(month, day, category, tagClass, title, timeLocation, desc)
// New 5-arg signature: openEventModal(title, date, time, location, description)
// This function handles both.
function openEventModal(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    let title, dateStr, timeStr, locationStr, description;

    // Detect 7-arg legacy call: arg4 starts with 'event-tag--'
    if (arg4 && typeof arg4 === 'string' && arg4.startsWith('event-tag--')) {
        // arg1=month, arg2=day, arg3=category, arg4=tagClass, arg5=title, arg6=timeLocation, arg7=desc
        const month = arg1 || '';
        const day   = arg2 || '';
        const category = arg3 || '';
        // arg6 is like "8:00 AM – 5:00 PM · Barangay Hall" or "All day · Health Center · Open to all residents"
        const timeLocation = arg6 || '';
        dateStr = `${month} ${day}`;

        // Split timeLocation on ' · ' to extract time and location separately
        const parts = timeLocation.split(' · ');
        if (parts.length >= 2) {
            timeStr     = parts[0].trim();
            locationStr = parts.slice(1).join(' · ').trim();
        } else {
            timeStr     = timeLocation;
            locationStr = '';
        }

        // If locationStr is still empty, assign a facility based on category
        if (!locationStr) {
            const facilityMap = {
                'Maintenance':  'Barangay Hall',
                'Assembly':     'Barangay Hall',
                'Health':       'Health Center',
                'Program':      'Multi-Purpose Hall',
                'Environment':  'All Puroks',
                'Sports':       'Covered Court',
                'Governance':   'Session Hall',
                'Education':    'Barangay Hall'
            };
            locationStr = facilityMap[category] || 'Barangay Hall';
        }

        title       = arg5 || '';
        description = arg7 || '';
    } else {
        // 5-arg new signature
        title       = arg1 || '';
        dateStr     = arg2 || '';
        timeStr     = arg3 || '';
        locationStr = arg4 || '';
        description = arg5 || '';
    }

    const modal    = document.getElementById('eventDetailModal');
    const titleEl  = document.getElementById('eventModalTitle');
    const dateEl   = document.getElementById('eventModalDate');
    const timeEl   = document.getElementById('eventModalTime');
    const locEl    = document.getElementById('eventModalLocation');
    const descEl   = document.getElementById('eventModalDesc');

    // If modal doesn't exist yet, create it dynamically
    if (!modal) {
        createEventModal();
        // Re-call after modal is created
        setTimeout(() => openEventModal(arg1, arg2, arg3, arg4, arg5, arg6, arg7), 50);
        return;
    }

    if (titleEl)  titleEl.textContent  = title       || '';
    if (dateEl)   dateEl.textContent   = dateStr     || '';
    if (timeEl)   timeEl.textContent   = timeStr     || '';
    if (locEl)    locEl.textContent    = locationStr || '';
    if (descEl)   descEl.innerHTML     = description || '';

    openModalById('eventDetailModal', '.event-modal-close');
}

function closeEventModal() {
    closeModalById('eventDetailModal');
}

function createEventModal() {
    if (document.getElementById('eventDetailModal')) return;

    const modal = document.createElement('div');
    modal.id = 'eventDetailModal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'eventModalTitle');

    modal.innerHTML = `
        <div class="modal-box event-modal-box">
            <button class="modal-x-close event-modal-close" onclick="closeEventModal()" aria-label="Close event details">✕</button>
            <div class="event-modal-header">
                <h2 id="eventModalTitle" class="event-modal-title"></h2>
            </div>
            <div class="event-modal-meta">
                <div class="event-meta-row">
                    <span class="event-meta-icon">📅</span>
                    <span id="eventModalDate"></span>
                </div>
                <div class="event-meta-row">
                    <span class="event-meta-icon">🕐</span>
                    <span id="eventModalTime"></span>
                </div>
                <div class="event-meta-row">
                    <span class="event-meta-icon">📍</span>
                    <span id="eventModalLocation"></span>
                </div>
            </div>
            <div id="eventModalDesc" class="event-modal-desc"></div>
        </div>
    `;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEventModal();
    });

    document.body.appendChild(modal);

    // Inject event modal styles
    if (!document.getElementById('eventModalStyleTag')) {
        const style = document.createElement('style');
        style.id = 'eventModalStyleTag';
        style.textContent = `
            .event-modal-box {
                max-width: 540px;
                width: 92%;
                border-radius: 16px;
                padding: 0;
                overflow: hidden;
            }
            .event-modal-header {
                background: var(--color-primary, #8B1A1A);
                color: #fff;
                padding: 28px 32px 20px;
            }
            .event-modal-title {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 700;
                line-height: 1.4;
                color: #fff;
            }
            .event-modal-meta {
                padding: 20px 32px 12px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                border-bottom: 1px solid var(--color-border, #e5e5e5);
            }
            .event-meta-row {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                font-size: 0.95rem;
                color: var(--color-text, #333);
            }
            .event-meta-icon { flex-shrink: 0; }
            .event-modal-desc {
                padding: 20px 32px 28px;
                font-size: 0.93rem;
                line-height: 1.65;
                color: var(--color-text-secondary, #555);
            }
            .event-modal-close {
                position: absolute;
                top: 14px;
                right: 16px;
                background: rgba(255,255,255,0.2);
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                z-index: 10;
            }
            .event-modal-close:hover { background: rgba(255,255,255,0.35); }
            @media (max-width: 540px) {
                .event-modal-header,
                .event-modal-meta,
                .event-modal-desc { padding-left: 20px; padding-right: 20px; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Make event cards clickable — wire up any existing cards in the DOM
function initEventCards() {
    document.querySelectorAll('.event-card[data-event-title], .event-card[onclick]').forEach(card => {
        // Already wired via onclick attribute — skip
        if (card.getAttribute('onclick')) return;

        card.style.cursor = 'pointer';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        const title    = card.dataset.eventTitle    || card.querySelector('.event-title, h3, h4')?.textContent?.trim() || 'Event';
        const date     = card.dataset.eventDate     || card.querySelector('.event-date')?.textContent?.trim()          || '';
        const time     = card.dataset.eventTime     || card.querySelector('.event-time')?.textContent?.trim()          || '';
        const location = card.dataset.eventLocation || card.querySelector('.event-location')?.textContent?.trim()      || '';
        const desc     = card.dataset.eventDesc     || card.querySelector('.event-desc, p')?.innerHTML?.trim()         || '';

        const handler = () => openEventModal(title, date, time, location, desc);
        card.addEventListener('click', handler);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
        });
    });
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
    body.innerHTML    = info.body;

    openModalById('docRequestModal', '.modal-close-btn--maroon');
}

function closeDocModal() {
    closeModalById('docRequestModal');
}


// ============================================================
// OFFICIAL DETAIL MODAL
// ============================================================

function openOfficialModal(imgSrc, role, name, desc) {
    const modal    = document.getElementById('officialModal');
    const imgEl    = document.getElementById('officialModalImg');
    const roleEl   = document.getElementById('officialModalRole');
    const titleEl  = document.getElementById('officialModalTitle');
    const descEl   = document.getElementById('officialModalDesc');

    if (!modal) return;

    if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.alt = name;
        // Ensure image displays fully without cropping
        imgEl.style.width       = '100%';
        imgEl.style.height      = 'auto';
        imgEl.style.maxHeight   = '320px';
        imgEl.style.objectFit   = 'contain';
        imgEl.style.objectPosition = 'top center';
        imgEl.style.display     = 'block';
        imgEl.style.borderRadius = '8px';
    }
    if (roleEl)  roleEl.textContent  = role;
    if (titleEl) titleEl.textContent = name;
    if (descEl) {
        descEl.textContent  = desc;
        descEl.style.textAlign = 'justify';
    }

    openModalById('officialModal', '.modal-x-close');
}

function closeOfficialModal() {
    closeModalById('officialModal');
}

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
// FAQ ACCORDION
// ============================================================

function toggleFaq(btn) {
    const item     = btn.closest('.faq-item');
    const answer   = item && item.querySelector('.faq-answer');
    const chevron  = btn.querySelector('.faq-chevron');
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

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
    event.stopPropagation();
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
                    header.classList.add('scroll-hide');
                    closeMobileNav();
                } else {
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

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
    });
}


// ============================================================
// CONTACT / CONCERN FORM VALIDATION & SUBMISSION
// (reCAPTCHA removed — form submits without CAPTCHA check)
// ============================================================

function initContactForm() {
    const form = document.getElementById('services-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;

        form.querySelectorAll('[required]').forEach(field => {
            clearFieldError(field);
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            }
        });

        const emailField = form.querySelector('#Email');
        if (emailField && emailField.value.trim() && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address.');
            valid = false;
        }

        const mobileField = form.querySelector('#Mobile');
        if (mobileField && mobileField.value.trim() && !isValidPHMobile(mobileField.value)) {
            showFieldError(mobileField, 'Please enter a valid Philippine mobile number (e.g. 09XX-XXX-XXXX).');
            valid = false;
        }

        if (valid) {
            openModal();
        } else {
            const firstError = form.querySelector('.field-error');
            if (firstError) firstError.focus();
        }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
    });
}


// ============================================================
// APPOINTMENT FORM — VALIDATION & SUBMISSION
// (reCAPTCHA removed — form submits without CAPTCHA check)
// ============================================================

function handleApptTypeChange(value) {
    const otherGroup    = document.getElementById('appt-other-group');
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

function initAppointmentDateConstraints() {
    const dateInput = document.getElementById('appt-date');
    if (!dateInput) return;

    const today     = new Date();
    const cutoffHour = 16;
    let minDate = new Date(today);

    if (today.getHours() >= cutoffHour) {
        minDate.setDate(minDate.getDate() + 1);
    }

    while (minDate.getDay() === 0 || minDate.getDay() === 6) {
        minDate.setDate(minDate.getDate() + 1);
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    dateInput.min = formatDateInput(minDate);
    dateInput.max = formatDateInput(maxDate);

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

function initTimeslotSelection() {
    const grid = document.getElementById('timeslotGrid');
    if (!grid) return;

    grid.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.name === 'appt_time') {
            grid.querySelectorAll('.timeslot-option').forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.timeslot-option')?.classList.add('selected');

            const hiddenInput = document.getElementById('appt-time-hidden');
            if (hiddenInput) hiddenInput.value = e.target.value;
            const timeslotErr = document.getElementById('timeslot-error');
            if (timeslotErr) timeslotErr.style.display = 'none';
        }
    });
}

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

        form.querySelectorAll('[required]').forEach(field => {
            clearFieldError(field);
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            }
        });

        const apptType = form.querySelector('#appt-type');
        if (apptType && !apptType.value) {
            showFieldError(apptType, 'Please select a request type.');
            valid = false;
        }

        const dateInput = form.querySelector('#appt-date');
        if (dateInput && dateInput.value) {
            const selected = new Date(dateInput.value + 'T00:00:00');
            const day = selected.getDay();
            if (day === 0 || day === 6) {
                showFieldError(dateInput, 'Please select a weekday (Monday – Friday).');
                valid = false;
            }
        }

        const selectedTime = form.querySelector('input[name="appt_time"]:checked');
        const timeslotErr  = document.getElementById('timeslot-error');
        if (!selectedTime) {
            if (timeslotErr) timeslotErr.style.display = 'block';
            valid = false;
        } else {
            if (timeslotErr) timeslotErr.style.display = 'none';
        }

        const contactField = form.querySelector('#appt-contact');
        if (contactField && contactField.value.trim() && !isValidPHMobile(contactField.value)) {
            showFieldError(contactField, 'Please enter a valid Philippine mobile number.');
            valid = false;
        }

        const emailField = form.querySelector('#appt-email');
        if (emailField && emailField.value.trim() && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address.');
            valid = false;
        }

        if (!valid) {
            const firstError = form.querySelector('.field-error');
            if (firstError) firstError.focus();
            return;
        }

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

    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
        field.addEventListener('change', () => clearFieldError(field));
    });
}


// ============================================================
// FORM HELPER UTILITIES
// ============================================================

function showFieldError(field, message) {
    field.classList.add('field-error');
    field.setAttribute('aria-invalid', 'true');

    let errEl = field.nextElementSibling;
    if (!errEl || !errEl.classList.contains('inline-error')) {
        errEl = document.createElement('p');
        errEl.className = 'inline-error field-error-msg';
        field.parentNode.insertBefore(errEl, field.nextSibling);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    field.removeAttribute('aria-invalid');

    const errEl = field.nextElementSibling;
    if (errEl && errEl.classList.contains('inline-error')) {
        errEl.style.display = 'none';
        errEl.textContent = '';
    }
}

function isValidPHMobile(value) {
    const cleaned = value.replace(/[\s\-()]/g, '');
    return /^(09|\+639)\d{9}$/.test(cleaned);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}


// ============================================================
// SERVICE CATEGORY TABS
// ============================================================

function switchServiceTab(tabId) {
    document.querySelectorAll('.service-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    document.querySelectorAll('.service-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const activeBtn = document.getElementById(`tab-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-selected', 'true');
    }

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

function doQuickSearch(query) {
    const input = document.getElementById('globalSearchInput');
    if (input) {
        input.value = query;
        input.focus();
        handleGlobalSearch(query);
    }
}

function initGlobalSearch() {
    const input     = document.getElementById('globalSearchInput');
    const clearBtn  = document.getElementById('searchClearBtn');
    const dropdown  = document.getElementById('searchSuggestions');

    if (!input) return;

    input.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => handleGlobalSearch(q), 180);
    });

    input.addEventListener('focus', () => {
        if (currentSearchQuery) showSuggestions();
    });

    // Keyboard navigation for suggestions
    input.addEventListener('keydown', (e) => {
        if (!dropdown) return;
        const items      = dropdown.querySelectorAll('.search-suggestion-item');
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

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            hideSuggestions();
            currentSearchQuery = '';
            input.focus();
        });
    }

    document.addEventListener('click', (e) => {
        const searchSection = document.getElementById('globalSearchSection');
        const navSearchWrapper = document.getElementById('navSearchWrapper');
        const target = e.target;
        if (
            (searchSection && !searchSection.contains(target)) &&
            (navSearchWrapper && !navSearchWrapper.contains(target))
        ) {
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

    SEARCH_INDEX.forEach(entry => {
        const match = entry.keywords.some(kw => kw.includes(query) || query.includes(kw) || kw.startsWith(query.split(' ')[0]));
        if (match && !seen.has(entry.label)) {
            results.push({ ...entry, matchType: 'index' });
            seen.add(entry.label);
        }
    });

    const allSections = document.querySelectorAll('.dashboard-block, .history-section, .disaster-card, .hotline-card, .doc-card, .event-card, .official-card');
    allSections.forEach(section => {
        const text = section.innerText.toLowerCase();
        if (text.includes(query)) {
            const heading = section.querySelector('h2, h3, h4, .block-title, .disaster-title, .hotline-name');
            const label   = heading ? heading.textContent.trim() : 'Section';

            const page = section.closest('.page-section');
            if (page && !seen.has(label)) {
                const pageId    = page.id;
                const sectionId = section.id || null;
                results.push({ label, desc: 'Match found in page content', icon: '🔍', page: pageId, section: sectionId, matchType: 'content' });
                seen.add(label);
            }
        }
    });

    return results.slice(0, 8);
}

function renderSuggestions(results, query) {
    const inner    = document.getElementById('searchSuggestionsInner');
    const noResult = document.getElementById('searchNoResults');

    if (!inner) return;
    inner.innerHTML = '';

    if (!results.length) {
        if (noResult) noResult.style.display = 'flex';
        return;
    }

    if (noResult) noResult.style.display = 'none';

    results.forEach((result, i) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item' + (i === 0 ? ' focused' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        item.setAttribute('tabindex', '-1');

        const highlightedLabel = highlightMatch(result.label, query);
        const badge = result.matchType === 'index'
            ? `<span class="search-badge search-badge--${result.page}">${getPageBadge(result.page)}</span>`
            : '<span class="search-badge search-badge--content">Content</span>';

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

    showPage(result.page);

    if (result.tab) {
        setTimeout(() => switchServiceTab(result.tab), 100);
    }

    if (result.section) {
        scrollToSection(result.section);
    }

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
// ANNOUNCEMENTS SECTION
// ============================================================

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

    document.querySelectorAll('.announcement-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
}

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

    document.querySelectorAll('.announcement-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterAnnouncements(btn.dataset.filter || 'all'));
    });
}


// ============================================================
// KEYBOARD ACCESSIBILITY HELPERS
// ============================================================

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
// LOADING ANIMATION
// ============================================================

function initPageLoadAnimation() {
    document.body.classList.add('page-loaded');
}


// ============================================================
// MOBILE SEARCH BAR (inside mobile nav dropdown)
// ============================================================

function initMobileSearch() {
    const input      = document.getElementById('mobileSearchInput');
    const dropdown   = document.getElementById('mobileSearchDropdown');
    const clearBtn   = document.getElementById('mobileSearchClear');

    if (!input || !dropdown) return;

    function renderMobileResults(results, query) {
        dropdown.innerHTML = '';
        if (!results.length) {
            dropdown.innerHTML = `<div class="mobile-search-no-results">No results for "<strong>${escapeHtml(query)}</strong>"</div>`;
            dropdown.style.display = 'block';
            return;
        }
        results.forEach((result, i) => {
            const item = document.createElement('div');
            item.className = 'mobile-search-result-item' + (i === 0 ? ' focused' : '');
            item.innerHTML = `
                <span class="mobile-search-result-icon">${result.icon || '🔍'}</span>
                <div class="mobile-search-result-body">
                    <div class="mobile-search-result-label">${escapeHtml(result.label)}</div>
                    <div class="mobile-search-result-desc">${escapeHtml(result.desc || '')}</div>
                </div>`;
            item.addEventListener('click', () => {
                closeMobileNav();
                navigateToResult(result);
                input.value = '';
                dropdown.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'none';
            });
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    }

    let mobileSearchTimer = null;
    input.addEventListener('input', (e) => {
        const q = e.target.value;
        // Show/hide clear button
        if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
        clearTimeout(mobileSearchTimer);
        mobileSearchTimer = setTimeout(() => {
            const trimmed = q.toLowerCase().trim();
            if (!trimmed) { dropdown.style.display = 'none'; return; }
            const results = getSearchResults(trimmed);
            renderMobileResults(results, trimmed);
        }, 180);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const q = input.value.toLowerCase().trim();
            if (!q) return;
            const results = getSearchResults(q);
            if (results.length) {
                closeMobileNav();
                navigateToResult(results[0]);
                input.value = '';
                dropdown.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            input.value = '';
            dropdown.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            dropdown.style.display = 'none';
            clearBtn.style.display = 'none';
            input.focus();
        });
    }
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
    injectToastStyles();

    // Features
    initializeNewsSlideshow();
    observeScrollElements();
    initContactForm();
    initAppointmentForm();
    initAppointmentDateConstraints();
    initTimeslotSelection();
    initAnnouncementsSection();
    initGlobalSearch();
    initSearchBarToggle();
    initMobileSearch(); // ADDED: wire up the mobile nav search bar
    initEventCards();
    createEventModal();
});