#!/usr/bin/env python3
"""SVG 도식에 사이트와 같은 폰트를 넣는다.

<img> 로 넣은 SVG 는 페이지의 웹폰트를 쓸 수 없어서, 그림에 쓰인 글자만 잘라낸
Pretendard(400/700)와 JetBrains Mono 를 woff2 base64 로 SVG 안에 넣는다.
다시 실행하면 이전에 넣은 폰트를 지우고 새로 넣으므로, 그림을 고친 뒤 다시 돌리면 된다.

사용: python3 diagrams/embed_fonts.py [svg 파일 또는 폴더 ...]
     (인자가 없으면 public/resources/images/*/redraw/*.svg 전체)
필요: pip install fonttools brotli, 저장소에서 npm ci 를 마친 상태(node_modules 의 폰트 사용)
"""
import base64
import glob
import html
import io
import os
import re
import sys

from fontTools import subset

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRETENDARD = os.path.join(ROOT, 'node_modules/pretendard/dist/public/static/Pretendard-{}.otf')
JETBRAINS = os.path.join(
    ROOT, 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')

STYLE_RE = re.compile(r'<style id="embedded-fonts">.*?</style>', re.S)
MONO_RE = re.compile(r'''font-family="[^"]*(?:Menlo|JetBrains Mono)[^"]*"''')
MONO_FAMILY = '''font-family="'JetBrains Mono',Menlo,monospace"'''


def subset_woff2(path, text):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk']
    opts.name_IDs = []
    opts.notdef_outline = False
    font = subset.load_font(path, opts)
    subsetter = subset.Subsetter(opts)
    subsetter.populate(text=text)
    subsetter.subset(font)
    buf = io.BytesIO()
    subset.save_font(font, buf, opts)
    return base64.b64encode(buf.getvalue()).decode('ascii')


def face(family, weight, data):
    return (f"@font-face{{font-family:'{family}';font-weight:{weight};font-style:normal;"
            f"src:url(data:font/woff2;base64,{data}) format('woff2');}}")


def embed(path):
    svg = open(path, encoding='utf-8').read()
    svg = STYLE_RE.sub('', svg)
    svg = MONO_RE.sub(MONO_FAMILY, svg)
    text = ''.join(html.unescape(t) for t in re.findall(r'>([^<>]+)<', svg))
    chars = ''.join(sorted(set(text) - set('\n\r\t')))
    css = ''.join([
        face('Pretendard', 400, subset_woff2(PRETENDARD.format('Regular'), chars)),
        face('Pretendard', 700, subset_woff2(PRETENDARD.format('Bold'), chars)),
        face('JetBrains Mono', '100 800', subset_woff2(JETBRAINS, chars)),
    ])
    svg, n = re.subn(r'(<svg\b[^>]*>)', lambda m: m.group(1) + f'<style id="embedded-fonts">{css}</style>', svg, count=1)
    assert n == 1, f'no <svg> tag: {path}'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    return len(svg.encode())


def targets(args):
    if not args:
        return sorted(glob.glob(os.path.join(ROOT, 'public/resources/images/*/redraw/*.svg')))
    out = []
    for a in args:
        out += sorted(glob.glob(os.path.join(a, '*.svg'))) if os.path.isdir(a) else [a]
    return out


if __name__ == '__main__':
    files = targets(sys.argv[1:])
    total = sum(embed(p) for p in files)
    print(f'embedded fonts: files={len(files)} total={total // 1024}KB')
