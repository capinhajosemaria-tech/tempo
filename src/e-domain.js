/* ================= v3 domain ================= */
const round2=v=>Math.round(v*100)/100;
const ACCENTS={blue:['#3D7BFF','#FFFFFF','Volt'],mint:['#2EE6A6','#04130D','Mint'],amber:['#FFB020','#1A1200','Amber'],red:['#FF4D5E','#FFFFFF','Crimson'],violet:['#9D7CFF','#FFFFFF','Violet']};
const HOME_WIDGETS=[['ready','Readiness and strain'],['feat','Highlighted stat'],['start','Start workout button'],['upnext','Up next'],['recap','Weekly recap'],['insights','Insights and alerts'],['quick','Quick log'],['week','This week'],['plan','Active plan'],['race','Race countdown'],['goals','Goals'],['repeat','Repeat last workout'],['last','Last workout']];
function emptyStateV3(){return {v:3,sample:false,plans:[],activePlanId:null,sessions:[],seqLog:[],weekSummaries:[],prs:[],goals:[],body:[],checkins:[],exNotes:{},race:null,recapSeen:0,dismissed:{},strava:emptyStrava(),settings:{featured:{k:'weekStreak'},theme:'dark',accent:'blue',inc:2.5,zones:{},home:HOME_WIDGETS.map(([id])=>({id,on:true}))},active:null,lastBackup:null,sync:emptySync(),tomb:{},metaU:0}}
function migrateV3(st){const base=emptyState();const wasV=st.v||1;st=Object.assign(base,st);st.settings=Object.assign(emptyState().settings,st.settings||{});st.strava=Object.assign(emptyStrava(),st.strava||{});st.sync=Object.assign(emptySync(),st.sync||{});st.tomb=st.tomb||{};st.checkins=st.checkins||[];st.exNotes=st.exNotes||{};st.dismissed=st.dismissed||{};
 if(wasV<3&&st.settings.theme==='system')st.settings.theme='dark';
 const have=new Set((st.settings.home||[]).map(w=>w.id));for(const[id]of HOME_WIDGETS)if(!have.has(id))st.settings.home.push({id,on:true});st.settings.home=st.settings.home.filter(w=>HOME_WIDGETS.some(h=>h[0]===w.id));
 for(const p of st.plans){p.days=p.days||[];for(const w of p.workouts)for(const e of w.exercises){fixTpl(e);if(e.progBy===undefined)e.progBy='reps';if(e.rpeT===undefined)e.rpeT=8}}
 for(const s of st.sessions)for(const x of s.ex)fixSess(x);if(st.active)st.active.ex.forEach(fixSess);for(const w of st.weekSummaries)w.extra=w.extra||[];st.v=3;return st}
function applyAccent(){const a=ACCENTS[S&&S.settings.accent]||ACCENTS.blue;const r=document.documentElement.style;r.setProperty('--accent',a[0]);r.setProperty('--on-accent',a[1])}
function applyTheme(){const t=S&&S.settings.theme;const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else if(r.dataset.themeOwn)r.removeAttribute('data-theme');r.dataset.themeOwn=(t==='light'||t==='dark')?'1':'';applyAccent();const m=document.querySelector('meta[name="theme-color"]:not([media])');if(m)m.content=getComputedStyle(document.body||r).getPropertyValue('--bg').trim()||'#070809'}

/* --- load, strain, readiness, check-ins --- */
function sessRPE(s){if(num(s.rpe)>0)return num(s.rpe);let r=null;for(const x of s.ex){const v=num(x.vals&&x.vals.rpe);if(v>0)r=Math.max(r||0,v)}return r}
function sessLoad(s){const min=(s.duration||0)/60;return min*(sessRPE(s)||({gym:6,run:6,bike:5,other:5}[typeKey(s)]))}
function loadIn(a,b){return sessionsIn(a,b).reduce((t,s)=>t+sessLoad(s),0)}
const strainOf=load=>Math.min(21,21*(1-Math.exp(-load/700)));
function acwr(at){const now=at||Date.now();const a=loadIn(now-7*DAY,now+1);const c=loadIn(now-28*DAY,now+1)/4;return c>20?a/c:null}
function todayCheck(){const k=ymd(Date.now());for(let i=S.checkins.length-1;i>=0;i--)if(ymd(S.checkins[i].t)===k)return S.checkins[i];return null}
function readinessV3(){let sc=68;const r=acwr();if(r!=null){if(r>1.5)sc-=12+(r-1.5)*60;else if(r>1.25)sc-=(r-1.25)*40;else if(r<0.8)sc+=6}
 const ck=todayCheck();if(ck){if(ck.e)sc+=(ck.e-3)*6;if(ck.sl)sc+=(ck.sl-3)*7;if(ck.so)sc-=(ck.so-3)*6}
 const t0=sod(Date.now());sc-=Math.min(16,strainOf(loadIn(t0-DAY,t0))*0.9);
 const last=S.sessions[S.sessions.length-1];if(last&&Date.now()-last.start>2*DAY)sc+=6;
 return Math.round(Math.max(1,Math.min(99,sc)))}
const readyBand=v=>v>=67?['var(--ok)','Ready to push']:v>=34?['var(--warn)','Steady day']:['var(--bad)','Take it easy'];

/* --- pace and heart-rate zones --- */
const PZ=[['Z1','Recovery',.62,.74],['Z2','Easy',.74,.83],['Z3','Tempo',.83,.9],['Z4','Threshold',.9,.97],['Z5','Interval',.97,1.08]];
const HZ=[['Z1','Recovery',.5,.6],['Z2','Endurance',.6,.7],['Z3','Tempo',.7,.8],['Z4','Threshold',.8,.9],['Z5','Max',.9,1]];
function base5k(){const z=S.settings.zones||{};const manual=parseDur(z.t5);if(manual>0)return{t:manual,src:'manual'};const r=computePRs()['r:5k'];return r&&r.best?{t:r.best.value,src:'record'}:null}
function paceZones(){const b=base5k();if(!b)return null;const p=b.t/5;return PZ.map(([k,l,lo,hi])=>({k,l,fast:Math.round(p/hi),slow:Math.round(p/lo)}))}
function maxHR(){const z=S.settings.zones||{};if(num(z.maxhr)>0)return num(z.maxhr);let m=0;for(const s of S.sessions)for(const x of s.ex)m=Math.max(m,num(x.vals&&x.vals.maxhr)||0);return m||null}
function hrZones(){const m=maxHR();if(!m)return null;return HZ.map(([k,l,lo,hi])=>({k,l,lo:Math.round(m*lo),hi:Math.round(m*hi)}))}
function parsePace(s){const str=String(s||'');const m=str.match(/(\d{1,2}:\d{2})(?:\s*(?:-|–|to)\s*(\d{1,2}:\d{2}))?/);if(m){const a=parseDur(m[1]),b=m[2]?parseDur(m[2]):a;return[Math.min(a,b),Math.max(a,b)]}
 const z=str.match(/^\s*z(?:one)?\s*([1-5])\b/i);if(z&&S){const pz=paceZones();if(pz){const q=pz[+z[1]-1];return[q.fast,q.slow]}}return null}
function zoneOfPace(p){const pz=paceZones();if(!pz||!(p>0))return null;for(let i=4;i>=0;i--)if(p<=pz[i].slow)return i;return 0}

/* --- plan progression by weeks --- */
function planWeek(p){const start=weekStart(p.progStart||p.created||Date.now());return Math.max(1,Math.floor((weekStart(Date.now())-start)/(7*DAY))+1)}
function planProg(p){const g=p&&p.prog;if(!g||!g.on)return null;const w=planWeek(p);const de=num(g.deloadEvery)||0;const deload=de>1&&w%de===0;const nDel=de>1?Math.floor((w-1)/de):0;return{w,deload,steps:Math.max(0,w-1-nDel),kg:num(g.kg)||0,runPct:num(g.runPct)||0,deloadPct:num(g.deloadPct)||40}}

/* --- gym helpers --- */
function warmupSets(top,bar=20){if(!(top>bar))return[];const out=[{w:bar,r:10,t:'w'}];for(const[p,r]of[[.4,8],[.6,5],[.8,3]]){const v=Math.round(top*p/2.5)*2.5;if(v>bar&&v<top&&!out.some(z=>z.w===v))out.push({w:v,r,t:'w'})}return out}
const PLATES=[[25,'var(--gym)'],[20,'var(--run)'],[15,'var(--bike)'],[10,'var(--other)'],[5,'#E6E8EC'],[2.5,'#A3A9B4'],[1.25,'#6E7581']];
function platesFor(total,bar){let side=(total-bar)/2;if(!(side>=0))return null;const out=[];for(const[p]of PLATES){while(side>=p-1e-9){out.push(p);side=round2(side-p)}}return{out,rest:side}}
function progression(e){if(e.cat!=='gym'||e.prog===false||e.bw)return null;const last=lastEx(e.name,'gym');if(!last||!last.sets)return null;
 const tW=(e.sets||[]).filter(z=>z.t!=='w');const lW=last.sets.filter(z=>z.t!=='w');if(!lW.length)return null;const top=Math.max(0,...lW.map(z=>num(z.w)||0));if(!top)return null;const inc=num(e.inc)||num(S.settings.inc)||2.5;
 if(e.progBy==='rpe'){const rp=lW.map(z=>num(z.rpe)).filter(v=>v>0);if(!rp.length)return null;const avg=rp.reduce((a,b)=>a+b,0)/rp.length;const tgt=num(e.rpeT)||8;
  if(avg<=tgt-0.5)return{hit:true,dir:1,from:top,to:round2(top+inc),inc,why:`Average RPE was ${fmtNum(avg,1)} last time, under your target of ${tgt}.`};
  if(avg>=Math.min(10,tgt+1.5))return{hit:true,dir:-1,from:top,to:round2(Math.max(0,top-inc)),inc,why:`Average RPE was ${fmtNum(avg,1)} last time, well over ${tgt}.`};return null}
 const hit=lW.every((z,i)=>{const t=tW[i];if(!t||t.t==='f'||z.t==='f'||t.r===''||t.r==null)return num(z.r)>0||z.t==='f';return num(z.r)>=num(t.r)});
 return hit?{hit:true,dir:1,from:top,to:round2(top+inc),inc,why:'You hit every target last time.'}:null}
function exFromTpl(e,ref,pg){const last=lastEx(e.name,e.cat);const x={id:uid(),name:e.name,cat:e.cat,ref,tgt:null,notes:e.notes||'',rest:e.rest,bw:!!e.bw,extra:[...(e.extra||[])],custom:clone(e.custom||[]),vals:{},mg:e.cat==='gym'?(e.mg||guessMG(e.name)):'',ss:!!e.ss,progBy:e.progBy||'reps',inc:num(e.inc)||''};
 if(e.cat==='gym'){let t=(e.sets&&e.sets.length)?clone(e.sets):[{r:'',w:'',t:''}];
  if(pg)t=t.map(z=>{if(z.t==='w'||!(num(z.w)>0))return z;let w=num(z.w)+pg.kg*pg.steps;if(pg.deload)w*=1-pg.deloadPct/100;return{...z,w:Math.round(w/2.5)*2.5}});
  if(e.autoWarm&&!t.some(z=>z.t==='w')){const top=Math.max(0,...t.map(z=>num(z.w)||0));t=[...warmupSets(top),...t]}
  x.tgt=t.map(z=>({r:z.r,w:z.w,t:z.t||''}));
  const lW=last&&last.sets?last.sets.filter(z=>z.t!=='w'):[];let wi=0;
  x.sets=t.map(z=>{let w=z.w,r=z.r;if(!pg&&z.t!=='w'){const l=lW[wi];if(l){if(l.w!=='')w=l.w;if(l.r!=='')r=l.r}}if(z.t!=='w')wi++;return{w,r,t:z.t||'',d:false,rpe:''}});
  if(!pg){const pr=progression(e);if(pr)x.sug=pr}}
 else{x.dist='';x.time='';x.elev='';x.desc=e.cat==='other'?(e.desc||''):'';let d=e.dist;if(pg&&num(d)>0){d=num(d)*Math.pow(1+pg.runPct/100,pg.steps);if(pg.deload)d*=1-pg.deloadPct/100;d=Math.round(d*10)/10}x.tgt={dist:d,time:e.time,pace:e.tgt};
  if((e.cat==='run'||e.cat==='bike')&&e.mode==='struct'&&e.steps.length){x.flat=flatSteps(e.steps);x.splits=x.flat.map(()=>({t:'',m:''}))}}
 return x}
function newSessionV3(p,w,past){const pg=planProg(p);const s={id:uid(),start:past?Date.now()-3600e3:Date.now(),planId:p.id,workoutId:w.id,name:w.name||'Workout',type:w.type,customName:w.customName,notes:'',past:!!past,duration:past?3600:'',ex:w.exercises.map(e=>exFromTpl(e,[p.id,w.id,e.id],pg))};
 if(pg){s.planWeek=pg.w;s.deload=pg.deload}const ck=todayCheck();if(ck)s.check={e:ck.e,sl:ck.sl,so:ck.so};return s}
function repeatOfV51(s){if(s.planId){const p=planById(s.planId),w=wkOf(p,s.workoutId);if(p&&w)return newSession(p,w,false)}
 const n=newAdhoc(s.name,typeKey(s),false);return n}
function exHistory(name,cat){const n=norm(name);const out=[];for(let i=S.sessions.length-1;i>=0&&out.length<12;i--){const s=S.sessions[i];const x=s.ex.find(z=>norm(z.name)===n&&(!cat||z.cat===cat));if(x)out.push({s,x})}return out}

/* --- race predictor --- */
function predictTime(km){const m=computePRs();let best=null;for(const[k,d]of[['r:5k',5],['r:10k',10],['r:hm',21.0975],['r:m',42.195]]){const r=m[k];if(!r||!r.best)continue;const t=r.best.value*Math.pow(km/d,1.06);const w=Math.abs(Math.log(km/d));if(!best||w<best.w)best={t,from:d,w}}return best}

/* --- compare periods & weekly recap --- */
function periodMetrics(a,b){const ss=sessionsIn(a,b);const m={n:ss.length,t:0,run:0,rt:0,bike:0,vol:0,load:0,prs:0,days:new Set(ss.map(s=>ymd(s.start))).size};for(const s of ss){const q=sMetrics(s);m.t+=s.duration||0;m.run+=q.rd;m.rt+=q.rt;m.bike+=q.bd;m.vol+=q.vol;m.load+=sessLoad(s)}
 const pm=computePRs();for(const k in pm)pm[k].hist.forEach((h,i)=>{if(h.src==='auto'&&i>0&&h.t>=a&&h.t<b)m.prs++});m.pace=m.run>0&&m.rt>0?m.rt/m.run:null;return m}
function comparePeriods(kind){const now=Date.now();let a1,b1,a0,b0,l1,l0;
 if(kind==='week'){a1=weekStart(now);b1=now+1;a0=addDays(a1,-7);b0=a0+(b1-a1);l1='This week';l0='Last week'}
 else if(kind==='month'){a1=monthStart(now);b1=now+1;a0=addMonths(a1,-1);b0=Math.min(a1,a0+(b1-a1));l1='This month';l0='Last month'}
 else if(kind==='4w'){a1=now-28*DAY;b1=now+1;a0=a1-28*DAY;b0=a1;l1='Last 4 wk';l0='4 wk before'}
 else{const y=new Date(now).getFullYear();a1=new Date(y,0,1).getTime();b1=now+1;a0=new Date(y-1,0,1).getTime();b0=a0+(b1-a1);l1=String(y);l0=String(y-1)}
 return{l1,l0,m1:periodMetrics(a1,b1),m0:periodMetrics(a0,b0),note:kind==='year'?'Same dates last year':kind==='4w'?'':'Up to the same point in the period'}}
function recapDue(){const ws=addDays(weekStart(Date.now()),-7);if((S.recapSeen||0)>=ws)return null;if(!sessionsIn(ws,addDays(ws,7)).length)return null;if((new Date().getDay()+6)%7>2)return null;return ws}
function recapData(ws){const we=addDays(ws,7);const ss=sessionsIn(ws,we);let top=null;for(const s of ss){const l=sessLoad(s);if(!top||l>top.l)top={s,l}}
 return{ws,m:periodMetrics(ws,we),p:periodMetrics(addDays(ws,-7),ws),top:top&&top.s,sum:S.weekSummaries.find(w=>w.week===ws),ach:achievements().filter(a=>a.at&&a.at>=ws&&a.at<we),strain:strainOf(loadIn(ws,we)/7*1)}}

/* --- achievements --- */
const ACH_DEF=[
 ['w1','First rep','Log your first workout','other',s=>s.n>=1],['w10','Ten down','10 workouts','other',s=>s.n>=10],['w50','Fifty','50 workouts','other',s=>s.n>=50],['w100','Century','100 workouts','other',s=>s.n>=100],['w250','Lifer','250 workouts','other',s=>s.n>=250],
 ['s4','Habit','4-week streak','other',s=>s.streak>=4],['s12','Locked in','12-week streak','other',s=>s.streak>=12],['s26','Half a year','26-week streak','other',s=>s.streak>=26],
 ['r100','100 km club','Run 100 km in total','run',s=>s.run>=100],['r500','500 km club','Run 500 km in total','run',s=>s.run>=500],['r1000','1000 km club','Run 1000 km in total','run',s=>s.run>=1000],
 ['hm','Half marathoner','Run 21.1 km in one go','run',s=>s.longRun>=21.09],['mar','Marathoner','Run 42.2 km in one go','run',s=>s.longRun>=42.19],
 ['b100','Century ride','Ride 100 km in one go','bike',s=>s.longRide>=100],['b500','Road regular','Ride 500 km in total','bike',s=>s.bike>=500],['b2500','Tour rider','Ride 2500 km in total','bike',s=>s.bike>=2500],
 ['bench100','Two-plate bench','Bench press 100 kg','gym',s=>s.lift('bench')>=100],['squat140','Three-plate squat','Squat 140 kg','gym',s=>s.lift('squat')>=140],['dead180','Four-plate deadlift','Deadlift 180 kg','gym',s=>s.lift('deadlift')>=180],['ton','Ten tonnes','Lift 10 t in one session','gym',s=>s.maxVol>=10000],
 ['pr10','Record breaker','Beat 10 personal records','gym',s=>s.prs>=10],['pr50','Unstoppable','Beat 50 personal records','gym',s=>s.prs>=50],
 ['early','Early bird','5 workouts before 8:00','bike',s=>s.early>=5],['night','Night owl','5 workouts after 21:00','run',s=>s.night>=5],['hybrid','Hybrid athlete','Gym, run and ride in one week','other',s=>s.hybrid]];
let achCache=null;
function achievements(){if(achCache&&achCache.v===saveVersion&&achCache.n===S.sessions.length)return achCache.list;
 const prT=[];const pm=computePRs();for(const k in pm)pm[k].hist.forEach((h,i)=>{if(h.src==='auto'&&i>0)prT.push(h.t)});prT.sort((a,b)=>a-b);
 const st={n:0,run:0,bike:0,longRun:0,longRide:0,lifts:{},maxVol:0,early:0,night:0,hybrid:false,prs:0,streak:0,lift(k){let m=0;for(const n in this.lifts)if(n.includes(k))m=Math.max(m,this.lifts[n]);return m}};
 const earned={};const weeks=new Map();let pi=0,prevW=null,cur=0;
 for(const s of S.sessions){st.n++;const q=sMetrics(s);st.run+=q.rd;st.bike+=q.bd;st.maxVol=Math.max(st.maxVol,q.vol);
  for(const x of s.ex){if(x.cat==='run')st.longRun=Math.max(st.longRun,num(x.dist)||0);if(x.cat==='bike')st.longRide=Math.max(st.longRide,num(x.dist)||0);if(x.cat==='gym'){const n=norm(x.name);for(const z of x.sets||[])if(z.t!=='w'&&num(z.r)>0&&num(z.w)>0)st.lifts[n]=Math.max(st.lifts[n]||0,num(z.w))}}
  const h=new Date(s.start).getHours();if(h<8)st.early++;if(h>=21)st.night++;
  const w=weekStart(s.start);const set=weeks.get(w)||new Set();set.add(typeKey(s));weeks.set(w,set);if(set.has('gym')&&set.has('run')&&set.has('bike'))st.hybrid=true;
  if(prevW===null)cur=1;else if(w===prevW){}else if(w===addDays(prevW,7))cur++;else cur=1;prevW=w;st.streak=Math.max(st.streak,cur);
  while(pi<prT.length&&prT[pi]<=s.start+1)pi++;st.prs=pi;
  for(const d of ACH_DEF)if(!earned[d[0]]&&d[4](st))earned[d[0]]=s.start}
 const list=ACH_DEF.map(([id,name,desc,c])=>({id,name,desc,c,at:earned[id]||null}));achCache={v:saveVersion,n:S.sessions.length,list};return list}

/* --- insights, alerts, up next --- */
function liftProgress(){const now=Date.now();let best=null;const map=new Map();for(const s of sessionsIn(now-56*DAY,Infinity))for(const x of s.ex){if(x.cat!=='gym')continue;let h=0;for(const z of x.sets||[])if(z.t!=='w'&&num(z.r)>0)h=Math.max(h,num(z.w)||0);if(!h)continue;const k=norm(x.name);const e=map.get(k)||{name:x.name,pts:[]};e.pts.push({t:s.start,v:h});map.set(k,e)}
 for(const e of map.values()){if(e.pts.length<3)continue;const f=e.pts[0],l=e.pts[e.pts.length-1];const gain=l.v-f.v;const rel=gain/f.v;if(gain>0&&(!best||rel>best.rel))best={name:e.name,gain,from:f.v,to:l.v,rel,weeks:Math.max(1,Math.round((l.t-f.t)/(7*DAY)))}}return best}
function insightsListV3(){const out=[];const now=Date.now();const ss=S.sessions;if(!ss.length)return out;
 const last=ss[ss.length-1];const gap=Math.floor((sod(now)-sod(last.start))/DAY);if(gap>=4)out.push({k:'gap',c:'var(--warn)',i:'timer',t:`${gap} days since your last workout`,d:'A short, easy session keeps the habit going.'});
 const r=acwr();if(r&&r>1.5)out.push({k:'acwr',c:'var(--bad)',i:'trend',t:'Training load is spiking',d:`The last 7 days are ${fmtNum(r,1)}× your recent average. Plan a lighter day.`});
 const wk=i=>{const a=addDays(weekStart(now),-7*i);return sessionsIn(a,addDays(a,7)).reduce((t,s)=>t+sMetrics(s).rd,0)};const cw=wk(0),pv=(wk(1)+wk(2)+wk(3))/3;if(pv>=5&&cw>pv*1.3)out.push({k:'runspike',c:'var(--bad)',i:'run',t:`Running is up ${Math.round((cw/pv-1)*100)}% this week`,d:`${fmtNum(cw,1)} km against a ${fmtNum(pv,1)} km average. Keep the next runs easy.`});
 const lastMG={};for(const s of sessionsIn(now-42*DAY,Infinity))for(const x of s.ex)if(x.cat==='gym'){const g=x.mg||guessMG(x.name);if(g&&g!=='full')lastMG[g]=Math.max(lastMG[g]||0,s.start)}
 for(const[g,t]of Object.entries(lastMG)){const d=Math.floor((now-t)/DAY);if(d>=8)out.push({k:'mg-'+g,c:'var(--warn)',i:'gym',t:`${MG[g]} not trained for ${d} days`,d:'Fit it into your next gym session.'})}
 const lp=liftProgress();if(lp)out.push({k:'lift-'+norm(lp.name),c:'var(--ok)',i:'trend',t:`${lp.name} is up ${fmtNum(lp.gain,1)} kg`,d:`Heaviest set went from ${fmtNum(lp.from,1)} to ${fmtNum(lp.to,1)} kg in ${plural(lp.weeks,'week')}.`});
 const pm=computePRs();const n14=Object.values(pm).filter(x=>x.best&&x.best.src==='auto'&&x.hist.length>1&&now-x.best.t<14*DAY).length;if(n14)out.push({k:'prs',c:'var(--bike)',i:'medal',t:`${plural(n14,'new record')} in the last 2 weeks`,d:'Open PRs to see them.'});
 const tm=sessionsIn(monthStart(now),Infinity).length;const lm=addMonths(monthStart(now),-1);const same=sessionsIn(lm,lm+(now-monthStart(now))).length;if(tm>=3&&tm>same)out.push({k:'month',c:'var(--ok)',i:'cal',t:`${tm} workouts this month`,d:`${tm-same} more than at this point last month.`});
 const wsk=weekStart(now);return out.filter(x=>!S.dismissed[x.k+'|'+wsk])}
function upNext(){const p=activePlan();if(!p)return null;const now=Date.now();const rd=readiness();let cands=[];
 if(p.mode==='week'){const done=weekDone(p,weekStart(now));cands=p.workouts.filter(w=>!done.has(w.id))}else{const cd=seqDay(p);if(!cd)return null;if(!cd.day.w.length)return{rest:true,p};cands=cd.day.w.map(id=>wkOf(p,id)).filter(w=>w&&!(p.seqDone||[]).includes(w.id))}
 if(!cands.length)return{done:true,p};
 const recentMG={};for(const s of sessionsIn(now-3*DAY,Infinity))for(const x of s.ex)if(x.cat==='gym'){const g=x.mg||guessMG(x.name);if(g)recentMG[g]=1}
 const yT=sessionsIn(sod(now)-DAY,sod(now)).map(typeKey);const lastDone=w=>{for(let i=S.sessions.length-1;i>=0;i--)if(S.sessions[i].workoutId===w.id)return S.sessions[i].start;return 0};
 const mgsOf=w=>[...new Set(w.exercises.filter(e=>e.cat==='gym').map(e=>e.mg||guessMG(e.name)).filter(Boolean))];
 const score=w=>{let sc=0;sc-=mgsOf(w).filter(g=>recentMG[g]).length*3;if(yT.includes(typeKey(w)))sc-=2;sc+=Math.min(14,(now-lastDone(w))/DAY)*0.2;if(rd<40&&typeKey(w)!=='gym')sc+=4;return sc};
 cands.sort((a,b)=>score(b)-score(a));const w=cands[0];const mg=mgsOf(w);const ld=lastDone(w);
 let why=ld?`Last done ${timeAgo(ld)}.`:'Not done yet.';if(mg.length&&mg.every(g=>!recentMG[g]))why+=` ${mg.map(g=>MG[g]).join(', ')} rested.`;if(rd<40)why='Readiness is low, so keep it light. '+why;
 return{p,w,why,i:p.workouts.indexOf(w)}}

/* --- plan from text --- */
const WEEKDAYS=/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b/i;
function nameOf(s){let n=s.replace(/[:–—]+.*$/,'');const i=n.search(/\s\d|\s[x×]\s?\d|@/);if(i>0)n=n.slice(0,i);return n.replace(/[-–—,:;]+$/,'').trim()}
function parseExLine(line){const s=line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/,'').trim();if(!s)return null;const low=s.toLowerCase();
 const mi=low.match(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(m|km)\b/);
 if(mi){const n=+mi[1];let meters=num(mi[2])*(mi[3]==='km'?1000:1);const pace=s.match(/(\d{1,2}:\d{2}(?:\s*[-–]\s*\d{1,2}:\d{2})?)/);const rest=low.match(/(?:rest|rec|recover|descanso|recuperação)\D{0,6}(\d+)\s*(s|sec|seg|min|m)\b/);const rs=rest?(/^(s|sec|seg)$/.test(rest[2])?+rest[1]:(+rest[1]<=10?+rest[1]*60:+rest[1])):90;
  const cat=/ride|bike|cycl|bicicleta|ciclismo/.test(low)?'bike':'run';const steps=[st('warm','time',600,cat==='run'?'Z1':'Zone 2'),rep(n,[st('work','dist',meters,pace?pace[1]:''),st('rec','time',rs,'')]),st('cool','time',600,cat==='run'?'Z1':'Zone 1')];
  return{name:nameOf(s)||'Intervals',cat,mode:'struct',steps}}
 const km=low.match(/(\d+(?:[.,]\d+)?)\s*km\b/);const pace=s.match(/(\d{1,2}:\d{2}(?:\s*[-–]\s*\d{1,2}:\d{2})?)/);const mn=low.match(/(\d+)\s*(min|mins|minutes|minutos|')\b/);
 const isRun=/run|corrida|jog|easy|tempo|long run|trote|correr/.test(low),isBike=/ride|bike|cycl|bicicleta|ciclismo|spin/.test(low);
 if((isRun||isBike)&&(km||mn||pace))return{name:nameOf(s)||(isBike?'Ride':'Run'),cat:isBike?'bike':'run',dist:km?num(km[1]):'',time:mn&&!km?(+mn[1])*60:'',tgt:pace?pace[1]:''};
 let sets=null;let m=low.match(/(\d+)\s*[x×]\s*(\d+|max|f|amrap|failure|falha)(?:\s*[-–]\s*(\d+))?/);
 if(m){const n=Math.min(12,+m[1]);const r=m[2];sets=Array.from({length:n},()=>/\d/.test(r)?{r:+r,w:'',t:''}:{r:'',w:'',t:'f'})}
 else{const l=low.match(/(\d+(?:\s*[,/]\s*\d+)+)/);if(l&&!/kg/.test(l[1]))sets=l[1].split(/[,/]/).map(x=>({r:+x.trim(),w:'',t:''}))}
 const w=low.match(/(\d+(?:[.,]\d+)?)\s*kg/)||low.match(/@\s*(\d+(?:[.,]\d+)?)(?!\s*:)/)||low.match(/\d+\s*[x×]\s*\d+\s+(\d+(?:[.,]\d+)?)\s*$/);
 if(sets){if(w)sets.forEach(z=>z.w=num(w[1]));return{name:nameOf(s),cat:'gym',sets}}
 if(mn)return{name:nameOf(s)||s,cat:'other',time:(+mn[1])*60};
 return{name:s.replace(/[:–—]+$/,'').trim(),cat:'gym',sets:[{r:10,w:'',t:''},{r:10,w:'',t:''},{r:10,w:'',t:''}],guess:true}}
function parsePlanText(text){const lines=String(text||'').split(/\r?\n/).map(l=>l.trim());const ws=[];let cur=null;
 const isHeader=(l,next)=>{if(!l)return false;if(/^#+\s*/.test(l)||/:\s*$/.test(l))return true;if(/^(day|dia|workout|treino|session|sessão|semana|week)\s*[\w\d]*\s*[:\-–—]?\s*\S*$/i.test(l)&&!/\d+\s*[x×]/.test(l))return true;if(WEEKDAYS.test(l)&&!/\d+\s*[x×]/.test(l))return true;if(!/\d/.test(l)&&l.length<32&&next&&/\d/.test(next))return true;return false};
 for(let i=0;i<lines.length;i++){const l=lines[i];if(!l)continue;let next='';for(let j=i+1;j<lines.length;j++)if(lines[j]){next=lines[j];break}
  if(/^(rest|descanso|off|folga)\b/i.test(l)){continue}
  if(isHeader(l,next)){const nm=l.replace(/^#+\s*/,'').replace(/[:\s]+$/,'').replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\s*[-–—:]\s*/i,'').trim();cur={name:nm||`Workout ${letter(ws.length)}`,ex:[]};ws.push(cur);continue}
  const e=parseExLine(l);if(!e)continue;if(!cur){cur={name:`Workout ${letter(ws.length)}`,ex:[]};ws.push(cur)}cur.ex.push(e)}
 return ws.filter(w=>w.ex.length).map(w=>{const cats=new Set(w.ex.map(e=>e.cat));const type=cats.size===1?[...cats][0]:'gym';return{name:w.name,type:CAT[type]?type:'gym',ex:w.ex}})}

function makeSampleV3(){const st=makeSampleV2();const now=Date.now();let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 st.checkins=[];for(let i=12;i>=1;i--){const t=sod(now)-i*DAY+7*3600e3;st.checkins.push({id:uid(),t,e:2+Math.floor(rnd()*4),sl:2+Math.floor(rnd()*4),so:1+Math.floor(rnd()*3)})}
 for(const s of st.sessions)if(rnd()<.6)s.rpe=6+Math.floor(rnd()*4);
 st.exNotes={'bench press':'Grip one finger outside the rings. Bench at notch 3.','back squat':'Safety pins at hole 7.'};
 st.race={name:'Spring Half Marathon',dist:21.0975,date:ymd(addDays(now,63)),goal:'1:45:00'};
 const p=st.plans[0];const p2=st.plans[1];if(p2){p2.prog={on:true,kg:2.5,runPct:5,deloadEvery:4,deloadPct:40};p2.progStart=addDays(weekStart(now),-14)}
 const B=p.workouts[1];if(B){const pu=B.exercises.find(e=>/pull/i.test(e.name));const row=B.exercises.find(e=>/row/i.test(e.name));if(row)row.ss=false;const curl=B.exercises.find(e=>/curl/i.test(e.name));if(row&&curl){const i=B.exercises.indexOf(row);B.exercises.splice(i,1);B.exercises.splice(B.exercises.indexOf(curl),0,row);row.ss=true}}
 const A=p.workouts[0];if(A){const bp=A.exercises.find(e=>/bench/i.test(e.name));if(bp){bp.progBy='rpe';bp.rpeT=8}const tp=A.exercises.find(e=>/tricep/i.test(e.name));const inc=A.exercises.find(e=>/incline/i.test(e.name));if(inc&&tp){inc.ss=true}}
 for(const s of st.sessions)for(const x of s.ex)if(/bench/i.test(x.name)&&x.sets)x.sets.forEach(z=>{if(z.t!=='w')z.rpe=7+Math.floor(rnd()*2)});
 st.recapSeen=0;return migrate(st)}
