(async function boot(){
 await DB.open();let raw=await DB.get('state');
 if(!raw){try{const ls=localStorage.getItem('ss-state');if(ls)raw=JSON.parse(ls)}catch(e){}}
 S=raw&&raw.v?migrate(raw):makeSample();
 applyTheme();stamp(true);closeWeeks();
 const ret=stravaReturn();
 render();ui.inSync=true;save();ui.inSync=false;
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 try{if(document.querySelector('link[rel="manifest"]')&&'serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
 if(ret)await handleStravaReturn(ret);
 await syncNow();
 if(S.strava.access&&Date.now()-(S.strava.checked||0)>30*60e3)stravaCheck(true);
})();
