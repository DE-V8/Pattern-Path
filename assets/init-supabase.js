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

(function() {
    // 1. Check if Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.error('CRITICAL: Supabase library not loaded. Make sure the CDN script is included before this file.');
        return;
    }

    // 2. Configuration (User Provided)
    const SUPABASE_URL = "https://lncsedpatzsvipllgxqd.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_nf37_5za-dROyzzMBdou_Q_EoZD1JG1";

    // 3. Initialize Client
    try {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 4. Attach to Global Window (Make it public)
        window.supabase = client;
        
        console.log('Supabase initialized globally via init-supabase.js');
        
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
    }
})();
