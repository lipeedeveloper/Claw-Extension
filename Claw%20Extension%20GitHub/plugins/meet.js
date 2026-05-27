/* CLAW Plugin — Google Meet v30 | UI premium */
(function(){
'use strict';
if(window.__clawMeet__) return;
window.__clawMeet__ = true;
if(!location.hostname.includes('meet.google.com')) return;
const MODEL = 'llama-3.3-70b-versatile';

const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500&display=swap');
#__claw_meet_panel__{
  position:fixed;top:80px;right:16px;z-index:9999999;
  width:300px;background:#0f0f18;
  border:1px solid rgba(205,130,255,.18);border-radius:16px;
  box-shadow:0 20px 56px rgba(0,0,0,.8);display:flex;flex-direction:column;
  font-family:'Inter',sans-serif;
}
.claw-meet-head{display:flex;align-items:center;gap:8px;padding:11px 14px;background:rgba(139,92,246,.07);border-bottom:1px solid rgba(205,130,255,.1);}
.claw-meet-title{font-family:'Sora',sans-serif;font-size:12px;font-weight:700;color:#e8d9ff;flex:1;}
.claw-meet-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;animation:__cmeet_pulse 1.5s infinite;}
@keyframes __cmeet_pulse{0%,100%{opacity:1}50%{opacity:.4}}
.claw-meet-close{background:none;border:none;color:#52525b;cursor:pointer;font-size:16px;transition:color .15s;}
.claw-meet-close:hover{color:#a1a1aa;}
.claw-meet-stats{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.05);display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.claw-meet-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:7px 10px;}
.claw-meet-stat-val{font-size:20px;font-weight:700;color:#e8d9ff;font-family:'Sora',sans-serif;}
.claw-meet-stat-lbl{font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:.06em;}
.claw-meet-transcript{padding:10px 14px;max-height:200px;overflow-y:auto;border-bottom:1px solid rgba(255,255,255,.05);}
.claw-meet-transcript::-webkit-scrollbar{width:3px;}
.claw-meet-transcript::-webkit-scrollbar-thumb{background:#2a2a35;border-radius:2px;}
.claw-meet-caption-item{font-size:11.5px;color:#a1a1aa;margin-bottom:4px;padding:4px 6px;border-radius:5px;transition:background .15s;}
.claw-meet-caption-item:hover{background:rgba(255,255,255,.04);}
.claw-meet-caption-item strong{color:#d4d4d8;}
.claw-meet-actions{padding:10px 14px;display:flex;flex-direction:column;gap:6px;}
.claw-meet-btn{
  display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);border-radius:9px;color:#c4b5fd;
  font-size:11.5px;font-weight:500;padding:8px 12px;cursor:pointer;
  font-family:'Inter',sans-serif;transition:all .15s;text-align:left;
}
.claw-meet-btn:hover{background:rgba(139,92,246,.18);border-color:rgba(205,130,255,.35);color:#e8d9ff;}
.claw-meet-result{padding:12px 14px;background:rgba(139,92,246,.06);border-top:1px solid rgba(205,130,255,.08);}
.claw-meet-result-text{font-size:12px;color:#d4d4d8;line-height:1.65;white-space:pre-wrap;max-height:200px;overflow-y:auto;}
`;
document.head.appendChild(style);

let captions = [];
let startTime = Date.now();
let wordCount = 0;
let speakerMap = {};

function captureCaption(){
  const els = document.querySelectorAll('[jsname="tgaKEf"] [jsname="YSxPC"], .CNusmb, [data-sender-name], .VbkSUe');
  els.forEach(el => {
    const txt = el.textContent?.trim();
    if(!txt || captions.find(c=>c.text===txt)) return;
    const speaker = el.closest('[data-sender-name]')?.getAttribute('data-sender-name') || 'Participante';
    const entry = { speaker, text:txt, time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) };
    captions.push(entry);
    if(captions.length > 200) captions.shift();
    wordCount += txt.split(/\s+/).length;
    speakerMap[speaker] = (speakerMap[speaker]||0) + txt.split(/\s+/).length;
    updateTranscript();
    updateStats();
  });
}

function buildPanel(){
  if(document.getElementById('__claw_meet_panel__')) return;
  const panel = document.createElement('div');
  panel.id = '__claw_meet_panel__';
  panel.innerHTML = `
    <div class="claw-meet-head">
      <span class="claw-meet-title">🎙 Claw · Meet</span>
      <div class="claw-meet-dot"></div>
      <button class="claw-meet-close">✕</button>
    </div>
    <div class="claw-meet-stats">
      <div class="claw-meet-stat"><div class="claw-meet-stat-val" id="__cmeet_words__">0</div><div class="claw-meet-stat-lbl">Palavras</div></div>
      <div class="claw-meet-stat"><div class="claw-meet-stat-val" id="__cmeet_time__">0:00</div><div class="claw-meet-stat-lbl">Duração</div></div>
    </div>
    <div class="claw-meet-transcript" id="__cmeet_transcript__">
      <div style="font-size:11px;color:#52525b;text-align:center;">Aguardando legendas...</div>
    </div>
    <div class="claw-meet-actions">
      <button class="claw-meet-btn" id="__cmeet_summary__">📋 Resumir reunião</button>
      <button class="claw-meet-btn" id="__cmeet_actions__">✅ Listar ações / tarefas</button>
      <button class="claw-meet-btn" id="__cmeet_ata__">📝 Gerar ata</button>
    </div>
    <div class="claw-meet-result" id="__cmeet_result__" style="display:none;"></div>
  `;
  document.body.appendChild(panel);

  panel.querySelector('.claw-meet-close').onclick = () => panel.remove();
  document.getElementById('__cmeet_summary__').onclick = () => meetAction('summary');
  document.getElementById('__cmeet_actions__').onclick = () => meetAction('actions');
  document.getElementById('__cmeet_ata__').onclick     = () => meetAction('ata');

  setInterval(captureCaption, 800);
  setInterval(updateTimer, 1000);
}

function updateTranscript(){
  const el = document.getElementById('__cmeet_transcript__');
  if(!el) return;
  const last = captions.slice(-15);
  el.innerHTML = last.map(c=>`<div class="claw-meet-caption-item"><strong>${c.speaker}</strong> <span style="color:#52525b;font-size:9px;">${c.time}</span><br>${c.text}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

function updateStats(){
  const el = document.getElementById('__cmeet_words__');
  if(el) el.textContent = wordCount;
}

function updateTimer(){
  const el = document.getElementById('__cmeet_time__');
  if(!el) return;
  const s = Math.floor((Date.now()-startTime)/1000);
  el.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

async function meetAction(action){
  const transcript = captions.map(c=>`${c.speaker}: ${c.text}`).join('\n');
  if(!transcript){ showResult('Nenhuma legenda capturada ainda. Ative as legendas ao vivo.'); return; }
  const prompts = {
    summary: `Resuma esta reunião do Google Meet em português, com os principais pontos discutidos:\n\n${transcript}`,
    actions: `Liste todas as tarefas e ações identificadas nesta reunião, com responsáveis quando mencionados:\n\n${transcript}`,
    ata:     `Gere uma ata formal desta reunião em português, com: participantes, pauta, decisões, próximas ações:\n\n${transcript}`,
  };
  showResult('Analisando...');
  try {
    const result = await callGroq(prompts[action]);
    showResult(result);
  } catch(e) { showResult('❌ ' + e.message); }
}

function showResult(text){
  const el = document.getElementById('__cmeet_result__');
  if(!el) return;
  el.style.display = 'block';
  el.innerHTML = `<div class="claw-meet-result-text">${text}</div>`;
}

function callGroq(prompt){
  return new Promise((resolve,reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH', 
      payload:{ model:MODEL, messages:[{role:'user',content:prompt.slice(0,5000)}], max_tokens:1000, temperature:0.2 }
    }, res => {
      if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if(!res?.ok) return reject(new Error(res?.error||'Erro'));
      resolve(res.data?.choices?.[0]?.message?.content?.trim()||'');
    });
  });
}

chrome.runtime.onMessage.addListener((msg,_,reply)=>{
  if(msg.type==='MEET_TOGGLE'){ buildPanel(); reply({ok:true}); return true; }
});

// Auto-inicia
setTimeout(buildPanel, 2000);
})();
