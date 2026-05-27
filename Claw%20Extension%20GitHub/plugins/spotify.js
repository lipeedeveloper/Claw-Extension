/* CLAW Plugin — Spotify v39 | Focus Study Tools */
(function(){
'use strict';
if(window.__clawSpotify__) return;
window.__clawSpotify__ = true;
if(!location.hostname.includes('open.spotify.com')) return;

const MODEL='llama-3.3-70b-versatile';

const style=document.createElement('style');
style.textContent=`
#__claw_spotify_bar__{position:fixed!important;bottom:18px!important;right:18px!important;z-index:2147483647!important;display:flex!important;gap:6px!important;align-items:center!important;background:rgba(12,12,14,.92)!important;border:1px solid rgba(204,120,50,.18)!important;border-radius:16px!important;padding:8px!important;box-shadow:0 18px 48px rgba(0,0,0,.65)!important;font-family:'Inter',system-ui,sans-serif!important;backdrop-filter:blur(12px)!important}
.__claw_sp_btn{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:10px!important;color:#d4d4d8!important;font-size:11px!important;font-weight:600!important;padding:7px 10px!important;cursor:pointer!important;font-family:inherit!important;transition:all .15s!important}
.__claw_sp_btn:hover{background:rgba(204,120,50,.16)!important;border-color:rgba(204,120,50,.35)!important;color:#e8915a!important;transform:translateY(-1px)!important}
#__claw_sp_panel__{position:fixed!important;bottom:70px!important;right:18px!important;z-index:2147483647!important;width:320px!important;max-height:360px!important;overflow:auto!important;background:#18181b!important;border:1px solid rgba(204,120,50,.18)!important;border-radius:16px!important;box-shadow:0 20px 56px rgba(0,0,0,.7)!important;color:#e4e4e7!important;font-family:'Inter',system-ui,sans-serif!important;font-size:12px!important;line-height:1.65!important;white-space:pre-wrap!important;padding:14px!important}
`;
document.head.appendChild(style);

function q(sel){return document.querySelector(sel)}
function getTrackInfo(){
  const title = q('[data-testid="now-playing-widget"] a[href*="/track/"], [data-testid="context-item-info-title"]')?.textContent?.trim() || document.title.replace(/ - song and lyrics by.*$/i,'').replace(' - Spotify','');
  const artist = q('[data-testid="now-playing-widget"] a[href*="/artist/"], [data-testid="context-item-info-artist"]')?.textContent?.trim() || '';
  return {title, artist, url:location.href};
}
function showPanel(text){
  let p=document.getElementById('__claw_sp_panel__');
  if(!p){p=document.createElement('div');p.id='__claw_sp_panel__';document.body.appendChild(p);} p.textContent=text;
}
function callGroq(prompt){
  return new Promise((resolve,reject)=>chrome.runtime.sendMessage({type:'GROQ_FETCH',payload:{model:MODEL,messages:[{role:'user',content:prompt}],max_tokens:700,temperature:.25}},res=>{
    if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
    if(!res?.ok) return reject(new Error(res?.error||'Erro IA'));
    resolve(res.data?.choices?.[0]?.message?.content?.trim()||'');
  }));
}
async function action(type){
  const info=getTrackInfo();
  if(type==='focus'){
    location.href='https://open.spotify.com/search/focus%20study%20lofi';
    showPanel('Abrindo músicas de foco/estudo...');
    return;
  }
  if(type==='timer'){
    showPanel('Timer de foco iniciado: 25 minutos.\nQuando acabar, faça uma pausa curta de 5 minutos.');
    setTimeout(()=>showPanel('⏰ Foco concluído. Pausa de 5 minutos!'),25*60*1000);
    return;
  }
  showPanel('Analisando música...');
  try{
    const prompt=`Crie uma análise curta para estudo/foco desta música no Spotify. Não invente letra. Use: título=${info.title}; artista=${info.artist}; url=${info.url}. Dê uma sugestão de como usar essa música para concentração.`;
    showPanel(await callGroq(prompt));
  }catch(e){showPanel('Erro: '+e.message)}
}
function build(){
  if(document.getElementById('__claw_spotify_bar__')) return;
  const bar=document.createElement('div');bar.id='__claw_spotify_bar__';
  bar.innerHTML=`<button class="__claw_sp_btn" data-a="focus">Foco</button><button class="__claw_sp_btn" data-a="timer">25min</button><button class="__claw_sp_btn" data-a="study">Analisar</button><button class="__claw_sp_btn" data-a="x">×</button>`;
  document.body.appendChild(bar);
  bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(b.dataset.a==='x'){bar.remove();document.getElementById('__claw_sp_panel__')?.remove();} else action(b.dataset.a); });
}
setTimeout(build,1800);
chrome.runtime.onMessage.addListener((msg,_,reply)=>{ if(msg.type==='SPOTIFY_TOGGLE'){build();reply({ok:true});return true;} });
})();
