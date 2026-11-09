/* ================= 5.1: workout options (one day, several choices) ================= */
const tlb=w=>{const a=typeLabel1(w),b=wBrief(w);return b===a?a:a+' · '+b};
function wBrief(w){const ex=w.exercises||[];if(!ex.length)return 'No exercises yet';const e=ex[0];
 if(ex.length===1&&(e.cat==='run'||e.cat==='bike')){const bits=[];if(num(e.dist))bits.push(fmtNum(e.dist,1)+' km');if(num(e.time))bits.push(fmtDur(e.time));if(e.mode==='struct')bits.push('intervals');return (e.name||CAT[e.cat])+(bits.length?' · '+bits.join(' · '):'')}
 return ex.slice(0,3).map(x=>x.name||'Exercise').join(', ')+(ex.length>3?` +${ex.length-3}`:'')}
function optionsBlock(p,w){const alts=w.alts||[];
 return `<div class="sec"><div class="h2">Options for this day</div><span class="muted sm">${alts.length?plural(alts.length+1,'choice'):''}</span></div>
 ${alts.length?`<div class="list"><div class="li"><span class="lt" style="--c:var(--${typeKey(w)})">1</span><span class="grow"><span class="t">${esc(w.name||'This workout')}</span><span class="s">${esc(tlb(w))}</span></span><span class="muted xs">main</span></div>${alts.map((a,i)=>`<button class="li" data-act="go" data-v="workout" data-pid="${p.id}" data-wid="${a.id}"><span class="lt" style="--c:var(--${typeKey(a)})">${i+2}</span><span class="grow"><span class="t">${esc(a.name||'Option '+(i+2))}</span><span class="s">${esc(tlb(a))}</span></span><span class="chev">${ic('chev',18)}</span></button>`).join('')}</div>`:`<p class="muted sm">Give this day a second choice, for example a 30 km ride or a 12 km run. When you start it, Tempo asks which one you are doing.</p>`}
 <button class="btn block line" data-act="altAdd" data-pid="${p.id}" data-wid="${w.id}">${ic('plus',18)} Add an option</button>`}
function vWorkout(o){const p=planById(o.pid);const par=altParent(p,o.wid);let h=vWorkoutV4(o);const w=wkOf(p,o.wid);if(!w)return h;
 if(par){const n=par.alts.findIndex(a=>a.id===w.id)+2;
  h=h.replace(/<label class="field"><span>Workout name<\/span>/,`<div class="banner" style="border-style:solid"><div><b>Option ${n} of ${esc(par.name||'this day')}</b><br><span class="muted sm">Only one of the options counts for the day. Tempo asks which one when you start.</span></div></div><label class="field"><span>Option name</span>`);
  h=h.replace(/<button class="btn danger block" data-act="delWorkout"[^>]*>Delete workout<\/button>/,`<button class="btn danger block" data-act="altDel" data-pid="${p.id}" data-wid="${w.id}" data-confirm="Tap again to delete">Delete this option</button>`);return h}
 const k=h.indexOf('<button class="btn danger block" data-act="delWorkout"');return k>0?h.slice(0,k)+optionsBlock(p,w)+h.slice(k):h+optionsBlock(p,w)}
SHEETS.pickvar=function(){const v=ui.pv;const p=planById(v.pid),w=wkOf(p,v.wid);if(!w)return '';const all=[w,...(w.alts||[])];
 return `<div class="h2">${esc(w.name||'Workout')}: which one today?</div><p class="muted sm">${v.past?'Pick what you did.':'Pick one. It counts as this day in your plan.'}</p><div class="list">${all.map((a,i)=>`<button class="opt" data-act="startW" data-pid="${p.id}" data-wid="${w.id}" data-alt="${i?a.id:'main'}"><span class="lt" style="--c:var(--${typeKey(a)})">${ic(typeKey(a),18)}</span><span class="grow"><b>${esc(a.name||'Option '+(i+1))}</b><br><span class="muted sm">${esc(tlb(a))}</span></span><span class="chev">${ic('chev',18)}</span></button>`).join('')}</div>`};
Object.assign(ACT,{
 startW:d=>{const p=planById(d.pid);let w=wkOf(p,d.wid);if(!w)return;const par=altParent(p,w.id);if(par){d={...d,wid:par.id,alt:w.id};w=par}
  const past=d.past!=null?d.past==='1':!!(ui.sheet&&ui.startPast);
  if(w.alts&&w.alts.length&&!d.alt){ui.pv={pid:p.id,wid:w.id,past};ui.sheet={t:'pickvar'};renderSheet();renderFab&&renderFab();return}
  if(ui.sheet&&ui.sheet.t==='pickvar')d.past=ui.pv&&ui.pv.past?'1':'0';
  const pst=d.past!=null?d.past==='1':past;const v=d.alt&&d.alt!=='main'?(w.alts||[]).find(a=>a.id===d.alt):null;
  const s=newSession(p,v||w,pst);if(v){s.workoutId=w.id;s.variantId=v.id;s.dayName=w.name}ui.sheet=null;startSession(s)},
 altAdd:d=>{const p=planById(d.pid);const w=wkOf(p,d.wid);w.alts=w.alts||[];const type=w.type==='run'?'bike':w.type==='bike'?'run':w.type;const a={id:uid(),name:'Option '+(w.alts.length+2),type,customName:'',img:'',exercises:[]};w.alts.push(a);save();go('workout',{pid:p.id,wid:a.id})},
 altDel:d=>{const p=planById(d.pid);const par=altParent(p,d.wid);if(!par)return;withUndo('Option deleted',()=>{par.alts=par.alts.filter(a=>a.id!==d.wid);if(!par.alts.length)delete par.alts;save();back()})}});
function repeatOf(s){if(s.planId){const p=planById(s.planId),w=wkOf(p,s.variantId||s.workoutId);if(p&&w){const r=newSession(p,w,false);if(s.variantId){r.workoutId=s.workoutId;r.variantId=s.variantId}return r}}return repeatOfV51(s)}
