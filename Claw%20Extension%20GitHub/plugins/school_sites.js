/* CLAW Plugin — School Sites v46 | Classroom · Drive · Wiki · Khan · Translate · Forms */
(function(){
'use strict';
if(window.__clawSchoolSitesV46__) return;
window.__clawSchoolSitesV46__ = true;
const host = location.hostname;
const map = [
  [/classroom\.google\.com/, 'Classroom', 'assignment'],
  [/drive\.google\.com/, 'Drive', 'folder'],
  [/wikipedia\.org/, 'Wikipedia', 'menu_book'],
  [/khanacademy\.org/, 'Khan Academy', 'school'],
  [/translate\.google\.com/, 'Tradutor', 'translate'],
  [/forms\.google\.com|docs\.google\.com\/forms/, 'Forms', 'quiz'],];
const found = map.find(([rx])=>rx.test(host));
if(!found) return;
const siteName = found[1];
function send(type, payload={}){ return new Promise(resolve=>chrome.runtime.sendMessage({type,payload},res=>resolve(res||{}))); }
function selectedText(){ return String(getSelection()?.toString()||'').trim(); }
function pageText(){ const main=document.querySelector('main,article,[role="main"]')||document.body; return String((selectedText()||main.innerText||'')).replace(/\s+/g,' ').trim().slice(0,9000); }
function style(){ if(document.getElementById('__claw_school_style__'))return; const s=document.createElement('style');s.id='__claw_school_style__';s.textContent=`
#__claw_school_bar__{position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;display:flex!important;gap:6px!important;align-items:center!important;background:rgba(18,18,22,.94)!important;border:1px solid rgba(204,120,50,.22)!important;border-radius:16px!important;padding:8px!important;box-shadow:0 18px 50px rgba(0,0,0,.6)!important;font-family:Inter,system-ui,sans-serif!important;backdrop-filter:blur(12px)!important}
#__claw_school_bar__ .cs-title{color:#e8915a!important;font-size:11px!important;font-weight:800!important;padding:0 6px!important;max-width:90px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#__claw_school_bar__ button{background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important;color:#d4d4d8!important;border-radius:10px!important;padding:7px 9px!important;font-size:11px!important;font-weight:700!important;cursor:pointer!important}
#__claw_school_bar__ button:hover{background:rgba(204,120,50,.15)!important;color:#e8915a!important;border-color:rgba(204,120,50,.35)!important}
#__claw_school_out__{position:fixed!important;right:16px!important;bottom:68px!important;width:360px!important;max-height:58vh!important;overflow:auto!important;z-index:2147483647!important;background:rgba(22,22,26,.98)!important;border:1px solid rgba(204,120,50,.22)!important;border-radius:16px!important;box-shadow:0 22px 60px rgba(0,0,0,.65)!important;color:#e4e4e7!important;font-family:Inter,system-ui,sans-serif!important;font-size:12px!important;line-height:1.65!important;white-space:pre-wrap!important;padding:14px!important}
`;document.head.appendChild(s);}
function show(text){ let o=document.getElementById('__claw_school_out__'); if(!o){o=document.createElement('div');o.id='__claw_school_out__';document.body.appendChild(o);} o.textContent=text; }
async function action(kind){ show('Claw analisando '+siteName+'...'); const payload={ text:pageText(), topic:document.title+' · '+siteName }; const type=kind==='flash'?'CORE_FLASHCARDS':kind==='plan'?'CORE_STUDY_PLAN':'CORE_PAGE_ANALYZE'; if(kind==='solve') payload.topic = 'resolver exercício escolar: '+payload.topic; const res=await send(type,payload); show(res.ok ? (res.text||'Pronto.') : 'Erro: '+(res.error||'falha')); }
function build(){ style(); if(document.getElementById('__claw_school_bar__')) return; const b=document.createElement('div');b.id='__claw_school_bar__';b.innerHTML=`<div class="cs-title">Claw · ${siteName}</div><button data-a="sum">Resumo</button><button data-a="flash">Cards</button><button data-a="plan">Plano</button><button data-a="solve">Resolver</button><button data-a="x">×</button>`;document.body.appendChild(b);b.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.a;if(a==='x'){b.remove();document.getElementById('__claw_school_out__')?.remove();}else action(a);});}
setTimeout(build, 1500);
chrome.runtime.onMessage.addListener((msg,_,reply)=>{ if(msg.type==='SCHOOL_PLUGIN_OPEN'){ build(); reply({ok:true}); return true; } });
})();
