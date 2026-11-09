/* ================= v3 app logic ================= */
function resolveV3(b){const a=b.split('|');try{switch(a[0]){
 case 'p':return[planById(a[1]),a[2]];
 case 'w':return[wkOf(planById(a[1]),a[2]),a[3]];
 case 'e':return[exOf(a[1],a[2],a[3]),a[4]];
 case 'ts':return[exOf(a[1],a[2],a[3]).sets[+a[4]],a[5]];
 case 'st':return[stepAt(exOf(a[1],a[2],a[3]),a[4]),a[5]];
 case 'cf':return[exOf(a[1],a[2],a[3]).custom[+a[4]],a[5]];
 case 'd':return[planById(a[1]).days[+a[2]],a[3]];
 case 'pg':{const p=planById(a[1]);p.prog=p.prog||{on:false,kg:2.5,runPct:5,deloadEvery:4,deloadPct:40};return[p.prog,a[2]]}
 case 's':return[S.active,a[1]];
 case 'se':return[S.active.ex.find(x=>x.id===a[1]),a[2]];
 case 'ss':return[S.active.ex.find(x=>x.id===a[1]).sets[+a[2]],a[3]];
 case 'sp':return[S.active.ex.find(x=>x.id===a[1]).splits[+a[2]],a[3]];
 case 'sv':return[S.active.ex.find(x=>x.id===a[1]).vals,a[2]];
 case 'set':return[S.settings,a[1]];
 case 'zone':S.settings.zones=S.settings.zones||{};return[S.settings.zones,a[1]];
 case 'race':S.race=S.race||{name:'',dist:10,date:'',goal:''};return[S.race,a[1]];
 case 'xn':return[S.exNotes,a.slice(1).join('|')];
 case 'sa':return[S.strava,a[1]];
 case 'spend':return[S.strava.pending.find(x=>String(x.id)===a[1]),a[2]];
 case 'pf':return[ui.prForm,a[1]];case 'ax':return[ui.addEx,a[1]];case 'ah':return[ui.adhoc,a[1]];case 'fd':return[ui.field,a[1]];case 'gf':return[ui.goalForm,a[1]];case 'bf':return[ui.bodyForm,a[1]];
 case 'qk':return[ui.quick,a[1]];case 'pl':return[ui.plates,a[1]];case 'sw':return[ui.swap,a[1]];case 'u':return[ui,a[1]];
}}catch(e){}return null}
UI_BINDS.push('qk','pl','sw');
document.addEventListener('input',e=>{const el=e.target;const lv=el.dataset&&el.dataset.live;if(!lv)return;
 if(lv==='hist'){const h=$('#histlist');if(h)h.innerHTML=histListHTML(!!(norm(ui.hq)||(ui.hf&&ui.hf!=='all')))}
 if(lv==='plates'){const o=$('#plateout');if(o)o.innerHTML=plateOut()}
 if(lv==='conv'){const v=el.value;const o=el.id==='cv-k'?$('#cv-p'):$('#cv-k');if(!o)return;if(el.id==='cv-k'){const k=num(v);o.value=k>0?fmtDur(3600/k):''}else{const p=parseDur(v.includes(':')?v:v+':00');o.value=p>0?plain(3600/p,2):''}}});

/* --- toasts with an action, and undo --- */
function toastAction(msg,label,fn){const t=$('#toast');t.innerHTML=`<span>${esc(msg)}</span><button type="button">${esc(label)}</button>`;t.hidden=false;t.querySelector('button').onclick=()=>{t.hidden=true;fn()};clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,6000)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function withUndo(msg,fn){const shot=JSON.stringify(exportable());const tb0=new Set(Object.keys(S.tomb));fn();const added=Object.keys(S.tomb).filter(k=>!tb0.has(k));
 toastAction(msg,'Undo',()=>{const keep={active:S.active,sync:S.sync};S=migrate(JSON.parse(shot));S.active=keep.active;S.sync=keep.sync;const now=Date.now();for(const id of added)delete S.tomb[id];
  for(const k of SYNC_COLLS)for(const it of S[k])if(added.includes(it.id)){it.u=now;snap.delete(it.id)}prCache=null;achCache=null;save();
  const top=ui.stack[ui.stack.length-1];if(top&&top.v==='settings'){}render();toast('Restored')})}

/* --- committing --- */
function commitSessionV3(src,{celebrate=true,ticked=false}={}){const s=clone(src);
 s.duration=num(s.duration)||0;s.end=s.start+s.duration*1000;
 s.ex=s.ex.map(x=>{if(x.cat==='gym'){x.sets=(x.sets||[]).filter(z=>(ticked?z.d:true)&&(z.r!==''||z.t==='f'||z.w!=='')).map(z=>{const o={w:z.w,r:z.r,t:z.t||''};if(num(z.rpe)>0)o.rpe=num(z.rpe);return o})}
  if(x.flat&&(x.dist===''||x.time==='')){const q=splitSum(x);if(q.c){if(x.dist==='')x.dist=Math.round(q.m/10)/100;if(x.time==='')x.time=q.t}}delete x.tgt;delete x.sug;return x}).filter(x=>x.cat!=='gym'||x.sets.length);
 const editId=s.editId;delete s.past;delete s.editId;
 const before=editId||!celebrate?null:computePRs();const achB=editId||!celebrate?null:new Set(achievements().filter(a=>a.at).map(a=>a.id));
 if(editId){s.id=editId;const i=S.sessions.findIndex(z=>z.id===editId);if(i>=0)S.sessions[i]=s;else S.sessions.push(s)}else S.sessions.push(s);
 S.sessions.sort((x,y)=>x.start-y.start);
 if(!editId){const p=planById(s.planId);if(p&&p.mode==='seq'&&p.id===S.activePlanId){const cd=seqDay(p);if(cd&&cd.day.w.includes(s.workoutId)){p.seqDone=[...new Set([...(p.seqDone||[]),s.workoutId])];if(cd.day.w.every(id=>p.seqDone.includes(id)))seqAdvance(p,'done')}}}
 save();
 const news=[];if(before){const after=computePRs();for(const k in after){const r=after[k];if(r.best.sid===s.id&&before[k])news.push(k)}}
 const ach=achB?achievements().filter(a=>a.at&&!achB.has(a.id)):[];
 return{s,news,editId,ach}}
function doFinish(ticked){const a=S.active;const s=clone(a);if(!s.past)s.duration=Math.round((Date.now()-s.start)/1000);
 const r=commitSession(s,{ticked});S.active=null;ui.rest=null;ui.smode='list';ui.fi=0;ui.fsMap={};save();dropWake();ui.sheet=null;
 if(r.editId){ui.stack=[{v:'sdetail',id:r.editId}];render();toast('Changes saved');return}
 ui.summary={id:r.s.id,news:r.news,ach:r.ach};ui.tab='home';ui.stack=[{v:'summary',id:r.s.id}];render();window.scrollTo(0,0)}
function afterSetDone(xi,k){const a=S.active;const x=a.ex[xi];ui.fsMap=ui.fsMap||{};
 if(x.ss&&xi+1<a.ex.length){const nx=a.ex[xi+1];ui.fsMap[nx.id]=Math.min(k,Math.max(0,nx.sets?nx.sets.length-1:0));if(ui.smode==='focus')ui.fi=xi+1;toast(`Superset: now ${nx.name||'the next exercise'}`);return}
 let g=xi;while(g>0&&a.ex[g-1].ss)g--;
 const sec=num(x.rest)||90;ui.rest={end:Date.now()+sec*1000,total:sec,name:x.name||'Next set'};
 if(g<xi){const first=a.ex[g];const nk=k+1;if(first.sets&&first.sets[nk]&&!first.sets[nk].d){ui.fsMap[first.id]=nk;if(ui.smode==='focus')ui.fi=g;return}}
 const next=x.sets.findIndex((z,j)=>j>k&&!z.d);if(next>=0){ui.fsMap[x.id]=next;return}
 if(ui.smode==='focus'&&xi+1<a.ex.length)ui.fi=xi+1}
function setCheck(k,n){let c=todayCheck();if(!c){c={id:uid(),t:Date.now(),e:'',sl:'',so:''};S.checkins.push(c)}c[k]=n;c.u=0;if(S.active&&!S.active.past){S.active.check={e:c.e,sl:c.sl,so:c.so}}if(c.e&&c.sl&&c.so)ui.ckEdit=false;save()}
function curGymWeight(x){if(!x||x.cat!=='gym')return '';const k=curSetIdx(x);const z=x.sets[k];return z?z.w:''}

/* --- share card --- */
function hexA(h,a){h=String(h).trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function shareCanvas(s){const W=1080,H=1350;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const acc=(ACCENTS[S.settings.accent]||ACCENTS.blue)[0];const F='-apple-system,BlinkMacSystemFont,system-ui,Roboto,sans-serif';
 g.fillStyle='#070809';g.fillRect(0,0,W,H);const gr=g.createRadialGradient(W*.85,H*.1,20,W*.85,H*.1,820);gr.addColorStop(0,hexA(acc,.38));gr.addColorStop(1,'rgba(7,8,9,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 const L=(x,y,sz)=>{const k=sz/64;g.save();g.translate(x,y);g.scale(k,k);const bg=g.createLinearGradient(0,0,64,64);bg.addColorStop(0,'#3A1D7A');bg.addColorStop(1,'#0B1330');g.fillStyle=bg;g.beginPath();g.roundRect?g.roundRect(0,0,64,64,16):g.rect(0,0,64,64);g.fill();g.lineCap='round';g.fillStyle='#F5F3FF';g.fillRect(28.5,4,7,5);g.strokeStyle='#F5F3FF';g.lineWidth=5;g.beginPath();g.arc(32,36,20,-Math.PI*.25,0,true);g.stroke();g.strokeStyle='rgba(92,225,230,.75)';g.lineWidth=9;g.lineCap='butt';g.beginPath();g.arc(32,36,20,-Math.PI*.25,0,false);g.stroke();g.lineCap='round';g.strokeStyle='rgba(245,243,255,.5)';g.lineWidth=1.3;for(const r of [100,130,160,190,220]){g.beginPath();g.moveTo(32,36);g.lineTo(32+14*Math.cos(r*Math.PI/180),36+14*Math.sin(r*Math.PI/180));g.stroke()}g.strokeStyle='#FF5D8F';g.lineWidth=4.4;g.beginPath();g.moveTo(32,36);g.lineTo(44,24);g.stroke();g.fillStyle='#FF5D8F';g.beginPath();g.arc(32,36,4.4,0,Math.PI*2);g.fill();g.restore()};
 L(80,80,76);g.fillStyle='#F3F4F6';g.font=`800 50px ${F}`;g.fillText('tempo',176,136);g.fillStyle=acc;g.fillText('.',176+g.measureText('tempo').width,136);
 g.fillStyle='#8C93A0';g.font=`750 32px ${F}`;g.fillText(fmtDate(s.start,{weekday:'long',day:'numeric',month:'long'}).toUpperCase(),80,290);
 g.fillStyle='#F3F4F6';g.font=`800 104px ${F}`;const words=String(s.name).split(' ');let line='',y=400,lines=0;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>W-160&&line){g.fillText(line,80,y);y+=112;line=w;lines++}else line=t}if(line){g.fillText(line,80,y);lines++}
 const m=sMetrics(s);const st=[[fmtHM(s.duration),'DURATION']];if(m.gx){st.push([String(m.sets),'WORKING SETS'],[fmtNum(m.vol/1000,2)+' t','VOLUME'])}if(m.rd){st.push([fmtNum(m.rd,2)+' km','DISTANCE']);if(m.rt)st.push([fmtDur(m.rt/m.rd)+' /km','AVG PACE'])}if(m.bd){st.push([fmtNum(m.bd,1)+' km','DISTANCE']);if(m.bt)st.push([fmtNum(m.bd/(m.bt/3600),1)+' km/h','AVG SPEED'])}
 const strain=strainOf(sessLoad(s));st.push([fmtNum(strain,1),'STRAIN']);
 const top=Math.max(y+80,640);st.slice(0,6).forEach((q,i)=>{const cx=80+(i%2)*470,cy=top+Math.floor(i/2)*190;g.fillStyle='#8C93A0';g.font=`750 28px ${F}`;g.fillText(q[1],cx,cy);g.fillStyle=q[1]==='STRAIN'?'#4D8DFF':'#F3F4F6';g.font=`800 92px ${F}`;g.fillText(q[0],cx,cy+96)});
 const prs=(ui.summary&&ui.summary.id===s.id?ui.summary.news:[]).map(k=>computePRs()[k]).filter(Boolean);
 if(prs.length){g.fillStyle='#FFC53D';g.font=`800 34px ${F}`;g.fillText(`★ ${prs.length} NEW RECORD${prs.length>1?'S':''}`,80,H-150);g.fillStyle='#F3F4F6';g.font=`650 34px ${F}`;g.fillText(prs.slice(0,2).map(r=>(r.ex?r.ex+' ':'')+prVal(r.unit,r.best.value)).join('  ·  '),80,H-98)}
 else{g.fillStyle=acc;g.fillRect(80,H-120,120,10)}
 return c}

/* --- sheets --- */
Object.assign(SHEETS,{
 finishCheck(s){return `<div class="h2">Save only ticked sets?</div><p class="muted sm">${plural(s.unt,'filled set')} ${s.unt===1?"isn't":"aren't"} ticked${s.none?`, including ${plural(s.none,'exercise')} with nothing ticked`:''}. Ticked sets are the ones you did.</p>
  <button class="btn primary" data-act="finishTicked">Save ticked sets only</button><button class="btn" data-act="finishAll">Save all filled sets</button><button class="btn line" data-act="closeSheet">Back to the workout</button>`},
 swap(){const x=S.active.ex.find(z=>z.id===ui.swap.eid);const known=[...exNames().values()].filter(n=>norm(n)!==norm(x.name)).sort().slice(0,40);
  return `<div class="h2">Swap ${esc(x.name||'exercise')}</div><p class="muted sm">For when the machine is busy. Sets and targets stay; the workout records the swap.</p><input class="in" id="sw-n" list="exnames" value="${esc(ui.swap.name)}" data-b="sw|name" placeholder="Replacement exercise" autocomplete="off"><button class="btn primary" data-act="swapDo">Swap</button>${known.length?`<div class="chips">${known.map(n=>`<button class="wchip" style="padding-left:12px" data-act="swapDo" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}`},
 exhist(){const h=ui.exh;const list=exHistory(h.name,h.cat);const key=norm(h.name);const pm=computePRs();const w=pm[`g:${key}:w`],e1=pm[`g:${key}:1rm`];
  return `<div class="h2">${esc(h.name)}</div>${h.cat==='gym'&&(w||e1)?`<div class="tiles" style="grid-template-columns:1fr 1fr">${w?`<div class="tile"><b>${fmtNum(w.best.value,1)}<small>kg</small></b><span>heaviest set</span></div>`:''}${e1?`<div class="tile"><b>${fmtNum(e1.best.value,1)}<small>kg</small></b><span>estimated 1RM</span></div>`:''}</div>`:''}
  <label class="field"><span>My notes for this exercise <em>shown every time you do it</em></span><textarea class="in" id="xn" data-b="xn|${esc(key)}" placeholder="e.g. Seat height 4, wide grip">${esc(S.exNotes[key]||'')}</textarea></label>
  ${list.length?`<div class="list">${list.map(({s,x})=>`<div class="li"><span class="grow"><span class="t">${fmtDate(s.start,{weekday:'short',day:'numeric',month:'short',year:'2-digit'})}</span><span class="s" style="white-space:normal">${x.cat==='gym'?(x.sets||[]).map(z=>`${z.t==='w'?'W ':''}${num(z.w)>0?fmtNum(z.w,1)+'×':''}${z.r}${z.t==='f'?'F':''}${num(z.rpe)>0?' @'+z.rpe:''}`).join(' · '):`${fmtNum(x.dist,2)} km · ${fmtDur(x.time)}`}</span></span></div>`).join('')}</div>`:'<p class="muted sm">No history yet.</p>'}
  <button class="btn" data-act="closeSheet">Close</button>`},
 plates(){const p=ui.plates;return `<div class="h2">Plate calculator</div><div class="grid2"><label class="field"><span>Total weight (kg)</span><input class="in big" id="pl-w" inputmode="decimal" value="${esc(p.w)}" data-b="pl|w" data-t="num" data-live="plates"></label><div class="field"><span>Bar</span>${seg([['20','20 kg'],['15','15 kg'],['10','10 kg']],String(p.bar),'plBar')}</div></div><div id="plateout">${plateOut()}</div><button class="btn" data-act="closeSheet">Close</button>`},
 conv(){return `<div class="h2">Treadmill converter</div><div class="grid2"><label class="field"><span>Speed (km/h)</span><input class="in big" id="cv-k" inputmode="decimal" data-live="conv" placeholder="12"></label><label class="field"><span>Pace (min/km)</span><input class="in big" id="cv-p" data-live="conv" placeholder="5:00"></label></div>
  <div class="tablewrap"><table class="cmp"><tr><th>km/h</th><th>min/km</th><th>km/h</th><th>min/km</th></tr>${[[8,9],[10,11],[12,13],[14,15],[16,17]].map(([a,b])=>`<tr><td>${a}</td><td>${fmtDur(3600/a)}</td><td>${b}</td><td>${fmtDur(3600/b)}</td></tr>`).join('')}</table></div><button class="btn" data-act="closeSheet">Close</button>`},
 quick(){const q=ui.quick;const recent=[];const seen=new Set();for(let i=S.sessions.length-1;i>=0&&recent.length<6;i--){const s=S.sessions[i];if(s.planId)continue;const k=norm(s.name);if(seen.has(k))continue;seen.add(k);recent.push(s)}
  return `<div class="h2">Quick log</div>${recent.length?`<div class="chips">${recent.map(s=>`<button class="wchip ${norm(q.name)===norm(s.name)?'sel':''}" style="--c:var(--${typeKey(s)});padding-left:6px" data-act="quickPick" data-name="${esc(s.name)}" data-k="${typeKey(s)}">${typeBadge(s,'s')}${esc(s.name)}</button>`).join('')}</div>`:''}
  <input class="in" id="qk-n" value="${esc(q.name)}" data-b="qk|name" placeholder="Activity, e.g. Padel or Walk" autocomplete="off">${seg([['other','Other'],['run','Running'],['bike','Cycling'],['gym','Gym']],q.cat,'quickCat')}
  <div class="grid3"><label class="field"><span>Minutes</span><input class="in" id="qk-m" inputmode="numeric" value="${esc(q.min)}" data-b="qk|min"></label><label class="field"><span>Km <em>optional</em></span><input class="in" id="qk-k" inputmode="decimal" value="${esc(q.km)}" data-b="qk|km"></label><label class="field"><span>Effort <em>1–10</em></span><input class="in" id="qk-r" inputmode="numeric" value="${esc(q.rpe)}" data-b="qk|rpe"></label></div>
  <label class="field"><span>When</span><input class="in" id="qk-d" type="datetime-local" value="${esc(q.date)}" data-b="qk|date"></label><button class="btn primary" data-act="quickSave">Save</button>`},
 share(s){return `<div class="h2">Share card</div><img class="shareimg" src="${s.url}" alt="Workout card"><p class="hint">Press and hold the image to save or share it.</p><button class="btn" data-act="closeSheet">Close</button>`}});
function plateOut(){const p=ui.plates;const w=num(p.w),bar=+p.bar||20;if(!(w>0))return '<p class="hint">Enter the total weight on the bar.</p>';const r=platesFor(w,bar);if(!r)return `<p class="hint">Less than the ${bar} kg bar.</p>`;
 const H={25:110,20:100,15:88,10:74,5:56,2.5:44,1.25:36};const col=k=>(PLATES.find(q=>q[0]===k)||[0,'#999'])[1];let x=40,svg='';for(const k of r.out){const h=H[k],w2=k>=10?18:11;svg+=`<rect x="${x}" y="${70-h/2}" width="${w2}" height="${h}" rx="3" fill="${col(k)}"/>`;x+=w2+3}
 return `<svg class="platesvg" viewBox="0 0 340 140" role="img" aria-label="Plates on one side"><rect x="0" y="62" width="40" height="16" rx="3" fill="var(--dim)"/><rect x="34" y="50" width="6" height="40" rx="2" fill="var(--muted)"/><rect x="40" y="64" width="${Math.max(120,x-20)}" height="12" rx="3" fill="var(--surface-2)"/>${svg}</svg>
 <div class="eyebrow" style="text-align:center">Each side</div><div class="plist">${r.out.length?r.out.map(k=>`<span style="--c:${col(k)}">${fmtNum(k,2)}</span>`).join(''):'<span style="--c:var(--surface-2);color:var(--fg)">Empty bar</span>'}</div>${r.rest>0?`<p class="hint" style="text-align:center">${fmtNum(r.rest*2,2)} kg can't be made with standard plates.</p>`:''}`}

/* --- views --- */
Object.assign(VIEWS,{summary:vSummary,achievements:vAchievements,recap:vRecap,customize:vCustomize,race:vRace,zones:vZones,planText:vPlanText,readiness:vReadiness,
 sdetail:o=>{const h=vSDetail(o);return h.replace('<button class="btn danger block" data-act="delSession"',`<button class="btn block" data-act="repeatSession" data-id="${esc(o.id)}">${ic('repeat',18)} Repeat this workout</button><button class="btn block" data-act="go" data-v="summary" data-id="${esc(o.id)}">${ic('share',18)} Summary and share card</button><button class="btn danger block" data-act="delSession"`)}});

/* --- actions --- */
Object.assign(ACT,{
 finish:()=>{const a=S.active;if(!a.past&&!a.editId){let unt=0,none=0;for(const x of a.ex){if(x.cat!=='gym')continue;const f=x.sets.filter(z=>z.r!==''||z.w!==''||z.t==='f');const tk=f.filter(z=>z.d);unt+=f.length-tk.length;if(f.length&&!tk.length)none++}if(unt>0){ui.sheet={t:'finishCheck',unt,none};renderSheet();return}}doFinish(!a.past&&!a.editId)},
 finishTicked:()=>doFinish(true),finishAll:()=>doFinish(false),
 sDone:d=>{const a=S.active;const xi=a.ex.findIndex(z=>z.id===d.eid);const z=a.ex[xi].sets[+d.k];z.d=!z.d;if(z.d)afterSetDone(xi,+d.k);save();render()},
 fDone:d=>ACT.sDone(d),
 fSet:d=>{ui.fsMap=ui.fsMap||{};ui.fsMap[d.eid]=+d.k;render()},
 fStep:d=>{const z=curEx(d).sets[+d.k];const v=(num(z[d.f])||0)+(+d.n);z[d.f]=Math.max(0,d.f==='r'?Math.round(v):round2(v));save();render()},
 fRpe:d=>{const z=curEx(d).sets[+d.k];z.rpe=+d.n;save();render()},
 fMove:d=>{ui.fi=Math.max(0,Math.min(S.active.ex.length-1,(ui.fi||0)+(+d.n)));render();window.scrollTo(0,0)},
 smode:d=>{ui.smode=d.val;render()},
 sAllDone:d=>{const x=curEx(d);let n=0;x.sets.forEach(z=>{if((z.r!==''||z.w!==''||z.t==='f')&&!z.d){z.d=true;n++}});save();render();toast(n?`${plural(n,'set')} ticked`:'Fill in the sets first')},
 toggleSS:d=>{const x=curEx(d);x.ss=!x.ss;syncTpl(x,'ss');save();render();toast(x.ss?'Linked with the next exercise as a superset':'Superset unlinked')},
 addWarm:d=>{const x=curEx(d);const top=Math.max(0,...x.sets.filter(z=>z.t!=='w').map(z=>num(z.w)||0));if(!top){toast('Enter the working weight first');return}x.sets=[...warmupSets(top).map(z=>({...z,d:false,rpe:''})),...x.sets.filter(z=>z.t!=='w')];save();render();toast('Warm-up sets added')},
 applySug:d=>{const x=curEx(d);const g=x.sug;let hit=0;x.sets.forEach(z=>{if(z.t!=='w'&&num(z.w)===g.from){z.w=g.to;hit++}});if(!hit)x.sets.forEach(z=>{if(z.t!=='w'&&num(z.w)>0)z.w=round2(num(z.w)+g.dir*g.inc)});g.applied=true;save();render();toast(`Working sets now ${fmtNum(g.to,2)} kg`)},
 swapSheet:d=>{ui.swap={eid:d.eid,name:''};ui.sheet={t:'swap'};renderSheet()},
 swapDo:d=>{const n=(d.name||ui.swap.name||'').trim();if(!n){toast('Type the replacement exercise');return}const x=S.active.ex.find(z=>z.id===ui.swap.eid);const was=x.name;x.swappedFrom=x.swappedFrom||was;x.name=n;if(x.cat==='gym'){const l=lastEx(n,'gym');if(l&&l.sets){const lw=l.sets.filter(z=>z.t!=='w');let i=0;x.sets.forEach(z=>{if(z.t==='w'||z.d)return;const q=lw[i++];if(q){z.w=q.w;z.r=q.r}})}x.mg=guessMG(n)||x.mg}delete x.sug;ui.sheet=null;save();render();toast(`Swapped ${was} for ${n}`)},
 exHist:d=>{const x=d.eid?S.active.ex.find(z=>z.id===d.eid):null;ui.exh={name:x?x.name:d.name,cat:x?x.cat:''};ui.sheet={t:'exhist'};renderSheet()},
 platesSheet:d=>{let w=d.w;if(d.eid){w=curGymWeight(S.active.ex.find(z=>z.id===d.eid))}ui.plates={w:w===undefined?'':w,bar:20};ui.sheet={t:'plates'};renderSheet()},
 plBar:d=>{ui.plates.bar=+d.val;renderSheet()},
 convSheet:()=>{ui.sheet={t:'conv'};renderSheet()},
 quickSheet:()=>{ui.quick={name:'',cat:'other',min:'',km:'',rpe:'',date:dtLocal(Date.now())};ui.sheet={t:'quick'};renderSheet()},
 quickPick:d=>{ui.quick.name=d.name;ui.quick.cat=d.k;renderSheet()},
 quickCat:d=>{ui.quick.cat=d.val;renderSheet()},
 quickSave:()=>{const q=ui.quick;const name=q.name.trim()||({other:'Activity',run:'Run',bike:'Ride',gym:'Gym workout'})[q.cat];const min=num(q.min);if(!(min>0)){toast('Enter how many minutes');return}
  const s=newAdhoc(name,q.cat,true);const t=new Date(q.date).getTime();s.start=isFinite(t)?t:Date.now()-min*60e3;s.duration=Math.round(min*60);if(num(q.rpe)>0)s.rpe=num(q.rpe);
  let x=s.ex.find(z=>z.cat===q.cat);if(!x&&q.cat!=='gym'){x=blankEx(name,q.cat);s.ex.unshift(x)}if(x&&q.cat!=='gym'){s.ex=[x];x.time=Math.round(min*60);if(num(q.km)>0){if(q.cat==='other'){x.vals.dist=num(q.km);if(!x.extra.includes('dist'))x.extra.push('dist')}else x.dist=num(q.km)}}
  if(q.cat==='gym')s.ex=[];const r=commitSession(s,{celebrate:true});ui.sheet=null;render();toast(`${name} logged`+(r.news.length?` · ${plural(r.news.length,'new record')}`:''))},
 checkin:d=>{setCheck(d.k,+d.n);render()},
 ckEdit:()=>{ui.ckEdit=true;render()},
 dismissInsight:d=>{const ws=weekStart(Date.now());S.dismissed[d.k+'|'+ws]=1;for(const k in S.dismissed){const w=+k.split('|').pop();if(w<ws)delete S.dismissed[k]}save();render()},
 recapSeen:()=>{S.recapSeen=addDays(weekStart(Date.now()),-7);save();if(ui.stack[ui.stack.length-1]?.v==='recap')back();else render()},
 repeatSession:d=>{const s=S.sessions.find(z=>z.id===d.id);if(s)startSession(repeatOf(s))},
 sumRpe:d=>{const s=S.sessions.find(z=>z.id===d.id);s.rpe=+d.n;save();render()},
 shareCard:async d=>{const s=S.sessions.find(z=>z.id===d.id);if(!s)return;const c=shareCanvas(s);const url=c.toDataURL('image/png');
  try{const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=new File([blob],`tempo-${ymd(s.start)}.png`,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:s.name});return}}catch(e){if(e&&e.name==='AbortError')return}
  ui.sheet={t:'share',url};renderSheet()},
 wMove:d=>{const l=S.settings.home;const i=+d.i,j=i+(+d.n);if(j<0||j>=l.length)return;[l[i],l[j]]=[l[j],l[i]];save();render()},
 wToggle:d=>{const w=S.settings.home[+d.i];w.on=!w.on;save();render()},
 wReset:()=>{S.settings.home=HOME_WIDGETS.map(([id])=>({id,on:true}));save();render();toast('Today reset')},
 accent:d=>{S.settings.accent=d.k;applyTheme();save();render()},
 raceDist:d=>{S.race=S.race||{name:'',dist:10,date:'',goal:''};S.race.dist=+d.n;save();render()},
 raceClear:()=>{S.race=null;save();back()},
 planProg:d=>{const p=planById(d.id);p.prog=p.prog||{on:false,kg:2.5,runPct:5,deloadEvery:4,deloadPct:40};p.prog.on=!p.prog.on;if(p.prog.on&&!p.progStart)p.progStart=weekStart(Date.now());save();render()},
 planProgReset:d=>{const p=planById(d.id);p.progStart=weekStart(Date.now());save();render();toast('Back to week 1')},
 tplProgBy:d=>{const e=tplRef(d.b).e;if(d.val==='off')e.prog=false;else{e.prog=true;e.progBy=d.val}save();render()},
 tplWarm:d=>{const e=tplRef(d.b).e;e.autoWarm=!e.autoWarm;save();render()},
 tplSS:d=>{const e=tplRef(d.b).e;e.ss=!e.ss;save();render()},
 histFilter:d=>{ui.hf=d.k;render()},
 cmpKind:d=>{ui.cmp=d.val;render()},
 rerender:()=>{save();render()},
 ptParse:()=>{ui.pparsed=parsePlanText(ui.ptext);render();setTimeout(()=>{const el=document.querySelector('.sec');if(el)el.scrollIntoView({block:'start',behavior:'smooth'})},50)},
 ptCreate:()=>{const ws=ui.pparsed;if(!ws||!ws.length)return;const p={id:uid(),name:(ui.ptname||'').trim()||'Imported plan',img:'',mode:'week',created:Date.now(),workouts:[],days:[],seqPos:0,seqDone:[],closedThrough:weekStart(Date.now())};
  for(const w of ws){const wk={id:uid(),name:w.name,type:w.type,customName:'',img:'',exercises:w.ex.map(e=>{const o={id:uid(),img:'',desc:'',dist:'',time:'',sets:[],...e};delete o.guess;fixTpl(o);o.progBy='reps';o.rpeT=8;return o})};p.workouts.push(wk)}
  S.plans.push(p);if(!S.activePlanId)S.activePlanId=p.id;ui.pparsed=null;ui.ptext='';ui.ptname='';save();ui.stack=[{v:'plan',id:p.id}];ui.tab='plans';render();window.scrollTo(0,0);toast('Plan created. Check each workout.')},
 delSession:d=>withUndo('Workout deleted',()=>{S.sessions=S.sessions.filter(s=>s.id!==d.id);tomb(d.id);save();back()}),
 delPlan:d=>withUndo('Plan deleted',()=>{S.plans=S.plans.filter(p=>p.id!==d.id);tomb(d.id);if(S.activePlanId===d.id)S.activePlanId=S.plans[0]?S.plans[0].id:null;save();back()}),
 delWorkout:d=>withUndo('Workout removed from plan',()=>{const p=planById(d.pid);p.workouts=p.workouts.filter(w=>w.id!==d.wid);p.days.forEach(x=>x.w=x.w.filter(id=>id!==d.wid));save();back()}),
 tplRmEx:d=>withUndo('Exercise removed',()=>{const r=tplRef(d.b);r.w.exercises=r.w.exercises.filter(e=>e!==r.e);save();render()}),
 delPR:d=>withUndo('Record deleted',()=>{S.prs=S.prs.filter(p=>p.id!==d.id);tomb(d.id);save();render()}),
 delGoal:d=>withUndo('Goal deleted',()=>{S.goals=S.goals.filter(g=>g.id!==d.id);tomb(d.id);save();render()}),
 delBody:d=>withUndo('Entry deleted',()=>{S.body=S.body.filter(b=>b.id!==d.id);tomb(d.id);save();render()}),
 startFresh:()=>{const keep={theme:S.settings.theme,accent:S.settings.accent,sync:S.sync};S=emptyState();S.settings.theme=keep.theme;S.settings.accent=keep.accent;S.sync=keep.sync;save();ui.stack=[];applyTheme();render();toast('Sample data cleared')}});

/* swipe between exercises in focus mode */
let swX=null,swY=null;document.addEventListener('touchstart',e=>{if(!e.target.closest('#focus')||e.target.closest('input,textarea,select'))return;swX=e.touches[0].clientX;swY=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{if(swX==null)return;const dx=e.changedTouches[0].clientX-swX,dy=e.changedTouches[0].clientY-swY;swX=null;if(Math.abs(dx)>70&&Math.abs(dy)<60){const n=dx<0?1:-1;const len=S.active?S.active.ex.length:0;const j=(ui.fi||0)+n;if(j>=0&&j<len){ui.fi=j;render();window.scrollTo(0,0)}}},{passive:true});
SYNC_COLLS.push('checkins');
function metaOf(st){const a=st.strava||{};return JSON.stringify([st.activePlanId,st.settings,a.clientId,a.clientSecret,a.access,a.refresh,a.expires,a.athlete,a.auto,st.race,st.exNotes,st.recapSeen,st.dismissed])}
const _mergeV2=mergeStates;
mergeStates=function(L,R){const out=_mergeV2(L,R);const src=(R.metaU||0)>(L.metaU||0)?R:L;out.race=src.race??null;out.exNotes=src.exNotes||{};out.recapSeen=Math.max(L.recapSeen||0,R.recapSeen||0);out.dismissed={...(R.dismissed||{}),...(L.dismissed||{})};return out};
