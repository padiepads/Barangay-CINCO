// --- CORE SINGLE PAGE ROUTER ENGINE ---
function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    const navButtons = document.querySelectorAll('.nav-links button');
    navButtons.forEach(btn => {
        btn.classList.remove('active-link');
    });

    const currentButton = document.getElementById(`link-${pageId}`);
    if (currentButton) {
        currentButton.classList.add('active-link');
    }

    // Scroll cleanly up to the top view frame boundary
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- NEWS & UPDATES SLIDESHOW IMPLEMENTATION ENGINE ---
let activeSlideIndex = 1;

function initializeNewsSlideshow() {
    renderSlides(activeSlideIndex);
    
    // Auto rotation routine - changes slides clean every 7 seconds
    setInterval(() => {
        moveSlides(1);
    }, 7000);
}

function moveSlides(offset) {
    renderSlides(activeSlideIndex += offset);
}

function setCurrentSlide(slideTargetNum) {
    renderSlides(activeSlideIndex = slideTargetNum);
}

function renderSlides(targetIndex) {
    let loopIdx;
    const slidesDomArray = document.getElementsByClassName("news-slide");
    const dotsDomArray = document.getElementsByClassName("slide-dot");
    
    if (!slidesDomArray.length) return; // Prevent break runtime errors if changing pages
    
    if (targetIndex > slidesDomArray.length) { activeSlideIndex = 1; }
    if (targetIndex < 1) { activeSlideIndex = slidesDomArray.length; }
    
    for (loopIdx = 0; loopIdx < slidesDomArray.length; loopIdx++) {
        slidesDomArray[loopIdx].style.display = "none";
    }
    
    for (loopIdx = 0; loopIdx < dotsDomArray.length; loopIdx++) {
        dotsDomArray[loopIdx].className = dotsDomArray[loopIdx].className.replace(" slide-active", "");
    }
    
    slidesDomArray[activeSlideIndex - 1].style.display = "block";
    if (dotsDomArray[activeSlideIndex - 1]) {
        dotsDomArray[activeSlideIndex - 1].className += " slide-active";
    }
}

// Ensure primary home landing frame displays safely on execution initialization
document.addEventListener("DOMContentLoaded", () => {
    showPage('history');
    initializeNewsSlideshow(); // Boot up slideshow functions safely
    
    // Attach event interceptor loop for green service confirmation pop up modal
    const servicesForm = document.getElementById('services-form');
    if (servicesForm) {
        servicesForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Hold form submission action
            openModal();
        });
    }
});

// --- TOGGLE MOBILE BURGER SELECTION MENU LAYER ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// --- LIGHT & DARK MODE THEME CONFIG INTERFACE ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentSavedTheme = localStorage.getItem('theme') || 'light';

if (currentSavedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.textContent = "☀️ Light Mode";
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        let currentActiveTheme = document.documentElement.getAttribute('data-theme');
        if (currentActiveTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = "🌙 Dark Mode";
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = "☀️ Light Mode";
        }
    });
}

// --- GREEN SERVICE NOTIFICATION POPUP ACTION METHODS ---
function openModal() {
    const popupModal = document.getElementById('submissionModal');
    if (popupModal) {
        popupModal.classList.add('active');
    }
}

function closeModal() {
    const popupModal = document.getElementById('submissionModal');
    if (popupModal) {
        popupModal.classList.remove('active');
        
        // Reset original input elements inside document scope safely
        const formElement = document.getElementById('services-form');
        if (formElement) {
            formElement.reset();
        }
    }
}

// --- SCROLL INTERSECTION REVEAL CONTROLLER ---
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.scroll-fade').forEach(blockItem => {
    scrollObserver.observe(blockItem);
});

// --- SUB-FACILITY FILTER SELECTOR MODULE ---
function filterSelection(category) {
    var cards = document.getElementsByClassName("facility-card");
    if (category == "all") category = "";
    
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove("show");
        cards[i].classList.add("hide");
        
        if (cards[i].className.indexOf(category) > -1) {
            cards[i].classList.remove("hide");
            cards[i].classList.add("show");
        }
    }
}

// --- HIDE HEADER WRAPPER TRACKER WHILE SCROLLING DOWN ---
let lastScrollTopPosition = 0;
const headerWrapper = document.querySelector('.header-wrapper');
const mobileNavMenu = document.getElementById('navLinks');

window.addEventListener('scroll', function() {
    let currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollTopPosition && currentScrollY > 150) {
        if (headerWrapper) headerWrapper.classList.add('scroll-hide');
        if (mobileNavMenu && mobileNavMenu.classList.contains('show')) {
            mobileNavMenu.classList.remove('show');
        }
    } else {
        if (headerWrapper) headerWrapper.classList.remove('scroll-hide');
    }
    
    lastScrollTopPosition = currentScrollY <= 0 ? 0 : currentScrollY;
}, false);