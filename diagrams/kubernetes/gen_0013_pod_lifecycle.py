#!/usr/bin/env python3
"""Generate redraw SVGs for 0013 (Pod lifecycle): 0013-01 and the cumulative frames 0013-04..23.

The final layout is defined once; each frame lists element states, and the delta vs the
previous frame (plus explicit emphasis for the original's red pointer frames) gets an amber outline.
"""
import os, sys

# 기본 출력: 저장소의 redraw 폴더. 인자로 다른 폴더를 줄 수 있다.
DEFAULT_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'resources', 'images', 'kubernetes', 'redraw')
OUT = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
FONT = "'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif"
MONO = "Menlo,'JetBrains Mono',monospace"
W = 848
HL = '#f59e0b'

PHASE = {  # solid / light
    'Pending': ('#3b82f6', '#dbeafe'),
    'Running': ('#22c55e', '#dcfce7'),
    'Succeeded': ('#f97316', '#ffedd5'),
    'Failed': ('#ef4444', '#fee2e2'),
    'Unknown': ('#94a3b8', '#f1f5f9'),
}
MARK = {'a': '#64748b', 'g': '#94a3b8', 'gr': '#16a34a', 'r': '#ef4444', 'p': '#8b5cf6'}


def defs():
    m = ''.join(f'<marker id="{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
                f'orient="auto"><path d="M0 1L9 5L0 9z" fill="{c}"/></marker>' for k, c in MARK.items())
    return f'<defs>{m}</defs>'


def lrect(x, y, w, h, r, fill):
    """Rect with only the left corners rounded (phase panel inside a pod card)."""
    return (f'<path d="M{x+r} {y}H{x+w}V{y+h}H{x+r}A{r} {r} 0 0 1 {x} {y+h-r}V{y+r}A{r} {r} 0 0 1 {x+r} {y}Z" '
            f'fill="{fill}"/>')


def t(x, y, s, size=13, fill='#334155', bold=False, anchor='middle', extra=''):
    b = ' font-weight="700"' if bold else ''
    return f'<text x="{x}" y="{y}" font-size="{size}"{b} fill="{fill}" text-anchor="{anchor}"{extra}>{s}</text>'


# ---------------------------------------------------------------- layout (fixed for all frames)
PEND = dict(x=172, y=20, w=462, h=170, pw=180)
RUN = dict(x=172, y=230, w=462, h=130, pw=180)
FAIL = dict(x=20, y=408, w=394, h=138, pw=136)
SUCC = dict(x=434, y=408, w=394, h=138, pw=136)
TOP_C = [362, 498]           # container x in Pending/Running pods (w=126)
BOT_C = {'f': [166, 290], 's': [580, 704]}  # container x in Failed/Succeeded pods (w=114)
SF = dict(x=20, y=40, w=116, h=54)    # small Failed pod (Pending -> Failed)
UNK = dict(x=20, y=212, w=116, h=54)  # small Unknown pod
IMG = dict(x=676, y=20, w=152, h=78)
NODE = dict(x=676, y=120, w=152, h=134)

ARROWS = {
    'init_bus': ('M561 54V68H425V82M561 68V82', 'g', 1.5),
    'img': ('M676 59C650 59 658 108 636 108', 'a', 2),
    'node': ('M634 116C658 116 660 178 687 178', 'a', 2),
    'arr_run': ('M403 190V227', 'gr', 2),
    'arr_f': ('M403 360C403 392 217 376 217 405', 'gr', 2),
    'arr_s': ('M403 360C403 392 631 376 631 405', 'gr', 2),
    'arr_pf': ('M172 100C150 100 158 67 137 67', 'r', 2),
    'arr_pu': ('M172 128C150 128 160 239 137 239', 'p', 2),
    'arr_ru': ('M172 300C150 300 160 239 137 239', 'p', 2),
    'arr_uf': ('M78 212V95', 'p', 2),
}


def arrow(key):
    d, m, sw = ARROWS[key]
    if m == 'g':  # the init split has two heads: draw each branch so both get markers
        return (f'<path d="M561 54V68H425V82" fill="none" stroke="{MARK[m]}" stroke-width="{sw}" marker-end="url(#{m})"/>'
                f'<path d="M561 68V82" fill="none" stroke="{MARK[m]}" stroke-width="{sw}" marker-end="url(#{m})"/>')
    return f'<path d="{d}" fill="none" stroke="{MARK[m]}" stroke-width="{sw}" marker-end="url(#{m})"/>'


def rails(key, bg):
    """Amber halo under a new arrow (a box outline would not fit a curve)."""
    d = ARROWS[key][0]
    return f'<path d="{d}" fill="none" stroke="{HL}" stroke-opacity=".45" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>'


def outline(x, y, w, h, rx):
    return (f'<rect x="{x-4}" y="{y-4}" width="{w+8}" height="{h+8}" rx="{rx+4}" fill="none" '
            f'stroke="{HL}" stroke-width="2.5"/>')


def pod_shell(P, phase, title_x, inner=True):
    solid, light = PHASE[phase]
    x, y, w, h, pw = P['x'], P['y'], P['w'], P['h'], P['pw']
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#fff"/>'
    s += lrect(x, y, pw, h, 12, solid)
    if inner:
        s += f'<rect x="{x+6 if pw < 150 else x+10}" y="{y+34}" width="{pw-12 if pw < 150 else pw-20}" height="{h-42}" rx="10" fill="{light}"/>'
    s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="none" stroke="{solid}" stroke-width="2"/>'
    s += t(x + pw / 2, y + 23 if pw < 150 else y + 26, phase, 14, '#fff', True)
    s += t(title_x, y + 22 if pw < 150 else y + 27, 'Pod', 15, '#15803d', True)
    return s


def container(x, y, w, h):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#fff" stroke="#22c55e" stroke-width="1.5"/>'
            + t(x + w / 2, y + 17, 'Container', 12, '#15803d'))


def state_chip(x, y, w, h, st):
    """st = (state, reason|None)."""
    state, reason = st
    if state == 'Running':
        fill, sc = '#bbf7d0', '#166534'
    elif state == 'Waiting' and reason == 'CrashLoopBackOff':
        fill, sc = '#fee2e2', '#334155'
    elif state == 'Waiting':
        fill, sc = '#dbeafe', '#1e40af'
    else:  # Terminated
        fill, sc = '#e7e5e4', '#44403c'
    rc = {'CrashLoopBackOff': '#b91c1c', 'Error': '#b91c1c'}.get(reason, '#334155')
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}"/>'
    cx = x + w / 2
    if reason:
        s += t(cx, y + h / 2 - 3, state, 13, sc, True) + t(cx, y + h / 2 + 15, reason, 12, rc)
    else:
        s += t(cx, y + h / 2 + 5, state, 13, sc, True)
    return s


def cond_chip(x, y, w, name, val, two_line=False):
    vc = '#166534' if val == 'True' else '#b91c1c'
    h = 40 if two_line else 26
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#fff" stroke="#cbd5e1"/>'
    cx = x + w / 2
    if two_line:
        s += t(cx, y + 17, name, 12, '#334155')
        s += f'<text x="{cx}" y="{y+33}" font-size="12" text-anchor="middle" font-family="{MONO}" fill="{vc}">: {val}</text>'
    else:
        s += (f'<text x="{cx}" y="{y+17}" font-size="12" text-anchor="middle" fill="#334155">{name}&#160;'
              f'<tspan font-family="{MONO}" fill="{vc}">: {val}</tspan></text>')
    return s, (x, y, w, h, 6)


def small_pod(P, phase):
    solid, _ = PHASE[phase]
    x, y, w, h = P['x'], P['y'], P['w'], P['h']
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#fff"/>'
    s += f'<path d="M{x+42} {y}H{x+w-10}A10 10 0 0 1 {x+w} {y+10}V{y+h-10}A10 10 0 0 1 {x+w-10} {y+h}H{x+42}Z" fill="{solid}"/>'
    s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="none" stroke="{solid}" stroke-width="2"/>'
    s += t(x + 21, y + h / 2 + 5, 'Pod', 13, '#15803d', True)
    s += t(x + 42 + (w - 42) / 2, y + h / 2 + 5, phase, 13, '#fff', True)
    return s


def image_tile(x, y, w, h, color, size=12):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{color}"/>'
            + t(x + w / 2, y + h / 2 + 4, 'Image', size, '#fff', True))


# ---------------------------------------------------------------- element renderers
# Each returns dict(shell=, body=, arrows=[keys], hl=[('rect',..)|('rail',key,bg)], bottom=y)

def el(key, val):
    if key == 'pend':
        return dict(shell=pod_shell(PEND, 'Pending', 425) + ''.join(container(cx, 84, 126, 92) for cx in TOP_C),
                    hl=[('rect', PEND['x'], PEND['y'], PEND['w'], PEND['h'], 12)], bottom=190)
    if key == 'init':
        body = (f'<rect x="499" y="28" width="124" height="26" rx="8" fill="#fff" stroke="#22c55e" stroke-width="1.5"/>'
                f'<text x="561" y="46" font-size="13" fill="#15803d" text-anchor="middle"><tspan font-weight="700">init</tspan>Container</text>')
        return dict(body=body, arrows=['init_bus'],
                    hl=[('rect', 499, 28, 124, 26, 8), ('rail', 'init_bus', '#fff')], bottom=54)
    if key in ('c_init', 'c_sched'):
        name, y = ('Initialized', 74) if key == 'c_init' else ('PodScheduled', 112)
        s, bb = cond_chip(186, y, 152, name, val)
        return dict(body=s, hl=[('rect',) + bb], bottom=y + 26)
    if key == 'img':
        X, Y = IMG['x'], IMG['y']
        s = f'<rect x="{X}" y="{Y}" width="{IMG["w"]}" height="{IMG["h"]}" rx="10" fill="#fff" stroke="#cbd5e1"/>'
        s += t(X + 76, Y + 21, 'Image Downloading', 13, '#0f172a', True)
        s += image_tile(692, 54, 56, 30, '#3b82f6') + image_tile(756, 54, 56, 30, '#8b5cf6')
        return dict(shell=s, arrows=['img'],
                    hl=[('rect', X, Y, IMG['w'], IMG['h'], 10), ('rail', 'img', '#f8fafc')], bottom=Y + IMG['h'])
    if key == 'node':
        X, Y = NODE['x'], NODE['y']
        s = f'<rect x="{X}" y="{Y}" width="{NODE["w"]}" height="{NODE["h"]}" rx="10" fill="#fff" stroke="#cbd5e1"/>'
        s += t(X + 76, Y + 21, 'Node Scheduling', 13, '#0f172a', True)
        s += '<rect x="688" y="152" width="128" height="52" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>' + t(752, 170, 'Node1')
        s += '<rect x="688" y="212" width="128" height="30" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>' + t(752, 232, 'Node2')
        return dict(shell=s, arrows=['node'],
                    hl=[('rect', X, Y, NODE['w'], NODE['h'], 10), ('rail', 'node', '#f8fafc')], bottom=Y + NODE['h'])
    if key == 'nimg':
        return dict(body=image_tile(699, 178, 50, 20, '#3b82f6') + image_tile(755, 178, 50, 20, '#8b5cf6'),
                    hl=[('rect', 699, 178, 106, 20, 4)], bottom=198)
    if key in ('p_c1', 'p_c2'):
        x = TOP_C[0 if key == 'p_c1' else 1] + 8
        return dict(body=state_chip(x, 110, 110, 56, val), hl=[('rect', x, 110, 110, 56, 6)], bottom=166)
    if key == 'run':
        return dict(shell=pod_shell(RUN, 'Running', 425) + ''.join(container(cx, 266, 126, 84) for cx in TOP_C),
                    hl=[('rect', RUN['x'], RUN['y'], RUN['w'], RUN['h'], 12)], bottom=360)
    if key in ('r_c1', 'r_c2'):
        x = TOP_C[0 if key == 'r_c1' else 1] + 8
        return dict(body=state_chip(x, 291, 110, 50, val), hl=[('rect', x, 291, 110, 50, 6)], bottom=341)
    if key == 'r_cr':
        s, bb = cond_chip(186, 276, 152, 'ContainerReady', val)
        return dict(body=s, hl=[('rect',) + bb], bottom=302)
    if key == 'r_rd':
        s, bb = cond_chip(206, 312, 112, 'Ready', val)
        return dict(body=s, hl=[('rect',) + bb], bottom=338)
    if key in ('fail', 'succ'):
        P = FAIL if key == 'fail' else SUCC
        cs = BOT_C['f' if key == 'fail' else 's']
        title_x = P['x'] + P['pw'] + (P['w'] - P['pw']) / 2
        s = pod_shell(P, 'Failed' if key == 'fail' else 'Succeeded', title_x)
        s += ''.join(container(cx, 442, 114, 94) for cx in cs)
        return dict(shell=s, hl=[('rect', P['x'], P['y'], P['w'], P['h'], 12)], bottom=546)
    if key[:2] in ('f_', 's_') and key[2:] in ('c1', 'c2'):
        cs = BOT_C[key[0]]
        x = cs[int(key[3]) - 1] + 7
        return dict(body=state_chip(x, 468, 100, 56, val), hl=[('rect', x, 468, 100, 56, 6)], bottom=524)
    if key[:2] in ('f_', 's_'):
        P = FAIL if key[0] == 'f' else SUCC
        x = P['x'] + 12
        if key.endswith('cr'):
            s, bb = cond_chip(x, 450, 112, 'ContainerReady', val, two_line=True)
        else:
            s, bb = cond_chip(x, 500, 112, 'Ready', val)
        return dict(body=s, hl=[('rect',) + bb], bottom=bb[1] + bb[3])
    if key == 'sfail':
        return dict(shell=small_pod(SF, 'Failed'), hl=[('rect', SF['x'], SF['y'], SF['w'], SF['h'], 10)], bottom=94)
    if key == 'unk':
        return dict(shell=small_pod(UNK, 'Unknown'), hl=[('rect', UNK['x'], UNK['y'], UNK['w'], UNK['h'], 10)], bottom=266)
    if key in ARROWS:  # standalone arrows
        bottom = {'arr_run': 230, 'arr_f': 408, 'arr_s': 408}.get(key, 0)
        return dict(arrows=[key], hl=[('rail', key, '#f8fafc')], bottom=bottom)
    raise KeyError(key)


# ---------------------------------------------------------------- frames
CC = ('Waiting', 'ContainerCreating')
CB = ('Waiting', 'CrashLoopBackOff')
RN = ('Running', None)
TE = ('Terminated', 'Error')
TC = ('Terminated', 'Completed')

# (frame id, state changes vs previous, emphasis-only keys = original's red pointer)
STEPS = [
    ('04', dict(pend=1), []),
    ('05', dict(init=1, c_init='True'), []),
    ('06', {}, ['c_init']),
    ('07', dict(c_sched='True', node=1), []),
    ('08', {}, ['c_sched']),
    ('09', dict(img=1), []),
    ('10', dict(nimg=1), []),
    ('11', dict(p_c1=CC, p_c2=CC), []),
    ('12', dict(arr_run=1, run=1, r_c1=RN, r_c2=RN), []),
    ('13', dict(r_c1=CB), []),
    ('14', dict(r_c2=CB), []),
    ('15', dict(r_cr='False', r_rd='False'), []),
    ('16', dict(r_cr='True', r_rd='True', r_c1=RN, r_c2=RN), []),
    ('17', {}, ['r_cr', 'r_rd']),
    ('18', dict(arr_f=1, arr_s=1, fail=1, succ=1), []),
    ('19', dict(f_c1=TE, f_c2=TC), []),
    ('20', dict(s_c1=TC, s_c2=TC), []),
    ('21', dict(f_cr='False', f_rd='False', s_cr='False', s_rd='False'), []),
    ('22', dict(arr_pf=1, sfail=1), []),
    ('23', dict(unk=1, arr_pu=1, arr_ru=1, arr_uf=1), []),
]


def render(state, delta):  # outlines go under arrows so arrowheads landing on a new box stay whole
    shells, bodies, rl, arrs, outs = [], [], [], [], []
    bottom = 0
    for key, val in state.items():
        e = el(key, val)
        shells.append(e.get('shell', ''))
        bodies.append(e.get('body', ''))
        arrs += [arrow(a) for a in e.get('arrows', [])]
        bottom = max(bottom, e['bottom'])
        if key in delta:
            for h in e['hl']:
                if h[0] == 'rect':
                    outs.append(outline(*h[1:]))
                else:
                    rl.append(rails(h[1], h[2]))
    H = bottom + 24
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}">\n'
            f'{defs()}\n<rect width="{W}" height="{H}" rx="16" fill="#f8fafc"/>\n'
            + '\n'.join(x for x in shells + bodies + rl + outs + arrs if x) + '\n</svg>\n')


def frames():
    state = {}
    for fid, changes, emph in STEPS:
        delta = {k for k, v in changes.items() if state.get(k) != v} | set(emph)
        assert delta, fid  # every frame must highlight something
        state.update(changes)
        yield fid, render(dict(state), delta)


def fig01():
    w, h = 480, 540
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="{FONT}">',
         f'<rect width="{w}" height="{h}" rx="16" fill="#f8fafc"/>',
         '<rect x="20" y="20" width="440" height="500" rx="12" fill="#22c55e"/>',
         t(240, 47, 'Pod', 15, '#fff', True),
         t(36, 74, 'Status', 13, '#dcfce7', True, 'start'),
         '<rect x="40" y="86" width="400" height="56" rx="10" fill="#fff"/>',
         t(56, 108, 'Phase', 13, '#0f172a', True, 'start'),
         '<rect x="40" y="156" width="400" height="108" rx="10" fill="#ffedd5"/>',
         t(56, 178, 'Conditions', 13, '#0f172a', True, 'start'),
         '<rect x="52" y="292" width="396" height="212" rx="10" fill="#f0fdf4" stroke="#15803d" stroke-width="1.5"/>',
         '<rect x="40" y="280" width="396" height="212" rx="10" fill="#fff" stroke="#15803d" stroke-width="1.5"/>',
         t(238, 304, 'Containers', 15, '#15803d', True),
         t(56, 330, 'ContainerStatuses', 13, '#15803d', True, 'start'),
         '<rect x="60" y="344" width="356" height="132" rx="14" fill="#f8fafc" stroke="#86efac" stroke-width="1.5"/>',
         t(78, 368, 'State', 13, '#0f172a', True, 'start'),
         '</svg>\n']
    return '\n'.join(s)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, '0013-01.svg'), 'w') as f:
        f.write(fig01())
    for fid, svg in frames():
        with open(os.path.join(OUT, f'0013-{fid}.svg'), 'w') as f:
            f.write(svg)
    print('ok')
