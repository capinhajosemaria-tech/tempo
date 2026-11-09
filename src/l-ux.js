/* ================= v4 gestures ================= */
let G0=null;const SUPPRESS={until:0};
document.addEventListener('click',e=>{if(Date.now()<SUPPRESS.until){e.stopPropagation();e.preventDefault()}},true);
function suppressClick(ms=400){SUPPRESS.until=Date.now()+ms}
const inField=t=>t.closest&&t.closest('input,textarea,select');
document.addEventListener('touchstart',e=>{if(ui.tour&&!e.target.closest('#tour .tcard'))return;const t=e.touches[0];const tg=e.target;G0={x:t.clientX,y:t.clientY,t:Date.now(),tg,mode:null,dx:0,dy:0};
 if(tg.closest('#tour'))return;
 if(t.clientX<22&&ui.stack.length&&!ui.sheet){G0.mode='edge';return}
 const sp=tg.closest('.sheet-panel');if(sp&&sp.scrollTop<=0&&!inField(tg)){G0.mode='sheet?';G0.el=sp;return}
 const row=tg.closest('.srow[data-k]');if(row){G0.mode='row?';G0.el=row;return}
 const hl=tg.closest('#histlist .li[data-v="sdetail"]');if(hl){G0.mode='hist?';G0.el=hl;return}
 const stp=tg.closest('.stepper');if(stp&&!tg.closest('button')){const inp=stp.querySelector('input.v');if(inp){G0.mode='drag?';G0.el=inp;G0.v0=num(inp.value)||0;G0.step=inp.id.startsWith('fw')?(num(curExById(inp)?.inc)||num(S.settings.inc)||2.5):1;return}}
 const sortItem=tg.closest('[data-sortable] > [data-sid]');if(sortItem&&!inField(tg)){const box=sortItem.parentElement;const isEx=box.dataset.sortable==='ex';if(!isEx||tg.closest('.grip')){G0.mode='press';G0.el=sortItem;G0.box=box;G0.timer=setTimeout(()=>startSort(),isEx?180:450)}}
 if(!ui.stack.length&&ui.tab==='home'&&window.scrollY<=0&&!ui.sheet&&!G0.mode)G0.mode='ptr?'},{passive:true});
function curExById(inp){const m=inp.dataset.b&&inp.dataset.b.split('|');return m&&S.active?S.active.ex.find(z=>z.id===m[1]):null}
document.addEventListener('touchmove',e=>{if(!G0)return;const t=e.touches[0];const dx=t.clientX-G0.x,dy=t.clientY-G0.y;G0.dx=dx;G0.dy=dy;const ax=Math.abs(dx),ay=Math.abs(dy);
 if(G0.mode==='press'){if(ax>8||ay>8){clearTimeout(G0.timer);G0.mode=null}return}
 if(G0.mode==='sorting'){e.preventDefault();moveSort(t.clientY);return}
 if(G0.mode==='row?'&&ax>12&&ax>ay*1.4){G0.mode='row'}if(G0.mode==='hist?'&&dx<-12&&ax>ay*1.4){G0.mode='hist'}
 if(G0.mode==='sheet?'&&dy>10&&ay>ax){G0.mode='sheet'}if(G0.mode==='drag?'&&ay>10&&ay>ax){G0.mode='drag';G0.el.blur()}if(G0.mode==='ptr?'&&dy>10&&ay>ax&&window.scrollY<=0){G0.mode='ptr'}
 if(G0.mode==='row'){e.preventDefault();G0.el.style.transform=`translateX(${dx}px)`;G0.el.classList.toggle('swr',dx>70);G0.el.classList.toggle('swl',dx<-70)}
 else if(G0.mode==='hist'){e.preventDefault();G0.el.style.transform=`translateX(${Math.min(0,dx)}px)`}
 else if(G0.mode==='sheet'){e.preventDefault();G0.el.style.transform=`translateY(${Math.max(0,dy)}px)`}
 else if(G0.mode==='drag'){e.preventDefault();const n=Math.round(-dy/16);const v=Math.max(0,round2(G0.v0+n*G0.step));if(G0.el.value!==String(v)){G0.el.value=v;setBound(G0.el);if(navigator.vibrate)navigator.vibrate(4)}}
 else if(G0.mode==='ptr'){e.preventDefault();const p=$('#ptr');if(p){p.style.height=Math.min(70,dy*.5)+'px';p.classList.toggle('go',dy>110)}}
 else if(G0.mode==='edge'){if(dx>0){$('#app').style.transform=`translateX(${Math.min(dx,140)*.5}px)`}}},{passive:false});
document.addEventListener('touchend',e=>{if(!G0)return;const g=G0;G0=null;clearTimeout(g.timer);const dx=g.dx,dy=g.dy;
 if(g.mode==='sorting'){endSort(g);suppressClick();return}
 if(g.mode==='row'){g.el.style.transform='';const d={eid:g.el.dataset.eid,k:g.el.dataset.k};suppressClick();if(dx>70){const z=curEx(d).sets[+d.k];if(!z.d)ACT.sDone(d)}else if(dx<-70){const x=curEx(d);const k=+d.k;const z=x.sets[k];x.sets.splice(k,1);save();render();toastAction('Set deleted','Undo',()=>{x.sets.splice(k,0,z);save();render()})}return}
 if(g.mode==='hist'){g.el.style.transform='';suppressClick();if(dx<-70){const id=g.el.dataset.id;ui.sheet={t:'sactions',id};renderSheet()}return}
 if(g.mode==='sheet'){suppressClick();if(dy>110){ui.sheet=null;renderSheet()}else g.el.style.transform='';return}
 if(g.mode==='drag'){suppressClick();save();render();return}
 if(g.mode==='ptr'){const p=$('#ptr');if(p){p.style.height='';p.classList.remove('go')}if(dy>110){toast('Refreshing…');Promise.resolve(syncNow()).then(()=>{if(S.strava.access)return stravaCheck(true)}).then(()=>{render();toast(S.sync.token||S.strava.access?'Up to date':'Nothing to sync. Turn on sync in Settings.')})}return}
 if(g.mode==='edge'){$('#app').style.transform='';if(dx>80&&Math.abs(dy)<90){const top=ui.stack[ui.stack.length-1];if(top&&top.v==='session')ACT.minimize();else if(top&&top.v==='live')ACT.liveExit();else back()}return}
 if(g.tg.closest&&g.tg.closest('#restbar')&&!g.tg.closest('button')){const now=Date.now();if(ui.lastRestTap&&now-ui.lastRestTap<320&&ui.rest){ui.rest.end+=30e3;ui.rest.total+=30;renderRest();toast('+30 seconds');ui.lastRestTap=0}else ui.lastRestTap=now}},{passive:true});
document.addEventListener('dblclick',e=>{if(e.target.closest('#restbar')&&ui.rest&&!e.target.closest('button')){ui.rest.end+=30e3;ui.rest.total+=30;renderRest()}});
/* long-press reorder */
function startSort(){if(!G0||G0.mode!=='press')return;G0.mode='sorting';G0.el.classList.add('lifting');buzz(15);suppressClick(800)}
function moveSort(y){const box=G0.box,el=G0.el;const items=[...box.children].filter(c=>c!==el&&c.dataset.sid);for(const it of items){const r=it.getBoundingClientRect();if(y<r.top+r.height/2){if(el.nextElementSibling!==it)box.insertBefore(el,it);return}}box.appendChild(el);const r=box.getBoundingClientRect();if(y>r.bottom-40)window.scrollBy(0,8);if(y<80)window.scrollBy(0,-8)}
function endSort(g){g.el.classList.remove('lifting');const ids=[...g.box.children].map(c=>c.dataset.sid).filter(Boolean);
 if(g.box.dataset.sortable==='home'){const h=S.settings.home;const vis=ids.map(id=>h.find(w=>w.id===id)).filter(Boolean);const rest=h.filter(w=>!ids.includes(w.id));S.settings.home=[...vis,...rest]}
 else{const w=wkOf(planById(g.box.dataset.pid),g.box.dataset.wid);if(w)w.exercises=ids.map(id=>w.exercises.find(e=>e.id===id)).filter(Boolean).concat(w.exercises.filter(e=>!ids.includes(e.id)))}
 save();render();toast('Order saved')}
/* hold to repeat on steppers */
let holdT=null,holdI=null;
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-act="fStep"]');if(!b)return;const d={...b.dataset};clearTimeout(holdT);clearInterval(holdI);holdT=setTimeout(()=>{suppressClick(600);let n=0;holdI=setInterval(()=>{ACT.fStep(d);if(++n>200)clearInterval(holdI)},n>10?50:90)},380)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(holdT);if(holdI){clearInterval(holdI);holdI=null;suppressClick(300)}},true));
/* set-done pop & first-load animation */
const _sDone=ACT.sDone;ACT.sDone=d=>{const z=curEx(d).sets[+d.k];if(!z.d){ui.justDone=d.eid+'|'+d.k;buzz(12);setTimeout(()=>{ui.justDone=null},600)}_sDone(d)};
document.body.classList.add('anim');setTimeout(()=>document.body.classList.remove('anim'),1600);

/* ================= interactive tour ================= */
const TOUR=[
 {pre:()=>{ui.stack=[];ui.tab='home'},sel:'[data-sid="ready"] .card',t:'Readiness and strain',d:'Readiness says how much you can push today. Strain is how hard today has been so far, from 0 to 21.'},
 {sel:'[data-sid="ready"] .ckrow',t:'Daily check-in',d:'Rate energy, sleep and soreness every morning. Tap any number now.',wait:'[data-act="checkin"]'},
 {sel:'[data-sid="feat"] .feat',t:'Your big number',d:'Tap Change to show the stat you care about most: a streak, monthly km or a record.'},
 {sel:'[data-sid="start"] .btn',t:'Start a workout',d:'Tap it.',wait:'[data-act="startSheet"]'},
 {sel:'.sheet-panel .list',t:'Pick a workout',d:'Workouts from your plan come first, with what you have done this week. Tap Push.',wait:'[data-act="startW"]',delay:400},
 {sel:'.srow[data-k] .donebtn',t:'Tick sets as you go',d:'Tap the tick when you finish a set. Only ticked sets are saved. You can also swipe a set right.',wait:'[data-act="sDone"]'},
 {sel:'#restbar',t:'Rest timer',d:'It starts by itself. Tap −15 or +15, or double-tap the timer for +30 seconds.'},
 {sel:'.extools',t:'Exercise tools',d:'Past sessions and your notes, swap for another exercise, warm-up sets, plates and supersets.'},
 {sel:'[data-act="smode"][data-val="focus"]',t:'Focus mode',d:'One exercise at a time with big controls. Tap it.',wait:'[data-act="smode"]'},
 {sel:'.fpanel',t:'Big controls',d:'Tap − or +, hold them to go faster, or drag the number up and down. Swipe left or right to change exercise.'},
 {sel:'.topbar [data-act="finish"]',t:'Finish',d:'Tap Finish when you are done.',wait:'[data-act="finish"]'},
 {sel:'[data-act="finishTicked"]',t:'Only what you did',d:'Sets you did not tick are left out. Tap Save ticked sets only.',wait:'[data-act="finishTicked"]'},
 {sel:'.sumhero',t:'Your summary',d:'Strain, volume and records, compared with last time. Share card makes an image for your stories.'},
 {pre:()=>{ui.stack=[];ui.tab='plans'},sel:'.quick',t:'Plans',d:'Start from a ready-made plan, put workouts on days in the Planner, or paste a plan as text.'},
 {pre:()=>{ui.stack=[];ui.tab='history'},sel:'.search',t:'History',d:'Search and filter everything you have logged. Swipe a workout left for quick actions.'},
 {pre:()=>{ui.stack=[];ui.tab='stats'},sel:'.seg',t:'Stats',d:'Pick a range. Further down: load, comparisons, zones, muscles and race predictions.'},
 {pre:()=>{ui.stack=[];ui.tab='prs'},sel:'.hscroll',t:'Records',d:'New personal records appear here by themselves. Achievements are one tap away.'},
 {pre:()=>{ui.stack=[];ui.tab='home'},sel:'[data-act="go"][data-v="customize"]',t:'Make Today yours',d:'Choose which cards show. You can also press and hold any card on Today and drag it.'},
 {sel:null,t:"You're all set",d:'That was sample data. Your own data is back exactly as you left it. You can replay this tour from Settings.'}];
function tourStart(){if(S.active){toast('Finish or discard the current workout first');return}ui.tour={i:0,backup:JSON.stringify(S),ui:{tab:ui.tab,stack:ui.stack}};clearTimeout(syncSoonT);const th=S.settings.theme,ac=S.settings.accent;S=makeSample();S.settings.theme=th;S.settings.accent=ac;S.tourSeen=true;ui.sheet=null;ui.rest=null;ui.smode='list';applyTheme();tourShow()}
function tourEnd(){const t=ui.tour;if(!t)return;stopLive();S=migrate(JSON.parse(t.backup));S.tourSeen=true;ui.tour=null;ui.sheet=null;ui.rest=null;ui.smode='list';ui.summary=null;ui.stack=[];ui.tab='home';prCache=null;achCache=null;applyTheme();$('#tour').hidden=true;save();render();window.scrollTo(0,0)}
function tourShow(){const t=ui.tour;if(!t)return;const s=TOUR[t.i];if(!s){tourEnd();return}if(s.pre){s.pre();render()}
 const place=()=>{if(!ui.tour||TOUR[ui.tour.i]!==s)return;const ov=$('#tour');ov.hidden=false;const el=s.sel?document.querySelector(s.sel):null;const last=t.i===TOUR.length-1;
  let r=el?el.getBoundingClientRect():null;if(el&&(r.top<70||r.bottom>innerHeight-120)){el.scrollIntoView({block:'center'});r=el.getBoundingClientRect()}
  const pad=6;const R=r?{l:Math.max(0,r.left-pad),t:Math.max(0,r.top-pad),r:Math.min(innerWidth,r.right+pad),b:Math.min(innerHeight,r.bottom+pad)}:null;
  const blk=R?`<i class="tb" style="left:0;top:0;width:100%;height:${R.t}px"></i><i class="tb" style="left:0;top:${R.b}px;width:100%;bottom:0"></i><i class="tb" style="left:0;top:${R.t}px;width:${R.l}px;height:${R.b-R.t}px"></i><i class="tb" style="left:${R.r}px;top:${R.t}px;right:0;height:${R.b-R.t}px"></i>${s.wait?'':`<i class="tb clear" style="left:${R.l}px;top:${R.t}px;width:${R.r-R.l}px;height:${R.b-R.t}px"></i>`}<i class="thole" style="left:${R.l}px;top:${R.t}px;width:${R.r-R.l}px;height:${R.b-R.t}px"></i>`:'<i class="tb" style="inset:0"></i>';
  const below=R?(R.b+190<innerHeight):true;const pos=R?(below?`top:${R.b+12}px`:`bottom:${innerHeight-R.t+12}px`):'top:30%';
  ov.innerHTML=blk+`<div class="tcard" style="${pos}"><div class="eyebrow">${t.i+1} of ${TOUR.length}</div><b>${esc(s.t)}</b><p>${esc(s.d)}</p><div class="btnrow">${last?`<button class="btn primary sm" data-tour="end">Finish tour</button>`:`<button class="btn line sm" data-tour="end">Skip tour</button>${s.wait?'<span class="muted xs" style="align-self:center;flex:1;text-align:right">Tap the highlighted area</span>':`<button class="btn primary sm" data-tour="next">Next</button>`}`}</div></div>`};
 if(s.sel&&!document.querySelector(s.sel)){let n=0;const iv=setInterval(()=>{if(document.querySelector(s.sel)||++n>20){clearInterval(iv);setTimeout(place,60)}},100)}else setTimeout(place,s.delay||80)}
function tourNext(){if(!ui.tour)return;ui.tour.i++;$('#tour').innerHTML='';tourShow()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tour]');if(b){e.stopPropagation();if(b.dataset.tour==='end')tourEnd();else tourNext();return}
 if(!ui.tour)return;const s=TOUR[ui.tour.i];if(s&&s.wait&&e.target.closest(s.wait)){setTimeout(tourNext,s.delay||350)}},true);
window.addEventListener('resize',()=>{if(ui.tour)tourShow()});
ACT.tourStart=()=>tourStart();
const _saveT=save;save=function(){if(ui.tour){saveVersion++;return}_saveT()};
const _syncNowT=syncNow;syncNow=function(){if(ui.tour)return Promise.resolve();return _syncNowT()};
