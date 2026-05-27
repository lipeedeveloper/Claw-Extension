/* CLAW — explain_selection.js v1
   Selecione qualquer texto → Alt+E ou botão flutuante → explicação instantânea
   Desenvolvido por Emanuel Felipe
*/
(function(){
'use strict';
if(window.__clawExplain__) return;
window.__clawExplain__ = true;

const MODEL = 'llama-3.3-70b-versatile';
let selectionBtn = null;
let popup = null;
let lastSelection = '';

/* ── Botão flutuante ao selecionar ── */
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();

    if(!text || text.length < 3){
      removeBtn();
      return;
    }

    lastSelection = text;

    if(!selectionBtn){
      selectionBtn = document.createElement('button');
      selectionBtn.id = '__claw_explain_btn__';
      selectionBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Explicar
      `;
      selectionBtn.style.cssText = `
        position:fixed;z-index:2147483646;
        background:#1e1e22;border:1px solid rgba(204,120,50,.4);border-radius:6px;
        color:#e8915a;font-size:11px;font-weight:600;padding:4px 10px;
        cursor:pointer;font-family:'Plus Jakarta Sans','Plus Jakarta Sans','Inter',system-ui,sans-serif;
        box-shadow:0 4px 16px rgba(0,0,0,.5);display:flex;align-items:center;gap:5px;
        transition:background .15s;white-space:nowrap;
      `;
      selectionBtn.onmouseover = () => selectionBtn.style.background = '#2a2a2f';
      selectionBtn.onmouseout  = () => selectionBtn.style.background = '#1e1e22';
      selectionBtn.onclick = (ev) => {
        ev.stopPropagation();
        explainText(lastSelection, selectionBtn.getBoundingClientRect());
        removeBtn();
      };
      document.body.appendChild(selectionBtn);
    }

    // Posiciona próximo ao cursor
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    selectionBtn.style.top  = (window.scrollY + rect.top - 36) + 'px';
    selectionBtn.style.left = (window.scrollX + rect.left) + 'px';
  }, 10);
});

// Remove botão ao clicar fora (mas não se clicou nele — tem próprio onclick)
document.addEventListener('mousedown', (e) => {
  if(selectionBtn && e.target !== selectionBtn && !selectionBtn.contains(e.target)) {
    removeBtn();
  }
});

// Atalho Alt+E
document.addEventListener('keydown', (e) => {
  if(e.altKey && (e.key === 'e' || e.key === 'E')){
    const text = window.getSelection()?.toString().trim();
    if(text && text.length >= 3){
      explainText(text);
      e.preventDefault();
    }
  }
  // Esc fecha popup
  if(e.key === 'Escape') removePopup();
});

function removeBtn(){
  if(selectionBtn){ selectionBtn.remove(); selectionBtn = null; }
}

/* ── Popup de explicação ── */
async function explainText(text, anchorRect){
  removePopup();

  popup = document.createElement('div');
  popup.id = '__claw_explain_popup__';

  const maxW = Math.min(360, window.innerWidth - 32);
  let top = anchorRect ? (window.scrollY + anchorRect.bottom + 8) : (window.scrollY + 100);
  let left = anchorRect ? (window.scrollX + anchorRect.left) : 40;

  // Garante que não sai da tela
  if(left + maxW > window.innerWidth - 16) left = window.innerWidth - maxW - 16;
  if(top < 0) top = 8;

  popup.style.cssText = `
    position:absolute;z-index:2147483647;
    top:${top}px;left:${left}px;
    width:${maxW}px;max-height:340px;
    background:#18181b;border:1px solid rgba(255,255,255,.08);border-radius:12px;
    box-shadow:0 16px 48px rgba(0,0,0,.7);
    font-family:'Plus Jakarta Sans','Plus Jakarta Sans','Inter',system-ui,sans-serif;
    overflow:hidden;display:flex;flex-direction:column;
    animation:__claw_fade_in .18s ease both;
  `;

  if(!document.getElementById('__claw_explain_css__')){
    const s = document.createElement('style');
    s.id = '__claw_explain_css__';
    s.textContent = `
      @keyframes __claw_fade_in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(s);
  }

  const truncated = text.length > 80 ? text.slice(0, 80) + '…' : text;

  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06);">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8915a" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span style="font-size:11px;font-weight:600;color:#a1a1aa;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">"${truncated}"</span>
      <div style="display:flex;gap:4px;">
        <button id="__cexp_simple__" title="Explicação simples" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#a1a1aa;font-size:10px;padding:2px 7px;cursor:pointer;font-family:inherit;">ELI5</button>
        <button id="__cexp_deep__" title="Explicação técnica" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#a1a1aa;font-size:10px;padding:2px 7px;cursor:pointer;font-family:inherit;">Técnico</button>
        <button id="__cexp_copy__" title="Copiar" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#a1a1aa;font-size:10px;padding:2px 7px;cursor:pointer;font-family:inherit;">⎘</button>
        <button id="__cexp_close__" style="background:none;border:none;color:#52525b;cursor:pointer;font-size:13px;">✕</button>
      </div>
    </div>
    <div id="__cexp_body__" style="padding:12px 14px;color:#d4d4d8;font-size:12px;line-height:1.75;overflow-y:auto;flex:1;">
      <span style="color:#52525b;">Explicando...</span>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById('__cexp_close__').onclick = removePopup;
  document.getElementById('__cexp_simple__').onclick = () => runExplain(text, 'simple');
  document.getElementById('__cexp_deep__').onclick   = () => runExplain(text, 'deep');
  document.getElementById('__cexp_copy__').onclick   = () => {
    const body = document.getElementById('__cexp_body__');
    if(body) navigator.clipboard.writeText(body.innerText);
  };

  runExplain(text, 'default');
}

async function runExplain(text, mode){
  const body = document.getElementById('__cexp_body__');
  if(body) body.innerHTML = '<span style="color:#52525b;">Explicando...</span>';

  const prompts = {
    default: `Explique isso em português brasileiro de forma clara e objetiva (3-5 linhas): "${text}"`,
    simple:  `Explique isso para uma criança de 10 anos em português brasileiro (máximo 3 linhas): "${text}"`,
    deep:    `Explique isso tecnicamente com detalhes em português brasileiro: "${text}"`,
  };

  try {
    const result = await callGroq(prompts[mode] || prompts.default);
    if(body) body.innerHTML = `<div style="white-space:pre-wrap;">${result}</div>`;
  } catch(e) {
    if(body) body.innerHTML = `<span style="color:#ef4444;">❌ ${e.message}</span>`;
  }
}

function removePopup(){
  if(popup){ popup.remove(); popup = null; }
}

// Fecha popup ao clicar fora (não fecha se clicou no botão explicar)
document.addEventListener('mousedown', (e) => {
  if(popup && !popup.contains(e.target) && e.target !== selectionBtn) removePopup();
});

/* ── Groq via background ── */
function callGroq(prompt){
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: 'GROQ_FETCH',
      payload: { model: MODEL, messages:[{role:'user', content:prompt.slice(0,2000)}], max_tokens:400, temperature:0.2 }
    }, res => {
      if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if(!res?.ok) return reject(new Error(res?.error || 'Erro'));
      resolve(res.data?.choices?.[0]?.message?.content?.trim() || '');
    });
  });
}

})();
