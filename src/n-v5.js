/* ================= v5: Glass, navigation, Today, workout UX ================= */
Object.assign(I,{dots:'<circle cx="5.5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
 train:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',progress:'<path d="M4 19.5h16M6.5 16l4-5 3.5 3 4.5-7"/>',you:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
 undo:'<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',plusc:'<path d="M12 5v14M5 12h14"/>'});
ACCENTS.aurora=['#FF5D8F','#FFFFFF','Aurora'];
const ACCENT2={aurora:'#A46BFF',blue:'#7C5CFF',mint:'#5CE1E6',amber:'#FF7A59',red:'#FF9F43',violet:'#5CE1E6'};
const HOME_DEFAULT=[['feat',1],['start',1],['planned',1],['upnext',1],['plan',1],['month',1],['ready',1],['insights',1],['recap',1],['goals',1],['race',1],['challenge',1],['week',0],['repeat',0],['last',1],['quick',0]];
HOME_WIDGETS.push(['month','This month']);
function emptyState(){const s=emptyStateV4();s.v=5;s.settings.accent='aurora';s.settings.theme='dark';s.settings.home=HOME_DEFAULT.map(([id,on])=>({id,on:!!on}));s.settings.wsize={};return s}
function migrate(st){const was=st.v||1;st=migrateV4(st);if(was<5){st.settings.home=HOME_DEFAULT.map(([id,on])=>({id,on:!!on}));if(!st.settings.accent||st.settings.accent==='blue')st.settings.accent='aurora';st.settings.theme='dark'}st.settings.wsize=st.settings.wsize||{};
 const ids=new Set(st.settings.home.map(w=>w.id));for(const[id,on]of HOME_DEFAULT)if(!ids.has(id))st.settings.home.push({id,on:!!on});st.v=5;return st}
function makeSample(){const s=makeSampleV4();s.settings.accent='aurora';s.settings.theme='dark';return s}
function applyAccent(){const k=S&&S.settings.accent||'aurora';const a=ACCENTS[k]||ACCENTS.aurora;const r=document.documentElement.style;r.setProperty('--accent',a[0]);r.setProperty('--on-accent',a[1]);r.setProperty('--accent2',ACCENT2[k]||'#A46BFF')}
function applyTheme(){const r=document.documentElement;const st=S&&S.settings||{};r.setAttribute('data-theme','dark');r.classList.toggle('bigtext',st.textSize==='large');r.classList.toggle('calm',st.motion==='reduced');r.classList.toggle('solid',st.cards==='solid');applyAccent()}
function moodColor(){try{const v=readiness();return v>=67?'#FF5D8F':v>=34?'#8B5CFF':'#3A7BFF'}catch(e){return '#8B5CFF'}}

/* --- navigation --- */
const TABMAP={plans:'train',history:'progress',stats:'progress',prs:'progress'};
Object.assign(TABS,{train:vTrain,progress:vProgress,you:vYou});
const TABLIST=[['home','Today','home'],['train','Train','train'],['progress','Progress','progress'],['you','You','you']];
function render(){const top=ui.stack[ui.stack.length-1];const app=$('#app');
 if(!['home','train','progress','you'].includes(ui.tab)){const t=ui.tab;ui.tab=TABMAP[t]||'home';if(ui.tab==='progress')ui.psub=t==='history'?'history':t==='prs'?'prs':'stats'}
 app.className=top?'stack':'';
 app.innerHTML=enhance(top?(VIEWS[top.v]?VIEWS[top.v](top):''):TABS[ui.tab]());
 const tabs=$('#tabs');tabs.hidden=!!top;
 tabs.innerHTML=TABLIST.map(([k,l,i])=>`<button class="tab ${ui.tab===k?'on':''} ${ui.nav==='tab'&&ui.tab===k?'bump':''}" data-act="tab" data-t="${k}" aria-current="${ui.tab===k?'page':'false'}">${ic(i,24)}<span>${l}</span></button>`).join('');
 $('#exnames').innerHTML=[...exNames().values()].sort().map(n=>`<option value="${esc(n)}"></option>`).join('');
 renderSheet();renderRest();renderFab();
 document.body.style.setProperty('--mood',moodColor());
 if(ui.nav){const c='nav-'+ui.nav;app.classList.add(c);if(ui.nav==='tab'&&ui.tab==='home'&&!top){document.body.classList.add('anim');setTimeout(()=>document.body.classList.remove('anim'),1300)}ui.nav=null;setTimeout(()=>app.classList.remove(c),450)}
 if(!top&&ui.tab==='home'&&!ui.counted){ui.counted=true;countUp()}}
function go(v,params){const cur=ui.stack[ui.stack.length-1];if(cur)cur.y=window.scrollY;else ui.scroll[ui.tab]=window.scrollY;ui.stack.push({v,...(params||{})});ui.sheet=null;ui.fan=false;ui.nav='push';render();window.scrollTo(0,0)}
function back(){ui.stack.pop();ui.sheet=null;ui.nav='pop';render();const cur=ui.stack[ui.stack.length-1];window.scrollTo(0,cur?(cur.y||0):(ui.scroll[ui.tab]||0))}
function countUp(){const el=document.querySelector('.feat-num');if(!el||document.documentElement.classList.contains('calm'))return;const tn=el.firstChild;if(!tn||tn.nodeType!==3)return;const target=parseInt(tn.textContent,10);if(!(target>1)||String(target)!==tn.textContent.trim())return;const t0=performance.now(),D=700;const step=t=>{const p=Math.min(1,(t-t0)/D);tn.textContent=String(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)};tn.textContent='0';requestAnimationFrame(step)}
const stripHeader=h=>h.replace(/^\s*<header class="hdr">[\s\S]*?<\/header>/,'');
function emptyBox(icon,title,text,btn,act,extra=''){return `<div class="emptybox"><span class="eicon">${ic(icon,28)}</span><b>${esc(title)}</b><p>${esc(text)}</p>${btn?`<button class="btn primary sm" data-act="${act}" ${extra}>${esc(btn)}</button>`:''}</div>`}
function enhance(h){return h
 .replace('<div class="card"><p class="muted sm">Nothing matches. Try another word or filter.</p></div>',emptyBox('search','Nothing matches','Try another word or filter.'))
 .replace(/<div class="card"><div class="h2">Nothing logged yet<\/div><p class="muted sm">[^<]*<\/p><\/div>|<div class="card"><p class="muted sm">Finished workouts appear here[^<]*<\/p><\/div>/,emptyBox('history','No workouts yet','Your workouts appear here when you finish them. You can also log one you already did.','Log a past workout','logPast'))
 .replace('<div class="card"><p class="muted sm">Gym records appear as soon as you log sets. You can also add older ones with Add.</p></div>',emptyBox('pr','No gym records yet','They appear the moment you log a set. You can also add records from before.','Add a record','prAddKey','data-key=""'))
 .replace('<div class="card"><p class="empty">No gym sets logged in this range.</p></div>',emptyBox('gym','No gym sets in this range','Pick a longer range or log a gym workout.'))
 .replace('<p class="muted">No goals yet. Add one below and it shows as a ring on Today.</p>',emptyBox('target','No goals yet','Add one below. It shows as a ring on Today.'))
 .replace(/<p class="muted">Write how training feels[^<]*<\/p>/,emptyBox('book','Your journal is empty','Write how training feels and add a progress photo now and then. Photos stay on your devices.','Write the first entry','jAdd'))
 .replace(/<p class="muted">Add your running shoes or bike\.[^<]*<\/p>/,emptyBox('shoe','No gear yet','Add your shoes or bike to count kilometres and get a heads-up when shoes wear out.','Add gear','gearAdd'))
 .replace('<p class="muted">Nothing tracked. Hopefully it stays that way.</p>',emptyBox('bandage','Nothing sore','Hopefully it stays that way. Add a sore spot and exercises that load it get flagged.'))}

/* --- Train tab --- */
function vTrain(){const ap=activePlan();const tools=[['library','grid','Ready-made'],['planner','cal','Planner'],['planText','text','From text'],['mobility','lungs','Mobility'],['rmtest','bolt','1RM test'],['race','flag','Race'],['zones','gauge','Zones'],['gear','shoe','Gear']];
 return `<header class="hdr"><div><div class="eyebrow">${ap?esc(ap.name)+' · active':'No active plan'}</div><h1 class="h1">Train</h1></div><button class="iconbtn" data-act="newPlan" aria-label="New plan">${ic('plus',20)}</button></header>
 <button class="btn primary xl" data-act="startSheet">${ic('play',18)} Start workout</button>
 ${ap?planCard(ap):''}
 <div class="quick tools8">${tools.map(([v,i,l])=>`<button data-act="go" data-v="${v}">${ic(i,20)}${l}</button>`).join('')}</div>
 <div class="sec"><div class="h2">Your plans</div><button class="btn ghost sm" data-act="newPlan">${ic('plus',16)} New</button></div>${stripHeader(vPlansV3())}`}
/* --- Progress tab --- */
function vProgress(){const sub=ui.psub||'stats';let body='';
 if(sub==='stats')body=stripHeader(vStats());else if(sub==='history')body=`<div class="btnrow"><button class="btn sm line" data-act="logPast">${ic('plus',15)} Log a past workout</button></div>`+stripHeader(vHistory());
 else if(sub==='prs')body=`<div class="btnrow"><button class="btn sm line" data-act="prAddKey" data-key="">${ic('plus',15)} Add a record</button><button class="btn sm line" data-act="go" data-v="achievements">${ic('medal',15)} Achievements</button></div>`+stripHeader(vPRs());
 else body=`<div class="list">${[['body','scale','Body','Weight, body fat and waist'],['year','trend','Year in review','Your year in numbers'],['achievements','medal','Achievements',`${achievements().filter(a=>a.at).length} of ${ACH_DEF.length} unlocked`],['challenges','star','Challenges','This month'],['journal','book','Journal','Notes and progress photos'],['readiness','gauge','Readiness and load','How it is calculated']].map(r=>navRow(...r)).join('')}</div>`;
 const n=S.sessions.length;
 return `<header class="hdr"><div><div class="eyebrow">${plural(n,'workout')} · ${plural(weekStreak(),'week')} streak</div><h1 class="h1">Progress</h1></div></header>${seg([['stats','Stats'],['history','History'],['prs','Records'],['more','More']],sub,'psub','','psubseg')}<div id="psub" class="psub">${body}</div>`}
/* --- You tab --- */
const YOU_GROUPS=[['Goals and motivation',[['goals','target','Goals',()=>S.goals.length?plural(S.goals.length,'goal'):'Weekly, monthly, a lift or body weight'],['challenges','star','Challenges',()=>'A goal for this month'],['achievements','medal','Achievements',()=>`${achievements().filter(a=>a.at).length} of ${ACH_DEF.length} unlocked`],['year','trend','Year in review',()=>'Your year in numbers']]],
 ['Body and health',[['body','scale','Body',()=>S.body.length?plural(S.body.length,'entry','entries'):'Weight, body fat, waist'],['injuries','bandage','Injuries',()=>activeInj().length?plural(activeInj().length,'active injury','active injuries'):'Nothing tracked'],['journal','book','Journal',()=>S.journal.length?plural(S.journal.length,'entry','entries'):'Notes and photos'],['readiness','gauge','Readiness',()=>`Today ${readiness()}`]]],
 ['Training setup',[['gear','shoe','Shoes and bikes',()=>S.gear.length?plural(S.gear.filter(g=>!g.retired).length,'item'):'Kilometres per pair'],['zones','gauge','Training zones',()=>'Pace and heart rate'],['race','flag','Race',()=>S.race&&S.race.date?esc(S.race.name||'Race')+' · '+fmtDate(new Date(S.race.date+'T09:00').getTime()):'Countdown and predicted time'],['customize','sliders','Customize Today',()=>'Cards, order and size'],['onboard','sliders','Set up my plan',()=>'Three questions, then a plan']]],
 ['Connections',[['sync','sync','Sync between devices',()=>esc(syncLabel())],['strava','link','Strava',()=>S.strava.access?'Connected':'Import your history']]],
 ['App',[['appearance','sliders','Appearance and accessibility',()=>ACCENTS[S.settings.accent||'aurora'][2]+' accent'],['settings','gear','Backup and data',()=>S.lastBackup?'Last backup '+fmtDate(S.lastBackup):'Save or restore a backup']]]];
function vYou(){const n=S.sessions.length;const first=S.sessions[0];const tot=S.sessions.reduce((t,s)=>t+(s.duration||0),0);
 return `<header class="hdr"><div><div class="eyebrow">${first?'Training since '+fmtDate(first.start,{month:'long',year:'numeric'}):'Welcome'}</div><h1 class="h1">You</h1></div></header>
 <div class="tiles"><div class="tile"><b>${n}</b><span>workouts</span></div><div class="tile"><b>${fmtNum(tot/3600,0)}<small>h</small></b><span>trained</span></div><div class="tile"><b>${weekStreak()}<small>wk</small></b><span>streak</span></div></div>
 <input class="in" id="ysearch" type="search" placeholder="Search settings and tools" data-live="you" autocomplete="off">
 ${YOU_GROUPS.map(([g,rows])=>`<div class="ygroup"><div class="sec"><div class="h2">${g}</div></div><div class="list">${rows.map(([v,i,t,s])=>`<div class="yrow" data-q="${esc((t+' '+g).toLowerCase())}">${navRow(v,i,t,s())}</div>`).join('')}</div></div>`).join('')}
 <div class="ygroup"><div class="sec"><div class="h2">Daily</div></div><div class="card yrow" data-q="daily check-in ask how i feel" style="padding:4px 16px">${sw(S.settings.dailyAsk!==false,'toggleDailyAsk','','Ask how I feel each morning')}</div>
 <div class="list yrow" data-q="tutorial tour help"><button class="li" data-act="tourStart"><span class="lt" style="--c:var(--accent)">${ic('school',19)}</span><span class="grow"><span class="t">Interactive tutorial</span><span class="s">A guided tour with sample data</span></span><span class="chev">${ic('chev',20)}</span></button></div></div>
 <p class="hint" style="text-align:center">${APP} · Version 5.1</p>`}
function vAppearance(){const st=S.settings;return `${topbar('Appearance')}<h1 class="h1">Appearance</h1>
 <div class="field"><span>Accent</span><div class="swatches">${Object.entries(ACCENTS).sort((a,b)=>(a[0]==='aurora'?-1:0)-(b[0]==='aurora'?-1:0)).map(([k,v])=>`<button class="swatch ${(st.accent||'aurora')===k?'on':''}" style="--c:${v[0]};background:linear-gradient(135deg,${v[0]},${ACCENT2[k]})" data-act="accent" data-k="${k}" aria-label="${v[2]}">${(st.accent||'aurora')===k?ic('check',18):''}</button>`).join('')}</div></div>
 <div class="field"><span>Text size</span>${seg([['normal','Normal'],['large','Large']],st.textSize||'normal','setPref','data-k="textSize"')}</div>
 <div class="field"><span>Motion</span>${seg([['full','Full'],['reduced','Reduced']],st.motion||'full','setPref','data-k="motion"')}</div>
 <div class="field"><span>Cards</span>${seg([['glass','Glass'],['solid','Solid (higher contrast)']],st.cards||'glass','setPref','data-k="cards"')}</div>
 <p class="hint">Reduced motion turns off transitions and count-ups. Solid cards are easier to read in bright light.</p>`}
function vCustomize(){const list=S.settings.home;const ws=S.settings.wsize||{};return `${topbar('Customize Today')}<h1 class="h1">Customize Today</h1><p class="muted">Turn cards on or off, change their order and pick compact or large. On Today you can also press and hold a card to drag it.</p>
 <div class="list">${list.map((w,i)=>{const meta=HOME_WIDGETS.find(h=>h[0]===w.id);if(!meta)return '';return `<div class="widgetrow ${w.on?'':'off'}"><span class="grow">${esc(meta[1])}</span>${seg([['l','L'],['c','S']],ws[w.id]==='c'?'c':'l','wSize',`data-k="${w.id}"`,'mini wsz')}<button class="iconbtn sm" data-act="wMove" data-i="${i}" data-n="-1" ${i===0?'disabled style="opacity:.3"':''} aria-label="Move up">${ic('up',16)}</button><button class="iconbtn sm" data-act="wMove" data-i="${i}" data-n="1" ${i===list.length-1?'disabled style="opacity:.3"':''} aria-label="Move down">${ic('down',16)}</button><button class="switch ${w.on?'on':''}" style="width:auto;min-height:34px" data-act="wToggle" data-i="${i}" role="switch" aria-checked="${w.on}" aria-label="Show ${esc(meta[1])}"><span class="knob"></span></button></div>`}).join('')}</div>
 <button class="btn" data-act="wReset">Reset to default</button>`}

/* --- Today --- */
WIDGETS.month=function(){const now=Date.now(),m=monthStart(now),nm=addMonths(m,1);const ss=sessionsIn(m,nm);const pm=addMonths(m,-1);const same=sessionsIn(pm,pm+(now-m)).length;const q=ss.reduce((a,s)=>{const x=sMetrics(s);a.km+=x.rd+x.bd;a.t+=s.duration||0;return a},{km:0,t:0});
 const start=weekStart(m);let cells='';for(let t=start;t<nm;t=addDays(t,1)){const inM=t>=m;const day=sessionsIn(t,addDays(t,1));const k=day[0]?typeKey(day[0]):'';cells+=`<i class="${inM?'':'out'} ${ymd(t)===ymd(now)?'td':''} ${t>now?'fut':''}" style="${k?`--c:var(--${k})`:''}" data-on="${day.length?1:0}"></i>`}
 const d=ss.length-same;return `<button class="card monthw" style="width:100%" data-act="openCal"><div class="sec" style="margin:0"><div class="eyebrow">${fmtDate(now,{month:'long'})}</div><span class="muted xs">${same||ss.length?`${d>=0?'+':''}${d} vs last month`:''}</span></div><div class="mrow"><div class="mgrid">${cells}</div><div class="mstats"><div><b>${ss.length}</b><span>workouts</span></div><div><b>${fmtNum(q.km,0)}<small>km</small></b><span>distance</span></div><div><b>${fmtNum(q.t/3600,1)}<small>h</small></b><span>trained</span></div></div></div></button>`};
function syncChip(){if(!S.sync.token)return '';const off=!navigator.onLine;const st=ui.syncing?['var(--warn)','Syncing']:off?['var(--muted)','Offline']:S.sync.err?['var(--bad)','Sync issue']:['var(--ok)','Synced'];return `<button class="chipsync" data-act="${S.sync.err?'go':'syncNow'}" data-v="sync" aria-label="${st[1]}"><i style="--c:${st[0]}" class="${ui.syncing?'spin':''}"></i>${st[1]}</button>`}
function vHome(){const now=Date.now();const pend=S.strava.pending.length;const ws=S.settings.wsize||{};
 const needBackup=!S.sample&&!S.sync.token&&S.sessions.length>=3&&(!S.lastBackup||now-S.lastBackup>14*DAY);
 const cards=S.settings.home.filter(w=>w.on&&WIDGETS[w.id]).map(w=>{const h=WIDGETS[w.id]();return h?`<div class="wwrap ${ws[w.id]==='c'?'compact':''}" data-sid="${w.id}">${h}</div>`:''}).join('');
 return `<header class="hdr"><div>${wordmark}<div class="eyebrow" style="margin-top:18px">${fmtDate(now,{weekday:'long',day:'numeric',month:'long'})}</div><h1 class="h1">Today</h1></div><div class="tools">${syncChip()}<button class="iconbtn" data-act="go" data-v="customize" aria-label="Customize Today">${ic('sliders',19)}</button></div></header>
 <div id="ptr" aria-hidden="true">${ic('sync',18)}</div>
 ${!S.tourSeen&&!ui.tour?`<div class="banner tourb"><div><b>New to Tempo?</b><br><span class="muted">A 2-minute interactive tour shows you around, using sample data.</span></div><div class="btnrow" style="flex:0 0 auto"><button class="btn sm primary" data-act="tourStart">Take the tour</button><button class="btn sm line" data-act="tourDismiss">Later</button></div></div>`:''}
 ${S.sample?`<div class="banner"><div><b>This is sample data.</b><br><span class="muted">Look around, then start fresh and set up your own plan.</span></div><button class="btn sm primary" data-act="startFresh" data-confirm="Tap again to clear">Start fresh</button></div>`:''}
 ${S.active?`<button class="live" data-act="openSession"><span class="pulse"></span><span class="grow"><b>${esc(S.active.name)}</b><br><span class="sm">${S.active.past?'Logging a workout':'In progress · <span id="timer2" class="num">'+fmtDur((now-S.active.start)/1000)+'</span>'}</span></span><b>Resume</b></button>`:''}
 ${pend?`<button class="card" style="flex-direction:row;align-items:center;width:100%" data-act="go" data-v="sinbox"><span class="lt" style="--c:var(--accent)">${ic('sync',19)}</span><span style="flex:1;min-width:0"><b>${plural(pend,'new activity','new activities')} from Strava</b><br><span class="muted sm">Choose what each one counts as</span></span><span class="chev">${ic('chev',20)}</span></button>`:''}
 <div class="sortable" data-sortable="home">${cards}</div>
 ${needBackup?`<div class="card"><b>Keep a copy of your data</b><p class="muted sm">Your workouts live only on this phone. Turn on sync to keep them on your other devices too.</p><button class="btn primary" data-act="go" data-v="sync">Turn on sync</button></div>`:''}`}
/* --- floating quick log --- */
function renderFab(){let f=$('#fab');if(!f){f=document.createElement('div');f.id='fab';document.body.appendChild(f)}const show=!ui.stack.length&&ui.tab==='home'&&!ui.sheet;f.hidden=!show;if(!show){ui.fan=false;f.innerHTML='';return}
 const items=[['startSheet','play','Start workout'],['quickSheet','other','Log activity'],['bodySheet','scale','Log weight'],['dailyOpen','heart','Check-in'],['logPast','history','Past workout']];
 f.innerHTML=`${ui.fan?`<div class="fanbg" data-act="fanClose"></div><div class="fan">${items.map(([a,i,l],k)=>`<button class="fanit" style="--k:${k}" data-act="${a}" data-fan="1"><span>${l}</span><i>${ic(i,19)}</i></button>`).join('')}</div>`:''}<button class="fabbtn ${ui.fan?'open':''}" data-act="${ui.fan?'fanClose':'quickSheet'}" aria-label="${ui.fan?'Close':'Quick log. Press and hold for more'}">${ic('plusc',26)}</button>`}
/* --- exercise page --- */
function vExercise({key}){const n=norm(key);const name=exNames().get(n)||key;const hist=[];for(const s of S.sessions){const x=s.ex.find(z=>norm(z.name)===n);if(x)hist.push({s,x})}const cat=hist.length?hist[hist.length-1].x.cat:'gym';const pm=computePRs();
 let hero='',charts='';
 if(cat==='gym'){const hw=[],e1=[],vo=[];for(const{s,x}of hist){let h=0,e=0,v=0;for(const z of x.sets||[]){if(z.t==='w')continue;const r=num(z.r),w=num(z.w);if(!(r>0))continue;if(w>0){h=Math.max(h,w);e=Math.max(e,r===1?w:w*(1+r/30));v+=w*r}}if(h){hw.push({t:s.start,v:h});e1.push({t:s.start,v:Math.round(e*10)/10});vo.push({t:s.start,v})}}
  const r1=pm[`g:${n}:w`],r2=pm[`g:${n}:1rm`],r3=pm[`g:${n}:r`];hero=`<div class="tiles"><div class="tile"><b>${r1?fmtNum(r1.best.value,1):'—'}<small>kg</small></b><span>heaviest set</span></div><div class="tile"><b>${r2?fmtNum(r2.best.value,1):'—'}<small>kg</small></b><span>estimated 1RM</span></div><div class="tile"><b>${r3?r3.best.value:'—'}</b><span>most reps</span></div></div>`;
  charts=hw.length?chartCard('Heaviest set and 1RM',fmtNum(hw[hw.length-1].v,1)+' kg',lineChart({series:[{pts:hw,color:'var(--accent)'},{pts:e1,color:'var(--accent2)'}],fmt:v=>fmtNum(v,0)}),legend([['Heaviest set','var(--accent)'],['Estimated 1RM','var(--accent2)']]))+chartCard('Volume per session','',lineChart({series:[{pts:vo,color:'var(--strain)'}],fmt:fmtAxis})):''}
 else{const pace=[],dist=[];for(const{s,x}of hist){const d=num(x.dist),t=num(x.time);if(d>0)dist.push({t:s.start,v:d});if(d>0&&t>0)pace.push({t:s.start,v:cat==='run'?t/d:d/(t/3600)})}
  hero=`<div class="tiles"><div class="tile"><b>${hist.length}</b><span>sessions</span></div><div class="tile"><b>${fmtNum(dist.reduce((a,b)=>a+b.v,0),0)}<small>km</small></b><span>total</span></div><div class="tile"><b>${dist.length?fmtNum(Math.max(...dist.map(d=>d.v)),1):'—'}<small>km</small></b><span>longest</span></div></div>`;
  charts=(pace.length?chartCard(cat==='run'?'Pace':'Average speed',cat==='run'?fmtDur(pace[pace.length-1].v)+' /km':fmtNum(pace[pace.length-1].v,1)+' km/h',lineChart({series:[{pts:pace,color:'var(--accent)'}],fmt:v=>cat==='run'?fmtDur(v):fmtNum(v,1),invert:cat==='run'})):'')+(dist.length?chartCard('Distance','',lineChart({series:[{pts:dist,color:'var(--strain)'}],fmt:v=>fmtNum(v,0)})):'')}
 return `${topbar(name)}<div><div class="eyebrow">${CAT[cat]} · ${plural(hist.length,'session')}</div><h1 class="h1">${esc(name)}</h1></div>${hero}${charts}
 <label class="field"><span>My notes <em>shown every time you do it</em></span><textarea class="in" id="xnp" data-b="xn|${esc(n)}" placeholder="e.g. Seat height 4, wide grip">${esc(S.exNotes[n]||'')}</textarea></label>
 ${hist.length?`<div class="sec"><div class="h2">Sessions</div></div><div class="list">${hist.slice().reverse().slice(0,30).map(({s,x})=>`<button class="li" data-act="go" data-v="sdetail" data-id="${s.id}"><span class="grow"><span class="t">${fmtDate(s.start,{weekday:'short',day:'numeric',month:'short',year:'2-digit'})}</span><span class="s">${x.cat==='gym'?(x.sets||[]).filter(z=>z.t!=='w').map(z=>`${num(z.w)>0?fmtNum(z.w,1)+'×':''}${z.r}${z.t==='f'?'F':''}`).join(' · '):`${fmtNum(x.dist,2)} km · ${fmtDur(x.time)}`}</span></span><span class="chev">${ic('chev',18)}</span></button>`).join('')}</div>`:emptyBox('history','Not done yet','Sessions with this exercise appear here.')}`}
Object.assign(VIEWS,{exercise:vExercise,appearance:vAppearance,
 sdetail:(o=>{const base=VIEWS.sdetail;return p=>base(p).replace(/<div class="card"><div class="sec" style="margin:0"><div class="h3">([^<]+)<\/div>/g,(m,nm)=>`<div class="card"><div class="sec" style="margin:0"><button class="h3 exlink" data-act="go" data-v="exercise" data-key="${nm}">${nm} ${ic('chev',14)}</button>`)})()});
function vPRs(){return vPRsV3().replace(/<div class="prgroup"><span class="dot" style="--c:var\(--gym\)"><\/span>([^<]+)<\/div>/g,(x,nm)=>`<button class="prgroup exlink" data-act="go" data-v="exercise" data-key="${nm}"><span class="dot" style="--c:var(--gym)"></span>${nm} ${ic('chev',14)}</button>`)}
function vPlans(){return vPlansV4()}
function vStats(){const h=vStatsV4();const i=h.indexOf('</select></label>');return i<0?h:h.slice(0,i+17)+`<button class="btn sm line" data-act="go" data-v="exercise" data-key="${esc(exNames().get(ui.statEx)||ui.statEx||'')}">${ic('chev',14)} Open exercise page</button>`+h.slice(i+17)}
function vHistory(){return vHistoryV3()}

/* --- workout screen --- */
function startSession(s){if(S.active){toast('Finish or discard the current workout first');ui.sheet=null;openSession();return}ui.smode='focus';ui.fi=0;ui.fsMap={};S.active=s;save();openSession()}
function exTools(x){return x.flat?`<div class="extools"><button class="hot" data-act="liveStart" data-eid="${x.id}">${ic('play',14)} Interval timer</button></div>`:''}
const exHead=x=>`<button class="qbtn" data-act="swapSheet" data-eid="${x.id}" aria-label="Swap exercise">${ic('swap',17)}<span>Swap</span></button><button class="qbtn icon" data-act="exMenu" data-eid="${x.id}" aria-label="More for this exercise">${ic('dots',18)}</button>`;
function swapNote(x){return x.swappedFrom?`<div class="swapnote">${ic('swap',14)}<span>Swapped from <b>${esc(x.swappedFrom)}</b> for this workout</span><button class="btn sm ghost" data-act="swapBack" data-eid="${x.id}">${ic('undo',14)} Undo</button></div>`:''}
function sessExCard(x){let h=sessExCardV3(x);h=h.replace(/<button class="xbtn" data-act="sRmEx"[^>]*>[\s\S]*?<\/button><\/div>/,exHead(x)+'</div>'+swapNote(x));h=h.replace(`<p class="hint">Swapped from ${esc(x.swappedFrom||'')}</p>`,'');h=h.replace(/<button class="btn sm ghost" style="align-self:flex-start" data-act="fieldSheet"[^>]*>[\s\S]*?<\/button><\/div>$/,'</div>');return h}
function focusHTML(a){let h=focusHTMLV3(a);const x=a.ex[ui.fi||0];if(!x)return h;h=h.replace(`<p class="hint">Swapped from ${esc(x.swappedFrom||'')}</p>`,'');const i=h.indexOf('</h1>');if(i>0)h=h.slice(0,i+5)+`<div class="fswap">${exHead(x)}</div>${swapNote(x)}`+h.slice(i+5);return h}
function vSession(){return vSessionV3().replace('<button class="btn primary xl" data-act="finish">','<button class="btn primary xl hidebar" data-act="finish">')}
function sessProgress(){const a=S.active;let tot=0,dn=0;for(const x of a.ex){if(x.cat==='gym'){for(const z of x.sets){tot++;if(z.d)dn++}}else{tot++;if(exDone(x))dn++}}return{tot,dn}}
function renderRest(){const el=$('#restbar');const r=ui.rest;const inS=ui.stack[ui.stack.length-1]?.v==='session'&&S.active;if(!inS){el.hidden=true;el.classList.remove('done','resting');return}el.hidden=false;
 const p=sessProgress();const pct=p.tot?p.dn/p.tot:0;
 if(r){const left=Math.max(0,Math.round((r.end-Date.now())/1000));el.classList.add('resting');el.classList.toggle('done',left===0);
  el.innerHTML=`<span class="rt">${left?fmtDur(left):'Go'}</span><span class="rl">${left?'Rest':'Rest done'} · ${esc(r.name)}<br><span class="num">${p.dn}/${p.tot} done</span></span>${left?`<button data-act="restAdj" data-d="-15">−15</button><button data-act="restAdj" data-d="15">+15</button>`:''}<button data-act="restSkip">${left?'Skip':'OK'}</button><span class="prog" style="width:${left?(100-left/r.total*100).toFixed(1):100}%"></span>`;
  if(!left&&!r.buzzed){r.buzzed=true;beep(990,.25,.25);buzz([200,100,200]);setTimeout(()=>{if(ui.rest===r){ui.rest=null;renderRest()}},6000)}return}
 el.classList.remove('done','resting');const a=S.active;el.innerHTML=`<span class="sbprog"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="${(pct*100).toFixed(1)} 100" transform="rotate(-90 20 20)"/></svg></span><span class="rl"><b class="num">${p.dn} of ${p.tot}</b> done<br><span class="num" id="sbt">${a.past?'Logging':fmtDur((Date.now()-a.start)/1000)}</span></span><button class="finishb" data-act="finish">Finish</button>`}
setInterval(()=>{const t=$('#sbt');if(t&&S&&S.active&&!S.active.past)t.textContent=fmtDur((Date.now()-S.active.start)/1000)},1000);
Object.assign(SHEETS,{
 exmenu(){const x=S.active&&S.active.ex.find(z=>z.id===ui.exm);if(!x)return '';const o=(a,i,l,extra='',cls='')=>`<button class="opt ${cls}" data-act="${a}" data-eid="${x.id}" ${extra}>${ic(i,18)}<span class="grow">${l}</span></button>`;
  return `<div class="h2">${esc(x.name||'Exercise')}</div><div class="list">${o('exHist','history','History and my notes')}${o('exPage','chev','Open exercise page')}${o('swapSheet','swap','Swap for this workout')}${x.swappedFrom?o('swapBack','undo',`Back to ${esc(x.swappedFrom)}`):''}
  ${x.cat==='gym'?o('sAllDone','check','Tick all filled sets')+o('addWarm','flame','Add warm-up sets')+o('platesSheet','plate','Plate calculator')+(x.tempo?o('tempoSheet','metro',`Tempo ${esc(x.tempo)}`):''):''}${x.flat?o('liveStart','play','Interval timer'):''}${x.cat==='run'?o('convSheet','gauge','Treadmill converter'):''}
  ${o('toggleSS','repeat',x.ss?'Unlink superset':'Superset with the next exercise')}${o('fieldSheet','plus','Add a field')}${o('sRmEx','x','Remove from this workout','data-confirm="Tap again to remove"','dangerrow')}</div>`},
 swap(){const x=S.active.ex.find(z=>z.id===ui.swap.eid);const al=altsFor(x);const keep=ui.swap.keep!==false;const known=[...exNames().values()].filter(n=>norm(n)!==norm(x.name)&&!(al.list||[]).includes(n)&&lastEx(n,x.cat)).sort().slice(0,20);const nS=(x.sets||[]).filter(z=>z.t!=='w').length;
  return `<div class="h2">Swap ${esc(x.name||'exercise')}</div><p class="muted sm">Only for this workout. Your plan stays the same.</p>
  ${x.cat==='gym'?`<div class="card" style="padding:4px 16px">${sw(keep,'swapKeep','',`Keep ${nS} sets and their reps`)}</div><p class="hint">${keep?'Weights come from the last time you did the new exercise, if you have.':'Sets come from the last time you did the new exercise, or 3 empty sets.'}</p>`:''}
  <div class="search"><input class="in" id="sw-n" list="exnames" value="${esc(ui.swap.name)}" data-b="sw|name" placeholder="Type any exercise" autocomplete="off"><button class="btn primary" data-act="swapDo">Swap</button></div>
  ${al.list&&al.list.length?`<div class="eyebrow">Same muscle · ${MG[al.mg]}</div><div class="chips">${al.list.map(n=>`<button class="wchip" style="padding-left:12px;--c:var(--accent)" data-act="swapDo" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}${known.length?`<div class="eyebrow">Others you've done</div><div class="chips">${known.map(n=>`<button class="wchip" style="padding-left:12px" data-act="swapDo" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:''}`}});
Object.assign(ACT,{
 tab:d=>{const t=TABMAP[d.t]||d.t;if(TABMAP[d.t])ui.psub=d.t==='history'?'history':d.t==='prs'?'prs':'stats';ui.scroll[ui.tab]=window.scrollY;const same=ui.tab===t&&!ui.stack.length;ui.tab=t;ui.stack=[];ui.fan=false;ui.nav=same?null:'tab';render();window.scrollTo(0,same?0:0)},
 psub:d=>{ui.psub=d.val;render()},
 openCal:()=>{ui.tab='progress';ui.psub='history';ui.histMode='cal';ui.calMonth=monthStart(Date.now());ui.nav='tab';render();window.scrollTo(0,0)},
 exMenu:d=>{ui.exm=d.eid;ui.sheet={t:'exmenu'};renderSheet()},
 exPage:d=>{const x=curEx(d);ui.sheet=null;go('exercise',{key:x.name})},
 swapSheet:d=>{ui.swap={eid:d.eid,name:'',keep:true};ui.sheet={t:'swap'};renderSheet()},
 swapKeep:()=>{ui.swap.keep=ui.swap.keep===false;renderSheet()},
 swapDo:d=>{const n=(d.name||ui.swap.name||'').trim();if(!n){toast('Type the replacement exercise');return}const x=S.active.ex.find(z=>z.id===ui.swap.eid);if(norm(n)===norm(x.name)){ui.sheet=null;renderSheet();return}
  if(!x.orig)x.orig=clone({name:x.name,sets:x.sets,mg:x.mg,tgt:x.tgt,notes:x.notes,ref:x.ref,sug:x.sug,tempo:x.tempo});const was=x.name;x.swappedFrom=x.orig.name;x.name=n;x.notes='';x.ref=null;delete x.sug;delete x.tempo;
  if(x.cat==='gym'){x.mg=guessMG(n)||x.mg;const l=lastEx(n,'gym');const keep=ui.swap.keep!==false;
   if(keep){const lw=l&&l.sets?l.sets.filter(z=>z.t!=='w'):[];let i=0;x.sets=x.sets.filter(z=>z.t!=='w'||z.d).map(z=>{if(z.d)return z;const q=lw[i++];return{...z,w:q?q.w:'',rpe:''}});if(x.tgt)x.tgt=x.tgt.filter(t=>t.t!=='w').map(t=>({...t,w:''}))}
   else{x.sets=[...x.sets.filter(z=>z.d),...(l&&l.sets?l.sets.map(z=>({w:z.w,r:z.r,t:z.t||'',d:false,rpe:''})):[{w:'',r:'',t:'',d:false},{w:'',r:'',t:'',d:false},{w:'',r:'',t:'',d:false}])];x.tgt=null}}
  ui.sheet=null;save();render();toast(`${was} → ${n}`)},
 swapBack:d=>{const x=curEx(d);if(!x.orig)return;const o=x.orig;const done=x.sets?x.sets.filter(z=>z.d).length:0;x.name=o.name;x.mg=o.mg;x.tgt=o.tgt;x.notes=o.notes;x.ref=o.ref;if(o.tempo)x.tempo=o.tempo;if(x.cat==='gym'&&!done)x.sets=o.sets;delete x.orig;delete x.swappedFrom;ui.sheet=null;save();render();toast(`Back to ${x.name}`)},
 fanClose:()=>{ui.fan=false;renderFab()},
 dailyOpen:()=>{ui.fan=false;ui.sheet={t:'daily'};renderSheet();renderFab()},
 wSize:d=>{S.settings.wsize=S.settings.wsize||{};S.settings.wsize[d.k]=d.val;save();render()},
 wReset:()=>{S.settings.home=HOME_DEFAULT.map(([id,on])=>({id,on:!!on}));S.settings.wsize={};save();render();toast('Today reset')},
 setPref:d=>{S.settings[d.k]=d.val;applyTheme();save();render()},
 startFresh:()=>{const keep={accent:S.settings.accent,sync:S.sync,tourSeen:S.tourSeen,textSize:S.settings.textSize,motion:S.settings.motion,cards:S.settings.cards};S=emptyState();Object.assign(S.settings,{accent:keep.accent,textSize:keep.textSize,motion:keep.motion,cards:keep.cards});S.sync=keep.sync;S.tourSeen=keep.tourSeen;save();applyTheme();ui.ob=null;ui.stack=[{v:'onboard'}];ui.nav='push';render();toast('Sample data cleared')}});
const _actGo=ACT.go;
document.addEventListener('click',e=>{const b=e.target.closest('[data-fan]');if(b){ui.fan=false;setTimeout(renderFab,0)}},true);
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.live==='you'){const q=norm(e.target.value);document.querySelectorAll('.yrow').forEach(r=>{r.hidden=!!q&&!r.dataset.q.includes(q)&&!norm(r.textContent).includes(q)});document.querySelectorAll('.ygroup').forEach(g=>{g.hidden=!!q&&![...g.querySelectorAll('.yrow')].some(r=>!r.hidden)})}});
/* FAB long press */
let fabT=null;document.addEventListener('pointerdown',e=>{if(!e.target.closest('.fabbtn')||ui.fan)return;fabT=setTimeout(()=>{fabT=null;ui.fan=true;suppressClick(500);buzz(15);renderFab()},420)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>{if(fabT){clearTimeout(fabT);fabT=null}},true));
window.addEventListener('online',()=>{if(S&&!ui.stack.length&&ui.tab==='home')softRender()});window.addEventListener('offline',()=>{if(S&&!ui.stack.length&&ui.tab==='home')softRender()});
/* tour for the new layout */
TOUR.length=0;TOUR.push(
 {pre:()=>{ui.stack=[];ui.tab='home'},sel:'[data-sid="feat"] .feat',t:'Your big number',d:'Your streak, or any stat you choose. Tap Change to swap it.'},
 {sel:'[data-sid="start"] .btn',t:'Start a workout',d:'Tap it.',wait:'[data-act="startSheet"]'},
 {sel:'.sheet-panel .list',t:'Pick a workout',d:'Your plan comes first, with what is done this week. Tap Push.',wait:'[data-act="startW"]',delay:450},
 {sel:'.fhead',t:'Focus mode',d:'One exercise at a time. Swipe left or right to move between exercises.'},
 {sel:'.fswap',t:'Machine taken?',d:'Swap swaps the exercise just for this workout and can keep its sets and reps. The dots open history, plates, warm-ups and more.'},
 {sel:'.fpanel',t:'Big controls',d:'Tap − or +, hold them to go faster, or drag the number up and down.'},
 {sel:'[data-act="fDone"]',t:'Done set',d:'Tap it when you finish a set. Only finished sets are saved.',wait:'[data-act="fDone"]'},
 {sel:'#restbar',t:'Rest and progress',d:'The rest timer starts by itself. Double-tap it for +30 s. Between sets, this bar shows your progress and Finish.'},
 {sel:'[data-act="smode"][data-val="list"]',t:'All exercises',d:'Switch to the full list any time. There you can also swipe a set right to tick it.'},
 {sel:'.topbar [data-act="finish"]',t:'Finish',d:'Tap Finish.',wait:'[data-act="finish"]'},
 {sel:'[data-act="finishTicked"]',t:'Only what you did',d:'Sets you did not finish are left out. Tap Save ticked sets only.',wait:'[data-act="finishTicked"]'},
 {sel:'.sumhero',t:'Summary',d:'Strain, volume and records, compared with last time. Share card makes an image for your stories.'},
 {pre:()=>{ui.stack=[];ui.tab='home'},sel:'.fabbtn',t:'Quick log',d:'Log padel or a walk in seconds. Press and hold for more shortcuts: weight, check-in, past workouts.'},
 {sel:'[data-sid="ready"] .card',t:'Readiness and strain',d:'How much you can push today, and how hard today has been. The background colour follows your readiness.'},
 {pre:()=>{ui.stack=[];ui.tab='train'},sel:'.tools8',t:'Train',d:'Ready-made plans, the planner, mobility, a 1RM test, race tools and more.'},
 {pre:()=>{ui.stack=[];ui.tab='progress';ui.psub='stats'},sel:'.psubseg',t:'Progress',d:'Stats, history, records and more in one place. Tap an exercise name anywhere to open its own page.'},
 {pre:()=>{ui.stack=[];ui.tab='you'},sel:'#ysearch',t:'You',d:'Goals, body, gear, connections and settings, grouped and searchable.'},
 {pre:()=>{ui.stack=[];ui.tab='home'},sel:'[data-act="go"][data-v="customize"]',t:'Make Today yours',d:'Choose cards, order and size. Or press and hold a card on Today and drag it.'},
 {sel:null,t:"You're all set",d:'That was sample data. Your own data is back exactly as you left it. Replay the tour any time from You.'});
const _tourStartV5=ACT.tourStart;ACT.tourStart=()=>{ui.fan=false;tourStart()};
