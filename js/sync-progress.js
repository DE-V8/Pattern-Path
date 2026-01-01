/**
 * OFFLINE SYNC MODULE
 * -------------------
 * Safe background sync of localStorage data to Supabase.
 * Does not block UI. Fails silently.
 */

export async function syncToSupabase() {
    console.log("🔄 Sync started");

    try {
        // 1. Dependency Check
        if (!window.supabase) {
            console.warn("⚠️ Sync skipped:", "Supabase not initialized");
            return;
        }

        // 2. Auth Check (Silent)
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error || !session || !session.user) {
            console.warn("⚠️ Sync skipped:", "No active session");
            return;
        }

        const userId = session.user.id;

        // 3. READ LocalStorage
        const credits = localStorage.getItem('userCredits');
        const lessonProgressRaw = localStorage.getItem('lessonProgress');
        // completedLessons is requested but not used in current DB schema
        // const completedLessons = localStorage.getItem('completedLessons'); 

        // 4. SYNC CREDITS
        if (credits !== null) {
            const { error: creditError } = await window.supabase
                .from('user_credits')
                .upsert({ 
                    user_id: userId, 
                    credits: parseInt(credits, 10),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            
            if (creditError) console.warn("Credit sync failed:", creditError.message);
        }

        // 5. SYNC LESSON PROGRESS
        if (lessonProgressRaw) {
            const progressMap = JSON.parse(lessonProgressRaw); // { "lessonId": { total: 5, completed: [1,2] } }
            const updates = [];

            for (const [lessonId, data] of Object.entries(progressMap)) {
                if (data && Array.isArray(data.completed)) {
                    updates.push({
                        user_id: userId,
                        lesson_id: lessonId,
                        completed_indices: data.completed,
                        total: data.total || 0,
                        updated_at: new Date().toISOString()
                    });
                }
            }

            if (updates.length > 0) {
                const { error: progressError } = await window.supabase
                    .from('lesson_progress')
                    .upsert(updates, { onConflict: 'user_id, lesson_id' });

                if (progressError) console.warn("Progress sync failed:", progressError.message);
            }
        }

        console.log("✅ Sync completed");

    } catch (e) {
    }
}

// Global Expose (Required for non-module usage)
window.syncToSupabase = syncToSupabase;
