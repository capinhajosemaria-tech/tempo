/* ================= brand ================= */
const APP='Tempo';
const LOGO_PATHS=(ring,acc,cy,plate)=>`<rect x="28.5" y="4" width="7" height="5" rx="1.5" fill="${ring}"/><path d="M46.2 21.8A20 20 0 1 0 52 36" fill="none" stroke="${ring}" stroke-width="5" stroke-linecap="round"/><path d="M52 36a20 20 0 0 0-5.8-14.2" fill="none" stroke="${plate}" stroke-width="9"/>${[100,130,160,190,220].map(r=>`<line x1="32" y1="36" x2="${(32+14*Math.cos(r*Math.PI/180)).toFixed(2)}" y2="${(36+14*Math.sin(r*Math.PI/180)).toFixed(2)}" stroke="${ring}" stroke-width="1.3" opacity=".5"/>`).join('')}<path d="M32 36 44 24" stroke="${acc}" stroke-width="4.4" stroke-linecap="round"/><circle cx="32" cy="36" r="4.4" fill="${acc}"/>`;
const logoSVG=(s=28)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lgb${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A1D7A"/><stop offset="1" stop-color="#0B1330"/></linearGradient><linearGradient id="lgn${s}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF5D8F"/><stop offset="1" stop-color="#FF9BC0"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#lgb${s})"/>${LOGO_PATHS('#F5F3FF',`url(#lgn${s})`,36,'rgba(92,225,230,.75)')}</svg>`;
const wordmark=`<span class="brand">${logoSVG(28)}<span>tempo<i>.</i></span></span>`;

/* ================= rendering core ================= */
function render(){
 const top=ui.stack[ui.stack.length-1];const app=$('#app');
 app.className=top?'stack':'';
 app.innerHTML=top?(VIEWS[top.v]?VIEWS[top.v](top):''):TABS[ui.tab]();
 const tabs=$('#tabs');tabs.hidden=!!top;
 tabs.innerHTML=[['home','Today','home'],['plans','Plans','plans'],['history','History','history'],['stats','Stats','stats'],['prs','PRs','pr']].map(([k,l,i])=>`<button class="tab ${ui.tab===k?'on':''}" data-act="tab" data-t="${k}" aria-current="${ui.tab===k?'page':'false'}">${ic(i,24)}<span>${l}</span></button>`).join('');
 $('#exnames').innerHTML=[...exNames().values()].sort().map(n=>`<option value="${esc(n)}"></option>`).join('');
 renderSheet();renderRest();
}
function renderSheet(){const el=$('#sheet');const s=ui.sheet;document.body.classList.toggle('locked',!!s);if(!s){el.hidden=true;el.innerHTML='';return}el.hidden=false;el.innerHTML=`<div class="sheet-bg" data-act="closeSheet"></div><div class="sheet-panel" role="dialog" aria-modal="true"><div class="grab"></div>${SHEETS[s.t](s)}</div>`}
function go(v,params){const cur=ui.stack[ui.stack.length-1];if(cur)cur.y=window.scrollY;else ui.scroll[ui.tab]=window.scrollY;ui.stack.push({v,...(params||{})});ui.sheet=null;render();window.scrollTo(0,0)}
function back(){ui.stack.pop();ui.sheet=null;render();const cur=ui.stack[ui.stack.length-1];window.scrollTo(0,cur?(cur.y||0):(ui.scroll[ui.tab]||0))}
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function topbar(title,right=''){return `<div class="topbar"><button class="tb-back" data-act="back">${ic('back',22)}<span>Back</span></button><div class="tb-title">${esc(title)}</div><div class="tb-right">${right}</div></div>`}
function seg(opts,cur,act,extra='',cls=''){return `<div class="seg ${cls}" role="tablist">${opts.map(([v,l])=>`<button class="${v===cur?'on':''}" data-act="${act}" data-val="${v}" ${extra} role="tab" aria-selected="${v===cur}">${esc(l)}</button>`).join('')}</div>`}
function imgPick(target,src,cls='cover',label='Add photo'){return `<div class="relative">${src?`<button class="iconbtn sm imgrm" data-act="rmImg" data-target="${target}" aria-label="Remove photo">${ic('x',18)}</button>`:''}<label class="imgpick ${cls} ${src?'has':''}" style="${src?`background-image:url('${src}')`:''}">${ic('cam',20)}${cls==='cover'?`<span>${label}</span>`:''}<input type="file" accept="image/*" data-img="${target}" aria-label="${label}"></label></div>`}
const sw=(on,act,attrs,label)=>`<button class="switch ${on?'on':''}" data-act="${act}" ${attrs} role="switch" aria-checked="${!!on}"><span>${label}</span><span class="knob"></span></button>`;
const navRow=(v,icon,title,sub,extra='')=>`<button class="li" data-act="go" data-v="${v}">${`<span class="lt" style="--c:var(--accent)">${ic(icon,19)}</span>`}<span class="grow"><span class="t">${title}</span><span class="s">${sub}</span></span>${extra}<span class="chev">${ic('chev',20)}</span></button>`;

/* ================= HOME ================= */
function weekBars(kind){const now=weekStart(Date.now());const vals=[];for(let i=11;i>=0;i--){const a=addDays(now,-7*i);const ss=sessionsIn(a,addDays(a,7));vals.push(kind==='count'?ss.length:ss.reduce((t,s)=>t+(kind==='run'?sMetrics(s).rd:sMetrics(s).bd),0))}
 const max=Math.max(1,...vals),W=300,H=40,bw=W/12;
 return `<svg class="viz" viewBox="0 0 ${W} ${H+14}" aria-hidden="true">${vals.map((v,i)=>{const h=Math.max(3,v/max*H);return `<rect x="${(i*bw+2).toFixed(1)}" y="${(H-h).toFixed(1)}" width="${(bw-4).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="currentColor" opacity="${v?(i===11?1:.45):.15}"/>`}).join('')}<text x="0" y="${H+12}" fill="currentColor" opacity=".7" style="font-size:10px">12 weeks ago</text><text x="${W}" y="${H+12}" text-anchor="end" fill="currentColor" opacity=".7" style="font-size:10px">This week</text></svg>`}
function dayDots(){const d=trainedDays();const t0=sod(Date.now());let h='';const W=300,n=14,step=W/n;for(let i=0;i<n;i++){const t=addDays(t0,-(n-1-i));const on=d.has(ymd(t));h+=`<circle cx="${(i*step+step/2).toFixed(1)}" cy="12" r="${on?8:4.5}" fill="currentColor" opacity="${on?1:.25}"/><text x="${(i*step+step/2).toFixed(1)}" y="36" text-anchor="middle" fill="currentColor" opacity=".7" style="font-size:9.5px">${'MTWTFSS'[(new Date(t).getDay()+6)%7]}</text>`}return `<svg class="viz" viewBox="0 0 ${W} 40" aria-hidden="true">${h}</svg>`}
function featValue(f){f=f||{k:'weekStreak'};const now=Date.now();
 switch(f.k){
  case 'month':{const n=sessionsIn(monthStart(now),Infinity).length;return{label:'Workouts this month',big:n,unit:n===1?'workout':'workouts',sub:fmtDate(now,{month:'long',year:'numeric'}),viz:weekBars('count')}}
  case 'week':{const n=sessionsIn(weekStart(now),Infinity).length;return{label:'Workouts this week',big:n,unit:n===1?'workout':'workouts',sub:'Since Monday',viz:weekBars('count')}}
  case 'year':{const y=new Date(new Date().getFullYear(),0,1).getTime();const n=sessionsIn(y,Infinity).length;return{label:'Workouts this year',big:n,unit:n===1?'workout':'workouts',sub:String(new Date().getFullYear()),viz:weekBars('count')}}
  case 'dayStreak':{const n=dayStreak();return{label:'Day streak',big:n,unit:n===1?'day':'days',sub:'Consecutive days with a workout',viz:dayDots()}}
  case 'runMonth':{const v=sessionsIn(monthStart(now),Infinity).reduce((t,s)=>t+sMetrics(s).rd,0);return{label:'Running this month',big:fmtNum(v,1),unit:'km',sub:fmtDate(now,{month:'long',year:'numeric'}),viz:weekBars('run')}}
  case 'bikeMonth':{const v=sessionsIn(monthStart(now),Infinity).reduce((t,s)=>t+sMetrics(s).bd,0);return{label:'Cycling this month',big:fmtNum(v,0),unit:'km',sub:fmtDate(now,{month:'long',year:'numeric'}),viz:weekBars('bike')}}
  case 'pr':{const r=computePRs()[f.key];if(!r||!r.best)return{label:'Personal record',big:'—',unit:'',sub:'No record yet for this one'};const[b,u]=prBig(r.unit,r.best.value);return{label:(r.ex?r.ex+' · ':'')+r.label,big:b,unit:u,sub:'Set on '+fmtDateY(r.best.t)+(r.best.src==='manual'?' · added by you':''),viz:''}}
  default:{const n=weekStreak();return{label:'Week streak',big:n,unit:n===1?'week':'weeks',sub:'Weeks in a row with at least one workout',viz:weekBars('count')}}
 }}
function weekStrip(){const now=Date.now(),ws=weekStart(now);const ss=sessionsIn(ws,Infinity);const m=ss.reduce((a,s)=>{const q=sMetrics(s);a.km+=q.rd+q.bd;a.t+=s.duration||0;return a},{km:0,t:0});
 let cols='';for(let i=0;i<7;i++){const t=addDays(ws,i);const day=sessionsIn(t,addDays(t,1));const today=ymd(t)===ymd(now);cols+=`<div class="wday ${today?'today':''} ${t>now?'future':''}"><span class="wl">${'MTWTFSS'[i]}</span><span class="wn">${new Date(t).getDate()}</span><span class="wdots">${day.map(s=>`<i style="--c:var(--${typeKey(s)})"></i>`).join('')||'<i class="none"></i>'}</span></div>`}
 return `<div class="card" style="gap:10px"><div class="sec" style="margin:0"><div class="h3">This week</div><span class="muted sm num">${plural(ss.length,'workout')}${m.km?` · ${fmtNum(m.km,1)} km`:''}${m.t?` · ${fmtHM(m.t)}`:''}</span></div><div class="week">${cols}</div></div>`}
function goalTile(g){const p=goalProgress(g);const col=p.pct>=1?'var(--ok)':'var(--accent)';return `<div class="goal"><div class="ring">${ringSVG(p.pct,col)}<b>${p.pct>=1?ic('check',22):Math.round(p.pct*100)+'%'}</b></div><span class="gl1">${esc(goalTitle(g))}</span><span class="gl2">${esc(p.label)}</span></div>`}
function goalsCard(){if(!S.goals.length)return '';return `<div class="card"><div class="sec" style="margin:0"><div class="h3">Goals</div><button class="btn ghost sm" data-act="go" data-v="goals">Edit</button></div><div class="goals">${S.goals.map(goalTile).join('')}</div></div>`}
function wtile(p,w,i,done){return `<button class="wtile ${done?'done':''}" style="--c:var(--${typeKey(w)})" data-act="startW" data-pid="${p.id}" data-wid="${w.id}"><span class="lt s">${letter(i)}</span><span class="grow"><b>${esc(w.name||'Untitled')}</b><small>${ic(typeKey(w),13)}${esc(typeLabel(w))}</small></span>${done?`<span class="ck">${ic('check',14)}</span>`:''}</button>`}
function planCard(p){
 if(!p)return `<div class="card"><div class="h2">No active plan</div><p class="muted sm">Create a plan and its workouts will show up here, ready to start.</p><button class="btn primary" data-act="newPlan">${ic('plus',18)} New plan</button></div>`;
 const extras=countNames(weekExtras(p,weekStart(Date.now())).map(s=>s.name));
 const extraHTML=extras.length?`<div class="extra-line">Also this week: ${extras.map(n=>`<span class="pill" style="--c:var(--other)">${esc(n)}</span>`).join('')}</div>`:'';
 if(p.mode==='week'){const done=weekDone(p,weekStart(Date.now()));const n=p.workouts.length;const dc=p.workouts.filter(w=>done.has(w.id)).length;const left=6-(new Date().getDay()+6)%7;const rest=Math.max(0,7-n);
  return `<div class="card"><div class="sec" style="margin:0"><div class="eyebrow">${esc(p.name)} · Weekly</div><span class="muted xs">${left===0?'Last day of the week':`${plural(left,'day')} left`}</span></div>
  <div class="pc-title num">${dc} of ${n} done</div>
  <div class="segbar">${p.workouts.map(w=>`<i class="${done.has(w.id)?'on':''}" style="--c:var(--${typeKey(w)})"></i>`).join('')}</div>
  ${n?`<div class="wgrid">${p.workouts.map((w,i)=>wtile(p,w,i,done.has(w.id))).join('')}</div>`:`<p class="muted sm">This plan has no workouts yet.</p>`}
  ${extraHTML}<p class="muted xs">${plural(n,'workout')}${rest?` · ${plural(rest,'rest day')}`:''} per week. Tap one to start it.</p></div>`}
 const cd=seqDay(p);
 if(!cd)return `<div class="card"><div class="eyebrow">${esc(p.name)} · Sequential</div><p class="muted sm">Add days to this plan to start the cycle.</p><button class="btn" data-act="go" data-v="plan" data-id="${p.id}">Edit plan</button></div>`;
 const isRest=!cd.day.w.length;const dn=p.seqDone||[];const nx=(cd.i+1)%cd.n;
 return `<div class="card"><div class="sec" style="margin:0"><div class="eyebrow">${esc(p.name)} · Sequential</div><span class="muted xs num">Day ${cd.i+1} of ${cd.n}</span></div>
 <div class="pc-title">${esc(dayLabel(p,cd.i))} · ${esc(isRest?'Rest':dayDesc(p,cd.i))}</div>
 <div class="segbar">${p.days.map((d,i)=>`<i class="${i<cd.i?'on':''}" style="${i===cd.i?'background:var(--fg)':''}"></i>`).join('')}</div>
 ${isRest?`<p class="muted sm">Rest day. Mark it done to move the plan on.</p><button class="btn primary" data-act="seqRest">${ic('check',18)} Mark rest day done</button>`:
 `<div class="wgrid">${cd.day.w.map(id=>{const w=wkOf(p,id);return w?wtile(p,w,p.workouts.indexOf(w),dn.includes(id)):''}).join('')}</div>
  <div class="btnrow"><button class="btn sm" data-act="seqSkip" data-confirm="Tap again to skip">Skip day</button><button class="btn sm" data-act="seqComplete">Mark day done</button></div>`}
 ${extraHTML}<p class="muted xs">Next: ${esc(dayLabel(p,nx))} · ${esc(dayDesc(p,nx))}. The plan moves on when you log the day.</p></div>`}
function vHome(){
 const now=Date.now();const f=featValue(S.settings.featured);const big=String(f.big);const last=S.sessions[S.sessions.length-1];
 const needBackup=!S.sample&&!S.sync.token&&S.sessions.length>=3&&(!S.lastBackup||now-S.lastBackup>14*DAY);
 const pend=S.strava.pending.length;
 return `<header class="hdr"><div>${wordmark}<div class="eyebrow" style="margin-top:12px">${fmtDate(now,{weekday:'long',day:'numeric',month:'long'})}</div><h1 class="h1">Today</h1></div><div class="tools">${S.sync.token?`<button class="iconbtn" data-act="syncNow" aria-label="Sync now" title="${esc(syncLabel())}" style="color:${S.sync.err?'var(--bad)':'var(--ok)'}">${ic('sync',20)}</button>`:''}<button class="iconbtn" data-act="go" data-v="settings" aria-label="Settings">${ic('gear')}</button></div></header>
 ${S.sample?`<div class="banner"><div><b>This is sample data.</b><br><span class="muted">Look around, then clear it and add your own plans.</span></div><button class="btn sm primary" data-act="startFresh" data-confirm="Tap again to clear">Start fresh</button></div>`:''}
 ${S.active?`<button class="live" data-act="openSession"><span class="pulse"></span><span class="grow"><b>${esc(S.active.name)}</b><br><span class="sm">${S.active.past?'Logging a workout':'In progress · <span id="timer2" class="num">'+fmtDur((now-S.active.start)/1000)+'</span>'}</span></span><b>Resume</b></button>`:''}
 ${pend?`<button class="card" style="flex-direction:row;align-items:center;width:100%" data-act="go" data-v="sinbox"><span class="lt" style="--c:var(--accent)">${ic('sync',19)}</span><span style="flex:1;min-width:0"><b>${plural(pend,'new activity')} from Strava</b><br><span class="muted sm">Choose which plan workout each one counts as</span></span><span class="chev">${ic('chev',20)}</span></button>`:''}
 <button class="feat" data-act="featSheet" aria-label="Change highlighted statistic">${plateSVG}<span class="feat-edit">Change</span><span class="eyebrow">${esc(f.label)}</span><span class="feat-num ${big.length>5?'long':''}">${esc(big)}${f.unit?`<span class="feat-unit">${esc(f.unit)}</span>`:''}</span><span class="feat-sub">${esc(f.sub)}</span>${f.viz||''}</button>
 <button class="btn primary xl" data-act="startSheet">${ic('play',20)} Start workout</button>
 ${weekStrip()}
 ${planCard(activePlan())}
 ${goalsCard()||`<button class="card" style="flex-direction:row;align-items:center;width:100%" data-act="go" data-v="goals"><span class="lt" style="--c:var(--other)">${ic('target',19)}</span><span style="flex:1"><b>Set a goal</b><br><span class="muted sm">Weekly workouts, monthly km, a lift or a body weight</span></span><span class="chev">${ic('chev',20)}</span></button>`}
 ${last?`<div class="sec"><div class="h2">Last workout</div><button class="btn ghost sm" data-act="tab" data-t="history">History</button></div><div class="list">${sessionRow(last)}</div>`:''}
 ${needBackup?`<div class="card"><b>Keep a copy of your data</b><p class="muted sm">Your workouts live only on this phone. Turn on sync to keep them on your other devices too, or save a backup file.</p><div class="btnrow"><button class="btn primary" data-act="go" data-v="sync">Turn on sync</button><button class="btn" data-act="go" data-v="settings">Backup</button></div></div>`:''}`}

/* ================= PLANS ================= */
function vPlans(){
 return `<header class="hdr"><div><div class="eyebrow">${plural(S.plans.length,'plan')}</div><h1 class="h1">Plans</h1></div><button class="iconbtn" data-act="newPlan" aria-label="New plan">${ic('plus')}</button></header>
 ${S.plans.length?S.plans.map(p=>`<button class="plancard" data-act="go" data-v="plan" data-id="${p.id}">${p.img?`<div class="cover" style="background-image:url('${p.img}')"></div>`:''}<div class="body"><div style="flex:1;min-width:0"><div class="h2">${esc(p.name||'Untitled plan')}</div><div class="muted sm">${p.mode==='week'?'Weekly':'Sequential'} · ${plural(p.workouts.length,'workout')}${p.mode==='seq'?` · ${p.days.length}-day cycle`:''}</div><div class="types">${p.workouts.map(w=>`<i style="--c:var(--${typeKey(w)})"></i>`).join('')}</div></div>${p.id===S.activePlanId?'<span class="badge">Active</span>':''}<span class="chev">${ic('chev',20)}</span></div></button>`).join(''):
 `<div class="card"><div class="h2">No plans yet</div><p class="muted sm">A plan holds your workouts. Weekly plans let you do any workout on any day and tally the week at the end. Sequential plans move through days in order as you log them.</p><button class="btn primary" data-act="newPlan">${ic('plus',18)} New plan</button></div>`}`}
function vPlanV2({id}){const p=planById(id);if(!p)return topbar('Plan')+'<p class="muted">This plan was deleted.</p>';
 const n=p.workouts.length;const cd=seqDay(p);
 return `${topbar(p.name||'Plan')}
 ${imgPick('plan|'+p.id,p.img,'cover','Add cover photo')}
 <label class="field"><span>Plan name</span><input class="in big" id="pn-${p.id}" value="${esc(p.name)}" data-b="p|${p.id}|name" placeholder="e.g. Hybrid Week" autocomplete="off"></label>
 <div class="field"><span>How the plan moves</span>${seg([['week','Weekly'],['seq','Sequential']],p.mode,'setMode',`data-id="${p.id}"`)}</div>
 <p class="hint">${p.mode==='week'?`Do any of these workouts on any day. At the end of each week (Mon–Sun) the app records what you did and what you missed. <b>${plural(n,'workout')} · ${plural(Math.max(0,7-n),'rest day')}</b> per week.`:'Days run in order. The plan moves to the next day only when you log the current one: a finished workout, a rest day, or a skip.'}</p>
 <div class="sec"><div class="h2">Workouts</div><button class="btn ghost sm" data-act="addWorkout" data-id="${p.id}">${ic('plus',18)} Add</button></div>
 ${n?`<div class="list">${p.workouts.map((w,i)=>`<button class="li" data-act="go" data-v="workout" data-pid="${p.id}" data-wid="${w.id}">${w.img?`<span class="thumb" style="background-image:url('${w.img}')"></span>`:`<span class="lt" style="--c:var(--${typeKey(w)})">${letter(i)}</span>`}<span class="grow"><span class="t">${esc(w.name||'Untitled workout')}</span><span class="s">${esc(typeLabel(w))} · ${plural(w.exercises.length,'exercise')}</span></span><span class="chev">${ic('chev',20)}</span></button>`).join('')}</div>`:`<div class="card"><p class="muted sm">No workouts yet. Add one for each session in your week, like Push, Pull, Legs or Intervals.</p></div>`}
 ${p.mode==='seq'?`<div class="sec"><div class="h2">Cycle</div><button class="btn ghost sm" data-act="addDay" data-id="${p.id}">${ic('plus',18)} Add day</button></div>
 <div class="card">${p.days.length?p.days.map((d,i)=>`<div class="dayrow"><div class="top"><span class="daynum ${cd&&cd.i===i?'cur':''}">Day ${i+1}</span><input class="in" id="dl-${p.id}-${i}" value="${esc(d.label)}" placeholder="${d.w.length?'Name (optional)':'Rest day'}" data-b="d|${p.id}|${i}|label" autocomplete="off"><button class="xbtn" data-act="rmDay" data-id="${p.id}" data-i="${i}" aria-label="Remove day ${i+1}">${ic('x',18)}</button></div>
  ${n?`<div class="chips">${p.workouts.map((w,j)=>`<button class="wchip ${d.w.includes(w.id)?'sel':''}" style="--c:var(--${typeKey(w)})" data-act="toggleDayW" data-id="${p.id}" data-i="${i}" data-wid="${w.id}" aria-pressed="${d.w.includes(w.id)}"><span class="lt s">${letter(j)}</span>${esc(w.name)}</button>`).join('')}</div>`:''}
  ${d.w.length?'':'<span class="muted xs">No workouts selected, so this is a rest day.</span>'}</div>`).join(''):'<p class="muted sm">Add days to build the cycle, then pick the workouts for each one.</p>'}</div>
 ${p.days.length?`<label class="field"><span>Current day</span><select class="in" id="sp-${p.id}" data-b="p|${p.id}|seqPos" data-t="int" data-rr="1">${p.days.map((d,i)=>`<option value="${i}" ${cd&&cd.i===i?'selected':''}>Day ${i+1} · ${esc(dayDesc(p,i))}</option>`).join('')}</select></label>`:''}`:''}
 <div class="btnrow" style="margin-top:8px">${p.id!==S.activePlanId?`<button class="btn primary" data-act="setActive" data-id="${p.id}">Make active plan</button>`:'<span class="btn" style="background:transparent;color:var(--muted)">This is your active plan</span>'}</div>
 <div class="btnrow"><button class="btn" data-act="dupPlan" data-id="${p.id}">Duplicate</button><button class="btn danger" data-act="delPlan" data-id="${p.id}" data-confirm="Tap again to delete">Delete plan</button></div>`}

/* --- exercise template editor --- */
function stepRow(e,b,s,path,cat){
 const vAttr=s.by==='dist'?(cat==='bike'?`value="${plain(num(s.v)/1000,2)}" data-t="km2m" inputmode="decimal" placeholder="km"`:`value="${esc(s.v)}" data-t="num" inputmode="numeric" placeholder="metres"`):`value="${esc(fmtDur(s.v))}" data-t="dur" placeholder="mm:ss"`;
 return `<div class="step" style="--k:${kindColor(s.kind,cat)}"><div class="steptop"><span class="kdot"></span><select class="in sm" id="sk-${s.id}" data-b="st|${b}|${path}|kind" data-rr="1">${Object.keys(KINDS).map(k=>`<option value="${k}" ${s.kind===k?'selected':''}>${kindLabel(k,cat)}</option>`).join('')}</select>${seg([['dist','Distance'],['time','Time']],s.by,'stepBy',`data-b="${b}" data-path="${path}"`,'mini')}<button class="xbtn" data-act="stepRm" data-b="${b}" data-path="${path}" aria-label="Remove step">${ic('x',16)}</button></div>
 <div class="grid2"><label class="field"><span>${s.by==='dist'?(cat==='bike'?'Distance (km)':'Distance (m)'):'Duration'}</span><input class="in sm" id="sv-${s.id}" ${vAttr} data-b="st|${b}|${path}|v" data-pf="${e.id}"></label><label class="field"><span>${cat==='run'?'Target pace /km':'Target'}</span><input class="in sm" id="sg-${s.id}" value="${esc(s.tgt)}" data-b="st|${b}|${path}|tgt" data-pf="${e.id}" placeholder="${cat==='run'?(s.kind==='rec'?'optional':'4:00-4:10'):'Zone 3, 250 W'}" autocomplete="off"></label></div></div>`}
function stepsEditor(e,b,cat){
 const rows=e.steps.map((s,i)=>s.kind==='repeat'?`<div class="repeat" style="--c:var(--${cat})"><div class="steptop">${ic('repeat',18)}<b>Repeat</b><input class="in sm num" style="width:64px;text-align:center" id="rn-${s.id}" inputmode="numeric" value="${esc(s.n)}" data-b="st|${b}|${i}|n" data-t="int" data-pf="${e.id}"><span class="muted sm" style="flex:1">times</span><button class="xbtn" data-act="stepRm" data-b="${b}" data-path="${i}" aria-label="Remove block">${ic('x',16)}</button></div>${(s.steps||[]).map((c,j)=>stepRow(e,b,c,i+'.'+j,cat)).join('')}<button class="btn sm" data-act="stepAdd" data-b="${b}" data-parent="${i}">${ic('plus',16)} Step in block</button></div>`:stepRow(e,b,s,String(i),cat)).join('');
 return `${profileBlock(e,cat,e.id)}
 <div class="field"><span>Start from a template</span><div class="presets">${PRESETS[cat].map((p,k)=>`<button class="tchip" data-act="preset" data-b="${b}" data-k="${k}">${esc(p[0])}</button>`).join('')}</div></div>
 ${rows}
 <div class="btnrow"><button class="btn sm" data-act="stepAdd" data-b="${b}">${ic('plus',16)} Step</button><button class="btn sm" data-act="addRepeat" data-b="${b}">${ic('repeat',16)} Repeat block</button></div>
 <p class="hint">${cat==='run'?'Paces accept one value like <b>4:05</b> or a range like <b>4:00-4:10</b>. Bars grow taller as the target pace gets faster.':'Targets are free text, like <b>Zone 3</b>, <b>250 W</b> or <b>32 km/h</b>.'}</p>`}
function extrasPicker(cat,list,act,attrs){return `<div class="field"><span>Also record</span><div class="chips">${EXTRA_FOR[cat].map(k=>`<button class="tchip ${list.includes(k)?'on':''}" data-act="${act}" ${attrs} data-k="${k}" aria-pressed="${list.includes(k)}">${list.includes(k)?ic('check',14):''}${EXTRAS[k][0]}</button>`).join('')}</div></div>`}
function customEditor(list,bindPrefix,act,attrs){return `<div class="field"><span>Custom fields</span>${list.map((c,i)=>`<div class="cfrow"><input class="in sm" id="cl-${c.id}" value="${esc(c.label)}" placeholder="Name, e.g. Result" data-b="${bindPrefix}|${i}|label" autocomplete="off"><input class="in sm" id="cu-${c.id}" value="${esc(c.unit)}" placeholder="unit" data-b="${bindPrefix}|${i}|unit" autocomplete="off"><select class="in sm" id="ck-${c.id}" data-b="${bindPrefix}|${i}|kind">${[['num','Number'],['time','Time'],['text','Text']].map(([k,l])=>`<option value="${k}" ${c.kind===k?'selected':''}>${l}</option>`).join('')}</select><button class="xbtn" data-act="${act}Rm" ${attrs} data-i="${i}" aria-label="Remove field">${ic('x',16)}</button></div>`).join('')}<button class="btn sm" data-act="${act}Add" ${attrs}>${ic('plus',16)} Add custom field</button></div>`}
function tplDerived(e){const d=num(e.dist),t=num(e.time);const pr=e.cat==='run'?parsePace(e.tgt):null;
 if(e.cat==='run'){if(d>0&&t>0)return `<span>Pace needed</span><b>${fmtDur(t/d)} /km</b>`;if(d>0&&pr)return `<span>Estimated time</span><b>${fmtDur(d*pr[0])}${pr[0]!==pr[1]?'–'+fmtDur(d*pr[1]):''}</b>`;if(t>0&&pr)return `<span>Estimated distance</span><b>${fmtNum(t/pr[1],1)}–${fmtNum(t/pr[0],1)} km</b>`;return `<span>Add a distance with a pace or a time</span><b>—</b>`}
 if(d>0&&t>0)return `<span>Average speed needed</span><b>${fmtNum(d/(t/3600),1)} km/h</b>`;return `<span>Add a distance and time for the speed needed</span><b>—</b>`}
function tplExCardV2(p,w,e,i,n){const b=`${p.id}|${w.id}|${e.id}`;const cat=e.cat;let body='';
 if(cat==='gym'){let wn=0;body=`<div class="setgrid tpl"><span class="hd">Set</span><span class="hd">${e.bw?'+kg':'kg'}</span><span class="hd">Reps</span><span class="hd">Tag</span><span></span>
  ${(e.sets||[]).map((z,k)=>`<span class="n ${z.t==='w'?'w':''}">${z.t==='w'?'W':++wn}</span><input class="in" id="tw-${e.id}-${k}" inputmode="decimal" value="${esc(z.w)}" placeholder="${e.bw?'BW':'kg'}" data-b="ts|${b}|${k}|w" data-t="num"><input class="in" id="tr-${e.id}-${k}" inputmode="numeric" value="${esc(z.r)}" placeholder="${z.t==='f'?'max':'reps'}" data-b="ts|${b}|${k}|r" data-t="num"><button class="tag ${z.t}" data-act="tplTag" data-b="${b}" data-k="${k}" aria-label="Set type">${TAGL[z.t]}</button><button class="xbtn" data-act="tplRmSet" data-b="${b}" data-k="${k}" aria-label="Remove set">${ic('x',16)}</button>`).join('')}</div>
  <button class="btn sm" data-act="tplAddSet" data-b="${b}">${ic('plus',16)} Add set</button><p class="hint">Each set has its own weight and reps. Tap the tag to mark <b>W</b> warm-up, <b>F</b> to failure or <b>D</b> drop set. Warm-ups don't count towards records or volume.</p>`}
 else if(cat==='run'||cat==='bike'){body=`${seg([['steady','Steady'],['struct','Intervals']],e.mode,'tplMode',`data-b="${b}"`)}
  ${e.mode==='struct'?stepsEditor(e,b,cat):`<div class="grid2"><label class="field"><span>Target distance (km)</span><input class="in" id="td-${e.id}" inputmode="decimal" value="${esc(e.dist)}" data-b="e|${b}|dist" data-t="num" data-ed="${e.id}" placeholder="optional"></label><label class="field"><span>Target time</span><input class="in" id="tt-${e.id}" value="${esc(fmtDur(e.time))}" data-b="e|${b}|time" data-t="dur" data-ed="${e.id}" placeholder="h:mm:ss"></label></div>
  <label class="field"><span>${cat==='run'?'Target pace /km':'Target'}</span><input class="in" id="tp-${e.id}" value="${esc(e.tgt)}" data-b="e|${b}|tgt" data-ed="${e.id}" placeholder="${cat==='run'?'5:30 or 5:20-5:40':'Zone 2, 28 km/h, 200 W'}" autocomplete="off"></label>
  <div class="derived" data-edv="${e.id}">${tplDerived(e)}</div>`}`}
 else{body=`<label class="field"><span>Target time</span><input class="in" id="tt-${e.id}" value="${esc(fmtDur(e.time))}" data-b="e|${b}|time" data-t="dur" placeholder="minutes or h:mm:ss"></label><label class="field"><span>Description</span><textarea class="in" id="tx-${e.id}" data-b="e|${b}|desc" placeholder="What to do">${esc(e.desc)}</textarea></label>`}
 const mg=e.mg||guessMG(e.name);
 const opts=`<details class="opts" data-open="${e.id}" ${ui.open.has(e.id)?'open':''}><summary>${ic('chev',16)} More options</summary><div class="inner">
  ${cat==='gym'?`<div class="grid2"><label class="field"><span>Rest between sets</span><input class="in" id="rs-${e.id}" value="${esc(fmtDur(e.rest))}" data-b="e|${b}|rest" data-t="dur" placeholder="1:30"></label><label class="field"><span>Weight step (kg)</span><input class="in" id="ri-${e.id}" inputmode="decimal" value="${esc(e.inc)}" data-b="e|${b}|inc" data-t="num" placeholder="${fmtNum(S.settings.inc,2)}"></label></div>
  ${sw(e.prog!==false&&!e.bw,'tplProg',`data-b="${b}"`,'Suggest heavier weights when I hit every target')}
  ${sw(e.bw,'tplBW',`data-b="${b}"`,'Bodyweight exercise')}
  <div class="field"><span>Muscle group${!e.mg&&mg?' · guessed from the name':''}</span><div class="chips">${Object.entries(MG).map(([k,l])=>`<button class="tchip ${mg===k?'on':''}" data-act="tplMG" data-b="${b}" data-k="${k}">${l}</button>`).join('')}</div></div>`:''}
  <label class="field"><span>Notes and cues</span><textarea class="in" id="nc-${e.id}" data-b="e|${b}|notes" placeholder="${cat==='gym'?'e.g. Pause at the bottom, 3-1-1 tempo':'e.g. Flat route, keep cadence high'}">${esc(e.notes)}</textarea></label>
  ${extrasPicker(cat,e.extra,'tplExtra',`data-b="${b}"`)}
  ${customEditor(e.custom,'cf|'+b,'tplCf',`data-b="${b}"`)}
 </div></details>`;
 return `<div class="excard"><div class="exhead">${imgPick('ex|'+b,e.img,'small','Exercise photo')}<div class="grow"><input class="in" id="en-${e.id}" value="${esc(e.name)}" placeholder="Exercise name" list="exnames" data-b="e|${b}|name" autocomplete="off" style="font-weight:650"><select class="in sm" id="ec-${e.id}" data-b="e|${b}|cat" data-rr="1">${Object.entries(CAT).map(([k,l])=>`<option value="${k}" ${cat===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
 ${body}${opts}
 <div class="tools" style="justify-content:space-between"><div class="tools"><button class="iconbtn sm" data-act="tplMove" data-b="${b}" data-d="-1" ${i===0?'disabled style="opacity:.35"':''} aria-label="Move up">${ic('up',18)}</button><button class="iconbtn sm" data-act="tplMove" data-b="${b}" data-d="1" ${i===n-1?'disabled style="opacity:.35"':''} aria-label="Move down">${ic('down',18)}</button></div><button class="btn sm danger" data-act="tplRmEx" data-b="${b}" data-confirm="Tap again">Remove exercise</button></div></div>`}
function vWorkoutV2({pid,wid}){const p=planById(pid),w=wkOf(p,wid);if(!w)return topbar('Workout')+'<p class="muted">This workout was deleted.</p>';
 return `${topbar(w.name||'Workout')}
 ${imgPick('wk|'+p.id+'|'+w.id,w.img,'cover','Add workout photo')}
 <label class="field"><span>Workout name</span><input class="in big" id="wn-${w.id}" value="${esc(w.name)}" data-b="w|${p.id}|${w.id}|name" placeholder="e.g. Push" autocomplete="off"></label>
 <div class="field"><span>Type</span>${seg([['gym','Gym'],['run','Running'],['bike','Cycling'],['other','Other'],['custom','Custom']],w.type,'setWType',`data-pid="${p.id}" data-wid="${w.id}"`)}</div>
 ${w.type==='custom'?`<label class="field"><span>Custom type name</span><input class="in" id="wc-${w.id}" value="${esc(w.customName)}" data-b="w|${p.id}|${w.id}|customName" placeholder="e.g. Swimming, Mobility, Padel" autocomplete="off"></label>`:''}
 <div class="sec"><div class="h2">Exercises</div><span class="muted sm">${w.exercises.length}</span></div>
 ${w.exercises.map((e,i)=>tplExCard(p,w,e,i,w.exercises.length)).join('')}
 <button class="btn block" data-act="tplAddEx" data-pid="${p.id}" data-wid="${w.id}">${ic('plus',18)} Add exercise</button>
 <p class="hint">Each exercise can be Gym (sets, reps, weight), Running or Cycling (steady or intervals) or Other (time and notes). More options holds rest times, weight suggestions, muscle groups, cues, heart rate, effort and your own fields.</p>
 <button class="btn danger block" data-act="delWorkout" data-pid="${p.id}" data-wid="${w.id}" data-confirm="Tap again to delete">Delete workout</button>`}

/* ================= SESSION ================= */
function blankEx(name,cat){const x={id:uid(),name,cat,ref:null,tgt:null,notes:'',rest:cat==='gym'?90:'',bw:false,extra:[],custom:[],vals:{},mg:cat==='gym'?guessMG(name):''};if(cat==='gym')x.sets=[{w:'',r:'',t:'',d:false},{w:'',r:'',t:'',d:false},{w:'',r:'',t:'',d:false}];else{x.dist='';x.time='';x.elev='';x.desc=''}return x}
function exFromTpl(e,ref){const last=lastEx(e.name,e.cat);const x={id:uid(),name:e.name,cat:e.cat,ref,tgt:null,notes:e.notes||'',rest:e.rest,bw:!!e.bw,extra:[...(e.extra||[])],custom:clone(e.custom||[]),vals:{},mg:e.cat==='gym'?(e.mg||guessMG(e.name)):''};
 if(e.cat==='gym'){const t=(e.sets&&e.sets.length)?e.sets:[{r:'',w:'',t:''}];x.tgt=t.map(z=>({r:z.r,w:z.w,t:z.t||''}));x.sets=t.map((z,i)=>{const l=last&&last.sets&&last.sets[i];const same=l&&l.t===(z.t||'');return{w:same&&l.w!==''?l.w:z.w,r:same&&l.r!==''?l.r:z.r,t:z.t||'',d:false}});const pg=progression(e);if(pg&&pg.hit)x.sug=pg}
 else{x.dist='';x.time='';x.elev='';x.desc=e.cat==='other'?(e.desc||''):'';x.tgt={dist:e.dist,time:e.time,pace:e.tgt};
  if((e.cat==='run'||e.cat==='bike')&&e.mode==='struct'&&e.steps.length){x.flat=flatSteps(e.steps);x.splits=x.flat.map(()=>({t:'',m:''}))}}
 return x}
function newSession(p,w,past){return{id:uid(),start:past?Date.now()-3600e3:Date.now(),planId:p.id,workoutId:w.id,name:w.name||'Workout',type:w.type,customName:w.customName,notes:'',past:!!past,duration:past?3600:'',ex:w.exercises.map(e=>exFromTpl(e,[p.id,w.id,e.id]))}}
function newAdhoc(name,cat,past){const prev=[...S.sessions].reverse().find(s=>!s.planId&&norm(s.name)===norm(name));
 const t=prev?prev.type:(cat==='other'?'custom':cat);
 const s={id:uid(),start:past?Date.now()-3600e3:Date.now(),planId:null,workoutId:null,name,type:t,customName:t==='custom'?(prev?prev.customName:name):'',notes:'',past:!!past,duration:past?3600:'',ex:[]};
 if(prev)s.ex=prev.ex.map(x=>{const n=blankEx(x.name,x.cat);n.extra=[...(x.extra||[])];n.custom=clone(x.custom||[]);n.rest=x.rest??n.rest;n.mg=x.mg||n.mg;if(x.cat==='gym')n.sets=(x.sets||[]).map(z=>({w:z.w,r:z.r,t:z.t||'',d:false}));if(x.cat==='other')n.desc=x.desc||'';return n});
 else if(cat!=='gym'){const x=blankEx(name,cat);if(cat==='other')x.extra=['rpe'];s.ex=[x]}
 return s}
function derivedHTML(x){const d=num(x.dist),t=num(x.time);
 if(x.cat==='run'){const pr=x.tgt&&parsePace(x.tgt.pace);const pace=d>0&&t>0?t/d:null;const cls=pace&&pr?(pace<pr[0]-3?'fast':pace>pr[1]+3?'slow':'ok'):'';return `<span>Pace${pr?` · target ${fmtPaceR(pr)}`:''}</span><b class="${cls}">${pace?fmtDur(pace)+' /km':'—'}</b>`}
 if(x.cat==='bike')return `<span>Average speed</span><b>${d>0&&t>0?fmtNum(d/(t/3600),1)+' km/h':'—'}</b>`;return ''}
function splitInfo(x,i){const s=x.flat[i],sp=x.splits[i];const dist=s.by==='dist'?num(s.v):num(sp.m);const time=s.by==='dist'?num(sp.t):num(s.v);if(!(dist>=20&&time>0))return '<span class="muted">—</span>';
 if(x.cat==='run'){const pace=time/(dist/1000);const pr=parsePace(s.tgt);const cls=pr?(pace<pr[0]-3?'fast':pace>pr[1]+3?'slow':'ok'):'';return `<span class="${cls}">${fmtDur(pace)}</span>`}
 return `<span>${fmtNum(dist/1000/(time/3600),1)}</span>`}
function splitSum(x){let m=0,t=0,c=0;x.flat.forEach((s,i)=>{const sp=x.splits[i];const dm=s.by==='dist'?num(s.v):num(sp.m);const tt=s.by==='dist'?num(sp.t):num(s.v);if(dm>=20&&tt>0){m+=dm;t+=tt;c++}});return{m,t,c}}
function splitSumHTML(x){const q=splitSum(x);return q.c?`From ${q.c} of ${x.flat.length} steps: <b>${fmtNum(q.m/1000,2)} km · ${fmtDur(q.t)}</b> <button class="btn sm" data-act="useSplits" data-eid="${x.id}" style="margin-left:6px">Use as totals</button>`:'Fill in the steps you ran, or just the totals.'}
function splitsBlock(x){const cat=x.cat;
 return `<div class="profile">${profileSVG(x.flat,cat)}</div><div>${x.flat.map((s,i)=>{const sp=x.splits[i];const head=kindLabel(s.kind,cat)+(s.of?` ${s.rep}/${s.of}`:'');const val=s.by==='dist'?fmtM(s.v,cat):fmtDur(s.v);
  const inp=s.by==='dist'?`<input class="in" id="spt-${x.id}-${i}" value="${esc(fmtDur(sp.t))}" placeholder="time" data-b="sp|${x.id}|${i}|t" data-t="dur" data-spl="${x.id}|${i}">`:`<input class="in" id="spm-${x.id}-${i}" inputmode="decimal" value="${cat==='bike'?plain(num(sp.m)/1000,2):esc(sp.m)}" placeholder="${cat==='bike'?'km':'metres'}" data-b="sp|${x.id}|${i}|m" data-t="${cat==='bike'?'km2m':'num'}" data-spl="${x.id}|${i}">`;
  return `<div class="split ${s.kind}"><span class="kdot" style="--k:${kindColor(s.kind,cat)}"></span><span class="lab"><b>${esc(head)} · ${val}</b><span>${s.tgt?(cat==='run'&&parsePace(s.tgt)?fmtPaceR(parsePace(s.tgt)):esc(s.tgt)):'no target'}</span></span>${inp}<span class="spd" data-spd="${x.id}|${i}">${splitInfo(x,i)}</span></div>`}).join('')}</div>
  <p class="hint" data-ssum="${x.id}">${splitSumHTML(x)}</p>`}
function lastLine(x){const l=lastEx(x.name,x.cat);if(!l)return '';
 if(x.cat==='gym')return `Last time: <b>${(l.sets||[]).map(z=>`${z.t==='w'?'W ':''}${z.w!==''&&num(z.w)>0?fmtNum(z.w,1)+'×':''}${z.r!==''?z.r:''}${z.t==='f'?'F':''}`).join(' · ')}</b>`;
 if(x.cat==='run')return `Last time: <b>${fmtNum(l.dist,2)} km in ${fmtDur(l.time)}${num(l.dist)>0&&num(l.time)>0?' · '+fmtDur(l.time/l.dist)+' /km':''}</b>`;
 if(x.cat==='bike')return `Last time: <b>${fmtNum(l.dist,1)} km in ${fmtDur(l.time)}${l.elev?` · ${l.elev} m`:''}</b>`;
 return l.time?`Last time: <b>${fmtDur(l.time)}</b>`:''}
function extrasInputs(x){const a=(x.extra||[]).map(k=>`<label class="field"><span>${EXTRAS[k][0]} <em>${extraUnit(k,x.cat)}</em></span><input class="in" id="xv-${x.id}-${k}" inputmode="decimal" value="${esc(x.vals[k]??'')}" data-b="sv|${x.id}|${k}" data-t="num"></label>`);
 const c=(x.custom||[]).map(f=>{const v=x.vals['c_'+f.id];return `<label class="field"><span>${esc(f.label||'Field')} ${f.unit?`<em>${esc(f.unit)}</em>`:''}</span><input class="in" id="xc-${x.id}-${f.id}" ${f.kind==='num'?'inputmode="decimal"':''} value="${esc(f.kind==='time'?fmtDur(v):(v??''))}" data-b="sv|${x.id}|c_${f.id}" data-t="${f.kind==='num'?'num':f.kind==='time'?'dur':'text'}" placeholder="${f.kind==='time'?'h:mm:ss':''}" autocomplete="off"></label>`});
 const all=[...a,...c];return all.length?`<div class="grid2">${all.join('')}</div>`:''}
function sessExCard(x){const ref=x.ref?exOf(...x.ref):null;const img=ref&&ref.img;let body='';
 if(x.cat==='gym'){const tg=x.tgt?`Target: <b>${x.tgt.map(z=>(z.t==='w'?'W ':'')+(z.t==='f'?'F':z.r||'–')+(z.w!==''&&num(z.w)>0?' @ '+fmtNum(z.w,1):'')).join(' · ')}</b>`:'';
  let wn=0;
  const sug=x.sug&&!x.sug.applied?`<div class="sug">${ic('trend',20)}<span class="grow">You hit every target last time. <b>Try ${fmtNum(x.sug.to,2)} kg</b> (+${fmtNum(x.sug.inc,2)}).</span><button class="btn sm" data-act="applySug" data-eid="${x.id}">Apply</button></div>`:'';
  body=`${sug}${tg||lastLine(x)?`<p class="hint">${[tg,lastLine(x)].filter(Boolean).join('<br>')}</p>`:''}<div class="setgrid"><span class="hd">Set</span><span class="hd">${x.bw?'+kg':'kg'}</span><span class="hd">Reps</span><span class="hd">Tag</span><span class="hd">${ic('check',14)}</span><span></span>
  ${x.sets.map((z,k)=>{const lab=z.t==='w'?'W':++wn;return `<span class="n ${z.t==='w'?'w':''}">${lab}</span><input class="in ${z.d?'dn':''}" id="sw-${x.id}-${k}" inputmode="decimal" value="${esc(z.w)}" placeholder="${x.bw?'BW':'kg'}" data-b="ss|${x.id}|${k}|w" data-t="num"><input class="in ${z.d?'dn':''}" id="sr-${x.id}-${k}" inputmode="numeric" value="${esc(z.r)}" placeholder="reps" data-b="ss|${x.id}|${k}|r" data-t="num"><button class="tag ${z.t}" data-act="sTag" data-eid="${x.id}" data-k="${k}" aria-label="Set type">${TAGL[z.t]}</button><button class="donebtn ${z.d?'on':''}" data-act="sDone" data-eid="${x.id}" data-k="${k}" aria-pressed="${!!z.d}" aria-label="Set done, start rest">${ic('check',18)}</button><button class="xbtn" data-act="sRmSet" data-eid="${x.id}" data-k="${k}" aria-label="Remove set">${ic('x',15)}</button>`}).join('')}</div>
  <div class="btnrow"><button class="btn sm" data-act="sAddSet" data-eid="${x.id}">${ic('plus',16)} Add set</button><span class="btn sm" style="background:transparent;color:var(--muted);flex:0 0 auto">${ic('timer',16)} Rest ${fmtDur(num(x.rest)||90)}</span></div>`}
 else if(x.cat==='run'||x.cat==='bike'){const t=x.tgt||{};const pr=x.cat==='run'?parsePace(t.pace):null;const tg=t.dist||t.time||t.pace?`Target: <b>${[t.dist?fmtNum(t.dist,2)+' km':'',t.time?fmtDur(t.time):'',pr?fmtPaceR(pr):t.pace||''].filter(Boolean).join(' · ')}</b>`:'';
  const hints=[x.flat?'':tg,lastLine(x)].filter(Boolean);
  body=`${hints.length?`<p class="hint">${hints.join('<br>')}</p>`:''}${x.flat?splitsBlock(x):''}<div class="grid2"><label class="field"><span>${x.flat?'Total distance (km)':'Distance (km)'}</span><input class="in big" id="sd-${x.id}" inputmode="decimal" value="${esc(x.dist)}" data-b="se|${x.id}|dist" data-t="num" data-d="${x.id}" placeholder="0.0"></label><label class="field"><span>${x.flat?'Total time':'Time'}</span><input class="in big" id="st-${x.id}" value="${esc(fmtDur(x.time))}" data-b="se|${x.id}|time" data-t="dur" data-d="${x.id}" placeholder="h:mm:ss"></label></div>
  ${x.cat==='bike'?`<label class="field"><span>Elevation gain (m)</span><input class="in" id="se-${x.id}" inputmode="numeric" value="${esc(x.elev)}" data-b="se|${x.id}|elev" data-t="num" placeholder="0"></label>`:''}
  <div class="derived" data-dv="${x.id}">${derivedHTML(x)}</div>`}
 else{body=`${lastLine(x)?`<p class="hint">${lastLine(x)}</p>`:''}<label class="field"><span>Time</span><input class="in big" id="st-${x.id}" value="${esc(fmtDur(x.time))}" data-b="se|${x.id}|time" data-t="dur" placeholder="minutes or h:mm:ss"></label><label class="field"><span>Description</span><textarea class="in" id="sx-${x.id}" data-b="se|${x.id}|desc" placeholder="What did you do?">${esc(x.desc)}</textarea></label>`}
 return `<div class="excard"><div class="exhead">${img?`<button class="thumb" style="background-image:url('${img}');width:52px;height:52px" data-act="viewImg" data-pid="${x.ref[0]}" data-wid="${x.ref[1]}" data-eid="${x.ref[2]}" aria-label="View photo"></button>`:typeBadge({type:x.cat})}<div class="grow"><input class="in" id="sn-${x.id}" value="${esc(x.name)}" data-b="se|${x.id}|name" list="exnames" placeholder="Exercise name" style="font-weight:700" autocomplete="off"></div><button class="xbtn" data-act="sRmEx" data-eid="${x.id}" data-confirm="Remove" aria-label="Remove exercise">${ic('x',18)}</button></div>
 ${x.notes?`<div class="cue">${esc(x.notes)}</div>`:''}${body}${extrasInputs(x)}
 <button class="btn sm ghost" style="align-self:flex-start" data-act="fieldSheet" data-eid="${x.id}">${ic('plus',16)} Add a field</button></div>`}
function vSession(){const a=S.active;if(!a)return topbar('Workout')+'<p class="muted">No workout in progress.</p>';
 const pl=planById(a.planId);
 return `<div class="topbar"><button class="tb-back" data-act="minimize">${ic('min',22)}<span>Hide</span></button><div class="tb-title">${a.past?(a.editId?'Edit workout':'Log workout'):`<span id="timer" class="timer">${fmtDur((Date.now()-a.start)/1000)}</span>`}</div><div class="tb-right"><button class="btn sm primary" data-act="finish">${a.editId?'Save':'Finish'}</button></div></div>
 <div><div class="eyebrow">${esc(pl?pl.name:'Off-plan activity')}</div><input class="in big" id="s-name" value="${esc(a.name)}" data-b="s|name" style="margin-top:6px" autocomplete="off"></div>
 <div class="sessionhead">${typePill(a)}<span class="muted sm">${a.past?'':'Started '+new Date(a.start).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>${!pl?'<span class="muted sm">· counts for stats and streaks, not for your plan</span>':''}</div>
 ${a.past?`<div class="grid2"><label class="field"><span>Date &amp; time</span><input class="in" id="s-dt" type="datetime-local" value="${dtLocal(a.start)}" data-b="s|start" data-t="dt"></label><label class="field"><span>Duration</span><input class="in" id="s-dur" value="${esc(fmtDur(a.duration))}" data-b="s|duration" data-t="dur" placeholder="minutes or h:mm:ss"></label></div>`:''}
 ${a.ex.map(sessExCard).join('')||'<div class="card"><p class="muted sm">No exercises yet. Add one below.</p></div>'}
 <button class="btn block" data-act="addExSheet">${ic('plus',18)} Add exercise</button>
 <label class="field"><span>Notes</span><textarea class="in" id="s-notes" data-b="s|notes" placeholder="How did it feel?">${esc(a.notes)}</textarea></label>
 <button class="btn primary xl" data-act="finish">${ic('check',20)} ${a.editId?'Save changes':'Finish & save'}</button>
 <button class="btn danger block" data-act="discard" data-confirm="Tap again to discard">${a.editId?'Cancel editing':'Discard workout'}</button>`}
function renderRest(){const el=$('#restbar');const r=ui.rest;const inSession=ui.stack[ui.stack.length-1]?.v==='session';if(!r||!inSession){el.hidden=true;return}
 const left=Math.max(0,Math.round((r.end-Date.now())/1000));el.hidden=false;el.classList.toggle('done',left===0);
 el.innerHTML=`<span class="rt">${left?fmtDur(left):'Go'}</span><span class="rl">${left?'Rest':'Rest done'}<br>${esc(r.name)}</span>${left?`<button data-act="restAdj" data-d="-15">−15</button><button data-act="restAdj" data-d="15">+15</button>`:''}<button data-act="restSkip">${left?'Skip':'Close'}</button><span class="prog" style="width:${left?(100-left/r.total*100).toFixed(1):100}%"></span>`;
 if(!left&&!r.buzzed){r.buzzed=true;try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}setTimeout(()=>{if(ui.rest===r){ui.rest=null;renderRest()}},6000)}}

/* ================= HISTORY ================= */
function sessionRow(s){return `<button class="li" data-act="go" data-v="sdetail" data-id="${s.id}">${typeBadge(s)}<span class="grow"><span class="t">${esc(s.name)}</span><span class="s">${fmtDate(s.start,{weekday:'short',day:'numeric',month:'short'})}${s.planId?'':' · off-plan'} · ${esc(sessionSummary(s)||typeLabel(s))}</span></span>${s.source==='strava'?'<span class="srcb">Strava</span>':''}<span class="chev">${ic('chev',20)}</span></button>`}
function wsumCard(w){const ex=countNames(w.extra||[]);return `<div class="wsum"><div class="top"><div class="eyebrow">Week of ${fmtDate(w.week)} · ${esc(w.planName)}</div><span class="score">${w.done.length}/${w.target}</span></div>
 <dl class="kv"><dt>Done</dt><dd>${w.done.length?w.done.map(d=>esc(d.l+' '+d.name)).join(', '):'None'}</dd><dt>Missed</dt><dd>${w.missed.length?w.missed.map(d=>esc(d.l+' '+d.name)).join(', '):'Nothing, full week'}</dd>${ex.length?`<dt>Also</dt><dd>${esc(ex.join(', '))}</dd>`:''}<dt>Days off</dt><dd>${plural(w.daysOff,'day')} without training</dd></dl></div>`}
function calendarHTML(){const m=ui.calMonth;const nm=addMonths(m,1);const start=weekStart(m);const now=Date.now();let cells='';let t=start;
 while(t<nm||(new Date(t).getDay()+6)%7!==0){const day=sessionsIn(t,addDays(t,1));const inM=t>=m&&t<nm;cells+=`<button class="cday ${day.length?'has':''} ${ymd(t)===ymd(now)?'today':''} ${ui.calDay===ymd(t)?'sel':''} ${inM?'':'out'}" data-act="calDay" data-d="${ymd(t)}"><span>${new Date(t).getDate()}</span><span class="wdots">${day.slice(0,3).map(s=>`<i style="--c:var(--${typeKey(s)})"></i>`).join('')}</span></button>`;t=addDays(t,1);if(t-start>45*DAY)break}
 const ms=sessionsIn(m,nm);const mm=ms.reduce((a,s)=>{const q=sMetrics(s);a.km+=q.rd+q.bd;a.t+=s.duration||0;return a},{km:0,t:0});
 const sel=ui.calDay?S.sessions.filter(s=>ymd(s.start)===ui.calDay):[];
 return `<div class="card"><div class="calnav"><button class="iconbtn sm" data-act="calMove" data-d="-1" aria-label="Previous month">${ic('back',18)}</button><div style="text-align:center"><div class="h3">${fmtDate(m,{month:'long',year:'numeric'})}</div><div class="muted xs num">${plural(ms.length,'workout')} · ${fmtNum(mm.km,0)} km · ${fmtHM(mm.t)}</div></div><button class="iconbtn sm" data-act="calMove" data-d="1" aria-label="Next month">${ic('chev',18)}</button></div>
 <div class="cal">${'MTWTFSS'.split('').map(d=>`<span class="hd">${d}</span>`).join('')}${cells}</div></div>
 ${ui.calDay?`<div class="sec"><div class="h3">${fmtDate(new Date(ui.calDay+'T12:00').getTime(),{weekday:'long',day:'numeric',month:'long'})}</div></div>${sel.length?`<div class="list">${sel.map(sessionRow).join('')}</div>`:'<p class="muted sm">No workouts on this day.</p>'}`:'<p class="hint">Tap a day to see its workouts.</p>'}`}
function vHistory(){
 const head=`<header class="hdr"><div><div class="eyebrow">${plural(S.sessions.length,'workout')} logged</div><h1 class="h1">History</h1></div><button class="iconbtn" data-act="logPast" aria-label="Log a past workout">${ic('plus')}</button></header>${seg([['list','List'],['cal','Calendar']],ui.histMode,'histMode')}`;
 if(ui.histMode==='cal')return head+calendarHTML();
 const items=[...S.sessions.map(s=>({t:s.start,s})),...S.weekSummaries.map(w=>({t:addDays(w.week,7)-1,w}))].sort((a,b)=>b.t-a.t);
 let out='',month='',buf='';const flush=()=>{if(buf){out+=`<div class="list">${buf}</div>`;buf=''}};
 for(const it of items){const m=fmtDate(it.t,{month:'long',year:'numeric'});if(m!==month){flush();out+=`<div class="month">${m}</div>`;month=m}if(it.s)buf+=sessionRow(it.s);else{flush();out+=wsumCard(it.w)}}
 flush();
 return head+(items.length?out:`<div class="card"><div class="h2">Nothing logged yet</div><p class="muted sm">Finished workouts appear here, with a summary at the end of each week of a weekly plan.</p></div>`)}
function extrasView(x){const items=[];for(const k of x.extra||[]){const v=x.vals&&x.vals[k];if(v!==''&&v!=null)items.push([EXTRAS[k][0],fmtNum(v,1)+' '+extraUnit(k,x.cat)])}for(const f of x.custom||[]){const v=x.vals&&x.vals['c_'+f.id];if(v!==''&&v!=null)items.push([f.label||'Field',(f.kind==='time'?fmtDur(v):f.kind==='num'?fmtNum(v,2):v)+(f.unit?' '+f.unit:'')])}
 return items.length?`<div class="metrics">${items.map(([l,v])=>`<div class="metric"><span>${esc(l)}</span><b style="font-size:17px">${esc(v)}</b></div>`).join('')}</div>`:''}
function vSDetail({id}){const s=S.sessions.find(z=>z.id===id);if(!s)return topbar('Workout')+'<p class="muted">This workout was deleted.</p>';
 const pl=planById(s.planId);const m=sMetrics(s);
 const exHTML=s.ex.map(x=>{let b='';
  if(x.cat==='gym'){let wn=0;b=`<div class="setlist">${(x.sets||[]).map(z=>`<span class="n">${z.t==='w'?'W':++wn}</span><span>${num(z.w)>0?fmtNum(z.w,1)+' kg × ':x.bw?'BW × ':''}${z.r!==''?z.r+' reps':''}${z.t==='f'?` <span class="pill" style="--c:var(--gym)">failure</span>`:z.t==='d'?` <span class="pill" style="--c:var(--other)">drop</span>`:''}</span><span class="muted sm">${z.t!=='w'&&num(z.w)>0&&num(z.r)>0?fmtNum(z.w*z.r,0)+' kg':''}</span>`).join('')}</div>`}
  else if(x.cat==='run'||x.cat==='bike'){const sp=num(x.dist)>0&&num(x.time)>0;b=`<div class="metrics"><div class="metric"><span>Distance</span><b>${fmtNum(x.dist,2)||'—'} km</b></div><div class="metric"><span>Time</span><b>${fmtDur(x.time)||'—'}</b></div><div class="metric"><span>${x.cat==='run'?'Pace':'Avg speed'}</span><b>${sp?(x.cat==='run'?fmtDur(x.time/x.dist):fmtNum(x.dist/(x.time/3600),1)):'—'}</b></div>${x.cat==='bike'?`<div class="metric"><span>Elevation</span><b>${x.elev!==''?fmtNum(x.elev,0)+' m':'—'}</b></div>`:''}</div>
   ${x.flat?`<div class="profile">${profileSVG(x.flat,x.cat)}</div><div>${x.flat.map((q,i)=>{const sp2=x.splits[i];const has=(q.by==='dist'?num(sp2.t):num(sp2.m))>0;return `<div class="split ${q.kind}" style="grid-template-columns:12px minmax(0,1fr) auto 56px"><span class="kdot" style="--k:${kindColor(q.kind,x.cat)}"></span><span class="lab"><b>${esc(kindLabel(q.kind,x.cat)+(q.of?` ${q.rep}/${q.of}`:''))} · ${q.by==='dist'?fmtM(q.v,x.cat):fmtDur(q.v)}</b><span>${q.tgt?esc(q.tgt):'no target'}</span></span><span class="num sm">${has?(q.by==='dist'?fmtDur(sp2.t):fmtM(sp2.m,x.cat)):''}</span><span class="spd">${has?splitInfo(x,i):''}</span></div>`}).join('')}</div>`:''}`}
  else{b=`<div class="metrics"><div class="metric"><span>Time</span><b>${fmtDur(x.time)||'—'}</b></div></div>${x.desc?`<p class="sm">${esc(x.desc)}</p>`:''}`}
  return `<div class="card"><div class="sec" style="margin:0"><div class="h3">${esc(x.name||'Exercise')}</div>${typePill({type:x.cat})}</div>${b}${extrasView(x)}</div>`}).join('');
 return `${topbar(s.name,`<button class="btn sm" data-act="editSession" data-id="${s.id}">Edit</button>`)}
 <div><div class="eyebrow">${fmtDate(s.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><h1 class="h1">${esc(s.name)}</h1></div>
 <div class="sessionhead">${typePill(s)}<span class="muted sm">${pl?esc(pl.name):'Off-plan'}</span>${s.source==='strava'?'<span class="srcb">From Strava</span>':''}</div>
 <div class="tiles"><div class="tile"><b class="num">${fmtHM(s.duration)}</b><span>duration</span></div><div class="tile"><b class="num">${new Date(s.start).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</b><span>start</span></div><div class="tile"><b class="num">${m.vol?fmtNum(m.vol/1000,2)+'<small>t</small>':m.rd?fmtNum(m.rd,1)+'<small>km</small>':m.bd?fmtNum(m.bd,0)+'<small>km</small>':s.ex.length}</b><span>${m.vol?'volume':m.rd||m.bd?'distance':'exercises'}</span></div></div>
 ${exHTML}
 ${s.notes?`<div class="card"><div class="eyebrow">Notes</div><p>${esc(s.notes)}</p></div>`:''}
 <button class="btn danger block" data-act="delSession" data-id="${s.id}" data-confirm="Tap again to delete">Delete workout</button>`}

/* ================= STATS ================= */
function niceMax(v,int){if(!(v>0))return int?4:1;const raw=v/4;const e=Math.pow(10,Math.floor(Math.log10(raw)));const f=raw/e;let s=(int?(f<=1?1:f<=2?2:f<=5?5:10):(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10))*e;if(int)s=Math.max(1,Math.round(s));return s*4}
function fmtAxis(v){if(Math.abs(v)>=1000)return fmtNum(v/1000,1)+'k';return fmtNum(v,Math.abs(v)<10?1:0)}
function barChart({labels,series,fmt=fmtAxis,target=null,H=170,int=false}){const n=labels.length;if(!n)return '';const W=340,L=34,R=6,T=10,B=22;
 const tot=labels.map((_,i)=>series.reduce((a,s)=>a+(+s.values[i]||0),0));const max=niceMax(Math.max(...tot,target||0),int);const pw=W-L-R,ph=H-T-B,bw=pw/n,gap=Math.max(1,Math.min(bw*0.3,8));
 let g='';for(let k=0;k<=4;k++){const y=T+ph-ph*k/4;g+=`<line x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="gl"/><text x="${L-6}" y="${(y+3.5).toFixed(1)}" class="ax" text-anchor="end">${fmt(max*k/4)}</text>`}
 let bars='';for(let i=0;i<n;i++){let y0=T+ph;const x=L+i*bw+gap/2,w=Math.max(1,bw-gap);for(const s of series){const v=+s.values[i]||0;if(!v)continue;const h=v/max*ph;bars+=`<rect x="${x.toFixed(1)}" y="${(y0-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(3,w/3).toFixed(1)}" fill="${s.color}" opacity="${i===n-1?1:.8}"/>`;y0-=h}}
 const step=Math.ceil(n/6);let xl='';for(let i=0;i<n;i++){if((n-1-i)%step)continue;xl+=`<text x="${(L+i*bw+bw/2).toFixed(1)}" y="${H-6}" class="ax" text-anchor="middle">${esc(labels[i])}</text>`}
 const tl=target?`<line x1="${L}" x2="${W-R}" y1="${(T+ph-target/max*ph).toFixed(1)}" y2="${(T+ph-target/max*ph).toFixed(1)}" class="tgt"/>`:'';
 return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">${g}${bars}${tl}${xl}</svg>`}
function lineChart({series,fmt=fmtAxis,invert=false,H=170}){const pts=series.flatMap(s=>s.pts);if(!pts.length)return '';const W=340,L=40,R=16,T=18,B=22;
 let t0=Math.min(...pts.map(p=>p.t)),t1=Math.max(...pts.map(p=>p.t));if(t1===t0){t0-=DAY*3;t1+=DAY*3}
 const lo=Math.min(...pts.map(p=>p.v)),hi=Math.max(...pts.map(p=>p.v));const pad=(hi-lo)*0.15||Math.abs(hi)*0.1||1;let v0=lo-pad,v1=hi+pad;if(lo>=0&&v0<0)v0=0;
 const pw=W-L-R,ph=H-T-B;const X=t=>L+(t-t0)/(t1-t0)*pw;const Y=v=>invert?T+(v-v0)/(v1-v0)*ph:T+ph-(v-v0)/(v1-v0)*ph;
 let g='';for(let k=0;k<=3;k++){const v=v0+(v1-v0)*k/3;const y=Y(v);g+=`<line x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="gl"/><text x="${L-6}" y="${(y+3.5).toFixed(1)}" class="ax" text-anchor="end">${fmt(v)}</text>`}
 let body='';series.forEach((s,si)=>{const p=[...s.pts].sort((a,b)=>a.t-b.t);if(!p.length)return;const d=p.map((q,i)=>`${i?'L':'M'}${X(q.t).toFixed(1)} ${Y(q.v).toFixed(1)}`).join(' ');
  if(si===0&&p.length>1){const base=invert?T:T+ph;body+=`<path d="${d} L${X(p[p.length-1].t).toFixed(1)} ${base} L${X(p[0].t).toFixed(1)} ${base}Z" fill="${s.color}" fill-opacity=".1" stroke="none"/>`}
  body+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(p.length<=30)body+=p.slice(0,-1).map(q=>`<circle cx="${X(q.t).toFixed(1)}" cy="${Y(q.v).toFixed(1)}" r="2.4" fill="${s.color}"/>`).join('');
  const e=p[p.length-1];body+=`<circle cx="${X(e.t).toFixed(1)}" cy="${Y(e.v).toFixed(1)}" r="5" fill="var(--surface)" stroke="${s.color}" stroke-width="2.5"/>`;
  if(si===0)body+=`<text x="${Math.min(X(e.t),W-R).toFixed(1)}" y="${(Y(e.v)-10).toFixed(1)}" class="lbl" text-anchor="end">${esc(fmt(e.v))}</text>`});
 const xl=`<text x="${L}" y="${H-6}" class="ax">${fmtDate(t0)}</text><text x="${W-R}" y="${H-6}" class="ax" text-anchor="end">${fmtDate(t1)}</text>`;
 return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">${g}${body}${xl}</svg>`}
function heatmapSVG(){const weeks=26,cs=11,g=2,step=cs+g;const end=weekStart(Date.now());const start=addDays(end,-7*(weeks-1));const counts=new Map();for(const s of S.sessions){const k=ymd(s.start);counts.set(k,(counts.get(k)||0)+1)}
 let r='';for(let w=0;w<weeks;w++)for(let d=0;d<7;d++){const t=addDays(start,w*7+d);if(t>Date.now())continue;const c=counts.get(ymd(t))||0;r+=`<rect x="${w*step}" y="${d*step}" width="${cs}" height="${cs}" rx="3" fill="${c?'var(--accent)':'var(--surface-2)'}" opacity="${c?Math.min(1,.45+.3*c):1}"/>`}
 const lab=[0,13].map(w=>`<text x="${w*step}" y="${7*step+11}" class="ax">${fmtDate(addDays(start,w*7))}</text>`).join('')+`<text x="${weeks*step-g}" y="${7*step+11}" class="ax" text-anchor="end">This week</text>`;
 return `<svg class="heat" viewBox="0 0 ${weeks*step} ${7*step+14}" role="img" aria-label="Training days over the last 26 weeks">${r}${lab}</svg>`}
const hbars=(rows,fmt=v=>fmtNum(v,1))=>{const max=Math.max(1e-9,...rows.map(r=>r[1]));return `<div class="hbars">${rows.map(([l,v,c])=>`<div class="hbar" style="--c:${c||'var(--accent)'}"><span>${esc(l)}</span><span class="tr"><i style="width:${(v/max*100).toFixed(1)}%"></i></span><b>${fmt(v)}</b></div>`).join('')}</div>`};
function rangeStart(){const now=Date.now(),w=weekStart(now);if(ui.range==='4w')return addDays(w,-21);if(ui.range==='3m')return addDays(w,-7*12);if(ui.range==='1y')return addDays(w,-7*51);return S.sessions.length?weekStart(S.sessions[0].start):addDays(w,-21)}
function buckets(){const a=rangeStart(),now=Date.now();const weeks=Math.round((weekStart(now)-a)/(7*DAY))+1;const list=[];
 if(weeks<=27){for(let i=0;i<weeks;i++){const s=addDays(a,7*i);list.push({a:s,b:addDays(s,7),label:fmtDate(s,{day:'numeric',month:'short'})})}return{list,unit:'week',weeks}}
 let m=monthStart(a);while(m<=now){const d=new Date(m);const nx=new Date(d.getFullYear(),d.getMonth()+1,1).getTime();list.push({a:m,b:nx,label:d.getMonth()===0?String(d.getFullYear()).slice(2)+"'":fmtDate(m,{month:'short'})});m=nx}return{list,unit:'month',weeks}}
function chartCard(title,value,svg,legend=''){return `<div class="card"><div class="chead"><div class="h3">${title}</div>${value?`<span class="v">${value}</span>`:''}</div>${svg||'<p class="empty">Nothing logged in this range.</p>'}${legend}</div>`}
const legend=items=>`<div class="legend">${items.map(([l,c])=>`<span style="--c:${c}"><i></i>${esc(l)}</span>`).join('')}</div>`;
function bestWeeks(){const m=new Map();for(const s of S.sessions){const w=weekStart(s.start);const o=m.get(w)||{n:0,run:0,bike:0,t:0};const q=sMetrics(s);o.n++;o.run+=q.rd;o.bike+=q.bd;o.t+=s.duration||0;m.set(w,o)}
 const best=k=>{let bw=null,bv=0;for(const[w,o]of m)if(o[k]>bv){bv=o[k];bw=w}return bw?{w:bw,v:bv}:null};return{n:best('n'),run:best('run'),bike:best('bike'),t:best('t')}}
function vStats(){
 const from=rangeStart();const ss=S.sessions.filter(s=>s.start>=from);const bk=buckets();const per=bk.unit;
 const sum=f=>ss.reduce((t,s)=>t+f(s),0);const M=new Map(ss.map(s=>[s.id,sMetrics(s)]));
 const days=new Set(ss.map(s=>ymd(s.start))).size;const run=sum(s=>M.get(s.id).rd),bike=sum(s=>M.get(s.id).bd),vol=sum(s=>M.get(s.id).vol),time=sum(s=>s.duration||0);
 const by=fn=>bk.list.map(b=>ss.filter(s=>s.start>=b.a&&s.start<b.b).reduce((t,s)=>t+fn(s),0));
 const labels=bk.list.map(b=>b.label);const types=['gym','run','bike','other'];
 const wk=barChart({labels,series:types.map(k=>({color:`var(--${k})`,values:by(s=>typeKey(s)===k?1:0)})),fmt:v=>fmtNum(v,0),int:true});
 const tm=barChart({labels,series:types.map(k=>({color:`var(--${k})`,values:by(s=>typeKey(s)===k?(s.duration||0)/3600:0)}))});
 const p=activePlan();let adh='';
 if(p&&p.mode==='week'){const sums=S.weekSummaries.filter(w=>w.planId===p.id&&w.week>=from);const cur=weekDone(p,weekStart(Date.now()));const lab=[...sums.map(w=>fmtDate(w.week)),'Now'];const vals=[...sums.map(w=>w.done.length),p.workouts.filter(w=>cur.has(w.id)).length];
  if(sums.length)adh=chartCard(`Plan adherence · ${esc(p.name)}`,`${Math.round(100*sums.reduce((t,w)=>t+w.done.length,0)/Math.max(1,sums.reduce((t,w)=>t+w.target,0)))}%`,barChart({labels:lab,series:[{color:'var(--accent)',values:vals}],target:p.workouts.length,fmt:v=>fmtNum(v,0),int:true}),`<p class="hint">Plan workouts done each week. The dashed line is the target of ${p.workouts.length}. Off-plan activities are not counted here.</p>`)}
 const runs=ss.filter(s=>M.get(s.id).rd>0&&M.get(s.id).rt>0).map(s=>({t:s.start,v:M.get(s.id).rt/M.get(s.id).rd}));
 const rides=ss.filter(s=>M.get(s.id).bd>0&&M.get(s.id).bt>0).map(s=>({t:s.start,v:M.get(s.id).bd/(M.get(s.id).bt/3600)}));
 const hrs=[];for(const s of ss)for(const x of s.ex)if(x.cat==='run'&&num(x.vals&&x.vals.hr)>0)hrs.push({t:s.start,v:num(x.vals.hr)});
 const others=new Map();for(const s of ss)if(typeKey(s)==='other'){const k=typeLabel(s);const o=others.get(k)||{n:0,t:0};o.n++;o.t+=s.duration||0;others.set(k,o)}
 const dow=[0,0,0,0,0,0,0];for(const s of ss)dow[(new Date(s.start).getDay()+6)%7]++;
 const mgSets={};for(const s of ss)for(const x of s.ex){if(x.cat!=='gym')continue;const g=x.mg||guessMG(x.name)||'other';for(const z of x.sets||[])if(z.t!=='w'&&(num(z.r)>0||z.t==='f'))mgSets[g]=(mgSets[g]||0)+1}
 const wkN=Math.max(1,bk.weeks||Math.round((Date.now()-from)/(7*DAY)));
 const freq=new Map();for(const s of ss)for(const x of s.ex)if(x.cat==='gym'&&x.name){const n=norm(x.name);const e=freq.get(n)||{name:x.name,c:0};e.c++;e.name=x.name;freq.set(n,e)}
 const exs=[...freq.entries()].sort((a,b)=>b[1].c-a[1].c);if(!ui.statEx||!freq.has(ui.statEx))ui.statEx=exs[0]?exs[0][0]:null;
 let gym='';if(ui.statEx){const hw=[],e1=[],vo=[],mr=[];for(const s of ss)for(const x of s.ex){if(x.cat!=='gym'||norm(x.name)!==ui.statEx)continue;let h=0,e=0,v=0,r=0;for(const z of x.sets||[]){if(z.t==='w')continue;const rr=num(z.r),w=num(z.w);if(!(rr>0))continue;r=Math.max(r,rr);if(w>0){h=Math.max(h,w);e=Math.max(e,rr===1?w:w*(1+rr/30));v+=w*rr}}if(h){hw.push({t:s.start,v:h});e1.push({t:s.start,v:Math.round(e*10)/10});vo.push({t:s.start,v})}if(r)mr.push({t:s.start,v:r})}
  const kg=v=>fmtNum(v,v<100?1:0);const gain=hw.length>1?hw[hw.length-1].v-hw[0].v:0;
  gym=`<label class="field"><span>Exercise</span><select class="in" id="stat-ex" data-b="u|statEx" data-rr="1">${exs.map(([k,e])=>`<option value="${esc(k)}" ${k===ui.statEx?'selected':''}>${esc(e.name)} (${e.c})</option>`).join('')}</select></label>
  ${hw.length?chartCard('Heaviest set and estimated 1RM',`${kg(hw[hw.length-1].v)} kg${gain?` <span class="${gain>0?'ok':'slow'}" style="font-size:14px">${gain>0?'+':''}${kg(gain)}</span>`:''}`,lineChart({series:[{pts:hw,color:'var(--gym)'},{pts:e1,color:'var(--muted)'}],fmt:kg}),legend([['Heaviest set (kg)','var(--gym)'],['Estimated 1RM (kg)','var(--muted)']]))+chartCard('Volume per session','',lineChart({series:[{pts:vo,color:'var(--accent)'}],fmt:fmtAxis}),'<p class="hint">Weight × reps over every working set, in kg. Warm-ups are left out.</p>'):''}
  ${chartCard('Best set, reps',mr.length?mr[mr.length-1].v+' reps':'',lineChart({series:[{pts:mr,color:'var(--other)'}],fmt:v=>fmtNum(v,0)}))}`}
 const bw=bestWeeks();const bwRow=(l,o,f)=>`<div class="tile"><b class="num">${o?f(o.v):'—'}</b><span>${l}${o?`<br>week of ${fmtDate(o.w)}`:''}</span></div>`;
 const bodyPts=[...S.body].filter(b=>num(b.kg)>0).sort((a,b)=>a.t-b.t).map(b=>({t:b.t,v:num(b.kg)}));
 return `<header class="hdr"><div><div class="eyebrow">${plural(ss.length,'workout')} in range</div><h1 class="h1">Stats</h1></div></header>
 ${seg([['4w','4 weeks'],['3m','3 months'],['1y','1 year'],['all','All']],ui.range,'range')}
 <div class="tiles"><div class="tile"><b class="num">${ss.length}</b><span>workouts</span></div><div class="tile"><b class="num">${days}</b><span>active days</span></div><div class="tile"><b class="num">${fmtNum(time/3600,0)}<small>h</small></b><span>time trained</span></div><div class="tile"><b class="num">${fmtNum(run,0)}<small>km</small></b><span>running</span></div><div class="tile"><b class="num">${fmtNum(bike,0)}<small>km</small></b><span>cycling</span></div><div class="tile"><b class="num">${fmtNum(vol/1000,1)}<small>t</small></b><span>lifted</span></div></div>
 ${chartCard('Consistency','',heatmapSVG(),`<p class="hint">Every square is a day over the last 26 weeks. Darker means more workouts that day. Current streak: <b>${plural(weekStreak(),'week')}</b>, <b>${plural(dayStreak(),'day')}</b>.</p>`)}
 ${chartCard(`Workouts per ${per}`,'',ss.length?wk:'',legend(types.map(k=>[CAT[k],`var(--${k})`])))}
 ${chartCard(`Hours trained per ${per}`,fmtNum(time/3600,1)+' h',ss.length?tm:'')}
 ${adh}
 ${chartCard('Which days you train','',ss.length?hbars(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d,i)=>[d,dow[i]]),v=>fmtNum(v,0)):'')}
 <div class="sec"><div class="h2">Best weeks</div></div>
 <div class="best">${bwRow('most workouts',bw.n,v=>v)}${bwRow('most time',bw.t,v=>fmtHM(v))}${bwRow('most running',bw.run,v=>fmtNum(v,1)+'<small>km</small>')}${bwRow('most cycling',bw.bike,v=>fmtNum(v,0)+'<small>km</small>')}</div>
 <div class="sec"><div class="h2">Running</div></div>
 ${chartCard(`Distance per ${per}`,run?fmtNum(run,1)+' km':'',run?barChart({labels,series:[{color:'var(--run)',values:by(s=>M.get(s.id).rd)}]}):'')}
 ${chartCard('Average pace per run',runs.length?fmtDur(runs[runs.length-1].v)+' /km':'',lineChart({series:[{pts:runs,color:'var(--run)'}],fmt:v=>fmtDur(v),invert:true}),runs.length?'<p class="hint">Faster runs sit higher on the chart.</p>':'')}
 ${hrs.length?chartCard('Average heart rate per run',hrs[hrs.length-1].v+' bpm',lineChart({series:[{pts:hrs,color:'var(--gym)'}],fmt:v=>fmtNum(v,0)})):''}
 <div class="sec"><div class="h2">Cycling</div></div>
 ${chartCard(`Distance per ${per}`,bike?fmtNum(bike,0)+' km':'',bike?barChart({labels,series:[{color:'var(--bike)',values:by(s=>M.get(s.id).bd)}]}):'')}
 ${chartCard('Average speed per ride',rides.length?fmtNum(rides[rides.length-1].v,1)+' km/h':'',lineChart({series:[{pts:rides,color:'var(--bike)'}],fmt:v=>fmtNum(v,1)}))}
 ${chartCard(`Elevation per ${per}`,'',sum(s=>M.get(s.id).el)?barChart({labels,series:[{color:'var(--bike)',values:by(s=>M.get(s.id).el)}]}):'')}
 <div class="sec"><div class="h2">Gym</div></div>
 ${Object.keys(mgSets).length?chartCard('Working sets per muscle group','avg per week',hbars(Object.entries(mgSets).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[MG[k]||'Unassigned',v/wkN,'var(--gym)'])),'<p class="hint">Set the muscle group of an exercise under More options in the workout editor.</p>'):''}
 ${gym||'<div class="card"><p class="empty">No gym sets logged in this range.</p></div>'}
 ${others.size?`<div class="sec"><div class="h2">Other activities</div></div><div class="list">${[...others.entries()].sort((a,b)=>b[1].n-a[1].n).map(([k,o])=>`<div class="li">${typeBadge({type:'other'})}<span class="grow"><span class="t">${esc(k)}</span><span class="s">${plural(o.n,'session')} · ${fmtHM(o.t)}</span></span></div>`).join('')}</div>`:''}
 <div class="sec"><div class="h2">Body</div><button class="btn ghost sm" data-act="go" data-v="body">Open</button></div>
 ${bodyPts.length?chartCard('Body weight',fmtNum(bodyPts[bodyPts.length-1].v,1)+' kg',lineChart({series:[{pts:bodyPts,color:'var(--other)'}],fmt:v=>fmtNum(v,1)})):`<button class="card" style="width:100%" data-act="bodySheet"><b>Log your body weight</b><span class="muted sm">Track weight, body fat and waist over time.</span></button>`}`}

/* ================= PRs ================= */
function prRow(key,r,meta){const v=r&&r.best?prVal(r.unit,r.best.value):'—';return `<button class="prrow" data-act="${r?'go':'prAddKey'}" data-v="prDetail" data-key="${esc(key)}"><span style="font-weight:650">${esc((r||meta).label)}</span><span class="v ${r?'':'none'}">${v}</span>${r?`<span class="d">${fmtDateY(r.best.t)}${r.best.src==='manual'?' · added by you':''}</span>`:'<span class="d">Tap to add</span>'}</button>`}
function vPRsV2(){const m=computePRs();let body='';
 if(ui.prTab==='gym'){const groups=new Map();for(const k in m)if(m[k].group==='gym'){const n=k.split(':')[1];if(!groups.has(n))groups.set(n,[]);groups.get(n).push(m[k])}
  body=groups.size?[...groups.entries()].sort((a,b)=>a[1][0].ex.localeCompare(b[1][0].ex)).map(([n,rs])=>`<div class="list"><div class="prgroup"><span class="dot" style="--c:var(--gym)"></span>${esc(rs[0].ex)}</div>${GYM_METRICS.map(([mm])=>{const r=m[`g:${n}:${mm}`];return r?prRow(r.key,r):''}).join('')}</div>`).join(''):'<div class="card"><p class="muted sm">Gym records appear as soon as you log sets. You can also add older ones with Add.</p></div>'}
 else{const keys=ui.prTab==='run'?RUN_KEYS:BIKE_KEYS;body=`<div class="list">${keys.map(k=>prRow(k,m[k],keyMeta(k))).join('')}</div>`}
 const recent=Object.values(m).filter(r=>r.best&&r.best.src==='auto'&&Date.now()-r.best.t<30*DAY).length;
 return `<header class="hdr"><div><div class="eyebrow">${recent?plural(recent,'record')+' in the last 30 days':'Personal records'}</div><h1 class="h1">PRs</h1></div><button class="btn primary sm" data-act="prAddKey" data-key="">${ic('plus',16)} Add</button></header>
 ${seg([['gym','Gym'],['run','Running'],['bike','Cycling']],ui.prTab,'prTab')}
 ${body}
 <p class="hint">Records update by themselves when a logged workout beats them. Use Add to enter older records, for example from Strava. Running distances use the average pace of runs at least that long.</p>`}
function vPRDetail({key}){const r=computePRs()[key];const meta=r||keyMeta(key,exNames());const manual=S.prs.filter(p=>p.key===key).sort((a,b)=>b.t-a.t);
 const [b,u]=r?prBig(r.unit,r.best.value):['—',''];
 return `${topbar(meta.ex||'Record')}
 <div class="feat" style="cursor:default">${plateSVG}<span class="eyebrow">${esc((meta.ex?meta.ex+' · ':'')+meta.label)}</span><span class="feat-num" style="font-size:64px">${esc(b)}${u?`<span class="feat-unit">${esc(u)}</span>`:''}</span><span class="feat-sub">${r?`Set on ${fmtDateY(r.best.t)}${r.best.src==='manual'?' · added by you':''}`:'No record yet'}</span></div>
 ${r&&r.hist.length>1?chartCard('Progress','',lineChart({series:[{pts:r.hist.map(h=>({t:h.t,v:h.value})),color:'var(--accent)'}],fmt:v=>r.unit==='time'||r.unit==='pace'?fmtDur(v):fmtNum(v,1),invert:r.dir==='lo'})):''}
 ${r?`<div class="sec"><div class="h2">History</div></div><div class="list">${[...r.hist].reverse().map(h=>`<div class="li"><span class="grow"><span class="t">${prVal(r.unit,h.value)}</span><span class="s">${fmtDateY(h.t)}${h.note?' · '+esc(h.note):''}</span></span><span class="src">${h.src==='manual'?'Added':'Logged'}</span>${h.sid?`<button class="iconbtn sm" data-act="go" data-v="sdetail" data-id="${h.sid}" aria-label="Open workout">${ic('chev',18)}</button>`:''}</div>`).join('')}</div>`:''}
 ${manual.length?`<div class="sec"><div class="h2">Your entries</div></div><div class="list">${manual.map(e=>`<div class="li"><span class="grow"><span class="t">${prVal(meta.unit,e.value)}</span><span class="s">${fmtDateY(e.t)}${e.note?' · '+esc(e.note):''}</span></span><button class="btn sm danger" data-act="delPR" data-id="${e.id}" data-confirm="Delete?">Delete</button></div>`).join('')}</div>`:''}
 <button class="btn block" data-act="prAddKey" data-key="${esc(key)}">${ic('plus',18)} Add a record</button>`}
function prFormFor(key){const f={group:'run',key:'r:5k',ex:'',metric:'w',value:'',date:ymd(Date.now()),note:''};if(key){const k=key.split(':');if(k[0]==='g'){f.group='gym';f.ex=exNames().get(k[1])||k[1];f.metric=k[2]}else{f.group=k[0]==='r'?'run':'bike';f.key=key}}else if(ui.prTab==='gym')f.group='gym';else if(ui.prTab==='bike'){f.group='bike';f.key='b:long'}return f}
function vPRAdd(){const f=ui.prForm;const unit=f.group==='gym'?(GYM_METRICS.find(m=>m[0]===f.metric)||GYM_METRICS[0])[2]:keyMeta(f.key).unit;
 const vl={time:'Time (h:mm:ss)',pace:'Pace per km (m:ss)',km:'Distance (km)',kg:'Weight (kg)',reps:'Reps',m:'Elevation (m)','km/h':'Average speed (km/h)'}[unit];
 return `${topbar('Add record')}
 <p class="hint">Enter a record you set before using the app. It counts as your best until a logged workout beats it.</p>
 ${seg([['gym','Gym'],['run','Running'],['bike','Cycling']],f.group,'pfGroup')}
 ${f.group==='gym'?`<label class="field"><span>Exercise</span><input class="in" id="pf-ex" list="exnames" value="${esc(f.ex)}" data-b="pf|ex" placeholder="e.g. Bench Press" autocomplete="off"></label><label class="field"><span>Record</span><select class="in" id="pf-m" data-b="pf|metric" data-rr="1">${GYM_METRICS.map(([k,l])=>`<option value="${k}" ${f.metric===k?'selected':''}>${l}</option>`).join('')}</select></label>`:
 `<label class="field"><span>Record</span><select class="in" id="pf-k" data-b="pf|key" data-rr="1">${(f.group==='run'?RUN_KEYS:BIKE_KEYS).map(k=>`<option value="${k}" ${f.key===k?'selected':''}>${keyMeta(k).label}</option>`).join('')}</select></label>`}
 <label class="field"><span>${vl}</span><input class="in big" id="pf-v" value="${esc(f.value)}" data-b="pf|value" inputmode="${unit==='time'||unit==='pace'?'text':'decimal'}" placeholder="${unit==='time'?'22:48':unit==='pace'?'4:35':''}" autocomplete="off"></label>
 <div class="grid2"><label class="field"><span>Date</span><input class="in" id="pf-d" type="date" value="${esc(f.date)}" data-b="pf|date"></label><label class="field"><span>Note</span><input class="in" id="pf-n" value="${esc(f.note)}" data-b="pf|note" placeholder="e.g. From Strava" autocomplete="off"></label></div>
 <button class="btn primary xl" data-act="prSave">Save record</button>`}

/* ================= GOALS & BODY ================= */
function vGoals(){const f=ui.goalForm||(ui.goalForm={kind:'workouts',period:'week',target:'',ex:''});const u=GOAL_KINDS[f.kind][1];
 return `${topbar('Goals')}
 <h1 class="h1">Goals</h1>
 ${S.goals.length?`<div class="card"><div class="goals">${S.goals.map(goalTile).join('')}</div></div><div class="list">${S.goals.map(g=>`<div class="li"><span class="grow"><span class="t">${esc(goalTitle(g))}</span><span class="s">${esc(goalProgress(g).label)}</span></span><button class="btn sm danger" data-act="delGoal" data-id="${g.id}" data-confirm="Delete?">Delete</button></div>`).join('')}</div>`:'<p class="muted">No goals yet. Add one below and it shows as a ring on Today.</p>'}
 <div class="sec"><div class="h2">New goal</div></div>
 <div class="card"><label class="field"><span>Goal</span><select class="in" id="gf-k" data-b="gf|kind" data-rr="1">${Object.entries(GOAL_KINDS).map(([k,v])=>`<option value="${k}" ${f.kind===k?'selected':''}>${v[0]}</option>`).join('')}</select></label>
 ${['workouts','runKm','bikeKm','hours'].includes(f.kind)?`<div class="field"><span>Every</span>${seg([['week','Week'],['month','Month']],f.period,'gfPeriod')}</div>`:''}
 ${f.kind==='lift'?`<label class="field"><span>Exercise</span><input class="in" id="gf-ex" list="exnames" value="${esc(f.ex)}" data-b="gf|ex" placeholder="e.g. Bench Press" autocomplete="off"></label>`:''}
 <label class="field"><span>Target${u?` (${u})`:''}</span><input class="in big" id="gf-t" inputmode="decimal" value="${esc(f.target)}" data-b="gf|target" placeholder="${{workouts:'4',runKm:'25',bikeKm:'150',hours:'5',lift:'100',bw:'75'}[f.kind]}"></label>
 <button class="btn primary" data-act="addGoal">Add goal</button></div>`}
function vBody(){const b=[...S.body].sort((x,y)=>x.t-y.t);const pts=k=>b.filter(e=>num(e[k])>0).map(e=>({t:e.t,v:num(e[k])}));const kg=pts('kg'),bf=pts('bf'),wa=pts('waist');
 const ch=kg.length>1?kg[kg.length-1].v-kg[0].v:0;
 return `${topbar('Body')}
 <div class="hdr" style="padding-top:0"><h1 class="h1">Body</h1><button class="btn primary sm" data-act="bodySheet">${ic('plus',16)} Log</button></div>
 ${kg.length?chartCard('Body weight',`${fmtNum(kg[kg.length-1].v,1)} kg${ch?` <span class="muted" style="font-size:14px">${ch>0?'+':''}${fmtNum(ch,1)} since ${fmtDate(kg[0].t)}</span>`:''}`,lineChart({series:[{pts:kg,color:'var(--other)'}],fmt:v=>fmtNum(v,1)})):'<p class="muted">Log your weight now and then. A weekly weigh-in at the same time of day gives the cleanest trend.</p>'}
 ${bf.length>1?chartCard('Body fat',fmtNum(bf[bf.length-1].v,1)+' %',lineChart({series:[{pts:bf,color:'var(--bike)'}],fmt:v=>fmtNum(v,1)})):''}
 ${wa.length>1?chartCard('Waist',fmtNum(wa[wa.length-1].v,1)+' cm',lineChart({series:[{pts:wa,color:'var(--run)'}],fmt:v=>fmtNum(v,1)})):''}
 ${b.length?`<div class="sec"><div class="h2">Entries</div></div><div class="list">${[...b].reverse().map(e=>`<div class="li"><span class="grow"><span class="t num">${e.kg!==''?fmtNum(e.kg,1)+' kg':''}${e.bf!==''&&e.bf!=null?' · '+fmtNum(e.bf,1)+' %':''}${e.waist!==''&&e.waist!=null?' · '+fmtNum(e.waist,1)+' cm':''}</span><span class="s">${fmtDateY(e.t)}</span></span><button class="btn sm danger" data-act="delBody" data-id="${e.id}" data-confirm="Delete?">Delete</button></div>`).join('')}</div>`:''}`}

/* ================= SETTINGS, SYNC, STRAVA ================= */
function syncLabel(){const y=S.sync;if(!y.token)return 'Off';if(ui.syncing)return 'Syncing…';if(y.err)return 'Last sync failed: '+y.err;return y.last?'Synced '+timeAgo(y.last):'Not synced yet'}
function timeAgo(t){const s=(Date.now()-t)/1000;if(s<60)return 'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';return fmtDate(t)}
function vSettingsV2(){
 return `${topbar('Settings')}
 <div class="hdr" style="padding-top:0">${wordmark}</div>
 <div class="list">
  ${navRow('sync','sync','Sync between devices',esc(syncLabel()),S.sync.token?`<span class="status" style="--c:${S.sync.err?'var(--bad)':'var(--ok)'}"><i></i></span>`:'')}
  ${navRow('strava','link','Strava',S.strava.access?`Connected${S.strava.athlete?' as '+esc(S.strava.athlete):''}`:'Import your Strava history')}
  ${navRow('goals','target','Goals',S.goals.length?plural(S.goals.length,'goal'):'Set weekly, monthly or lift targets')}
  ${navRow('body','scale','Body',S.body.length?plural(S.body.length,'entry').replace('entrys','entries'):'Track weight, body fat and waist')}
 </div>
 <div class="field"><span>Appearance</span>${seg([['system','Match phone'],['light','Light'],['dark','Dark']],S.settings.theme||'system','theme')}</div>
 <label class="field"><span>Default weight step for suggestions (kg)</span><input class="in" id="set-inc" inputmode="decimal" value="${esc(S.settings.inc)}" data-b="set|inc" data-t="num"></label>
 <div class="sec"><div class="h2">Backup</div></div>
 <div class="card"><p class="sm">Save a backup file now and then (to Files, iCloud Drive or Google Drive). With sync turned on, your data is also kept in your GitHub account.</p><p class="muted xs">${S.lastBackup?'Last backup: '+fmtDateY(S.lastBackup):'No backup file yet.'}</p>
 <button class="btn primary" data-act="exportData">Save backup file</button>
 <button class="btn" data-act="showJson">${ui.showJson?'Hide':'Show'} backup as text</button>
 ${ui.showJson?`<textarea class="in copybox" id="json-out" readonly>${esc(JSON.stringify(exportable()))}</textarea><button class="btn sm" data-act="copyJson">Copy text</button>`:''}</div>
 <div class="card"><b>Restore from backup</b><p class="muted sm">Choose a backup file, or paste backup text. This replaces all current data.</p>
 <label class="btn" style="position:relative;overflow:hidden">Choose backup file<input type="file" accept=".json,application/json,text/plain" data-import="1" style="position:absolute;inset:0;opacity:0"></label>
 <textarea class="in copybox" id="json-in" placeholder="Or paste backup text here"></textarea><button class="btn sm" data-act="importPaste">Use pasted text</button>
 ${ui.pendingImport?`<div class="banner"><div><b>Ready to restore</b><br><span class="muted">${plural(ui.pendingImport.plans.length,'plan')} and ${plural(ui.pendingImport.sessions.length,'workout')}. Your current data will be replaced.</span></div><button class="btn sm danger" data-act="importConfirm" data-confirm="Tap again to replace">Restore</button></div>`:''}</div>
 <div class="sec"><div class="h2">Data</div></div>
 <div class="card"><p class="muted sm">${plural(S.plans.length,'plan')} · ${plural(S.sessions.length,'workout')} · ${plural(S.prs.length,'added record')}</p><button class="btn danger" data-act="clearAll" data-confirm="Tap again to erase everything">Erase all data</button><p class="hint">With sync on, erasing also clears the synced copy.</p></div>
 <p class="hint">${APP} works offline once installed. iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Install app. Version 5.0.</p>`}
function vSync(){const y=S.sync;const inPreview=/claude\.ai|claudeusercontent/.test(location.hostname);
 if(!y.token)return `${topbar('Sync')}
 <h1 class="h1">Sync between devices</h1>
 <p class="muted">Keep the same data on your phone, computer and any other device. ${APP} stores a private copy in your GitHub account. It's free and there's no server to run.</p>
 ${inPreview?'<div class="banner"><div>Sync works in your installed app, not in this preview.</div></div>':''}
 <div class="card"><ol class="steps">
  <li>Open <a href="https://github.com/settings/tokens/new?scopes=gist&amp;description=Tempo%20sync" target="_blank" rel="noopener">GitHub → New token</a>. Create a free GitHub account first if you don't have one.</li>
  <li>The note and the <b>gist</b> permission are already filled in. Set <b>Expiration</b> to <b>No expiration</b>.</li>
  <li>Tap <b>Generate token</b> and copy the token (it starts with <code>ghp_</code>).</li>
  <li>Paste it below. Do the same on your other devices with the same token.</li></ol>
 <label class="field"><span>GitHub token</span><input class="in" id="sy-t" value="${esc(ui.syncToken||'')}" data-b="u|syncToken" placeholder="ghp_…" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
 ${ui.syncErr?`<p class="sm" style="color:var(--bad)">${esc(ui.syncErr)}</p>`:''}
 <button class="btn primary" data-act="syncConnect" ${ui.syncing?'disabled':''}>${ui.syncing?'Connecting…':'Turn on sync'}</button>
 <p class="hint">The token only allows access to gists. It stays on this device and is never part of the synced data. Your data is saved as a secret gist: hidden from search and your profile, but anyone who has its exact link can open it.</p></div>`;
 return `${topbar('Sync')}
 <h1 class="h1">Sync between devices</h1>
 <div class="card"><div class="status" style="--c:${y.err?'var(--bad)':'var(--ok)'}"><i></i>${esc(syncLabel())}</div>
 ${y.user?`<p class="muted sm">GitHub account: <b>${esc(y.user)}</b></p>`:''}
 <p class="hint">${APP} syncs when it opens, when you come back to it and a few seconds after each change. Changes from all devices are merged, so you can log on your phone and plan on your computer.</p>
 <button class="btn primary" data-act="syncNow" ${ui.syncing?'disabled':''}>${ic('sync',18)} ${ui.syncing?'Syncing…':'Sync now'}</button>
 ${y.gistId?`<a class="btn" href="https://gist.github.com/${esc(y.gistId)}" target="_blank" rel="noopener">View the synced file on GitHub</a>`:''}
 <button class="btn danger" data-act="syncOff" data-confirm="Tap again to turn off">Turn off sync on this device</button>
 <p class="hint">Turning off keeps your data on this device and in GitHub. It only removes the token from this device.</p></div>`}
function stravaFileCard(){const f=ui.stravaFile;
 if(f)return `<div class="card"><b>Ready to import</b><p class="sm">${plural(f.total,'activity')} in the file, from ${fmtDateY(f.from)} to ${fmtDateY(f.to)}. <b>${plural(f.list.length,'activity')}</b> ${f.list.length===1?'is':'are'} new to ${APP}.</p>
  <div class="tiles">${[['run','running'],['bike','cycling'],['other','other']].map(([k,l])=>`<div class="tile"><b class="num">${f.byCat[k]+(k==='other'?f.byCat.gym:0)}</b><span>${l}</span></div>`).join('')}</div>
  <p class="hint">Older activities are added to your history as off-plan, so they count for stats, streaks and records. ${f.thisWeek?`The ${plural(f.thisWeek,'activity')} from this week will wait on Today so you can match them to your plan.`:''}</p>
  <div class="btnrow"><button class="btn primary" data-act="stravaFileImport" ${f.list.length?'':'disabled'}>Import ${plural(f.list.length,'activity')}</button><button class="btn" data-act="stravaFileCancel">Cancel</button></div></div>`;
 return `<div class="card"><b>Import your Strava history</b><p class="muted sm">Free, no subscription. Strava emails you a copy of all your activities and ${APP} reads it.</p><ol class="steps">
  <li>Open <a href="https://www.strava.com/account" target="_blank" rel="noopener">strava.com/account</a>, tap <b>Download or delete your account</b> → <b>Get started</b> → <b>Request your archive</b>.</li>
  <li>Strava emails you a link to a zip (it can take a few hours). Download it and save it to the Files app.</li>
  <li>In Files, tap the zip to open it. Inside the new folder is <code>activities.csv</code>.</li>
  <li>Tap below and pick <code>activities.csv</code>.</li></ol>
  ${ui.stravaErr?`<p class="sm" style="color:var(--bad)">${esc(ui.stravaErr)}</p>`:''}
  <label class="btn primary" style="position:relative;overflow:hidden">Choose activities.csv<input type="file" accept=".csv,text/csv,text/plain" data-stravafile="1" style="position:absolute;inset:0;opacity:0"></label>
  <p class="hint">You can import a newer archive later. Activities already in ${APP} are skipped.</p></div>`}
function vStrava(){const a=S.strava;const inPreview=/claude\.ai|claudeusercontent/.test(location.hostname);const host=location.hostname||'your-site.github.io';
 if(!a.access)return `${topbar('Strava')}
 <h1 class="h1">Strava</h1>
 ${stravaFileCard()}
 <details class="opts card" data-open="strava-api" ${ui.open.has('strava-api')||ui.stravaErr&&!ui.stravaFile?'open':''}><summary>${ic('chev',16)} Automatic import (needs a Strava subscription)</summary><div class="inner">
 <p class="muted sm">With a Strava subscription you can connect directly, and new activities arrive by themselves every time you open ${APP}.</p>
 ${inPreview?'<div class="banner"><div>Connecting works in your installed app, not in this preview.</div></div>':''}
 <b>1 · Create your own Strava API app (one time)</b><ol class="steps">
  <li>Open <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener">strava.com/settings/api</a>.</li>
  <li>Application name: <code>${APP}</code>. Category: <code>Training</code>. Website: <code>${esc(location.origin||'https://'+host)}</code></li>
  <li>Authorization Callback Domain: <code>${esc(host)}</code> <button class="btn sm" data-act="copyText" data-text="${esc(host)}">Copy</button></li>
  <li>Save, then copy the <b>Client ID</b> and <b>Client Secret</b> into the fields below.</li></ol>
 <div class="grid2"><label class="field"><span>Client ID</span><input class="in" id="sv-id" inputmode="numeric" value="${esc(a.clientId)}" data-b="sa|clientId" autocomplete="off"></label><label class="field"><span>Client Secret</span><input class="in" id="sv-sec" value="${esc(a.clientSecret)}" data-b="sa|clientSecret" autocomplete="off" autocapitalize="off" spellcheck="false"></label></div>
 <p class="hint">These stay on your devices. With sync on, they are copied to your other devices so you only enter them once.</p>
 <b>2 · Connect</b>
 <button class="btn primary" data-act="stravaConnect" ${a.clientId&&a.clientSecret?'':'disabled'}>Connect with Strava</button>
 <p class="hint">If Strava sends you back to Safari instead of the app, it shows a code there. Copy it and paste it here:</p>
 <div class="grid2" style="grid-template-columns:1fr auto"><input class="in" id="sv-code" value="${esc(ui.stravaCode)}" data-b="u|stravaCode" placeholder="Code from Strava" autocomplete="off" autocapitalize="off"><button class="btn" data-act="stravaUseCode">Use code</button></div></div></details>`;
 return `${topbar('Strava')}
 <h1 class="h1">Strava</h1>
 <div class="card"><div class="status" style="--c:var(--ok)"><i></i>Connected${a.athlete?' as '+esc(a.athlete):''}</div>
 <p class="muted sm">${a.checked?'Last checked '+timeAgo(a.checked):'Not checked yet'}${a.lastSync?' · newest activity '+fmtDate(a.lastSync*1000):''}</p>
 ${ui.stravaErr?`<p class="sm" style="color:var(--bad)">${esc(ui.stravaErr)}</p>`:''}
 <button class="btn primary" data-act="stravaSync" ${ui.stravaBusy?'disabled':''}>${ic('sync',18)} ${ui.stravaBusy?'Checking…':'Check for new activities'}</button>
 ${a.pending.length?`<button class="btn" data-act="go" data-v="sinbox">Review ${plural(a.pending.length,'new activity')}</button>`:''}
 ${sw(a.auto,'stravaAuto','','Import automatically, matching plan workouts when it can')}
 <p class="hint">${APP} checks Strava when it opens. Gym sessions from Strava open in the editor so you can add your sets.</p></div>
 <div class="card"><b>Import older activities</b><p class="muted sm">Bring in activities from before you connected.</p><div class="btnrow">${[[30,'30 days'],[90,'90 days'],[365,'1 year'],[36500,'All time']].map(([d,l])=>`<button class="btn sm" data-act="stravaBackfill" data-days="${d}" ${ui.stravaBusy?'disabled':''}>${l}</button>`).join('')}</div></div>
 ${stravaFileCard()}
 <button class="btn danger block" data-act="stravaOff" data-confirm="Tap again to disconnect">Disconnect Strava</button>`}
function stravaSummary(a){const o=[];if(a.distance)o.push(fmtNum(a.distance/1000,2)+' km');if(a.moving)o.push(fmtDur(a.moving));if(a.cat==='run'&&a.distance&&a.moving)o.push(fmtDur(a.moving/(a.distance/1000))+' /km');if(a.cat==='bike'&&a.distance&&a.moving)o.push(fmtNum(a.distance/1000/(a.moving/3600),1)+' km/h');return o.join(' · ')}
function vSInbox(){const list=S.strava.pending;const opts=a=>{const p=activePlan();const all=[];for(const pl of S.plans)pl.workouts.forEach((w,i)=>all.push({pl,w,i,score:(pl===p?2:0)+(typeKey(w)===a.cat?3:0)}));all.sort((x,y)=>y.score-x.score);return all};
 return `${topbar('From Strava')}
 <h1 class="h1">New activities</h1>
 ${list.length?`<p class="muted sm">Pick what each one counts as. Plan workouts tick off your week; off-plan ones still count for stats and streaks.</p>${list.map(a=>{const o=opts(a);const sel=a.choice??suggestMatch(a);return `<div class="card"><div class="exhead">${typeBadge({type:a.cat})}<div class="grow" style="gap:2px"><b>${esc(a.name)}</b><span class="muted sm">${fmtDate(a.start,{weekday:'short',day:'numeric',month:'short'})} · ${esc(a.sport)} · ${esc(stravaSummary(a))}</span></div></div>
  <label class="field"><span>Counts as</span><select class="in" id="sx-${a.id}" data-b="spend|${a.id}|choice"><option value="">Off-plan</option>${o.map(x=>`<option value="${x.pl.id}|${x.w.id}" ${sel===x.pl.id+'|'+x.w.id?'selected':''}>${esc(x.pl.name)} · ${letter(x.i)} ${esc(x.w.name)}</option>`).join('')}</select></label>
  <div class="btnrow"><button class="btn primary" data-act="stravaImport" data-id="${a.id}">Import</button><button class="btn" data-act="stravaIgnore" data-id="${a.id}">Ignore</button></div></div>`}).join('')}
  <button class="btn block" data-act="stravaImportAll">Import all with these choices</button>`:'<p class="muted">Nothing new. You are all caught up.</p>'}`}

const TABS={home:vHome,plans:vPlans,history:vHistory,stats:vStats,prs:vPRs};
const VIEWS={plan:vPlan,workout:vWorkout,session:vSession,sdetail:vSDetail,prDetail:vPRDetail,prAdd:vPRAdd,settings:vSettings,goals:vGoals,body:vBody,sync:vSync,strava:vStrava,sinbox:vSInbox};
