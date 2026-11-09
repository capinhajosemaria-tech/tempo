/* ================= v4: data model ================= */
Object.assign(I,{
 shoe:'<path d="M3 15.5V9.5l3.5 1 2-3h2.5l2 3.5 5.8 2a2.4 2.4 0 0 1 1.7 2.3v.2zM3 15.5v2.5h18.5v-2.5"/>',
 band:'<path d="M4 7h16v10H4z"/><path d="M8 7v10M16 7v10"/>',
 lungs:'<path d="M12 4v8M12 12c-1 0-2 1-3 1M12 12c1 0 2 1 3 1"/><path d="M9 7c-3 0-5 4-5 9 0 2 1 3 3 3s2-2 2-4zM15 7c3 0 5 4 5 9 0 2-1 3-3 3s-2-2-2-4z"/>',
 book:'<path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
 bandage:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M10.5 10.5h.01M13.5 13.5h.01M13.5 10.5h.01M10.5 13.5h.01"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 grip:'<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3"/>',
 metro:'<path d="M9 3h6l3 18H6z"/><path d="M12 15 16 6"/>',
 star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',skip:'<path d="M6 5l9 7-9 7zM18 5v14"/>',
 school:'<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c3 2 7 2 10 0v-4.5"/>'});
HOME_WIDGETS.splice(3,0,['planned','Planned today']);HOME_WIDGETS.push(['challenge','Monthly challenge']);
function emptyStateV4(){return Object.assign(emptyStateV3(),{v:4,gear:[],injuries:[],journal:[],challenges:[],schedule:[],tourSeen:false})}
function migrateV4(st){const was=st.v||1;st=migrateV3(st);for(const k of ['gear','injuries','journal','challenges','schedule'])st[k]=st[k]||[];if(st.tourSeen===undefined)st.tourSeen=false;
 const h=st.settings.home;const ids=h.map(w=>w.id);if(was<4){const iP=ids.indexOf('planned');if(iP>=0){const [w]=h.splice(iP,1);const iS=h.findIndex(x=>x.id==='start');h.splice(iS+1,0,w)}}
 st.v=4;return st}
SYNC_COLLS.push('gear','injuries','journal','challenges','schedule');

/* ================= gear ================= */
const GEAR_KIND={shoe:['Running shoes','run',700],bike:['Bike','bike',0]};
function gearKm(g){let km=num(g.startKm)||0;for(const s of S.sessions)for(const x of s.ex)if(x.gear===g.id)km+=num(x.dist)||0;return km}
function defaultGear(cat){const kind=cat==='run'?'shoe':cat==='bike'?'bike':null;if(!kind)return '';const act=S.gear.filter(g=>g.kind===kind&&!g.retired);if(!act.length)return '';
 for(let i=S.sessions.length-1;i>=0;i--)for(const x of S.sessions[i].ex)if(x.gear&&act.some(g=>g.id===x.gear))return x.gear;return act[0].id}
function commitSession(src,opts){const s=clone(src);for(const x of s.ex)if((x.cat==='run'||x.cat==='bike')&&x.gear===undefined)x.gear=defaultGear(x.cat);return commitSessionV3(s,opts)}

/* ================= injuries ================= */
const AREAS={knee:['Knee',['legs'],['run','bike']],ankle:['Ankle',['legs'],['run']],hip:['Hip',['legs'],['run']],lowback:['Lower back',['back','legs'],[]],shoulder:['Shoulder',['shoulders','chest'],[]],elbow:['Elbow',['arms'],[]],wrist:['Wrist',['arms','chest'],[]],neck:['Neck',['shoulders','back'],[]],shin:['Shin',['legs'],['run']],foot:['Foot',['legs'],['run']]};
const activeInj=()=>S.injuries.filter(i=>!i.resolved);
const injSev=i=>{const l=i.log&&i.log.length?i.log[i.log.length-1].sev:i.sev;return num(l)||0};
function injFor(x){const mg=x.cat==='gym'?(x.mg||guessMG(x.name)):'';return activeInj().filter(i=>{const a=AREAS[i.area];if(!a)return false;return (mg&&a[1].includes(mg))||a[2].includes(x.cat)})}
function cues(x){let h=cuesV3(x);const inj=injFor(x);if(inj.length)h=`<div class="cue warn">${ic('bandage',14)} ${inj.map(i=>`${AREAS[i.area][0]} is sore (${injSev(i)}/5)`).join(' · ')}. Go lighter or swap this exercise.</div>`+h;return h}

/* ================= swap alternatives ================= */
const ALT={chest:['Bench Press','Incline Dumbbell Press','Dumbbell Bench Press','Chest Press Machine','Push-ups','Cable Fly','Dips'],back:['Barbell Row','Pull-ups','Lat Pulldown','Seated Cable Row','Dumbbell Row','Chin-ups','T-Bar Row'],shoulders:['Overhead Press','Dumbbell Shoulder Press','Machine Shoulder Press','Arnold Press','Lateral Raise','Face Pull'],arms:['Biceps Curl','Hammer Curl','Cable Curl','Triceps Pushdown','Skull Crushers','Overhead Triceps Extension'],legs:['Back Squat','Front Squat','Leg Press','Hack Squat','Romanian Deadlift','Bulgarian Split Squat','Lunges','Leg Extension','Leg Curl','Hip Thrust'],core:['Plank','Hanging Leg Raise','Cable Crunch','Ab Wheel Rollout'],full:['Kettlebell Swing','Thruster','Burpees']};
function altsFor(x){const mg=x.mg||guessMG(x.name);if(!mg)return[];const seen=new Set([norm(x.name)]);const out=[];
 for(const n of exNames().values()){if(seen.has(norm(n)))continue;if(guessMG(n)===mg){out.push(n);seen.add(norm(n))}}
 for(const n of ALT[mg]||[]){if(!seen.has(norm(n))){out.push(n);seen.add(norm(n))}}return{mg,list:out.slice(0,12)}}

/* ================= adaptive plans & progression on intervals ================= */
function adaptFactor(p){if(!p||!p.prog||!p.prog.adapt)return{f:1,why:[]};let f=1;const why=[];const ws=addDays(weekStart(Date.now()),-7);const sum=S.weekSummaries.find(w=>w.planId===p.id&&w.week===ws);
 if(sum&&sum.target&&sum.done.length/sum.target<0.5){f*=0.85;why.push(`you did ${sum.done.length} of ${sum.target} last week`)}if(readiness()<40){f*=0.9;why.push('readiness is low')}return{f,why}}
function newSession(p,w,past){const s=newSessionV3(p,w,past);const pg=planProg(p);const ad=adaptFactor(p);
 for(const x of s.ex){if(x.flat&&(pg||ad.f<1)){let k=ad.f;if(pg){k*=Math.pow(1+pg.runPct/100,pg.steps);if(pg.deload)k*=1-pg.deloadPct/100}if(k!==1)x.flat.forEach(q=>{if(q.kind==='work'){q.v=q.by==='dist'?Math.round(num(q.v)*k/10)*10:Math.round(num(q.v)*k/5)*5}})}
  if(ad.f<1&&x.tgt&&num(x.tgt.dist)>0)x.tgt.dist=Math.round(num(x.tgt.dist)*ad.f*10)/10;
  if(x.ref){const e=exOf(...x.ref);if(e&&e.tempo)x.tempo=e.tempo}}
 if(ad.f<1){s.adapted={f:ad.f,why:ad.why}}return s}
function progSection(p){let h=progSectionV3(p);const g=p.prog||{};if(!g.on)return h;return h.replace('<button class="btn sm" data-act="planProgReset"',`${sw(g.adapt,'planAdapt',`data-id="${p.id}"`,'Lighten runs and rides after missed weeks or low readiness')}<button class="btn sm" data-act="planProgReset"`)}

/* ================= readiness with sleep & steps ================= */
function readiness(){let sc=readinessV3();const ck=todayCheck();if(ck){const h=num(ck.hrs);if(h>0)sc+=Math.max(-12,Math.min(8,(h-7)*4));}const y=S.checkins.find(c=>ymd(c.t)===ymd(Date.now()-DAY));if(y&&num(y.steps)>15000)sc-=3;return Math.round(Math.max(1,Math.min(99,sc)))}

/* ================= library of plans ================= */
const gS=(n,r,w='')=>Array.from({length:n},()=>r==='F'?{r:'',w,t:'f'}:{r,w,t:''});
const E=(name,cat,x={})=>{const o={id:uid(),name,cat,img:'',desc:'',dist:'',time:'',sets:[],...x};fixTpl(o);o.progBy=o.progBy||'reps';o.rpeT=8;return o};
const GX=(name,n,r,x={})=>E(name,'gym',{sets:gS(n,r),mg:guessMG(name),...x});
const W=(name,type,ex)=>({id:uid(),name,type,customName:'',img:'',exercises:ex});
const LIB=[
 {id:'ppl',name:'Push / Pull / Legs',tag:'gym',days:'3–6 days',desc:'The classic muscle-building split. Do each day once or twice a week.',make:()=>({mode:'week',workouts:[W('Push','gym',[GX('Bench Press',4,8,{rest:150,autoWarm:true}),GX('Overhead Press',3,8,{rest:120}),GX('Incline Dumbbell Press',3,10),GX('Lateral Raise',3,12,{rest:60,inc:1}),GX('Triceps Pushdown',3,12,{rest:60})]),W('Pull','gym',[GX('Deadlift',3,5,{rest:180,autoWarm:true,inc:5}),GX('Pull-ups',4,'F',{bw:true}),GX('Barbell Row',3,8),GX('Face Pull',3,15,{rest:60}),GX('Biceps Curl',3,12,{rest:60,inc:1})]),W('Legs','gym',[GX('Back Squat',4,6,{rest:180,autoWarm:true,inc:5}),GX('Romanian Deadlift',3,8),GX('Leg Press',3,10,{inc:10}),GX('Leg Curl',3,12),GX('Calf Raise',4,12,{rest:60})])]})},
 {id:'ul',name:'Upper / Lower',tag:'gym',days:'4 days',desc:'Two upper and two lower days. Balanced strength and size.',make:()=>({mode:'week',workouts:[W('Upper A','gym',[GX('Bench Press',4,6,{autoWarm:true,rest:150}),GX('Barbell Row',4,8),GX('Overhead Press',3,8),GX('Lat Pulldown',3,10),GX('Biceps Curl',2,12)]),W('Lower A','gym',[GX('Back Squat',4,5,{autoWarm:true,rest:180,inc:5}),GX('Romanian Deadlift',3,8),GX('Leg Extension',3,12),GX('Calf Raise',3,12)]),W('Upper B','gym',[GX('Incline Dumbbell Press',4,8),GX('Pull-ups',4,'F',{bw:true}),GX('Dumbbell Shoulder Press',3,10),GX('Seated Cable Row',3,10),GX('Triceps Pushdown',2,12)]),W('Lower B','gym',[GX('Deadlift',3,5,{autoWarm:true,rest:180,inc:5}),GX('Bulgarian Split Squat',3,10),GX('Leg Curl',3,12),GX('Plank',3,'F',{bw:true})])]})},
 {id:'fb',name:'Full body 3×',tag:'gym',days:'3 days',desc:'Three full-body sessions a week. Great to start or to fit around sport.',make:()=>({mode:'week',workouts:[W('Full body A','gym',[GX('Back Squat',3,8,{autoWarm:true}),GX('Bench Press',3,8),GX('Barbell Row',3,8),GX('Plank',3,'F',{bw:true})]),W('Full body B','gym',[GX('Deadlift',3,5,{autoWarm:true,inc:5}),GX('Overhead Press',3,8),GX('Lat Pulldown',3,10),GX('Lunges',3,10)]),W('Full body C','gym',[GX('Leg Press',3,10,{inc:10}),GX('Incline Dumbbell Press',3,10),GX('Seated Cable Row',3,10),GX('Hanging Leg Raise',3,'F',{bw:true})])]})},
 {id:'531',name:'5/3/1 strength',tag:'gym',days:'4 days',desc:'One main lift a day with a top set to the limit. Set weights from 65, 75 and 85% of your training max.',make:()=>({mode:'week',prog:{on:true,kg:1.25,runPct:0,deloadEvery:4,deloadPct:40},workouts:[W('Squat day','gym',[GX('Back Squat',3,5,{autoWarm:true,inc:5,rest:180,notes:'Last set: as many good reps as you can.'}),GX('Leg Press',5,10,{inc:10}),GX('Leg Curl',3,12)]),W('Bench day','gym',[GX('Bench Press',3,5,{autoWarm:true,rest:180,notes:'Last set: as many good reps as you can.'}),GX('Dumbbell Row',5,10),GX('Triceps Pushdown',3,12)]),W('Deadlift day','gym',[GX('Deadlift',3,5,{autoWarm:true,inc:5,rest:180,notes:'Last set: as many good reps as you can.'}),GX('Front Squat',5,8),GX('Hanging Leg Raise',3,'F',{bw:true})]),W('Press day','gym',[GX('Overhead Press',3,5,{autoWarm:true,rest:180,notes:'Last set: as many good reps as you can.'}),GX('Chin-ups',5,'F',{bw:true}),GX('Lateral Raise',3,15,{inc:1})])].map(w=>{w.exercises[0].sets[2].t='f';w.exercises[0].sets[2].r='';return w})})},
 {id:'c25k',name:'Couch to 5 km',tag:'run',days:'3 days',desc:'Run/walk intervals that get 10% longer every week, until you run 5 km.',make:()=>({mode:'week',prog:{on:true,kg:0,runPct:10,deloadEvery:0,deloadPct:0,adapt:true},workouts:['Run/walk A','Run/walk B','Run/walk C'].map((n,i)=>W(n,'run',[E(n,'run',{mode:'struct',steps:[st('warm','time',300,'brisk walk'),rep(i===2?6:8,[st('work','time',i===2?90:60,'easy'),st('rec','time',i===2?120:90,'walk')]),st('cool','time',300,'walk')]})]))})},
 {id:'10k',name:'10 km builder',tag:'run',days:'3 days',desc:'Easy run, intervals and a long run that grows each week.',make:()=>({mode:'week',prog:{on:true,kg:0,runPct:5,deloadEvery:4,deloadPct:30,adapt:true},workouts:[W('Easy run','run',[E('Easy run','run',{dist:5,tgt:'Z2'})]),W('Intervals','run',[E('6 × 800 m','run',{mode:'struct',steps:[st('warm','time',600,'Z1'),rep(6,[st('work','dist',800,'Z4'),st('rec','time',120,'')]),st('cool','time',600,'Z1')]})]),W('Long run','run',[E('Long run','run',{dist:8,tgt:'Z2'})])]})},
 {id:'hm',name:'Half marathon in 12 weeks',tag:'run',days:'4 days',desc:'Easy, tempo, intervals and a long run, with a lighter week every fourth week.',make:()=>({mode:'week',prog:{on:true,kg:0,runPct:6,deloadEvery:4,deloadPct:30,adapt:true},workouts:[W('Easy run','run',[E('Easy run','run',{dist:6,tgt:'Z2'})]),W('Intervals','run',[E('5 × 1 km','run',{mode:'struct',steps:[st('warm','dist',2000,'Z1'),rep(5,[st('work','dist',1000,'Z4'),st('rec','time',120,'')]),st('cool','dist',1500,'Z1')]})]),W('Tempo run','run',[E('Tempo','run',{mode:'struct',steps:[st('warm','dist',2000,'Z1'),st('work','dist',5000,'Z3'),st('cool','dist',1500,'Z1')]})]),W('Long run','run',[E('Long run','run',{dist:12,tgt:'Z2'})])]})},
 {id:'hybrid',name:'Hybrid athlete',tag:'mix',days:'4 days',desc:'Two full-body strength days, one interval session and one long endurance day.',make:()=>({mode:'week',prog:{on:true,kg:1.25,runPct:5,deloadEvery:4,deloadPct:35,adapt:true},workouts:[W('Strength A','gym',[GX('Back Squat',4,5,{autoWarm:true,inc:5}),GX('Bench Press',4,6),GX('Pull-ups',3,'F',{bw:true})]),W('Strength B','gym',[GX('Deadlift',3,5,{autoWarm:true,inc:5}),GX('Overhead Press',3,6),GX('Barbell Row',3,8)]),W('Intervals','run',[E('6 × 400 m','run',{mode:'struct',steps:PRESETS.run[0][1]()})]),W('Long ride','bike',[E('Endurance ride','bike',{dist:50,tgt:'Zone 2'})])]})}];
function libCreate(id,opts={}){const L=LIB.find(l=>l.id===id);const m=L.make();const p={id:uid(),name:opts.name||L.name,img:'',mode:m.mode,created:Date.now(),workouts:m.workouts,days:[],seqPos:0,seqDone:[],closedThrough:weekStart(Date.now())};if(m.prog){p.prog=m.prog;p.progStart=weekStart(Date.now())}S.plans.push(p);if(opts.activate||!S.activePlanId)S.activePlanId=p.id;save();return p}

/* ================= mobility routines ================= */
const ROUTINES=[
 {id:'hips',name:'Hips and lower back',min:10,moves:[['90/90 hip switches',60],['Hip flexor stretch · left',45],['Hip flexor stretch · right',45],['Pigeon pose · left',60],['Pigeon pose · right',60],["Child's pose",60],['Cat–cow',60],['Glute bridge hold',45],['Deep squat hold',60]]},
 {id:'upper',name:'Upper back and shoulders',min:8,moves:[['Arm circles',45],['Thread the needle · left',45],['Thread the needle · right',45],['Doorway chest stretch',60],['Thoracic extensions',60],['Wall slides',60],['Neck side stretch',60],['Shoulder dislocates',45]]},
 {id:'runner',name:'After a run',min:8,moves:[['Standing quad stretch · left',40],['Standing quad stretch · right',40],['Hamstring stretch · left',40],['Hamstring stretch · right',40],['Calf stretch · left',40],['Calf stretch · right',40],['Figure-4 glute stretch',60],['Hip flexor lunge',60],['Legs up the wall',90]]},
 {id:'full',name:'Full body flow',min:15,moves:[["World's greatest stretch",90],['Downward dog',60],['Cobra',45],['Cat–cow',60],['Deep squat hold',60],['90/90 hip switches',60],['Thoracic rotations',60],['Side bend',60],['Hamstring floss',60],['Pigeon pose · left',60],['Pigeon pose · right',60],["Child's pose",90]]}];

/* ================= monthly challenges ================= */
const CH_KIND={workouts:['Workouts','',0],runKm:['Run','km',0],bikeKm:['Ride','km',0],days:['Active days','',0],hours:['Train','h',0],sets:['Working sets','',0]};
function chValue(kind,a,b){const ss=sessionsIn(a,b);if(kind==='workouts')return ss.length;if(kind==='days')return new Set(ss.map(s=>ymd(s.start))).size;if(kind==='hours')return ss.reduce((t,s)=>t+(s.duration||0),0)/3600;if(kind==='runKm')return ss.reduce((t,s)=>t+sMetrics(s).rd,0);if(kind==='bikeKm')return ss.reduce((t,s)=>t+sMetrics(s).bd,0);if(kind==='sets')return ss.reduce((t,s)=>t+sMetrics(s).sets,0);return 0}
function chSuggest(){const now=Date.now(),m=monthStart(now),pm=addMonths(m,-1);const out=[];const nice=v=>v>=100?Math.round(v/10)*10:v>=20?Math.round(v/5)*5:Math.max(1,Math.round(v));
 for(const k of Object.keys(CH_KIND)){const last=chValue(k,pm,m);const base=last>0?last*1.1:{workouts:12,runKm:50,bikeKm:200,days:12,hours:10,sets:120}[k];if(k==='runKm'&&!S.sessions.some(s=>typeKey(s)==='run'))continue;if(k==='bikeKm'&&!S.sessions.some(s=>typeKey(s)==='bike'))continue;if(k==='sets'&&!S.sessions.some(s=>typeKey(s)==='gym'))continue;out.push({kind:k,target:nice(base),last})}return out}
function chProgress(c){const a=c.month,b=addMonths(c.month,1);const v=chValue(c.kind,a,Math.min(b,Date.now()+1));return{v,pct:Math.min(1,v/(num(c.target)||1)),done:v>=num(c.target)}}
const chTitle=c=>{const k=CH_KIND[c.kind];return `${k[0]} ${fmtNum(c.target,0)}${k[1]?' '+k[1]:''} in ${fmtDate(c.month,{month:'long'})}`};

/* ================= planner ================= */
const schedOn=d=>S.schedule.filter(x=>x.date===d);
function schedDone(x){const s=sessionsIn(new Date(x.date+'T00:00').getTime(),new Date(x.date+'T00:00').getTime()+DAY);return s.some(z=>z.workoutId===x.wid)}

/* ================= live timer audio ================= */
let actx=null;function beep(f=880,d=.12,v=.18){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(v,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);o.start();o.stop(actx.currentTime+d)}catch(e){}}
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
function makeSampleV4(){const st=makeSampleV3();const now=Date.now();
 const sh={id:uid(),kind:'shoe',name:'Pegasus 41',startKm:520,limit:700,retired:false},bk={id:uid(),kind:'bike',name:'Road bike',startKm:3200,limit:'',retired:false};st.gear=[sh,bk];
 for(const s of st.sessions)for(const x of s.ex){if(x.cat==='run')x.gear=sh.id;if(x.cat==='bike')x.gear=bk.id}
 st.challenges=[{id:uid(),month:monthStart(now),kind:'runKm',target:60},{id:uid(),month:addMonths(monthStart(now),-1),kind:'workouts',target:14}];
 const p=st.plans[0];const ws=weekStart(now);st.schedule=[[1,1],[2,3],[3,2],[5,4],[6,5]].map(([d,i])=>({id:uid(),date:ymd(addDays(ws,d)),pid:p.id,wid:p.workouts[i].id}));
 st.journal=[{id:uid(),t:now-12*DAY,text:'Deadlift felt smooth today. Keeping the bar closer helped.',kg:81.4,img:''}];
 st.injuries=[{id:uid(),area:'knee',since:now-40*DAY,notes:'After the long ride',resolved:now-30*DAY,log:[{t:now-40*DAY,sev:3},{t:now-34*DAY,sev:2}]}];
 st.tourSeen=false;return migrate(st)}
