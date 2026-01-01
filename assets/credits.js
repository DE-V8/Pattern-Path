const CREDIT_COSTS = {
    mentorship_chat: 1
};

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'userCredits';
    const DEFAULT_CREDITS = 3;

    // ================================================
    // 1. CORE: READ / WRITE
    // ================================================
    function getLocalCredits() {
        let credits = localStorage.getItem(STORAGE_KEY);
        if (credits === null) {
            localStorage.setItem(STORAGE_KEY, DEFAULT_CREDITS);
            return DEFAULT_CREDITS;
        }
        return parseInt(credits, 10);
    }

    function setCredits(value) {
        if (value < 0) value = 0;
        localStorage.setItem(STORAGE_KEY, value);
        updateCreditsUI(value);
        
        // SYNC: Push to Supabase (Non-blocking)
        (async () => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (currentUser.loggedIn && window.Sync) {
                    await window.Sync.syncCredits(currentUser.email, value);
                }
            } catch (e) {
                console.warn('Credits Sync Warning:', e);
            }
        })();
    }

    // ================================================
    // 2. UI UPDATE
    // ================================================
    function updateCreditsUI(value) {
        // If value not passed, read from storage
        const credits = (value !== undefined) ? value : getLocalCredits();
        
        // 1. Class-based (Global)
        const displayElements = document.querySelectorAll('.credits-display-value');
        displayElements.forEach(el => {
            el.textContent = credits;
        });

        // 2. ID-based (Specific)
        const specificEl = document.getElementById('credits-remaining');
        if (specificEl) {
            specificEl.textContent = credits;
        }
        
        // Safety: Disable buttons if low credits
        const mentorBtn = document.getElementById('start-mentorship-btn');
        if (mentorBtn) {
            if (credits < CREDIT_COSTS.mentorship_chat) {
                mentorBtn.classList.add('opacity-50', 'cursor-not-allowed');
                mentorBtn.setAttribute('disabled', 'true');
            } else {
                mentorBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                mentorBtn.removeAttribute('disabled');
            }
        }
    }

    // ================================================
    // 3. MENTORSHIP LOGIC
    // ================================================
    function canStartMentorship() {
        return getLocalCredits() >= CREDIT_COSTS.mentorship_chat;
    }

    function deductCredits(amount) {
        const current = getLocalCredits();
        const updated = Math.max(0, current - amount);
        setCredits(updated); // Re-uses setCredits for sync & UI
        return updated;
    }

    function startMentorship() {
        if (!canStartMentorship()) {
            alert("Not enough credits. Complete lessons to earn more.");
            return false;
        }

        deductCredits(CREDIT_COSTS.mentorship_chat);
        window.location.href = "../mentorship/chat.html";
    }

    // ================================================
    // 4. EXPOSE GLOBALLY
    // ================================================
    window.getLocalCredits = getLocalCredits;
    window.startMentorship = startMentorship;
    window.updateCreditsUI = updateCreditsUI; 
    
    // Existing Global Interface (for compatibility)
    window.UserCredits = {
        get: getLocalCredits,
        set: setCredits,
        updateUI: updateCreditsUI
    };

    // ================================================
    // 5. INITIALIZATION
    // ================================================
    // Ensure default exists
    if (localStorage.getItem(STORAGE_KEY) === null) {
        setCredits(DEFAULT_CREDITS);
    }
    
    // Initial Render
    updateCreditsUI();

    // Sync Check: Fetch remote
    (async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.loggedIn && window.Sync) {
                const remoteCredits = await window.Sync.fetchCredits(currentUser.email);
                if (remoteCredits !== null) {
                    console.log('Credits: Synced from remote:', remoteCredits);
                    localStorage.setItem(STORAGE_KEY, remoteCredits);
                    updateCreditsUI();
                }
            }
        } catch (e) { /* Ignore */ }
    })();
});

