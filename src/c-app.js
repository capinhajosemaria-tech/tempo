/* ================= SHEETS ================= */
const SHEETS={
 start(){const p=activePlan();const past=ui.startPast;const done=p&&p.mode==='week'?weekDone(p,weekStart(Date.now())):new Set();const cd=p&&p.mode==='seq'?seqDay(p):null;
  const rows=(pl,mark)=>pl.workouts.map((w,i)=>`<button class="opt" data-act="startW" data-pid="${pl.id}" data-wid="${w.id}"><span class="lt" style="--c:var(--${typeKey(w)})">${letter(i)}</span><span class="grow"><b>${esc(w.name||'Untitled')}</b><br><span class="muted sm">${esc(typeLabel(w))} · ${plural(w.exercises.length,'exercise')}</span></span>${mark&&done.has(w.id)?`<span class="pill" style="--c:var(--ok)">${ic('check',14)} Done</span>`:''}${mark&&cd&&cd.day.w.includes(w.id)?'<span class="badge">Today</span>':''}</button>`).join('');
  const others=S.plans.filter(x=>x!==p&&x.workouts.length);
  const recent=[];const seen=new Set();for(let i=S.sessions.length-1;i>=0&&recent.length<8;i--){const s=S.sessions[i];if(s.planId)continue;const k=norm(s.name);if(seen.has(k))continue;seen.add(k);recent.push(s)}
  const a=ui.adhoc;
  return `<div class="h2">${past?'Log a workout':'Start workout'}</div>${seg([['now','Start now'],['past','Log one already done']],past?'past':'now','startMode')}
  ${p&&p.workouts.length?`<div class="eyebrow">${esc(p.name)}${p.mode==='week'?' · this week':''}</div><div class="list">${rows(p,true)}</div>`:''}
  <div class="eyebrow">Off-plan activity</div>
  <div class="adhoc"><p class="muted sm">Something outside your plan, like padel or a hike. It counts for stats and streaks but not for your plan.</p>
   ${recent.length?`<div class="chips">${recent.map(s=>`<button class="wchip" style="--c:var(--${typeKey(s)});padding-left:6px" data-act="startRecent" data-name="${esc(s.name)}">${typeBadge(s,'s')}${esc(s.name)}</button>`).join('')}</div>`:''}
   <input class="in" id="ad-name" value="${esc(a.name)}" data-b="ah|name" placeholder="What are you doing? e.g. Padel" autocomplete="off">
   ${seg([['other','Other'],['gym','Gym'],['run','Running'],['bike','Cycling']],a.cat,'adCat')}
   <button class="btn primary" data-act="startAdhoc">${past?'Log it':'Start'}</button></div>
  ${others.map(o=>`<div class="eyebrow">${esc(o.name)}</div><div class="list">${rows(o,false)}</div>`).join('')}`},
 feat(){const cur=S.settings.featured||{};const m=computePRs();const opt=(f,l,sub)=>{const on=cur.k===f.k&&(cur.key||'')===(f.key||'');return `<button class="opt" data-act="setFeat" data-k="${f.k}" data-key="${esc(f.key||'')}"><span class="radio ${on?'on':''}">${on?ic('check',14):''}</span><span class="grow"><b>${esc(l)}</b>${sub?`<br><span class="muted sm">${esc(sub)}</span>`:''}</span></button>`};
  const prs=Object.values(m).sort((a,b)=>(a.group+(a.ex||'')+a.label).localeCompare(b.group+(b.ex||'')+b.label));
  return `<div class="h2">Highlight on Today</div><p class="muted sm">Pick the statistic shown large at the top of the Today screen.</p>
  <div class="list">${opt({k:'weekStreak'},'Week streak','Weeks in a row with a workout')}${opt({k:'dayStreak'},'Day streak','Days in a row with a workout')}${opt({k:'week'},'Workouts this week')}${opt({k:'month'},'Workouts this month')}${opt({k:'year'},'Workouts this year')}${opt({k:'runMonth'},'Km run this month')}${opt({k:'bikeMonth'},'Km ridden this month')}</div>
  ${prs.length?`<div class="eyebrow">A personal record</div><div class="list">${prs.map(r=>opt({k:'pr',key:r.key},(r.ex?r.ex+' · ':'')+r.label,prVal(r.unit,r.best.value))).join('')}</div>`:''}`},
 addEx(){const a=ui.addEx;const known=[...exNames().values()].sort().slice(0,40);
  return `<div class="h2">Add exercise</div><input class="in" id="ax-name" list="exnames" value="${esc(a.name)}" data-b="ax|name" placeholder="Exercise name" autocomplete="off">${seg(Object.entries(CAT),a.cat,'axCat')}<button class="btn primary" data-act="addExConfirm">Add to workout</button>
  ${known.length?`<div class="eyebrow">Or pick one you've used</div><div class="chips">${known.map(n=>`<button class="wchip" style="padding-left:12px" data-act="addExKnown" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}`},
 field(){const f=ui.field;const x=S.active&&S.active.ex.find(z=>z.id===f.eid);if(!x)return '';
  return `<div class="h2">Add a field</div><p class="muted sm">Record extra information for ${esc(x.name||'this exercise')}. Fields you add are kept for next time.</p>
  ${extrasPicker(x.cat,x.extra||[],'sExtra',`data-eid="${x.id}"`)}
  <div class="eyebrow">Or make your own</div>
  <div class="cfrow" style="grid-template-columns:minmax(0,1.4fr) minmax(0,.8fr) minmax(0,1fr)"><input class="in sm" id="fd-l" value="${esc(f.label)}" data-b="fd|label" placeholder="Name, e.g. Result" autocomplete="off"><input class="in sm" id="fd-u" value="${esc(f.unit)}" data-b="fd|unit" placeholder="unit" autocomplete="off"><select class="in sm" id="fd-k" data-b="fd|kind">${[['text','Text'],['num','Number'],['time','Time']].map(([k,l])=>`<option value="${k}" ${f.kind===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <button class="btn primary" data-act="fieldAdd">Add field</button>`},
 body(){const f=ui.bodyForm;return `<div class="h2">Log body</div><div class="grid3"><label class="field"><span>Weight (kg)</span><input class="in big" id="bf-kg" inputmode="decimal" value="${esc(f.kg)}" data-b="bf|kg"></label><label class="field"><span>Body fat %</span><input class="in" id="bf-bf" inputmode="decimal" value="${esc(f.bf)}" data-b="bf|bf" placeholder="optional"></label><label class="field"><span>Waist (cm)</span><input class="in" id="bf-w" inputmode="decimal" value="${esc(f.waist)}" data-b="bf|waist" placeholder="optional"></label></div><label class="field"><span>Date</span><input class="in" id="bf-d" type="date" value="${esc(f.date)}" data-b="bf|date"></label><button class="btn primary" data-act="bodySave">Save</button>`},
 prs(s){const m=computePRs();return `<div class="prwin"><div class="medal">${ic('medal',40)}</div><div class="h2">New personal record${s.list.length>1?'s':''}!</div></div><div class="list">${s.list.map(k=>{const r=m[k];return r?`<div class="li"><span class="grow"><span class="t">${esc((r.ex?r.ex+' · ':'')+r.label)}</span></span><b class="num">${prVal(r.unit,r.best.value)}</b></div>`:''}).join('')}</div><button class="btn primary xl" data-act="closeSheet">Nice</button>`},
 img(s){const e=exOf(s.pid,s.wid,s.eid);return `<div class="h2">${esc(e?e.name:'')}</div>${e&&e.img?`<img class="imgview" src="${e.img}" alt="${esc(e.name)}">`:''}<button class="btn" data-act="closeSheet">Close</button>`}
};
VIEWS.scode=({code})=>`<div class="hdr">${wordmark}</div><h1 class="h1">Almost there</h1><p class="muted">Strava sent you back to the browser instead of the ${APP} app. Copy this code, open ${APP} from your home screen, go to Settings → Strava and paste it.</p><div class="codebox">${esc(code)}</div><button class="btn primary" data-act="copyText" data-text="${esc(code)}">Copy code</button>`;

/* ================= binding ================= */
function stepAt(e,path){const p=String(path).split('.').map(Number);let o=e.steps[p[0]];if(p.length>1)o=o.steps[p[1]];return o}
function resolve(b){const a=b.split('|');try{switch(a[0]){
 case 'p':return[planById(a[1]),a[2]];
 case 'w':return[wkOf(planById(a[1]),a[2]),a[3]];
 case 'e':return[exOf(a[1],a[2],a[3]),a[4]];
 case 'ts':return[exOf(a[1],a[2],a[3]).sets[+a[4]],a[5]];
 case 'st':return[stepAt(exOf(a[1],a[2],a[3]),a[4]),a[5]];
 case 'cf':return[exOf(a[1],a[2],a[3]).custom[+a[4]],a[5]];
 case 'd':return[planById(a[1]).days[+a[2]],a[3]];
 case 's':return[S.active,a[1]];
 case 'se':return[S.active.ex.find(x=>x.id===a[1]),a[2]];
 case 'ss':return[S.active.ex.find(x=>x.id===a[1]).sets[+a[2]],a[3]];
 case 'sp':return[S.active.ex.find(x=>x.id===a[1]).splits[+a[2]],a[3]];
 case 'sv':return[S.active.ex.find(x=>x.id===a[1]).vals,a[2]];
 case 'set':return[S.settings,a[1]];
 case 'sa':return[S.strava,a[1]];
 case 'spend':return[S.strava.pending.find(x=>String(x.id)===a[1]),a[2]];
 case 'pf':return[ui.prForm,a[1]];
 case 'ax':return[ui.addEx,a[1]];
 case 'ah':return[ui.adhoc,a[1]];
 case 'fd':return[ui.field,a[1]];
 case 'gf':return[ui.goalForm,a[1]];
 case 'bf':return[ui.bodyForm,a[1]];
 case 'u':return[ui,a[1]];
}}catch(e){}return null}
const UI_BINDS=['pf','ax','ah','fd','gf','bf','u'];
function setBound(el){const r=resolve(el.dataset.b);if(!r||!r[0])return;const[o,f]=r;const t=el.dataset.t||'text';let v=el.value;
 if(t==='num')v=num(v);else if(t==='km2m'){v=num(v);v=v===''?'':Math.round(v*1000)}else if(t==='int')v=parseInt(v,10)||0;else if(t==='dur')v=parseDur(v);else if(t==='dt'){const d=new Date(v).getTime();v=isFinite(d)?d:o[f]}
 o[f]=v;
 if(el.dataset.d){const x=S.active&&S.active.ex.find(z=>z.id===el.dataset.d);const dv=document.querySelector(`[data-dv="${el.dataset.d}"]`);if(x&&dv)dv.innerHTML=derivedHTML(x)}
 if(el.dataset.spl){const[eid,i]=el.dataset.spl.split('|');const x=S.active.ex.find(z=>z.id===eid);const a=document.querySelector(`[data-spd="${eid}|${i}"]`);if(a)a.innerHTML=splitInfo(x,+i);const b=document.querySelector(`[data-ssum="${eid}"]`);if(b)b.innerHTML=splitSumHTML(x)}
 if(el.dataset.pf){const a=el.dataset.b.split('|');const e=exOf(a[1],a[2],a[3]);const box=document.querySelector(`[data-prof="${el.dataset.pf}"]`);if(e&&box)box.outerHTML=profileBlock(e,e.cat,e.id)}
 if(el.dataset.ed){const a=el.dataset.b.split('|');const e=exOf(a[1],a[2],a[3]);const box=document.querySelector(`[data-edv="${el.dataset.ed}"]`);if(e&&box)box.innerHTML=tplDerived(e)}
 if(!UI_BINDS.includes(el.dataset.b.split('|')[0]))save()}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.b)setBound(el)});
document.addEventListener('change',e=>{const el=e.target;if(el.type==='file'){handleFile(el);return}if(!el.dataset.b)return;setBound(el);if(el.dataset.rr){if(el.dataset.b.startsWith('p|')&&el.dataset.b.endsWith('seqPos')){const p=resolve(el.dataset.b)[0];p.seqDone=[];save()}if(el.dataset.b.startsWith('e|')&&el.dataset.b.endsWith('|cat')){const e=resolve(el.dataset.b)[0];fixTpl(e);if(e.cat==='gym'&&!e.sets.length)e.sets=[{r:10,w:'',t:''},{r:10,w:'',t:''},{r:10,w:'',t:''}];e.extra=e.extra.filter(k=>EXTRA_FOR[e.cat].includes(k));save()}render()}});
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.open){if(d.open)ui.open.add(d.dataset.open);else ui.open.delete(d.dataset.open)}},true);

/* images */
function readImage(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const max=900;const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.8))};img.onerror=rej;img.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function imgTarget(t){const a=t.split('|');if(a[0]==='plan')return planById(a[1]);if(a[0]==='wk')return wkOf(planById(a[1]),a[2]);if(a[0]==='ex')return exOf(a[1],a[2],a[3]);return null}
async function handleFile(el){const f=el.files&&el.files[0];if(!f)return;
 if(el.dataset.import){try{const txt=await f.text();stageImport(txt)}catch(e){toast('Could not read that file')}el.value='';return}
 if(el.dataset.stravafile){if(/\.zip$/i.test(f.name)){ui.stravaErr='That is the zip. Open it in the Files app first, then pick activities.csv from the folder it creates.';el.value='';render();return}try{const txt=await f.text();stageStravaFile(txt)}catch(e){toast('Could not read that file')}el.value='';return}
 if(el.dataset.img){try{const url=await readImage(f);const o=imgTarget(el.dataset.img);if(o){o.img=url;save();render()}}catch(e){toast('Could not load that image. Try a JPEG or PNG.')}}}
function stageImport(txt){try{const o=JSON.parse(txt);if(!o||!Array.isArray(o.plans)||!Array.isArray(o.sessions))throw 0;ui.pendingImport=o;render()}catch(e){toast(`That is not a ${APP} backup`)}}
function exportable(){const o={...S};delete o.active;delete o.sync;return o}

/* ================= committing a session ================= */
function commitSession(src,{celebrate=true}={}){const s=clone(src);
 s.duration=num(s.duration)||0;s.end=s.start+s.duration*1000;
 s.ex=s.ex.map(x=>{if(x.cat==='gym'){x.sets=(x.sets||[]).filter(z=>z.r!==''||z.t==='f'||z.w!=='').map(z=>({w:z.w,r:z.r,t:z.t||''}))}if(x.flat&&(x.dist===''||x.time==='')){const q=splitSum(x);if(q.c){if(x.dist==='')x.dist=Math.round(q.m/10)/100;if(x.time==='')x.time=q.t}}delete x.tgt;delete x.sug;return x}).filter(x=>x.cat!=='gym'||x.sets.length);
 const editId=s.editId;delete s.past;delete s.editId;const before=editId||!celebrate?null:computePRs();
 if(editId){s.id=editId;const i=S.sessions.findIndex(z=>z.id===editId);if(i>=0)S.sessions[i]=s;else S.sessions.push(s)}else S.sessions.push(s);
 S.sessions.sort((x,y)=>x.start-y.start);
 if(!editId){const p=planById(s.planId);if(p&&p.mode==='seq'&&p.id===S.activePlanId){const cd=seqDay(p);if(cd&&cd.day.w.includes(s.workoutId)){p.seqDone=[...new Set([...(p.seqDone||[]),s.workoutId])];if(cd.day.w.every(id=>p.seqDone.includes(id)))seqAdvance(p,'done')}}}
 save();
 const news=[];if(before){const after=computePRs();for(const k in after){const r=after[k];if(r.best.sid===s.id&&before[k])news.push(k)}}
 return{s,news,editId}}

/* ================= actions ================= */
let wake=null;
async function grabWake(){try{if('wakeLock' in navigator&&!wake)wake=await navigator.wakeLock.request('screen')}catch(e){}}
function dropWake(){try{wake&&wake.release()}catch(e){}wake=null}
function openSession(){if(!S.active.past)grabWake();ui.sheet=null;if(ui.stack[ui.stack.length-1]?.v!=='session')go('session');else render()}
function startSession(s){if(S.active){toast('Finish or discard the current workout first');ui.sheet=null;openSession();return}S.active=s;save();openSession()}
function newPlan(){const p={id:uid(),name:'New plan',img:'',mode:'week',created:Date.now(),workouts:[],days:[],seqPos:0,seqDone:[],closedThrough:weekStart(Date.now())};S.plans.push(p);if(!S.activePlanId)S.activePlanId=p.id;save();go('plan',{id:p.id})}
function tplRef(b){const a=b.split('|');return{p:planById(a[0]),w:wkOf(planById(a[0]),a[1]),e:exOf(a[0],a[1],a[2])}}
function stepArr(e,path){const p=String(path).split('.').map(Number);return p.length>1?{arr:e.steps[p[0]].steps,i:p[1]}:{arr:e.steps,i:p[0]}}
const curEx=d=>S.active.ex.find(z=>z.id===d.eid);
function syncTpl(x,field){if(!x.ref)return;const e=exOf(...x.ref);if(!e)return;e[field]=clone(x[field])}
function tomb(id){S.tomb[id]=Date.now()}
const ACT={
 tab:d=>{ui.scroll[ui.tab]=window.scrollY;ui.tab=d.t;ui.stack=[];render();window.scrollTo(0,0)},
 go:d=>go(d.v,{id:d.id,pid:d.pid,wid:d.wid,key:d.key}),
 back:()=>back(),
 closeSheet:()=>{ui.sheet=null;renderSheet()},
 copyText:async d=>{try{await navigator.clipboard.writeText(d.text);toast('Copied')}catch(e){toast(d.text)}},
 startFresh:()=>{const th=S.settings.theme;const sy=S.sync;S=emptyState();S.settings.theme=th;S.sync=sy;save();ui.stack=[];render();toast('Sample data cleared')},
 featSheet:()=>{ui.sheet={t:'feat'};renderSheet()},
 setFeat:d=>{S.settings.featured=d.k==='pr'?{k:'pr',key:d.key}:{k:d.k};save();ui.sheet=null;render()},
 startSheet:()=>{if(S.active){openSession();return}ui.startPast=false;ui.adhoc={name:'',cat:'other'};ui.sheet={t:'start'};renderSheet()},
 logPast:()=>{if(S.active){openSession();return}ui.startPast=true;ui.adhoc={name:'',cat:'other'};ui.sheet={t:'start'};renderSheet()},
 startMode:d=>{ui.startPast=d.val==='past';renderSheet()},
 adCat:d=>{ui.adhoc.cat=d.val;renderSheet()},
 startW:d=>{const p=planById(d.pid);const w=wkOf(p,d.wid);if(w)startSession(newSession(p,w,ui.sheet&&ui.startPast))},
 startAdhoc:()=>{const a=ui.adhoc;const name=a.name.trim()||({other:'Activity',gym:'Gym workout',run:'Run',bike:'Ride'})[a.cat];startSession(newAdhoc(name,a.cat,ui.startPast))},
 startRecent:d=>startSession(newAdhoc(d.name,'other',ui.startPast)),
 openSession:()=>openSession(),
 minimize:()=>{dropWake();back()},
 sAddSet:d=>{const x=curEx(d);const l=x.sets[x.sets.length-1];x.sets.push(l?{w:l.w,r:l.r,t:l.t==='w'?'':l.t,d:false}:{w:'',r:'',t:'',d:false});save();render()},
 sRmSet:d=>{curEx(d).sets.splice(+d.k,1);save();render()},
 sTag:d=>{const z=curEx(d).sets[+d.k];z.t=TAGS[(TAGS.indexOf(z.t||'')+1)%TAGS.length];save();render()},
 sDone:d=>{const x=curEx(d);const z=x.sets[+d.k];z.d=!z.d;if(z.d){const sec=num(x.rest)||90;ui.rest={end:Date.now()+sec*1000,total:sec,name:x.name||'Next set'}}save();render()},
 applySug:d=>{const x=curEx(d);const g=x.sug;let hit=0;x.sets.forEach(z=>{if(z.t!=='w'&&num(z.w)===g.from){z.w=g.to;hit++}});if(!hit)x.sets.forEach(z=>{if(z.t!=='w'&&num(z.w)>0)z.w=Math.round((num(z.w)+g.inc)*100)/100});g.applied=true;save();render();toast(`Working sets set to ${fmtNum(g.to,2)} kg`)},
 restAdj:d=>{if(!ui.rest)return;ui.rest.end+=(+d.d)*1000;ui.rest.total=Math.max(ui.rest.total+(+d.d),1);renderRest()},
 restSkip:()=>{ui.rest=null;renderRest()},
 sRmEx:d=>{S.active.ex=S.active.ex.filter(x=>x.id!==d.eid);save();render()},
 useSplits:d=>{const x=curEx(d);const q=splitSum(x);x.dist=Math.round(q.m/10)/100;x.time=q.t;save();render()},
 fieldSheet:d=>{ui.field={eid:d.eid,label:'',unit:'',kind:'text'};ui.sheet={t:'field'};renderSheet()},
 sExtra:d=>{const x=curEx(d);x.extra=x.extra.includes(d.k)?x.extra.filter(k=>k!==d.k):[...x.extra,d.k];syncTpl(x,'extra');save();render()},
 fieldAdd:()=>{const f=ui.field;const x=S.active.ex.find(z=>z.id===f.eid);if(!f.label.trim()){toast('Give the field a name');return}x.custom.push({id:uid(),label:f.label.trim(),unit:f.unit.trim(),kind:f.kind});syncTpl(x,'custom');ui.sheet=null;save();render()},
 addExSheet:()=>{ui.addEx={name:'',cat:defaultCat(S.active.type)};ui.sheet={t:'addEx'};renderSheet();setTimeout(()=>$('#ax-name')?.focus(),50)},
 axCat:d=>{ui.addEx.cat=d.val;renderSheet()},
 addExConfirm:()=>{const a=ui.addEx;const x=blankEx(a.name.trim()||'Exercise',a.cat);if(a.cat==='other')x.extra=['rpe'];S.active.ex.push(x);ui.sheet=null;save();render();window.scrollTo(0,document.body.scrollHeight)},
 addExKnown:d=>{let cat=ui.addEx.cat;const n=norm(d.name);for(let i=S.sessions.length-1;i>=0;i--){const x=S.sessions[i].ex.find(z=>norm(z.name)===n);if(x){cat=x.cat;break}}const last=lastEx(d.name,cat);const x=blankEx(d.name,cat);if(last){x.extra=[...(last.extra||[])];x.custom=clone(last.custom||[]);x.rest=last.rest??x.rest;x.mg=last.mg||x.mg;if(cat==='gym'&&last.sets&&last.sets.length)x.sets=last.sets.map(z=>({w:z.w,r:z.r,t:z.t||'',d:false}))}S.active.ex.push(x);ui.sheet=null;save();render()},
 finish:()=>{const a=S.active;const s=clone(a);if(!s.past)s.duration=Math.round((Date.now()-s.start)/1000);
  const{news,editId}=commitSession(s);S.active=null;ui.rest=null;save();dropWake();ui.stack=editId?[{v:'sdetail',id:editId}]:[];if(!editId)ui.tab='home';
  ui.sheet=news.length?{t:'prs',list:news}:null;render();window.scrollTo(0,0);if(!news.length)toast(editId?'Changes saved':'Workout saved')},
 discard:()=>{const ed=S.active&&S.active.editId;S.active=null;ui.rest=null;save();dropWake();ui.stack=ed?[{v:'sdetail',id:ed}]:[];render();toast(ed?'Edit cancelled':'Workout discarded')},
 seqRest:()=>{seqAdvance(activePlan(),'rest');save();render();toast('Rest day logged')},
 seqSkip:()=>{seqAdvance(activePlan(),'skip');save();render();toast('Day skipped')},
 seqComplete:()=>{seqAdvance(activePlan(),'done');save();render();toast('Day marked done')},
 newPlan:()=>newPlan(),
 setMode:d=>{const p=planById(d.id);p.mode=d.val;if(p.mode==='week')p.closedThrough=weekStart(Date.now());else if(!p.days.length)p.days=p.workouts.map(w=>({label:'',w:[w.id]}));save();render()},
 setActive:d=>{S.activePlanId=d.id;const p=planById(d.id);if(p.mode==='week')p.closedThrough=weekStart(Date.now());save();render();toast('Active plan changed')},
 dupPlan:d=>{const p=clone(planById(d.id));const map={};p.id=uid();p.name+=' (copy)';p.created=Date.now();p.closedThrough=weekStart(Date.now());p.workouts.forEach(w=>{const n=uid();map[w.id]=n;w.id=n;w.exercises.forEach(e=>e.id=uid())});p.days.forEach(x=>x.w=x.w.map(id=>map[id]).filter(Boolean));p.seqPos=0;p.seqDone=[];delete p.u;S.plans.push(p);save();ui.stack.pop();go('plan',{id:p.id})},
 delPlan:d=>{S.plans=S.plans.filter(p=>p.id!==d.id);tomb(d.id);if(S.activePlanId===d.id)S.activePlanId=S.plans[0]?S.plans[0].id:null;save();back();toast('Plan deleted')},
 addWorkout:d=>{const p=planById(d.id);const w={id:uid(),name:'Workout '+letter(p.workouts.length),type:'gym',customName:'',img:'',exercises:[]};p.workouts.push(w);save();go('workout',{pid:p.id,wid:w.id})},
 delWorkout:d=>{const p=planById(d.pid);p.workouts=p.workouts.filter(w=>w.id!==d.wid);p.days.forEach(x=>x.w=x.w.filter(id=>id!==d.wid));save();back()},
 setWType:d=>{const w=wkOf(planById(d.pid),d.wid);w.type=d.val;save();render()},
 tplAddEx:d=>{const w=wkOf(planById(d.pid),d.wid);const cat=defaultCat(w.type);const e={id:uid(),name:'',cat,img:'',sets:cat==='gym'?[{r:10,w:'',t:''},{r:10,w:'',t:''},{r:10,w:'',t:''}]:[]};fixTpl(e);if(cat==='other'&&w.type==='custom')e.name=w.customName||'';w.exercises.push(e);save();render();setTimeout(()=>{const ins=document.querySelectorAll('.excard input[list]');const el=ins[ins.length-1];if(el){el.focus();el.scrollIntoView({block:'center'})}},30)},
 tplRmEx:d=>{const r=tplRef(d.b);r.w.exercises=r.w.exercises.filter(e=>e!==r.e);save();render()},
 tplMove:d=>{const r=tplRef(d.b);const a=r.w.exercises;const i=a.indexOf(r.e),j=i+(+d.d);if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save();render()},
 tplAddSet:d=>{const r=tplRef(d.b);const l=r.e.sets[r.e.sets.length-1];r.e.sets.push(l?{r:l.r,w:l.w,t:l.t==='w'?'':l.t}:{r:10,w:'',t:''});save();render()},
 tplRmSet:d=>{tplRef(d.b).e.sets.splice(+d.k,1);save();render()},
 tplTag:d=>{const z=tplRef(d.b).e.sets[+d.k];z.t=TAGS[(TAGS.indexOf(z.t||'')+1)%TAGS.length];save();render()},
 tplBW:d=>{const e=tplRef(d.b).e;e.bw=!e.bw;save();render()},
 tplProg:d=>{const e=tplRef(d.b).e;e.prog=e.prog===false;save();render()},
 tplMG:d=>{const e=tplRef(d.b).e;e.mg=e.mg===d.k?'':d.k;save();render()},
 tplExtra:d=>{const e=tplRef(d.b).e;e.extra=e.extra.includes(d.k)?e.extra.filter(k=>k!==d.k):[...e.extra,d.k];save();render()},
 tplCfAdd:d=>{tplRef(d.b).e.custom.push({id:uid(),label:'',unit:'',kind:'text'});save();render()},
 tplCfRm:d=>{tplRef(d.b).e.custom.splice(+d.i,1);save();render()},
 tplMode:d=>{tplRef(d.b).e.mode=d.val;save();render()},
 preset:d=>{const e=tplRef(d.b).e;const p=PRESETS[e.cat][+d.k];e.steps=p[1]();e.mode='struct';if(!e.name||/^(run|ride|intervals?)$/i.test(e.name))e.name=p[0];save();render();toast('Template loaded. Edit any step.')},
 stepAdd:d=>{const e=tplRef(d.b).e;const arr=d.parent!==undefined&&d.parent!==''?e.steps[+d.parent].steps:e.steps;const last=[...arr].reverse().find(s=>s.kind!=='repeat');arr.push(last?{...clone(last),id:uid()}:st('work','dist',e.cat==='bike'?10000:1000,''));save();render()},
 addRepeat:d=>{const e=tplRef(d.b).e;e.steps.push(e.cat==='bike'?rep(3,[st('work','time',300,'Zone 4'),st('rec','time',180,'Zone 1')]):rep(4,[st('work','dist',400,'4:00-4:10'),st('rec','time',90)]));save();render()},
 stepRm:d=>{const e=tplRef(d.b).e;const{arr,i}=stepArr(e,d.path);arr.splice(i,1);save();render()},
 stepBy:d=>{const e=tplRef(d.b).e;const o=stepAt(e,d.path);if(o.by!==d.val){o.by=d.val;o.v=''}save();render()},
 rmImg:d=>{const o=imgTarget(d.target);if(o){o.img='';save();render()}},
 viewImg:d=>{ui.sheet={t:'img',pid:d.pid,wid:d.wid,eid:d.eid};renderSheet()},
 editSession:d=>{if(S.active){toast('Finish or discard the current workout first');openSession();return}const s=clone(S.sessions.find(z=>z.id===d.id));s.past=true;s.editId=s.id;s.ex.forEach(x=>{fixSess(x);if(x.cat==='gym')x.sets.forEach(z=>z.d=false)});S.active=s;save();ui.stack.pop();go('session')},
 delSession:d=>{S.sessions=S.sessions.filter(s=>s.id!==d.id);tomb(d.id);save();back();toast('Workout deleted')},
 range:d=>{ui.range=d.val;render()},
 histMode:d=>{ui.histMode=d.val;render()},
 calMove:d=>{ui.calMonth=addMonths(ui.calMonth,+d.d);ui.calDay=null;render()},
 calDay:d=>{ui.calDay=ui.calDay===d.d?null:d.d;render()},
 prTab:d=>{ui.prTab=d.val;render()},
 prAddKey:d=>{ui.prForm=prFormFor(d.key);go('prAdd')},
 pfGroup:d=>{const f=ui.prForm;f.group=d.val;if(d.val==='run')f.key='r:5k';if(d.val==='bike')f.key='b:long';render()},
 prSave:()=>{const f=ui.prForm;let key,exName='';if(f.group==='gym'){if(!norm(f.ex)){toast('Enter the exercise name');return}key=`g:${norm(f.ex)}:${f.metric}`;exName=f.ex.trim()}else key=f.key;
  const unit=f.group==='gym'?(GYM_METRICS.find(m=>m[0]===f.metric)||GYM_METRICS[0])[2]:keyMeta(key).unit;const v=unit==='time'||unit==='pace'?parseDur(f.value):num(f.value);
  if(!(v>0)){toast(unit==='time'?'Enter a time like 22:48 or 1:49:30':unit==='pace'?'Enter a pace like 4:35':'Enter a number above zero');return}
  const t=new Date((f.date||ymd(Date.now()))+'T12:00').getTime();S.prs.push({id:uid(),key,exName,value:v,t:isFinite(t)?t:Date.now(),note:f.note.trim()});save();ui.stack.pop();if(ui.stack[ui.stack.length-1]?.v==='prDetail')ui.stack.pop();ui.prTab=f.group;go('prDetail',{key});toast('Record saved')},
 delPR:d=>{S.prs=S.prs.filter(p=>p.id!==d.id);tomb(d.id);save();render()},
 gfPeriod:d=>{ui.goalForm.period=d.val;render()},
 addGoal:()=>{const f=ui.goalForm;const t=num(f.target);if(!(t>0)){toast('Enter a target above zero');return}if(f.kind==='lift'&&!f.ex.trim()){toast('Enter the exercise');return}
  const g={id:uid(),kind:f.kind,target:t};if(['workouts','runKm','bikeKm','hours'].includes(f.kind))g.period=f.period;if(f.kind==='lift')g.ex=f.ex.trim();if(f.kind==='bw'){const b=[...S.body].sort((x,y)=>x.t-y.t);g.start=b.length?num(b[b.length-1].kg):''}
  S.goals.push(g);ui.goalForm=null;save();render();toast('Goal added')},
 delGoal:d=>{S.goals=S.goals.filter(g=>g.id!==d.id);tomb(d.id);save();render()},
 bodySheet:()=>{const b=[...S.body].sort((x,y)=>x.t-y.t);const l=b[b.length-1];ui.bodyForm={date:ymd(Date.now()),kg:l?l.kg:'',bf:'',waist:''};ui.sheet={t:'body'};renderSheet()},
 bodySave:()=>{const f=ui.bodyForm;const kg=num(f.kg);if(!(kg>0)&&!(num(f.bf)>0)&&!(num(f.waist)>0)){toast('Enter at least one value');return}const t=new Date((f.date||ymd(Date.now()))+'T08:00').getTime();S.body.push({id:uid(),t,kg,bf:num(f.bf),waist:num(f.waist)});ui.sheet=null;save();render();toast('Saved')},
 delBody:d=>{S.body=S.body.filter(b=>b.id!==d.id);tomb(d.id);save();render()},
 theme:d=>{S.settings.theme=d.val;applyTheme();save();render()},
 exportData:async()=>{const json=JSON.stringify(exportable());const name=`tempo-backup-${ymd(Date.now())}.json`;
  try{const file=new File([json],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:`${APP} backup`});S.lastBackup=Date.now();save();render();toast('Backup saved');return}}catch(e){if(e&&e.name==='AbortError')return}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();S.lastBackup=Date.now();save();ui.showJson=false;render();toast('Backup file created. If nothing downloaded, use Show backup as text.')}catch(e){ui.showJson=true;render()}},
 showJson:()=>{ui.showJson=!ui.showJson;render()},
 copyJson:async()=>{const t=$('#json-out');try{await navigator.clipboard.writeText(t.value);S.lastBackup=Date.now();save();toast('Copied. Paste it into Notes or Files to keep it.')}catch(e){t.focus();t.select();toast('Text selected. Copy it from the menu.')}},
 importPaste:()=>{const v=$('#json-in').value.trim();if(!v){toast('Paste the backup text first');return}stageImport(v)},
 importConfirm:()=>{const sy=S.sync;S=migrate(ui.pendingImport);S.sync=sy;S.active=null;ui.pendingImport=null;S.sample=false;const now=Date.now();for(const k of SYNC_COLLS)for(const it of S[k])it.u=now;S.metaU=now;applyTheme();save();ui.stack=[];ui.tab='home';render();toast('Backup restored')},
 clearAll:()=>{const t=Date.now();const tb={...S.tomb};for(const k of SYNC_COLLS)for(const it of S[k])tb[it.id]=t;const sy=S.sync;S=emptyState();S.sync=sy;S.tomb=tb;S.metaU=t;applyTheme();save();ui.stack=[];ui.tab='home';render();toast('All data erased')},
 /* sync */
 syncConnect:async()=>{const tok=(ui.syncToken||'').trim();if(!tok){ui.syncErr='Paste your GitHub token first.';render();return}ui.syncing=true;ui.syncErr='';render();
  try{const r=await fetch(GH+'/user',{headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json'}});if(r.status===401)throw new Error('GitHub did not accept that token. Copy it again, including the ghp_ part.');if(!r.ok)throw new Error('GitHub error '+r.status+'. Try again in a moment.');const u=await r.json();
   const scopes=r.headers.get('x-oauth-scopes');if(scopes!==null&&scopes!==''&&!/gist/.test(scopes))throw new Error('This token has no gist permission. Create a new one with the link above.');
   if(S.sample){const th=S.settings.theme;S=emptyState();S.settings.theme=th}
   S.sync=Object.assign(emptySync(),{token:tok,user:u.login||''});ui.syncToken='';ui.syncing=false;save();await syncNow();toast(S.sync.err?S.sync.err:'Sync is on')}
  catch(e){ui.syncing=false;ui.syncErr=e.message||'Could not reach GitHub. Check your connection.';render()}},
 syncNow:()=>{syncNow().then(()=>{if(!S.sync.err)toast('Synced')})},
 syncOff:()=>{S.sync=emptySync();save();render();toast('Sync turned off on this device')},
 /* strava */
 stravaConnect:async()=>{const a=S.strava;if(!a.clientId||!a.clientSecret)return;a.oauthState=uid();await DB.set('state',clone(S));
  location.href=`${SV}/oauth/authorize?client_id=${encodeURIComponent(String(a.clientId).trim())}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri())}&approval_prompt=auto&scope=${encodeURIComponent('read,activity:read_all')}&state=${a.oauthState}`},
 stravaUseCode:async()=>{const c=(ui.stravaCode||'').trim();if(!c){ui.stravaErr='Paste the code first.';render();return}await stravaFinish(c)},
 stravaSync:()=>stravaCheck(false),
 stravaBackfill:d=>{S.strava.lastSync=Math.max(0,Math.floor((Date.now()-(+d.days)*DAY)/1000));stravaCheck(false)},
 stravaAuto:()=>{S.strava.auto=!S.strava.auto;save();render()},
 stravaOff:()=>{const keep={clientId:S.strava.clientId,clientSecret:S.strava.clientSecret,imported:S.strava.imported,ignored:S.strava.ignored};S.strava=Object.assign(emptyStrava(),keep);save();render();toast('Strava disconnected')},
 stravaImport:async d=>{const a=S.strava.pending.find(x=>String(x.id)===String(d.id));if(!a)return;const r=await importStrava(a,a.choice??suggestMatch(a));if(r!=='open'){render();toast('Imported')}},
 stravaIgnore:d=>{S.strava.ignored.push(Number(d.id)||d.id);S.strava.pending=S.strava.pending.filter(x=>String(x.id)!==String(d.id));save();render()},
 stravaFileImport:()=>importStravaFile(),
 stravaFileCancel:()=>{ui.stravaFile=null;render()},
 stravaImportAll:async()=>{const list=[...S.strava.pending].filter(a=>a.cat!=='gym');for(const a of list)await importStrava(a,a.choice??suggestMatch(a));render();toast(plural(list.length,'activity').replace('activitys','activities')+' imported'+(S.strava.pending.length?'. Gym sessions are left to open one by one.':''))}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const fn=ACT[el.dataset.act];if(!fn)return;
 if(el.dataset.confirm){const key=el.dataset.act+'|'+(el.dataset.id||el.dataset.eid||el.dataset.b||el.dataset.wid||'')+(el.dataset.k||'');if(ui.armed!==key){e.preventDefault();ui.armed=key;el.dataset.orig=el.innerHTML;el.textContent=el.dataset.confirm;el.classList.add('armed');clearTimeout(ui.armT);ui.armT=setTimeout(()=>{if(ui.armed===key)ui.armed=null;if(el.isConnected&&el.dataset.orig){el.innerHTML=el.dataset.orig;el.classList.remove('armed')}},3500);return}ui.armed=null}
 fn(el.dataset,el,e)});

function applyTheme(){const t=S&&S.settings.theme;const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(r.dataset.themeOwn)r.removeAttribute('data-theme');r.dataset.themeOwn=(t==='light'||t==='dark')?'1':''}
function isTyping(){const a=document.activeElement;return a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)}
function softRender(){if(ui.sheet||isTyping())return;const top=ui.stack[ui.stack.length-1];if(top&&top.v==='session')return;render()}

/* ================= sync (GitHub Gist) ================= */
const GH='https://api.github.com',GIST_FILE='tempo-data.json',GIST_DESC='Tempo workout sync (do not rename)';
const SYNC_COLLS=['plans','sessions','prs','goals','body','weekSummaries','seqLog'];
const snap=new Map();let metaSnap='';
function metaOf(st){const a=st.strava||{};return JSON.stringify([st.activePlanId,st.settings,a.clientId,a.clientSecret,a.access,a.refresh,a.expires,a.athlete,a.auto])}
function stamp(init){const now=Date.now();for(const k of SYNC_COLLS)for(const it of S[k]||[]){const u=it.u;delete it.u;const j=JSON.stringify(it);it.u=u||0;if(init){snap.set(it.id,j);continue}if(snap.get(it.id)!==j){it.u=now;snap.set(it.id,j)}}const m=metaOf(S);if(init){metaSnap=m;return}if(m!==metaSnap){S.metaU=now;metaSnap=m}}
let mergeStates=function(L,R){const out={...L};const tb={...(R.tomb||{})};for(const k in L.tomb||{})tb[k]=Math.max(tb[k]||0,L.tomb[k]);
 for(const k of SYNC_COLLS){const m=new Map();for(const it of [...(R[k]||[]),...(L[k]||[])]){const e=m.get(it.id);if(!e||(it.u||0)>(e.u||0))m.set(it.id,it)}out[k]=[...m.values()].filter(it=>!(tb[it.id]>=(it.u||0)))}
 const ws=new Map();for(const w of out.weekSummaries){const key=w.planId+'|'+w.week;const e=ws.get(key);if(!e||(w.u||0)>(e.u||0))ws.set(key,w)}out.weekSummaries=[...ws.values()];
 out.sessions.sort((a,b)=>a.start-b.start);
 const src=(R.metaU||0)>(L.metaU||0)?R:L;out.activePlanId=src.activePlanId;out.settings=src.settings;out.metaU=Math.max(L.metaU||0,R.metaU||0);out.lastBackup=Math.max(L.lastBackup||0,R.lastBackup||0)||null;
 const ls=L.strava,rs=R.strava||emptyStrava(),ss=src===R?rs:ls;
 const imported={...rs.imported,...ls.imported};const ignored=[...new Set([...(rs.ignored||[]),...(ls.ignored||[])].map(String))].map(x=>isNaN(x)?x:Number(x));
 const pend=new Map();for(const a of [...(rs.pending||[]),...(ls.pending||[])])if(!imported[a.id]&&!ignored.includes(a.id))pend.set(String(a.id),pend.get(String(a.id))||a);
 out.strava=Object.assign({},ls,{clientId:ss.clientId,clientSecret:ss.clientSecret,access:ss.access,refresh:ss.refresh,expires:ss.expires,athlete:ss.athlete,auto:ss.auto,imported,ignored,pending:[...pend.values()],lastSync:Math.max(ls.lastSync||0,rs.lastSync||0),checked:Math.max(ls.checked||0,rs.checked||0)});
 const cut=Date.now()-180*DAY;for(const k in tb)if(tb[k]<cut)delete tb[k];out.tomb=tb;out.sample=false;out.active=L.active;out.sync=L.sync;return out};
async function gh(path,opt={}){const r=await fetch(GH+path,{...opt,headers:{Authorization:'Bearer '+S.sync.token,Accept:'application/vnd.github+json',...(opt.body?{'Content-Type':'application/json'}:{})}});
 if(r.status===401)throw new Error('GitHub no longer accepts the token. Turn sync off and on with a new token.');if(r.status===403||r.status===429)throw new Error('GitHub is limiting requests. Try again later.');if(!r.ok)throw new Error('GitHub error '+r.status);return r.status===204?null:r.json()}
async function findGist(){for(let page=1;page<=10;page++){const list=await gh(`/gists?per_page=100&page=${page}`);const g=list.find(x=>x.files&&x.files[GIST_FILE]);if(g)return g.id;if(list.length<100)break}return null}
async function readGist(id){const g=await gh('/gists/'+id);const f=g.files&&g.files[GIST_FILE];if(!f)return{data:null,text:''};let txt=f.content;if(f.truncated){const r=await fetch(f.raw_url);txt=await r.text()}try{return{data:JSON.parse(txt),text:txt}}catch(e){return{data:null,text:''}}}
async function writeGist(id,text){if(id){await gh('/gists/'+id,{method:'PATCH',body:JSON.stringify({description:GIST_DESC,files:{[GIST_FILE]:{content:text}}})});return id}
 const g=await gh('/gists',{method:'POST',body:JSON.stringify({description:GIST_DESC,public:false,files:{[GIST_FILE]:{content:text}}})});return g.id}
let syncP=null,syncSoonT=null;
function syncSoon(){if(!S||!S.sync.token||S.sample)return;clearTimeout(syncSoonT);syncSoonT=setTimeout(()=>syncNow(),6000)}
function syncNow(){if(!S.sync.token||S.sample)return Promise.resolve();if(syncP)return syncP;if(!navigator.onLine){S.sync.err='Offline. It will sync when you are back online.';return Promise.resolve()}
 ui.syncing=true;softRender();
 syncP=(async()=>{try{let id=S.sync.gistId;if(id){try{await gh('/gists/'+id)}catch(e){if(/404/.test(e.message))id=''}}if(!id)id=await findGist();
   let remote={data:null,text:''};if(id)remote=await readGist(id);
   if(remote.data){const merged=mergeStates(S,migrate(remote.data));S=merged;stamp(true)}
   const text=JSON.stringify(exportable());if(text!==remote.text||!id)id=await writeGist(id,text);
   S.sync.gistId=id;S.sync.last=Date.now();S.sync.err='';closeWeeks()}
  catch(e){S.sync.err=e.message||'Could not reach GitHub'}
  finally{ui.syncing=false;syncP=null;await DB.set('state',clone(S));prCache=null;applyTheme();softRender()}})();
 return syncP}

/* ================= Strava ================= */
const SV='https://www.strava.com';
const redirectUri=()=>location.origin+location.pathname;
function mapSport(t){const s=String(t||'');if(/Run/.test(s))return 'run';if(/Ride|Velomobile|Handcycle/.test(s))return 'bike';if(/WeightTraining|Crossfit/.test(s))return 'gym';return 'other'}
const sportName=s=>String(s||'Workout').replace(/([a-z])([A-Z])/g,'$1 $2');
async function stravaToken(params){const a=S.strava;const body=new URLSearchParams({client_id:String(a.clientId).trim(),client_secret:String(a.clientSecret).trim(),...params});
 let r;try{r=await fetch(SV+'/api/v3/oauth/token',{method:'POST',body})}catch(e){throw new Error('Could not reach Strava. Check your connection and try again.')}
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(r.status===400||r.status===401?'Strava did not accept the request. Check the Client ID and Secret, then connect again.':'Strava error '+r.status);
 a.access=j.access_token;a.refresh=j.refresh_token||a.refresh;a.expires=j.expires_at;if(j.athlete)a.athlete=[j.athlete.firstname,j.athlete.lastname].filter(Boolean).join(' ');save()}
async function stravaFresh(){if((S.strava.expires||0)-120>Date.now()/1000)return;await stravaToken({grant_type:'refresh_token',refresh_token:S.strava.refresh})}
async function sApi(path){await stravaFresh();let r;try{r=await fetch(SV+'/api/v3'+path,{headers:{Authorization:'Bearer '+S.strava.access}})}catch(e){throw new Error('Could not reach Strava. Check your connection.')}
 if(r.status===401)throw new Error('Strava access has expired or was revoked. Disconnect and connect again.');if(r.status===429)throw new Error('Strava rate limit reached. Try again in 15 minutes.');if(!r.ok)throw new Error('Strava error '+r.status);return r.json()}
async function stravaFinish(code){ui.stravaBusy=true;ui.stravaErr='';render();
 try{await stravaToken({code,grant_type:'authorization_code'});if(!S.strava.lastSync)S.strava.lastSync=Math.floor((Date.now()-30*DAY)/1000);ui.stravaCode='';save();toast('Strava connected');ui.stravaBusy=false;await stravaCheck(false)}
 catch(e){ui.stravaErr=e.message;ui.stravaBusy=false;render()}}
function stravaReturn(){const q=new URLSearchParams(location.search);if(!q.has('code')&&!q.has('error'))return null;const o={code:q.get('code'),error:q.get('error'),scope:q.get('scope')||'',state:q.get('state')};history.replaceState(null,'',location.pathname);return o}
async function handleStravaReturn(o){ui.stack=[{v:'settings'},{v:'strava'}];
 if(o.error){ui.stravaErr='Strava access was not granted.';render();return}
 if(o.scope&&!/activity:read/.test(o.scope)){ui.stravaErr='Please allow access to your activities on the Strava screen, then connect again.';render();return}
 if(!S.strava.clientSecret){ui.stack=[{v:'scode',code:o.code}];render();return}
 render();await stravaFinish(o.code)}
function suggestMatch(a){const p=activePlan();if(!p||a.cat==='other')return '';const same=w=>typeKey(w)===a.cat;let cands=[];
 if(p.mode==='week'){const done=weekDone(p,weekStart(a.start));cands=p.workouts.filter(w=>same(w)&&!done.has(w.id))}else{const cd=seqDay(p);cands=cd?cd.day.w.map(id=>wkOf(p,id)).filter(w=>w&&same(w)):[]}
 if(!cands.length)return '';const nm=norm(a.name);const isStruct=w=>w.exercises.some(e=>e.mode==='struct');const looksInt=/interval|track|repeat|fartlek|tempo|\d\s?[x×]\s?\d/.test(nm);const w=cands.find(w=>nm.includes(norm(w.name)))||cands.find(w=>looksInt===isStruct(w))||cands[0];return p.id+'|'+w.id}
async function stravaCheck(silent){const a=S.strava;if(!a.access||ui.stravaBusy)return;ui.stravaBusy=true;ui.stravaErr='';if(!silent)render();
 try{let page=1,added=0,newest=a.lastSync||0;const after=a.lastSync||Math.floor((Date.now()-30*DAY)/1000);
  while(page<=40){const list=await sApi(`/athlete/activities?after=${after}&per_page=100&page=${page}`);
   for(const x of list){const t=Math.floor(Date.parse(x.start_date)/1000);newest=Math.max(newest,t);if(a.imported[x.id]||a.ignored.includes(x.id)||a.pending.some(p=>String(p.id)===String(x.id)))continue;const sp=x.sport_type||x.type;
    a.pending.push({id:x.id,name:x.name||sportName(sp),sport:sportName(sp),cat:mapSport(sp),start:Date.parse(x.start_date),distance:x.distance||0,moving:x.moving_time||0,elapsed:x.elapsed_time||0,elev:x.total_elevation_gain||0,hr:x.average_heartrate||'',maxhr:x.max_heartrate||'',cad:x.average_cadence||'',watts:x.average_watts||'',kcal:x.kilojoules?Math.round(x.kilojoules):''});added++}
   if(list.length<100)break;page++}
  a.pending.sort((x,y)=>x.start-y.start);a.lastSync=newest;a.checked=Date.now();save();
  if(a.auto){for(const p of [...a.pending].filter(p=>p.cat!=='gym'))await importStrava(p,suggestMatch(p))}
  if(!silent)toast(added?`${plural(added,'new activity').replace('activitys','activities')} from Strava`:'No new activities')}
 catch(e){ui.stravaErr=e.message;if(!silent)toast(e.message)}
 finally{ui.stravaBusy=false;softRender();if(!silent)render()}}
function buildStravaSession(a,choice){let s=null;if(choice){const[pid,wid]=String(choice).split('|');const p=planById(pid),w=wkOf(p,wid);if(p&&w)s=newSession(p,w,true)}
 if(!s){s=newAdhoc(a.name,a.cat,true);if(a.cat==='other'&&!s.ex.length)s.ex=[blankEx(a.name,'other')];if(a.cat==='other'&&s.type!=='custom'){s.type='custom';s.customName=a.sport}}
 else if(a.name&&norm(a.name)!==norm(s.name))s.notes=a.name;
 if(a.desc&&!s.notes)s.notes=a.desc;
 s.start=a.start;s.duration=a.elapsed||a.moving||0;s.source='strava';s.stravaId=a.id;
 let x=null;
 if(a.cat!=='gym'){x=s.ex.find(z=>z.cat===a.cat);if(!x){x=blankEx(a.name,a.cat);s.ex.unshift(x)}s.ex=[x];
  if(a.cat==='other'){x.time=a.moving||a.elapsed||'';if(a.distance){x.vals.dist=Math.round(a.distance/10)/100;if(!x.extra.includes('dist'))x.extra.push('dist')}}
  else{x.dist=a.distance?Math.round(a.distance/10)/100:'';x.time=a.moving||a.elapsed||'';if(a.cat==='bike')x.elev=a.elev?Math.round(a.elev):''}
  const vals={hr:a.hr,maxhr:a.maxhr,cad:a.cat==='run'&&a.cad?a.cad*2:a.cad,power:a.watts,kcal:a.kcal,elev:a.cat==='run'?a.elev:''};
  for(const k in vals){const v=num(vals[k]);if(v>0&&EXTRA_FOR[x.cat].includes(k)){x.vals[k]=Math.round(v);if(!x.extra.includes(k))x.extra.push(k)}}}
 return{s,x}}
async function importStrava(a,choice){const{s,x}=buildStravaSession(a,choice);
 if(x&&x.flat&&S.strava.access){try{const laps=await sApi(`/activities/${a.id}/laps`);if(Array.isArray(laps)&&laps.length===x.flat.length)x.flat.forEach((q,i)=>{const L=laps[i];if(q.by==='dist')x.splits[i].t=L.moving_time||L.elapsed_time;else x.splits[i].m=Math.round(L.distance)})}catch(e){}}
 S.strava.pending=S.strava.pending.filter(p=>String(p.id)!==String(a.id));S.strava.imported[a.id]=s.id;
 if(a.cat==='gym'){if(S.active){toast('Finish the current workout first');S.strava.pending.push(a);delete S.strava.imported[a.id];return 'busy'}S.active=s;save();ui.stack=[];openSession();toast('Add the sets you did, then save');return 'open'}
 commitSession(s,{celebrate:false});return 'saved'}

/* --- Strava archive file (activities.csv), no subscription needed --- */
function parseCSV(t){const first=t.slice(0,t.indexOf('\n')>0?t.indexOf('\n'):t.length);const sep=(first.split(';').length>first.split(',').length)?';':',';
 const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=ch}else if(ch==='"')q=true;else if(ch===sep){row.push(f);f=''}else if(ch==='\n'){row.push(f);rows.push(row);row=[];f=''}else if(ch!=='\r')f+=ch}
 if(f!==''||row.length){row.push(f);rows.push(row)}return rows}
const MONTHS={jan:0,feb:1,fev:1,mar:2,apr:3,abr:3,may:4,mai:4,jun:5,jul:6,aug:7,ago:7,sep:8,set:8,oct:9,out:9,nov:10,dec:11,dez:11};
function parseStravaDate(s){s=String(s||'').trim();let m;
 if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/)))return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0));
 if((m=s.match(/^([A-Za-zÀ-ú]{3})[a-zÀ-ú]*\.?\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i))){const mo=MONTHS[m[1].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')];if(mo===undefined)return NaN;let h=+m[4];if(m[7]){h=h%12+(/pm/i.test(m[7])?12:0)}return Date.UTC(+m[3],mo,+m[2],h,+m[5],+(m[6]||0))}
 if((m=s.match(/^(\d{1,2})\s+(?:de\s+)?([A-Za-zÀ-ú]{3})[a-zÀ-ú]*\.?\s+(?:de\s+)?(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i))){const mo=MONTHS[m[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')];if(mo===undefined)return NaN;return Date.UTC(+m[3],mo,+m[1],+m[4],+m[5],+(m[6]||0))}
 if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/)))return Date.UTC(+m[3],+m[2]-1,+m[1],+m[4],+m[5],+(m[6]||0));
 const d=Date.parse(s);return isFinite(d)?d:NaN}
function mapSportLoose(t){const s=norm(t).normalize('NFD').replace(/[̀-ͯ]/g,'');if(/run|corrida|trail/.test(s))return 'run';if(/ride|bike|cycl|ciclis|bicicleta|pedal|velomobile|handcycle/.test(s))return 'bike';if(/weight|pesos|crossfit|musculacao|strength|forca/.test(s))return 'gym';return 'other'}
function readStravaCSV(text){const rows=parseCSV(text.replace(/^﻿/,''));if(rows.length<2)throw new Error('The file is empty.');
 const H=rows[0].map(h=>norm(h).normalize('NFD').replace(/[̀-ͯ]/g,''));const all=re=>H.map((x,i)=>re.test(x)?i:-1).filter(i=>i>=0);const one=re=>{const r=all(re);return r.length?r[0]:-1};
 const c={id:one(/^(activity id|id da atividade|id da actividade|id)$/),date:one(/^(activity date|data da atividade|data da actividade|date|data)$/),name:one(/^(activity name|nome da atividade|nome da actividade|name|nome)$/),type:one(/^(activity type|tipo de atividade|tipo de actividade|type|tipo)$/),desc:one(/^(activity description|descricao da atividade|descricao da actividade)$/),
  elapsed:all(/^(elapsed time|tempo decorrido)/),moving:one(/^(moving time|tempo em movimento)/),dist:all(/^(distance|distancia)$/),elev:one(/^(elevation gain|ganho de elevacao|ganho de altitude|subida)/),hr:one(/^(average heart rate|frequencia cardiaca media)/),maxhr:one(/^(max heart rate|frequencia cardiaca maxima)/),cad:one(/^(average cadence|cadencia media)/),watts:one(/^(average watts|potencia media)/),cal:one(/^(calories|calorias)$/)};
 if(c.id<0||c.date<0||c.type<0)throw new Error("This doesn't look like Strava's activities.csv. Open the export zip and pick the file called activities.csv.");
 const out=[];
 for(const r of rows.slice(1)){if(!r[c.id])continue;const start=parseStravaDate(r[c.date]);if(!isFinite(start))continue;const sport=String(r[c.type]||'Workout').trim();
  let m='';if(c.dist.length>1)m=num(r[c.dist[c.dist.length-1]]);if(!(m>0)&&c.dist.length){const km=num(r[c.dist[0]]);m=km>0?km*1000:''}
  const g=i=>i>=0?num(r[i]):'';const idv=String(r[c.id]).trim();
  out.push({id:/^\d+$/.test(idv)?Number(idv):idv,name:(r[c.name]||sport).trim()||sport,sport:sportName(sport.replace(/\s+/g,'')).replace(/\s+/g,' '),cat:mapSportLoose(sport),start,distance:m||0,moving:Math.round(g(c.moving)||0),elapsed:Math.round(c.elapsed.length?num(r[c.elapsed[0]])||0:0),elev:g(c.elev)||0,hr:g(c.hr),maxhr:g(c.maxhr),cad:g(c.cad),watts:g(c.watts),kcal:g(c.cal),desc:c.desc>=0?(r[c.desc]||'').trim():''})}
 if(!out.length)throw new Error('No activities could be read from this file.');
 out.sort((a,b)=>a.start-b.start);return out}
function stageStravaFile(text){try{const list=readStravaCSV(text);const a=S.strava;const known=x=>a.imported[x.id]||a.ignored.includes(x.id)||a.pending.some(p=>String(p.id)===String(x.id))||S.sessions.some(s=>String(s.stravaId)===String(x.id));
  const fresh=list.filter(x=>!known(x));const ws=weekStart(Date.now());const byCat={run:0,bike:0,gym:0,other:0};fresh.forEach(x=>byCat[x.cat]++);
  ui.stravaFile={list:fresh,total:list.length,from:list[0].start,to:list[list.length-1].start,thisWeek:fresh.filter(x=>x.start>=ws).length,byCat};ui.stravaErr=''}
 catch(e){ui.stravaFile=null;ui.stravaErr=e.message}render()}
function importStravaFile(){const f=ui.stravaFile;if(!f)return;
 if(S.sample){const keep={theme:S.settings.theme,sync:S.sync,strava:S.strava};S=emptyState();S.settings.theme=keep.theme;S.sync=keep.sync;S.strava=keep.strava}
 const ws=weekStart(Date.now());let n=0,q=0;
 for(const a of f.list){if(S.strava.imported[a.id])continue;
  if(a.start>=ws){if(!S.strava.pending.some(p=>String(p.id)===String(a.id))){S.strava.pending.push(a);q++}continue}
  const{s}=buildStravaSession(a,'');delete s.past;s.duration=num(s.duration)||0;s.end=s.start+s.duration*1000;s.ex.forEach(x=>{delete x.tgt;delete x.sug});
  S.sessions.push(s);S.strava.imported[a.id]=s.id;n++}
 S.sessions.sort((x,y)=>x.start-y.start);S.strava.pending.sort((x,y)=>x.start-y.start);prCache=null;ui.stravaFile=null;save();render();
 toast(`${plural(n,'activity')} imported`+(q?`. ${plural(q,'activity')} from this week are waiting on Today so you can match them to your plan.`:''))}

/* ================= timers, lifecycle, boot ================= */
setInterval(()=>{if(!S)return;if(S.active&&!S.active.past){const v=fmtDur((Date.now()-S.active.start)/1000);const a=document.getElementById('timer');if(a)a.textContent=v;const b=document.getElementById('timer2');if(b)b.textContent=v}if(ui.rest)renderRest()},500);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'||!S)return;closeWeeks();if(S.active&&!S.active.past&&ui.stack[ui.stack.length-1]?.v==='session'){wake=null;grabWake()}softRender();syncNow().then(()=>{if(S.strava.access&&Date.now()-(S.strava.checked||0)>30*60e3)stravaCheck(true)})});
window.addEventListener('online',()=>{if(S)syncNow()});
const _save=save;save=function(){if(S&&snap.size+metaSnap.length)stamp(false);_save();if(!ui.inSync)syncSoon()};
