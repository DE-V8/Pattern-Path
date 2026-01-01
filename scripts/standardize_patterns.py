import os

patterns_dir = r"c:\Users\debji\.gemini\antigravity\playground\ionic-cassini\version 2\patterns"

replacements = {
    # Hero Section (0s delay)
    '<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">': 
    '<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 animate-fade-up">',

    # Filter Bar (0.1s delay)
    '<div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-20 z-40 py-4 -mx-4 px-4 backdrop-blur-md bg-background/80 md:rounded-xl border-y md:border border-secondary-dim/50">':
    '<div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sticky top-20 z-40 py-4 -mx-4 px-4 backdrop-blur-md bg-background/80 md:rounded-xl border-y md:border border-secondary-dim/50 animate-fade-up" style="animation-delay: 0.1s">',

    # Progress Card (0.2s delay)
    '<div class="glass-panel p-6 rounded-2xl border border-secondary-dim shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-8">':
    '<div class="glass-panel p-6 rounded-2xl border border-secondary-dim shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-up" style="animation-delay: 0.2s">',

    # Table Container (0.3s delay)
    '<div class="glass-panel rounded-xl overflow-hidden border border-secondary-dim shadow-xl">':
    '<div class="glass-panel rounded-xl overflow-hidden border border-secondary-dim shadow-xl animate-fade-up" style="animation-delay: 0.3s">'
}

count = 0
for filename in os.listdir(patterns_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(patterns_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        modified = False
        for original, new in replacements.items():
            if original in new_content and new not in new_content:
                new_content = new_content.replace(original, new)
                modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
            count += 1
        else:
            print(f"Skipped {filename} (already updated or mismatch)")

print(f"Total files updated: {count}")
