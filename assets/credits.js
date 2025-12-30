document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'userCredits';
    const DEFAULT_CREDITS = 3;

    // 1. Core Logic
    function getCredits() {
        let credits = localStorage.getItem(STORAGE_KEY);
        if (credits === null) {
            localStorage.setItem(STORAGE_KEY, DEFAULT_CREDITS);
            return DEFAULT_CREDITS;
        }
        return parseInt(credits, 10);
    }

    function setCredits(value) {
        if (value < 0) value = 0; // Prevent negative
        localStorage.setItem(STORAGE_KEY, value);
        updateCreditsUI();
        
        // SYNC: Push to Supabase
        (async () => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.loggedIn && window.Sync) {
                    await window.Sync.syncCredits(currentUser.email, value);
                }
            } catch (e) {
                console.warn('Credits Sync Warning:', e);
            }
        })();
    }
    
    // 2. UI Update
    function updateCreditsUI() {
        const credits = getCredits();
        // Update all instances on the page (mobile + desktop if separate)
        const displayElements = document.querySelectorAll('.credits-display-value');
        displayElements.forEach(el => {
            el.textContent = credits;
            
            // Optional visual feedback on change could go here
        });
    }

    // Expose globally for other scripts (progress.js)
    window.updateCreditsUI = updateCreditsUI;

    // 3. Initialization
    // Ensure default exists
    if (localStorage.getItem(STORAGE_KEY) === null) {
        setCredits(DEFAULT_CREDITS);
    }
    
    // Sync Check: If logged in, fetch remote credits just in case (e.g. new device)
    (async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.loggedIn) {
                
                if (!window.Sync) {
                    // console.warn('Credits: Sync module not loaded.'); 
                    // Silent return to avoid log noise if offline or script order issue
                    return; 
                }

                const remoteCredits = await window.Sync.fetchCredits(currentUser.email);
                
                if (remoteCredits !== null) {
                    console.log('Credits: Synced from remote:', remoteCredits);
                    // Update local if different
                    localStorage.setItem(STORAGE_KEY, remoteCredits);
                    updateCreditsUI();
                }
            }
        } catch (e) {
            console.warn('Credits: Remote fetch failed', e);
        }
    })();
    
    // Initial UI render
    updateCreditsUI();

    // 4. Expose Globally (for Chat/Rewards)
    window.UserCredits = {
        get: getCredits,
        set: setCredits,
        updateUI: updateCreditsUI
    };
});
