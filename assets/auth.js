/**
 * SUPABASE AUTHENTICATION SYSTEM
 * ------------------------------
 * This script handles user authentication via Supabase.
 * It replaces the previous local storage demo auth.
 * 
 * FEATURES:
 * - Email/Password Sign Up & Sign In
 * - Session Persistence (handled by Supabase)
 * - Protected Routes
 * - User Profile Syncing
 */

const Auth = {
    // Keys for localStorage (for UI state only, not auth truth)
    CURRENT_USER_KEY: 'currentUser',

    /**
     * Initialize auth state on page load.
     * Checks for valid Supabase session.
     */
    async init() {
        // 1. Dependency Check
        if (!window.supabase) {
            console.warn('Auth: Window.supabase not found. Auth disabled.');
            return;
        }

        // 2. Check Session
        const { data: { session } } = await window.supabase.auth.getSession();
        
        // 3. Update Local State & UI
        if (session) {
            this.setLocalUser(session.user);
            console.log('✅ Auth: Session restored for', session.user.email);
            // Trigger Hydration (One-time)
            this.hydrateLocalStorage(session.user);
        } else {
            this.clearLocalUser();
        }

        // 4. Handle Route Protection
        this.handleRouteProtection(session);

        // 5. Listen for Auth Changes (e.g. Tab sync, logout)
        window.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.setLocalUser(session.user);
                // Redirect if on login page? Only if manual login didn't handle it
            } else if (event === 'SIGNED_OUT') {
                this.clearLocalUser();
                // Redirect if on protected page
                this.handleRouteProtection(null);
            }
        });
    },

    /**
     * Handle redirections based on auth state
     */
    handleRouteProtection(session) {
        const path = window.location.pathname;
        const isLoginPage = path.includes('/auth/login.html');
        // Simple protection for dashboard folders
        const isProtected = path.includes('/dashboard/') || path.includes('/patterns/') || path.includes('/mentorship/') || path.includes('/profile/');
        
        if (session) {
            // If logged in and on login page, go to dashboard
            if (isLoginPage) {
                window.location.href = '../dashboard/categories.html';
            }
        } else {
            // If NOT logged in and on protected page, go to login
            if (isProtected) {
                console.warn('⛔ Access Denied: Redirecting to Login');
                // Handle relative paths correctly based on depth
                if (path.includes('/patterns/') || path.includes('/creators/')) {
                     window.location.href = '../auth/login.html';
                } else {
                     window.location.href = '../auth/login.html';
                }
            }
        }
    },

    /**
     * Register a new user
     */
    async register(email, password) {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const { data, error } = await window.supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log("🎉 Registration Successful:", data);
            
            // If auto-login happens, session listener handles it, but we can alert
            if (data.session) {
                 // Create User Profile in DB (if trigger doesn't exist)
                 // For now, we rely on Supabase to handle the Auth User creation
                 // You might want to insert into 'public.users' here if you don't have a trigger
                 
                 // SYNC: Initialize user stats via Sync
                 if (window.Sync) {
                      const newUser = { email: email, createdAt: new Date().toISOString() };
                      await window.Sync.syncUser(newUser); 
                 }

                 alert("Registration successful! Logging you in...");
                 window.location.href = '../dashboard/categories.html';
            } else {
                 alert("Registration successful! Please check your email to confirm.");
            }

        } catch (err) {
            console.error("Registration Error:", err);
            alert("Error: " + err.message);
        }
    },

    /**
     * Login existing user
     */
    async login(email, password) {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log("🔓 Login Successful:", data.user.email);
            
            // Sync Profile on Login
            if (window.Sync) {
                // Fetch latest credits/data
                await window.Sync.fetchProgress(email); 
                await window.Sync.fetchCredits(email);
            }
            
            // Hydrate Cache
            await this.hydrateLocalStorage(data.user);

            // Redirect
            window.location.href = '../dashboard/categories.html';

        } catch (err) {
            console.error("Login Error:", err);
            alert("Login Failed: " + err.message);
        }
    },

    /**
     * Step A: Hydrate localStorage from Supabase
     * Only runs once per session to prime the cache.
     */
    async hydrateLocalStorage() {
        console.log("🌊 Hydration Check");

        if (localStorage.getItem('profileHydrated')) {
             console.log("🌊 Already hydrated.");
             return;
        }

        // 1. STRICT SESSION CHECK (Mandatory)
        const { data, error } = await window.supabase.auth.getSession();

        if (error || !data || !data.session || !data.session.user) {
            console.log("⚠️ No auth session yet — skipping hydration");
            return;
        }

        const userId = data.session.user.id;
        console.log("🌊 Hydrating for user:", userId);

        if (!navigator.onLine) {
            console.warn("⚠️ Offline: Skipping hydration.");
            return;
        }

        try {
            // 2. Fetch Credits (Using userId)
            let { data: creditData, error: creditError } = await window.supabase
                .from("user_credits")
                .select("credits")
                .eq("user_id", userId);

            // Insert Default if missing
            if (!creditError && (!creditData || creditData.length === 0)) {
                 await window.supabase.from("user_credits").insert({ user_id: userId, credits: 0 });
                 creditData = [{ credits: 0 }];
            }

            if (!creditError && creditData && creditData.length > 0) {
                const val = creditData[0].credits;
                localStorage.setItem('userCredits', val.toString());
                console.log("💧 Credits hydrated:", val);
            } else {
                 console.log("💧 Credits fetch error:", creditError?.message);
            }

            // 3. Fetch Progress (Using userId)
            // 3. Fetch Progress (Using userId)
            const { data: progressData, error: progressError } = await window.supabase
                .from('lesson_progress')
                .select('lesson_id, completed_indices, total')
                .eq('user_id', userId);

            if (!progressError && progressData && progressData.length > 0) {
                const progressMap = {};
                progressData.forEach(row => {
                    progressMap[row.lesson_id] = { 
                        ...row, 
                        completed: row.completed_indices || [] // Map back to local format
                    };
                });
                
                localStorage.setItem('lessonProgress', JSON.stringify(progressMap));
                console.log("💧 Progress hydrated:", Object.keys(progressMap).length, "items");
            }

            // 4. Mark as Hydrated
            localStorage.setItem('profileHydrated', 'true');
            console.log("✅ LocalStorage hydrated");

        } catch (err) {
            console.error("Hydration Failed:", err);
        }
    },

    /**
     * Logout
     */
    async logout() {
        console.log("🛑 Logout requested...");
        try {
            // 1. Clear ALL Local State
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userCredits');
            localStorage.removeItem('lessonProgress');
            localStorage.removeItem('completedLessons');
            localStorage.removeItem('profileHydrated');
            
            // 2. Sign Out from Supabase
            if (window.supabase) {
                const { error } = await window.supabase.auth.signOut();
                if (error) throw error;
            }
            console.log("👋 Logged out.");
            
            // 3. Redirect
            window.location.href = '../auth/login.html';
        } catch (err) {
            console.error("Logout Error:", err);
            // Force redirect anyway
            window.location.href = '../auth/login.html';
        }
    },

    /**
     * Helper: Set local user state (for UI consistency)
     * We convert Supabase user object to our simple format
     */
    setLocalUser(sbUser) {
        const simpleUser = {
            email: sbUser.email,
            id: sbUser.id,
            loggedIn: true
        };
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(simpleUser));
    },

    /**
     * Manual Login Guard
     */
    async requireLogin() {
        console.log("🔒 Checking Auth (Manual Guard)...");
        const { data } = await window.supabase.auth.getSession();
        if (!data || !data.session) {
             console.warn("⛔ Access Denied: Redirecting to Login");
             window.location.href = '../auth/login.html';
        }
    },

    /**
     * Helper: Clear local user state
     */
    clearLocalUser() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        localStorage.removeItem('userCredits'); // Optional: clear credits on logout
        // We might want to keep lessonProgress for offline viewing? 
        // For now, let's keep it simple.
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait briefly for Supabase to be ready if async
    if (window.supabase) {
        Auth.init();
    } else {
        // Retry once if script order is loose
        setTimeout(() => { 
            if (window.supabase) Auth.init(); 
        }, 100);
    }
});

// Expose Global IMMEDIATELY
window.Auth = Auth;
