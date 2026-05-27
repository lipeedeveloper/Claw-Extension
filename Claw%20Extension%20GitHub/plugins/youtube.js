/* CLAW Plugin — YouTube v32 | Orange Theme + Working Close */
(function(){
'use strict';
if(window.__clawYT__) return;
window.__clawYT__ = true;
if(!location.hostname.includes('youtube.com')) return;
const MODEL = 'llama-3.3-70b-versatile';

const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

#__claw_yt_bar_wrap__ {
  display:flex; align-items:center; gap:8px;
  padding:8px 0 6px; margin:4px 0; flex-wrap:nowrap;
}
#__claw_yt_bar__ {
  display:flex; gap:6px; flex-wrap:wrap; flex:1;
}
.claw-yt-btn {
  display:inline-flex; align-items:center; gap:5px;
  background:rgba(30,18,8,.88);
  border:1px solid rgba(220,130,50,.28);
  border-radius:20px;
  color:#e8934a;
  font-size:12px; font-weight:500;
  padding:6px 14px; cursor:pointer;
  font-family:'Inter',sans-serif;
  transition:all .18s ease;
  backdrop-filter:blur(8px);
  outline:none;
}
.claw-yt-btn:hover {
  background:rgba(204,120,50,.22);
  border-color:rgba(220,130,50,.6);
  color:#ffb07a;
  transform:translateY(-1px);
  box-shadow:0 4px 14px rgba(204,100,30,.3);
}
.claw-yt-btn:active { transform:scale(.96); }
.claw-yt-btn svg { flex-shrink:0; }

#__claw_yt_close_bar__ {
  display:inline-flex; align-items:center; justify-content:center;
  min-width:28px; width:28px; height:28px; border-radius:50%;
  background:rgba(30,18,8,.7);
  border:1px solid rgba(220,130,50,.2);
  color:#aa6030; cursor:pointer;
  transition:all .18s; flex-shrink:0;
  outline:none; padding:0;
}
#__claw_yt_close_bar__:hover {
  background:rgba(192,60,40,.25);
  border-color:rgba(220,80,60,.4);
  color:#ff8060;
}

#__claw_yt_panel__ {
  position:fixed; top:80px; right:20px; z-index:2147483647;
  width:360px; max-height:65vh;
  background:rgba(16,10,4,.97);
  border:1px solid rgba(204,120,50,.2);
  border-radius:16px;
  box-shadow:0 24px 64px rgba(0,0,0,.75);
  font-family:'Inter',sans-serif; overflow:hidden;
  display:flex; flex-direction:column;
  animation:__claw_yt_in .22s cubic-bezier(.22,1,.36,1) both;
}
@keyframes __claw_yt_in {
  from { opacity:0; transform:translateX(12px) scale(.96) }
  to   { opacity:1; transform:none }
}
.claw-yt-head {
  display:flex; align-items:center; gap:8px; padding:11px 14px;
  background:rgba(204,120,50,.08);
  border-bottom:1px solid rgba(204,120,50,.12);
  flex-shrink:0;
}
.claw-yt-head-title {
  font-size:12px; font-weight:700;
  color:#f0c090; letter-spacing:.04em; flex:1;
}
.claw-yt-close-btn {
  background:none; border:none; cursor:pointer; padding:4px;
  border-radius:5px; display:flex; align-items:center; justify-content:center;
  color:#52525b; transition:color .15s, background .15s;
  flex-shrink:0; outline:none; line-height:1;
}
.claw-yt-close-btn:hover {
  color:#e88060; background:rgba(204,80,50,.15);
}
.claw-yt-body {
  padding:14px; color:#d4d4d8; font-size:12.5px; line-height:1.75;
  overflow-y:auto; flex:1; white-space:pre-wrap;
}
.claw-yt-body::-webkit-scrollbar { width:3px; }
.claw-yt-body::-webkit-scrollbar-thumb { background:#3a2a1a; border-radius:2px; }
.claw-yt-loading {
  display:flex; align-items:center; gap:8px; color:#cc7832; font-size:12px;
}
.claw-yt-spinner {
  width:14px; height:14px;
  border:2px solid rgba(204,120,50,.2);
  border-top-color:#cc7832; border-radius:50%;
  animation:__claw_yt_spin .7s linear infinite;
}
@keyframes __claw_yt_spin { to { transform:rotate(360deg) } }
`;
document.head.appendChild(style);

const ACTIONS = [
  {
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    label:'Resumir', action:'summarize'
  },
  {
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    label:'Momentos', action:'moments'
  },
  {
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    label:'Explicar', action:'explain'
  },
  {
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    label:'Estudar', action:'study'
  },
];

function waitForVideo(cb) {
  const check = () => {
    const title = document.querySelector('h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata yt-formatted-string, #title h1');
    if(title) cb(); else setTimeout(check, 1500);
  };
  check();
}

function closePanel() {
  const p = document.getElementById('__claw_yt_panel__');
  if(p) {
    p.style.animation = 'none';
    p.style.opacity = '0';
    p.style.transform = 'translateX(12px) scale(.96)';
    p.style.transition = 'opacity .18s, transform .18s';
    setTimeout(() => p.remove(), 180);
  }
}

function injectBar() {
  if(document.getElementById('__claw_yt_bar_wrap__')) return;
  const target = document.querySelector('#above-the-fold, #info-contents, #meta');
  if(!target) return;

  const wrap = document.createElement('div');
  wrap.id = '__claw_yt_bar_wrap__';

  const bar = document.createElement('div');
  bar.id = '__claw_yt_bar__';

  ACTIONS.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'claw-yt-btn';
    btn.type = 'button';
    btn.innerHTML = `${a.icon} ${a.label}`;
    btn.addEventListener('click', () => ytAction(a.action));
    bar.appendChild(btn);
  });

  const closeBar = document.createElement('button');
  closeBar.id = '__claw_yt_close_bar__';
  closeBar.type = 'button';
  closeBar.title = 'Fechar barra Claw';
  closeBar.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  closeBar.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
    wrap.remove();
  });

  wrap.appendChild(bar);
  wrap.appendChild(closeBar);
  target.insertBefore(wrap, target.firstChild);
}

async function ytAction(action) {
  const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string, h1.ytd-watch-metadata yt-formatted-string, #title h1');
  const title   = titleEl?.textContent?.trim() || 'video';
  const desc    = document.querySelector('#description-inline-expander, #description, ytd-text-inline-expander')?.textContent?.trim()?.slice(0,2000) || '';
  const channel = document.querySelector('#channel-name a, ytd-channel-name a')?.textContent?.trim() || '';
  const captions= [...document.querySelectorAll('.ytp-caption-segment')].map(el=>el.textContent.trim()).filter(Boolean).join(' ').slice(0,2000);
  const comments= [...document.querySelectorAll('#content-text')].slice(0,5).map(c=>c.textContent.trim()).join('\n').slice(0,800);

  const context = [
    `Titulo: ${title}`,
    channel ? `Canal: ${channel}` : '',
    desc    ? `Descricao: ${desc}` : '',
    captions? `Transcricao: ${captions}` : '',
    comments? `Comentarios: ${comments}` : '',
  ].filter(Boolean).join('\n');

  const prompts = {
    summarize: `Resuma este video do YouTube em portugues brasileiro com topicos claros e organizados:\n\n${context}`,
    moments:   `Liste os 5-7 momentos ou topicos mais importantes deste video. Em portugues:\n\n${context}`,
    explain:   `Explique o conteudo deste video de forma simples e didatica em portugues:\n\n${context}`,
    study:     `Crie um guia de estudo completo deste video com topicos principais, conceitos-chave e perguntas de revisao. Em portugues:\n\n${context}`,
  };

  showYTPanel(`<div class="claw-yt-loading"><div class="claw-yt-spinner"></div> Analisando...</div>`);

  try {
    const result = await callGroq(prompts[action] || prompts.summarize);
    showYTPanel(result, title);
  } catch(err) {
    showYTPanel(`Erro: ${err.message || 'Falha na conexao'}`, title);
  }
}

function showYTPanel(content, title='') {
  // Remove old panel first
  const old = document.getElementById('__claw_yt_panel__');
  if(old) old.remove();

  const panel = document.createElement('div');
  panel.id = '__claw_yt_panel__';

  // Head
  const head = document.createElement('div');
  head.className = 'claw-yt-head';

  const headTitle = document.createElement('span');
  headTitle.className = 'claw-yt-head-title';
  headTitle.textContent = title
    ? `Claw · ${title.slice(0,30)}${title.length>30?'...':''}`
    : 'Claw · YouTube';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'claw-yt-close-btn';
  closeBtn.title = 'Fechar';
  closeBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  head.appendChild(headTitle);
  head.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'claw-yt-body';
  body.innerHTML = content;

  panel.appendChild(head);
  panel.appendChild(body);
  document.body.appendChild(panel);
}

function callGroq(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type:'GROQ_FETCH', 
      payload:{
        model: MODEL,
        messages:[{ role:'user', content: prompt.slice(0,4000) }],
        max_tokens: 900,
        temperature: 0.25
      }
    }, res => {
      if(chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if(!res?.ok) return reject(new Error(res?.error || 'Erro na API'));
      resolve(res.data?.choices?.[0]?.message?.content?.trim() || '');
    });
  });
}

// SPA observer
let lastUrl = location.href;
new MutationObserver(() => {
  if(location.href !== lastUrl){
    lastUrl = location.href;
    document.getElementById('__claw_yt_bar_wrap__')?.remove();
    document.getElementById('__claw_yt_panel__')?.remove();
    if(location.pathname === '/watch') setTimeout(() => waitForVideo(injectBar), 2000);
  }
}).observe(document.body, { childList:true, subtree:true });

if(location.pathname === '/watch') waitForVideo(injectBar);

})();
