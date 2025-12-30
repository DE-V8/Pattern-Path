document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Progress State
    const allProgress = JSON.parse(localStorage.getItem('lessonProgress')) || {};
    
    // 2. Select All Pattern Cards (Anchors that link to patterns)
    // We need a way to identify which pattern is which.
    // We'll trust the href to extract the lesson key.
    
    const cards = document.querySelectorAll('a[href^="../patterns/"]');
    
    cards.forEach(card => {
        // Extract lesson key from href: "../patterns/arrays.html" -> "arrays"
        const href = card.getAttribute('href');
        if (!href) return;
        
        const filename = href.split('/').pop(); // "arrays.html"
        if (!filename) return;
        
        const lessonKey = filename.replace('.html', ''); // "arrays"
        
        // 3. Get Data for this Lesson
        const data = allProgress[lessonKey];
        
        // 4. Update UI if data exists
        if (data && data.total > 0) {
            const pct = Math.round((data.completed.length / data.total) * 100);
            
            // Find progress bar (div with bg-primary)
            // Structure: 
            // <div class="w-full h-1 ...">
            //    <div class="h-full bg-primary w-[35%]"></div>
            // </div>
            const progressBar = card.querySelector('.bg-primary');
            if (progressBar) {
                progressBar.style.width = `${pct}%`;
            }
            
            // Find percentage text
            // Structure: <span>35%</span> (it's the last span in the mt-2 div)
            const metaDiv = card.querySelector('.mt-2');
            if (metaDiv) {
                const spans = metaDiv.querySelectorAll('span');
                if (spans.length >= 2) {
                    const percentSpan = spans[spans.length - 1]; // Assume last one is percentage
                    percentSpan.textContent = `${pct}%`;
                    
                    // Optional: Highlight if 100%
                    if (pct === 100) {
                        percentSpan.classList.add('text-primary', 'font-bold');
                    }
                }
            }
        } else {
            // Default to 0? Or leave as is (usually 0% in HTML)
            // Let's force 0% for consistency if no data found
             const progressBar = card.querySelector('.bg-primary');
             if (progressBar) progressBar.style.width = '0%';
             
             const metaDiv = card.querySelector('.mt-2');
             if (metaDiv) {
                const spans = metaDiv.querySelectorAll('span');
                 if (spans.length >= 2) {
                    spans[spans.length - 1].textContent = '0%';
                 }
             }
        }
    });
});
