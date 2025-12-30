/**
 * LOCAL AUTHENTICATION SYSTEM (DEMO ONLY)
 * ---------------------------------------
 * This script provides a simple authentication mechanism using localStorage.
 * It is designed for PROTOTYPING and DEMONSTRATION purposes.
 * 
 * SECURITY WARNING:
 * - Passwords are stored in PLAIN TEXT.
 * - This is NOT secure for production use.
 * - In a real app, this will be replaced by Supabase Auth or a backend service.
 * 
 * DATA STRUCTURE:
 * localStorage.users = {
 *   "user@email.com": { email, password, createdAt }
 * }
 * localStorage.currentUser = { email, loggedIn: true }
 */

// Import Sync helper dynamically later to avoid breaking non-module script execution context immediately
// or assume we will update HTML tags.
// Ideally we should update HTML to type="module" but that changes scope.
// Let's use a dynamic import pattern inside functions.

const Auth = {
    // Keys for localStorage
    USERS_KEY: 'users',
    CURRENT_USER_KEY: 'currentUser',

    /**
     * Initialize auth state on page load.
     * Redirects to dashboard if already logged in.
     */
    async init() {
        // Simple route protection logic
        const path = window.location.pathname;
        const isLoginPage = path.includes('/auth/login.html');
        // Check for specific subdirectories to avoid false positives if simple includes are used
        const isProtected = path.includes('/dashboard/') || path.includes('/patterns/') || path.includes('/mentorship/');
        
        const currentUser = this.getCurrentUser();

        // PERSISTENCE CHECK: Login -> Dashboard
        if (currentUser && currentUser.loggedIn) {
            // If logged in and on login page, redirect to dashboard
            if (isLoginPage) {
                window.location.href = '../dashboard/categories.html';
            }
        } else if (isProtected) {
            // If NOT logged in and on protected page, redirect to login
            // Using relative path fallback
             if (path.includes('/patterns/')) {
                 window.location.href = '../auth/login.html';
             } else {
                 window.location.href = '../auth/login.html';
             }
        }
    },
    
    /**
     * Enforce login on a page. Call checking logic directly.
     */
    requireLogin() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.loggedIn) {
            window.location.href = '../auth/login.html';
        }
    },

    /**
     * Get the currently logged-in user from localStorage.
     */
    getCurrentUser() {
        const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Register a new user.
     * @param {string} email 
     * @param {string} password 
     */
    async register(email, password) {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');

        if (users[email]) {
            alert("User already exists! Please login instead.");
            return;
        }

        const newUser = {
            email: email,
            password: password, // WARNING: Plain text for demo only
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        // Save new user locally
        users[email] = newUser;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // SYNC: Push to Supabase via global Sync
        if (window.Sync) {
            await window.Sync.syncUser(newUser);
        } else {
            console.warn('Auth: Window.Sync not found. User not synced to Supabase.');
        }

        // Auto-login after register
        this.login(email, password);
    },

    /**
     * Login an existing user.
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
        const user = users[email];

        if (user && user.password === password) {
            // Update last login
            user.lastLoginAt = new Date().toISOString();
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

            // Set current user session
            const session = {
                email: user.email,
                loggedIn: true
            };
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(session));
            
            // SYNC: Push update to Supabase via global Sync
            if (window.Sync) {
                await window.Sync.syncUser(user);
            }

            // Redirect
            window.location.href = '../dashboard/categories.html';
        } else {
            alert("Invalid email or password.");
        }
    },

    /**
     * Logout the user.
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = '../auth/login.html';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    window.Auth = Auth;
});
