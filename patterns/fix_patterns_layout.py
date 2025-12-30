import os
import re

PATTERNS_DIR = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\patterns"

files = [f for f in os.listdir(PATTERNS_DIR) if f.endswith(".html")]

# Regex to find the new table body, the garbage following it, and the main tag
# We match:
# 1. The full new table body div block
# 2. Any content (garbage) until...
# 3. The </main> tag
# We want to replace group 2 with just the closing div of the glass panel.

REGEX_PATTERN = r'(<div id="problems-table-body"[\s\S]*?<!-- Rows will be injected here by the script below -->\s*</div>)([\s\S]*?)(</main>)'

for f in files:
    if f == "arrays.html":
        continue
        
    path = os.path.join(PATTERNS_DIR, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Check if file has the new table body
    if 'id="problems-table-body"' not in content:
        print(f"Skipping {f}, not yet refactored.")
        continue

    # Perform substitution
    # We replace the garbage (Group 2) with "\n        </div>\n\n    "
    new_content = re.sub(REGEX_PATTERN, r'\1\n        </div>\n\n    \3', content)
    
    if len(new_content) != len(content):
        print(f"Fixed layout for {f}")
        with open(path, 'w', encoding='utf-8') as file:
            file.write(new_content)
    else:
        print(f"No changes needed for {f} (Regex match failed or already clean)")

print("Layout fix complete.")
