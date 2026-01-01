/**
 * DASHBOARD PROGRESS MANAGER
 * ----------------------------
 * Handles safe rendering of progress bars to avoid race conditions.
 * 
 * CORE PRINCIPLES:
 * 1. Single Source of Truth (progressState)
 * 2. Strict Hydration Flag (isProgressHydrated)
 * 3. Conditional Rendering (No render until hydrated)
 * 4. Safe DOM Updates (No NaN/Undefined)
 */

let progressState = null;
let isProgressHydrated = false;

document.addEventListener('DOMContentLoaded', async () => {
    await initProgress();
});

/**
 * 1. INITIALIZATION & DATA LOADING
 */
async function initProgress() {
    try {
        // A. Load LocalStorage (Fast)
        const localData = JSON.parse(localStorage.getItem('lessonProgress')) || {};
        
        // B. Merge Remote Data (If online)
        let remoteData = null;
        if (window.Sync && typeof window.Sync.fetchProgress === 'function') {
            const user = window.supabase ? (await window.supabase.auth.getUser()).data.user : null;
            if (user) {
                remoteData = await window.Sync.fetchProgress();
            }
        }

        // C. Merge & Normalize
        // We prioritize remote data if valid, otherwise fallback to local
        // Actually best practice is: Local is base, merge Remote updates into it
        const mergedData = { ...localData, ...(remoteData || {}) };
        
        progressState = normalizeProgress(mergedData);
        isProgressHydrated = true;

        // D. First Render
        console.log("Progress hydrated:", progressState);
        renderProgress();

    } catch (e) {
        console.error("Progress Initialization Failed:", e);
        // Fail-safe: Render empty if crash
        progressState = {};
        isProgressHydrated = true;
        renderProgress();
    }
}

/**
 * 2. NORMALIZATION
 * Ensures all numbers are valid finite numbers. 0-100 range.
 */
function normalizeProgress(rawData) {
    const cleanState = {};

    Object.keys(rawData).forEach(key => {
        const item = rawData[key];
        if (!item) return;

        // Safe Defaults
        const completedCount = Array.isArray(item.completed) ? item.completed.length : 0;
        const totalCount = Number.isFinite(item.total) && item.total > 0 ? item.total : 1; // Avoid divide by zero
        
        let pct = Math.round((completedCount / totalCount) * 100);

        // Clamp
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;

        cleanState[key] = {
            completed: completedCount,
            total: totalCount,
            percent: pct
        };
    });

    return cleanState;
}

/**
 * 3. SAFE RENDERING
 */
function renderProgress() {
    // GUARD: Never render if not hydrated
    if (!isProgressHydrated || !progressState) return;

    // Selector: Anchors pointing to pattern pages
    const cards = document.querySelectorAll('a[href*="/patterns/"]');

    cards.forEach(card => {
        // Extract Key (Fail-safe)
        const href = card.getAttribute('href');
        if (!href) return;
        
        const filename = href.split('/').pop(); // "arrays.html"
        if (!filename) return;

        const lessonKey = filename.replace('.html', '');
        
        // 1. Get UI Total (Fallback source of truth)
        const uiTotal = parseTotalFromUI(card);

        // 2. Get Data Safe
        const data = progressState[lessonKey] || {};
        const completed = data.completed || 0;
        
        // 3. Determine Total
        // CORRECTION: Prioritize UI Total because LocalStorage might have buggy "1" from previous version.
        // We trust the dashboard definition (uiTotal) more than the cache.
        let total = (uiTotal && uiTotal > 0) ? uiTotal : (data.total || 1);
        
        if (!total || total < 1) total = 1;

        console.log(`[Progress] ${lessonKey}: ${completed}/${total} (UI: ${uiTotal}, Store: ${data.total})`);

        // 4. Calculate Percentage
        let percent = Math.round((completed / total) * 100);

        // Clamp & Safety
        if (!Number.isFinite(percent)) percent = 0;
        if (percent > 100) percent = 100;

        // Update UI
        updateCardUI(card, percent);
    });
}

/**
 * HELPER: Parse total problems from UI text
 * Expected format: "8 Easy • 12 Med • 7 Hard"
 */
function parseTotalFromUI(card) {
    try {
        const metaDiv = card.querySelector('.mt-2');
        if (!metaDiv) return 0;
        
        // The stats are usually in the first span
        const span = metaDiv.querySelector('span'); 
        if (!span) return 0;

        const text = span.textContent;
        // Regex to sum up all numbers found before "Easy", "Med", "Hard"
        // Matches: "8" from "8 Easy", "12" from "12 Med", etc.
        const matches = text.matchAll(/(\d+)\s+(?:Easy|Med|Hard)/gi);
        
        let sum = 0;
        for (const match of matches) {
            sum += parseInt(match[1], 10);
        }
        return sum;

    } catch (e) {
        console.warn('Error parsing UI total:', e);
        return 0;
    }
}

function updateCardUI(card, percent) {
    // A. Progress Bar
    const progressBar = card.querySelector('.bg-primary');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }

    // B. Text Info (e.g. "35%")
    const metaDiv = card.querySelector('.mt-2');
    if (metaDiv) {
        const spans = metaDiv.querySelectorAll('span');
        // Assuming the last span is the percentage
        if (spans.length > 0) {
            const percentSpan = spans[spans.length - 1];
            percentSpan.textContent = `${percent}%`;
            
            // Colorize if complete
            if (percent === 100) {
                percentSpan.classList.add('text-primary', 'font-bold');
            } else {
                percentSpan.classList.remove('text-primary', 'font-bold');
            }
        }
    }
}

// Expose for debugging if needed
window.debugProgress = () => {
    console.log({ isProgressHydrated, progressState });
};
