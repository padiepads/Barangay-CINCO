function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    const links = document.querySelectorAll('.nav-links button');
    const navLinks = document.getElementById('navLinks'); 

    sections.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        activeSection.style.display = 'block';
        setTimeout(() => { activeSection.classList.add('active'); }, 10);
    }

    links.forEach(l => l.classList.remove('active-link'));
    
    const activeLink = document.getElementById('link-' + pageId);
    if (activeLink) {
        activeLink.classList.add('active-link');
    }

    if (navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onload = () => showPage('history');

// SHOW SERVICES OUTPUT AND HANDLING
const contactForm = document.getElementById("services-form");
const originalFormHTML = contactForm.innerHTML;

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstname = document.getElementById("firstname").value;

    // Rewrite form inner HTML to present structured confirmation card
    contactForm.innerHTML = `
        <div class="success-container">
            <h2 class="success-title">✅ Concern Submitted Successfully</h2>
            <p class="success-message">
                Dear <strong>${firstname}</strong>, thank you for bringing this to our attention.
            </p>
            <p class="success-subtext">
                Your concern has been securely transmitted to the official email of the barangay (<strong>info@brgycinco.gov.ph</strong>). We appreciate your vigilance in our community.
            </p>
            <button id="back-to-main-btn" class="btn btn-center">Go Back to Main Page</button>
        </div>
    `;

    // Add immediate action event map to the confirmation page button
    document.getElementById("back-to-main-btn").addEventListener("click", function() {
        // Run internal slide router back to general community board history section
        showPage('history');
        
        // Quietly rebuild structural DOM contents post animation loop closure
        setTimeout(() => {
            contactForm.innerHTML = originalFormHTML;
        }, 500);
    });
});

// MOBILE MENU TOGGLE
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// FACILITY FILTERING SYSTEM
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

// Set 'All' as default on load
filterSelection('all');


// --- SCROLL-TO-HIDE SYSTEM IMPLEMENTATION ---
let lastScrollTop = 0;
const headerWrapper = document.querySelector('.header-wrapper');
const mobileNavLinks = document.getElementById('navLinks');

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Safety step: Ignore bouncy elastic scroll actions on iOS devices
    if (currentScroll < 0) return;

    if (currentScroll > lastScrollTop && currentScroll > 150) {
        // Scrolling Down -> Hide Header
        headerWrapper.classList.add('scroll-hide');
        
        // Auto-collapse mobile navigation dropdown menu if open
        if (mobileNavLinks && mobileNavLinks.classList.contains('show')) {
            mobileNavLinks.classList.remove('show');
        }
    } else {
        // Scrolling Up -> Show Header
        headerWrapper.classList.remove('scroll-hide');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, false);