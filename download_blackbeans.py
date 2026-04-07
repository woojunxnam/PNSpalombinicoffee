"""Download 37 product images from blackbeans.kr"""
import urllib.request
import os
import time

DEST = r'C:\Users\User\Desktop\PNSpalombinicoffee-main\assets\img\blackbeans'

images = [
    ("bb_01.jpg", "https://blackbeans.kr/web/product/medium/202508/8a40a022c7029ade913b896535a499d3.jpg"),
    ("bb_02.jpg", "https://blackbeans.kr/web/product/medium/202508/fa19935314924989b30a40e4a870ae9e.jpg"),
    ("bb_03.jpg", "https://blackbeans.kr/web/product/medium/202508/4f4bdbaea667780f15ef594864c0e4c4.jpg"),
    ("bb_04.jpg", "https://blackbeans.kr/web/product/medium/202508/b47846ea635825dc67429967f4bb9a4d.jpg"),
    ("bb_05.jpg", "https://blackbeans.kr/web/product/medium/202508/3e85a2882645d352b8db968060222563.jpg"),
    ("bb_06.jpg", "https://blackbeans.kr/web/product/medium/202508/043dfd8f3c3d758bd4ffe2a6b8b340ff.jpg"),
    ("bb_07.jpg", "https://blackbeans.kr/web/product/medium/202508/59b713c9f786fbc7f24649d0ba821e13.jpg"),
    ("bb_08.jpg", "https://blackbeans.kr/web/product/medium/202508/252308da516e97f22990f67621be17a0.jpg"),
    ("bb_09.jpg", "https://blackbeans.kr/web/product/medium/202508/5e3cc082618d3c9eb20d43e9deb7bb09.jpg"),
    ("bb_10.jpg", "https://blackbeans.kr/web/product/medium/202508/12e6d75e1aca6a4d5ac78886ecd4047d.jpg"),
    ("bb_11.jpg", "https://blackbeans.kr/web/product/medium/202508/4171d06e294a574493a1eb898759c76f.jpg"),
    ("bb_12.jpg", "https://blackbeans.kr/web/product/medium/202508/20c77d5c8112996a58a736d2e65eea30.jpg"),
    ("bb_13.jpg", "https://blackbeans.kr/web/product/medium/202508/c2d4c5f8e403eec69644e79d0b91a012.jpg"),
    ("bb_14.jpg", "https://blackbeans.kr/web/product/medium/202508/b5c422c3644cd9208c97bf0673f8c0f3.jpg"),
    ("bb_15.jpg", "https://blackbeans.kr/web/product/medium/202508/6872fdedf2ed512bc2ace26b5a44bea0.jpg"),
    ("bb_16.jpg", "https://blackbeans.kr/web/product/medium/202508/11c73194efe1388965b4f2095082fcdc.jpg"),
    ("bb_17.jpg", "https://blackbeans.kr/web/product/medium/202508/fb331317d72153cd12307a1d1db349dc.jpg"),
    ("bb_18.jpg", "https://blackbeans.kr/web/product/medium/202508/a54db15043ffcb7263ae631a6d11c388.jpg"),
    ("bb_19.jpg", "https://blackbeans.kr/web/product/medium/202505/fd0458f6f771331bda406394617c4e91.jpg"),
    ("bb_20.jpg", "https://blackbeans.kr/web/product/medium/202504/ae2d055f36b83a987ecbbef86dc2fd8d.jpg"),
    ("bb_21.jpg", "https://blackbeans.kr/web/product/medium/202508/62f3ddef0ce4c6d00a86f50b136cc065.jpg"),
    ("bb_22.jpg", "https://blackbeans.kr/web/product/medium/202508/6be4eadf6f83aa1fc0bae3df1e534318.jpg"),
    ("bb_23.jpg", "https://blackbeans.kr/web/product/medium/202508/63be0d75f8ffe8ed9b000e92fa250bbc.jpg"),
    ("bb_24.jpg", "https://blackbeans.kr/web/product/medium/202508/33e35d1340cec2f5f2d6c8ba00d8bc81.jpg"),
    ("bb_25.jpg", "https://blackbeans.kr/web/product/medium/202508/dcb1c3c6b25821a953393b6c76de4909.jpg"),
    ("bb_26.jpg", "https://blackbeans.kr/web/product/medium/202508/cc44c0048b6d9efadf78e713c53f6558.jpg"),
    ("bb_27.jpg", "https://blackbeans.kr/web/product/medium/202508/8a189ba5d91960fc44a3179d6346a324.jpg"),
    ("bb_28.jpg", "https://blackbeans.kr/web/product/medium/202508/80158b93173de8bb02fe6f94b6a95915.jpg"),
    ("bb_29.jpg", "https://blackbeans.kr/web/product/medium/202508/4b6450e85dc805d75bb9e4995140cef8.jpg"),
    ("bb_30.jpg", "https://blackbeans.kr/web/product/medium/202508/e86eb9ddfabf7e9bf953dcf431b0914c.jpg"),
    ("bb_31.jpg", "https://blackbeans.kr/web/product/medium/202508/a87e7da691c556e42660675cbf7b24fa.jpg"),
    ("bb_32.jpg", "https://blackbeans.kr/web/product/medium/202508/fba20e4023f71d29c542a665cbf36bb2.jpg"),
    ("bb_33.jpg", "https://blackbeans.kr/web/product/medium/202508/06ac0931db0384ba54a7e4a1a9883341.jpg"),
    ("bb_34.jpg", "https://blackbeans.kr/web/product/medium/202504/a1befa8dfdd9ae930687a15bce38c527.jpg"),
    ("bb_35.jpg", "https://blackbeans.kr/web/product/medium/202508/d91df970bb5f6eb68e988556b0306ce2.jpg"),
    ("bb_36.jpg", "https://blackbeans.kr/web/product/medium/202508/6066f3eebdd7070999c96deb22a54baa.jpg"),
    ("bb_37.jpg", "https://blackbeans.kr/web/product/medium/202508/165dd3876d03dd151d703bbb20bc4085.jpg"),
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
ok = 0
fail = 0
for fname, url in images:
    dest_path = os.path.join(DEST, fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        with open(dest_path, 'wb') as f:
            f.write(data)
        size = len(data) // 1024
        print(f'OK  {fname}  ({size}KB)')
        ok += 1
    except Exception as e:
        print(f'FAIL {fname}: {e}')
        fail += 1
    time.sleep(0.2)

print(f'\n완료: {ok}개 성공 / {fail}개 실패')
