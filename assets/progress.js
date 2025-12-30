document.addEventListener('DOMContentLoaded', () => {
   
   console.log("🔥 LOADING LESSON PROGRESS...");

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

   // --- STEP 1: SAFE STORAGE INIT ---
   // ensure userCredits and creditedLessons exist safely
   if (localStorage.getItem('userCredits') === null) {
       localStorage.setItem('userCredits', '0');
   }
   if (localStorage.getItem('creditedLessons') === null) {
       localStorage.setItem('creditedLessons', JSON.stringify([]));
   }
   
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
       
       // Restore state (Local first)
       if (state.completed.includes(idx)) {
           cb.checked = true;
       } else {
           cb.checked = false;
       }

       // Handle Change
       cb.addEventListener('change', async () => {
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
           
           // Persist and Update Local
           save();
           updateUI();

           // --- STEP 3: CALL CREDIT FUNCTION ---
           // Call global credit check safely
           if (typeof window.checkAndAwardCredits === 'function') {
               window.checkAndAwardCredits(lessonId);
           }
           
           // Sync Remote
           try {
               const currentUser = JSON.parse(localStorage.getItem('currentUser'));
               if (currentUser && currentUser.loggedIn && window.Sync) {
                   await window.Sync.syncProgress(currentUser.email, lessonId, state.completed);
               }
           } catch (e) {
               console.warn('Progress Sync Warning:', e);
           }
       });
   });
   
   // 6. Remote Merge (Async)
   (async () => {
       try {
           const currentUser = JSON.parse(localStorage.getItem('currentUser'));
           if (!currentUser || !currentUser.loggedIn) return;

           // Check for global Sync
           if (!window.Sync) {
               console.warn('Progress: Sync module not found.');
               return;
           }

           const remoteMap = await window.Sync.fetchProgress(currentUser.email);
           
           if (remoteMap && remoteMap[lessonId]) {
               const remoteCompleted = remoteMap[lessonId].completed || [];
               let changed = false;
               
               // Union: Add remote items to local if missing
               remoteCompleted.forEach(remoteIdx => {
                   // Try/catch for simple parsing safety, though it should be array of numbers
                   const val = typeof remoteIdx === 'string' ? parseInt(remoteIdx) : remoteIdx;
                   if (!state.completed.includes(val)) {
                       state.completed.push(val);
                       changed = true;
                   }
               });
               
               if (changed) {
                   console.log('Progress: Merged remote data.');
                   save();
                   
                   // Re-render Checkboxes
                   checkboxes.forEach(cb => {
                       const idx = parseInt(cb.dataset.index);
                       if (state.completed.includes(idx)) cb.checked = true;
                   });
                   
                   updateUI();

                   // Check credits again after merge in case remote triggered completion!
                   if (typeof window.checkAndAwardCredits === 'function') {
                        window.checkAndAwardCredits(lessonId);
                   }
               }
           }
       } catch (e) {
           console.warn('Progress: Remote merge failed', e);
       }
   })();

   // Initial Update
   updateUI();
   save(); // Save initial structure if it was empty
});

// =========================================================
// STEP 2: GLOBAL CREDIT CHECK FUNCTION
// Attached to window for console/global access.
// =========================================================
window.checkAndAwardCredits = function (lessonId) {
 console.log(`Checking credits for lesson: ${lessonId}`);

 const progress = JSON.parse(localStorage.getItem("lessonProgress"));
 
 // Using 'creditedLessons' as requested for separate tracking
 const creditedLessons = JSON.parse(localStorage.getItem("creditedLessons")) || [];
 let credits = parseInt(localStorage.getItem("userCredits"), 10) || 0;

 if (!progress || !progress[lessonId]) {
   console.warn("No progress found for:", lessonId);
   return;
 }

 const { completed, total } = progress[lessonId];

 // Logic: If fully completed AND not in rewarded list
 if (completed.length === total && total > 0) {
     if (!creditedLessons.includes(lessonId)) {
        
         // AWARD CREDIT
         credits += 1;
         creditedLessons.push(lessonId);

         localStorage.setItem("creditedLessons", JSON.stringify(creditedLessons));
         localStorage.setItem("userCredits", credits.toString());

         console.log(`🎉 Credit awarded for ${lessonId}. Total: ${credits}`);
         
         // Try to Sync (Placeholder)
         window.syncCreditsToSupabase();
         
         // Update UI (Live)
         if (typeof window.updateCreditsUI === 'function') {
             window.updateCreditsUI();
         }

     } else {
         console.log("ℹ️ Credits already awarded for this lesson.");
     }
 }
};

// =========================================================
// STEP 5: SYNC PLACEHOLDER
// =========================================================
window.syncCreditsToSupabase = async function() {
    if (!navigator.onLine) return;
    
    // Future: Call Supabase update here
    // const { error } = await supabase...
    console.log("📡 Remote Sync: Credits queued for sync (Placeholder)");
    
    // If we have our window.Sync helper, we can use it!
    if (window.Sync) {
         const currentUser = JSON.parse(localStorage.getItem('currentUser'));
         const credits = parseInt(localStorage.getItem("userCredits"), 10);
         if (currentUser && currentUser.loggedIn) {
             window.Sync.syncCredits(currentUser.email, credits);
         }
    }
};
