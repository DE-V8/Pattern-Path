import os
import re

PATTERNS_DIR = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\patterns"

# HTML for the credits panel (glassmorphic pill)
CREDITS_HTML = """        <!-- GLOBAL CREDITS PANEL -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary/30 bg-white/5 backdrop-blur-sm shadow-sm hover:border-secondary/50 transition-all ml-4">
            <span class="text-xs font-medium text-textMuted uppercase tracking-wider">Credits</span>
            <span class="text-sm font-bold text-secondary credits-display-value">...</span>
        </div>"""

def process_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject Credits Script (avoid duplicates)
    script_tag = '<script src="../assets/credits.js"></script>'
    if 'credits.js' not in content:
        # Insert before closing body (before progress.js is fine, or after)
        content = content.replace('</body>', f'    {script_tag}\n</body>')

    # 2. Inject Credits Panel UI into Header
    # Target: <header ...> ... <div class="h-8 w-8 rounded-full ..."> (User Profile)
    # We want to insert it BEFORE the user profile div.
    
    # Flexible regex to find the user profile div or the closing header if structure varies
    # The user profile usually looks like: <div class="h-8 w-8 rounded-full border border-secondary p-[1px] bg-white/5">
    
    if 'credits-display-value' not in content:
        # Search for the user profile container
        match = re.search(r'(<div class="h-8 w-8 rounded-full border border-secondary)', content)
        if match:
            # Insert before the user profile
            start_index = match.start()
            new_content = content[:start_index] + CREDITS_HTML + '\n            ' + content[start_index:]
            content = new_content
        else:
            print(f"Skipping UI injection for {filename}: User profile not found.")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")

if __name__ == "__main__":
    files = [f for f in os.listdir(PATTERNS_DIR) if f.endswith(".html")]
    for f in files:
        process_file(os.path.join(PATTERNS_DIR, f))
