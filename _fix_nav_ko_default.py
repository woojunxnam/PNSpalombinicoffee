"""
Bulk update: change nav link text from English-default to Korean-default.
  Before: <a href="..." data-ko="브랜드">About</a>
  After:  <a href="..." data-en="About">브랜드</a>

This ensures Korean shows immediately without waiting for JS.
"""
import pathlib, re

ROOT = pathlib.Path('.')

# Mapping: (data-ko value, English text) pairs to swap
REPLACEMENTS = [
    # (old_pattern, new_pattern) — exact string pairs
    ('data-ko="브랜드">About</a>',               'data-en="About">브랜드</a>'),
    ('data-ko="제품">Products</a>',               'data-en="Products">제품</a>'),
    ('data-ko="🌋 볼케이노 루비">🌋 Volcano Ruby</a>', 'data-en="🌋 Volcano Ruby">🌋 볼케이노 루비</a>'),
    ('data-ko="자동화 장비">Machines</a>',         'data-en="Machines">자동화 장비</a>'),
    ('data-ko="B2B">B2B</a>',                     'data-en="B2B">B2B</a>'),
    ('data-ko="문의">Contact</a>',                 'data-en="Contact">문의</a>'),
    ('data-ko="고객·협력사">Partners</a>',         'data-en="Partners">고객·협력사</a>'),
]

count = 0
for f in sorted(ROOT.rglob('*.html')):
    content = f.read_text(encoding='utf-8')
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    if content != original:
        f.write_text(content, encoding='utf-8')
        count += 1
        print(f'  OK {f}')

print(f'\nDone — {count} files updated.')
