import os
import re

# PATTERN DATA
patterns = [
    # (Filename without extension, Display Name, Difficulty Count Hint)
    ("arrays", "Arrays & Hashing", "8 Easy • 12 Med • 7 Hard"), 
    ("two-pointers", "Two Pointers", "5 Easy • 8 Med • 5 Hard"),
    ("sliding-window", "Sliding Window", "3 Easy • 7 Med • 2 Hard"),
    ("fast-slow", "Fast & Slow Pointers", "1 Easy • 4 Med • 2 Hard"),
    ("intervals", "Intervals", "2 Easy • 5 Med • 1 Hard"),
    ("linked-list", "Linked List", "6 Easy • 8 Med • 4 Hard"),
    ("heaps", "Heaps / Priority Queue", "2 Easy • 9 Med • 4 Hard"),
    ("k-way-merge", "K-Way Merge", "0 Easy • 4 Med • 3 Hard"),
    ("top-k", "Top K Elements", "1 Easy • 6 Med • 2 Hard"),
    ("binary-search", "Binary Search", "4 Easy • 10 Med • 3 Hard"),
    ("dynamic-programming", "Dynamic Programming", "5 Easy • 15 Med • 10 Hard"),
    ("greedy", "Greedy", "3 Easy • 12 Med • 4 Hard"),
    ("backtracking", "Backtracking", "1 Easy • 8 Med • 3 Hard"),
    ("cyclic-sort", "Cyclic Sort", "1 Easy • 4 Med • 2 Hard"),
    ("topological-sort", "Topological Sort", "0 Easy • 5 Med • 3 Hard"),
    ("sort-search", "Sorting & Searching", "5 Easy • 5 Med • 0 Hard"),
    ("matrices", "Matrices", "3 Easy • 8 Med • 3 Hard"),
    ("stacks", "Stacks", "4 Easy • 9 Med • 5 Hard"),
    ("graphs", "Graphs", "3 Easy • 12 Med • 8 Hard"),
    ("tree-dfs", "Tree DFS", "4 Easy • 8 Med • 3 Hard"),
    ("tree-bfs", "Tree BFS", "2 Easy • 6 Med • 2 Hard"),
    ("trie", "Trie", "0 Easy • 5 Med • 2 Hard"),
    ("hashmap", "Hash Maps & Sets", "5 Easy • 10 Med • 5 Hard"),
    ("frequency-tracking", "Frequency Tracking", "2 Easy • 4 Med • 1 Hard"),
    ("union-find", "Union Find", "0 Easy • 6 Med • 4 Hard"),
    ("custom-ds", "Custom Data Structures", "1 Easy • 3 Med • 2 Hard"),
    ("bitwise", "Bitwise Manipulation", "4 Easy • 6 Med • 3 Hard"),
    ("math-geometry", "Math & Geometry", "5 Easy • 7 Med • 2 Hard"),
    ("segment-tree", "Segment Tree", "0 Easy • 2 Med • 5 Hard"),
    ("extra-problems", "Extra Problems", "10 Easy • 10 Med • 10 Hard"),
]

# MASTER TEMPLATE: Dynamic Reading
# We read arrays.html (the master design) and replace specific sections
template_path = "../patterns/arrays.html"

if not os.path.exists(template_path):
    print(f"Error: Master template {template_path} not found.")
    exit(1)

with open(template_path, "r", encoding="utf-8") as f:
    master_html = f.read()

# ROW GENERATOR
def generate_row(idx, difficulty):
    diff_class = "diff-easy"
    diff_label = "Easy"
    
    if difficulty == "Medium":
        diff_class = "diff-medium"
        diff_label = "Medium"
    elif difficulty == "Hard":
        diff_class = "diff-hard"
        diff_label = "Hard"

    return f"""
                <div class="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 items-center p-4 hover:bg-white/[0.02] transition-colors group">
                    <!-- STATUS -->
                    <div class="w-8 flex justify-center">
                        <label class="relative cursor-pointer">
                            <input type="checkbox" class="peer sr-only">
                            <div class="w-5 h-5 border-2 border-secondary/50 rounded flex items-center justify-center peer-checked:bg-secondary peer-checked:border-secondary transition-all">
                                <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                            </div>
                        </label>
                    </div>
                    <!-- PROBLEM -->
                    <div class="pl-2">
                        <a href="#" class="text-sm font-medium text-textPrimary hover:text-primary transition-colors">Problem {idx} – Placeholder</a>
                    </div>
                    <!-- VIDEO -->
                    <div class="w-20 flex justify-center gap-3 hidden md:flex">
                        <button class="text-textMuted hover:text-primary transition-colors" title="Video Solution">
                            <!-- VIDEO LINK PLACEHOLDER -->
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                    </div>
                    <!-- PRACTICE -->
                    <div class="w-16 flex justify-center hidden md:flex">
                         <a href="#" class="text-textMuted hover:text-white pb-1 border-b border-transparent hover:border-white transition-all text-xs">LC</a>
                    </div>
                    <!-- NOTE -->
                    <div class="w-12 flex justify-center hidden md:flex">
                        <button class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-textMuted transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                    <!-- REVISION -->
                    <div class="w-16 flex justify-center hidden md:flex">
                         <!-- REVISION FLAG -->
                         <button class="text-textMuted hover:text-secondary transition-colors" onclick="this.classList.toggle('text-secondary'); this.classList.toggle('fill-current')">
                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                         </button>
                    </div>
                    <!-- DIFF -->
                    <div class="w-20 text-right pr-2">
                        <span class="text-xs font-bold text-{diff_class} bg-{diff_class}/10 px-2 py-0.5 rounded border border-{diff_class}/20">{diff_label}</span>
                    </div>
                </div>
    """

# MAIN GENERATION
if not os.path.exists("../patterns"):
    os.makedirs("../patterns")

print(f"Using {template_path} as master template.")

for item in patterns:
    fname, name, diff_hint = item
    
    # Skip arrays.html itself (it's the source)
    if fname == "arrays":
        continue
    
    # Generate placeholder rows
    rows_html = ""
    rows_html += generate_row(1, "Easy")
    rows_html += generate_row(2, "Medium")
    rows_html += generate_row(3, "Medium")
    rows_html += generate_row(4, "Hard")
    rows_html += generate_row(5, "Easy")

    # "arrays.html (already exists – keep as reference)" suggests I should NOT overwrite it with placeholders.
    # I will skip 'arrays' in the loop if I strictly follow "missing".
    
    if fname == "arrays":
        continue

    # Create content
    # Create content
    # 1. Title
    # Replace "Arrays Interview Questions"
    html_content = master_html.replace("Arrays Interview Questions", f"{name} Interview Questions")
    
    # 2. Breadcrumb (Pattern Name)
    # Target specific span
    html_content = html_content.replace('<span class="text-secondary">Arrays</span>', f'<span class="text-secondary">{name}</span>')
    
    # 3. Main Heading
    # "Top Array Interview Questions" -> "Top Two Pointers Interview Questions" (or just "Two Pointers")
    # Let's make it just "{name}" for cleaner look, or "{name} Interview Questions"
    html_content = html_content.replace("Top Array Interview Questions", f"{name} Interview Questions")
    
    # 4. Description
    old_desc = "A complete roadmap to mastering Array data structures. From basic linear iteration to complex two-pointer and sliding window problems seen in FAANG interviews."
    new_desc = f"Master the {name} pattern. Curated list of problems to master this pattern."
    html_content = html_content.replace(old_desc, new_desc)

    # 5. Table Rows
    # Replace the table body content
    # Regex is safest here to capture the multi-line div content
    html_content = re.sub(r'(<div class="divide-y divide-secondary-dim/30">).*?(</div>\s*</div>)', f'\\1\n{rows_html}\n            \\2', html_content, flags=re.DOTALL)

    # Write
    with open(f"../patterns/{fname}.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"Generated ../patterns/{fname}.html")

print("Done.")
