/* ================= v4 actions ================= */
function resolve(b){const a=b.split('|');try{switch(a[0]){
 case 'ck':{let c=todayCheck();if(!c){c={id:uid(),t:Date.now(),e:'',sl:'',so:''};S.checkins.push(c)}return[c,a[1]]}
 case 'grf':return[ui.gearF,a[1]];case 'ijf':return[ui.injF,a[1]];case 'jrf':return[ui.jF,a[1]];case 'rm':return[ui.rm,a[1]];
}}catch(e){}return resolveV3(b)}
UI_BINDS.push('grf','ijf','jrf','rm');
function imgTarget(t){const a=t.split('|');if(a[0]==='journal')return ui.jF;if(a[0]==='plan')return planById(a[1]);if(a[0]==='wk')return wkOf(planById(a[1]),a[2]);if(a[0]==='ex')return exOf(a[1],a[2],a[3]);return null}

/* --- interval timer --- */
let lvT=null;
function lvElapsed(){const lv=ui.lv;if(!lv)return 0;return ((lv.paused?lv.paused:Date.now())-lv.t0-lv.pz)/1000}
function lvTick(){const lv=ui.lv;if(!lv||ui.stack[ui.stack.length-1]?.v!=='live')return;const x=S.active&&S.active.ex.find(z=>z.id===lv.eid);if(!x){stopLive();return}const q=x.flat[lv.i];const el=lvElapsed();const t=$('#lvt');
 if(q.by==='time'){const left=Math.max(0,num(q.v)-el);if(t)t.textContent=fmtDur(Math.ceil(left));const s=Math.ceil(left);if(!lv.paused&&s<=3&&s>0&&lv.last!==s){lv.last=s;beep(660,.08)}if(!lv.paused&&left<=0){liveAdvance(false);return}}
 else{if(t)t.textContent=fmtDur(el);const pr=x.cat==='run'?parsePace(q.tgt):null;const sub=$('#lvsub');if(sub&&pr&&el>0){const lo=pr[0]*q.v/1000,hi=pr[1]*q.v/1000;sub.innerHTML=`${fmtM(q.v,x.cat)} · ${el<lo?'ahead of':el<=hi?'on':'behind'} target`}}
 const pf=$('#lvprof');if(pf){pf.querySelectorAll('rect').forEach((r,i)=>r.setAttribute('opacity',i<lv.i?.35:i===lv.i?1:.6))}}
function liveAdvance(lap){const lv=ui.lv;const x=S.active.ex.find(z=>z.id===lv.eid);const q=x.flat[lv.i];const el=Math.round(lvElapsed());
 if(q.by==='dist'&&lap)x.splits[lv.i].t=el;
 lv.i++;lv.t0=Date.now();lv.pz=0;lv.paused=null;lv.last=null;beep(990,.2,.25);buzz([120,60,120]);save();
 if(lv.i>=x.flat.length){stopLive();const q2=splitSum(x);if(q2.c){x.dist=Math.round(q2.m/10)/100;x.time=q2.t}save();ui.stack.pop();render();toast('Intervals done. Splits saved.');return}render()}
function stopLive(){clearInterval(lvT);lvT=null}
/* --- mobility player --- */
let mpT=null;
function mpTick(){const m=ui.mob;if(!m||ui.stack[ui.stack.length-1]?.v!=='mplay')return;const r=ROUTINES.find(x=>x.id===m.id);const mv=r.moves[m.i];const el=((m.paused||Date.now())-m.t0-m.pz)/1000;const left=Math.max(0,mv[1]-el);
 const t=$('#mpt');if(t)t.textContent=fmtDur(Math.ceil(left));const rg=$('#mpring');if(rg)rg.setAttribute('stroke-dasharray',`${(Math.min(1,el/mv[1])*100).toFixed(2)} 100`);
 const s=Math.ceil(left);if(!m.paused&&s<=3&&s>0&&m.last!==s){m.last=s;beep(660,.07)}if(!m.paused&&left<=0)mpNext()}
function mpNext(){const m=ui.mob;const r=ROUTINES.find(x=>x.id===m.id);m.done+=(((m.paused||Date.now())-m.t0-m.pz)/1000);m.i++;m.t0=Date.now();m.pz=0;m.paused=null;m.last=null;beep(990,.2,.25);buzz(150);
 if(m.i>=r.moves.length){clearInterval(mpT);mpT=null;const s=newAdhoc('Mobility','other',true);s.start=m.start;s.duration=Math.round(m.done);s.ex=[Object.assign(blankEx(r.name,'other'),{time:Math.round(m.done),desc:r.moves.map(x=>x[0]).join(', ')})];s.type='custom';s.customName='Mobility';commitSession(s,{celebrate:false});ui.mob=null;ui.stack=[];ui.tab='home';render();toast(`${r.name} done and logged`);return}render()}
/* --- tempo metronome --- */
let tmT=null;
function tmTick(){const t=ui.tm;if(!t||!t.run||!ui.sheet||ui.sheet.t!=='tempo'){clearInterval(tmT);tmT=null;return}const cyc=t.parts.reduce((a,b)=>a+b,0)||1;const el=(Date.now()-t.t0)/1000;const reps=Math.floor(el/cyc);const inC=el-reps*cyc;let acc=0,ph=0;for(let i=0;i<4;i++){if(inC<acc+t.parts[i]){ph=i;break}acc+=t.parts[i]}
 const names=['Down','Pause','Up','Pause'];if(t.ph!==ph||t.reps!==reps){if(t.parts[ph]>0)beep(ph===2?880:ph===0?520:700,.06,.15);t.ph=ph;t.reps=reps}
 const n=$('#tmn'),p=$('#tmph'),b=$('#tmbar');if(n)n.textContent=reps;if(p)p.textContent=names[ph]+(t.parts[ph]?` · ${t.parts[ph]}s`:'');if(b){const f=t.parts[ph]?(inC-acc)/t.parts[ph]:1;const pos=ph===0?f:ph===1?1:ph===2?1-f:0;b.style.height=(pos*100).toFixed(1)+'%'}}

/* --- actions --- */
Object.assign(ACT,{
 ckDone:()=>{ui.ckEdit=false;render()},
 tourDismiss:()=>{S.tourSeen=true;save();render()},
 startFresh:()=>{const keep={theme:S.settings.theme,accent:S.settings.accent,sync:S.sync,tourSeen:S.tourSeen};S=emptyState();S.settings.theme=keep.theme;S.settings.accent=keep.accent;S.sync=keep.sync;S.tourSeen=keep.tourSeen;save();applyTheme();ui.ob=null;ui.stack=[{v:'onboard'}];render();toast('Sample data cleared')},
 obSet:d=>{const o=ui.ob;o[d.k]=d.k==='days'?+d.v:d.v;if(d.k==='goal'){o.step=1}else if(d.k==='exp'){o.step=3}render();window.scrollTo(0,0)},
 obNext:()=>{ui.ob.step++;render();window.scrollTo(0,0)},
 obCreate:d=>{const o=ui.ob||{days:3};const p=libCreate(d.id,{activate:true});S.goals=S.goals.filter(g=>!(g.kind==='workouts'&&g.period==='week'));S.goals.push({id:uid(),kind:'workouts',period:'week',target:o.days||p.workouts.length});
  if(o.goal==='run'||p.workouts.some(w=>w.type==='run')){if(!S.goals.some(g=>g.kind==='runKm'))S.goals.push({id:uid(),kind:'runKm',period:'month',target:o.exp==='new'?20:o.days>=4?100:50})}
  save();ui.ob=null;ui.stack=[{v:'plan',id:p.id}];ui.tab='plans';render();window.scrollTo(0,0);toast(`${p.name} is your active plan`)},
 obSkip:()=>{ui.ob=null;ui.stack=[];ui.tab='plans';render()},
 libUse:d=>{const p=libCreate(d.id);ui.stack=[{v:'plan',id:p.id}];ui.tab='plans';render();window.scrollTo(0,0);toast('Plan added')},
 libFilter:d=>{ui.libf=d.val;render()},
 planAdapt:d=>{const p=planById(d.id);p.prog.adapt=!p.prog.adapt;save();render()},
 /* planner */
 plWeek:d=>{ui.plw=(ui.plw||0)+(+d.n);render()},
 plPick:d=>{ui.sheet={t:'plPick',d:d.d};renderSheet()},
 plAdd:d=>{const ex=S.schedule.find(x=>x.date===d.d&&x.wid===d.wid);if(ex){S.schedule=S.schedule.filter(x=>x!==ex);tomb(ex.id)}else S.schedule.push({id:uid(),date:d.d,pid:d.pid,wid:d.wid});save();render()},
 plChip:d=>{ui.sheet={t:'plChip',id:d.id};renderSheet()},
 plMove:d=>{const x=S.schedule.find(q=>q.id===d.id);x.date=d.d;ui.sheet=null;save();render()},
 plDel:d=>{S.schedule=S.schedule.filter(q=>q.id!==d.id);tomb(d.id);ui.sheet=null;save();render()},
 plClear:()=>{const ws=addDays(weekStart(Date.now()),7*(ui.plw||0));const ds=new Set(Array.from({length:7},(_,i)=>ymd(addDays(ws,i))));S.schedule.filter(x=>ds.has(x.date)).forEach(x=>tomb(x.id));S.schedule=S.schedule.filter(x=>!ds.has(x.date));save();render()},
 plAuto:()=>{const p=activePlan();if(!p||!p.workouts.length){toast('Choose an active plan first');return}const ws=addDays(weekStart(Date.now()),7*(ui.plw||0));const today=sod(Date.now());
  const days=Array.from({length:7},(_,i)=>addDays(ws,i)).filter(t=>t>=today);if(!days.length){toast('This week is over');return}
  const ws2=p.mode==='seq'?(()=>{const out=[];let i=seqDay(p)?seqDay(p).i:0;for(const t of days){const d=p.days[i%p.days.length];if(d)for(const id of d.w)out.push([t,id]);i++}return out})():(()=>{const done=weekDone(p,ws);const todo=p.workouts.filter(w=>!done.has(w.id));const n=todo.length;const step=days.length/Math.max(1,n);return todo.map((w,i)=>[days[Math.min(days.length-1,Math.floor(i*step))],w.id])})();
  let added=0;for(const[t,wid]of ws2){const d=ymd(t);if(!S.schedule.some(x=>x.date===d&&x.wid===wid)){S.schedule.push({id:uid(),date:d,pid:p.id,wid});added++}}save();render();toast(added?`${plural(added,'workout')} planned`:'Already planned')},
 /* challenges */
 chJoin:d=>{S.challenges.push({id:uid(),month:monthStart(Date.now()),kind:d.k,target:+d.n});save();render();toast('Challenge on')},
 chDel:d=>{S.challenges=S.challenges.filter(c=>c.id!==d.id);tomb(d.id);save();render()},
 /* gear */
 gearAdd:()=>{ui.gearF={kind:'shoe',name:'',startKm:'',limit:''};ui.sheet={t:'gearAdd'};renderSheet()},
 gearKind:d=>{ui.gearF.kind=d.val;renderSheet()},
 gearSave:()=>{const f=ui.gearF;if(!f.name.trim()){toast('Give it a name');return}S.gear.push({id:uid(),kind:f.kind,name:f.name.trim(),startKm:num(f.startKm)||0,limit:num(f.limit)||(f.kind==='shoe'?700:''),retired:false});ui.sheet=null;save();render()},
 gearRetire:d=>{const g=S.gear.find(x=>x.id===d.id);g.retired=!g.retired;save();render()},
 gearDel:d=>withUndo('Gear deleted',()=>{S.gear=S.gear.filter(x=>x.id!==d.id);tomb(d.id);save();render()}),
 /* injuries */
 injAdd:()=>{ui.injF={area:'knee',sev:2,notes:''};ui.sheet={t:'injAdd'};renderSheet()},
 injArea:d=>{ui.injF.area=d.k;renderSheet()},injSev:d=>{ui.injF.sev=+d.n;renderSheet()},
 injSave:()=>{const f=ui.injF;S.injuries.push({id:uid(),area:f.area,since:Date.now(),notes:f.notes.trim(),resolved:null,log:[{t:Date.now(),sev:f.sev}]});ui.sheet=null;save();render();toast('Exercises that load it will be flagged')},
 injLog:d=>{const i=S.injuries.find(x=>x.id===d.id);const k=ymd(Date.now());i.log=i.log||[];const l=i.log.find(e=>ymd(e.t)===k);if(l)l.sev=+d.n;else i.log.push({t:Date.now(),sev:+d.n});save();render()},
 injResolve:d=>{const i=S.injuries.find(x=>x.id===d.id);i.resolved=Date.now();save();render();toast('Glad it healed')},
 /* journal */
 jAdd:()=>{const b=[...S.body].sort((x,y)=>x.t-y.t);ui.jF={text:'',kg:'',date:ymd(Date.now()),img:''};ui.sheet={t:'jAdd'};renderSheet()},
 jSave:()=>{const f=ui.jF;if(!f.text.trim()&&!f.img&&!num(f.kg)){toast('Write something or add a photo');return}const t=new Date(f.date+'T12:00').getTime();S.journal.push({id:uid(),t:isFinite(t)?t:Date.now(),text:f.text.trim(),kg:num(f.kg),img:f.img});if(num(f.kg)>0)S.body.push({id:uid(),t:isFinite(t)?t:Date.now(),kg:num(f.kg),bf:'',waist:''});ui.sheet=null;save();render()},
 jDel:d=>withUndo('Entry deleted',()=>{S.journal=S.journal.filter(j=>j.id!==d.id);tomb(d.id);save();render()}),
 /* year */
 yrSet:d=>{ui.yr=+d.n;render()},
 yearShare:async d=>{const c=yearCanvas(+d.n);const url=c.toDataURL('image/png');try{const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=new File([blob],`tempo-${d.n}.png`,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:`My ${d.n}`});return}}catch(e){if(e&&e.name==='AbortError')return}ui.sheet={t:'share',url};renderSheet()},
 /* mobility */
 mobStart:d=>{ui.mob={id:d.id,i:0,t0:Date.now(),pz:0,paused:null,done:0,start:Date.now()};beep(880,.05,.05);grabWake();go('mplay');clearInterval(mpT);mpT=setInterval(mpTick,250)},
 mobPause:()=>{const m=ui.mob;if(m.paused){m.pz+=Date.now()-m.paused;m.paused=null}else m.paused=Date.now();render()},
 mobSkip:()=>mpNext(),
 mobStop:()=>{clearInterval(mpT);mpT=null;ui.mob=null;dropWake();back()},
 /* live intervals */
 liveStart:d=>{ui.lv={eid:d.eid,i:Math.max(0,(curEx(d).splits||[]).findIndex(z=>!z.t&&!z.m)),t0:Date.now(),pz:0,paused:null};beep(880,.05,.05);grabWake();go('live');stopLive();lvT=setInterval(lvTick,200)},
 liveLap:()=>liveAdvance(true),
 livePause:()=>{const lv=ui.lv;if(lv.paused){lv.pz+=Date.now()-lv.paused;lv.paused=null}else lv.paused=Date.now();render()},
 liveBack:()=>{const lv=ui.lv;lv.i=Math.max(0,lv.i-1);lv.t0=Date.now();lv.pz=0;lv.paused=null;render()},
 liveExit:()=>{stopLive();back()},
 /* tempo */
 tempoSheet:d=>{const x=curEx(d);const parts=String(x.tempo||'').split(/[-\s/]/).map(v=>/x/i.test(v)?0:num(v)||0).concat([0,0,0,0]).slice(0,4);ui.tm={str:x.tempo,parts,run:false,reps:0,t0:0};ui.sheet={t:'tempo'};renderSheet()},
 tempoGo:()=>{const t=ui.tm;t.run=!t.run;if(t.run){t.t0=Date.now()-t.reps*t.parts.reduce((a,b)=>a+b,0)*1000;clearInterval(tmT);tmT=setInterval(tmTick,60)}renderSheet()},
 tempoReset:()=>{const t=ui.tm;t.run=false;t.reps=0;renderSheet()},
 /* 1RM */
 rmBegin:()=>{const t=ui.rm;if(!t.ex.trim()){toast('Enter the exercise');return}if(!(num(t.est)>0)){const pr=computePRs()[`g:${norm(t.ex)}:1rm`];if(pr)t.est=pr.best.value;else{toast('Enter your estimated 1RM');return}}t.i=0;t.res=[];t.start=Date.now();render()},
 rmRes:d=>{const t=ui.rm;const s=rmPlan(t)[t.i];t.res.push({w:s.w,r:s.r,ok:d.ok==='1',att:s.att||0});t.i++;if(s.att&&d.ok!=='1'&&t.res.filter(r=>r.att&&!r.ok).length>=2)t.i=99;render();window.scrollTo(0,0)},
 rmSave:()=>{const t=ui.rm;const s=newAdhoc('1RM test · '+t.ex,'gym',true);s.start=t.start||Date.now();s.duration=Math.round((Date.now()-s.start)/1000)||1500;s.type='gym';s.ex=[Object.assign(blankEx(t.ex,'gym'),{sets:t.res.filter(r=>r.ok).map(r=>({w:r.w,r:r.r,t:r.att?'':'w',d:true}))})];const r=commitSession(s,{celebrate:true});ui.rm=null;ui.summary={id:r.s.id,news:r.news,ach:r.ach};ui.stack=[{v:'summary',id:r.s.id}];render()},
 rmReset:()=>{ui.rm.i=-1;ui.rm.res=[];render()}});
function yearCanvas(y){const W=1080,H=1350;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const acc=(ACCENTS[S.settings.accent]||ACCENTS.blue)[0];const F='-apple-system,BlinkMacSystemFont,system-ui,Roboto,sans-serif';
 const a=new Date(y,0,1).getTime(),b=new Date(y+1,0,1).getTime();const m=periodMetrics(a,b);g.fillStyle='#000';g.fillRect(0,0,W,H);const gr=g.createRadialGradient(W*.5,H*.32,20,W*.5,H*.32,700);gr.addColorStop(0,hexA(acc,.35));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.fillStyle='#F3F4F6';g.font=`600 46px ${F}`;g.fillText('tempo',80,130);g.fillStyle=acc;g.fillText('.',80+g.measureText('tempo').width,130);
 g.fillStyle='#8C93A0';g.font=`600 30px ${F}`;g.fillText(`MY ${y}`,80,240);g.fillStyle='#F3F4F6';g.font=`200 300px ${F}`;g.fillText(String(m.n),70,540);g.font=`500 44px ${F}`;g.fillStyle='#8C93A0';g.fillText('workouts',86,610);
 const st=[[fmtHM(m.t),'TRAINED'],[String(m.days),'ACTIVE DAYS'],[fmtNum(m.run,0)+' km','RUNNING'],[fmtNum(m.bike,0)+' km','CYCLING'],[fmtNum(m.vol/1000,0)+' t','LIFTED'],[String(m.prs),'RECORDS']];
 st.forEach((q,i)=>{const x=80+(i%2)*470,yy=760+Math.floor(i/2)*170;g.fillStyle='#8C93A0';g.font=`600 26px ${F}`;g.fillText(q[1],x,yy);g.fillStyle='#F3F4F6';g.font=`300 84px ${F}`;g.fillText(q[0],x,yy+86)});
 g.fillStyle=acc;g.fillRect(80,H-110,120,6);return c}
