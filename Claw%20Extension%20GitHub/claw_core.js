/* CLAW — claw_core.js v45 Advanced School OS | safe study helper */
(function(){
'use strict';
if (window.__clawCoreV45__) return;
window.__clawCoreV45__ = true;

const CORE_ID = '__claw_core_panel__';
const STYLE_ID = '__claw_core_style__';

function clean(t){ return String(t||'').replace(/\s+/g,' ').trim(); }
function visible(el){ try{ const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity!==0; }catch{return false;} }
function pageText(){
  const sel = clean(getSelection()?.toString() || '');
  if (sel) return sel.slice(0, 9000);
  const main = document.querySelector('main,article,[role="main"],.main,#main') || document.body;
  return clean(main?.innerText || document.body.innerText || '').slice(0, 12000);
}
function extractQuestions(){
  const nodes=[...document.querySelectorAll('h1,h2,h3,[role="heading"],p,div,span,button,[role="button"],label')].filter(visible);
  const texts=nodes.map(e=>clean(e.innerText||e.textContent||e.getAttribute('aria-label')||'')).filter(t=>t.length>1&&t.length<260);
  const question = texts.find(t=>/[?=]|quanto|qual|quem|onde|quando|por que|resolva|calcule/i.test(t)) || '';
  const options=[]; const seen=new Set();
  for(const t of texts){
    if(t===question) continue;
    if(t.length<120 && !seen.has(t.toLowerCase())){ seen.add(t.toLowerCase()); options.push(t); }
    if(options.length>=8) break;
  }
  return { question, options };
}


function detectSubject(text){
  const t=String(text||'').toLowerCase();
  if(/matem|calcule|equação|fração|porcent|raiz|potência|geometria|álgebra|função|mmc|mdc|expressão|\d\s*[+\-×x÷:^]/.test(t)) return 'Matemática';
  if(/física|velocidade|força|energia|movimento|newton|massa|aceleração|densidade/.test(t)) return 'Física';
  if(/química|átomo|molécula|tabela periódica|ph|reação|substância|elemento químico/.test(t)) return 'Química';
  if(/biologia|célula|fotossíntese|ecossistema|genética|dna|evolução|organismo/.test(t)) return 'Biologia';
  if(/história|revolução|império|guerra|século|colonização|idade média/.test(t)) return 'História';
  if(/geografia|território|estado|nação|clima|relevo|população|mapa|país/.test(t)) return 'Geografia';
  if(/português|gramática|verbo|sujeito|predicado|figura de linguagem|texto/.test(t)) return 'Português';
  if(/english|inglês|translate|tradução|verb|simple past|present/.test(t)) return 'Inglês';
  return 'Geral';
}

function normalizeMath(s){
  const sup={'⁰':'^0','¹':'^1','²':'^2','³':'^3','⁴':'^4','⁵':'^5','⁶':'^6','⁷':'^7','⁸':'^8','⁹':'^9'};
  return String(s||'').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,ch=>sup[ch]||'')
    .replace(/[×·]/g,'*').replace(/([0-9)])\s*[xX]\s*(?=[0-9(])/g,'$1*')
    .replace(/[÷:]/g,'/').replace(/[−–—]/g,'-').replace(/√/g,'sqrt').replace(/π/gi,'pi')
    .replace(/,/g,'.').replace(/=/g,'').replace(/\s+/g,'').replace(/(\d|\)|pi|e)(?=\()/gi,'$1*')
    .replace(/\)(?=(\d|pi|e|sqrt))/gi,')*');
}
function evalMath(input){
  const s=normalizeMath(input).replace(/%/g,'/100'); let i=0;
  function eat(ch){ if(s[i]===ch){i++;return true;} return false; }
  function num(){ if(s.slice(i,i+2).toLowerCase()==='pi'){i+=2;return Math.PI;} if(s[i]?.toLowerCase()==='e'&&!/[a-z]/i.test(s[i+1]||'')){i++;return Math.E;} const m=s.slice(i).match(/^\d+(?:\.\d+)?/); if(!m) throw 0; i+=m[0].length; return +m[0]; }
  function primary(){ if(s.slice(i,i+4).toLowerCase()==='sqrt'){i+=4; if(eat('(')){const v=expr(); eat(')'); return Math.sqrt(v);} return Math.sqrt(primary());} if(eat('(')){const v=expr(); eat(')'); return v;} return num(); }
  function unary(){ if(eat('+')) return unary(); if(eat('-')) return -unary(); return primary(); }
  function pow(){ let v=unary(); if(eat('^')) v=Math.pow(v,pow()); return v; }
  function term(){ let v=pow(); for(;;){ if(eat('*')) v*=pow(); else if(eat('/')) v/=pow(); else break; } return v; }
  function expr(){ let v=term(); for(;;){ if(eat('+')) v+=term(); else if(eat('-')) v-=term(); else break;} return v; }
  try{ const v=expr(); return i===s.length && Number.isFinite(v) ? v : NaN; }catch{return NaN;}
}
function extractMath(text){
  const n=normalizeMath(text); const groups=n.match(/[0-9piersqrt()+\-*/^.,%]+/gi)||[];
  return groups.sort((a,b)=>b.length-a.length).find(g=>(g.match(/[+\-*/^]/g)||[]).length && /\d/.test(g)) || '';
}

function localAnalyze(){
  const qa=extractQuestions();
  const expr=extractMath(qa.question || pageText().slice(0,800));
  const val=expr ? evalMath(expr) : NaN;
  const txt = pageText(); return { url: location.href, title: document.title, selected: clean(getSelection()?.toString()||''), text: txt, question: qa.question, options: qa.options, subject: detectSubject((qa.question||'')+' '+txt.slice(0,900)), math: Number.isFinite(val) ? { expression: expr, value: val } : null };
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID)) return;
  const st=document.createElement('style'); st.id=STYLE_ID; st.textContent=`
#${CORE_ID}{position:fixed!important;right:18px!important;bottom:18px!important;width:340px!important;max-height:70vh!important;z-index:2147483647!important;background:rgba(22,22,26,.96)!important;color:#f0f0f2!important;border:1px solid rgba(204,120,50,.22)!important;border-radius:16px!important;box-shadow:0 24px 70px rgba(0,0,0,.65)!important;font-family:'Inter','Plus Jakarta Sans',system-ui,sans-serif!important;overflow:hidden!important;backdrop-filter:blur(16px)!important}
#${CORE_ID} .cc-head{display:flex!important;align-items:center!important;gap:8px!important;padding:11px 13px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:rgba(204,120,50,.07)!important}
#${CORE_ID} .cc-title{font-size:12px!important;font-weight:800!important;color:#e8915a!important;flex:1!important;letter-spacing:.04em!important}
#${CORE_ID} .cc-close{border:0!important;background:transparent!important;color:#b0b0bc!important;font-size:18px!important;cursor:pointer!important}
#${CORE_ID} .cc-body{padding:12px!important;display:flex!important;flex-direction:column!important;gap:8px!important;max-height:58vh!important;overflow:auto!important}
#${CORE_ID} .cc-actions{display:flex!important;gap:6px!important;flex-wrap:wrap!important}
#${CORE_ID} button.cc-btn{background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important;color:#d4d4d8!important;border-radius:10px!important;padding:7px 10px!important;font-size:11px!important;font-weight:700!important;cursor:pointer!important}
#${CORE_ID} button.cc-btn:hover{background:rgba(204,120,50,.14)!important;color:#e8915a!important;border-color:rgba(204,120,50,.32)!important}
#${CORE_ID} .cc-out{white-space:pre-wrap!important;font-size:12px!important;line-height:1.6!important;color:#d4d4d8!important;background:rgba(255,255,255,.035)!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:12px!important;padding:10px!important;min-height:70px!important}
`; document.head.appendChild(st);
}
function setOut(text){ const el=document.querySelector(`#${CORE_ID} .cc-out`); if(el) el.textContent=text; }
function coreSend(type, payload={}){ return new Promise(resolve=>chrome.runtime.sendMessage({type,payload},res=>resolve(res||{}))); }
async function doAction(type){
  setOut('Processando...');
  const local=localAnalyze();
  let msgType = type==='flash' ? 'CORE_FLASHCARDS' : type==='plan' ? 'CORE_STUDY_PLAN' : 'CORE_PAGE_ANALYZE';
  const res = await coreSend(msgType, { text: local.selected || local.text, topic: local.question || document.title });
  if(!res.ok){ setOut('Erro: '+(res.error||'falha')); return; }
  setOut(res.text || 'Concluído.');
}
function openPanel(){
  ensureStyle();
  let box=document.getElementById(CORE_ID);
  if(box){ box.remove(); return; }
  const local=localAnalyze();
  box=document.createElement('div'); box.id=CORE_ID;
  box.innerHTML=`<div class="cc-head"><div class="cc-title">CLAW CORE · ESTUDO</div><button class="cc-close">×</button></div><div class="cc-body"><div style="font-size:11px;color:#b0b0bc">${local.question ? 'Pergunta detectada: '+escapeHtml(local.question) : 'Página pronta para estudo. Matéria: '+escapeHtml(local.subject||'Geral')+''}</div><div class="cc-actions"><button class="cc-btn" data-a="analyze">Analisar</button><button class="cc-btn" data-a="flash">Flashcards</button><button class="cc-btn" data-a="plan">Plano</button><button class="cc-btn" data-a="copy">Copiar texto</button></div><div class="cc-out">${local.math ? 'Cálculo local: '+local.math.expression+' = '+local.math.value : 'Selecione um trecho ou clique em uma ação.'}</div></div>`;
  document.body.appendChild(box);
  box.querySelector('.cc-close').onclick=()=>box.remove();
  box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const a=b.dataset.a; if(a==='copy'){navigator.clipboard?.writeText(local.selected||local.text); setOut('Texto copiado.');} else doAction(a); });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

document.addEventListener('keydown', e=>{ if(e.altKey&&e.shiftKey&&(e.key==='C'||e.key==='c')) openPanel(); });
chrome.runtime.onMessage.addListener((msg,_,reply)=>{
  if(msg.type==='CLAW_CORE_OPEN'){ openPanel(); reply({ok:true}); return true; }
  if(msg.type==='CLAW_CORE_EXTRACT'){ reply({ok:true, data:localAnalyze()}); return true; }
});
})();
