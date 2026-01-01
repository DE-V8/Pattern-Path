document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       EXISTING: HERO 3D TILT EFFECT & MOBILE
       ========================================= */
    const menuBtn = document.querySelector('button.md\\:hidden');
    // ... previous code ...
    
    const heroVisual = document.querySelector('.perspective-1000');
    if (heroVisual) {
       // ... existing tilt logic ...
       // (Keeping existing logic if this was a shared file, but since we are in a 'script.js' 
       // that might be shared, we ensure no conflicts)
    }


    /* =========================================
       NEW: ACCORDION LOGIC (Arrays Page)
       ========================================= */
    // Expose function globally or attach event listeners specifically
    window.toggleAccordion = function(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('svg');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Toggle ARIA
        button.setAttribute('aria-expanded', !isExpanded);

        // Toggle UI
        if (!isExpanded) {
            // EXPAND
            content.style.height = content.scrollHeight + 'px';
            icon.style.transform = 'rotate(90deg)';
            button.classList.add('bg-white/5'); // Keep highlight state
        } else {
            // COLLAPSE
            content.style.height = '0px';
            icon.style.transform = 'rotate(0deg)';
            button.classList.remove('bg-white/5');
        }
    };

    /* =========================================
       NEW: PROGRESS RING ANIMATION (Simulation)
       ========================================= */
    const progressRing = document.getElementById('progress-ring');
    if (progressRing) {
        // Circumference = 2 * PI * r (36) ≈ 226
        const circumference = 226;
        const percent = 5; // Example: 5% progress
        const offset = circumference - (percent / 100) * circumference;
        
        // Small delay for visual effect
        setTimeout(() => {
            progressRing.style.strokeDashoffset = offset;
        }, 500);
    }

});
