"""
Update Products nav dropdown across all HTML files.
Adds: PNS lineup rename, custom-edition link, lineup.html link.
"""
import os
import re

ROOT = r'C:\Users\User\Desktop\PNSpalombinicoffee-main'

# ── replacement templates ─────────────────────────────────────────────────
# {p} = path prefix: '' for root, '../' for 1-deep, '../../' for 2-deep
# Using HTML entities for Korean to avoid encoding issues on Windows console

def make_products_block(p, is_root=False):
    products_href = '#products' if is_root else '#'
    return (
        '<div class="nav-item">\n'
        '          <a href="' + products_href + '">Products</a>\n'
        '          <div class="nav-dropdown">\n'
        '            <a href="' + p + 'products/"><span class="nav-dropdown-icon">&#x2615;</span> PNS &#xD314;&#xB86C;&#xBE44;&#xB2C8; &#xC0C1;&#xD488; &#xB77C;&#xC778;&#xC5C5;</a>\n'
        '            <a href="' + p + 'custom-edition.html"><span class="nav-dropdown-icon">&#x1F3A8;</span> &#xB098;&#xB9CC;&#xC758; &#xB4DC;&#xB9BD;&#xBC31; &#xC81C;&#xC791;</a>\n'
        '            <a href="' + p + 'lineup.html"><span class="nav-dropdown-icon">&#x1F3EA;</span> &#xACC4;&#xC5F4;&#xC0AC; &#xC0C1;&#xD488; &#xB77C;&#xC778;&#xC5C5;</a>\n'
        '            <a href="' + p + 'machines/"><span class="nav-dropdown-icon">&#x2699;&#xFE0F;</span> &#xB4DC;&#xB9BD;&#xBC31; &#xBA38;&#xC2E0;</a>\n'
        '            <a href="' + p + 'film.html"><span class="nav-dropdown-icon">&#x1F39E;&#xFE0F;</span> &#xCEE4;&#xD53C; &#xD544;&#xB984;&#xC9C0; '
        '<span style="font-size:10px;background:var(--muted);color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px;">&#xC900;&#xBE44;&#xC911;</span></a>\n'
        '          </div>\n'
        '        </div>'
    )

# ── regex ─────────────────────────────────────────────────────────────────
PATTERN = re.compile(
    r'<div class="nav-item">\s*<a href="[^"]*">Products</a>.*?</div>\s*</div>',
    re.DOTALL
)

# ── walk files ────────────────────────────────────────────────────────────
updated = []
skipped = []
no_match = []

for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip node_modules, .git etc.
    dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != 'node_modules']

    for filename in filenames:
        if not filename.endswith('.html'):
            continue
        filepath = os.path.join(dirpath, filename)

        # skip lineup.html — already has the correct nav
        if filename == 'lineup.html' and dirpath == ROOT:
            skipped.append(os.path.relpath(filepath, ROOT))
            continue

        # determine depth relative to ROOT
        rel = os.path.relpath(filepath, ROOT)
        depth = rel.count(os.sep)

        if depth == 0:
            p = ''
            is_root = (filename == 'index.html')
        elif depth == 1:
            p = '../'
            is_root = False
        else:
            p = '../../'
            is_root = False

        replacement = make_products_block(p, is_root)

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            no_match.append(rel + ' [READ ERROR: ' + str(e) + ']')
            continue

        new_content, count = PATTERN.subn(replacement, content)

        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated.append(rel + ' (' + str(count) + ' replacement)')
        else:
            no_match.append(rel)

print('=== UPDATED ===')
for f in updated:
    print('  OK:', f)

print()
print('=== SKIPPED (already correct) ===')
for f in skipped:
    print('  --:', f)

print()
print('=== NO MATCH (no Products nav found) ===')
for f in no_match:
    print('  ??:', f)

print()
print('Done. Updated', len(updated), 'files.')
