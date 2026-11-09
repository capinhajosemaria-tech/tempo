import json,os
from PIL import Image, ImageDraw
D=os.path.dirname(os.path.abspath(__file__))
css=open(f'{D}/style.css').read()+open(f'{D}/style-v4.css').read()+open(f'{D}/style-v5.css').read()
import re
FILES=['a-core.js','b-views.js','c-app.js','e-domain.js','f-views.js','g-stats.js','h-app.js','i-v4.js','j-views.js','k-app.js','l-ux.js','m-fix.js','n-v5.js','d-boot.js']
START=re.compile(r"^(function |async function |const |let |/\*|'use strict'|Object\.assign|VIEWS\.|UI_BINDS|document\.|window\.|setInterval|save=|\(async|HOME_WIDGETS|SYNC_COLLS|ACT\.|syncNow=|mergeStates=|render=|\[)")
chunks=[]
for f in FILES:
    cur=None
    for line in open(f'{D}/{f}').read().split('\n'):
        if START.match(line):
            cur=[line];chunks.append(cur)
        elif cur is not None: cur.append(line)
        else: cur=[line];chunks.append(cur)
def fname(c):
    m=re.match(r'^(?:async )?function (\w+)\(',c[0]);return m.group(1) if m else None
last={}
for i,c in enumerate(chunks):
    n=fname(c)
    if n: last[n]=i
keep=[c for i,c in enumerate(chunks) if not fname(c) or last[fname(c)]==i]
print('dropped',len(chunks)-len(keep),'overridden functions')
js='\n'.join('\n'.join(c) for c in keep)
body=f'''<style>
{css}</style>

<div id="app"></div>
<div id="restbar" hidden></div>
<div id="sheet" hidden></div>
<div id="toast" hidden></div>
<nav id="tabs" aria-label="Sections"></nav>
<datalist id="exnames"></datalist>
<div id="tour" hidden></div>

<script>
{js}
</script>
'''
open(os.path.join(D,'preview.html'),'w').write('<title>Tempo</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+body)
out=os.path.join(D,'..','build'); os.makedirs(out,exist_ok=True)
for f in os.listdir(out): os.remove(os.path.join(out,f))
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Tempo</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Tempo">
<meta name="theme-color" content="#120B2E">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" href="icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
'''
open(f'{out}/index.html','w').write(head+body+'</body>\n</html>\n')
json.dump({"name":"Tempo","short_name":"Tempo","description":"Plan, log and track gym, running and cycling training.","start_url":"./","scope":"./","display":"standalone","background_color":"#0A0820","theme_color":"#120B2E","orientation":"portrait","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(f'{out}/manifest.json','w'),indent=2)
open(f'{out}/sw.js','w').write('''// Tempo offline cache. Bump VERSION on every update so phones fetch the new files.
const VERSION='tempo-5.0.0';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // only the app's own files; GitHub and Strava requests always go to the network
  if(url.origin!==self.location.origin)return;
  // the page itself: network first so updates arrive, cache when offline
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put(req,c));return res})))});
''')
def icon(size,path,pad=0.0,rounded=True):
    import math
    S=size*4
    bg=Image.new('RGBA',(S,S))
    top=(0x3A,0x1D,0x7A);bot=(0x0B,0x13,0x30)
    px=bg.load()
    for y in range(S):
        for x in range(0,S):
            t=min(1,max(0,(x+y)/(2*S)))
            px[x,y]=tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3))+(255,)
    d=ImageDraw.Draw(bg)
    sc=(1-2*pad); o=S*pad
    def P(v): return o+v/64*S*sc
    def L(v): return v/64*S*sc
    white=(245,243,255,255); cyan=(92,225,230,200); pink=(255,93,143,255)
    cx,cy=P(32),P(36); R=L(20)
    d.rounded_rectangle([P(28.5),P(4),P(35.5),P(9)],radius=L(1.5),fill=white)
    w=int(L(5)); B=R+w/2
    d.arc([cx-B,cy-B,cx+B,cy+B],start=0,end=315,fill=white,width=w)
    for ang in (0,315):
        a=math.radians(ang); x=cx+R*math.cos(a); y=cy+R*math.sin(a); r=w/2
        d.ellipse([x-r,y-r,x+r,y+r],fill=white)
    w2=int(L(9)); B2=R+w2/2
    d.arc([cx-B2,cy-B2,cx+B2,cy+B2],start=315,end=360,fill=cyan,width=w2)
    for ang in (100,130,160,190,220):
        a=math.radians(ang); d.line([cx,cy,cx+L(14)*math.cos(a),cy+L(14)*math.sin(a)],fill=(150,135,200,255),width=max(1,int(L(1.1))))
    x2,y2=P(44),P(24); wn=int(L(4.4)); d.line([cx,cy,x2,y2],fill=pink,width=wn); r=wn/2
    d.ellipse([x2-r,y2-r,x2+r,y2+r],fill=pink)
    rh=L(4.4); d.ellipse([cx-rh,cy-rh,cx+rh,cy+rh],fill=pink)
    bg.resize((size,size),Image.LANCZOS).convert('RGB').save(path)
icon(192,f'{out}/icon-192.png',pad=0.04)
icon(512,f'{out}/icon-512.png',pad=0.04)
icon(512,f'{out}/icon-maskable-512.png',pad=0.16)
icon(180,f'{out}/apple-touch-icon.png',pad=0.06)
print('built',len(body))
