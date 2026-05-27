/* CLAW Plugin — Google Docs v30 | UI premium */
(function(){
'use strict';
if(window.__clawDocs__) return;
window.__clawDocs__ = true;
if(!location.hostname.includes('docs.google.com')) return;
const MODEL = 'llama-3.3-70b-versatile';

const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
#__claw_docs_sidebar__{
  position:fixed;top:80px;right:16px;z-index:9999999;
  width:290px;background:#0f0f18;
  border:1px solid rgba(205,130,255,.15);border-radius:16px;
  box-shadow:0 20px 56px rgba(0,0,0,.8);display:flex;flex-direction:column;
  font-family:'Inter',sans-serif;
}
.claw-docs-head{display:flex;align-items:center;gap:8px;padding:11px 14px;background:rgba(139,92,246,.07);border-bottom:1px solid rgba(205,130,255,.1);}
.claw-docs-title{font-size:12px;font-weight:700;color:#e8d9ff;flex:1;}
.claw-docs-close{background:none;border:none;color:#52525b;cursor:pointer;font-size:16px;transition:color .15s;}
.claw-docs-close:hover{color:#a1a1aa;}
.claw-docs-section{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04);}
.claw-docs-section-title{font-size:9.5px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px;}
.claw-docs-btn{
  display:flex;align-items:center;gap:7px;width:100%;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  border-radius:8px;color:#c4b5fd;font-size:11.5px;font-weight:500;
  padding:8px 10px;cursor:pointer;font-family:'Inter',sans-serif;
  transition:all .13s;margin-bottom:4px;text-align:left;
}
.claw-docs-btn:hover{background:rgba(139,92,246,.18);border-color:rgba(205,130,255,.3);color:#e8d9ff;}
.claw-docs-btn:last-child{margin-bottom:0;}
.claw-docs-result{
  padding:12px 14px;background:rgba(139,92,246,.05);border-top:1px solid rgba(205,130,255,.08);
  display:none;
}
.claw-docs-result-text{font-size:11.5px;color:#d4d4d8;line-height:1.65;white-space:pre-wrap;max-height:220px;overflow-y:auto;}
.claw-docs-result-copy{
  margin-top:8px;background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.25);
  border-radius:7px;color:#a78bfa;font-size:11px;font-weight:600;
  padding:6px 12px;cursor:pointer;width:100%;font-family:'Inter',sans-serif;transition:all .15s;
}
.claw-docs-result-copy:hover{background:rgba(139,92,246,.22);}
`;
document.head.appendChild(style);

function getDocText(){
  const canvas = document.querySelector('.kix-page-content-wrapper');
  if(canvas) return canvas.innerText;
  const editor = document.querySelector('.docs-texteventtarget-iframe');
  return document.title || '';
}

function buildSidebar(){
  if(document.getElementById('__claw_docs_sidebar__')) return;
  const sidebar = document.createElement('div');
  sidebar.id = '__claw_docs_sidebar__';
  sidebar.innerHTML = `
    <div class="claw-docs-head">
      <span class="claw-docs-title">📄 Claw · Docs</span>
      <button class="claw-docs-close">✕</button>
    </div>
    <div class="claw-docs-section">
      <div class="claw-docs-section-title">Análise</div>
      <button class="claw-docs-btn" data-action="summarize">📋 Resumir documento</button>
      <button class="claw-docs-btn" data-action="outline">🗂 Gerar índice</button>
      <button class="claw-docs-btn" data-action="keywords">🔑 Palavras-chave</button>
    </div>
    <div class="claw-docs-section">
      <div class="claw-docs-section-title">Escrita</div>
      <button class="claw-docs-btn" data-action="improve">✨ Melhorar texto</button>
      <button class="claw-docs-btn" data-action="grammar">🔤 Corrigir gramática</button>
      <button class="claw-docs-btn" data-action="formal">💼 Tornar formal</button>
    </div>
    <div class="claw-docs-section">
      <div class="claw-docs-section-title">Geração</div>
      <button class="claw-docs-btn" data-action="continue">▶ Continuar escrevendo</button>
      <button class="claw-docs-btn" data-action="conclusion">✅ Gerar conclusão</button>
    </div>
    <div class="claw-docs-result" id="__claw_docs_result__">
      <div class="claw-docs-result-text" id="__claw_docs_result_text__"></div>
      <button class="claw-docs-result-copy" id="__claw_docs_copy__">📋 Copiar</button>
    </div>
  `;
  document.body.appendChild(sidebar);

  sidebar.querySelector('.claw-docs-close').onclick = () => sidebar.remove();
  sidebar.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = () => docsAction(btn.dataset.action);
  });
  document.getElementById('__claw_docs_copy__').onclick = () => {
    const txt = document.getElementById('__claw_docs_result_text__').textContent;
    navigator.clipboard.writeText(txt).then(()=>{
      document.getElementById('__claw_docs_copy__').textContent = '✓ Copiado!';
      setTimeout(()=>{ const el=document.getElementById('__claw_docs_copy__'); if(el) el.textContent='📋 Copiar'; }, 2000);
    });
  };
}

async function docsAction(action){
  const text = getDocText().slice(0,4000) || 'Documento vazio';
  const prompts = {
    summarize:  `Resuma este documento em bullet points claros e organizados:\n\n${text}`,
    outline:    `Crie um índice/outline estruturado para este documento:\n\n${text}`,
    keywords:   `Liste as 10 principais palavras-chave e temas deste documento:\n\n${text}`,
    improve:    `Melhore a escrita deste documento, tornando-o mais claro:\n\n${text}`,
    grammar:    `Corrija gramática, ortografia e pontuação. Retorne o texto corrigido:\n\n${text}`,
    formal:     `Reescreva em tom formal e acadêmico:\n\n${text}`,
    continue:   `Continue escrevendo este texto de forma coerente:\n\n${text}`,
    conclusion: `Escreva uma conclusão adequada para este documento:\n\n${text}`,
  };
  showResult('⏳ Processando...');
  try {
    const result = await callGroq(prompts[action]);
    showResult(result);
  } catch(e) { showResult('❌ ' + e.message); }
}

function showResult(text){
  const section = document.getElementById('__claw_docs_result__');
  const textEl  = document.getElementById('__claw_docs_result_text__');
  if(!section || !textEl) return;
  section.style.display = 'block';
  textEl.textContent = text;
}

function callGroq(prompt){
  return new Promise((resolve,reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH', 
      payload:{ model:MODEL, messages:[{role:'user',content:prompt}], max_tokens:1000, temperature:0.3 }
    }, res => {
      if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if(!res?.ok) return reject(new Error(res?.error||'Erro'));
      resolve(res.data?.choices?.[0]?.message?.content?.trim()||'');
    });
  });
}

chrome.runtime.onMessage.addListener((msg,_,reply)=>{
  if(msg.type==='DOCS_TOGGLE'){ buildSidebar(); reply({ok:true}); return true; }
});

setTimeout(buildSidebar, 2000);
})();
