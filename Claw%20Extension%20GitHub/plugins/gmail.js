/* CLAW Plugin — Gmail v30 | UI premium */
(function(){
'use strict';
if(window.__clawGmail__) return;
window.__clawGmail__ = true;
if(!location.hostname.includes('mail.google.com')) return;
const MODEL = 'llama-3.3-70b-versatile';

const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
.claw-gmail-bar{display:flex;gap:5px;padding:6px 8px;flex-wrap:wrap;align-items:center;background:rgba(18,18,26,.85);border-radius:10px;margin:4px 0;border:1px solid rgba(205,130,255,.12);backdrop-filter:blur(8px);}
.claw-gmail-btn{
  display:inline-flex;align-items:center;gap:4px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:6px;color:#c4b5fd;font-size:11px;font-weight:500;
  padding:5px 10px;cursor:pointer;font-family:'Inter',sans-serif;
  transition:all .15s;white-space:nowrap;
}
.claw-gmail-btn:hover{background:rgba(139,92,246,.2);border-color:rgba(205,130,255,.4);color:#e8d9ff;transform:translateY(-1px);}
.claw-gmail-btn:active{transform:scale(.95);}
.claw-gmail-result{
  position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999999;
  width:480px;max-height:70vh;background:#0f0f18;
  border:1px solid rgba(205,130,255,.2);border-radius:16px;
  box-shadow:0 32px 80px rgba(0,0,0,.85);display:flex;flex-direction:column;
  font-family:'Inter',sans-serif;
}
.claw-gmail-result-head{
  display:flex;align-items:center;gap:8px;padding:12px 16px;
  background:rgba(139,92,246,.08);border-bottom:1px solid rgba(205,130,255,.1);
}
.claw-gmail-result-title{font-size:13px;font-weight:600;color:#e8d9ff;flex:1;}
.claw-gmail-result-close{background:none;border:none;color:#52525b;cursor:pointer;padding:3px;border-radius:5px;font-size:16px;transition:color .15s;}
.claw-gmail-result-close:hover{color:#a1a1aa;}
.claw-gmail-result-body{padding:16px;color:#d4d4d8;font-size:13px;line-height:1.7;overflow-y:auto;flex:1;white-space:pre-wrap;}
.claw-gmail-result-footer{padding:10px 16px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;justify-content:flex-end;}
.claw-gmail-apply{background:rgba(139,92,246,.2);border:1px solid rgba(139,92,246,.4);border-radius:8px;color:#a78bfa;font-size:12px;font-weight:600;padding:7px 16px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;}
.claw-gmail-apply:hover{background:rgba(139,92,246,.3);}
`;
document.head.appendChild(style);

const ACTIONS = [
  { icon:'✨', label:'Melhorar',  action:'improve'   },
  { icon:'💼', label:'Formal',    action:'formal'    },
  { icon:'✂️',  label:'Encurtar', action:'short'     },
  { icon:'📋', label:'Resumir',   action:'summarize' },
  { icon:'🔄', label:'Follow-up', action:'followup'  },
  { icon:'💡', label:'Sugerir',   action:'suggest'   },
];

function createBar(box) {
  const bar = document.createElement('div');
  bar.className = 'claw-gmail-bar';
  ACTIONS.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'claw-gmail-btn';
    btn.textContent = `${a.icon} ${a.label}`;
    btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); gmailAction(a.action, box); };
    bar.appendChild(btn);
  });
  return bar;
}

function injectToolbar(){
  const observer = new MutationObserver(() => {
    const composeBoxes = document.querySelectorAll('[role="textbox"][aria-label*="orpo"], div.Am.Al.editable, [g_editable="true"]');
    composeBoxes.forEach(box => {
      if(box.dataset.clawInjected) return;
      box.dataset.clawInjected = 'true';
      const parent = box.closest('.ip.iq') || box.closest('[role="dialog"]') || box.parentElement;
      if(parent) parent.insertBefore(createBar(box), box);
    });
    const emailBody = document.querySelector('.a3s.aiL, .ii.gt');
    if(emailBody && !emailBody.dataset.clawSummary){
      emailBody.dataset.clawSummary = 'true';
      const btn = document.createElement('button');
      btn.className = 'claw-gmail-btn';
      btn.style.cssText = 'position:relative;margin:4px 0;';
      btn.textContent = '▸ Resumir conversa';
      btn.onclick = () => summarizeEmail(emailBody);
      emailBody.parentElement?.insertBefore(btn, emailBody);
    }
  });
  observer.observe(document.body, { childList:true, subtree:true });
}

async function gmailAction(action, box){
  const text = box.innerText || box.textContent || '';
  const prompts = {
    improve:   `Melhore este email mantendo o mesmo tom e intenção. Retorne apenas o texto melhorado:\n\n${text}`,
    formal:    `Reescreva este email em tom formal e profissional. Retorne apenas o texto:\n\n${text}`,
    short:     `Encurte este email mantendo os pontos principais. Retorne apenas o texto encurtado:\n\n${text}`,
    summarize: `Resuma este email em 3-5 bullet points em português:\n\n${text}`,
    followup:  `Escreva um email de follow-up educado e profissional para:\n\n${text}`,
    suggest:   `Sugira uma resposta para este email. Retorne apenas o texto da resposta:\n\n${text}`,
  };
  showResult('Processando...', null, null);
  try {
    const result = await callGroq(prompts[action]);
    showResult(result, box, action !== 'summarize' ? result : null);
  } catch(e) {
    showResult('❌ Erro: ' + e.message, null, null);
  }
}

async function summarizeEmail(emailEl){
  const text = emailEl.innerText || '';
  showResult('Resumindo...', null, null);
  try {
    const result = await callGroq(`Resuma este email em bullet points claros:\n\n${text.slice(0,3000)}`);
    showResult(result, null, null);
  } catch(e) {
    showResult('❌ Erro: ' + e.message, null, null);
  }
}

function showResult(content, box, applyText){
  document.querySelector('.claw-gmail-result')?.remove();
  const div = document.createElement('div');
  div.className = 'claw-gmail-result';
  div.innerHTML = `
    <div class="claw-gmail-result-head">
      <span class="claw-gmail-result-title">✉️ Claw · Gmail</span>
      <button class="claw-gmail-result-close" onclick="this.closest('.claw-gmail-result').remove()">✕</button>
    </div>
    <div class="claw-gmail-result-body">${content}</div>
    ${applyText ? `<div class="claw-gmail-result-footer"><button class="claw-gmail-apply" id="__cgm_apply__">Aplicar ao email</button></div>` : ''}
  `;
  document.body.appendChild(div);
  if(applyText && box){
    document.getElementById('__cgm_apply__').onclick = () => {
      box.focus();
      document.execCommand('selectAll');
      document.execCommand('insertText', false, applyText);
      div.remove();
    };
  }
}

function callGroq(prompt){
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH', 
      payload:{ model:MODEL, messages:[{role:'user', content:prompt.slice(0,4000)}], max_tokens:800, temperature:0.3 }
    }, res => {
      if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if(!res?.ok) return reject(new Error(res?.error||'Erro'));
      resolve(res.data?.choices?.[0]?.message?.content?.trim()||'');
    });
  });
}

injectToolbar();
})();
