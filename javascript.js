function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    const links = document.querySelectorAll('.nav-links button');
    const navLinks = document.getElementById('navLinks'); // Target mobile menu container

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

    // NEW: Automatically closes the mobile menu dropdown aftersv selecting a page
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

    // Replace the inner inputs with our curated confirmation layout
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

    // Handle clicking the "Go Back" button
    document.getElementById("back-to-main-btn").addEventListener("click", function() {
        // Smoothly slide back to the History section using your existing function
        showPage('history');
        
        // Reset the form in the background after the view changes
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
        // Hide elements that don't match
        cards[i].classList.remove("show");
        cards[i].classList.add("hide");
        
        // Show elements that match the category
        if (cards[i].className.indexOf(category) > -1) {
            cards[i].classList.remove("hide");
            cards[i].classList.add("show");
        }
    }
}

// Set 'All' as default on load
filterSelection('all');

