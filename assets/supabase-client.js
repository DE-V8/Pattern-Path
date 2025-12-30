/**
 * SUPABASE CLIENT (SYNC LAYER)
 * ---------------------------------------
 * This script initializes Supabase and provides helper methods to sync data.
 * It uses the anon key which is safe for client-side use with RLS policies (assumed).
 * 
 * OFFLINE-FIRST PHILOSOPHY:
 * 1. App reads/writes to localStorage immediately.
 * 2. If online, this client pushes updates to Supabase (Upsert).
 * 3. On load, it fetches from Supabase and merges into localStorage.
 */

// Import Supabase from CDN
/**
 * SUPABASE CLIENT (SYNC LAYER - GLOBAL)
 * ---------------------------------------
 * This script provides helper methods to sync data using the global `window.supabase` client.
 * 
 * OFFLINE-FIRST PHILOSOPHY:
 * 1. App reads/writes to localStorage immediately.
 * 2. If online, this client pushes updates to Supabase (Upsert).
 * 3. On load, it fetches from Supabase and merges into localStorage.
 */

// NOTE: This script assumes 'window.supabase' is already initialized by init-supabase.js

(function() {
    
    // Check dependency
    if (!window.supabase) {
        console.warn('Sync Layer: window.supabase is missing. Sync will not work.');
    }

    const Sync = {
        
        /**
         * Check if online
         */
        isOnline() {
            return navigator.onLine && !!window.supabase;
        },

        /**
         * Sync User Profile (Upsert)
         * @param {object} user { email, createdAt, lastLoginAt }
         */
        async syncUser(user) {
            if (!this.isOnline()) return;
            try {
                const { error } = await window.supabase
                    .from('users')
                    .upsert({ 
                        email: user.email, 
                        created_at: user.createdAt,
                        last_login_at: user.lastLoginAt
                    }, { onConflict: 'email' });
                    
                if (error) console.warn('Supabase User Sync Error:', error);
            } catch (e) {
                console.warn('Supabase User Sync Failed:', e); // Fail silently
            }
        },

        /**
         * Sync Lesson Progress (Upsert)
         * @param {string} email
         * @param {string} lessonId
         * @param {array} completed Array of completed problem indices
         */
        async syncProgress(email, lessonId, completed) {
            if (!this.isOnline()) return;
            try {
                const { error } = await window.supabase
                    .from('lesson_progress')
                    .upsert({
                        user_email: email,
                        lesson_id: lessonId,
                        completed: completed,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_email, lesson_id' }); // Composite key assumption

                if (error) console.warn('Supabase Progress Sync Error:', error);
            } catch (e) {
                console.warn('Supabase Progress Sync Failed:', e);
            }
        },

        /**
         * Fetch All Progress for User (Merge Strategy)
         * @param {string} email 
         * @returns {object|null} Map of lessonId -> { completed: [] }
         */
        async fetchProgress(email) {
            if (!this.isOnline()) return null;
            try {
                const { data, error } = await window.supabase
                    .from('lesson_progress')
                    .select('lesson_id, completed')
                    .eq('user_email', email);

                if (error) throw error;
                
                // Transform to map
                const map = {};
                data.forEach(row => {
                    map[row.lesson_id] = { completed: row.completed };
                });
                return map;
            } catch (e) {
                console.warn('Supabase Fetch Progress Failed:', e);
                return null;
            }
        },

        /**
         * Sync Credits (Upsert)
         * @param {string} email
         * @param {number} credits
         */
        async syncCredits(email, credits) {
            if (!this.isOnline()) return;
            try {
                const { error } = await window.supabase
                    .from('user_credits')
                    .upsert({
                        user_email: email,
                        credits: credits,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_email' });

                if (error) console.warn('Supabase Credits Sync Error:', error);
            } catch (e) {
                console.warn('Supabase Credits Sync Failed:', e);
            }
        },
        
        /**
         * Fetch Credits
         * @param {string} email
         * @returns {number|null} credits
         */
        async fetchCredits(email) {
            if (!this.isOnline()) return null;
            try {
                const { data, error } = await window.supabase
                    .from('user_credits')
                    .select('credits')
                    .eq('user_email', email)
                    .single();

                if (error) return null;
                return data.credits;
            } catch (e) {
                console.warn('Supabase Fetch Credits Failed:', e);
                return null;
            }
        }
    };

    // Attach to Global Window
    window.Sync = Sync;
    console.log('Sync Layer initialized globally.');

})();
