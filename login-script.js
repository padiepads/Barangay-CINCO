'use strict';

// ============================================================
// DOM REFERENCES
// ============================================================

const loginForm       = document.getElementById('loginForm');
const loginUsername   = document.getElementById('loginUsername');
const loginPassword   = document.getElementById('loginPassword');
const togglePassword  = document.getElementById('togglePassword');
const loginSubmitBtn  = document.getElementById('loginSubmitBtn');
const loginErrorBanner = document.getElementById('loginErrorBanner');
const loginErrorMsg   = document.getElementById('loginErrorMsg');
const loginSpinner    = document.getElementById('loginSpinner');
const loginToast      = document.getElementById('loginToast');
const rememberMe      = document.getElementById('rememberMe');

// Forgot password modal
const forgotPasswordBtn   = document.getElementById('forgotPasswordBtn');
const forgotModalOverlay  = document.getElementById('forgotModalOverlay');
const forgotModalClose    = document.getElementById('forgotModalClose');
const forgotModalSubmit   = document.getElementById('forgotModalSubmit');
const forgotInput         = document.getElementById('forgotInput');
const forgotInputError    = document.getElementById('forgotInputError');
const forgotModalSuccess  = document.getElementById('forgotModalSuccess');

// Field wrappers
const fieldUsername = document.getElementById('fieldUsername');
const fieldPassword = document.getElementById('fieldPassword');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');

// ============================================================
// REMEMBER ME — Restore on Load
// ============================================================

(function restoreRememberedUser() {
    const saved = localStorage.getItem('brgycinco_remembered_user');
    if (saved) {
        loginUsername.value = saved;
        rememberMe.checked = true;
    }
})();

// ============================================================
// SHOW / HIDE PASSWORD TOGGLE
// ============================================================

togglePassword.addEventListener('click', function () {
    const isPassword = loginPassword.type === 'password';
    loginPassword.type = isPassword ? 'text' : 'password';

    const iconShow = this.querySelector('.pw-icon-show');
    const iconHide = this.querySelector('.pw-icon-hide');

    if (isPassword) {
        iconShow.style.display = 'none';
        iconHide.style.display = 'block';
        this.setAttribute('aria-label', 'Hide password');
        this.setAttribute('aria-pressed', 'true');
    } else {
        iconShow.style.display = 'block';
        iconHide.style.display = 'none';
        this.setAttribute('aria-label', 'Show password');
        this.setAttribute('aria-pressed', 'false');
    }
});

// ============================================================
// FIELD VALIDATION HELPERS
// ============================================================

function setFieldError(fieldEl, errorEl, message) {
    fieldEl.classList.add('has-error');
    errorEl.textContent = message;
}

function clearFieldError(fieldEl, errorEl) {
    fieldEl.classList.remove('has-error');
    errorEl.textContent = '';
}

function clearAllErrors() {
    clearFieldError(fieldUsername, usernameError);
    clearFieldError(fieldPassword, passwordError);
    hideErrorBanner();
}

function showErrorBanner(msg) {
    loginErrorMsg.textContent = msg;
    loginErrorBanner.hidden = false;
    // Force reflow for re-animation
    loginErrorBanner.style.animation = 'none';
    loginErrorBanner.offsetHeight; // eslint-disable-line no-unused-expressions
    loginErrorBanner.style.animation = '';
}

function hideErrorBanner() {
    loginErrorBanner.hidden = true;
}

// Live validation — clear error when user starts typing
loginUsername.addEventListener('input', () => {
    if (loginUsername.value.trim()) {
        clearFieldError(fieldUsername, usernameError);
    }
});

loginPassword.addEventListener('input', () => {
    if (loginPassword.value.trim()) {
        clearFieldError(fieldPassword, passwordError);
    }
});

// ============================================================
// FORM SUBMISSION
// ============================================================

function validateForm() {
    let valid = true;
    clearAllErrors();

    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username) {
        setFieldError(fieldUsername, usernameError, 'Username is required.');
        valid = false;
    }

    if (!password) {
        setFieldError(fieldPassword, passwordError, 'Password is required.');
        valid = false;
    }

    if (!valid) {
        showErrorBanner('Please fill in all required fields before signing in.');
        // Focus first empty field
        if (!username) loginUsername.focus();
        else if (!password) loginPassword.focus();
    }

    return valid;
}

function setLoadingState(isLoading) {
    if (isLoading) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.classList.add('is-loading');
        loginSpinner.hidden = false;
        loginSpinner.setAttribute('aria-hidden', 'false');
        loginSubmitBtn.setAttribute('aria-label', 'Signing in, please wait…');
    } else {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.classList.remove('is-loading');
        loginSpinner.hidden = true;
        loginSpinner.setAttribute('aria-hidden', 'true');
        loginSubmitBtn.setAttribute('aria-label', 'Sign in to your account');
    }
}

function showSuccessToast() {
    loginToast.hidden = false;
    // Auto-hide after 4 seconds
    setTimeout(() => {
        loginToast.hidden = true;
    }, 4000);
}

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    // Handle Remember Me
    if (rememberMe.checked) {
        localStorage.setItem('brgycinco_remembered_user', loginUsername.value.trim());
    } else {
        localStorage.removeItem('brgycinco_remembered_user');
    }

    // Simulate loading / authentication
    setLoadingState(true);
    hideErrorBanner();

    setTimeout(() => {
        setLoadingState(false);

        // --- DEMO CREDENTIALS CHECK ---
        // Replace this block with your real backend auth call.
        const username = loginUsername.value.trim().toLowerCase();
        const password = loginPassword.value.trim();

        const validUsers = [
            { username: 'admin',     password: 'admin123' },
            { username: 'secretary', password: 'brgycinco2026' },
            { username: 'captain',   password: 'kapitan001' },
        ];

        const match = validUsers.find(u => u.username === username && u.password === password);

        if (match) {
            // Successful login
            showSuccessToast();
            setTimeout(() => {
                // Redirect to main portal after toast
                window.location.href = 'actual-website/home.html';
            }, 1500);
        } else {
            // Failed login
            showErrorBanner('Incorrect username or password. Please try again.');
            setFieldError(fieldUsername, usernameError, ' ');
            setFieldError(fieldPassword, passwordError, ' ');
            loginPassword.value = '';
            loginPassword.type = 'password';
            // Reset show/hide icon state
            const iconShow = togglePassword.querySelector('.pw-icon-show');
            const iconHide = togglePassword.querySelector('.pw-icon-hide');
            iconShow.style.display = 'block';
            iconHide.style.display = 'none';
            togglePassword.setAttribute('aria-label', 'Show password');
            togglePassword.setAttribute('aria-pressed', 'false');
            loginPassword.focus();
        }
    }, 1800);
});

// ============================================================
// ENTER KEY SUBMISSION
// ============================================================

document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Only if focus is within the form and modal is not open
        const isInForm = loginForm.contains(document.activeElement);
        const modalOpen = !forgotModalOverlay.hidden;

        if (isInForm && !modalOpen) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }
});

// ============================================================
// FORGOT PASSWORD MODAL
// ============================================================

function openForgotModal() {
    forgotModalOverlay.hidden = false;
    forgotModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first interactive element
    setTimeout(() => forgotInput.focus(), 60);
}

function closeForgotModal() {
    forgotModalOverlay.hidden = true;
    forgotModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Reset modal state
    forgotInput.value = '';
    forgotInputError.textContent = '';
    forgotModalSuccess.hidden = true;
    forgotModalSubmit.disabled = false;
    forgotModalSubmit.textContent = 'Send Reset Request';
    // Return focus to trigger
    forgotPasswordBtn.focus();
}

forgotPasswordBtn.addEventListener('click', openForgotModal);
forgotModalClose.addEventListener('click', closeForgotModal);

// Close on backdrop click
forgotModalOverlay.addEventListener('click', function (e) {
    if (e.target === forgotModalOverlay) closeForgotModal();
});

// Close on Escape
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !forgotModalOverlay.hidden) {
        closeForgotModal();
    }
});

// Trap focus inside modal
forgotModalOverlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = forgotModalOverlay.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    } else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// Forgot password form submission
forgotModalSubmit.addEventListener('click', function () {
    const val = forgotInput.value.trim();

    if (!val) {
        forgotInputError.textContent = 'Please enter your username or email address.';
        forgotInput.focus();
        return;
    }

    // Basic format check
    if (val.length < 3) {
        forgotInputError.textContent = 'Please enter a valid username or email.';
        forgotInput.focus();
        return;
    }

    forgotInputError.textContent = '';
    forgotModalSubmit.disabled = true;
    forgotModalSubmit.textContent = 'Sending…';

    // Simulate request
    setTimeout(() => {
        forgotModalSubmit.hidden = true;
        forgotModalSuccess.hidden = false;
        forgotInput.disabled = true;

        // Auto close after delay
        setTimeout(() => {
            closeForgotModal();
            forgotModalSubmit.hidden = false;
            forgotInput.disabled = false;
        }, 3500);
    }, 1400);
});

// Also submit forgot form on Enter
forgotInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        forgotModalSubmit.click();
    }
});

// ============================================================
// SUBTLE ENTRANCE STAGGER ON LOAD
// ============================================================

(function initEntranceAnimation() {
    const fields = document.querySelectorAll('.login-field, .login-options-row, .login-submit-btn, .login-footer-note');
    fields.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = `opacity 0.5s ease ${0.28 + i * 0.07}s, transform 0.5s ease ${0.28 + i * 0.07}s`;

        // Trigger reflow then animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        });
    });
})();
