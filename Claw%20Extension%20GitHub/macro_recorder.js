/* CLAW — macro_recorder.js v41 | Macro Recorder corrigido e robusto */
(function(){
'use strict';

if (window.__CLAW_MACRO_RECORDER__?.ready) {
  window.__CLAW_MACRO_RECORDER__.open();
  return;
}

const state = {
  ready: true,
  recording: false,
  actions: [],
  panel: null,
  lastScrollAt: 0
};
window.__CLAW_MACRO_RECORDER__ = state;

const ICONS = {
  click:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>`,
  type:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  scroll:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  key:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h.01M11 9h.01M15 9h2M7 13h10"/></svg>`,
  play:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  stop:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`,
  rec:     `<svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="8"/></svg>`,
  trash:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  save:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  clear:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  close:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

function esc(v){
  return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function cssEsc(v){
  if (window.CSS?.escape) return CSS.escape(String(v));
  return String(v).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g,'\\$1');
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function now(){ return Date.now(); }
function stepDelay(){ return 320; }
function isPanelTarget(e){ return e.target?.closest?.('#__claw_macro_panel__'); }

function getLabel(el){
  const txt = el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || el.getAttribute('title') || el.name || el.id || el.tagName;
  return String(txt || '').trim().replace(/\s+/g,' ').slice(0,80);
}

function buildSelector(el){
  if(!el || !el.tagName) return '';
  if(el.id) return '#'+cssEsc(el.id);
  const testId = el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');
  if(testId) return `[data-testid="${cssEsc(testId)}"], [data-test="${cssEsc(testId)}"], [data-cy="${cssEsc(testId)}"]`;
  const aria = el.getAttribute('aria-label');
  if(aria) return `${el.tagName.toLowerCase()}[aria-label="${cssEsc(aria)}"]`;
  if(el.name) return `${el.tagName.toLowerCase()}[name="${cssEsc(el.name)}"]`;
  if(el.href && el.tagName === 'A') return `a[href="${cssEsc(el.getAttribute('href'))}"]`;

  const parts = [];
  let cur = el;
  for(let depth=0; cur && cur.nodeType === 1 && depth < 4; depth++, cur = cur.parentElement){
    let part = cur.tagName.toLowerCase();
    const cls = [...cur.classList].filter(c => c && c.length > 2 && !/^js-|^ng-|^css-/.test(c)).slice(0,2);
    if(cls.length) part += '.' + cls.map(cssEsc).join('.');
    if(cur.parentElement){
      const siblings = [...cur.parentElement.children].filter(x => x.tagName === cur.tagName);
      if(siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(cur)+1})`;
    }
    parts.unshift(part);
  }
  return parts.join(' > ');
}

function findBySelector(selector){
  if(!selector) return null;
  for(const raw of String(selector).split(',')){
    try{
      const el = document.querySelector(raw.trim());
      if(el) return el;
    }catch(_){ }
  }
  return null;
}

function findByText(label){
  if(!label) return null;
  const needle = String(label).trim().toLowerCase();
  if(!needle) return null;
  const candidates = document.querySelectorAll('button,a,input,textarea,select,label,[role="button"],[aria-label],div,span,li,td,th');
  for(const el of candidates){
    const hay = getLabel(el).toLowerCase();
    if(hay === needle || hay.includes(needle)) return el;
  }
  return null;
}

function record(action){
  action.t = now();
  state.actions.push(action);
  flashRecord();
  renderActions();
  updateHeaderState();
}

function onClickRecord(e){
  if(!state.recording || isPanelTarget(e)) return;
  const el = e.target;
  record({
    type:'click',
    selector:buildSelector(el),
    label:getLabel(el),
    x:e.clientX,
    y:e.clientY
  });
}

function onInputRecord(e){
  if(!state.recording || isPanelTarget(e)) return;
  const el = e.target;
  if(!isWritable(el)) return;
  const selector = buildSelector(el);
  const value = readValue(el);
  const last = state.actions[state.actions.length-1];
  if(last?.type === 'type' && last.selector === selector){
    last.value = value;
    last.label = getLabel(el);
    last.t = now();
  } else {
    record({ type:'type', selector, label:getLabel(el), value });
  }
  renderActions();
}

function onKeyRecord(e){
  if(!state.recording || isPanelTarget(e)) return;
  const keep = ['Enter','Tab','Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
  const combo = e.ctrlKey || e.metaKey || e.altKey;
  if(!combo && !keep.includes(e.key)) return;
  record({
    type:'key',
    key:e.key,
    ctrl:e.ctrlKey,
    meta:e.metaKey,
    alt:e.altKey,
    shift:e.shiftKey,
    label:(e.ctrlKey?'Ctrl+':'')+(e.metaKey?'Meta+':'')+(e.altKey?'Alt+':'')+(e.shiftKey?'Shift+':'')+e.key
  });
}

function onScrollRecord(){
  if(!state.recording) return;
  const t = now();
  if(t - state.lastScrollAt < 160) return;
  state.lastScrollAt = t;
  const last = state.actions[state.actions.length-1];
  if(last?.type === 'scroll'){
    last.x = window.scrollX;
    last.y = window.scrollY;
    last.t = t;
    renderActions();
  } else {
    record({ type:'scroll', x:window.scrollX, y:window.scrollY, label:`${Math.round(window.scrollY)}px` });
  }
}

function isWritable(el){
  if(!el) return false;
  if(el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
function readValue(el){
  if(el.isContentEditable) return el.innerText;
  if(el.tagName === 'SELECT') return el.value;
  return el.value ?? '';
}
function writeValue(el, value){
  if(el.isContentEditable){
    el.focus();
    el.innerText = value;
    el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return;
  }
  el.focus();
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto,'value')?.set;
  if(setter) setter.call(el, value); else el.value = value;
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true}));
}

function fireMouseClick(el, x, y){
  const rect = el.getBoundingClientRect();
  const cx = Number.isFinite(x) ? x : rect.left + rect.width/2;
  const cy = Number.isFinite(y) ? y : rect.top + rect.height/2;
  const opts = {bubbles:true,cancelable:true,composed:true,view:window,clientX:cx,clientY:cy};
  for(const type of ['pointerover','mouseover','pointerdown','mousedown','pointerup','mouseup','click']){
    const Ev = type.startsWith('pointer') && window.PointerEvent ? PointerEvent : MouseEvent;
    el.dispatchEvent(new Ev(type, opts));
  }
}

async function playMacro(mac){
  if(!mac?.actions?.length){ showNotif('Macro vazio','warning'); return; }
  showNotif('▶ Executando macro: '+mac.name,'info');
  for(const step of mac.actions){
    try{
      if(step.type === 'click'){
        let el = findBySelector(step.selector) || findByText(step.label);
        if(!el && Number.isFinite(step.x) && Number.isFinite(step.y)) el = document.elementFromPoint(step.x, step.y);
        if(el){
          el.scrollIntoView({block:'center', inline:'center', behavior:'smooth'});
          await sleep(220);
          fireMouseClick(el, step.x, step.y);
        } else {
          console.warn('[Claw Macro] elemento não encontrado:', step.selector, step.label);
        }
      } else if(step.type === 'type'){
        const el = findBySelector(step.selector) || findByText(step.label);
        if(el) writeValue(el, step.value || '');
        else console.warn('[Claw Macro] campo não encontrado:', step.selector, step.label);
      } else if(step.type === 'scroll'){
        window.scrollTo({left:step.x||0, top:step.y||0, behavior:'smooth'});
      } else if(step.type === 'key'){
        const target = document.activeElement || document.body;
        const opts = {key:step.key, bubbles:true, cancelable:true, ctrlKey:!!step.ctrl, metaKey:!!step.meta, altKey:!!step.alt, shiftKey:!!step.shift};
        target.dispatchEvent(new KeyboardEvent('keydown', opts));
        target.dispatchEvent(new KeyboardEvent('keyup', opts));
      }
      await sleep(stepDelay());
    } catch(e){
      console.warn('[Claw Macro] erro no passo:', e);
    }
  }
  showNotif('✓ Macro concluído com sucesso!','success');
}

function saveMacros(macs){ chrome.storage.local.set({ claw_macros: macs }); }
function loadMacros(cb){ chrome.storage.local.get(['claw_macros'], d => cb(Array.isArray(d.claw_macros) ? d.claw_macros : [])); }

function ensureStyles(){
  if(document.getElementById('__cmr_styles__')) return;
  const s = document.createElement('style');
  s.id = '__cmr_styles__';
  s.textContent = `
    @keyframes __cmr_pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
    @keyframes __cmr_slide_in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    #__claw_macro_panel__{position:fixed!important;bottom:80px!important;left:16px!important;z-index:2147483647!important;width:320px;background:#1a1a1e;border:1px solid rgba(204,120,50,.15);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.03);font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;display:flex;flex-direction:column;overflow:hidden;animation:__cmr_slide_in .22s ease both;color:#d4d4d8}
    .cmr-header{display:flex;align-items:center;gap:8px;padding:12px 14px;background:rgba(204,120,50,.06);border-bottom:1px solid rgba(204,120,50,.1)}
    .cmr-title{font-size:12px;font-weight:700;color:#e8915a;letter-spacing:.05em;text-transform:uppercase}.cmr-rec-dot{width:8px;height:8px;border-radius:50%;background:#3f3f50;margin-left:auto;flex-shrink:0;transition:background .2s}.cmr-rec-dot.recording{background:#ef4444;animation:__cmr_pulse 1s infinite}.cmr-close-btn{background:none;border:none;color:#52525b;cursor:pointer;padding:2px;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s}.cmr-close-btn:hover{color:#a1a1aa;background:rgba(255,255,255,.06)}
    .cmr-input-row{display:flex;gap:6px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.05)}.cmr-name-input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#d4d4d8;font-size:11px;padding:7px 10px;font-family:'Inter',inherit;outline:none;transition:border-color .15s}.cmr-name-input:focus{border-color:rgba(204,120,50,.4)}.cmr-name-input::placeholder{color:#52525b}
    .cmr-btn{display:flex;align-items:center;gap:5px;border-radius:8px;font-size:11px;font-weight:600;padding:7px 11px;cursor:pointer;font-family:'Inter',inherit;white-space:nowrap;border:1px solid transparent;transition:background .15s,border-color .15s,transform .1s}.cmr-btn:active{transform:scale(.95)}.cmr-btn-rec{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25);color:#f87171}.cmr-btn-rec:hover{background:rgba(239,68,68,.2)}.cmr-btn-rec.recording{background:rgba(239,68,68,.25);border-color:rgba(239,68,68,.5);color:#fca5a5}.cmr-btn-save{background:rgba(204,120,50,.12);border-color:rgba(204,120,50,.25);color:#e8915a}.cmr-btn-save:hover{background:rgba(204,120,50,.2)}.cmr-btn-clear{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:#71717a}.cmr-btn-clear:hover{background:rgba(255,255,255,.08);color:#a1a1aa}.cmr-btn-play{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.2);color:#4ade80}.cmr-btn-play:hover{background:rgba(34,197,94,.2)}.cmr-btn-del{background:none;border:none;color:#52525b;padding:4px;cursor:pointer;border-radius:4px;display:flex;align-items:center;transition:color .15s,background .15s}.cmr-btn-del:hover{color:#f87171;background:rgba(239,68,68,.1)}
    .cmr-actions-area{padding:8px 12px;overflow-y:auto;min-height:50px;max-height:130px}.cmr-action-item{display:flex;align-items:center;gap:7px;padding:5px 7px;border-radius:7px;margin-bottom:3px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}.cmr-action-icon{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.cmr-action-icon.click{background:rgba(59,130,246,.15);color:#60a5fa}.cmr-action-icon.type{background:rgba(204,120,50,.15);color:#e8915a}.cmr-action-icon.scroll{background:rgba(34,197,94,.12);color:#4ade80}.cmr-action-icon.key{background:rgba(168,85,247,.12);color:#c084fc}.cmr-action-label{font-size:10.5px;color:#a1a1aa;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cmr-section-label{font-size:9.5px;font-weight:700;color:#52525b;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px 4px}.cmr-saved-list{padding:0 12px 10px;max-height:140px;overflow-y:auto}.cmr-macro-card{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:8px;margin-bottom:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);transition:border-color .15s}.cmr-macro-card:hover{border-color:rgba(204,120,50,.2)}.cmr-macro-name{font-size:11px;color:#d4d4d8;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cmr-macro-steps{font-size:9.5px;color:#52525b}.cmr-footer{display:flex;gap:6px;padding:8px 12px;border-top:1px solid rgba(255,255,255,.05)}.cmr-empty{font-size:11px;color:#3f3f50;text-align:center;padding:10px 0;font-style:italic}.cmr-scrollbar::-webkit-scrollbar{width:3px}.cmr-scrollbar::-webkit-scrollbar-track{background:transparent}.cmr-scrollbar::-webkit-scrollbar-thumb{background:#2a2a35;border-radius:2px}
  `;
  document.head.appendChild(s);
}

function buildPanel(){
  ensureStyles();
  if(state.panel && document.body.contains(state.panel)){
    state.panel.style.display = 'flex';
    updateHeaderState();
    renderActions();
    renderSaved();
    return state.panel;
  }
  document.getElementById('__claw_macro_panel__')?.remove();
  const panel = document.createElement('div');
  panel.id = '__claw_macro_panel__';
  panel.innerHTML = `
    <div class="cmr-header">
      <span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;background:rgba(239,68,68,.12);border-radius:5px;flex-shrink:0;">${ICONS.rec}</span>
      <span class="cmr-title">Macro Recorder</span>
      <div id="__cmr_dot__" class="cmr-rec-dot"></div>
      <button id="__cmr_close__" class="cmr-close-btn" title="Fechar">${ICONS.close}</button>
    </div>
    <div class="cmr-input-row">
      <input id="__cmr_name__" class="cmr-name-input" placeholder="Nome do macro..."/>
      <button id="__cmr_rec__" class="cmr-btn cmr-btn-rec">${ICONS.rec} Gravar</button>
    </div>
    <div id="__cmr_actions__" class="cmr-actions-area cmr-scrollbar"><div class="cmr-empty">Nenhuma ação gravada.</div></div>
    <div class="cmr-footer">
      <button id="__cmr_save__" class="cmr-btn cmr-btn-save" style="flex:1;">${ICONS.save} Salvar</button>
      <button id="__cmr_clear__" class="cmr-btn cmr-btn-clear">${ICONS.clear} Limpar</button>
    </div>
    <div class="cmr-section-label">Macros Salvos</div>
    <div id="__cmr_saved__" class="cmr-saved-list cmr-scrollbar"><div class="cmr-empty">Nenhum macro salvo.</div></div>
  `;
  document.body.appendChild(panel);
  state.panel = panel;

  panel.querySelector('#__cmr_close__').onclick = () => closePanel();
  panel.querySelector('#__cmr_rec__').onclick = toggleRecording;
  panel.querySelector('#__cmr_save__').onclick = saveCurrent;
  panel.querySelector('#__cmr_clear__').onclick = () => { state.actions=[]; renderActions(); updateHeaderState(); };
  renderActions();
  renderSaved();
  updateHeaderState();
  return panel;
}

function openPanel(){ buildPanel(); showNotif('Macro Recorder aberto','info'); }
function closePanel(){ stopRecording(); if(state.panel) state.panel.style.display = 'none'; }
function toggleRecording(){ state.recording ? stopRecording() : startRecording(); }

function startRecording(){
  buildPanel();
  if(state.recording) return;
  state.recording = true;
  state.actions = [];
  document.addEventListener('click',  onClickRecord,  true);
  document.addEventListener('input',  onInputRecord,  true);
  document.addEventListener('change', onInputRecord,  true);
  document.addEventListener('keydown', onKeyRecord, true);
  document.addEventListener('scroll', onScrollRecord, true);
  updateHeaderState();
  renderActions();
  showNotif('● Gravando macro','info');
}

function stopRecording(){
  if(!state.recording) { updateHeaderState(); return; }
  state.recording = false;
  document.removeEventListener('click',  onClickRecord,  true);
  document.removeEventListener('input',  onInputRecord,  true);
  document.removeEventListener('change', onInputRecord,  true);
  document.removeEventListener('keydown', onKeyRecord, true);
  document.removeEventListener('scroll', onScrollRecord, true);
  updateHeaderState();
  showNotif('■ Gravação parada','info');
}

function updateHeaderState(){
  const btn = document.getElementById('__cmr_rec__');
  const dot = document.getElementById('__cmr_dot__');
  if(btn){
    btn.innerHTML = state.recording ? `${ICONS.stop} Parar` : `${ICONS.rec} Gravar`;
    btn.classList.toggle('recording', state.recording);
  }
  if(dot) dot.classList.toggle('recording', state.recording);
}
function flashRecord(){
  const dot = document.getElementById('__cmr_dot__');
  if(dot){ dot.style.background='#ffffff'; setTimeout(()=>{ dot.style.background=''; },120); }
}

function renderActions(){
  const el = document.getElementById('__cmr_actions__');
  if(!el) return;
  if(!state.actions.length){ el.innerHTML='<div class="cmr-empty">Nenhuma ação gravada.</div>'; return; }
  el.innerHTML = state.actions.map((a,i)=>{
    const icon = ICONS[a.type] || ICONS.click;
    const desc = a.type==='type'
      ? `${a.label || 'campo'}: "${String(a.value||'').slice(0,18)}${String(a.value||'').length>18?'…':''}"`
      : a.type==='scroll' ? `Rolagem: ${Math.round(a.y||0)}px`
      : a.type==='key' ? `Tecla: ${a.label || a.key}`
      : (a.label || a.type);
    return `<div class="cmr-action-item" data-action-idx="${i}">
      <div class="cmr-action-icon ${esc(a.type)}">${icon}</div>
      <span class="cmr-action-label" title="${esc(desc)}">${esc(desc)}</span>
      <button class="cmr-btn-del" data-remove title="Remover">${ICONS.trash}</button>
    </div>`;
  }).join('');
  el.onclick = (e) => {
    const btn = e.target.closest('[data-remove]');
    if(!btn) return;
    e.stopPropagation();
    const idx = Number(btn.closest('[data-action-idx]')?.dataset.actionIdx);
    if(!Number.isNaN(idx)){ state.actions.splice(idx,1); renderActions(); updateHeaderState(); }
  };
}

function saveCurrent(){
  const nameEl = document.getElementById('__cmr_name__');
  const name = nameEl?.value?.trim() || `Macro ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
  if(!state.actions.length){ showNotif('⚠ Grave ações antes de salvar','warning'); return; }
  loadMacros(macs=>{
    macs.push({ id:Date.now(), name, url:location.href, actions:state.actions.map(a=>({...a})) });
    saveMacros(macs);
    state.actions = [];
    if(nameEl) nameEl.value = '';
    renderActions();
    renderSaved();
    showNotif(`✓ Macro salvo: ${name}`,'success');
  });
}

function renderSaved(){
  loadMacros(macs=>{
    const el = document.getElementById('__cmr_saved__');
    if(!el) return;
    if(!macs.length){ el.innerHTML='<div class="cmr-empty">Nenhum macro salvo.</div>'; return; }
    el.innerHTML = macs.slice().reverse().map(m=>`
      <div class="cmr-macro-card" data-macro-id="${esc(m.id)}">
        <div style="flex:1;min-width:0;">
          <div class="cmr-macro-name" title="${esc(m.name)}">${esc(m.name)}</div>
          <div class="cmr-macro-steps">${m.actions?.length||0} ação${(m.actions?.length||0)!==1?'ões':''}</div>
        </div>
        <button class="cmr-btn cmr-btn-play" data-action="play" style="padding:5px 9px;">${ICONS.play}</button>
        <button class="cmr-btn-del" data-action="del" title="Excluir">${ICONS.trash}</button>
      </div>`).join('');
    el.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if(!btn) return;
      e.stopPropagation();
      const id = Number(btn.closest('[data-macro-id]')?.dataset.macroId);
      if(!id) return;
      if(btn.dataset.action === 'play') loadMacros(macs2=>{ const m = macs2.find(x=>Number(x.id)===id); if(m) playMacro(m); });
      if(btn.dataset.action === 'del') loadMacros(macs2=>{ saveMacros(macs2.filter(x=>Number(x.id)!==id)); renderSaved(); showNotif('Macro excluído','info'); });
    };
  });
}

function showNotif(msg, type='info'){
  const old = document.getElementById('__cmr_notif__');
  if(old) old.remove();
  const icon = (chrome?.runtime?.getURL) ? chrome.runtime.getURL('claude-icon.png') : 'claude-icon.png';
  const div = document.createElement('div');
  div.id = '__cmr_notif__';
  div.style.cssText = `position:fixed;bottom:16px;right:16px;z-index:2147483647;background:#1a1a1e;border:1px solid rgba(204,120,50,.3);border-radius:20px;padding:8px 16px 8px 10px;font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;font-size:12px;color:#ececec;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,.6);animation:__cmr_slide_in .2s ease;`;
  div.innerHTML = `<img src="${icon}" style="width:18px;height:18px;border-radius:4px;" alt=""/><span>${esc(msg)}</span>`;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),3000);
}

state.open = openPanel;
state.close = closePanel;
state.start = startRecording;
state.stop = stopRecording;
state.toggle = toggleRecording;
state.play = playMacro;

chrome.runtime.onMessage.addListener((msg,_,reply)=>{
  if(!msg || typeof msg !== 'object') return;
  if(msg.type === 'MACRO_OPEN')  { openPanel(); reply?.({ok:true, recording:state.recording, actions:state.actions.length}); return true; }
  if(msg.type === 'MACRO_CLOSE') { closePanel(); reply?.({ok:true}); return true; }
  if(msg.type === 'MACRO_START') { startRecording(); reply?.({ok:true, recording:true}); return true; }
  if(msg.type === 'MACRO_STOP')  { stopRecording(); reply?.({ok:true, recording:false, actions:state.actions.length}); return true; }
  if(msg.type === 'MACRO_TOGGLE'){ toggleRecording(); reply?.({ok:true, recording:state.recording, actions:state.actions.length}); return true; }
  if(msg.type === 'MACRO_STATUS'){ loadMacros(macs=>reply?.({ok:true, recording:state.recording, actions:state.actions.length, macros:macs})); return true; }
  if(msg.type === 'MACRO_PLAY' && msg.id){ loadMacros(macs=>{ const m=macs.find(x=>Number(x.id)===Number(msg.id)); if(m) playMacro(m); reply?.({ok:!!m}); }); return true; }
  if(msg.type === 'MACRO_DELETE' && msg.id){ loadMacros(macs=>{ saveMacros(macs.filter(x=>Number(x.id)!==Number(msg.id))); renderSaved(); reply?.({ok:true}); }); return true; }
});

console.log('[Claw Macro v41] carregado');
})();
