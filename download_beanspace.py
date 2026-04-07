"""Download 11 product images from beanspacecoffee.com"""
import urllib.request
import os
import time

DEST = r'C:\Users\User\Desktop\PNSpalombinicoffee-main\assets\img\beanspace'
os.makedirs(DEST, exist_ok=True)

images = [
    ("bs_01.jpg", "https://beanspacecoffee.com/web/product/big/202411/d6f6702f01692ce75915d1715cf8aba6.jpg"),
    ("bs_02.jpg", "https://beanspacecoffee.com/web/product/big/202411/d407d724538f42f541475fd06645d5ad.jpg"),
    ("bs_03.jpg", "https://beanspacecoffee.com/web/product/big/202411/bf0c6dfb580a24a375c591c674d8e284.jpg"),
    ("bs_04.jpg", "https://beanspacecoffee.com/web/product/big/202512/60f11af38fc767a35da3ab4b76a07b45.jpg"),
    ("bs_05.jpg", "https://beanspacecoffee.com/web/product/big/202512/8c765e50a2b5c5cd174df6079397a304.jpg"),
    ("bs_06.jpg", "https://beanspacecoffee.com/web/product/big/202512/de3d3b4355a28e6062924b006eb72972.jpg"),
    ("bs_07.jpg", "https://beanspacecoffee.com/web/product/big/202411/02500592452e8a3358cd0428928df826.jpg"),
    ("bs_08.jpg", "https://beanspacecoffee.com/web/product/big/202411/2854c4b8f113a3ecf015438cecff087c.jpg"),
    ("bs_09.jpg", "https://beanspacecoffee.com/web/product/big/202411/9c010071e11ace4a74ade581efbd082b.jpg"),
    ("bs_10.jpg", "https://beanspacecoffee.com/web/product/big/202411/127b90fb944e437ab8ad8e38ace448da.jpg"),
    ("bs_11.jpg", "https://beanspacecoffee.com/web/product/big/202411/44d838390be134799720009069fc9d1f.jpg"),
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://beanspacecoffee.com/',
}

ok = fail = 0
for fname, url in images:
    dest_path = os.path.join(DEST, fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        with open(dest_path, 'wb') as f:
            f.write(data)
        print(f'OK  {fname}  ({len(data)//1024}KB)')
        ok += 1
    except Exception as e:
        print(f'FAIL {fname}: {e}')
        fail += 1
    time.sleep(0.3)

print(f'\n완료: {ok}개 성공 / {fail}개 실패')
