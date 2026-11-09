/* ================= v6: settings hub, visual customization, Pro style ================= */
Object.assign(ACCENTS,{aurora:['#FF5D8F','#FFFFFF','Tempo'],ice:['#5CE1E6','#03161A','Ice'],recovery:['#1FD38A','#03150D','Recovery'],lime:['#C8F23C','#121600','Lime'],ember:['#FF7A45','#FFFFFF','Ember'],mono:['#F2F2F2','#000000','Mono']});
Object.assign(ACCENT2,{ice:'#3A7BFF',recovery:'#5CE1E6',lime:'#1FD38A',ember:'#FF5D8F',mono:'#8B939C'});
const ACC_ORDER=['aurora','blue','ice','recovery','mint','lime','amber','ember','red','violet','mono'];
const VIS_DEFAULT={style:'pro',bg:'tint',font:'system',numw:'thin',radius:'std',density:'cozy',labels:'on',borders:'on'};
const VIS_OPTS={
 style:[['pro','Pro','Flat, black, high contrast'],['glass','Glass','Frosted cards on aurora'],['carbon','Carbon','Soft graphite greys']],
 bg:[['tint','Readiness glow'],['plain','Plain'],['aurora','Aurora']],
 font:[['system','System'],['rounded','Rounded'],['condensed','Condensed'],['serif','Serif'],['mono','Mono']],
 numw:[['thin','Thin'],['regular','Regular'],['bold','Bold']],
 radius:[['sharp','Sharp'],['std','Standard'],['round','Round']],
 density:[['cozy','Comfortable'],['compact','Compact']]};
const vis=()=>({...VIS_DEFAULT,...(S&&S.settings.vis||{})});
const visLabel=(k,v)=>((VIS_OPTS[k]||[]).find(o=>o[0]===v)||[,''])[1];
function visSummary(){const v=vis();return `${visLabel('style',v.style)} · ${(ACCENTS[S.settings.accent]||ACCENTS.aurora)[2]} · ${visLabel('font',v.font)}`}
function emptyState(){const s=emptyStateV5();s.v=6;s.settings.vis={...VIS_DEFAULT};return s}
function migrate(st){const was=st.v||1;st=migrateV5(st);if(was<6||!st.settings.vis){st.settings.vis={...VIS_DEFAULT,...(st.settings.vis||{})};if(st.settings.cards==='solid')st.settings.vis.style='carbon'}st.v=6;return st}
function applyTheme(){const r=document.documentElement;const st=S&&S.settings||{};const v=vis();r.setAttribute('data-theme','dark');
 for(const k of ['style','bg','font','numw','radius','density'])r.setAttribute('data-'+k,v[k]);
 r.classList.toggle('nolabels',v.labels==='off');r.classList.toggle('noborders',v.borders==='off');r.classList.toggle('bigtext',st.textSize==='large');r.classList.toggle('calm',st.motion==='reduced');r.classList.remove('solid');
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=v.style==='glass'?'#120B2E':v.style==='carbon'?'#141416':'#07090B';applyAccent()}
function moodColor(){let v=50;try{v=readiness()}catch(e){}if(vis().style==='glass')return v>=67?'#FF5D8F':v>=34?'#8B5CFF':'#3A7BFF';return v>=67?'#1FD38A':v>=34?'#FFC93C':'#FF4D5E'}

/* --- gear button on every page --- */
const NOGEAR=new Set(['settings','visual','appearance','backup','session','summary','live','mplay','onboard']);
function addGear(h,top){const g=`<button class="gearbtn" data-act="go" data-v="settings" aria-label="Settings">${ic('cog',19)}</button>`;
 if(top){if(NOGEAR.has(top.v))return h;return h.replace('<div class="tb-right"></div>',`<div class="tb-right">${g}</div>`)}
 return `<div class="gearfix">${g}</div>`+h}

/* --- settings hub --- */
const setRow=(act,icon,t,s,extra='',c='var(--muted)',q='')=>`<button class="li srow2" data-act="${act}" ${extra} data-q="${esc((t+' '+s+' '+q).toLowerCase())}"><span class="lt" style="--c:${c}">${ic(icon,18)}</span><span class="grow"><span class="t">${t}</span>${s?`<span class="s">${s}</span>`:''}</span><span class="chev">${ic('chev',18)}</span></button>`;
const setTog=(on,k,t,s,q='')=>`<div class="li srow2 stog" data-q="${esc((t+' '+s+' '+q).toLowerCase())}"><span class="grow"><span class="t">${t}</span>${s?`<span class="s">${s}</span>`:''}</span><button class="switch ${on?'on':''}" data-act="togSet" data-k="${k}" role="switch" aria-checked="${!!on}" aria-label="${esc(t)}"><span class="knob"></span></button></div>`;
const setGroup=(t,rows)=>`<section class="sgroup"><div class="sgt">${t}</div><div class="list">${rows.join('')}</div></section>`;
function vSettings(){const st=S.settings;const f=featValue(st.featured);
 return `${topbar('Settings')}<h1 class="h1">Settings</h1>
 <input class="in" id="ssearch" type="search" placeholder="Search settings" data-live="settings" autocomplete="off">
 ${setGroup('Account and sync',[
  setRow('go','sync','Sync between devices',esc(syncLabel()),'data-v="sync"',S.sync.token?(S.sync.err?'var(--bad)':'var(--ok)'):'var(--muted)','gist github backup cloud'),
  setRow('go','link','Strava',S.strava.access?'Connected':'Import your history','data-v="strava"','#FC4C02','import activities')])}
 ${setGroup('Look and feel',[
  setRow('go','sliders','Visual customization',esc(visSummary()),'data-v="visual"','var(--accent)','theme style colour color accent font typeface corners background dark'),
  setRow('go','home','Customize Today','Cards, order and size','data-v="customize"','var(--accent)','widgets home'),
  setRow('featSheet','star','Highlighted stat',esc(f.label),'','var(--accent)','featured streak big number'),
  setTog(st.fab!==false,'fab','Quick-log button','The floating + on Today','fab plus')])}
 ${setGroup('Workouts',[
  setTog(st.focusDefault!==false,'focusDefault','Start in focus mode','One exercise at a time. Off shows the full list','list view'),
  setTog(st.sound!==false,'sound','Rest timer sound','A beep when rest ends','audio beep'),
  setTog(st.haptics!==false,'haptics','Vibration','On set done and when rest ends','haptic buzz'),
  `<label class="li srow2 stog" data-q="weight step increment progression kg suggestions"><span class="grow"><span class="t">Weight step</span><span class="s">Used for weight suggestions</span></span><input class="in mini" id="set-inc" inputmode="decimal" value="${esc(st.inc)}" data-b="set|inc" data-t="num"><span class="muted sm">kg</span></label>`,
  setTog(st.dailyAsk!==false,'dailyAsk','Morning check-in','Ask how I feel the first time I open the app each day','sleep readiness')])}
 ${setGroup('Training setup',[
  setRow('go','sliders','Set up my plan','Three questions, then a plan','data-v="onboard"','var(--muted)','onboarding'),
  setRow('go','gauge','Training zones','Pace and heart rate','data-v="zones"','var(--muted)','hr'),
  setRow('go','flag','Race',S.race&&S.race.date?esc(S.race.name||'Race'):'Countdown and predicted time','data-v="race"'),
  setRow('go','shoe','Shoes and bikes','Kilometres per pair','data-v="gear"'),
  setRow('go','bandage','Injuries',activeInj().length?plural(activeInj().length,'active injury','active injuries'):'Nothing tracked','data-v="injuries"')])}
 ${setGroup('Data',[
  setRow('go','download','Backup and restore',S.lastBackup?'Last backup '+fmtDate(S.lastBackup):'No backup file yet','data-v="backup"','var(--muted)','export import json file erase delete reset'),
  setRow('go','link','Import from Strava','activities.csv from your archive','data-v="strava"')])}
 ${setGroup('Help',[
  setRow('tourStart','school','Interactive tutorial','A guided tour with sample data'),
  `<div class="li srow2" data-q="install home screen iphone android"><span class="lt" style="--c:var(--muted)">${ic('phone',18)}</span><span class="grow"><span class="t">Install on your phone</span><span class="s">iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Install app.</span></span></div>`])}
 <div class="aboutf">${logoSVG(36)}<b>tempo<i>.</i></b><span>Version 6.0 · works offline</span></div>`}
function vBackup(){const h=vSettingsV2();const a=h.indexOf('<div class="sec"><div class="h2">Backup</div></div>');const b=h.lastIndexOf('<p class="hint">');return `${topbar('Backup and data')}<h1 class="h1">Backup and data</h1>`+(a>0?h.slice(a,b>a?b:undefined):'')}

/* --- visual customization --- */
function visPreview(){const v=vis();return `<div class="vprev"><div class="vp-top"><span class="eyebrow">Today</span>${ic('cog',14)}</div>
 <div class="vp-row"><div class="vp-card"><span class="eyebrow">Streak</span><b class="vp-num">12</b><small>weeks</small></div>
 <div class="vp-card vp-ring">${ringSVG2(.78,'var(--accent)',6)}<b>78</b></div></div>
 <div class="vp-btn">Start workout</div><div class="vp-tabs">${['home','train','progress','you'].map((i,k)=>`<span class="${k?'':'on'}">${ic(i,16)}<em>${['Today','Train','Progress','You'][k]}</em></span>`).join('')}</div></div>`}
function vVisual(){const v=vis();const st=S.settings;const opt=(k,lab,cls='')=>`<div class="vfield"><span class="vlab">${lab}</span>${seg(VIS_OPTS[k].map(o=>[o[0],o[1]]),v[k],'vis',`data-k="${k}"`,cls)}</div>`;
 return `${topbar('Visual customization')}<h1 class="h1">Look and feel</h1>
 <div class="vsticky">${visPreview()}</div>
 <section class="sgroup"><div class="sgt">Style</div><div class="stylepick">${VIS_OPTS.style.map(([k,l,d])=>`<button class="stcard ${v.style===k?'on':''}" data-act="vis" data-k="style" data-val="${k}"><span class="stsw st-${k}"><i></i><i></i><i></i></span><b>${l}</b><small>${d}</small></button>`).join('')}</div></section>
 <section class="sgroup"><div class="sgt">Accent</div><div class="swatches acc">${ACC_ORDER.filter(k=>ACCENTS[k]).map(k=>`<button class="swatch ${(st.accent||'aurora')===k?'on':''}" style="--c:${ACCENTS[k][0]};background:${ACCENTS[k][0]}" data-act="accent" data-k="${k}" aria-label="${ACCENTS[k][2]}">${(st.accent||'aurora')===k?ic('check',18):''}</button>`).join('')}</div><p class="hint">${esc((ACCENTS[st.accent]||ACCENTS.aurora)[2])}. Used for buttons, rings and highlights.</p></section>
 <section class="sgroup"><div class="sgt">Background</div>${seg(VIS_OPTS.bg,vis().bg,'vis','data-k="bg"')}<p class="hint">Readiness glow tints the top of the screen green, yellow or red with how ready you are.</p></section>
 <section class="sgroup"><div class="sgt">Type</div><div class="fontpick">${VIS_OPTS.font.map(([k,l])=>`<button class="fcard ${v.font===k?'on':''}" data-act="vis" data-k="font" data-val="${k}"><b class="ff-${k}">Aa 72</b><small>${l}</small></button>`).join('')}</div>${opt('numw','Number weight')}</section>
 <section class="sgroup"><div class="sgt">Layout</div>${opt('radius','Corners')}${opt('density','Spacing')}
  <div class="list">${setTogV('labels','Tab labels','Show names under the tab icons')}${setTogV('borders','Card outlines','A thin line around cards')}</div></section>
 <section class="sgroup"><div class="sgt">Accessibility</div><div class="vfield"><span class="vlab">Text size</span>${seg([['normal','Normal'],['large','Large']],st.textSize||'normal','setPref','data-k="textSize"')}</div><div class="vfield"><span class="vlab">Motion</span>${seg([['full','Full'],['reduced','Reduced']],st.motion||'full','setPref','data-k="motion"')}</div></section>
 <button class="btn line" data-act="visReset">Reset look to default</button>`}
const setTogV=(k,t,s)=>{const on=vis()[k]!=='off';return `<div class="li srow2 stog"><span class="grow"><span class="t">${t}</span><span class="s">${s}</span></span><button class="switch ${on?'on':''}" data-act="visTog" data-k="${k}" role="switch" aria-checked="${on}" aria-label="${t}"><span class="knob"></span></button></div>`};
Object.assign(VIEWS,{settings:vSettings,visual:vVisual,appearance:vVisual,backup:vBackup});
Object.assign(ACT,{
 togSet:d=>{S.settings[d.k]=S.settings[d.k]===false;save();render()},
 vis:d=>{const nv={...vis(),[d.k]:d.val};if(d.k==='style'){if(d.val==='glass')nv.bg='aurora';else if(vis().style==='glass'&&nv.bg==='aurora')nv.bg='tint'}S.settings.vis=nv;applyTheme();save();render()},
 visTog:d=>{const v=vis();S.settings.vis={...v,[d.k]:v[d.k]==='off'?'on':'off'};applyTheme();save();render()},
 visReset:()=>{S.settings.vis={...VIS_DEFAULT};S.settings.accent='aurora';S.settings.textSize='normal';S.settings.motion='full';applyTheme();save();render();toast('Look reset')},
 accent:d=>{S.settings.accent=d.k;applyTheme();save();render()}});
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.live==='settings'){const q=norm(e.target.value);document.querySelectorAll('.srow2').forEach(r=>{r.hidden=!!q&&!(r.dataset.q||'').includes(q)&&!norm(r.textContent).includes(q)});document.querySelectorAll('.sgroup').forEach(g=>{g.hidden=!!q&&![...g.querySelectorAll('.srow2')].some(r=>!r.hidden)})}});
if(!I.phone)I.phone='<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>';
if(!I.download)I.download='<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>';
I.cog='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>';
