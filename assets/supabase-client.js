/**
 * SUPABASE CLIENT (SYNC LAYER - GLOBAL)
 * ---------------------------------------
 * This script provides helper methods to sync data using the global `window.supabase` client.
 * 
 * OFFLINE-FIRST PHILOSOPHY:
 * 1. App reads/writes to localStorage immediately (fast UI).
 * 2. If online, this client pushes updates to Supabase (Cloud backup).
 * 3. On login, it fetches from Supabase and updates localStorage (Restore).
 */

(function() {
    
    // Check dependency
    if (!window.supabase) {
        console.warn('Sync Layer: window.supabase is missing. Sync will not work.');
    }

    const Sync = {
        
        /**
         * Check if online and client is ready
         */
        isOnline() {
            return navigator.onLine && !!window.supabase;
        },

        /**
         * 1. SYNC USER PROFILE
         * Saves basic user info to 'users' table.
         */
        /**
         * 1. SYNC USER PROFILE
         */
        async syncUser(user) {
            if (!this.isOnline()) return;
            
            // STRICT SESSION CHECK
            const { data } = await window.supabase.auth.getSession();
            if (!data || !data.session || !data.session.user) return;
            const userId = data.session.user.id;

            try {
                // Upsert using ID as the key
                const { error } = await window.supabase
                    .from('users')
                    .upsert({ 
                        id: userId, // Use ID as primary key
                        email: user.email, 
                        // created_at: user.createdAt, // CreatedAt is usually managed by Auth or default
                        last_login_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                    
                if (error) console.warn('Sync User Error:', error);
            } catch (e) {
                console.warn('Sync User Failed:', e); 
            }
        },

        /**
         * 2. SYNC LESSON PROGRESS
         */
        async syncProgress(email, lessonId, completed, total) {
            if (!this.isOnline()) return;

            // STRICT SESSION CHECK
            const { data } = await window.supabase.auth.getSession();
            if (!data || !data.session || !data.session.user) return;
            const userId = data.session.user.id;
            
            try {
                const { error } = await window.supabase
                    .from('lesson_progress')
                    .upsert({
                        user_id: userId, 
                        lesson_id: lessonId,
                        completed_indices: completed, // Fixed column name
                        total: total || 0,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, lesson_id' });

                if (error) console.warn('Sync Progress Error:', error);
                else console.log(`☁️ Progress synced for ${lessonId}`);
            } catch (e) {
                console.warn('Sync Progress Failed:', e);
            }
        },

        /**
         * 3. FETCH & RESTORE PROGRESS
         */
        async fetchProgress(email) {
            if (!this.isOnline()) return null;

            // STRICT SESSION CHECK
            const { data } = await window.supabase.auth.getSession();
            if (!data || !data.session || !data.session.user) return null;
            const userId = data.session.user.id;
            
            console.log("Fetching progress for user_id:", userId);

            try {
                const { data: progressData, error } = await window.supabase
                    .from('lesson_progress')
                    .select('lesson_id, completed_indices') // Fixed column name
                    .eq('user_id', userId);

                if (error) throw error;
                
                // Convert list to map
                const map = {};
                if (progressData) {
                    progressData.forEach(row => {
                        // Map remote 'completed_indices' back to local 'completed'
                        map[row.lesson_id] = { completed: row.completed_indices || [] };
                    });
                }
                
                // Update LocalStorage
                if (Object.keys(map).length > 0) {
                    const current = JSON.parse(localStorage.getItem('lessonProgress')) || {};
                    const merged = { ...current, ...map };
                    localStorage.setItem('lessonProgress', JSON.stringify(merged));
                    console.log('📥 Progress Restored from Cloud');
                }

                return map;
            } catch (e) {
                console.warn('Fetch Progress Failed:', e);
                return null;
            }
        },

        /**
         * 4. SYNC CREDITS
         */
        async syncCredits(email, credits) {
            if (!this.isOnline()) return;

            // STRICT SESSION CHECK
            const { data } = await window.supabase.auth.getSession();
            if (!data || !data.session || !data.session.user) return;
            const userId = data.session.user.id;
            
            try {
                const { error } = await window.supabase
                    .from('user_credits')
                    .upsert({
                        user_id: userId, // Fixed column
                        credits: credits,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (error) console.warn('Sync Credits Error:', error);
                else console.log(`☁️ Credits synced: ${credits}`);
            } catch (e) {
                console.warn('Sync Credits Failed:', e);
            }
        },
        
        /**
         * 5. FETCH & RESTORE CREDITS
         */
        async fetchCredits(email) {
            if (!this.isOnline()) return null;

            // STRICT SESSION CHECK
            const { data } = await window.supabase.auth.getSession();
            if (!data || !data.session || !data.session.user) return null;
            const userId = data.session.user.id;
            
            console.log("Fetching credits for user_id:", userId);
            
            try {
                let { data, error } = await window.supabase
                    .from("user_credits")
                    .select("credits")
                    .eq("user_id", userId);

                // Insert Default if missing
                if (!error && (!data || data.length === 0)) {
                    console.log('Credits: No row found, creating default...');
                    await window.supabase.from("user_credits").insert({
                        user_id: userId,
                        credits: 0
                    });
                    // Set default for immediate return
                    data = [{ credits: 0 }];
                }

                if (error) {
                     console.warn('Fetch Credits Error:', error);
                     return null;
                }
                
                const credits = data?.[0]?.credits ?? 0;
                
                localStorage.setItem('userCredits', credits.toString());
                console.log(`📥 Credits Restored: ${credits}`);
                
                // Update UI if exposed
                if (window.updateCreditsUI) window.updateCreditsUI();
                
                return credits;
                
            } catch (e) {
                console.warn('Fetch Credits Failed:', e);
                return null;
            }
        }
    };
        
    

    // Attach to Global Window
    window.Sync = Sync;
    console.log('✅ Sync Layer Ready');

})();
