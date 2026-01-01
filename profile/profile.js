/**
 * PROFILE PAGE LOGIC
 * Handles instant local rendering and background Supabase sync.
 */

const Profile = {
    
    init() {
        console.log("👤 Profile: Initializing...");
        
        // 1. Instant Local Render (No waiting)
        this.hydrateProfileFromLocal();

        // 2. Background Data Refresh
        if (window.supabase) {
            this.fetchSupabaseData();
        } else {
            // Retry if Supabase lazy loads
            setTimeout(() => { 
                if (window.supabase) this.fetchSupabaseData(); 
            }, 500);
        }

        // 3. Setup Logout
        this.setupLogout();
    },

    /**
     * READ LOCAL STORAGE & RENDER INSTANTLY
     */
    hydrateProfileFromLocal() {
        console.log("⚡ Profile: Hydrating from LocalStorage...");

        try {
            // A. User Info
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.email) {
                this.setText('profile-email', localUser.email);
                this.setText('profile-joined', 'Member'); // Placeholder until DB fetch
                this.setText('profile-login', new Date().toLocaleDateString());
            }

            // B. Credits
            const localCredits = localStorage.getItem('userCredits') || '0';
            this.setText('stats-credits', localCredits);

            // C. Learning Stats (Calculated from local cache)
            const progressRaw = localStorage.getItem('lessonProgress');
            if (progressRaw) {
                const progressMap = JSON.parse(progressRaw);
                let totalSolved = 0;
                let lessonsStarted = 0;

                Object.values(progressMap).forEach(lesson => {
                    lessonsStarted++;
                    // Handle both 'completed' (old) and 'completed_indices' (new)
                    const done = lesson.completed_indices || lesson.completed || [];
                    if (Array.isArray(done)) {
                        totalSolved += done.length;
                    }
                });

                // Estimated Total Problems (Global Constant-ish)
                const ESTIMATED_TOTAL = 150; 
                const rate = Math.round((totalSolved / ESTIMATED_TOTAL) * 100);

                this.setText('stats-solved', totalSolved);
                this.setText('stats-lessons', lessonsStarted);
                this.setText('stats-completion', `${rate}%`);
            }

        } catch (err) {
            console.error("Hydration Error:", err);
        }
    },

    /**
     * FETCH LATEST DATA FROM SUPABASE
     */
    async fetchSupabaseData() {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (!session || error) {
            console.warn("⚠️ No session found. Redirecting...");
           // window.location.href = '../auth/login.html'; // Optional: Be less aggressive if local data exists
            return;
        }

        const user = session.user;
        
        // 1. Update Profile Metadata
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const lastLoginDate = new Date(user.last_sign_in_at || Date.now()).toLocaleString();
        
        this.setText('profile-email', user.email);
        this.setText('profile-joined', joinedDate);
        this.setText('profile-login', lastLoginDate);

        // 2. Fetch Credits & Progress
        try {
             const [creditsRes, progressRes] = await Promise.all([
                window.supabase.from("user_credits").select("credits").eq("user_id", user.user_id || user.id),
                window.supabase.from('lesson_progress').select('lesson_id, completed_indices, total').eq('user_id', user.user_id || user.id)
            ]);

            // Credits
            if (creditsRes.data && creditsRes.data.length > 0) {
                const credits = creditsRes.data[0].credits;
                this.setText('stats-credits', credits);
                localStorage.setItem('userCredits', credits);
            }

            // Progress
            if (progressRes.data) {
                // Update Local Cache
                const progressMap = {};
                let totalSolved = 0;
                
                progressRes.data.forEach(row => {
                     progressMap[row.lesson_id] = row;
                     if (row.completed_indices) totalSolved += row.completed_indices.length;
                });
                
                localStorage.setItem('lessonProgress', JSON.stringify(progressMap));
                
                // Re-run hydration to update UI with authoritative data
                this.hydrateProfileFromLocal();
            }

            // Sync Status
            const statusEl = document.getElementById('sync-status');
            if (statusEl) {
                 statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online & Synced`;
                 statusEl.classList.remove('text-red-500', 'border-red-500/20', 'bg-red-900/20');
                 statusEl.classList.add('text-green-500', 'border-green-500/20', 'bg-green-900/20');
            }

        } catch (err) {
            console.error("Supabase Fetch Error:", err);
        }
    },

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('🛑 Logout requested');
                if (window.Auth) {
                    window.Auth.logout();
                } else if (window.supabase) {
                    await window.supabase.auth.signOut();
                    window.location.href = '../auth/login.html';
                }
            });
        }
    },

    // Helper to safely set text
    setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});
