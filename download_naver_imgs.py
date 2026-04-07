"""
Naver Smartstore product image downloader.
Fetches product pages and extracts main product image URLs.
"""
import urllib.request
import urllib.parse
import re
import os
import json
import time

DEST = r'C:\Users\User\Desktop\PNSpalombinicoffee-main\assets\img\pns'
os.makedirs(DEST, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://smartstore.naver.com/palombini',
}

PRODUCTS = [
    ('pns_drip10.jpg',        'https://smartstore.naver.com/palombini/products/11747117894'),
    ('pns_drip10_gift.jpg',   'https://smartstore.naver.com/palombini/products/11391087286'),
    ('pns_drip30_gift.jpg',   'https://smartstore.naver.com/palombini/products/11401011043'),
    ('pns_roma_1kg.jpg',      'https://smartstore.naver.com/palombini/products/12048742583'),
    ('pns_granbar_1kg.jpg',   'https://smartstore.naver.com/palombini/products/12048729052'),
    ('pns_dolce_1kg.jpg',     'https://smartstore.naver.com/palombini/products/12048748602'),
    ('pns_vr_bam.jpg',        'https://smartstore.naver.com/palombini/products/13361995108'),
    ('pns_vr_evening.jpg',    'https://smartstore.naver.com/palombini/products/13361987919'),
    ('pns_vr_noon.jpg',       'https://smartstore.naver.com/palombini/products/13361974983'),
    ('pns_vr_morning.jpg',    'https://smartstore.naver.com/palombini/products/13361967850'),
    ('pns_vr_dawn.jpg',       'https://smartstore.naver.com/palombini/products/13361948982'),
    ('pns_vr_500g.jpg',       'https://smartstore.naver.com/palombini/products/13281122385'),
    ('pns_vr_1kg.jpg',        'https://smartstore.naver.com/palombini/products/13270525319'),
    ('pns_gift_30plus5.jpg',  'https://smartstore.naver.com/palombini/products/12954926851'),
    ('pns_gift_bag32.jpg',    'https://smartstore.naver.com/palombini/products/12909852073'),
]

def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        import gzip
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if resp.info().get('Content-Encoding') == 'gzip':
                data = gzip.decompress(data)
            return data.decode('utf-8', errors='ignore')
    except Exception as e:
        return None

def extract_image_url(html):
    """Extract first pstatic product image from Naver page."""
    # Try JSON data in __PRELOADED_STATE__ or similar
    patterns = [
        r'https://shop-phinf\.pstatic\.net/[^"\'?\s]+\.(?:jpg|jpeg|png)',
        r'"imageUrl"\s*:\s*"(https://[^"]+pstatic[^"]+\.(?:jpg|jpeg|png))',
        r'"representativeImage"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"',
        r'content="(https://[^"]*pstatic[^"]*\.(?:jpg|jpeg|png))"',
    ]
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE)
        if matches:
            # Return first that looks like a product image
            for m in matches:
                url = m if m.startswith('http') else 'https:' + m
                if 'pstatic' in url and any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png']):
                    return url
    return None

def download_image(img_url, dest_path):
    req = urllib.request.Request(img_url, headers={
        'User-Agent': HEADERS['User-Agent'],
        'Referer': 'https://smartstore.naver.com/',
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    with open(dest_path, 'wb') as f:
        f.write(data)
    return len(data)

ok, fail = 0, 0
for fname, product_url in PRODUCTS:
    dest = os.path.join(DEST, fname)
    if os.path.exists(dest):
        print(f'SKIP {fname} (already exists)')
        ok += 1
        continue

    html = fetch_html(product_url)
    if not html:
        print(f'FAIL {fname}: could not fetch page')
        fail += 1
        time.sleep(0.5)
        continue

    img_url = extract_image_url(html)
    if not img_url:
        print(f'FAIL {fname}: no image URL found in page')
        # Save HTML snippet for debug
        with open(dest + '.debug.txt', 'w', encoding='utf-8') as f:
            f.write(html[:3000])
        fail += 1
        time.sleep(0.5)
        continue

    try:
        size = download_image(img_url, dest)
        print(f'OK   {fname}  ({size//1024}KB)  <- {img_url[:60]}')
        ok += 1
    except Exception as e:
        print(f'FAIL {fname}: download error - {e}  url={img_url[:60]}')
        fail += 1

    time.sleep(0.4)

print(f'\n완료: {ok}개 성공 / {fail}개 실패')
