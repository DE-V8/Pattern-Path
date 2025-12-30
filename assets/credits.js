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

    // 3. Initialization
    // Ensure default exists
    if (localStorage.getItem(STORAGE_KEY) === null) {
        setCredits(DEFAULT_CREDITS);
    }
    
    // Initial UI render
    updateCreditsUI();

    // 4. Expose Globally (for Chat/Rewards)
    window.UserCredits = {
        get: getCredits,
        set: setCredits,
        updateUI: updateCreditsUI
    };
});
