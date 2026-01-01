/**
 * SUPABASE INITIALIZATION (GLOBAL)
 * --------------------------------
 * This script initializes the Supabase client and attaches it to the global window object.
 * It MUST be loaded AFTER the Supabase CDN script and BEFORE any other custom scripts.
 * 
 * Why?
 * - We are using the CDN version for simplicity.
 * - Variables must be global to be accessible by other non-module scripts.
 */

/**
 * SUPABASE INITIALIZATION (SINGLETON)
 * -----------------------------------
 * This script ensures the Supabase client is created EXACTLY ONCE.
 * It attaches the client to 'window.supabase' for global access.
 * 
 * WHY THIS PATTERN?
 * 1. 'supabase' (lowercase) is often used by the CDN library itself.
 * 2. Creating multiple clients can cause connection issues.
 * 3. We use 'supabaseClient' to avoid naming conflicts.
 */

(function() {
    // 1. Prevent Redeclaration / Re-initialization
    if (window.supabaseClientInitialized) {
        console.warn('Supabase already initialized. Skipping.');
        return;
    }

    // 2. Check if Library Exists (from CDN)
    if (typeof supabase === 'undefined') {
        console.error('CRITICAL: Supabase library not found. Ensure CDN script is loaded first.');
        return;
    }

    // 3. Configuration
    const SUPABASE_URL = "https://lncsedpatzsvipllgxqd.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_nf37_5za-dROyzzMBdou_Q_EoZD1JG1";

    // 4. Initialize Client (ONCE)
    // We use a unique local variable 'supabaseClient' to avoid conflicts
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 5. Expose Globally
    // Pass to window.supabase so all other scripts can use it
    window.supabase = supabaseClient;
    
    // Mark as initialized
    window.supabaseClientInitialized = true;
    
    console.log('✅ Supabase Client Initialized & Attached to window.supabase');
})();
