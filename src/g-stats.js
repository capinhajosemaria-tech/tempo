/* ================= v3 stats ================= */
function cmpCard(){const k=ui.cmp||'week';const c=comparePeriods(k);const a=c.m1,b=c.m0;
 const row=(l,x,y,f,lower)=>`<tr><td>${l}</td><td>${f(x)}</td><td>${f(y)}</td><td>${(x>0||y>0)&&x!=null&&y!=null?pctDelta(x,y,lower)||'0%':'—'}</td></tr>`;
 return `<div class="card"><div class="chead"><div class="h3">Compare</div></div>${seg([['week','Week'],['month','Month'],['4w','4 weeks'],['year','Year']],k,'cmpKind','','mini')}
 <div class="tablewrap"><table class="cmp"><tr><th></th><th>${c.l1}</th><th>${c.l0}</th><th>Change</th></tr>
 ${row('Workouts',a.n,b.n,v=>v)}${row('Active days',a.days,b.days,v=>v)}${row('Time',a.t,b.t,v=>fmtHM(v))}${row('Strain load',a.load,b.load,v=>fmtNum(v,0))}${row('Running',a.run,b.run,v=>fmtNum(v,1)+' km')}${a.pace||b.pace?row('Avg pace',a.pace||0,b.pace||0,v=>v?fmtDur(v):'—',true):''}${row('Cycling',a.bike,b.bike,v=>fmtNum(v,0)+' km')}${row('Volume',a.vol,b.vol,v=>fmtNum(v/1000,1)+' t')}${row('Records',a.prs,b.prs,v=>v)}</table></div>${c.note?`<p class="hint">${c.note}.</p>`:''}</div>`}
function ytdChart(kind){const now=new Date();const y=now.getFullYear();const series=[];
 for(const[yy,col,shift]of[[y,kind==='run'?'var(--run)':'var(--bike)',0],[y-1,'var(--dim)',1]]){let acc=0;const a=new Date(yy,0,1).getTime(),b=yy===y?Date.now():new Date(yy,now.getMonth(),now.getDate()).getTime();const pts=[{t:new Date(y,0,1).getTime(),v:0}];
  for(const s of sessionsIn(a,b+1)){const q=sMetrics(s);const v=kind==='run'?q.rd:q.bd;if(!v)continue;acc+=v;const d=new Date(s.start);pts.push({t:new Date(y,d.getMonth(),d.getDate()).getTime(),v:acc})}
  if(acc>0||yy===y)series.push({pts,color:col,name:String(yy)})}
 if(!series.some(s=>s.pts.length>1))return '';return chartCard(`${kind==='run'?'Running':'Cycling'} so far this year`,fmtNum(series[0].pts[series[0].pts.length-1].v,0)+' km',lineChart({series,fmt:v=>fmtNum(v,0)}),legend(series.map(s=>[s.name,s.color])))}
function vStatsV3(){
 const from=rangeStart();const ss=S.sessions.filter(s=>s.start>=from);const bk=buckets();const per=bk.unit;const now=Date.now();
 const sum=f=>ss.reduce((t,s)=>t+f(s),0);const M=new Map(ss.map(s=>[s.id,sMetrics(s)]));
 const days=new Set(ss.map(s=>ymd(s.start))).size;const run=sum(s=>M.get(s.id).rd),bike=sum(s=>M.get(s.id).bd),vol=sum(s=>M.get(s.id).vol),time=sum(s=>s.duration||0);
 const by=fn=>bk.list.map(b=>ss.filter(s=>s.start>=b.a&&s.start<b.b).reduce((t,s)=>t+fn(s),0));
 const labels=bk.list.map(b=>b.label);const types=['gym','run','bike','other'];const wkN=Math.max(1,bk.weeks||1);
 const wk=barChart({labels,series:types.map(k=>({color:`var(--${k})`,values:by(s=>typeKey(s)===k?1:0)})),fmt:v=>fmtNum(v,0),int:true});
 const tm=barChart({labels,series:types.map(k=>({color:`var(--${k})`,values:by(s=>typeKey(s)===k?(s.duration||0)/3600:0)}))});
 const loads=by(sessLoad);const acw=bk.list.map(b=>{const r=acwr(Math.min(b.b,now)-1);return r});
 const acPts=bk.list.map((b,i)=>acw[i]!=null?{t:Math.min(b.b,now),v:Math.round(acw[i]*100)/100}:null).filter(Boolean);
 const p=activePlan();let adh='';
 if(p&&p.mode==='week'){const sums=S.weekSummaries.filter(w=>w.planId===p.id&&w.week>=from);const cur=weekDone(p,weekStart(now));const lab=[...sums.map(w=>fmtDate(w.week)),'Now'];const vals=[...sums.map(w=>w.done.length),p.workouts.filter(w=>cur.has(w.id)).length];
  if(sums.length)adh=chartCard(`Plan adherence · ${esc(p.name)}`,`${Math.round(100*sums.reduce((t,w)=>t+w.done.length,0)/Math.max(1,sums.reduce((t,w)=>t+w.target,0)))}%`,barChart({labels:lab,series:[{color:'var(--accent)',values:vals}],target:p.workouts.length,fmt:v=>fmtNum(v,0),int:true}),`<p class="hint">Plan workouts done each week against the target of ${p.workouts.length}.</p>`)}
 const runs=ss.filter(s=>M.get(s.id).rd>0&&M.get(s.id).rt>0).map(s=>({t:s.start,v:M.get(s.id).rt/M.get(s.id).rd,km:M.get(s.id).rd}));
 const rides=ss.filter(s=>M.get(s.id).bd>0&&M.get(s.id).bt>0).map(s=>({t:s.start,v:M.get(s.id).bd/(M.get(s.id).bt/3600)}));
 const hrs=[];for(const s of ss)for(const x of s.ex)if(x.cat==='run'&&num(x.vals&&x.vals.hr)>0)hrs.push({t:s.start,v:num(x.vals.hr)});
 const others=new Map();for(const s of ss)if(typeKey(s)==='other'){const k=typeLabel(s);const o=others.get(k)||{n:0,t:0};o.n++;o.t+=s.duration||0;others.set(k,o)}
 const dow=[0,0,0,0,0,0,0];const tod={Morning:0,Afternoon:0,Evening:0,Night:0};for(const s of ss){dow[(new Date(s.start).getDay()+6)%7]++;const h=new Date(s.start).getHours();tod[h<12?'Morning':h<17?'Afternoon':h<21?'Evening':'Night']++}
 const mgSets={};const exVol=new Map();for(const s of ss)for(const x of s.ex){if(x.cat!=='gym')continue;const g=x.mg||guessMG(x.name)||'other';let v=0;for(const z of x.sets||[])if(z.t!=='w'&&(num(z.r)>0||z.t==='f')){mgSets[g]=(mgSets[g]||0)+1;v+=(num(z.r)||0)*(num(z.w)||0)}const k=norm(x.name);const e=exVol.get(k)||{name:x.name,v:0,n:0};e.v+=v;e.n++;exVol.set(k,e)}
 const zoneRuns=[0,0,0,0,0];let zoneOK=!!paceZones();if(zoneOK)for(const r of runs){const z=zoneOfPace(r.v);if(z!=null)zoneRuns[z]+=r.km}
 const pm=computePRs();const prBy=bk.list.map(b=>{let n=0;for(const k in pm)pm[k].hist.forEach((h,i)=>{if(h.src==='auto'&&i>0&&h.t>=b.a&&h.t<b.b)n++});return n});
 /* check-in vs performance */
 const ckOf=s=>s.check||S.checkins.find(c=>ymd(c.t)===ymd(s.start));let ckHTML='';
 {const grp=(f,test)=>{const a=ss.filter(s=>{const c=ckOf(s);return c&&c[f]&&test(c[f])});return{n:a.length,load:a.length?a.reduce((t,s)=>t+sessLoad(s),0)/a.length:0,vol:(()=>{const g=a.filter(s=>M.get(s.id).vol>0);return g.length?g.reduce((t,s)=>t+M.get(s.id).vol,0)/g.length:0})()}};
  const sh=grp('sl',v=>v>=4),sl=grp('sl',v=>v<=2),eh=grp('e',v=>v>=4),el=grp('e',v=>v<=2);
  if((sh.n>=2&&sl.n>=2)||(eh.n>=2&&el.n>=2))ckHTML=`<div class="card"><div class="h3">Check-in vs performance</div><div class="tablewrap"><table class="cmp"><tr><th></th><th>Workouts</th><th>Avg load</th><th>Avg volume</th></tr>
   ${[['Slept well (4–5)',sh],['Slept badly (1–2)',sl],['High energy (4–5)',eh],['Low energy (1–2)',el]].filter(r=>r[1].n).map(([l,g])=>`<tr><td>${l}</td><td>${g.n}</td><td>${fmtNum(g.load,0)}</td><td>${g.vol?fmtNum(g.vol/1000,1)+' t':'—'}</td></tr>`).join('')}</table></div><p class="hint">Based on your daily check-ins. Patterns get clearer after a few weeks.</p></div>`}
 const freq=new Map();for(const s of ss)for(const x of s.ex)if(x.cat==='gym'&&x.name){const n=norm(x.name);const e=freq.get(n)||{name:x.name,c:0};e.c++;e.name=x.name;freq.set(n,e)}
 const exs=[...freq.entries()].sort((a,b)=>b[1].c-a[1].c);if(!ui.statEx||!freq.has(ui.statEx))ui.statEx=exs[0]?exs[0][0]:null;
 let gym='';if(ui.statEx){const hw=[],e1=[],vo=[],mr=[];for(const s of ss)for(const x of s.ex){if(x.cat!=='gym'||norm(x.name)!==ui.statEx)continue;let h=0,e=0,v=0,r=0;for(const z of x.sets||[]){if(z.t==='w')continue;const rr=num(z.r),w=num(z.w);if(!(rr>0))continue;r=Math.max(r,rr);if(w>0){h=Math.max(h,w);e=Math.max(e,rr===1?w:w*(1+rr/30));v+=w*rr}}if(h){hw.push({t:s.start,v:h});e1.push({t:s.start,v:Math.round(e*10)/10});vo.push({t:s.start,v})}if(r)mr.push({t:s.start,v:r})}
  const kg=v=>fmtNum(v,v<100?1:0);const gain=hw.length>1?hw[hw.length-1].v-hw[0].v:0;
  gym=`<label class="field"><span>Exercise</span><select class="in" id="stat-ex" data-b="u|statEx" data-rr="1">${exs.map(([k,e])=>`<option value="${esc(k)}" ${k===ui.statEx?'selected':''}>${esc(e.name)} (${e.c})</option>`).join('')}</select></label>
  ${hw.length?chartCard('Heaviest set and estimated 1RM',`${kg(hw[hw.length-1].v)} kg${gain?` <span class="${gain>0?'ok':'slow'}" style="font-size:14px">${gain>0?'+':''}${kg(gain)}</span>`:''}`,lineChart({series:[{pts:hw,color:'var(--gym)'},{pts:e1,color:'var(--dim)'}],fmt:kg}),legend([['Heaviest set (kg)','var(--gym)'],['Estimated 1RM (kg)','var(--dim)']]))+chartCard('Volume per session','',lineChart({series:[{pts:vo,color:'var(--accent)'}],fmt:fmtAxis})):''}
  ${chartCard('Best set, reps',mr.length?mr[mr.length-1].v+' reps':'',lineChart({series:[{pts:mr,color:'var(--other)'}],fmt:v=>fmtNum(v,0)}))}`}
 const bw=bestWeeks();const bwRow=(l,o,f)=>`<div class="tile"><b class="num">${o?f(o.v):'—'}</b><span>${l}${o?`<br>week of ${fmtDate(o.w)}`:''}</span></div>`;
 const bodyPts=[...S.body].filter(b=>num(b.kg)>0).sort((a,b)=>a.t-b.t).map(b=>({t:b.t,v:num(b.kg)}));
 const ins=insightsList();
 return `<header class="hdr"><div><div class="eyebrow">${plural(ss.length,'workout')} in range</div><h1 class="h1">Stats</h1></div></header>
 ${seg([['4w','4 weeks'],['3m','3 months'],['1y','1 year'],['all','All']],ui.range,'range')}
 <div class="tiles"><div class="tile"><b>${ss.length}</b><span>workouts</span></div><div class="tile"><b>${days}</b><span>active days</span></div><div class="tile"><b>${fmtNum(time/3600,0)}<small>h</small></b><span>time trained</span></div><div class="tile"><b>${fmtNum(run,0)}<small>km</small></b><span>running</span></div><div class="tile"><b>${fmtNum(bike,0)}<small>km</small></b><span>cycling</span></div><div class="tile"><b>${fmtNum(vol/1000,1)}<small>t</small></b><span>lifted</span></div></div>
 ${ins.length?`<div class="card"><div class="eyebrow">Insights</div>${ins.map(x=>`<div class="insight" style="--c:${x.c}"><span class="ii">${ic(x.i,17)}</span><div class="grow"><b>${esc(x.t)}</b><span class="muted">${esc(x.d)}</span></div></div>`).join('')}</div>`:''}
 ${chartCard('Consistency','',heatmapSVG(),`<p class="hint">Each square is a day over the last 26 weeks. Current streak: <b>${plural(weekStreak(),'week')}</b>, <b>${plural(dayStreak(),'day')}</b>.</p>`)}
 ${cmpCard()}
 <div class="sec"><div class="h2">Load</div><button class="btn ghost sm" data-act="go" data-v="readiness">Readiness</button></div>
 ${chartCard(`Training load per ${per}`,fmtNum(sum(sessLoad),0),ss.length?barChart({labels,series:[{color:'var(--strain)',values:loads}],fmt:v=>fmtNum(v,0)}):'','<p class="hint">Minutes × effort (RPE) for every workout.</p>')}
 ${acPts.length>1?chartCard('Load ratio','',lineChart({series:[{pts:acPts,color:'var(--strain)'}],fmt:v=>fmtNum(v,1)}),'<p class="hint">Last 7 days against your 4-week average. Between 0.8 and 1.3 is the steady zone; above 1.5 is a spike.</p>'):''}
 <div class="sec"><div class="h2">Training</div></div>
 ${chartCard(`Workouts per ${per}`,'',ss.length?wk:'',legend(types.map(k=>[CAT[k],`var(--${k})`])))}
 ${chartCard(`Hours per ${per}`,fmtNum(time/3600,1)+' h',ss.length?tm:'')}
 ${adh}
 ${ss.length?`<div class="card"><div class="h3">When you train</div>${hbars(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d,i)=>[d,dow[i]]),v=>fmtNum(v,0))}<div style="height:6px"></div>${hbars(Object.entries(tod).map(([k,v])=>[k,v,'var(--strain)']),v=>fmtNum(v,0))}</div>`:''}
 <div class="sec"><div class="h2">Best weeks</div></div>
 <div class="best">${bwRow('most workouts',bw.n,v=>v)}${bwRow('most time',bw.t,v=>fmtHM(v))}${bwRow('most running',bw.run,v=>fmtNum(v,1)+'<small>km</small>')}${bwRow('most cycling',bw.bike,v=>fmtNum(v,0)+'<small>km</small>')}</div>
 <div class="sec"><div class="h2">Running</div><button class="btn ghost sm" data-act="go" data-v="zones">Zones</button></div>
 ${chartCard(`Distance per ${per}`,run?fmtNum(run,1)+' km':'',run?barChart({labels,series:[{color:'var(--run)',values:by(s=>M.get(s.id).rd)}]}):'')}
 ${chartCard('Average pace per run',runs.length?fmtDur(runs[runs.length-1].v)+' /km':'',lineChart({series:[{pts:runs,color:'var(--run)'}],fmt:v=>fmtDur(v),invert:true}),runs.length?'<p class="hint">Faster runs sit higher on the chart.</p>':'')}
 ${zoneOK&&runs.length?chartCard('Running by pace zone','km',hbars(PZ.map(([k,l],i)=>[`${k} ${l}`,zoneRuns[i],'var(--run)']),v=>fmtNum(v,0)),'<p class="hint">Each run counted in the zone of its average pace.</p>'):''}
 ${hrs.length?chartCard('Average heart rate per run',hrs[hrs.length-1].v+' bpm',lineChart({series:[{pts:hrs,color:'var(--gym)'}],fmt:v=>fmtNum(v,0)})):''}
 ${(()=>{const ks=[[5,'5 km'],[10,'10 km'],[21.0975,'Half'],[42.195,'Marathon']];const any=ks.some(([k])=>predictTime(k));return any?`<div class="card"><div class="chead"><div class="h3">Race predictions</div><button class="btn ghost sm" data-act="go" data-v="race">Race</button></div><div class="tiles" style="grid-template-columns:repeat(2,1fr)">${ks.map(([k,l])=>{const p=predictTime(k);return `<div class="tile"><b>${p?fmtDur(p.t):'—'}</b><span>${l}${p?' · '+fmtDur(p.t/k)+' /km':''}</span></div>`}).join('')}</div></div>`:''})()}
 ${ytdChart('run')}
 <div class="sec"><div class="h2">Cycling</div></div>
 ${chartCard(`Distance per ${per}`,bike?fmtNum(bike,0)+' km':'',bike?barChart({labels,series:[{color:'var(--bike)',values:by(s=>M.get(s.id).bd)}]}):'')}
 ${chartCard('Average speed per ride',rides.length?fmtNum(rides[rides.length-1].v,1)+' km/h':'',lineChart({series:[{pts:rides,color:'var(--bike)'}],fmt:v=>fmtNum(v,1)}))}
 ${chartCard(`Elevation per ${per}`,'',sum(s=>M.get(s.id).el)?barChart({labels,series:[{color:'var(--bike)',values:by(s=>M.get(s.id).el)}]}):'')}
 ${ytdChart('bike')}
 <div class="sec"><div class="h2">Gym</div></div>
 ${Object.keys(mgSets).length?chartCard('Working sets per muscle group','per week',hbars(Object.entries(mgSets).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[MG[k]||'Unassigned',v/wkN,'var(--gym)']))):''}
 ${exVol.size?chartCard('Top exercises by volume','',hbars([...exVol.values()].sort((a,b)=>b.v-a.v).slice(0,6).map(e=>[e.name,e.v/1000,'var(--gym)']),v=>fmtNum(v,1)+' t')):''}
 ${prBy.some(v=>v)?chartCard(`Records per ${per}`,prBy.reduce((a,b)=>a+b,0)+' total',barChart({labels,series:[{color:'var(--bike)',values:prBy}],fmt:v=>fmtNum(v,0),int:true})):''}
 ${gym||'<div class="card"><p class="empty">No gym sets logged in this range.</p></div>'}
 ${ckHTML}
 ${others.size?`<div class="sec"><div class="h2">Other activities</div></div><div class="list">${[...others.entries()].sort((a,b)=>b[1].n-a[1].n).map(([k,o])=>`<div class="li">${typeBadge({type:'other'})}<span class="grow"><span class="t">${esc(k)}</span><span class="s">${plural(o.n,'session')} · ${fmtHM(o.t)}</span></span></div>`).join('')}</div>`:''}
 <div class="sec"><div class="h2">Body</div><button class="btn ghost sm" data-act="go" data-v="body">Open</button></div>
 ${bodyPts.length?chartCard('Body weight',fmtNum(bodyPts[bodyPts.length-1].v,1)+' kg',lineChart({series:[{pts:bodyPts,color:'var(--other)'}],fmt:v=>fmtNum(v,1)})):`<button class="card" style="width:100%" data-act="bodySheet"><b>Log your body weight</b><span class="muted sm">Track weight, body fat and waist over time.</span></button>`}`}
