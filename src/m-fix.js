/* ================= v4.1: daily check-in prompt and fixes ================= */
function vSettings(){const h=vSettingsV4();const mark='<div class="field"><span>Appearance</span>';const add=`<div class="card" style="padding:4px 16px">${sw(S.settings.dailyAsk!==false,'toggleDailyAsk','','Ask how I feel the first time I open the app each day')}</div>`;return h.includes(mark)?h.replace(mark,add+mark):h}
function needDailyAsk(){if(!S||S.sample||ui.tour||ui.sheet||S.active)return false;if(S.settings.dailyAsk===false)return false;const top=ui.stack[ui.stack.length-1];if(top&&['onboard','session','live','mplay'].includes(top.v))return false;const d=ymd(Date.now());if(S.askDay===d)return false;const c=todayCheck();if(c&&c.e&&c.sl&&c.so)return false;return true}
function maybeAskCheck(){if(!needDailyAsk())return;S.askDay=ymd(Date.now());save();ui.sheet={t:'daily'};renderSheet()}
SHEETS.daily=function(){const ck=todayCheck()||{};const row=(k,label,lo,hi)=>`<div class="dq"><div class="dqh"><b>${label}</b><span class="muted xs">${lo} · ${hi}</span></div><div class="ckc">${[1,2,3,4,5].map(v=>`<button class="${ck[k]===v?'on':''}" data-act="dailySet" data-k="${k}" data-n="${v}" aria-label="${label} ${v} of 5">${v}</button>`).join('')}</div></div>`;
 const h=new Date().getHours();const hello=h<12?'Good morning':h<19?'Good afternoon':'Good evening';
 return `<div class="eyebrow">${fmtDate(Date.now(),{weekday:'long',day:'numeric',month:'long'})}</div><div class="h2" style="font-size:24px">${hello}. How do you feel?</div><p class="muted sm">Takes ten seconds and makes your readiness score accurate.</p>
 ${row('e','Energy','drained','full of energy')}${row('sl','Sleep quality','poor','great')}${row('so','Soreness','none','very sore')}
 <div class="grid2"><label class="field"><span>Hours slept</span><input class="in" id="dq-h" inputmode="decimal" value="${esc(ck.hrs??'')}" data-b="ck|hrs" data-t="num" placeholder="e.g. 7.5"></label><label class="field"><span>Steps yesterday</span><input class="in" id="dq-s" inputmode="numeric" value="${esc(ck.steps??'')}" data-b="ck|steps" data-t="num" placeholder="optional"></label></div>
 <button class="btn primary xl" data-act="dailySave">Save</button>
 <div class="btnrow"><button class="btn line" data-act="dailySkip">Not today</button><button class="btn line" data-act="dailyNever">Don't ask again</button></div>
 <p class="hint" style="text-align:center">You can turn this back on in Settings, and always check in from the Readiness card.</p>`};
Object.assign(ACT,{
 dailySet:d=>{setCheck(d.k,+d.n);renderSheet()},
 dailySave:()=>{const c=todayCheck();ui.sheet=null;ui.ckEdit=false;save();render();toast(c&&c.e&&c.sl&&c.so?`Readiness ${readiness()} · ${readyBand(readiness())[1]}`:'Saved')},
 dailySkip:()=>{ui.sheet=null;renderSheet()},
 dailyNever:()=>{S.settings.dailyAsk=false;ui.sheet=null;save();render();toast('Turned off. Switch it back on in Settings.')},
 toggleDailyAsk:()=>{S.settings.dailyAsk=S.settings.dailyAsk===false;save();render()}});
setTimeout(function waitBoot(){if(!S){setTimeout(waitBoot,300);return}setTimeout(maybeAskCheck,700)},400);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(maybeAskCheck,600)});
function markBig(){const a=$('#app');if(!a)return;const top=ui.stack[ui.stack.length-1];a.classList.toggle('hasbig',!!top&&!!a.querySelector('.topbar ~ h1.h1, .topbar ~ div > h1.h1, .topbar ~ .hdr h1.h1'))}
const _renderV41=render;render=function(){_renderV41();markBig();document.body.classList.toggle('scrolled',window.scrollY>36)};
window.addEventListener('scroll',()=>{document.body.classList.toggle('scrolled',window.scrollY>36)},{passive:true});
