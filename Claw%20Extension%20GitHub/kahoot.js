/* ================================================================
   CLAW — kahoot.js v45 Multi-Subject Study Assist
   Kahoot Estudo Pro: multi-matérias, matemática avançada, ordem de blocos e confirmação manual.
   Desenvolvido por Emanuel Felipe
================================================================ */
(function(){
'use strict';
const MODEL = 'auto';
const ICON  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAK1ElEQVR4nJ1Xa3RV5Zl+3u/bt3NyTm4kIWRQEeswAlVRRy0zmKRrbJm2SwW6j9q6tKVjKlhALlGrru7soY7VigaxupqpXa6RcTCH0rF1dbnKdCWZgloguLgktTIURe6BJOfk3Pbte+dHEiU0ix99/+y99v7W+z7f816+7wEmMQaIGfSbFQvLD7am9p74wT2F3rX2TwGAHYgL1wKgfQ/fdf/OFUvmAYBzwZqL2aQLu51GSQRuMMsfmZqw5uW9wKi19JYdDy25AS6407YlAHQ5jRoBvHu1/eDMilhHhSm2vb3arm5rAzODxv11OY1al9OoTRZr0o9NY09iFswMxfBNTcaSmniIgHvYBpAGmtp6IrhATKNv5T1fSUF1oigsos8AEIBmtyccf+eLMcAAjVLapAAgG8nNWS8IpSBjxPNVXJOLu7575wyk0qrTtiUR2LFtg4BqIhJK8cdf+smWUwDQRqO+GMDu1fZ3dqy844ELg08A4DiOIIAJ4HR/P3GnLRe0b+nLetHz5ZYuA8VBhaXHKhJqGQE8s6pKAMAXpiNBhKQgAUX4CIDiTlu2ddpEAB9ovfO1mVXxn82uqXh579rUcgDgsRROAOC6rnrRbkw4tm2k0umou+8MseOIo8Pe+nMF/3hMk3quFKiYRkvfWvbVquunTYsAQJaiSgLKiAClqA8AcLJeo1Q62rcu9fK0hHnP2VyxEEZRoBO+AgCwz2OAHUcAQO86+wtf/ty0P95zhfZB7+rUXc1uT9h78qS84+e/GskF0WOWrgk/UuGUmFXTECtbSa6rACAeowpBZAWRQqD4fcdxBK3a5PWu/foTDUnrgcGCFxBBBwm9GKnNANDdd+bTAhW9J09KANCIbqsvs6aD1eX1CeO/DrSmNtzQ0REBwFt7B14fKHjvJizdGPH8qEwXK3auXVTHAOmE+riuUdYLlM/hB67rqndXLVk8NW6uzxT9UCmmypipn8gVOm98fusb7DhivCgBQFw/bVrEABUVbz2d90qmJpHzfG9qmbXmT4/evX3r0sWXuT09YUHh0VAxwkipqpg+JUbaOgJYh7gkrmuIFA94Q4P9v1tlz6orM14NwkiFkULC0rVzRa9v/6nMUmYAbe6EWhTkugoM3Lwh3Xs6H91SitS+qrhpDhVKXkIXX7xmqvnee6tSd9y0ofN/h71ga1Xc1LOlICrX5QOdy+2EIK4sMzSA6MBLhbqgwRLbLCmSXqiUoQnhhVH+eIFT927enk+nbEE0sRM/zQU7jiDXVc7Xvha358SfrTT0ZV4YgRls6pKyXvSvh4ejV+bWaHuV4sqqmCk/Gi48KiVbV0+tatt3KvNvBIpfWmE9NJArhoIICUvXPs54997cnn6ty2nUmt2e0HEcMae/n2pnn6FuNCk6H02nbctUOh0BwK419m1VpmxPGtrlI6UgqIqb+qlc8deBYlkbM7+imDnjh/tCxYf/JmktGch7xwwppjMzK4aqihnyVL70yjXPpv/liHOftbu/EIz7nsCA4ziiDUAbgDbX5TbHoSZ0i2a3J+z8zpeq50ypfippyJYwiiCIECiGYoYAEDEiZg40QZYmBYJIgZlV3NBEzo/+fNUzb1wJQI0Ha2lp0e9Lnm2wmD6nCe2SwQDddCGicdvT0qL/fUdHwAD+sNpeNMXUNlZY+iXDRe/TJBIAIoJiBjMYBAiQMnVBxwr+XUzGrjIZXa8B8wh8rSS6EuDpltTKahMWjgzlj1PXikXTkzolBr0wOxyY+b4hFN102p8MVF/rXRviOj0QRsrisSHGo9Pz040QAWHEoQIOCaIZSUOLxXQNmhitviBSGCr50IiODPvqVTrQmhqpjRuJoWLABOQZPMJAhpmHAWQURJaYz7EQR3Je8H8xXd5dbWlfL/qhIqK/OE0ZgCUFKmMmFDNyfoh8EGYAPhQxDrLC3oKi3l2fqP3fS6dzmq/4+yNedB8BFQwkCZQkoE7XpDSkgC4FpCDoUkBQDAO5Iop+hMmCA2BBhGKkPhnJFt9TRDuLjHdeyVTs6+joCP5i8ehx/llBblyx0LgSU0zANw0NhsmR6UWhlRSmQVoYFnyhV5qydYqp3VkMIwYgL3QqiOArNagUeiOlDhu6zAoiUynWA8V5MJ+Lmdq5U7nw/QUvpHup07al3ZlWFw6IC+33K+1La+LycZPwTVOTZSNewAQC0Xn5B5iIgnyofmtJunpK3Lo0YWogAH6o4EUR/Gi0KYpB5GdKUdsEBsYRdDuNsqmtJyICv7Xcrr88Sa2mEN9tSMbLjmfzKuurN8sNeaspRcILIyhmBSIiZrY0DXnFb246fOLe+2fW10jF/yCBm4WgmwTwdzFNJqUgxDQNJ3Ol6MI2pC6nUTa7PaFtzzZ+MOPzyyyN1lWY+nRJhOFSsOdo1m+tK9MeqYubC0/lS/slMCtpamYpiKBGWcC0ZBzHR4rv7R+KFqY60plx5zvXfuOyuAjnWZJuiUJlZpS2adI58M5qu7HWlO1xXV6rC4ERP/RKzO1zfrTl+++vtX8yt6582Z/OjvRmPXp5ZpX+7wMF7w86ietMKXQvinKBwokrqhOzPskUPvzzSLD4n1/6RR87jRqddwqel7Yx+h3Qqx81GvNq6x8vN8QjlhQ6iDAShO+eK/qt89u37dy1xn5wZkXsxZwXhkdHgmuqLXx5dl3lc+8cG749qdPtDQlzaTGIvKO50vpyXZszqyZ599HhwomPc8VF//Tif+866NjGnDmIxu8DTWhSAgC6nEZJLtS1NXXPzKlNPhGTUi+EUf5sKXzsG7891Di/fdvO36+0/7HG0jYwgNOlUtstm9L9zDS/4IeIG8gMFvjxTCn0GWxOK7PWHhoOHv7wbO75+qTVMDMZ297zvUVfnOum/e6+M9Ts9oTNbk9IrjsKoGlOHQMACxweyHsfDPvhthP5YP7Vz2x5as+ePWHXcru+xhKbq2OGeTxb/M1Nz2178qctLbogzBrxAhR8+M0vpU9lgmC9ISUsSVWzKvXNn3/2jTUfnss9ETe08hnl1vbuVfZtzW5POH4LA8bGKaVGT6nrfpze2PDH0tyrnt6y5JYXfrH/wxULTSKgOk7/UZ+wLjuZKx37OJBLAeCKsqE6Qbgy6wUqCDDAAP0qMfCjcyVvb6gYU8rMxt1r7DXXP5d+8lAmfxsETl9TU/Zm7+rUEnJdNa4tJl7LGYR0OmLHEXtaWvS/3fS217sm9XRDwrp1sOTzWS/49u0vbDkNAOUcXVVpGVakOBNSMEQAu25PmPXD+0PFUckPo0pDrt+5MjV3Qfu2X+85NXRjxgt2SImbAKB29mgdTAAwNowI/f10Q0dHsGvtksV1caPVjxTOlsIHF7Rv+58jzn0WAOhSzovrGhgY3HFGHwEAdhxtfvsv9w56oWPqUsZ1aSYNPNZp23LJz94+NuOH/7ngl2VXPQp8JlYmtTG9J/paU8cKTy3lPavt1rFi1bhzlLoD61KvZ3/4LT64zt493k4M0Nh/2tdq/45/3MJ9ran3AYA7bTlZz08qzcZ4YD9k9+CZbNmNz29tZ9uWcNMRAbxxxUJTCFwXRIqZ6CwAqPErXV+aAfAneXyzOldaXgxoBwDATquLzvqL2XjVjjGD7Y/YFf0PpwZyT36bD6xLvT7Ozl/j+6IyelzVjosQwqgyvvXpdKYYqY25IDpRDKLXAGCgv27CBplB7Dha53kybDL7fxevV7gPnsheAAAAAElFTkSuQmCC';

let ON=false, STEALTH=false, XDELAY=0, busy=false, lastKey='', tickId=null, ui=null, barT=null, analysisCount=0, lastCopy='';

/* ── atalho stealth Alt+H ── */
document.addEventListener('keydown', e=>{
  if(e.altKey && (e.key==='h'||e.key==='H')){
    const b=document.getElementById('__ck_card__');
    if(b) b.style.display = b.style.display==='none' ? '' : 'none';
  }
});

chrome.runtime.onMessage.addListener(msg=>{
  if(msg.type==='KAHOOT_ON') { ON=true; STEALTH=!!msg.stealth; XDELAY=parseInt(msg.delay)||0; buildUI(); startTick(); }
  if(msg.type==='KAHOOT_OFF'){ ON=false; stopTick(); removeUI(); clearHL(); }
  if(msg.type==='KAHOOT_NOW'){ busy=false; lastKey=''; tick(true); }
  if(msg.type==='KAHOOT_STEALTH'){ STEALTH=!!msg.stealth; const c=document.getElementById('__ck_card__'); if(c) c.style.display=STEALTH?'none':''; }
  if(msg.type==='SET_DELAY'){ XDELAY=parseInt(msg.delay)||0; }
});

function startTick(){ stopTick(); tickId=setInterval(()=>tick(false),650); }
function stopTick() { clearInterval(tickId); tickId=null; }

/* ================================================================
   TICK
================================================================ */
function tick(force=false){
  if(!ON||busy) return;
  const s=snap();
  if(!s.question && s.options.length<2 && !s.inputs.length) return;
  const key=(s.question||'')+'|'+s.options.join('|')+'|'+s.inputs.length;
  if(!force && (!s.question || key===lastKey)) return;
  if(s.options.length<2 && !s.inputs.length) return;
  lastKey=key; busy=true;
  run(s);
}

/* ================================================================
   SNAP — detecção em camadas
================================================================ */
function snap(){
  const QSEL=[
    '[data-functional-selector="question-title"]',
    '[data-functional-selector="block-title"]',
    '[data-functional-selector="question-text"]',
    '[class*="QuestionTitle"]','[class*="questionTitle"]',
    '[class*="question-title"]','[class*="TitleText"]',
    '[class*="title--"]','[class*="Title__"]',
    '[class*="QuestionText"]','[class*="questionText"]',
    '[class*="question__title"]','[class*="GameBlock"]',
    '[role="heading"]','h1','h2','h3',
  ];
  let question='';
  for(const s of QSEL){
    try{
      const els=document.querySelectorAll(s);
      for(const el of els){
        const t=cleanText(el.innerText||el.textContent||'');
        if(t.length>1&&t.length<900&&vis(el)){ question=t; break; }
      }
      if(question) break;
    }catch{}
  }

  /* fallback: procura bloco com cara de pergunta matemática/curta */
  if(!question){
    const texts=[...document.querySelectorAll('div,span,p')]
      .filter(vis)
      .map(e=>({e,t:cleanText(e.innerText||e.textContent||'')}))
      .filter(x=>x.t.length>2&&x.t.length<220&&/[?=]|[+\-×xX÷:^√²³]/.test(x.t));
    texts.sort((a,b)=>scoreQuestion(b.t)-scoreQuestion(a.t));
    if(texts[0]) question=texts[0].t;
  }

  const ASEL=[
    '[data-functional-selector="answer-text"]',
    '[data-functional-selector*="answer"]','[data-functional-selector*="choice"]',
    '[class*="answerText"]','[class*="AnswerText"]',
    '[class*="answer-text"]','[class*="choiceText"]','[class*="ChoiceText"]',
    '[class*="answer__text"]','[class*="AnswerLabel"]','[class*="answerLabel"]',
    '[class*="choice-text"]','[class*="option-text"]','[class*="AnswerMap"]',
  ];
  let ansEls=[], options=[];
  for(const s of ASEL){
    try{
      const found=[...document.querySelectorAll(s)].filter(vis);
      const texts=found.map(e=>cleanText(e.innerText||e.textContent||'')).filter(Boolean);
      if(found.length>=2 && texts.length>=2){ ansEls=found; options=texts; break; }
    }catch{}
  }

  if(ansEls.length<2){
    try{
      const btns=[...document.querySelectorAll('button,[role="button"],li')]
        .filter(b=>vis(b))
        .map(b=>({b,t:cleanText(b.innerText||b.textContent||b.getAttribute('aria-label')||'')}))
        .filter(x=>x.t.length>0&&x.t.length<160);
      const unique=[]; const seen=new Set();
      for(const x of btns){ const k=x.t.toLowerCase(); if(!seen.has(k)){seen.add(k); unique.push(x);} }
      if(unique.length>=2){ ansEls=unique.slice(0,6).map(x=>x.b); options=unique.slice(0,6).map(x=>x.t); }
    }catch{}
  }

  if(ansEls.length<2){
    try{
      const cands=[...document.querySelectorAll('div[class*="block"],div[class*="Block"],li[class*="answer"],li[class*="Answer"],div[class*="Choice"]')]
        .filter(el=>{ if(!vis(el)) return false; const r=el.getBoundingClientRect(); return r.width>80&&r.height>40; })
        .map(e=>({e,t:cleanText(e.innerText||e.textContent||'').split('\n')[0]}))
        .filter(x=>x.t);
      if(cands.length>=2){ ansEls=cands.slice(0,6).map(x=>x.e); options=cands.slice(0,6).map(x=>x.t); }
    }catch{}
  }

  const btns=ansEls.map(e=>{ let x=e; for(let i=0;i<7;i++){ if(!x) break; if(x.tagName==='BUTTON'||x.tagName==='A'||x.getAttribute?.('role')==='button') return x; x=x.parentElement; } return e; });
  const inputs=[...document.querySelectorAll('input[type="text"],input:not([type]),textarea')]
    .filter(e=>!e.disabled&&!e.readOnly&&vis(e)&&e.value.trim()==='');
  return {question, options, els:btns, inputs};
}

function cleanText(t){ return String(t||'').replace(/\s+/g,' ').trim(); }
function scoreQuestion(t){ return (/[?]/.test(t)?10:0)+(/[=]/.test(t)?8:0)+(/[+\-×xX÷:^√²³]/.test(t)?6:0)+Math.max(0,80-t.length)/20; }
function vis(el){
  try{
    const r=el.getBoundingClientRect();
    if(r.width<=0||r.height<=0) return false;
    const cs=getComputedStyle(el);
    return cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity||1)>0;
  }catch{ return false; }
}

/* ================================================================
   RUN — recomenda, explica e espera confirmação manual
================================================================ */
async function run(s){
  setUI('thinking','Analisando...');
  setQ(s.question || 'Pergunta detectada');
  setDetail('');
  setCopy('');

  let q=s.question || '';
  if(window.__clawTranslateOn__?.()&&window.__clawTranslate__){
    try{
      setUI('thinking','Traduzindo...');
      const tr=await window.__clawTranslate__(q);
      if(tr&&tr!==q){ q=tr; setQ((s.question||'')+'\n→ '+q); }
    }catch{}
  }

  if(XDELAY>0){ setUI('thinking','Aguardando...'); await sleep(XDELAY); }
  if(!ON){ busy=false; return; }

  const fresh=snap();
  const opts=fresh.options.length>=2 ? fresh.options : s.options;
  const els =fresh.els.length>=2   ? fresh.els   : s.els;

  if(opts.length>=2){
    setUI('thinking','Resolvendo...');
    startBar();
    try{
      const local=tryLocalMath(q, opts);
      const result=local || await askGroq(q, opts);
      stopBar();
      if(result && result.idx>=0 && result.idx<opts.length){
        hlAnswer(els,result.idx);
        const answer=opts[result.idx];
        lastCopy=answer;
        setCopy(answer);
        setUI('done','Sugestão: '+answer);
        setDetail(result.explanation || 'Revise a explicação e confirme manualmente.');
        analysisCount++;
        updateScore();
        try{
          window.ClawStats?.addKahoot();
          window.ClawStats?.addHistory({type:'kahoot_study',question:s.question,answer,explanation:result.explanation||''});
        }catch{}
        await sleep(11000);
        clearHL(); busy=false; setUI('idle','Monitorando...'); setQ(''); setDetail(''); setCopy('');
        return;
      }
    }catch(e){ stopBar(); console.error('[Claw/Kahoot]',e); }
    setUI('error','Não identificou — tente novamente');
    await sleep(3000);

  }else if((fresh.inputs.length>0)||(s.inputs.length>0)){
    setUI('thinking','Gerando sugestão...');
    startBar();
    try{
      const ans=await askText(q);
      stopBar();
      if(ans?.answer){
        lastCopy=ans.answer;
        setCopy(ans.answer);
        setUI('done','Sugestão pronta');
        setDetail((ans.explanation?ans.explanation+'\n':'')+'Resposta sugerida: '+ans.answer+'\nCopie e confirme manualmente.');
        try{window.ClawStats?.addKahoot();}catch{}
      }else setUI('error','Sem sugestão');
    }catch(e){ stopBar(); setUI('error',String(e.message||e).slice(0,40)); }
    await sleep(10000);
  }

  busy=false; setUI('idle','Monitorando...'); setQ(''); setDetail(''); setCopy('');
}

/* ================================================================
   MATEMÁTICA LOCAL — evita falhas com ², ³, x, :, ÷
================================================================ */
function tryLocalMath(question, options){
  const expr=extractMathExpression(question);
  if(!expr) return null;
  const val=evaluateExpression(expr);
  if(!Number.isFinite(val)) return null;
  let idx=-1, best=Infinity;
  for(let i=0;i<options.length;i++){
    const ov=parseOptionNumber(options[i]);
    if(ov===null) continue;
    const diff=Math.abs(ov-val);
    if(diff<best){ best=diff; idx=i; }
  }
  const tolerance=Math.max(1e-7, Math.abs(val)*1e-7);
  if(idx<0 || best>tolerance) return null;
  const pretty=Number.isInteger(val) ? String(val) : String(Math.round(val*1e8)/1e8);
  return {
    idx,
    answer: options[idx],
    explanation:`Cálculo local: ${expr} = ${pretty}. Ordem usada: parênteses, potências, multiplicação/divisão e depois soma/subtração. Confirme manualmente.`
  };
}

function extractMathExpression(text){
  if(!text) return '';
  const raw=String(text).replace(/\n/g,' ');
  const parts=raw.split(/(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][^+\-×xX÷:^√²³=]{5,})/).concat([raw]);
  let best='';
  for(const p of parts){
    const n=normalizeMath(p);
    const groups=n.match(/[0-9piersqrt()+\-*/^.,%]+/gi)||[];
    for(let g of groups){
      g=g.replace(/=+$/,'');
      const ops=(g.match(/[+\-*/^]/g)||[]).length;
      const nums=(g.match(/\d/g)||[]).length;
      if(nums>=1 && ops>=1 && g.length>best.length) best=g;
    }
  }
  return best;
}

function normalizeMath(s){
  const sup={'⁰':'^0','¹':'^1','²':'^2','³':'^3','⁴':'^4','⁵':'^5','⁶':'^6','⁷':'^7','⁸':'^8','⁹':'^9'};
  return String(s||'')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,ch=>sup[ch]||'')
    .replace(/\^\s*([0-9]+)/g,'^$1')
    .replace(/[×·]/g,'*')
    .replace(/([0-9)])\s*[xX]\s*(?=[0-9(])/g,'$1*')
    .replace(/[÷:]/g,'/')
    .replace(/[−–—]/g,'-')
    .replace(/√/g,'sqrt')
    .replace(/π/gi,'pi')
    .replace(/,/g,'.')
    .replace(/=/g,'')
    .replace(/\s+/g,'')
    .replace(/(\d|\)|pi|e)(?=\()/gi,'$1*')
    .replace(/\)(?=(\d|pi|e|sqrt))/gi,')*');
}

function parseOptionNumber(text){
  const expr=extractMathExpression(text) || normalizeMath(text).match(/-?\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?/)?.[0] || '';
  if(!expr) return null;
  const v=evaluateExpression(expr);
  return Number.isFinite(v) ? v : null;
}

function evaluateExpression(input){
  const s=normalizeMath(input).replace(/%/g,'/100');
  let i=0;
  function peek(){ return s[i]; }
  function eat(ch){ if(s[i]===ch){ i++; return true; } return false; }
  function skip(){ while(/\s/.test(peek())) i++; }
  function number(){
    skip();
    if(s.slice(i,i+2).toLowerCase()==='pi'){ i+=2; return Math.PI; }
    if(s[i]?.toLowerCase()==='e' && !/[a-z]/i.test(s[i+1]||'')){ i++; return Math.E; }
    const m=s.slice(i).match(/^\d+(?:\.\d+)?/);
    if(!m) throw new Error('número esperado');
    i+=m[0].length; return parseFloat(m[0]);
  }
  function primary(){
    skip();
    if(s.slice(i,i+4).toLowerCase()==='sqrt'){
      i+=4; if(eat('(')){ const v=expr(); if(!eat(')')) throw new Error(')'); return Math.sqrt(v); }
      return Math.sqrt(primary());
    }
    if(eat('(')){ const v=expr(); if(!eat(')')) throw new Error(')'); return v; }
    return number();
  }
  function unary(){ skip(); if(eat('+')) return unary(); if(eat('-')) return -unary(); return primary(); }
  function power(){ let v=unary(); skip(); if(eat('^')) v=Math.pow(v,power()); return v; }
  function term(){ let v=power(); for(;;){ skip(); if(eat('*')) v*=power(); else if(eat('/')) v/=power(); else break; } return v; }
  function expr(){ let v=term(); for(;;){ skip(); if(eat('+')) v+=term(); else if(eat('-')) v-=term(); else break; } return v; }
  try{ const v=expr(); skip(); if(i<s.length) return NaN; return v; }catch{ return NaN; }
}

/* ================================================================
   GROQ
================================================================ */
const SYS=`Você é um tutor escolar brasileiro. Resolva quizzes com cuidado, mas responda em modo estudo: sugira a alternativa e explique de forma curta.
Responda SOMENTE JSON válido no formato:
{"answer_index":1,"explanation":"explicação curta"}
answer_index é baseado em 1. Não use markdown.`;

async function askGroq(question,options){
  const cacheKey = (question + options.join('|')).toLowerCase().trim();
  const cached = await new Promise(r => {
    chrome.storage.local.get(['claw_kahoot_cache_v43'], d => {
      const c = d.claw_kahoot_cache_v43 || {};
      r(c[cacheKey] || null);
    });
  });
  if(cached && Number.isInteger(cached.idx)){ setUI('done','⚡ Cache: ' + options[cached.idx]); return cached; }

  const list=options.map((o,i)=>`${i+1}. ${o}`).join('\n');
  const txt = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH',
      payload:{model:MODEL,claw_purpose:'reason',messages:[
        {role:'system',content:SYS},
        {role:'user',content:`QUESTÃO: ${question}\n\nALTERNATIVAS:\n${list}\n\nEscolha a melhor alternativa e explique em 1 frase.`}
      ],max_tokens:400,temperature:0.15}
    }, res => {
      if(chrome.runtime.lastError){ reject(new Error(chrome.runtime.lastError.message)); return; }
      if(!res?.ok){ reject(new Error(res?.error||'Erro da API')); return; }
      resolve((res.data?.choices?.[0]?.message?.content||'').trim());
    });
  });
  const clean = txt.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  let obj=null;
  try{ obj=JSON.parse((clean.match(/\{[\s\S]*\}/)||['{}'])[0]); }catch{}
  let idx=Number(obj?.answer_index)-1;
  if(!Number.isInteger(idx)||idx<0||idx>=options.length){
    const m = clean.match(/\b([1-9])\b/) || txt.match(/\b([1-9])\b/);
    if(m) idx=parseInt(m[1])-1;
  }
  if(Number.isInteger(idx)&&idx>=0&&idx<options.length){
    const result={idx, answer:options[idx], explanation:String(obj?.explanation||'Sugestão gerada pela IA. Revise e confirme manualmente.').slice(0,500)};
    chrome.storage.local.get(['claw_kahoot_cache_v43'], d => {
      const c = d.claw_kahoot_cache_v43 || {};
      const keys = Object.keys(c);
      if(keys.length > 300) delete c[keys[0]];
      c[cacheKey] = result;
      chrome.storage.local.set({ claw_kahoot_cache_v43: c });
    });
    return result;
  }
  return null;
}

async function askText(question){
  const txt=await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH',
      payload:{model:MODEL,claw_purpose:'reason',messages:[
        {role:'system',content:'Você é um tutor escolar. Responda em JSON: {"answer":"resposta curta","explanation":"por quê"}. Não use markdown.'},
        {role:'user',content:question}
      ],max_tokens:350,temperature:0.2}
    }, res => {
      if(chrome.runtime.lastError){ reject(new Error(chrome.runtime.lastError.message)); return; }
      if(!res?.ok){ reject(new Error(res?.error||'Erro da API')); return; }
      resolve((res.data?.choices?.[0]?.message?.content||'').trim());
    });
  });
  try{
    const obj=JSON.parse((txt.match(/\{[\s\S]*\}/)||['{}'])[0]);
    return {answer:String(obj.answer||'').trim().slice(0,120), explanation:String(obj.explanation||'').trim().slice(0,500)};
  }catch{ return {answer:txt.replace(/<think>[\s\S]*?<\/think>/gi,'').trim().slice(0,120), explanation:''}; }
}

/* ================================================================
   HIGHLIGHT — recomendação visual, sem clique automático
================================================================ */
function hlAnswer(els,idx){
  clearHL();
  els.forEach((el,i)=>{
    if(i===idx){
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('filter','brightness(1.12)','important');
      el.style.setProperty('transform','scale(1.035)','important');
      el.style.setProperty('transition','all .25s ease','important');
      el.style.setProperty('outline','3px solid rgba(255,255,255,.95)','important');
      el.style.setProperty('outline-offset','3px','important');
      el.style.setProperty('box-shadow','0 0 0 8px rgba(255,255,255,.1)','important');
      el.setAttribute('data-claw-k','suggested');
    }else{
      el.style.setProperty('opacity','0.35','important');
      el.style.setProperty('filter','grayscale(.7) brightness(.7)','important');
      el.style.setProperty('transition','all .25s ease','important');
      el.setAttribute('data-claw-k','other');
    }
  });
}

function clearHL(){
  document.querySelectorAll('[data-claw-k]').forEach(el=>{
    ['opacity','filter','transform','transition','outline','outline-offset','box-shadow']
      .forEach(p=>el.style.removeProperty(p));
    el.removeAttribute('data-claw-k');
  });
}

function copyText(text){
  if(!text) return;
  try{ navigator.clipboard?.writeText(text); }catch{}
  try{
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }catch{}
  setUI('done','Copiado — confirme manualmente');
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ================================================================
   BARRA DE PROGRESSO
================================================================ */
function startBar(){
  const b=document.getElementById('__ck_pb__'); if(!b) return;
  clearInterval(barT); let w=5; b.style.width='5%';
  barT=setInterval(()=>{ w=Math.min(w+2,90); b.style.width=w+'%'; },100);
}
function stopBar(){
  clearInterval(barT);
  const b=document.getElementById('__ck_pb__');
  if(b){ b.style.width='100%'; setTimeout(()=>{ if(b) b.style.width='0%'; },700); }
}

function updateScore(){
  const el=document.getElementById('__ck_score__');
  if(el) el.textContent=`${analysisCount} análise${analysisCount!==1?'s':''}`;
}

/* ================================================================
   OVERLAY UI
================================================================ */
function buildUI(){
  document.getElementById('__claw_k__')?.remove();
  ui=document.createElement('div');
  ui.id='__claw_k__';
  ui.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
#__claw_k__{position:fixed!important;top:14px!important;right:14px!important;z-index:2147483647!important;width:278px;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;pointer-events:auto;}
@keyframes _ckIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}
@keyframes _ckP{0%,100%{opacity:1}50%{opacity:.35}}
#__ck_card__{background:#1c1c1e;border:1px solid #3a3a3e;border-radius:14px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.05);animation:_ckIn .2s ease both;}
#__ck_hd__{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #3a3a3e;background:#222224;}
#__ck_ico__{width:20px;height:20px;object-fit:contain;flex-shrink:0;border-radius:4px;}
#__ck_ttl__{font-size:12px;font-weight:600;color:#f0efed;flex:1;}
#__ck_mode__{font-size:9px;color:#d4a85a;background:#2a2a2d;border:1px solid #3a3a3e;border-radius:4px;padding:2px 6px;}
#__ck_score__{font-size:9px;color:#6b6b6b;background:#2a2a2d;border:1px solid #3a3a3e;border-radius:4px;padding:2px 6px;}
#__ck_dot__{width:7px;height:7px;border-radius:50%;background:#48484d;flex-shrink:0;transition:background .25s,box-shadow .25s;}
#__ck_dot__.t{background:#d4a85a;box-shadow:0 0 0 3px rgba(212,168,90,.2);animation:_ckP .9s ease-in-out infinite;}
#__ck_dot__.d{background:#5a9e6f;box-shadow:0 0 0 3px rgba(90,158,111,.2);}
#__ck_dot__.e{background:#c46060;}
#__ck_x__{background:none;border:none;color:#48484d;cursor:pointer;width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s;flex-shrink:0;}
#__ck_x__:hover{color:#f0efed;background:#323235;}
#__ck_x__ svg{width:10px;height:10px;}
#__ck_bd__{padding:10px 12px 12px;display:flex;flex-direction:column;gap:7px;}
#__ck_st__{font-size:11.5px;font-weight:500;color:#a8a8a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .2s;}
#__ck_st__.t{color:#d4a85a;}#__ck_st__.d{color:#5a9e6f;}#__ck_st__.e{color:#c46060;}
#__ck_q__{font-size:10px;color:#6b6b6b;line-height:1.45;max-height:38px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:pre-wrap;}
#__ck_detail__{font-size:10.5px;color:#a8a8a8;line-height:1.45;max-height:76px;overflow:auto;white-space:pre-wrap;border-left:2px solid rgba(212,168,90,.35);padding-left:8px;display:none;}
#__ck_pw__{height:2px;background:#2a2a2d;border-radius:2px;overflow:hidden;}
#__ck_pb__{height:100%;width:0%;background:linear-gradient(90deg,#d4a85a,#c49444);border-radius:2px;transition:width .1s linear;}
.__ck_btn{background:#2a2a2d;border:1px solid #3a3a3e;border-radius:8px;color:#a8a8a8;font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;padding:7px 10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;width:100%;transition:background .15s,border-color .15s,color .15s;}
.__ck_btn:hover{background:#323235;border-color:#48484d;color:#f0efed;}
#__ck_copy__{display:none;}
.__ck_btn svg{width:12px;height:12px;}
</style>
<div id="__ck_card__">
  <div id="__ck_hd__">
    <img id="__ck_ico__" src="${ICON}" alt=""/>
    <span id="__ck_ttl__">Claw</span>
    <span id="__ck_mode__">Estudo</span>
    <span id="__ck_score__">0 análises</span>
    <div id="__ck_dot__"></div>
    <button id="__ck_x__"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg></button>
  </div>
  <div id="__ck_bd__">
    <div id="__ck_st__">Monitorando perguntas...</div>
    <div id="__ck_q__"></div>
    <div id="__ck_detail__"></div>
    <div id="__ck_pw__"><div id="__ck_pb__"></div></div>
    <button id="__ck_copy__" class="__ck_btn">Copiar sugestão</button>
    <button id="__ck_btn__" class="__ck_btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Analisar agora</button>
  </div>
</div>`;
  document.body.appendChild(ui);
  document.getElementById('__ck_x__').onclick  =()=>{ ui?.remove(); ui=null; clearHL(); ON=false; };
  document.getElementById('__ck_btn__').onclick=()=>{ busy=false; lastKey=''; tick(true); };
  document.getElementById('__ck_copy__').onclick=()=>copyText(lastCopy);
  if(STEALTH) document.getElementById('__ck_card__').style.display='none';
}

function removeUI(){ ui?.remove(); ui=null; }
function setUI(state,msg){
  const cls={thinking:'t',done:'d',error:'e',idle:''}[state]||'';
  const st=document.getElementById('__ck_st__');
  const dot=document.getElementById('__ck_dot__');
  if(st){ st.textContent=msg; st.className=cls; }
  if(dot) dot.className=cls;
}
function setQ(q){ const el=document.getElementById('__ck_q__'); if(el) el.textContent=q||''; }
function setDetail(t){ const el=document.getElementById('__ck_detail__'); if(el){ el.textContent=t||''; el.style.display=t?'block':'none'; } }
function setCopy(t){ const b=document.getElementById('__ck_copy__'); if(b) b.style.display=t?'flex':'none'; lastCopy=t||''; }


/* ================================================================
   V45 OVERRIDES — Multi-matérias + matemática avançada + blocos
   Mantém o modo estudo: recomenda/explica, sem clique automático.
================================================================ */
const SUBJECT_LABELS = {
  matematica:'Matemática', fisica:'Física', quimica:'Química', biologia:'Biologia',
  historia:'História', geografia:'Geografia', portugues:'Português', ingles:'Inglês',
  ciencias:'Ciências', geral:'Geral'
};
function normalizeAsciiV45(t){
  return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function detectSubjectV45(question, options=[]){
  const t = normalizeAsciiV45([question, ...options].join(' '));
  if(/matem|calcule|calculo|equacao|fracao|porcent|raiz|potencia|geometr|algebra|funcao|mmc|mdc|expressao|\d\s*[+\-×x÷:^]/.test(t)) return 'matematica';
  if(/fisica|velocidade|forca|energia|movimento|newton|massa|aceleracao|densidade|eletric|corrente|tensao/.test(t)) return 'fisica';
  if(/quimica|atomo|molecula|tabela periodica|ph\b|reacao|substancia|elemento quimico|ligacao quimica/.test(t)) return 'quimica';
  if(/biologia|celula|fotossintese|ecossistema|genetica|dna|evolucao|organismo|organelas|reino animal/.test(t)) return 'biologia';
  if(/historia|revolucao|imperio|guerra|seculo|colonizacao|idade media|república|republica/.test(t)) return 'historia';
  if(/geografia|territorio|estado|nacao|clima|relevo|populacao|mapa|pais|continente|capital/.test(t)) return 'geografia';
  if(/portugues|gramatica|verbo|sujeito|predicado|figura de linguagem|interprete|texto|oração|oracao|substantivo/.test(t)) return 'portugues';
  if(/english|ingles|translate|traducao|verb|simple past|present|future|adjective|pronoun/.test(t)) return 'ingles';
  if(/ciencias|sistema solar|planeta|corpo humano|solo|agua|energia/.test(t)) return 'ciencias';
  return 'geral';
}
function setModeV45(text){ const el=document.getElementById('__ck_mode__'); if(el) el.textContent=String(text||'Estudo').slice(0,14); }
function fmtConfidenceV45(c){ const n=Number(c); return Number.isFinite(n) ? Math.round(Math.max(0,Math.min(1,n))*100)+'%' : '—'; }
function buildDetailV45(result, opts){
  const lines=[];
  if(result.subject) lines.push(`Matéria: ${SUBJECT_LABELS[result.subject]||result.subject}`);
  if(result.confidence!=null) lines.push(`Confiança: ${fmtConfidenceV45(result.confidence)}`);
  if(Array.isArray(result.order) && result.order.length){
    lines.push('Ordem sugerida:');
    result.order.forEach((idx,i)=>{ if(opts[idx]) lines.push(`${i+1}. ${opts[idx]}`); });
  }
  if(result.explanation) lines.push(result.explanation);
  lines.push('Revise e confirme manualmente.');
  return lines.filter(Boolean).join('\n');
}
function isOrderQuestionV45(q){ return /organize|ordem|ordene|sequ[êe]ncia|sequencia|arraste|blocos|coloque em ordem|cronol[oó]gica|do menor para o maior|do maior para o menor/i.test(q||''); }

async function run(s){
  setUI('thinking','Analisando...');
  setQ(s.question || 'Pergunta detectada');
  setDetail('');
  setCopy('');

  let q=s.question || '';
  let subject=detectSubjectV45(q, s.options||[]);
  setModeV45(SUBJECT_LABELS[subject] || 'Estudo');

  if(window.__clawTranslateOn__?.()&&window.__clawTranslate__){
    try{
      setUI('thinking','Traduzindo...');
      const tr=await window.__clawTranslate__(q);
      if(tr&&tr!==q){ q=tr; setQ((s.question||'')+'\n→ '+q); subject=detectSubjectV45(q, s.options||[]); setModeV45(SUBJECT_LABELS[subject] || 'Estudo'); }
    }catch{}
  }

  if(XDELAY>0){ setUI('thinking','Aguardando...'); await sleep(XDELAY); }
  if(!ON){ busy=false; return; }

  const fresh=snap();
  const opts=fresh.options.length>=2 ? fresh.options : s.options;
  const els =fresh.els.length>=2   ? fresh.els   : s.els;
  subject=detectSubjectV45(q, opts||[]);
  setModeV45(SUBJECT_LABELS[subject] || 'Estudo');

  if(opts.length>=2){
    setUI('thinking', subject==='matematica' ? 'Resolvendo matemática...' : 'Raciocinando...');
    startBar();
    try{
      const local=tryLocalMath(q, opts);
      const result=local || await askGroq(q, opts, subject);
      stopBar();
      if(result && ((result.idx>=0 && result.idx<opts.length) || (Array.isArray(result.order)&&result.order.length))){
        const idx = (result.idx>=0 && result.idx<opts.length) ? result.idx : result.order[0];
        hlAnswer(els, idx);
        const answer=opts[idx] || '';
        const copy = Array.isArray(result.order)&&result.order.length ? result.order.map((i,n)=>`${n+1}. ${opts[i]||''}`).join('\n') : answer;
        lastCopy=copy; setCopy(copy);
        setUI('done', Array.isArray(result.order)&&result.order.length ? 'Ordem sugerida' : 'Sugestão: '+answer);
        setDetail(buildDetailV45({...result, subject: result.subject||subject}, opts));
        analysisCount++; updateScore();
        try{
          window.ClawStats?.addKahoot();
          window.ClawStats?.addHistory({type:'kahoot_study_v45',subject:result.subject||subject,question:s.question,answer:copy,explanation:result.explanation||''});
        }catch{}
        await sleep(13000);
        clearHL(); busy=false; setUI('idle','Monitorando...'); setQ(''); setDetail(''); setCopy(''); setModeV45('Estudo');
        return;
      }
    }catch(e){ stopBar(); console.error('[Claw/Kahoot v45]',e); }
    setUI('error','Não identificou — tente novamente');
    await sleep(3000);

  }else if((fresh.inputs.length>0)||(s.inputs.length>0)){
    setUI('thinking','Gerando sugestão...'); startBar();
    try{
      const ans=await askText(q, subject); stopBar();
      if(ans?.answer){
        lastCopy=ans.answer; setCopy(ans.answer);
        setUI('done','Sugestão pronta');
        setDetail((ans.subject?`Matéria: ${SUBJECT_LABELS[ans.subject]||ans.subject}\n`: '')+(ans.explanation?ans.explanation+'\n':'')+'Resposta sugerida: '+ans.answer+'\nCopie e confirme manualmente.');
        try{window.ClawStats?.addKahoot();}catch{}
      }else setUI('error','Sem sugestão');
    }catch(e){ stopBar(); setUI('error',String(e.message||e).slice(0,40)); }
    await sleep(10000);
  }

  busy=false; setUI('idle','Monitorando...'); setQ(''); setDetail(''); setCopy(''); setModeV45('Estudo');
}

function matchValueToOptionV45(val, options, explanation){
  if(!Number.isFinite(val)) return null;
  let idx=-1, best=Infinity;
  for(let i=0;i<options.length;i++){
    const ov=parseOptionNumberV45(options[i]);
    if(ov===null) continue;
    const diff=Math.abs(ov-val);
    if(diff<best){ best=diff; idx=i; }
  }
  const tolerance=Math.max(1e-6, Math.abs(val)*1e-6);
  if(idx<0 || best>tolerance) return null;
  const pretty=Number.isInteger(val) ? String(val) : String(Math.round(val*1e8)/1e8);
  return {idx, answer:options[idx], subject:'matematica', confidence:1, explanation: explanation || `Cálculo local: resultado = ${pretty}.`};
}
function parseOptionNumberV45(text){
  const raw=String(text||'').trim().replace(/,/g,'.');
  const frac=raw.match(/^-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?$/);
  if(frac) { const v=evaluateExpression(raw); return Number.isFinite(v)?v:null; }
  const pct=raw.match(/^-?\d+(?:\.\d+)?\s*%$/); if(pct) return parseFloat(pct[0])/100;
  const exact=raw.match(/^-?\d+(?:\.\d+)?$/); if(exact) return parseFloat(exact[0]);
  const expr=extractMathExpressionV45(raw) || extractMathExpression(raw) || '';
  if(expr){ const v=evaluateExpression(expr); if(Number.isFinite(v)) return v; }
  const num=raw.match(/-?\d+(?:\.\d+)?/); return num ? parseFloat(num[0]) : null;
}
function calcPhraseV45(q){
  const t=normalizeAsciiV45(q).replace(/,/g,'.');
  let m=t.match(/(-?\d+(?:\.\d+)?)\s*%\s*d[eoa]\s*(-?\d+(?:\.\d+)?)/);
  if(m) return {value:parseFloat(m[1])*parseFloat(m[2])/100, explanation:`Porcentagem: ${m[1]}% de ${m[2]} = ${parseFloat(m[1])*parseFloat(m[2])/100}.`};
  m=t.match(/raiz(?: quadrada)?\s+d[eoa]\s*(-?\d+(?:\.\d+)?)/);
  if(m) return {value:Math.sqrt(parseFloat(m[1])), explanation:`Raiz quadrada de ${m[1]} = ${Math.sqrt(parseFloat(m[1]))}.`};
  m=t.match(/dobro\s+d[eoa]\s*(-?\d+(?:\.\d+)?)/);
  if(m) return {value:2*parseFloat(m[1]), explanation:`Dobro de ${m[1]} = ${2*parseFloat(m[1])}.`};
  m=t.match(/triplo\s+d[eoa]\s*(-?\d+(?:\.\d+)?)/);
  if(m) return {value:3*parseFloat(m[1]), explanation:`Triplo de ${m[1]} = ${3*parseFloat(m[1])}.`};
  m=t.match(/metade\s+d[eoa]\s*(-?\d+(?:\.\d+)?)/);
  if(m) return {value:parseFloat(m[1])/2, explanation:`Metade de ${m[1]} = ${parseFloat(m[1])/2}.`};
  return null;
}
function extractMathExpressionV45(text){
  if(!text) return '';
  const raw=String(text).replace(/\n/g,' ');
  const normalized=normalizeMath(raw);
  const groups=normalized.match(/[0-9piersqrt()+\-*/^.,%]+/gi)||[];
  let best=''; let bestScore=-1;
  for(let g of groups){
    g=g.replace(/=+$/,'');
    const ops=(g.match(/[+\-*/^]/g)||[]).length;
    const nums=(g.match(/\d/g)||[]).length;
    const score=ops*10+nums+g.length/20;
    if(nums>=1 && ops>=1 && score>bestScore){best=g; bestScore=score;}
  }
  return best;
}
function tryEquationOptionsV45(question, options){
  const raw=String(question||'')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,ch=>({'⁰':'^0','¹':'^1','²':'^2','³':'^3','⁴':'^4','⁵':'^5','⁶':'^6','⁷':'^7','⁸':'^8','⁹':'^9'}[ch]||''))
    .replace(/[×·]/g,'*').replace(/[÷:]/g,'/').replace(/[−–—]/g,'-').replace(/,/g,'.');
  const m=raw.match(/([0-9xX+\-*/^().\s]+)=([0-9xX+\-*/^().\s]+)/);
  if(!m || !/[xX]/.test(m[0])) return null;
  for(let i=0;i<options.length;i++){
    const val=parseOptionNumberV45(options[i]); if(val===null) continue;
    const left=m[1].replace(/[xX]/g,`(${val})`);
    const right=m[2].replace(/[xX]/g,`(${val})`);
    const lv=evaluateExpression(left), rv=evaluateExpression(right);
    if(Number.isFinite(lv)&&Number.isFinite(rv)&&Math.abs(lv-rv)<=Math.max(1e-6,Math.abs(rv)*1e-6)){
      return {idx:i, answer:options[i], subject:'matematica', confidence:1, explanation:`Equação local: substituindo x por ${val}, os dois lados ficam iguais.`};
    }
  }
  return null;
}
function tryLocalMath(question, options){
  const eq=tryEquationOptionsV45(question, options); if(eq) return eq;
  const phr=calcPhraseV45(question); if(phr){ const r=matchValueToOptionV45(phr.value, options, phr.explanation); if(r) return r; }
  const expr=extractMathExpressionV45(question) || extractMathExpression(question);
  if(!expr) return null;
  const val=evaluateExpression(expr);
  const r=matchValueToOptionV45(val, options, `Cálculo local: ${expr} = ${Number.isInteger(val)?val:Math.round(val*1e8)/1e8}. Ordem usada: parênteses, potências, multiplicação/divisão e depois soma/subtração.`);
  return r;
}

const SYS_V45=`Você é o Claw Estudo, um tutor escolar brasileiro extremamente bom em matemática, física, química, biologia, história, geografia, português, inglês e ciências.
Modo obrigatório: estudo e revisão. Ajude a escolher uma alternativa, explique curto e deixe o aluno confirmar manualmente.
Para matemática, priorize cálculo exato e ordem de operações. Para outras matérias, use raciocínio escolar confiável.
Para perguntas de ordenar blocos/sequência, retorne ordered_indices com a ordem correta.
Responda SOMENTE JSON válido, sem markdown, no formato:
{"answer_index":1,"ordered_indices":[],"subject":"matematica","confidence":0.92,"explanation":"explicação curta"}
answer_index é baseado em 1. ordered_indices também usa índices baseados em 1. Se não for ordenação, ordered_indices deve ser [].`;

function matchOptionByTextV45(text, options){
  const low=normalizeAsciiV45(text);
  for(let i=0;i<options.length;i++){
    const opt=normalizeAsciiV45(options[i]);
    if(opt && (low.includes(opt) || opt.includes(low))) return i;
  }
  return -1;
}
async function askGroq(question,options,subject='geral'){
  const cacheKey = (subject+'|'+question + options.join('|')).toLowerCase().trim();
  const cached = await new Promise(r => {
    chrome.storage.local.get(['claw_kahoot_cache_v45','claw_kahoot_cache_v43'], d => {
      const c = d.claw_kahoot_cache_v45 || d.claw_kahoot_cache_v43 || {};
      r(c[cacheKey] || null);
    });
  });
  if(cached && (Number.isInteger(cached.idx)||Array.isArray(cached.order))){ setUI('done','⚡ Cache'); return cached; }

  const list=options.map((o,i)=>`${i+1}. ${o}`).join('\n');
  const purpose = subject==='matematica' ? 'math' : 'reason';
  const userPrompt = `MATÉRIA PROVÁVEL: ${SUBJECT_LABELS[subject]||subject}\nTIPO: ${isOrderQuestionV45(question)?'ordenar blocos/sequência':'alternativa'}\n\nQUESTÃO:\n${question}\n\nALTERNATIVAS/BLOCOS:\n${list}\n\nTarefa: escolha a melhor alternativa ou a ordem correta. Retorne JSON válido.`;
  const txt = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH',
      payload:{model:MODEL,claw_purpose:purpose,messages:[
        {role:'system',content:SYS_V45},
        {role:'user',content:userPrompt}
      ],max_tokens:520,temperature:0.08}
    }, res => {
      if(chrome.runtime.lastError){ reject(new Error(chrome.runtime.lastError.message)); return; }
      if(!res?.ok){ reject(new Error(res?.error||'Erro da API')); return; }
      resolve((res.data?.choices?.[0]?.message?.content||'').trim());
    });
  });
  const clean = txt.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  let obj=null;
  try{ obj=JSON.parse((clean.match(/\{[\s\S]*\}/)||['{}'])[0]); }catch{}
  let order=[];
  if(Array.isArray(obj?.ordered_indices)){
    order=obj.ordered_indices.map(n=>parseInt(n,10)-1).filter(n=>Number.isInteger(n)&&n>=0&&n<options.length);
    order=[...new Set(order)];
  }
  let idx=Number(obj?.answer_index)-1;
  if((!Number.isInteger(idx)||idx<0||idx>=options.length) && order.length) idx=order[0];
  if(!Number.isInteger(idx)||idx<0||idx>=options.length){
    const m = clean.match(/\b([1-9])\b/) || txt.match(/\b([1-9])\b/);
    if(m) idx=parseInt(m[1],10)-1;
  }
  if(!Number.isInteger(idx)||idx<0||idx>=options.length){
    idx=matchOptionByTextV45(clean, options);
  }
  const outSubject = normalizeAsciiV45(obj?.subject || subject).replace(/[^a-z]/g,'') || subject;
  if((Number.isInteger(idx)&&idx>=0&&idx<options.length) || order.length){
    const result={idx, order, answer:options[idx]||'', subject:SUBJECT_LABELS[outSubject]?outSubject:subject, confidence:Number(obj?.confidence ?? 0.7), explanation:String(obj?.explanation||'Sugestão gerada pela IA.').slice(0,700)};
    chrome.storage.local.get(['claw_kahoot_cache_v45'], d => {
      const c = d.claw_kahoot_cache_v45 || {};
      const keys = Object.keys(c);
      if(keys.length > 500) delete c[keys[0]];
      c[cacheKey] = result;
      chrome.storage.local.set({ claw_kahoot_cache_v45: c });
    });
    return result;
  }
  return null;
}

async function askText(question,subject='geral'){
  const txt=await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH',
      payload:{model:MODEL,claw_purpose:subject==='matematica'?'math':'reason',messages:[
        {role:'system',content:'Você é um tutor escolar brasileiro. Responda em JSON: {"answer":"resposta curta","subject":"matematica","confidence":0.9,"explanation":"por quê"}. Não use markdown.'},
        {role:'user',content:`Matéria provável: ${SUBJECT_LABELS[subject]||subject}\nPergunta: ${question}`}
      ],max_tokens:420,temperature:0.12}
    }, res => {
      if(chrome.runtime.lastError){ reject(new Error(chrome.runtime.lastError.message)); return; }
      if(!res?.ok){ reject(new Error(res?.error||'Erro da API')); return; }
      resolve((res.data?.choices?.[0]?.message?.content||'').trim());
    });
  });
  try{
    const obj=JSON.parse((txt.match(/\{[\s\S]*\}/)||['{}'])[0]);
    return {answer:String(obj.answer||'').trim().slice(0,160), subject:normalizeAsciiV45(obj.subject||subject).replace(/[^a-z]/g,'')||subject, confidence:Number(obj.confidence??0.7), explanation:String(obj.explanation||'').trim().slice(0,700)};
  }catch{ return {answer:txt.replace(/<think>[\s\S]*?<\/think>/gi,'').trim().slice(0,160), subject, explanation:''}; }
}

})();
