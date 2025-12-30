import os

PATTERNS_DIR = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\patterns"
DATA_DIR = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\data"

# Standard Placeholder Data Template (No double braces needed for .replace)
DATA_TEMPLATE = """export const lessonData = {
    lessonId: "LESSON_ID_PLACEHOLDER",
    problems: [
      {
        title: "Problem 1 – Placeholder",
        leetcode: "",
        video: "",
        difficulty: "Easy",
        isPlus: false
      },
      {
        title: "Problem 2 – Placeholder",
        leetcode: "",
        video: "",
        difficulty: "Easy",
        isPlus: false
      },
      {
        title: "Problem 3 – Placeholder",
        leetcode: "",
        video: "",
        difficulty: "Medium",
        isPlus: false
      },
      {
        title: "Problem 4 – Placeholder",
        leetcode: "",
        video: "",
        difficulty: "Medium",
        isPlus: false
      },
      {
        title: "Problem 5 – Placeholder",
        leetcode: "",
        video: "",
        difficulty: "Hard",
        isPlus: false
      }
    ]
  };"""

# The script to inject into HTML
SCRIPT_TEMPLATE = """    <!-- DATA-DRIVEN CONTENT SCRIPT -->
    <script type="module">
        import { lessonData } from '../data/LESSON_ID_PLACEHOLDER.js';

        const tableBody = document.getElementById('problems-table-body');
        
        lessonData.problems.forEach((problem, index) => {
            let diffColorClass = 'text-diff-easy bg-diff-easy/10 border-diff-easy/20';
            if (problem.difficulty === 'Medium') diffColorClass = 'text-diff-medium bg-diff-medium/10 border-diff-medium/20';
            if (problem.difficulty === 'Hard') diffColorClass = 'text-diff-hard bg-diff-hard/10 border-diff-hard/20';

            const plusBadge = problem.isPlus 
                ? `<span class="hidden group-hover:inline-block px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/20">Plus</span>` 
                : '';

            const row = document.createElement('div');
            row.className = 'grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 items-center p-4 hover:bg-white/[0.02] transition-colors group';
            
            row.innerHTML = `
                <!-- STATUS -->
                <div class="w-8 flex justify-center">
                    <label class="relative cursor-pointer">
                        <input type="checkbox" class="peer sr-only problem-checkbox" data-lesson="${lessonData.lessonId}" data-index="${index}">
                        <div class="w-5 h-5 border-2 border-secondary/50 rounded flex items-center justify-center peer-checked:bg-secondary peer-checked:border-secondary transition-all">
                            <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                    </label>
                </div>

                <!-- TITLE -->
                <div class="pl-2">
                    <a href="${problem.leetcode || '#'}" class="text-sm font-medium text-textPrimary hover:text-primary transition-colors flex items-center gap-2">
                        ${problem.title}
                        ${plusBadge}
                    </a>
                </div>

                <!-- RESOURCES -->
                <div class="w-20 flex justify-center gap-3 hidden md:flex">
                    <button class="text-textMuted hover:text-primary transition-colors" title="Video Solution">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </button>
                    <button class="text-textMuted hover:text-secondary transition-colors" title="Article">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </button>
                </div>

                <!-- PRACTICE -->
                <div class="w-16 flex justify-center hidden md:flex">
                    <a href="${problem.leetcode || '#'}" target="_blank" class="text-textMuted hover:text-white pb-1 border-b border-transparent hover:border-white transition-all text-xs">LC</a>
                </div>

                <!-- NOTES -->
                <div class="w-12 flex justify-center hidden md:flex">
                    <button class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-textMuted transition-colors">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
                    </button>
                </div>

                <!-- REVISION -->
                <div class="w-16 flex justify-center hidden md:flex">
                    <button class="text-textMuted hover:text-secondary transition-colors" onclick="this.classList.toggle('text-secondary'); this.classList.toggle('fill-current')">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    </button>
                </div>

                <!-- DIFFICULTY -->
                <div class="w-20 text-right pr-2">
                    <span class="text-xs font-bold ${diffColorClass} px-2 py-0.5 rounded border">${problem.difficulty}</span>
                </div>
            `;
            tableBody.appendChild(row);
        });
    </script>"""

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

files = [f for f in os.listdir(PATTERNS_DIR) if f.endswith(".html")]

for f in files:
    lesson_id = os.path.splitext(f)[0]
    
    # SKIP arrays.html because we manually did it and it has REAL content
    if lesson_id == "arrays":
        continue

    print(f"Refactoring {lesson_id}...")

    # 1. Create JS Data File
    js_filename = os.path.join(DATA_DIR, f"{lesson_id}.js")
    with open(js_filename, 'w', encoding='utf-8') as js_file:
        js_file.write(DATA_TEMPLATE.replace("LESSON_ID_PLACEHOLDER", lesson_id))

    # 2. Update HTML
    html_path = os.path.join(PATTERNS_DIR, f)
    with open(html_path, 'r', encoding='utf-8') as html_file:
        content = html_file.read()

    # Prevent double processing if run multiple times
    if 'import { lessonData }' in content:
        print(f"Skipping {lesson_id}, already refactored.")
        continue

    lines = content.splitlines()
    new_lines = []
    
    in_table_body = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Look for the specific table body div (relying on exact attributes used in templates)
        if '<div class="divide-y divide-secondary-dim/30">' in line:
            new_lines.append('            <!-- TABLE BODY (Generated via JS) -->')
            new_lines.append('            <div id="problems-table-body" class="divide-y divide-secondary-dim/30">')
            new_lines.append('                <!-- Rows will be injected here by the script below -->')
            new_lines.append('            </div>')
            in_table_body = True
            i += 1
            continue
            
        if in_table_body:
            # Skip until closing div found (indentation based)
            # Template indentation is usually 12 spaces for the closing `            </div>`
            if line.strip() == '</div>' and line.startswith('            </div>'):
                in_table_body = False
                # Do not emit the closing div here, we closed it in the new block above
            i += 1
            continue
        
        new_lines.append(line)
        i += 1
        
    updated_content = "\n".join(new_lines)
    
    # Inject Script
    script_block = SCRIPT_TEMPLATE.replace("LESSON_ID_PLACEHOLDER", lesson_id)
    updated_content = updated_content.replace('</body>', f'{script_block}\n</body>')

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

print("Batch refactoring complete.")
