import os
import re

PATTERNS_DIR = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\patterns"

def process_file(filepath):
    filename = os.path.basename(filepath)
    lesson_id = filename.replace('.html', '')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject IDs into Progress Card (if not already present)
    # Target: <span class="absolute text-sm font-bold text-textPrimary">0%</span>
    if 'id="progress-percent"' not in content:
        content = re.sub(
            r'(<span class="absolute text-sm font-bold text-textPrimary">)(0%)(</span>)',
            r'\1<span id="progress-percent">\2</span>\3', # Nesting or adding ID? adding ID to span
             # Wait, regex group 1 is the open tag. I want to add property to it.
             # Easier: Replace the specific known string.
             content
        )
        content = content.replace(
            '<span class="absolute text-sm font-bold text-textPrimary">0%</span>',
            '<span class="absolute text-sm font-bold text-textPrimary" id="progress-percent">0%</span>'
        )

    # Target: <p class="text-xs text-textMuted">0 of 43 Problems Solved</p> 
    # The numbers vary. Regex is better.
    if 'id="progress-count"' not in content:
        content = re.sub(
            r'<p class="text-xs text-textMuted">\d+ of \d+ Problems Solved</p>',
            r'<p class="text-xs text-textMuted" id="progress-count">Calculated...</p>',
            content
        )

    # 2. Inject Data Attributes into Checkboxes
    # Target: <input type="checkbox" class="peer sr-only">
    # We need to iterate and add index.
    
    if 'problem-checkbox' not in content:
        parts = content.split('<input type="checkbox" class="peer sr-only">')
        new_content = parts[0]
        for i in range(1, len(parts)):
            new_content += f'<input type="checkbox" class="peer sr-only problem-checkbox" data-lesson="{lesson_id}" data-index="{i-1}">'
            new_content += parts[i]
        content = new_content

    # 3. Inject Script (avoid duplicates)
    script_tag = '<script src="../assets/progress.js"></script>'
    if 'progress.js' not in content:
        content = content.replace('</body>', f'    {script_tag}\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")

if __name__ == "__main__":
    files = [f for f in os.listdir(PATTERNS_DIR) if f.endswith(".html")]
    for f in files:
        if f == "arrays.html": continue # Skip arrays.html as I manually did it (or overwrite to be safe? Manually done layout might be better preserved if I skip)
        process_file(os.path.join(PATTERNS_DIR, f))
