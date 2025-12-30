document.addEventListener('DOMContentLoaded', () => {
    // 1. Find all checkboxes
    const checkboxes = document.querySelectorAll('.problem-checkbox');
    
    // If no checkboxes, exit
    if (checkboxes.length === 0) return;

    // 2. Identify Lesson (from first checkbox)
    const lessonId = checkboxes[0].dataset.lesson;
    if (!lessonId) {
        console.warn('Progress: No data-lesson found on checkboxes.');
        return;
    }

    // 3. Load or Init State
    let allProgress = JSON.parse(localStorage.getItem('lessonProgress')) || {};
    
    // Ensure structure for this lesson
    if (!allProgress[lessonId]) {
        allProgress[lessonId] = {
            total: checkboxes.length,
            completed: []
        };
    } else {
        // Always sync total count in case HTML changed
        allProgress[lessonId].total = checkboxes.length;
    }
    
    const state = allProgress[lessonId];

    // 4. UI Elements
    const ring = document.getElementById('progress-ring');
    const percentText = document.getElementById('progress-percent');
    const countText = document.getElementById('progress-count');
    
    // Helper: Save State
    function save() {
        localStorage.setItem('lessonProgress', JSON.stringify(allProgress));
    }

    // Helper: Update UI
    function updateUI() {
        const total = state.total;
        const current = state.completed.length;
        const pct = total === 0 ? 0 : Math.round((current / total) * 100);

        // Update Text
        if (percentText) percentText.textContent = `${pct}%`;
        
        if (countText) {
            if (pct === 100) {
                countText.textContent = "Lesson Completed ✅";
                countText.classList.add('text-primary'); // Add accent color
            } else {
                countText.textContent = `${current} of ${total} Problems Solved`;
                countText.classList.remove('text-primary');
            }
        }

        // Update Ring (Circumference ~ 226 for r=36)
        // stroke-dashoffset = circumference - (circumference * pct / 100)
        if (ring) {
            const circumference = 226;
            const offset = circumference - (circumference * pct / 100);
            ring.style.strokeDashoffset = offset;
        }
    }

    // 5. Initialize Checkboxes
    checkboxes.forEach(cb => {
        const idx = parseInt(cb.dataset.index);
        
        // Restore state
        if (state.completed.includes(idx)) {
            cb.checked = true;
        } else {
            cb.checked = false;
        }

        // Handle Change
        cb.addEventListener('change', () => {
            if (cb.checked) {
                // Add if not present
                if (!state.completed.includes(idx)) {
                    state.completed.push(idx);
                }
            } else {
                // Remove if present
                const location = state.completed.indexOf(idx);
                if (location > -1) {
                    state.completed.splice(location, 1);
                }
            }
            
            // Persist and Update
            save();
            updateUI();
        });
    });

    // Initial Update
    updateUI();
    save(); // Save initial structure if it was empty
});
