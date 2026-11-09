'use strict';
/* ================= utilities ================= */
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const num=v=>{if(v===''||v==null)return '';const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:''};
const DAY=864e5;
const p2=n=>String(n).padStart(2,'0');
const clone=o=>JSON.parse(JSON.stringify(o));
function sod(t){const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()}
function ymd(t){const d=new Date(t);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function weekStart(t){const d=new Date(sod(t));d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()}
function addDays(t,n){const d=new Date(t);d.setDate(d.getDate()+n);return d.getTime()}
function monthStart(t){const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),1).getTime()}
function addMonths(t,n){const d=new Date(t);return new Date(d.getFullYear(),d.getMonth()+n,1).getTime()}
function fmtDate(t,o){return new Date(t).toLocaleDateString('en-GB',o||{day:'numeric',month:'short'})}
function fmtDateY(t){return fmtDate(t,{day:'numeric',month:'short',year:'numeric'})}
function dtLocal(t){const d=new Date(t);return ymd(t)+'T'+p2(d.getHours())+':'+p2(d.getMinutes())}
function fmtDur(sec){if(sec===''||sec==null||!isFinite(sec))return '';sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${h}:${p2(m)}:${p2(s)}`:`${m}:${p2(s)}`}
function fmtHM(sec){sec=Math.round(sec||0);const h=Math.floor(sec/3600),m=Math.round(sec%3600/60);return h?`${h}h ${p2(m)}m`:`${m} min`}
function parseDur(str){str=String(str??'').trim();if(!str)return '';const parts=str.split(':');if(parts.some(x=>x.trim()===''||isNaN(x.replace(',','.'))))return '';const n=parts.map(x=>parseFloat(x.replace(',','.')));if(n.length===1)return Math.round(n[0]*60);if(n.length===2)return Math.round(n[0]*60+n[1]);return Math.round(n[0]*3600+n[1]*60+n[2])}
function fmtNum(v,d=1){if(v===''||v==null||!isFinite(v))return '';return Number(v).toLocaleString('en-GB',{maximumFractionDigits:d})}
const plain=(v,d=2)=>v===''||v==null||!isFinite(v)?'':String(Math.round(v*Math.pow(10,d))/Math.pow(10,d));
const letter=i=>String.fromCharCode(65+(i%26));
function fmtM(m,cat){m=num(m)||0;if(cat==='bike'||m>=1000)return fmtNum(m/1000,m%100?2:1)+' km';return fmtNum(m,0)+' m'}
const plural=(n,w,p)=>`${n} ${n===1?w:(p||(/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s'))}`;

/* ================= types ================= */
const CAT={gym:'Gym',run:'Running',bike:'Cycling',other:'Other'};
const typeLabel1=o=>o.type==='custom'?(o.customName||'Custom'):(CAT[o.type]||'Other');
const typeLabel=o=>o.alts&&o.alts.length?[...new Set([o,...o.alts].map(typeLabel1))].join(' or ')+(new Set([o,...o.alts].map(typeLabel1)).size===1?` · ${o.alts.length+1} options`:''):typeLabel1(o);
const typeKey=o=>CAT[o.type]?o.type:'other';
const defaultCat=t=>CAT[t]?t:'other';
const typePill=o=>`<span class="pill" style="--c:var(--${typeKey(o)})">${ic(typeKey(o),14)}${esc(typeLabel(o))}</span>`;
const typeBadge=(o,cls='')=>`<span class="lt ${cls}" style="--c:var(--${typeKey(o)})">${ic(typeKey(o),cls?16:19)}</span>`;
const EXTRAS={dist:['Distance','km'],hr:['Avg heart rate','bpm'],maxhr:['Max heart rate','bpm'],power:['Avg power','W'],cad:['Cadence','spm'],elev:['Elevation gain','m'],rpe:['Effort','RPE 1–10'],kcal:['Calories','kcal']};
const EXTRA_FOR={gym:['rpe','hr','kcal'],run:['hr','maxhr','cad','elev','rpe','kcal'],bike:['hr','maxhr','power','cad','rpe','kcal'],other:['dist','hr','maxhr','rpe','kcal']};
const extraUnit=(k,cat)=>k==='cad'&&cat==='bike'?'rpm':EXTRAS[k][1];
const KINDS={warm:'Warm-up',work:'Run',rec:'Recover',cool:'Cool-down'};
const kindLabel=(k,cat)=>k==='work'?(cat==='bike'?'Effort':'Run'):KINDS[k]||k;
const kindColor=(k,cat)=>k==='work'?`var(--${cat})`:k==='rec'?'var(--muted)':`color-mix(in srgb,var(--${cat}) 45%,var(--surface))`;
const TAGS=['','w','f','d'];const TAGL={'':'—',w:'W',f:'F',d:'D'};
const MG={chest:'Chest',back:'Back',shoulders:'Shoulders',arms:'Arms',legs:'Legs',core:'Core',full:'Full body'};
function guessMG(name){const n=norm(name);
 if(/bench|chest|fly|flye|push-?up|dip|pec/.test(n))return 'chest';
 if(/curl|tricep|bicep|pushdown|skull|hammer|extension/.test(n))return 'arms';
 if(/overhead|shoulder|lateral|ohp|military|face pull|raise|arnold/.test(n))return 'shoulders';
 if(/squat|leg|lunge|calf|rdl|romanian|hip thrust|glute|step-?up|hamstring|quad/.test(n))return 'legs';
 if(/row|pull|lat|chin|deadlift|shrug/.test(n))return 'back';
 if(/plank|crunch|core|ab |abs|sit-?up|hollow|rollout/.test(n))return 'core';
 if(/clean|snatch|thruster|burpee|kettlebell|swing/.test(n))return 'full';
 return ''}

/* ================= icons ================= */
const I={
 home:'<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
 plans:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h3"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
 stats:'<path d="M5 20V11M11 20V4M17 20v-6M3 20.5h18"/>',
 pr:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5.2a3 3 0 0 0 3 4M16 6h2.8a3 3 0 0 1-3 4M12 13v4M8 21h8M9.5 17h5v4h-5z"/>',
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 back:'<path d="M15 18l-6-6 6-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
 cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 up:'<path d="M6 15l6-6 6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',chev:'<path d="M9.5 6l6 6-6 6"/>',min:'<path d="M6 9l6 6 6-6"/>',
 gym:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
 run:'<path d="M3 15.5V9.2l4 1.4 2.3-3.1h2.4l1.6 3.1 5.4 2a2.9 2.9 0 0 1 1.9 2.7v.2z"/><path d="M3 15.5v2.6h18.6v-2.6M11.3 11l-1.4 1.4M13.4 12.3 12 13.7"/>',
 bike:'<circle cx="6" cy="16" r="3.6"/><circle cx="18" cy="16" r="3.6"/><path d="M6 16l3.4-6.5h6.2L18 16M9.4 9.5 12.2 16H6M14 6.5h2.4"/>',
 other:'<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.1 6-.8z"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9.5 2.5h5"/>',
 medal:'<circle cx="12" cy="14" r="6"/><path d="M8.5 9 6 3h4l2 4 2-4h4l-2.5 6"/><path d="M12 11.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="currentColor"/>',
 repeat:'<path d="M17 2.5l3 3-3 3M4 11.5v-1a5 5 0 0 1 5-5h11M7 21.5l-3-3 3-3M20 12.5v1a5 5 0 0 1-5 5H4"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
 scale:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9.5a5 5 0 0 1 7 0M12 9.5l1.5-2"/>',
 sync:'<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5M4 13a8 8 0 0 0 14.3 4.6L20 15.5M4 4v4.5h4.5M20 20v-4.5h-4.5"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
 trend:'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
};
const ic=(n,s=22)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]||''}</svg>`;
const plateSVG='<svg class="plate" viewBox="0 0 120 120" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="60" cy="60" r="55" stroke-width="9"/><circle cx="60" cy="60" r="38" stroke-width="2.5"/><circle cx="60" cy="60" r="12" stroke-width="7"/></svg>';

/* ================= storage ================= */
const DB={db:null,
 open(){return new Promise(res=>{try{const r=indexedDB.open('sets-and-splits',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{this.db=r.result;res(true)};r.onerror=()=>res(false);r.onblocked=()=>res(false)}catch(e){res(false)}})},
 get(k){return new Promise(res=>{if(!this.db)return res(null);try{const q=this.db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result??null);q.onerror=()=>res(null)}catch(e){res(null)}})},
 set(k,v){return new Promise(res=>{if(!this.db)return res(false);try{const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}catch(e){res(false)}})}
};
let S=null,saveT=null;
function save(){saveVersion++;clearTimeout(saveT);saveT=setTimeout(async()=>{const ok=await DB.set('state',clone(S));if(!ok){try{localStorage.setItem('ss-state',JSON.stringify(S))}catch(e){}}},250)}
function emptyStrava(){return{clientId:'',clientSecret:'',access:'',refresh:'',expires:0,athlete:'',scope:'',lastSync:0,checked:0,auto:false,pending:[],imported:{},ignored:[],oauthState:''}}
function emptySync(){return{token:'',gistId:'',user:'',last:0,err:''}}
function emptyState(){return {v:2,sample:false,plans:[],activePlanId:null,sessions:[],seqLog:[],weekSummaries:[],prs:[],goals:[],body:[],strava:emptyStrava(),settings:{featured:{k:'weekStreak'},theme:'system',inc:2.5},active:null,lastBackup:null,sync:emptySync(),tomb:{},metaU:0}}
function fixSet(z){if(z.t===undefined)z.t=z.f?'f':'';delete z.f}
function fixTpl(e){(e.sets||[]).forEach(fixSet);if(!e.sets)e.sets=[];e.extra=e.extra||[];e.custom=e.custom||[];e.mode=e.mode||'steady';e.steps=e.steps||[];if(e.rest===undefined||e.rest==='')e.rest=e.cat==='gym'?90:'';e.notes=e.notes||'';e.tgt=e.tgt||'';e.bw=!!e.bw;if(e.desc===undefined)e.desc='';if(e.dist===undefined)e.dist='';if(e.time===undefined)e.time='';if(e.prog===undefined)e.prog=true;if(e.inc===undefined)e.inc='';if(e.mg===undefined)e.mg=''}
function fixSess(x){(x.sets||[]).forEach(fixSet);if(x.tgt&&Array.isArray(x.tgt))x.tgt.forEach(fixSet);x.vals=x.vals||{};x.extra=x.extra||[];x.custom=x.custom||[];if(x.cat!=='gym')['dist','time','elev','desc'].forEach(k=>{if(x[k]===undefined)x[k]=''})}
function migrate(st){st=Object.assign(emptyState(),st);st.settings=Object.assign(emptyState().settings,st.settings||{});st.strava=Object.assign(emptyStrava(),st.strava||{});st.sync=Object.assign(emptySync(),st.sync||{});st.tomb=st.tomb||{};
 for(const p of st.plans){p.days=p.days||[];for(const w of p.workouts)for(const e of w.exercises)fixTpl(e)}
 for(const s of st.sessions)for(const x of s.ex)fixSess(x);if(st.active)st.active.ex.forEach(fixSess);for(const w of st.weekSummaries)w.extra=w.extra||[];st.v=2;return st}

/* ================= UI state ================= */
const ui={tab:'home',stack:[],sheet:null,range:'3m',statEx:null,armed:null,prTab:'gym',startPast:false,showJson:false,pendingImport:null,prForm:null,addEx:{name:'',cat:'gym'},adhoc:{name:'',cat:'other'},field:null,rest:null,open:new Set(),scroll:{},histMode:'list',calMonth:monthStart(Date.now()),calDay:null,goalForm:null,bodyForm:null,stravaCode:'',stravaBusy:false,stravaErr:''};

/* ================= domain helpers ================= */
const planById=id=>S.plans.find(p=>p.id===id);
const activePlan=()=>planById(S.activePlanId)||null;
const wkOf=(p,wid)=>{if(!p)return null;const w=p.workouts.find(w=>w.id===wid);if(w)return w;for(const m of p.workouts)if(m.alts){const a=m.alts.find(z=>z.id===wid);if(a)return a}return null};
const altParent=(p,wid)=>p?p.workouts.find(m=>m.alts&&m.alts.some(z=>z.id===wid))||null:null;
const exOf=(pid,wid,eid)=>{const w=wkOf(planById(pid),wid);return w?w.exercises.find(e=>e.id===eid):null};
function sessionsIn(a,b){return S.sessions.filter(s=>s.start>=a&&s.start<b)}
function exNames(){const m=new Map();for(const s of S.sessions)for(const x of s.ex)if(x.name)m.set(norm(x.name),x.name);for(const p of S.plans)for(const w of p.workouts)for(const e of w.exercises)if(e.name&&!m.has(norm(e.name)))m.set(norm(e.name),e.name);for(const r of S.prs)if(r.exName&&!m.has(norm(r.exName)))m.set(norm(r.exName),r.exName);return m}
function lastEx(name,cat){const n=norm(name);for(let i=S.sessions.length-1;i>=0;i--){const x=S.sessions[i].ex.find(z=>norm(z.name)===n&&z.cat===cat);if(x)return x}return null}
function sMetrics(s){let sets=0,vol=0,rd=0,rt=0,bd=0,bt=0,el=0,gx=0;for(const x of s.ex){if(x.cat==='gym'){let any=false;for(const z of x.sets||[]){if(z.t==='w')continue;const r=num(z.r),w=num(z.w);if(r>0||z.t==='f'){sets++;any=true;if(r>0&&w>0)vol+=r*w}}if(any)gx++}else if(x.cat==='run'){rd+=num(x.dist)||0;rt+=num(x.time)||0;el+=num(x.vals&&x.vals.elev)||0}else if(x.cat==='bike'){bd+=num(x.dist)||0;bt+=num(x.time)||0;el+=num(x.elev)||0}}return{sets,vol,rd,rt,bd,bt,el,gx}}
function sessionSummary(s){const m=sMetrics(s),o=[];if(m.gx)o.push(`${plural(m.gx,'exercise')} · ${m.sets} sets`+(m.vol?` · ${fmtNum(m.vol/1000,1)} t`:''));if(m.rd)o.push(`${fmtNum(m.rd,2)} km`+(m.rt?` · ${fmtDur(m.rt/m.rd)} /km`:''));if(m.bd)o.push(`${fmtNum(m.bd,1)} km`+(m.bt?` · ${fmtNum(m.bd/(m.bt/3600),1)} km/h`:''));if(!o.length&&s.duration)o.push(fmtHM(s.duration));return o.join(' · ')}

/* structured workouts */
function parsePace(s){const m=String(s||'').match(/(\d{1,2}:\d{2})(?:\s*(?:-|–|to)\s*(\d{1,2}:\d{2}))?/);if(!m)return null;const a=parseDur(m[1]),b=m[2]?parseDur(m[2]):a;return[Math.min(a,b),Math.max(a,b)]}
const fmtPaceR=r=>r?(r[0]===r[1]?fmtDur(r[0]):fmtDur(r[0])+'–'+fmtDur(r[1]))+' /km':'';
function flatSteps(steps){const out=[];for(const s of steps||[]){if(s.kind==='repeat'){const n=Math.max(1,parseInt(s.n)||1);for(let r=1;r<=n;r++)for(const c of s.steps||[])out.push({kind:c.kind,by:c.by,v:c.v,tgt:c.tgt,rep:r,of:n})}else out.push({kind:s.kind,by:s.by,v:s.v,tgt:s.tgt})}return out}
function stepEst(s,cat){const v=num(s.v)||0;
 if(cat==='bike'){const m=String(s.tgt||'').match(/(\d+(?:[.,]\d+)?)\s*km\/?h/i);const kmh=m?num(m[1]):({warm:24,work:31,rec:20,cool:23}[s.kind]||26);if(s.by==='dist'){const km=v/1000;return{km,sec:km/kmh*3600}}return{km:v/3600*kmh,sec:v}}
 const pr=parsePace(s.tgt);const pace=pr?(pr[0]+pr[1])/2:({warm:390,work:300,rec:480,cool:390}[s.kind]||360);
 if(s.by==='dist'){const km=v/1000;return{km,sec:km*pace}}return{km:v/pace,sec:v}}
function intensity(s,cat){if(cat==='run'){const pr=parsePace(s.tgt);if(pr){const p=(pr[0]+pr[1])/2;return Math.max(.12,Math.min(1,(480-p)/(480-210)))}}
 if(cat==='bike'){const z=String(s.tgt||'').match(/zone\s*(\d)/i);if(z)return Math.min(1,.12+.17*(+z[1]))}
 return{warm:.35,work:.82,rec:.16,cool:.3}[s.kind]||.4}
function stepsSummary(steps,cat){const fl=flatSteps(steps);let km=0,sec=0,reps=0;for(const s of fl){const e=stepEst(s,cat);km+=e.km;sec+=e.sec;if(s.kind==='work')reps++}return{km,sec,reps,n:fl.length}}
function profileSVG(steps,cat){const fl=flatSteps(steps);if(!fl.length)return '<p class="hint">Add steps or pick a template to see the workout shape.</p>';
 const est=fl.map(s=>Math.max(stepEst(s,cat).sec,20));const tot=est.reduce((a,b)=>a+b,0);const W=340,H=70;let x=0,r='';
 fl.forEach((s,i)=>{const w=est[i]/tot*W;const h=Math.max(6,intensity(s,cat)*(H-4));r+=`<rect x="${(x+.75).toFixed(1)}" y="${(H-h).toFixed(1)}" width="${Math.max(1.5,w-1.5).toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4,Math.max(1,w/3)).toFixed(1)}" fill="${kindColor(s.kind,cat)}"/>`;x+=w});
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Workout profile">${r}</svg>`}
function profileBlock(e,cat,id){const sm=stepsSummary(e.steps,cat);return `<div class="profile" data-prof="${id}">${profileSVG(e.steps,cat)}<div class="psum"><span>≈ <b>${fmtNum(sm.km,1)} km</b></span><span>≈ <b>${fmtHM(sm.sec)}</b></span><span><b>${sm.reps}</b> ${cat==='bike'?'efforts':'reps'}</span></div></div>`}
const st=(kind,by,v,tgt='')=>({id:uid(),kind,by,v,tgt});
const rep=(n,steps)=>({id:uid(),kind:'repeat',n,steps});
const PRESETS={run:[
 ['6 × 400 m',()=>[st('warm','time',600,'6:00-6:30'),rep(6,[st('work','dist',400,'4:00-4:10'),st('rec','time',90)]),st('cool','time',600,'6:00-6:30')]],
 ['Tempo 5 km',()=>[st('warm','dist',2000,'5:50-6:10'),st('work','dist',5000,'4:45-4:55'),st('cool','dist',1500,'5:50-6:10')]],
 ['Pyramid',()=>[st('warm','time',600,'6:00-6:30'),st('work','dist',200,'3:50-4:00'),st('rec','time',60),st('work','dist',400,'4:00-4:10'),st('rec','time',90),st('work','dist',800,'4:10-4:20'),st('rec','time',120),st('work','dist',400,'4:00-4:10'),st('rec','time',90),st('work','dist',200,'3:50-4:00'),st('cool','time',600,'6:00-6:30')]],
 ['Fartlek 8 × 1 min',()=>[st('warm','time',600,'6:00-6:30'),rep(8,[st('work','time',60,'4:20-4:40'),st('rec','time',60,'6:00-6:30')]),st('cool','time',300,'6:00-6:30')]],
 ['5 × 1 km',()=>[st('warm','dist',2000,'5:50-6:10'),rep(5,[st('work','dist',1000,'4:15-4:25'),st('rec','time',120)]),st('cool','dist',1500,'5:50-6:10')]],
 ['Fast finish long run',()=>[st('work','dist',12000,'5:30-5:50'),st('work','dist',3000,'4:50-5:00')]]],
 bike:[
 ['Sweet spot 3 × 10 min',()=>[st('warm','time',900,'Zone 2'),rep(3,[st('work','time',600,'Zone 4'),st('rec','time',300,'Zone 1')]),st('cool','time',600,'Zone 1')]],
 ['Hill repeats 5 × 4 min',()=>[st('warm','time',900,'Zone 2'),rep(5,[st('work','time',240,'Zone 5'),st('rec','time',240,'Zone 1')]),st('cool','time',600,'Zone 1')]],
 ['Tempo 40 min',()=>[st('warm','time',900,'Zone 2'),st('work','time',2400,'Zone 3'),st('cool','time',600,'Zone 1')]],
 ['Endurance 60 km',()=>[st('work','dist',60000,'Zone 2')]]]};

/* smart progression: suggest the next weight when every target was hit last time */
function progression(e){if(e.cat!=='gym'||e.prog===false||e.bw)return null;const last=lastEx(e.name,'gym');if(!last||!last.sets)return null;
 const tW=(e.sets||[]).filter(z=>z.t!=='w');const lW=last.sets.filter(z=>z.t!=='w');if(!lW.length)return null;
 const hit=lW.every((z,i)=>{const t=tW[i];if(!t||t.t==='f'||z.t==='f'||t.r===''||t.r==null)return num(z.r)>0||z.t==='f';return num(z.r)>=num(t.r)});
 const top=Math.max(0,...lW.map(z=>num(z.w)||0));if(!top)return null;
 const inc=num(e.inc)||num(S.settings.inc)||2.5;return{hit,from:top,to:Math.round((top+inc)*100)/100,inc}}

/* week tracking */
function weekDone(p,ws){const set=new Set();for(const s of sessionsIn(ws,addDays(ws,7)))if(s.planId===p.id&&s.workoutId)set.add(s.workoutId);return set}
function weekExtras(p,ws){return sessionsIn(ws,addDays(ws,7)).filter(s=>!p||s.planId!==p.id)}
function closeWeeks(){const p=activePlan();if(!p||p.mode!=='week')return;const cur=weekStart(Date.now());let w=p.closedThrough??weekStart(p.created||Date.now());let changed=false;
 while(w<cur){const done=weekDone(p,w);const all=sessionsIn(w,addDays(w,7));const days=new Set(all.map(s=>ymd(s.start)));const lab=p.workouts.map((x,i)=>({l:letter(i),name:x.name,id:x.id}));
  S.weekSummaries.push({id:uid(),planId:p.id,planName:p.name,week:w,target:p.workouts.length,done:lab.filter(x=>done.has(x.id)),missed:lab.filter(x=>!done.has(x.id)),extra:all.filter(s=>s.planId!==p.id).map(s=>s.name),sessions:all.filter(s=>s.planId===p.id).length,daysOff:7-days.size});w=addDays(w,7);changed=true}
 p.closedThrough=w;if(changed)save()}
function countNames(arr){const m=new Map();for(const n of arr)m.set(n,(m.get(n)||0)+1);return[...m.entries()].map(([n,c])=>c>1?`${n} ×${c}`:n)}
/* sequential */
function seqDay(p){if(!p||!p.days.length)return null;const n=p.days.length;const i=(((p.seqPos||0)%n)+n)%n;return{i,day:p.days[i],n}}
function dayLabel(p,i){const d=p.days[i];return (d&&d.label)||`Day ${i+1}`}
function dayDesc(p,i){const d=p.days[i];if(!d||!d.w.length)return 'Rest';return d.w.map(id=>wkOf(p,id)?.name).filter(Boolean).join(' + ')||'Rest'}
function seqAdvance(p,kind){const cd=seqDay(p);if(!cd)return;S.seqLog.push({id:uid(),planId:p.id,t:Date.now(),day:cd.i,label:dayLabel(p,cd.i),kind});p.seqPos=(cd.i+1)%cd.n;p.seqDone=[]}
/* streaks */
function trainedDays(){return new Set(S.sessions.map(s=>ymd(s.start)))}
function dayStreak(){const d=trainedDays();let t=sod(Date.now());if(!d.has(ymd(t)))t=addDays(t,-1);let n=0;while(d.has(ymd(t))){n++;t=addDays(t,-1)}return n}
function weekStreak(){const w=new Set(S.sessions.map(s=>weekStart(s.start)));let t=weekStart(Date.now());if(!w.has(t))t=addDays(t,-7);let n=0;while(w.has(t)){n++;t=addDays(t,-7)}return n}

/* goals */
const GOAL_KINDS={workouts:['Workouts','',0],runKm:['Running distance','km',1],bikeKm:['Cycling distance','km',0],hours:['Training time','h',1],lift:['Lift a weight','kg',1],bw:['Body weight','kg',1]};
function goalProgress(g){const now=Date.now();const a=g.period==='month'?monthStart(now):weekStart(now);const ss=sessionsIn(a,Infinity);const tgt=num(g.target)||0;
 let v=0,label='';
 if(g.kind==='workouts')v=ss.length;else if(g.kind==='runKm')v=ss.reduce((t,s)=>t+sMetrics(s).rd,0);else if(g.kind==='bikeKm')v=ss.reduce((t,s)=>t+sMetrics(s).bd,0);else if(g.kind==='hours')v=ss.reduce((t,s)=>t+(s.duration||0),0)/3600;
 else if(g.kind==='lift'){const r=computePRs()[`g:${norm(g.ex)}:w`];v=r?r.best.value:0;label=g.ex}
 else if(g.kind==='bw'){const b=[...S.body].sort((x,y)=>x.t-y.t);const cur=b.length?num(b[b.length-1].kg):'';const start=num(g.start)||(b.length?num(b[0].kg):'');if(cur===''||start==='')return{pct:0,v:cur,tgt,label:'Log your weight'};const span=start-tgt;const pct=span===0?1:Math.max(0,Math.min(1,(start-cur)/span));return{pct,v:cur,tgt,label:`${fmtNum(cur,1)} → ${fmtNum(tgt,1)} kg`}}
 const pct=tgt>0?Math.min(1,v/tgt):0;const u=GOAL_KINDS[g.kind][1];const d=GOAL_KINDS[g.kind][2];
 return{pct,v,tgt,label:`${fmtNum(v,d)} / ${fmtNum(tgt,d)}${u?' '+u:''}`}}
function goalTitle(g){if(g.kind==='lift')return `${g.ex||'Lift'}`;if(g.kind==='bw')return 'Body weight';return GOAL_KINDS[g.kind][0]+(g.period==='month'?' · month':' · week')}
function ringSVG(pct,color){const r=32,c=2*Math.PI*r;return `<svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="38" cy="38" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(c*Math.max(pct,.001)).toFixed(1)} ${c.toFixed(1)}"/></svg>`}

/* ================= personal records ================= */
const RUN_D=[[1,'1k','1 km'],[5,'5k','5 km'],[10,'10k','10 km'],[21.0975,'hm','Half marathon'],[42.195,'m','Marathon']];
const RUN_KEYS=['r:1k','r:5k','r:10k','r:hm','r:m','r:long','r:pace'];
const BIKE_KEYS=['b:long','b:elev','b:speed'];
const GYM_METRICS=[['w','Heaviest set','kg'],['1rm','Estimated 1RM','kg'],['r','Most reps in a set','reps']];
function keyMeta(key,names){const [g,a,b]=key.split(':');
 if(g==='g'){const m=GYM_METRICS.find(x=>x[0]===b)||GYM_METRICS[0];return{group:'gym',ex:(names&&names.get(a))||a,label:m[1],unit:m[2],dir:'hi'}}
 if(g==='r'){const d=RUN_D.find(x=>x[1]===a);if(d)return{group:'run',label:d[2],unit:'time',dir:'lo'};if(a==='long')return{group:'run',label:'Longest run',unit:'km',dir:'hi'};return{group:'run',label:'Best average pace',unit:'pace',dir:'lo'}}
 const m={long:['Longest ride','km'],elev:['Most elevation','m'],speed:['Fastest average speed','km/h']}[a]||['Ride','km'];return{group:'bike',label:m[0],unit:m[1],dir:'hi'}}
function candidates(s){const out=[];for(const x of s.ex){
 if(x.cat==='gym'){const n=norm(x.name);if(!n)continue;let hw=0,e1=0,mr=0;for(const z of x.sets||[]){if(z.t==='w')continue;const r=num(z.r),w=num(z.w);if(!(r>0))continue;if(w>0){hw=Math.max(hw,w);e1=Math.max(e1,r===1?w:w*(1+r/30))}mr=Math.max(mr,r)}
  if(hw)out.push({key:`g:${n}:w`,value:hw});if(e1)out.push({key:`g:${n}:1rm`,value:Math.round(e1*10)/10});if(mr)out.push({key:`g:${n}:r`,value:mr})}
 else if(x.cat==='run'){const d=num(x.dist),t=num(x.time);if(d>0){out.push({key:'r:long',value:d});if(t>0){const pace=t/d;if(d>=1)out.push({key:'r:pace',value:pace});for(const[km,k]of RUN_D)if(d>=km*0.995)out.push({key:'r:'+k,value:Math.round(pace*km)})}}}
 else if(x.cat==='bike'){const d=num(x.dist),t=num(x.time),e=num(x.elev);if(d>0)out.push({key:'b:long',value:d});if(e>0)out.push({key:'b:elev',value:e});if(d>=5&&t>0)out.push({key:'b:speed',value:Math.round(d/(t/3600)*10)/10})}
}return out}
let prCache=null;
function computePRs(){if(prCache&&prCache.s===S.sessions&&prCache.n===S.sessions.length&&prCache.p===S.prs.length&&prCache.v===saveVersion)return prCache.map;
 const names=exNames();const ev=[];
 for(const s of S.sessions)for(const c of candidates(s))ev.push({...c,t:s.start,sid:s.id,src:'auto'});
 for(const m of S.prs)ev.push({key:m.key,value:m.value,t:m.t,mid:m.id,src:'manual',note:m.note});
 ev.sort((a,b)=>a.t-b.t);const map={};
 for(const e of ev){let r=map[e.key];if(!r)r=map[e.key]={key:e.key,...keyMeta(e.key,names),best:null,hist:[]};const better=!r.best||(r.dir==='hi'?e.value>r.best.value:e.value<r.best.value);if(better){r.best=e;r.hist.push(e)}}
 prCache={s:S.sessions,n:S.sessions.length,p:S.prs.length,v:saveVersion,map};return map}
let saveVersion=0;
function prVal(unit,v){if(v===''||v==null)return '—';if(unit==='time')return fmtDur(v);if(unit==='pace')return fmtDur(v)+' /km';if(unit==='km')return fmtNum(v,2)+' km';if(unit==='kg')return fmtNum(v,1)+' kg';if(unit==='reps')return fmtNum(v,0)+' reps';if(unit==='m')return fmtNum(v,0)+' m';if(unit==='km/h')return fmtNum(v,1)+' km/h';return String(v)}
function prBig(unit,v){if(unit==='time')return[fmtDur(v),''];if(unit==='pace')return[fmtDur(v),'/km'];if(unit==='km')return[fmtNum(v,2),'km'];if(unit==='kg')return[fmtNum(v,1),'kg'];if(unit==='reps')return[fmtNum(v,0),'reps'];if(unit==='m')return[fmtNum(v,0),'m'];return[fmtNum(v,1),unit]}

/* ================= sample data ================= */
function makeSampleV2(){let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const now=Date.now(),start=addDays(weekStart(now),-70);
 const mkW=(name,type,exs,custom='')=>({id:uid(),name,type,customName:custom,img:'',exercises:exs.map(e=>{const o={id:uid(),img:'',desc:'',dist:'',time:'',sets:[],...e};fixTpl(o);return o})});
 const G=(name,reps,w,extra={})=>({name,cat:'gym',rest:120,...extra,sets:reps.map(r=>r==='W'?{r:10,w:Math.round(w*0.5/2.5)*2.5,t:'w'}:r==='F'?{r:'',w,t:'f'}:{r,w,t:''})});
 const A=mkW('Push','gym',[G('Bench Press',['W',8,8,6,'F'],80,{notes:'Shoulder blades back, feet planted, bar to lower chest.',extra:['rpe']}),G('Overhead Press',[8,8,8],45),G('Incline Dumbbell Press',[10,10,10],26,{rest:90,inc:2}),G('Triceps Pushdown',['F','F','F'],30,{rest:60})]);
 const B=mkW('Pull','gym',[G('Deadlift',['W',5,5,5],140,{rest:180,inc:5,notes:'Brace before every rep. Reset at the floor.'}),G('Pull-ups',['F','F','F','F'],'',{bw:true}),G('Barbell Row',[8,8,8],70),G('Biceps Curl',[12,12,12],14,{rest:60,inc:1})]);
 const C=mkW('Legs','gym',[G('Back Squat',['W',6,6,6,6],110,{rest:180,inc:5}),G('Romanian Deadlift',[8,8,8],90),G('Leg Press',[12,12,12],180,{inc:10}),G('Calf Raise',['F','F','F'],60,{rest:60})]);
 const D=mkW('Intervals','run',[{name:'Track Intervals',cat:'run',mode:'struct',steps:PRESETS.run[0][1](),extra:['hr']}]);
 const E=mkW('Long Ride','bike',[{name:'Road Ride',cat:'bike',dist:60,tgt:'Zone 2',extra:['hr','power']}]);
 const F=mkW('Easy Run','run',[{name:'Easy Run',cat:'run',dist:8,tgt:'5:30-5:50',extra:['hr']}]);
 const p1={id:uid(),name:'Hybrid Week',img:'',mode:'week',created:start,workouts:[A,B,C,D,E,F],days:[],seqPos:0,seqDone:[],closedThrough:start};
 const U=mkW('Upper','gym',[G('Bench Press',[6,6,6],82.5),G('Barbell Row',[8,8,8],72.5)]);const L=mkW('Lower','gym',[G('Back Squat',[5,5,5],115),G('Romanian Deadlift',[8,8],92.5)]);const R=mkW('Zone 2 Run','run',[{name:'Easy Run',cat:'run',dist:10,tgt:'5:40-6:00'}]);
 const p2={id:uid(),name:'Upper / Lower',img:'',mode:'seq',created:start,workouts:[U,L,R],days:[{label:'',w:[U.id]},{label:'',w:[L.id]},{label:'',w:[]},{label:'',w:[U.id]},{label:'',w:[L.id]},{label:'',w:[R.id]},{label:'',w:[]}],seqPos:0,seqDone:[],closedThrough:null};
 const round=(v,s)=>Math.round(v/s)*s;
 const sim=(p,w,t,wi)=>{const s={id:uid(),start:t,planId:p.id,workoutId:w.id,name:w.name,type:w.type,customName:w.customName,notes:'',ex:[]};let dur=0;
  for(const e of w.exercises){const x={id:uid(),name:e.name,cat:e.cat,ref:[p.id,w.id,e.id],vals:{},extra:[...e.extra],custom:[],mg:e.mg||guessMG(e.name),bw:e.bw};
   if(e.cat==='gym'){x.sets=e.sets.map(z=>{const wt=z.w?round(z.w*(1+0.013*wi),z.w<30?1:2.5):'';const r=z.t==='f'?7+Math.floor(rnd()*4)+Math.floor(wi/3):z.t==='w'?10:z.r-(rnd()<0.18?1:0);return{w:wt,r,t:z.t}});dur+=x.sets.length*170;if(e.extra.includes('rpe'))x.vals.rpe=7+Math.floor(rnd()*3)}
   else if(e.cat==='run'&&e.mode==='struct'){x.flat=flatSteps(e.steps);let dm=0,tt=0;x.splits=x.flat.map(q=>{const pr=parsePace(q.tgt);let pace=pr?(pr[0]+pr[1])/2:440;pace=q.kind==='work'?pace+6-wi*0.9+(rnd()-.5)*8:pace+rnd()*20;if(q.by==='dist'){const tm=Math.round(q.v/1000*pace);dm+=q.v;tt+=tm;return{t:tm,m:''}}const m=Math.round(q.v/pace*1000);dm+=m;tt+=q.v;return{t:'',m}});x.dist=Math.round(dm/10)/100;x.time=tt;x.elev='';x.desc='';x.vals.hr=158+Math.floor(rnd()*8);dur+=tt}
   else if(e.cat==='run'){const d=Math.round((6.5+rnd()*4.6)*100)/100;const pace=352-2.6*wi+rnd()*14;x.dist=d;x.time=Math.round(d*pace);x.elev='';x.desc='';x.vals.hr=142+Math.floor(rnd()*8);dur+=x.time}
   else if(e.cat==='bike'){const d=Math.round((42+rnd()*38)*10)/10;const sp=26+0.25*wi+rnd()*2.2;x.dist=d;x.time=Math.round(d/sp*3600);x.elev=Math.round(300+rnd()*800);x.desc='';x.vals.hr=136+Math.floor(rnd()*10);x.vals.power=185+Math.floor(rnd()*30);dur+=x.time}
   s.ex.push(x)}
  s.duration=Math.round(dur+(w.type==='gym'?600:240));s.end=s.start+s.duration*1000;if(w.type==='bike')s.source='strava';return s};
 const padel=(t,res)=>({id:uid(),start:t,planId:null,workoutId:null,name:'Padel',type:'custom',customName:'Padel',notes:'',duration:5400,end:t+5400e3,ex:[{id:uid(),name:'Padel',cat:'other',ref:null,time:5400,dist:'',elev:'',desc:'Doubles at the club',extra:['rpe'],custom:[{id:'res',label:'Result',unit:'',kind:'text'}],vals:{rpe:7,c_res:res}}]});
 const pool=[A,B,C,D,E,F],sessions=[];
 for(let wi=0;wi<=10;wi++){const ws=addDays(start,7*wi);let picks;
  if(wi===10)picks=[[0,0],[2,2]];
  else{const k=3+Math.floor(rnd()*3);const order=shuffle([0,1,2,3,4,5]).slice(0,k);const days=shuffle([0,1,2,3,4,5,6]).slice(0,k).sort((a,b)=>a-b);picks=order.map((o,i)=>[o,days[i]])}
  for(const[oi,dd]of picks){const t=addDays(ws,dd)+(oi===4?9:18)*3600e3+Math.floor(rnd()*40)*60e3;if(t>now)continue;sessions.push(sim(p1,pool[oi],t,wi))}
  if(wi%3===1||wi===10){const t=addDays(ws,5)+19*3600e3;if(t<now)sessions.push(padel(t,['Won 6-4 6-3','Lost 4-6 6-7','Won 6-2 3-6 6-4'][wi%3]))}}
 sessions.sort((a,b)=>a.start-b.start);
 const body=[];for(let i=0;i<=10;i++){body.push({id:uid(),t:addDays(start,7*i)+7.5*3600e3,kg:Math.round((82.6-i*0.24+(rnd()-.5)*0.6)*10)/10,bf:i%3===0?Math.round((17.8-i*0.15)*10)/10:'',waist:''})}
 const stt=emptyState();
 Object.assign(stt,{sample:true,plans:[p1,p2],activePlanId:p1.id,sessions,body,
  goals:[{id:uid(),kind:'workouts',period:'week',target:5},{id:uid(),kind:'runKm',period:'month',target:60},{id:uid(),kind:'lift',ex:'Bench Press',target:100},{id:uid(),kind:'bw',target:78,start:82.6}],
  prs:[{id:uid(),key:'r:5k',value:22*60+48,t:new Date(2025,8,14,10).getTime(),note:'From Strava'},{id:uid(),key:'r:hm',value:3600+49*60+30,t:new Date(2025,3,6,9).getTime(),note:'From Strava'},{id:uid(),key:'g:deadlift:w',exName:'Deadlift',value:160,t:new Date(2025,5,1,18).getTime(),note:''}]});
 return stt}
