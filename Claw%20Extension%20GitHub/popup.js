/* CLAW — popup.js v45 | Emanuel Felipe */
'use strict';

const $ = id => document.getElementById(id);
const on = (id, ev, fn) => $(id)?.addEventListener(ev, fn);

/* ── Menu Navigation System ───────── */
const menuBtn = $('menuBtn');
const closeMenu = $('closeMenu');
const sidebar = $('sidebar');
const overlay = $('overlay');
const menuItems = document.querySelectorAll('.menu-item');
const views = document.querySelectorAll('.view');

function openMenu() {
  sidebar?.classList.add('open');
  overlay?.classList.add('show');
}

function closeMenuFn() {
  sidebar?.classList.remove('open');
  overlay?.classList.remove('show');
}

function switchView(viewId) {
  views.forEach(v => v.classList.remove('active'));
  menuItems.forEach(m => m.classList.remove('active'));
  
  const targetView = $(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');
  
  const targetMenuItem = document.querySelector(`[data-view="${viewId}"]`);
  if (targetMenuItem) targetMenuItem.classList.add('active');
  if (viewId === 'macros') setTimeout(updateMacroPopup, 30);
  if (viewId === 'core') setTimeout(loadCoreStatus, 30);
  
  closeMenuFn();
}

menuBtn?.addEventListener('click', openMenu);
closeMenu?.addEventListener('click', closeMenuFn);
overlay?.addEventListener('click', closeMenuFn);

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const viewId = item.getAttribute('data-view');
    if (viewId) switchView(viewId);
  });
});

/* ── Groq via background proxy ───────── */
function groqFetch(payload, cb) {
  chrome.runtime.sendMessage({ type: 'GROQ_FETCH', payload }, res => {
    if (chrome.runtime.lastError) { cb(new Error(chrome.runtime.lastError.message), null); return; }
    if (!res?.ok) { cb(new Error(res?.error || 'Erro Groq'), null); return; }
    cb(null, res.data);
  });
}

/* ── Inject script na aba ativa ─────── */
function inject(files, msg, cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) { cb?.(); return; }
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files }, () => {
      if (chrome.runtime.lastError) { cb?.(); return; }
      chrome.tabs.sendMessage(tab.id, msg, () => { void chrome.runtime.lastError; cb?.(); });
    });
  });
}

function setPill(id, on) {
  const p = $(`${id}-pill`), t = $(`${id}-status`);
  if (p) p.className = 'pill' + (on ? ' on' : '');
  if (t) t.textContent = on ? 'Ativo' : 'Desativado';
}

function updateDot() {
  const active = ['tog-k', 'tog-s', 'tog-tr', 'tog-sum', 'tog-exp', 'tog-anti', 'tog-study'].some(id => $(id)?.checked);
  $('globalDot')?.classList.toggle('on', active);
  const labels = [
    $('tog-k')?.checked && 'Kahoot',
    $('tog-s')?.checked && 'StopotS',
    $('tog-tr')?.checked && 'Tradutor',
    $('tog-sum')?.checked && 'Resumidor',
    $('tog-exp')?.checked && 'Explicador',
    $('tog-anti')?.checked && 'Anti-det.',
    $('tog-study')?.checked && 'Modo estudo',
  ].filter(Boolean);
  const gs = $('globalStatus');
  if (gs) gs.textContent = active ? labels.join(' · ') : 'Aguardando';
}

function autoResize(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

/* ═══════════════════════════════════════
   AGENTE IA LIVRE COM CONHECIMENTO EXPANDIDO
═══════════════════════════════════════ */
const agentInput = $('agentInput');
const btnAgent = $('btnAgent');
const msgsEl = $('msgs');
const chipsEl = $('chips');
let attachedImg = null;

/* ═══ SCREENSHOT TO CHAT ═══ */
function setAttachedImg(dataUrl){
  attachedImg = dataUrl;
  const imgPreview = $('imgPreview');
  const imgPreviewWrap = $('imgPreviewWrap');
  if(imgPreview) imgPreview.src = dataUrl;
  if(imgPreviewWrap) imgPreviewWrap.style.display = 'block';
  updateSend();
}

function removeAttachedImg(){
  attachedImg = null;
  const imgPreviewWrap = $('imgPreviewWrap');
  const imgPreview = $('imgPreview');
  if(imgPreviewWrap) imgPreviewWrap.style.display = 'none';
  if(imgPreview) imgPreview.src = '';
  updateSend();
}

/* ═══ VOICE INPUT/OUTPUT (via Background → Offscreen) ═══ */
let isListening = false;

function setVoiceActive(on){
  isListening = on;
  const btn = $('btnVoice');
  const icon = btn?.querySelector('.material-symbols-outlined');
  if(icon) icon.textContent = on ? 'mic_off' : 'mic';
  if(icon) icon.style.color = on ? 'var(--ac3)' : '';
  if(btn) btn.style.background = on ? 'rgba(204,120,50,.18)' : '';
  if(btn) btn.style.borderColor = on ? 'rgba(204,120,50,.5)' : '';
  if(agentInput) agentInput.placeholder = on ? 'Ouvindo...' : 'Digite sua mensagem...';
}

function startVoice(){
  if(isListening){
    chrome.runtime.sendMessage({ target: 'background', action: 'voiceStop' });
    return;
  }
  chrome.runtime.sendMessage({ target: 'background', action: 'voiceStart', lang: 'pt-BR' });
}

/* Listen for voice messages relayed from background */
chrome.runtime.onMessage.addListener((msg) => {
  if(msg.target !== 'popup') return;
  if(msg.type === 'voiceState'){
    setVoiceActive(msg.listening);
  } else if(msg.type === 'voiceError'){
    setVoiceActive(false);
    addMsg(msg.error, 'err');
  } else if(msg.type === 'voiceResult'){
    if(agentInput) agentInput.value = msg.transcript;
    autoResize(agentInput);
    updateSend();
    if(msg.isFinal){
      window.__clawVoiceMode__ = true;
      setTimeout(() => {
        sendAgent();
        setTimeout(() => { window.__clawVoiceMode__ = false; }, 10000);
      }, 250);
    }
  }
});

function speakText(text){
  if(!window.speechSynthesis || !text) return;
  const clean = text.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
    .replace(/#{1,6} /g,'').replace(/`([^`]+)`/g,'$1').replace(/\n/g,' ').slice(0,600);
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = 'pt-BR'; utt.rate = 1.0; utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith('pt'));
  if(ptVoice) utt.voice = ptVoice;
  window.speechSynthesis.speak(utt);
}

// Sistema de conhecimento da extensão para a IA
const CLAW_KNOWLEDGE = `
## CONHECIMENTO SOBRE O CLAW

Você é o assistente IA do Claw, uma extensão de navegador poderosa. Aqui está tudo que você precisa saber:

### RECURSOS PRINCIPAIS

1. **Chat IA Inteligente**
   - Múltiplos modelos disponíveis (GPT-OSS 20B, Llama 3.3 70B, Llama 4 Scout, Qwen3)
   - Streaming de respostas em tempo real
   - Suporte a imagens via Llama 4 Scout
   - Personalidade customizável
   - Contexto de página opcional

2. **Assistentes escolares**
   - **Kahoot Estudo Pro**: multi-matérias, foco em matemática, ordem de blocos e confirmação manual
     - Delay antes de analisar
     - Explicação curta da resposta
     - Modo stealth (Alt+H oculta overlay)
   
   - **StopotS Estudo**: sugere palavras por categoria e permite copiar
     - Cache de sugestões
     - Copiar sugestão com 1 clique
     - Estatísticas de uso

3. **Produtividade**
   - **Tradutor Inline**: Alt+T traduz texto selecionado
   - **Resumidor**: Alt+S resume textos longos
   - **Explicador**: Alt+E explica conceitos complexos
   
4. **Plugins Inteligentes**
   - **YouTube**: Controles avançados, resumos de vídeos
   - **Gmail**: Redação inteligente de e-mails
   - **Spotify**: foco de estudo e música
   - **Google Docs**: Assistente de escrita
   - **Google Meet**: Transcrições e resumos

5. **Macro Recorder**
   - Grava sequências de ações
   - Reproduz automaticamente
   - Salva macros personalizadas

### COMANDOS DO AGENTE

Você pode executar AÇÕES REAIS em páginas web. Comandos disponíveis:

**Navegação:**
- "Abrir [URL]" ou "Vai para [URL]"
- "Pesquisar [termo] no Google"
- "Voltar" / "Avançar" / "Recarregar"
- "Rolar até o fim" / "Rolar para o topo"
- "Rolar [N]px para baixo/cima"

**Interação:**
- "Clicar em [descrição]" (encontra elemento por texto, ID, classe, etc.)
- "Duplo clique em [descrição]"
- "Clique direito em [descrição]"
- "Preencher [campo] com [texto]"
- "Digitar [texto]" (no elemento focado)
- "Limpar [campo]"
- "Selecionar [opção] em [select]"
- "Marcar/Desmarcar [checkbox]"

**Teclas:**
- "Pressionar Enter/Tab/Escape/etc"
- "Atalho Ctrl+A" (ou qualquer combinação)

**Extração:**
- "Extrair todos os links"
- "Extrair texto da página"
- "Extrair imagens"
- "Obter título da página"
- "Obter conteúdo de [elemento]"

**Captura:**
- "Capturar tela"
- "Capturar página completa"

**Formulários:**
- "Submeter formulário"
- "Preencher formulário" (com dados estruturados)

### COMO RESPONDER

Quando o usuário pedir para FAZER algo (abrir site, clicar, preencher):
1. NÃO apenas descreva ou explique
2. EXECUTE a ação imediatamente
3. Confirme o que foi feito

Exemplos CORRETOS:
- User: "Abrir YouTube"
  You: "Abrindo YouTube..." → EXECUTA navigate("https://youtube.com")

- User: "Pesquisar gatos"
  You: "Pesquisando gatos no Google..." → EXECUTA

Exemplos ERRADOS:
- User: "Abrir YouTube"
  You: "Para abrir o YouTube, você pode..." ❌ NÃO FAÇA ISSO

### ESTATÍSTICAS E DADOS

- Kahoot Estudo: [total] análises, [hoje] hoje
- StopotS: [total] partidas, [hoje] hoje
- Cache: [N] entradas salvas
- Histórico disponível no menu Estatísticas

### ATALHOS DE TECLADO

- Alt+Space: Abre/fecha chat flutuante
- Alt+T: Traduz seleção
- Alt+S: Resume seleção
- Alt+E: Explica seleção
- Alt+H: Modo stealth
- Atalho customizável nas Configurações

### CONFIGURAÇÕES DISPONÍVEIS

No menu Configurações:
- Personalidade da IA
- Modelo de IA (GPT-OSS, Llama 3.3, Llama 4, Qwen3)
- Contexto de página
- Delay antes da análise (Kahoot Estudo)
- Modo stealth
- Anti-detecção
- Modo professor

### PLUGINS

Os plugins são ativados AUTOMATICAMENTE nas páginas correspondentes:
- YouTube: youtube.com
- Gmail: mail.google.com
- Google Docs: docs.google.com
- Google Meet: meet.google.com

Não há necessidade de ativação manual.

### COMO EXPLICAR RECURSOS

Sempre que perguntarem sobre um recurso:
1. Explique o que faz
2. Como ativar/usar
3. Atalhos relacionados
4. Dicas úteis

Seja CONCISO mas COMPLETO. Use exemplos práticos.
`;

function chip(text) {
  if (agentInput) {
    agentInput.value = text;
    agentInput.focus();
    updateSend();
    const ACTION_RX = /^(abr[ae]r?|abre|acessa|pesquisa|extrai|remove|rola|volta|clica|captura|o que|como|explica|ativa)/i;
    if (ACTION_RX.test(text)) {
      setTimeout(() => { const btn = document.getElementById('btnAgent'); if (btn) btn.click(); }, 80);
    }
  }
}

// Expose chip globally for HTML onclick
window.chip = chip;

function renderMarkdown(text) {
  // Escape HTML first
  let t = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  t = t.replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg3);border:1px solid var(--ln);border-radius:6px;padding:8px 10px;font-size:10.5px;font-family:Consolas,monospace;white-space:pre-wrap;overflow-x:auto;margin:4px 0;">$1</pre>');

  // Inline code
  t = t.replace(/`([^`]+)`/g, '<code style="background:var(--bg3);border:1px solid var(--ln);border-radius:4px;padding:1px 5px;font-family:Consolas,monospace;font-size:10.5px;color:var(--ac3);">$1</code>');

  // Headers (## or ###)
  t = t.replace(/^#{1,3} (.+)$/gm, '<div style="font-size:13px;font-weight:700;color:var(--t);margin:8px 0 4px;">$1</div>');

  // Bold **text**
  t = t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--t);font-weight:700;">$1</strong>');

  // Italic *text*
  t = t.replace(/\*([^*\n]+)\*/g, '<em style="color:var(--t2);">$1</em>');

  // Bullet list lines: starts with * , - or +
  t = t.replace(/^[\*\-\+] (.+)$/gm, '<div style="display:flex;gap:7px;margin:3px 0;padding-left:4px;"><span style="color:var(--ac);flex-shrink:0;margin-top:2px;font-size:10px;">&#9658;</span><span>$1</span></div>');

  // Sub-bullet with indent (  + or   -)
  t = t.replace(/^ {2,}[\*\-\+] (.+)$/gm, '<div style="display:flex;gap:7px;margin:2px 0;padding-left:20px;"><span style="color:var(--ac3);flex-shrink:0;margin-top:2px;font-size:9px;">&#9656;</span><span style="color:var(--t2);">$1</span></div>');

  // Numbered list
  t = t.replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:6px;margin:3px 0;padding-left:4px;"><span style="color:var(--ac3);flex-shrink:0;font-weight:700;min-width:18px;">$1.</span><span>$2</span></div>');

  // Line breaks
  t = t.replace(/\n/g, '<br>');

  return t;
}

function addMsg(text, type = 'ai') {
  if (!msgsEl) return null;
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  
  const avatarEl = document.createElement('div');
  avatarEl.className = 'msg-avatar';
  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined';
  icon.textContent = type === 'user' ? 'person' : 'psychology';
  avatarEl.appendChild(icon);
  
  const bodyEl = document.createElement('div');
  bodyEl.className = 'msg-body';

  if (type === 'ai' && text) {
    bodyEl.innerHTML = renderMarkdown(text);
  } else {
    bodyEl.textContent = text;
  }

  div.appendChild(avatarEl);
  div.appendChild(bodyEl);

  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  if (chipsEl && msgsEl.querySelectorAll('.msg.user').length > 0) chipsEl.style.display = 'none';
  return div;
}

function updateSend() {
  const has = (agentInput?.value?.trim() || '').length > 0 || !!attachedImg;
  btnAgent?.classList.toggle('off', !has);
  btnAgent?.classList.toggle('ready', has);
}

agentInput?.addEventListener('input', () => { autoResize(agentInput); updateSend(); });
agentInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgent(); }
});
btnAgent?.addEventListener('click', sendAgent);

/* Screenshot button */
/* Screenshot button */
$('btnScreenshot')?.addEventListener('click', ()=>{
  const icon = $('btnScreenshot')?.querySelector('.material-symbols-outlined');
  if(icon){ icon.style.color='var(--ac3)'; setTimeout(()=>{ icon.style.color=''; }, 800); }
  chrome.tabs.captureVisibleTab(null, {format:'png'}, dataUrl=>{
    if(chrome.runtime.lastError || !dataUrl){
      addMsg('Nao foi possivel capturar a tela: ' + (chrome.runtime.lastError?.message || 'erro'), 'err');
      return;
    }
    setAttachedImg(dataUrl);
    addMsg('Print capturado. Adicione uma mensagem e envie para analisar.', 'ai');
  });
});

/* Upload image from disk */
$('btnUploadImg')?.addEventListener('click', ()=>{
  $('fileImgInput')?.click();
});
$('fileImgInput')?.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    setAttachedImg(ev.target.result);
    addMsg('Imagem carregada. Adicione uma mensagem e envie para analisar.', 'ai');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

/* Remove image preview */
$('btnRemoveImg')?.addEventListener('click', removeAttachedImg);

/* Voice button */
$('btnVoice')?.addEventListener('click', startVoice);

/* ═══════════════════════════════════════
   HISTÓRICO PERSISTENTE DO CHAT
═══════════════════════════════════════ */
const CHAT_STORAGE_KEY = 'claw_chat_history';
const MAX_CHAT_MSGS = 50;

function saveChatHistory() {
  if (!msgsEl) return;
  const msgs = [...msgsEl.querySelectorAll('.msg')].map(el => ({
    type: [...el.classList].find(c => c !== 'msg') || 'ai',
    text: el.querySelector('.msg-body')?.textContent || '',
  })).slice(-MAX_CHAT_MSGS);
  chrome.storage.local.set({ [CHAT_STORAGE_KEY]: msgs });
}

function loadChatHistory() {
  chrome.storage.local.get([CHAT_STORAGE_KEY], d => {
    const msgs = d[CHAT_STORAGE_KEY] || [];
    if (msgs.length === 0) return;
    if (!msgsEl) return;
    msgsEl.innerHTML = '';
    msgs.forEach(m => addMsg(m.text, m.type));
    if (chipsEl && msgs.some(m => m.type === 'user')) chipsEl.style.display = 'none';
  });
}

loadChatHistory();

/* ═══════════════════════════════════════
   SELETOR DE MODELO
═══════════════════════════════════════ */
function loadModelSelector() {
  const sel = $('modelSelect');
  if (!sel) return;

  chrome.runtime.sendMessage({ type: 'MODELS_GET' }, res => {
    if (!res?.models) return;
    sel.innerHTML = res.models.map(m =>
      `<option value="${m.id}">${m.label}</option>`
    ).join('');

    chrome.storage.sync.get(['claw_model'], d => {
      if (d.claw_model) sel.value = d.claw_model;
    });
  });

  sel.addEventListener('change', () => {
    chrome.runtime.sendMessage({ type: 'MODEL_SET', model: sel.value }, () => {
      const label = sel.options[sel.selectedIndex]?.text || sel.value;
      addMsg(`Modelo alterado para: ${label}`, 'ai');
      saveChatHistory();
    });
  });
}

loadModelSelector();

/* ═══════════════════════════════════════
   ATALHO CUSTOMIZÁVEL
═══════════════════════════════════════ */
const DEFAULT_SHORTCUT = { key: 'Space', altKey: true, ctrlKey: false, shiftKey: false };

function shortcutLabel(sc) {
  const parts = [];
  if (sc.ctrlKey) parts.push('Ctrl');
  if (sc.altKey) parts.push('Alt');
  if (sc.shiftKey) parts.push('Shift');
  const k = sc.key === ' ' ? 'Space' : (sc.key?.length === 1 ? sc.key.toUpperCase() : sc.key);
  parts.push(k);
  return parts.join('+');
}

function loadShortcutDisplay() {
  chrome.storage.sync.get(['claw_shortcut'], d => {
    const sc = d.claw_shortcut || DEFAULT_SHORTCUT;
    const el = $('shortcutLabel');
    if (el) el.textContent = shortcutLabel(sc);
  });
}

on('btnRecordShortcut', 'click', () => {
  const btn = $('btnRecordShortcut');
  const lbl = $('shortcutLabel');
  if (!btn || !lbl) return;

  btn.textContent = 'Pressione...';
  btn.style.background = 'rgba(204,120,50,.15)';
  btn.style.borderColor = 'rgba(204,120,50,.4)';

  function onKey(e) {
    e.preventDefault();
    e.stopPropagation();

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    const sc = {
      key: e.key,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    };

    chrome.storage.sync.set({ claw_shortcut: sc }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SHORTCUT', shortcut: sc }, () => void chrome.runtime.lastError);
        }
      });
    });

    lbl.textContent = shortcutLabel(sc);
    btn.textContent = 'Alterar';
    btn.style.background = '';
    btn.style.borderColor = '';
    document.removeEventListener('keydown', onKey, true);
  }

  document.addEventListener('keydown', onKey, true);

  setTimeout(() => {
    document.removeEventListener('keydown', onKey, true);
    if (btn.textContent === 'Pressione...') {
      btn.textContent = 'Alterar';
      btn.style.background = '';
      btn.style.borderColor = '';
      loadShortcutDisplay();
    }
  }, 5000);
});

loadShortcutDisplay();

function sendAgent() {
  const text = agentInput?.value?.trim();
  if (!text && !attachedImg) return;

  addMsg(text || '(analise a imagem)', 'user');
  saveChatHistory();
  if (agentInput) { agentInput.value = ''; agentInput.style.height = 'auto'; }
  updateSend();

  const img = attachedImg;
  attachedImg = null;

  if (img) {
    const thinking = addMsg('Analisando imagem...', 'thinking');
    const b64 = img.split(',')[1];
    const mime = img.match(/data:(.*?);/)?.[1] || 'image/png';
    groqFetch({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } },
          { type: 'text', text: text || 'Transcreva todo texto visível da imagem, identifique pergunta e alternativas se houver, resolva em modo estudo e explique o passo a passo. Atenção a símbolos como ², ³, √, ×, x, ÷, :, frações e parênteses.' }
        ]
      }],
      max_tokens: 1400, temperature: 0.15, claw_purpose: 'vision',
    }, (err, data) => {
      thinking?.remove();
      const reply = err ? 'Erro: ' + err.message : (data?.choices?.[0]?.message?.content?.trim() || '—');
      addMsg(reply, err ? 'err' : 'ai');
      saveChatHistory();
    });
    return;
  }

  // Detecta se é ação ou pergunta
  const ACTION_RX = /^(abr[ae]r?|vai|acessa|entra|ir para|vai para|clica?|digita?|pesquisa?|busca?|fecha|rola|volta|avança|recarrega|copia|navega|scrolla?|scroll|maximize|minimize|fecha a aba|extrair?|captura|preenche?|limpa|seleciona|marca|desmarca|pressiona|atalho|submete?|obter|obtenha)\s/i;
  const isAction = ACTION_RX.test(text) || /^https?:\/\//i.test(text) || /^www\./i.test(text);

  if (isAction) {
    const msgDiv = addMsg('', 'ai');
    const bodyEl = msgDiv?.querySelector('.msg-body');
    if (bodyEl) bodyEl.innerHTML = '<span style="opacity:.5">Executando...</span>';
    
    chrome.runtime.sendMessage({ type: 'AGENT_RUN', text }, res => {
      if (bodyEl) bodyEl.textContent = '';
      if (chrome.runtime.lastError) { addMsg('Erro: ' + chrome.runtime.lastError.message, 'err'); return; }
      if (!res) { addMsg('Sem resposta', 'err'); return; }
      if (res.reply) bodyEl ? (bodyEl.innerHTML = renderMarkdown(res.reply)) : addMsg(res.reply, 'ai');
      if (res.results?.length) {
        const m = res.results.filter(r => r && !r.startsWith('✓ openTab') && !r.startsWith('✓ navigate') && !r.startsWith('✓ Aberto'));
        if (m.length) addMsg(m.join('\n'), 'log');
      }
      saveChatHistory();
    });
    return;
  }

  // Streaming chat com conhecimento expandido
  const msgDiv = addMsg('', 'ai');
  const bodyEl = msgDiv?.querySelector('.msg-body');
  if (bodyEl) bodyEl.textContent = '...';

  const streamId = 'stream_' + Date.now();
  let fullText = '';
  let streamDone = false;

  function onChunk(m) {
    if (m.type !== 'STREAM_CHUNK' || m.streamId !== streamId) return;
    if (m.error) {
      clearTimeout(streamTimeout);
      if (bodyEl) bodyEl.innerHTML = renderMarkdown('❌ ' + m.error);
      chrome.runtime.onMessage.removeListener(onChunk);
      saveChatHistory();
      return;
    }
    if (m.delta) {
      fullText += m.delta;
      if (bodyEl) bodyEl.innerHTML = renderMarkdown(fullText) + '';
      if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    }
    if (m.done) {
      streamDone = true;
      clearTimeout(streamTimeout);
      const finalText = fullText || '—';
      if (bodyEl) bodyEl.innerHTML = renderMarkdown(finalText);
      chrome.runtime.onMessage.removeListener(onChunk);
      
      // Speak response if voice was used
      if (isListening === false && $('btnVoice')?.dataset?.voiceMode === '1') {
        speakText(finalText);
      }
      // Auto-speak if voice mode is active
      if (window.__clawVoiceMode__) speakText(finalText);
      
      // Se IA mencionou ação mas não executou, executa agora
      const actionKeywords = /abr(ir?|indo|o)|navigando|vou abrir|abrindo|acessando|entrando em|indo para/i;
      if (actionKeywords.test(finalText) && text) {
        chrome.runtime.sendMessage({ type: 'AGENT_RUN', text }, res => {
          if (res && res.results && res.results.some(r => r && r.startsWith('✓ Aberto'))) {
            // Ação executada
          }
        });
      }
      saveChatHistory();
    }
  }
  chrome.runtime.onMessage.addListener(onChunk);

  // Timeout: se não receber nada em 15s, mostra erro
  const streamTimeout = setTimeout(() => {
    if (!streamDone && !fullText) {
      if (bodyEl) bodyEl.innerHTML = renderMarkdown('⚠️ A IA não respondeu. Verifique sua API key nas configurações ou tente novamente.');
      chrome.runtime.onMessage.removeListener(onChunk);
      saveChatHistory();
    }
  }, 15000);

  // Limpa timeout quando stream termina
  const origOnChunk = onChunk;
  
  chrome.runtime.sendMessage({ type: 'PERSONALITY_GET' }, personalityRes => {
    const personality = personalityRes?.personality || '';

    chrome.storage.sync.get(['claw_page_context'], ctxData => {
      const useCtx = ctxData.claw_page_context || false;
      
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        let contextMsg = CLAW_KNOWLEDGE + '\n\nVocê é o assistente IA do Claw. Responda de forma útil, concisa e direta.';
        
        if (personality) {
          contextMsg += `\n\nPERSONALIDADE CUSTOMIZADA: ${personality}`;
        }
        
        if (useCtx && tab) {
          contextMsg += `\n\nCONTEXTO DA PÁGINA ATUAL:\nTítulo: ${tab.title}\nURL: ${tab.url}`;
        }

        const historyMsgs = [...msgsEl.querySelectorAll('.msg')]
          .slice(-6)
          .map(el => ({
            role: el.classList.contains('user') ? 'user' : 'assistant',
            content: el.querySelector('.msg-body')?.textContent || ''
          }));

        const messages = [
          { role: 'system', content: contextMsg },
          ...historyMsgs,
          { role: 'user', content: text }
        ];

        chrome.runtime.sendMessage({
          type: 'AGENT_STREAM',
          messages,
          streamId
        });
      });
    });
  });
}

/* ═══════════════════════════════════════
   TOGGLES & SETTINGS
═══════════════════════════════════════ */
const TOGGLE_MAP = {
  'tog-k':          { key: 'claw_kahoot',       pill: 'kahoot' },
  'tog-s':          { key: 'claw_stopots',       pill: 'stopots' },
  'tog-tr':         { key: 'claw_translate' },
  'tog-sum':        { key: 'claw_summarize' },
  'tog-exp':        { key: 'claw_explain' },
  'tog-page-context':{ key: 'claw_page_context' },
  'tog-stealth':    { key: 'claw_stealth' },
  'tog-anti':       { key: 'claw_anti',          pill: 'anti' },
  'tog-study':      { key: 'claw_study',         pill: 'study' },
  'tog-miss':       { key: 'claw_miss' },
};

/* Envia mensagem correta para o content script de acordo com o toggle */
function dispatchToggle(id, val) {
  chrome.storage.sync.get(['claw_stealth','claw_delay','claw_miss_rate','tr_lang'], d => {
    const stealth = !!d.claw_stealth;
    const delay   = parseInt(d.claw_delay) || 0;

    if (id === 'tog-k') {
      inject(['kahoot.js'], val
        ? { type: 'KAHOOT_ON', stealth, delay }
        : { type: 'KAHOOT_OFF' });
    } else if (id === 'tog-s') {
      inject(['stopots.js'], val
        ? { type: 'STOP_ON' }
        : { type: 'STOP_OFF' });
    } else if (id === 'tog-tr') {
      inject(['translator.js'], val
        ? { type: 'TR_ON', lang: d.tr_lang || 'auto' }
        : { type: 'TR_OFF' });
    } else if (id === 'tog-sum' || id === 'tog-exp') {
      const sum = !!$('tog-sum')?.checked;
      const exp = !!$('tog-exp')?.checked;
      if (sum || exp) {
        inject(['page_tools.js'], { type: 'TOOLS_ON', summarize: sum, explain: exp });
      } else {
        inject(['page_tools.js'], { type: 'TOOLS_OFF' });
      }
    } else if (id === 'tog-anti') {
      inject(['anti_detect.js'], val ? { type: 'ANTI_ON' } : { type: 'ANTI_OFF' });
    } else if (id === 'tog-study') {
      chrome.runtime.sendMessage({ type: val ? 'STUDY_ON' : 'STUDY_OFF' }, () => void chrome.runtime.lastError);
    
    } else if (id === 'tog-stealth') {
      /* Propaga novo estado stealth para kahoot ativo */
      inject([], { type: 'KAHOOT_STEALTH', stealth: val });
    }
  });
}

Object.keys(TOGGLE_MAP).forEach(id => {
  const cfg = TOGGLE_MAP[id];
  chrome.storage.sync.get([cfg.key], d => {
    const el = $(id);
    if (el) el.checked = !!d[cfg.key];
    if (cfg.pill) setPill(cfg.pill, !!d[cfg.key]);
    if (id === 'tog-miss') {
      const row = $('missRow');
      if (row) row.style.display = d[cfg.key] ? 'block' : 'none';
    }
    updateDot();
  });

  on(id, 'change', () => {
    const el = $(id);
    const val = el?.checked || false;
    chrome.storage.sync.set({ [cfg.key]: val });
    if (cfg.pill) setPill(cfg.pill, val);
    dispatchToggle(id, val);
    updateDot();

    if (id === 'tog-miss') {
      const row = $('missRow');
      if (row) row.style.display = val ? 'block' : 'none';
    }
  });
});

// Delay slider
const delaySlider = $('delaySlider');
const delayVal = $('delayVal');
if (delaySlider) {
  chrome.storage.sync.get(['claw_delay'], d => {
    delaySlider.value = d.claw_delay || 0;
    if (delayVal) delayVal.textContent = (d.claw_delay || 0) / 1000 + 's';
  });
  delaySlider.addEventListener('input', () => {
    const v = +delaySlider.value;
    if (delayVal) delayVal.textContent = v / 1000 + 's';
    chrome.storage.sync.set({ claw_delay: v });
    inject([], { type: 'SET_DELAY', delay: v });
  });
}

// Miss slider
const missSlider = $('missSlider');
const missVal = $('missVal');
if (missSlider) {
  chrome.storage.sync.get(['claw_miss_rate'], d => {
    missSlider.value = d.claw_miss_rate || 5;
    if (missVal) missVal.textContent = d.claw_miss_rate || 5;
  });
  missSlider.addEventListener('input', () => {
    const v = +missSlider.value;
    if (missVal) missVal.textContent = v;
    chrome.storage.sync.set({ claw_miss_rate: v });
    inject([], { type: 'SET_MISS_RATE', rate: v });
  });
}

// Personality
const personalityInput = $('personalityInput');
if (personalityInput) {
  chrome.storage.sync.get(['claw_personality'], d => {
    personalityInput.value = d.claw_personality || '';
  });
  personalityInput.addEventListener('input', () => {
    chrome.storage.sync.set({ claw_personality: personalityInput.value });
  });
}

const apiKeyInput = $('apiKeyInput');
if (apiKeyInput) {
  chrome.storage.local.get(['claw_api_key'], d => {
    apiKeyInput.value = d.claw_api_key || '';
    apiKeyInput.placeholder = 'Cole sua API Groq · uma ou mais chaves separadas por espaço';
  });
  apiKeyInput.addEventListener('change', () => {
    const value = apiKeyInput.value.trim();
    if (value) chrome.storage.local.set({ claw_api_key: value }, () => addMsg('API salva com sucesso. O ciclo de fallback usará as chaves configuradas.', 'ai'));
    else chrome.storage.local.remove(['claw_api_key'], () => addMsg('API removida. Configure uma chave para ativar a IA.', 'ai'));
  });
}

on('clearApiKey', 'click', () => {
  if (apiKeyInput) apiKeyInput.value = '';
  chrome.storage.local.remove(['claw_api_key'], () => addMsg('API removida. Configure uma chave para ativar a IA.', 'ai'));
});

/* ═══════════════════════════════════════
   STATS & CACHE
═══════════════════════════════════════ */
chrome.storage.local.get(['claw_stats', 'stopots_cache'], d => {
  const stats = d.claw_stats || {};
  $('statKTotal').textContent = stats.kahoot_total || 0;
  $('statKToday').textContent = (stats.kahoot_today || 0) + ' hoje';
  $('statSTotal').textContent = stats.stopots_total || 0;
  $('statSToday').textContent = (stats.stopots_today || 0) + ' hoje';
  $('cacheCount').textContent = Object.keys(d.stopots_cache || {}).length;
});

on('clearCache', 'click', () => {
  chrome.storage.local.set({ stopots_cache: {} }, () => {
    $('cacheCount').textContent = '0';
    addMsg('Cache limpo com sucesso', 'ai');
  });
});

/* Clear chat conversation */
on('btnClearChat', 'click', () => {
  if(!msgsEl) return;
  // Animate out
  msgsEl.style.transition = 'opacity .2s';
  msgsEl.style.opacity = '0';
  setTimeout(() => {
    // Remove all messages
    msgsEl.innerHTML = '';
    // Add fresh greeting
    addMsg('Conversa apagada. Como posso ajudar?', 'ai');
    msgsEl.style.opacity = '1';
    // Show chips again
    if(chipsEl) chipsEl.style.display = 'flex';
    // Clear persisted chat history
    chrome.storage.local.set({ [CHAT_STORAGE_KEY]: [] });
    // Reset attached image
    removeAttachedImg();
  }, 200);
});

on('clearHistory', 'click', () => {
  chrome.storage.local.set({ claw_history: [] }, () => {
    $('historyList').innerHTML = '<div class="hist-empty">Nenhuma atividade ainda</div>';
    addMsg('Histórico limpo', 'ai');
  });
});

// Load history
chrome.storage.local.get(['claw_history'], d => {
  const hist = d.claw_history || [];
  const el = $('historyList');
  if (!el) return;
  if (hist.length === 0) return;
  el.innerHTML = hist.slice(-20).reverse().map(h => `
    <div class="hist-item">
      <div class="hist-icon">
        <span class="material-symbols-outlined">${h.type === 'kahoot' ? 'school' : 'casino'}</span>
      </div>
      <div class="hist-text">${h.text}</div>
      <div class="hist-time">${new Date(h.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `).join('');
});

// Macro Recorder — painel funcional dentro da página + lista no popup
function escapePopupHtml(v) {
  return String(v ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function setMacroStatus(text, active = false, error = false) {
  const sub = $('macroStatusText');
  const pill = $('macro-pill');
  const label = $('macro-status');
  if (sub) sub.textContent = text;
  if (label) label.textContent = error ? 'Erro' : active ? 'Ativo' : 'Pronto';
  if (pill) {
    pill.classList.toggle('on', !!active && !error);
    if (error) {
      pill.style.color = 'var(--err)';
      pill.style.borderColor = 'rgba(192,80,80,.35)';
      pill.style.background = 'rgba(192,80,80,.10)';
    } else {
      pill.style.color = '';
      pill.style.borderColor = '';
      pill.style.background = '';
    }
  }
}

function macroCommand(type, payload = {}, cb) {
  setMacroStatus('Conectando na página atual...', true);
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) {
      setMacroStatus('Nenhuma aba ativa encontrada', false, true);
      cb?.(new Error('no_tab'));
      return;
    }
    const url = tab.url || '';
    if (/^(chrome|edge|about|chrome-extension):/i.test(url)) {
      setMacroStatus('Abra uma página normal para gravar macros', false, true);
      cb?.(new Error('blocked_url'));
      return;
    }
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['macro_recorder.js'] }, () => {
      const injectErr = chrome.runtime.lastError;
      if (injectErr) {
        setMacroStatus('Não consegui injetar o gravador nessa página', false, true);
        cb?.(new Error(injectErr.message));
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type, ...payload }, res => {
        const msgErr = chrome.runtime.lastError;
        if (msgErr) {
          setMacroStatus('Painel aberto. Recarregue a página se não aparecer.', true);
          cb?.(null, { ok: true, warning: msgErr.message });
          return;
        }
        if (!res?.ok) {
          setMacroStatus('Macro Recorder não respondeu corretamente', false, true);
          cb?.(new Error('macro_failed'));
          return;
        }
        const actionsTxt = typeof res.actions === 'number' ? ` · ${res.actions} ação${res.actions === 1 ? '' : 'ões'}` : '';
        setMacroStatus(res.recording ? `Gravando agora${actionsTxt}` : `Painel aberto${actionsTxt}`, !!res.recording);
        cb?.(null, res);
      });
    });
  });
}

function updateMacroPopup() {
  const list = $('macroSavedList');
  if (!list) return;
  chrome.storage.local.get(['claw_macros'], d => {
    const macros = Array.isArray(d.claw_macros) ? d.claw_macros : [];
    if (!macros.length) {
      list.innerHTML = '<div class="hist-empty">Nenhum macro salvo ainda</div>';
      setMacroStatus('Painel pronto para abrir na página', false);
      return;
    }
    list.innerHTML = macros.slice().reverse().map(m => `
      <div class="hist-item" data-popup-macro-id="${escapePopupHtml(m.id)}" style="gap:8px">
        <div class="hist-icon"><span class="material-symbols-outlined">smart_button</span></div>
        <div class="hist-text" title="${escapePopupHtml(m.name)}" style="min-width:0;flex:1">
          ${escapePopupHtml(m.name || 'Macro')}
          <div style="font-size:9px;color:var(--t3);margin-top:2px">${(m.actions?.length || 0)} ação${(m.actions?.length || 0) === 1 ? '' : 'ões'}</div>
        </div>
        <button class="btn-sm" data-macro-play style="padding:3px 7px;background:rgba(90,158,111,.10);border-color:rgba(90,158,111,.25);color:var(--ok2)">Play</button>
        <button class="btn-sm" data-macro-del style="padding:3px 7px;background:rgba(192,80,80,.10);border-color:rgba(192,80,80,.25);color:var(--err)">Del</button>
      </div>
    `).join('');
    setMacroStatus(`${macros.length} macro${macros.length === 1 ? '' : 's'} salvo${macros.length === 1 ? '' : 's'}`, false);
  });
}

on('btnMacro', 'click', () => macroCommand('MACRO_OPEN', {}, () => updateMacroPopup()));
on('btnMacroStart', 'click', () => macroCommand('MACRO_START'));
on('btnMacroStop', 'click', () => macroCommand('MACRO_STOP', {}, () => updateMacroPopup()));
on('btnMacroRefresh', 'click', updateMacroPopup);

$('macroSavedList')?.addEventListener('click', e => {
  const row = e.target.closest('[data-popup-macro-id]');
  if (!row) return;
  const id = Number(row.dataset.popupMacroId);
  if (e.target.closest('[data-macro-play]')) {
    macroCommand('MACRO_PLAY', { id }, () => setMacroStatus('Executando macro na página atual...', true));
  }
  if (e.target.closest('[data-macro-del]')) {
    chrome.storage.local.get(['claw_macros'], d => {
      const macros = Array.isArray(d.claw_macros) ? d.claw_macros : [];
      chrome.storage.local.set({ claw_macros: macros.filter(m => Number(m.id) !== id) }, updateMacroPopup);
    });
  }
});

updateMacroPopup();

console.log('[Claw v43] Popup loaded successfully');


/* ═══════════════════════════════════════
   CORE SYSTEM v45 — status, memória e estudo
═══════════════════════════════════════ */
function coreSet(text, isError=false) {
  const el = $('coreResult');
  if (!el) return;
  el.textContent = text || '';
  el.style.color = isError ? '#f87171' : '';
}

function coreSend(type, payload={}) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type, payload }, res => {
      if (chrome.runtime.lastError) resolve({ ok:false, error:chrome.runtime.lastError.message });
      else resolve(res || { ok:false, error:'Sem resposta' });
    });
  });
}

function renderCoreLogs(logs=[]) {
  const el = $('coreLogs');
  if (!el) return;
  if (!logs.length) {
    el.innerHTML = '<div class="hist-empty">Sem logs ainda</div>';
    return;
  }
  el.innerHTML = logs.slice(0, 25).map(l => {
    const time = new Date(l.time || Date.now()).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    const level = String(l.level || 'info').toUpperCase();
    const color = level === 'ERROR' ? '#f87171' : level === 'WARN' ? '#fbbf24' : level === 'OK' ? '#7cba8e' : 'var(--t3)';
    return `<div class="core-log"><b style="color:${color}">${level}</b> · ${time}<br>${escapeHtml(l.text || '')}</div>`;
  }).join('');
}

async function loadCoreStatus() {
  const res = await coreSend('CORE_STATUS');
  if (!res.ok) {
    const line = $('coreStatusLine');
    if (line) line.textContent = 'Erro: ' + (res.error || 'falha');
    return;
  }
  const cooling = (res.cooling || []).filter(x => x.cooling > 0).length;
  const line = $('coreStatusLine');
  if (line) line.textContent = `v${res.version} · ${res.apiCount} APIs · modelo ${res.activeModel} · fila ${res.queue?.active || 0}/${res.queue?.waiting || 0} · cooldown ${cooling}`;
  renderCoreLogs(res.logs || []);
}

async function runCoreAction(type, label) {
  coreSet(label + '...');
  const res = await coreSend(type);
  if (!res.ok) {
    coreSet('Erro: ' + (res.error || 'falha'), true);
    return;
  }
  coreSet(res.text || 'Concluído.');
  loadCoreStatus();
}

on('btnCoreAnalyze', 'click', () => runCoreAction('CORE_PAGE_ANALYZE', 'Analisando página'));
on('btnCoreFlashcards', 'click', () => runCoreAction('CORE_FLASHCARDS', 'Criando flashcards'));
on('btnCorePlan', 'click', () => runCoreAction('CORE_STUDY_PLAN', 'Montando plano de estudo'));
on('btnCoreReview', 'click', () => runCoreAction('CORE_REVIEW', 'Gerando revisão inteligente'));
on('btnCoreStatus', 'click', loadCoreStatus);
on('btnCoreClearLogs', 'click', async () => {
  await coreSend('CORE_LOGS_CLEAR');
  loadCoreStatus();
  coreSet('Logs limpos.');
});
on('btnCorePanel', 'click', () => {
  chrome.tabs.query({ active:true, currentWindow:true }, ([tab]) => {
    if (!tab?.id) return coreSet('Nenhuma aba ativa encontrada.', true);
    chrome.scripting.executeScript({ target:{ tabId:tab.id }, files:['claw_core.js'] }, () => {
      if (chrome.runtime.lastError) return coreSet('Erro ao abrir painel: ' + chrome.runtime.lastError.message, true);
      chrome.tabs.sendMessage(tab.id, { type:'CLAW_CORE_OPEN' }, () => void chrome.runtime.lastError);
      coreSet('Painel Core aberto na página atual. Atalho: Alt+Shift+C');
    });
  });
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ═══════════════════════════════════════
   TRADUTOR RAPIDO — painel no chat
═══════════════════════════════════════ */
(function(){
  const btnQtr    = $('btnQtr');
  const qtrPanel  = $('qtr-panel');
  const qtrInput  = $('qtr-input');
  const qtrOutput = $('qtr-output');
  const qtrBtn    = $('qtr-btn');
  const qtrSpin   = $('qtr-spin');
  const qtrFrom   = $('qtr-from');
  const qtrTo     = $('qtr-to');

  if (!btnQtr) return;

  /* toggle painel */
  btnQtr.addEventListener('click', () => {
    const open = qtrPanel.classList.toggle('open');
    btnQtr.classList.toggle('on', open);
    if (open && qtrInput) qtrInput.focus();
  });

  /* Traduzir */
  async function doTranslate() {
    const text = qtrInput?.value?.trim();
    if (!text) return;
    const from = qtrFrom?.value || 'auto';
    const to   = qtrTo?.value   || 'pt-BR';

    qtrOutput.value = '';
    qtrSpin.style.display = 'block';
    qtrBtn.disabled = true;

    const fromLabel = from === 'auto' ? 'idioma detectado automaticamente' : from;
    const prompt = `Traduza o texto abaixo do ${fromLabel} para ${to}.\nResponda APENAS com a traducao, sem explicacoes, sem aspas.\n\nTexto:\n${text}`;

    try {
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'GROQ_FETCH',
          payload: {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024,
            temperature: 0.2
          }
        }, res => {
          if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
          if (!res?.ok) { reject(new Error(res?.error || 'Erro Groq')); return; }
          const result = res.data?.choices?.[0]?.message?.content?.trim() || '';
          qtrOutput.value = result;
          resolve();
        });
      });
    } catch(e) {
      qtrOutput.value = 'Erro: ' + e.message;
    } finally {
      qtrSpin.style.display = 'none';
      qtrBtn.disabled = false;
    }
  }

  if (qtrBtn)   qtrBtn.addEventListener('click', doTranslate);
  if (qtrInput) {
    qtrInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doTranslate(); }
    });
  }

  /* Copiar resultado ao clicar na caixa de saida */
  if (qtrOutput) {
    qtrOutput.addEventListener('click', () => {
      if (!qtrOutput.value) return;
      navigator.clipboard.writeText(qtrOutput.value).catch(()=>{});
      const prev = qtrOutput.placeholder;
      qtrOutput.style.borderColor = 'var(--ok)';
      setTimeout(() => { qtrOutput.style.borderColor = ''; }, 800);
    });
  }
})();
