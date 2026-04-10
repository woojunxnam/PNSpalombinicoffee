import pathlib

root = pathlib.Path('.')

# Old patterns (plain link)
old_root = '<a href="contact.html" data-ko="문의">Contact</a>'
old_sub  = '<a href="../contact.html" data-ko="문의">Contact</a>'

# New replacement for root-level files
new_root = '''<div class="nav-item"><a href="contact.html" data-ko="문의">Contact</a><div class="nav-dropdown">
            <a href="contact.html"><span class="nav-dropdown-icon">💬</span> 일반 문의</a>
            <a href="contact-drip.html"><span class="nav-dropdown-icon">☕</span> B2B 드립백 문의</a>
            <a href="contact-bean.html"><span class="nav-dropdown-icon">🫘</span> B2B 생두 원두 문의</a>
            <a href="#" style="opacity:.5"><span class="nav-dropdown-icon">📦</span> B2B 봉투 필름지 문의 <span style="font-size:10px;background:var(--muted);color:#fff;padding:1px 5px;border-radius:4px;margin-left:3px;">준비중</span></a>
          </div></div>'''

# New replacement for subdirectory files
new_sub = '''<div class="nav-item"><a href="../contact.html" data-ko="문의">Contact</a><div class="nav-dropdown">
            <a href="../contact.html"><span class="nav-dropdown-icon">💬</span> 일반 문의</a>
            <a href="../contact-drip.html"><span class="nav-dropdown-icon">☕</span> B2B 드립백 문의</a>
            <a href="../contact-bean.html"><span class="nav-dropdown-icon">🫘</span> B2B 생두 원두 문의</a>
            <a href="#" style="opacity:.5"><span class="nav-dropdown-icon">📦</span> B2B 봉투 필름지 문의 <span style="font-size:10px;background:var(--muted);color:#fff;padding:1px 5px;border-radius:4px;margin-left:3px;">준비중</span></a>
          </div></div>'''

# Skip files that already have the dropdown
skip = {'contact-drip.html', 'contact-bean.html'}

count = 0
for f in root.rglob('*.html'):
    if f.name in skip:
        continue
    content = f.read_text(encoding='utf-8')
    changed = False
    if old_root in content:
        content = content.replace(old_root, new_root)
        changed = True
    if old_sub in content:
        content = content.replace(old_sub, new_sub)
        changed = True
    if changed:
        f.write_text(content, encoding='utf-8')
        count += 1
        print(f'Updated: {f}')

print(f'\nTotal files updated: {count}')
