/* CLAW — background.js v45 Advanced School OS | Emanuel Felipe
   · Proxy Groq
   · Agente IA livre — planeja e executa no Chrome
   · Re-injeta scripts
*/
'use strict';

const API_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = {
  AGENT:     'llama-3.3-70b-versatile',
  TRANSLATE: 'llama-3.1-8b-instant',
  VISION:    'meta-llama/llama-4-scout-17b-16e-instruct',
  REASON:    'openai/gpt-oss-120b',
  STUDY:     'openai/gpt-oss-120b',
  CREATIVE:  'llama-3.3-70b-versatile',
  FAST:      'openai/gpt-oss-20b',
};

/* Modelos disponíveis para seleção pelo usuário — IDs compatíveis com Groq/OpenAI Chat Completions.
   O roteador abaixo escolhe automaticamente o melhor pool por tipo de tarefa e faz fallback. */
const AVAILABLE_MODELS = [
  { id: 'auto',                                      label: 'Auto Router · melhor modelo por tarefa' },
  { id: 'openai/gpt-oss-120b',                       label: 'GPT-OSS 120B · raciocínio forte' },
  { id: 'llama-3.3-70b-versatile',                   label: 'Llama 3.3 70B · qualidade geral' },
  { id: 'openai/gpt-oss-20b',                        label: 'GPT-OSS 20B · ultra rápido' },
  { id: 'llama-3.1-8b-instant',                      label: 'Llama 3.1 8B · respostas rápidas' },
  { id: 'qwen/qwen3-32b',                            label: 'Qwen3 32B · matemática/raciocínio' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout · visão/long context' },
  { id: 'groq/compound-mini',                        label: 'Compound Mini · agente/ferramentas' },
  { id: 'groq/compound',                             label: 'Compound · agente avançado' },
  { id: 'gemma2-9b-it',                              label: 'Gemma 2 9B · leve' },
];

const MODEL_POOLS = Object.freeze({
  math: [
    'qwen/qwen3-32b',
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ],
  reason: [
    'openai/gpt-oss-120b',
    'qwen/qwen3-32b',
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ],
  agent: [
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'groq/compound-mini',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ],
  fast: [
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
  ],
  translate: [
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
  ],
  vision: [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
  ],
  general: [
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ],
});

const REQUEST_QUEUE = [];
let ACTIVE_AI_REQUESTS = 0;
const MAX_PARALLEL_AI_REQUESTS = 2;

async function withAiSlot(fn) {
  if (ACTIVE_AI_REQUESTS >= MAX_PARALLEL_AI_REQUESTS) {
    await new Promise(resolve => REQUEST_QUEUE.push(resolve));
  }
  ACTIVE_AI_REQUESTS++;
  try {
    return await fn();
  } finally {
    ACTIVE_AI_REQUESTS = Math.max(0, ACTIVE_AI_REQUESTS - 1);
    const next = REQUEST_QUEUE.shift();
    if (next) setTimeout(next, 80);
  }
}

function inferModelPurpose(payload = {}) {
  const explicit = String(payload.claw_purpose || payload.purpose || '').toLowerCase();
  if (MODEL_POOLS[explicit]) return explicit;
  const text = (payload.messages || [])
    .map(m => String(m?.content || ''))
    .join('\n')
    .toLowerCase()
    .slice(0, 5000);
  if (/imagem|screenshot|foto|visual|ocr|transcrev|leia a imagem|vision/.test(text)) return 'vision';
  if (/tradu[cz]|translate|idioma|language/.test(text)) return 'translate';
  if (/agente|json válido|openTab|navigate|clic|preench|formul|controle do google chrome|steps/.test(text)) return 'agent';
  if (/matem|calcule|cálculo|equação|fração|porcentagem|raiz|potência|geometria|álgebra|função|mmc|mdc|sequência numérica|sequencia numerica|expressão/.test(text)) return 'math';
  if (/racioc|questão|prova|enem|alternativas|resolva|explique|física|química|biologia|história|geografia|português|inglês|ciências/.test(text)) return 'reason';
  if ((payload.max_tokens || 0) <= 300 && !/explique|racioc|detalh|passo/.test(text)) return 'fast';
  return 'general';
}

function buildModelList(payload = {}) {
  const selected = payload.model || MODELS.AGENT;
  const purpose = inferModelPurpose(payload);
  const pool = MODEL_POOLS[purpose] || MODEL_POOLS.general;
  if (selected === 'auto') return [...new Set(pool)];
  return [...new Set([selected, ...pool, ...MODEL_POOLS.general])].filter(Boolean);
}

/* ════ API ROTATION / FALLBACK ESCOLAR ════════════════════
   Versão segura para GitHub: sem chaves fixas no código.
   O ciclo de fallback continua funcionando com as chaves salvas pelo usuário. */
const EMBEDDED_API_KEYS = Object.freeze([]);

const API_ROTATION_STATE = {
  index: 0,
  cooldownUntil: Object.create(null),
  lastErrors: Object.create(null),
};



/* ════ CORE SYSTEM LOGS / HEALTH ═══════════════════════════ */
const CLAW_LOG_LIMIT = 140;
const CLAW_CORE_VERSION = '47.1-github';

function redactKey(key) {
  const s = String(key || '');
  if (!s) return '';
  return s.length > 12 ? s.slice(0, 7) + '…' + s.slice(-4) : '***';
}

function safeMeta(meta = {}) {
  const out = {};
  for (const [k, v] of Object.entries(meta || {})) {
    if (/key|token|secret/i.test(k)) out[k] = redactKey(v);
    else out[k] = typeof v === 'string' ? v.slice(0, 500) : v;
  }
  return out;
}

function addCoreLog(level, text, meta = {}) {
  try {
    const item = { time: Date.now(), level: level || 'info', text: String(text || '').slice(0, 700), meta: safeMeta(meta) };
    chrome.storage.local.get(['claw_core_logs'], d => {
      const logs = Array.isArray(d.claw_core_logs) ? d.claw_core_logs : [];
      logs.push(item);
      while (logs.length > CLAW_LOG_LIMIT) logs.shift();
      chrome.storage.local.set({ claw_core_logs: logs });
    });
  } catch {}
}

async function getCoreStatus() {
  const keys = await getStoredApiKeys();
  const activeModel = await getActiveModel().catch(() => 'auto');
  const cooling = keys.map((key, i) => ({
    index: i + 1,
    key: redactKey(key),
    cooling: Math.max(0, Math.ceil(((API_ROTATION_STATE.cooldownUntil[key] || 0) - Date.now()) / 1000)),
    lastError: API_ROTATION_STATE.lastErrors[key] || ''
  }));
  const storage = await new Promise(resolve => chrome.storage.local.get([
    'claw_core_logs','claw_history','claw_kahoot_cache_v45','claw_kahoot_cache_v43','stopots_cache','claw_study_memory','claw_flashcards'
  ], resolve));
  return {
    ok: true,
    version: CLAW_CORE_VERSION,
    activeModel,
    apiCount: keys.length,
    nextApi: (API_ROTATION_STATE.index % Math.max(keys.length, 1)) + 1,
    cooling,
    logs: (storage.claw_core_logs || []).slice(-25).reverse(),
    historyCount: (storage.claw_history || []).length,
    kahootCache: Object.keys(storage.claw_kahoot_cache_v45 || storage.claw_kahoot_cache_v43 || {}).length,
    stopotsCache: Object.keys(storage.stopots_cache || {}).length,
    memoryCount: (storage.claw_study_memory || []).length,
    flashcardsCount: (storage.claw_flashcards || []).length,
    queue: { active: ACTIVE_AI_REQUESTS, waiting: REQUEST_QUEUE.length }
  };
}

const RETRYABLE_STATUS = new Set([401, 403, 408, 409, 429, 500, 502, 503, 504]);
const MODEL_FALLBACKS = Object.freeze(MODEL_POOLS.general);

function normalizeApiKeys(value) {
  const arr = Array.isArray(value) ? value : String(value || '').split(/[\s,;]+/g);
  const seen = new Set();
  return arr.map(v => String(v || '').trim())
    .filter(v => /^gsk_[A-Za-z0-9_-]{20,}$/.test(v))
    .filter(v => (seen.has(v) ? false : (seen.add(v), true)));
}

async function getStoredApiKeys() {
  return new Promise(resolve => {
    chrome.storage.local.get(['claw_api_key', 'claw_api_keys'], d => {
      const saved = [
        ...normalizeApiKeys(d.claw_api_key),
        ...normalizeApiKeys(d.claw_api_keys),
      ];
      resolve(normalizeApiKeys([...saved]));
    });
  });
}

async function getStoredApiKey() {
  const keys = await getStoredApiKeys();
  return keys[0] || '';
}

function isKeyCooling(key) {
  return (API_ROTATION_STATE.cooldownUntil[key] || 0) > Date.now();
}

function markKeyProblem(key, status, message) {
  const msg = String(message || 'erro');
  API_ROTATION_STATE.lastErrors[key] = `${status || ''} ${msg}`.trim();
  const lower = msg.toLowerCase();
  let cooldown = 45_000;
  if (status === 429 || /rate|quota|limit|limite|too many|capacity/.test(lower)) cooldown = 10 * 60_000;
  if (status === 401 || status === 403 || /invalid|unauthorized|forbidden|auth|api key/.test(lower)) cooldown = 60 * 60_000;
  if (status >= 500) cooldown = 90_000;
  API_ROTATION_STATE.cooldownUntil[key] = Date.now() + cooldown;
}

function shouldFallbackModel(status, message) {
  const m = String(message || '').toLowerCase();
  return status === 400 || status === 404 || /model|decommission|not found|does not exist|unsupported/.test(m);
}

async function responseToError(res) {
  let body = '';
  try { body = await res.text(); } catch {}
  let parsed = null;
  try { parsed = JSON.parse(body); } catch {}
  const message = parsed?.error?.message || parsed?.message || body.slice(0, 500) || `HTTP ${res.status}`;
  return { status: res.status, message };
}

async function requestGroq(payload, options = {}) {
  return withAiSlot(() => requestGroqCore(payload, options));
}

async function requestGroqCore(payload, options = {}) {
  const keys = await getStoredApiKeys();
  if (!keys.length) throw new Error('Nenhuma API key configurada para a IA.');
  const models = buildModelList(payload || {});
  const errors = [];

  for (const model of models) {
    const start = API_ROTATION_STATE.index % keys.length;
    let triedAnyLiveKey = false;

    for (let i = 0; i < keys.length; i++) {
      const idx = (start + i) % keys.length;
      const key = keys[idx];
      if (isKeyCooling(key)) continue;
      triedAnyLiveKey = true;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 45_000);
      try {
        const bodyPayload = { ...payload, model };
        delete bodyPayload.claw_purpose;
        delete bodyPayload.purpose;
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          API_ROTATION_STATE.index = (idx + 1) % keys.length;
          addCoreLog('ok', 'IA respondeu com sucesso', { model, api: idx + 1, purpose: inferModelPurpose(payload || {}) });
          return { res, keyIndex: idx, model };
        }

        const err = await responseToError(res);
        errors.push(`API #${idx + 1}/${model}: ${err.message}`);
        addCoreLog('warn', 'Falha de API/modelo', { model, api: idx + 1, status: err.status, message: err.message });
        if (shouldFallbackModel(err.status, err.message)) break;
        if (RETRYABLE_STATUS.has(err.status)) {
          markKeyProblem(key, err.status, err.message);
          continue;
        }
        throw new Error(err.message);
      } catch (e) {
        clearTimeout(timeout);
        const msg = e?.name === 'AbortError' ? 'timeout da IA' : (e?.message || 'erro de conexão');
        errors.push(`API #${idx + 1}/${model}: ${msg}`);
        addCoreLog('error', 'Erro de conexão/timeout', { model, api: idx + 1, message: msg });
        markKeyProblem(key, 0, msg);
      }
    }

    if (!triedAnyLiveKey && keys.length) {
      const first = keys[API_ROTATION_STATE.index % keys.length];
      delete API_ROTATION_STATE.cooldownUntil[first];
    }
  }

  throw new Error(errors.slice(-6).join(' | ') || 'Todas as APIs/modelos falharam.');
}

async function buildAuthHeaders() {
  const key = await getStoredApiKey();
  if (!key) throw new Error('Nenhuma API key configurada para a IA.');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` };
}


/* Carrega modelo preferido do storage */
async function getActiveModel(){
  return new Promise(r => {
    chrome.storage.sync.get(['claw_model'], d => {
      r(d.claw_model || 'auto');
    });
  });
}

/* ════ SYSTEM PROMPT ══════════════════════════════════════ */
const SYS = `Você é o Claw, o agente de IA mais avançado para controle do Google Chrome. Você é inteligente, proativo e executa tarefas com precisão cirúrgica. Fala sempre em português brasileiro.

REGRA ABSOLUTA: Responda APENAS com JSON válido. Zero texto fora do JSON. Sem markdown, sem explicações, só JSON.

COMPORTAMENTO INTELIGENTE:
- Seja proativo: antecipe o que o usuário quer, não só o que pediu literalmente
- Para abrir qualquer app/site: use SEMPRE openTab (nunca navigate para novos sites)
- Para YouTube, Netflix, Spotify, etc: abra DIRETAMENTE o app correto
- Se o usuário pedir algo vago como "abre música", abra o Spotify
- Se pedir "vídeo de X", abra YouTube pesquisando X
- Sempre confirme o que fez de forma amigável e concisa
- Quando não tiver certeza do seletor, tente múltiplas abordagens

FORMATO OBRIGATÓRIO:
{
  "thought": "raciocínio rápido interno",
  "reply": "resposta amigável ao usuário em pt-BR",
  "steps": [
    { "action": "nome_da_acao", "args": [...], "wait": 0 }
  ]
}

FORMATO:
{
  "thought": "raciocínio interno (breve)",
  "reply": "mensagem ao usuário em português",
  "steps": [
    { "action": "nome_da_acao", "args": [...], "wait": 0 }
  ]
}

REGRAS CRÍTICAS:
1. Para abrir sites use "openTab" (NÃO "navigate" — navigate recarrega a aba atual)
2. Para pesquisar use openTab com URL do Google/YouTube
3. Para interagir com elementos DA PÁGINA ATUAL use as outras ações
4. "wait" em ms — use 1500 após navigate/openTab para aguardar carregamento
5. Se for só conversa/pergunta: steps = []

AÇÕES DISPONÍVEIS:

NAVEGAÇÃO:
openTab(url)         → abre URL em nova aba (use para sites, não recarrega a aba atual)
navigate(url)        → navega na aba atual (use só quando quiser sair da página atual)
back()               → voltar
forward()            → avançar
reload()             → recarregar
scrollTo(y)          → rolar para y pixels
scrollBy(dy)         → rolar dy pixels (positivo=baixo, negativo=cima)
scrollTop()          → ir ao topo
scrollBottom()       → ir ao fim

INTERAÇÃO:
click(desc)          → clicar em elemento (busca por texto, aria-label, placeholder, id, css)
clickAt(x,y)         → clicar em coordenadas
dblclick(desc)       → duplo clique
rightclick(desc)     → clique direito
hover(desc)          → hover
focus(desc)          → focar
type(desc,value)     → digitar valor em input/textarea
typeKeys(text)       → digitar no elemento focado
append(desc,text)    → adicionar texto a um input existente
clear(desc)          → limpar input
pressKey(key)        → pressionar tecla (Enter, Tab, Escape, ArrowDown, F5...)
hotkey(keys)         → atalho ex: "ctrl+a", "ctrl+c", "ctrl+v"
submit(desc?)        → submeter formulário
select(desc,value)   → escolher opção em <select>
check(desc,bool)     → marcar/desmarcar checkbox
fillForm(obj)        → preencher múltiplos campos: {"campo1":"valor1","campo2":"valor2"}

LEITURA:
getText(desc)        → texto de um elemento
getPageText()        → texto completo da página
getTitle()           → título
getUrl()             → URL atual
getAttr(desc,attr)   → atributo HTML
countElements(sel)   → contar por seletor CSS
extractLinks()       → todos os links
extractImages()      → todas as imagens
extractTable(desc?)  → tabela como texto
extractInputs()      → todos os inputs
getPageInfo()        → info completa da página (url,title,inputs,links...)

DOM:
injectCSS(css)       → injetar CSS
removeCSS()          → remover CSS injetado
injectScript(code)   → executar JavaScript
removeElement(desc)  → remover elemento
hideElement(desc)    → ocultar
showElement(desc)    → mostrar
setAttribute(d,a,v)  → setar atributo
setStyle(d,prop,val) → setar estilo
highlight(desc)      → destacar com borda laranja (3s)

UTILIDADES:
copyText(text)       → copiar para clipboard
pasteText()          → ler clipboard
setStorage(k,v)      → localStorage
getStorage(k)        → ler localStorage
showNotification(msg,type) → notificação (info/success/warning/error)
wait(ms)             → aguardar ms milissegundos

EXEMPLOS:
"abre youtube" → [{"action":"openTab","args":["https://youtube.com"]}]
"pesquisa bolo" → [{"action":"openTab","args":["https://google.com/search?q=bolo"]}]
"clica em Login" → [{"action":"click","args":["Login"]}]
"digita meu email" → [{"action":"type","args":["email","meu@email.com"]}]
"extrai links" → [{"action":"extractLinks","args":[]}]
"remove anúncios" → [{"action":"injectCSS","args":["[class*='ad'],[id*='ad'],[class*='banner'],[class*='popup']{display:none!important}"]}]
"rola para baixo" → [{"action":"scrollBy","args":[400]}]
"preenche form" → [{"action":"fillForm","args":[{"nome":"Emanuel","email":"e@g.com"}]},{"action":"submit","args":[]}]`;

/* ════ SITES ══════════════════════════════════════════════ */
const SITES = {
  'youtube':'https://youtube.com','instagram':'https://instagram.com',
  'twitter':'https://twitter.com','x':'https://x.com',
  'tiktok':'https://tiktok.com','facebook':'https://facebook.com',
'telegram':'https://web.telegram.org',
  'discord':'https://discord.com/app','reddit':'https://reddit.com',
  'twitch':'https://twitch.tv',
  'gmail':'https://mail.google.com','drive':'https://drive.google.com',
  'google drive':'https://drive.google.com','docs':'https://docs.google.com',
  'sheets':'https://sheets.google.com','slides':'https://slides.google.com',
  'forms':'https://forms.google.com','meet':'https://meet.google.com',
  'maps':'https://maps.google.com','calendar':'https://calendar.google.com',
  'translate':'https://translate.google.com',
  'github':'https://github.com','figma':'https://figma.com',
  'netflix':'https://netflix.com','prime':'https://primevideo.com',
  'disney':'https://disneyplus.com','disney+':'https://disneyplus.com',
  'spotify':'https://open.spotify.com','globoplay':'https://globoplay.globo.com',
  'max':'https://max.com','crunchyroll':'https://crunchyroll.com',
  'chatgpt':'https://chatgpt.com','claude':'https://claude.ai',
  'gemini':'https://gemini.google.com','perplexity':'https://perplexity.ai',
  'amazon':'https://amazon.com.br','shopee':'https://shopee.com.br',
  'mercado livre':'https://mercadolivre.com.br','ml':'https://mercadolivre.com.br',
  'ifood':'https://ifood.com.br','nubank':'https://nubank.com.br',
  'google':'https://google.com','bing':'https://bing.com',
  'wikipedia':'https://pt.wikipedia.org','kahoot':'https://kahoot.it',
  'stopots':'https://stopots.com',
  'trello':'https://trello.com','slack':'https://slack.com',
  'zoom':'https://zoom.us','steam':'https://store.steampowered.com',
  'magalu':'https://magazineluiza.com.br','aliexpress':'https://aliexpress.com',
  'pinterest':'https://pinterest.com','bluesky':'https://bsky.app',
  'deezer':'https://deezer.com','outlook':'https://outlook.live.com',
  'onedrive':'https://onedrive.live.com','keep':'https://keep.google.com',
  'classroom':'https://classroom.google.com','rappi':'https://rappi.com.br',
  'airbnb':'https://airbnb.com.br','booking':'https://booking.com',
  'g1':'https://g1.globo.com','uol':'https://uol.com.br',
  'americanas':'https://americanas.com.br','casas bahia':'https://casasbahia.com.br',
  'shein':'https://shein.com.br','kick':'https://kick.com',
  'kwai':'https://kwai.com','x':'https://x.com',
  'hotmail':'https://outlook.live.com','stackoverflow':'https://stackoverflow.com',
  'stack overflow':'https://stackoverflow.com','mdn':'https://developer.mozilla.org',
  'codepen':'https://codepen.io','vercel':'https://vercel.com',
  'netlify':'https://netlify.com','leetcode':'https://leetcode.com',
  'uber':'https://m.uber.com','nubank':'https://nubank.com.br',
  'inter':'https://bancointer.com.br','itau':'https://itau.com.br',
  'band':'https://band.com.br','r7':'https://r7.com',
  'terra':'https://terra.com.br','waze':'https://waze.com',
  'animefire':'https://animefire.plus','crunchyroll':'https://crunchyroll.com',
};



const SCHOOL_SEARCH_ENGINES = {
  'spotify': q => `https://open.spotify.com/search/${E(q)}`,
  'youtube': q => `https://youtube.com/results?search_query=${E(q)}`,
  'google': q => `https://google.com/search?q=${E(q)}`,
  'wikipedia': q => `https://pt.wikipedia.org/wiki/Special:Search?search=${E(q)}`,
  'khan': q => `https://www.khanacademy.org/search?page_search_query=${E(q)}`,
  'khan academy': q => `https://www.khanacademy.org/search?page_search_query=${E(q)}`,
  'classroom': q => `https://classroom.google.com/`,
  'drive': q => `https://drive.google.com/drive/search?q=${E(q)}`,
  'docs': q => `https://docs.google.com/document/u/0/?q=${E(q)}`,
  'translate': q => `https://translate.google.com/?sl=auto&tl=pt&text=${E(q)}&op=translate`,
  'tradutor': q => `https://translate.google.com/?sl=auto&tl=pt&text=${E(q)}&op=translate`,
};

const E = encodeURIComponent;

/* ════ GROQ ════════════════════════════════════════════════ */
async function callGroq(model, messages, maxTokens=2048, temp=0.15, purpose='auto') {
  const { res } = await requestGroq({ model, messages, max_tokens:maxTokens, temperature:temp, claw_purpose:purpose });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/* ════ PARSE RÁPIDO (sem IA) ═══════════════════════════════ */
function quickParse(text) {
  const low = text.toLowerCase().trim();

  // Abre múltiplos sites
  const openRx = /^(?:abr[ae]r?|abre|abrir|vai|acessa|acessar|entra|entrar|ir para|vai para|navega|navegar|ir ao|vai ao|mostra|mostrar|vou ao|coloca|colocar)\s+(.+)/i;
  const openM  = low.match(openRx);
  if (openM) {
    const parts = openM[1].split(/\s+e\s+|\s*,\s*/i).map(s=>s.trim());
    const urls  = parts.map(p=>{
      const url = SITES[p];
      if (url) return url;
      if (/^https?:\/\//i.test(p)) return p;
      if (/^www\./i.test(p)) return 'https://'+p;
      return null;
    }).filter(Boolean);
    if (urls.length > 0) {
      return {
        reply: urls.length===1 ? `Abrindo ${parts[0]}...` : `Abrindo ${urls.length} sites!`,
        steps: urls.map(url=>({action:'openTab',args:[url]}))
      };
    }
  }

  // Site direto
  const directUrl = SITES[low];
  if (directUrl) return { reply:`Abrindo ${low}...`, steps:[{action:'openTab',args:[directUrl]}] };

  // URL direta
  if (/^https?:\/\//i.test(low)) return { reply:`Abrindo ${low}...`, steps:[{action:'openTab',args:[low]}] };

  // YouTube
  const ytM = low.match(/^(?:youtube|coloca|toca|play)\s+(.+?)(?:\s+no youtube)?$/i);
  if (ytM) {
    const q = ytM[1].trim();
    return { reply:`YouTube: "${q}"`, steps:[{action:'openTab',args:[`https://youtube.com/results?search_query=${E(q)}`]}] };
  }

  // Pesquisa em site específico
  const inM = low.match(/^(?:pesquisa|busca|procura)\s+(.+?)\s+n[ao]\s+(.+)/i);
  if (inM) {
    const q=inM[1].trim(), site=inM[2].trim();
    const eng = {
      ...SCHOOL_SEARCH_ENGINES,
      youtube:  q=>`https://youtube.com/results?search_query=${E(q)}`,
      google:   q=>`https://google.com/search?q=${E(q)}`,
      amazon:   q=>`https://amazon.com.br/s?k=${E(q)}`,
      shopee:   q=>`https://shopee.com.br/search?keyword=${E(q)}`,
      'mercado livre':q=>`https://lista.mercadolivre.com.br/${E(q)}`,
      github:   q=>`https://github.com/search?q=${E(q)}`,
      wikipedia:q=>`https://pt.wikipedia.org/wiki/Special:Search?search=${E(q)}`,
    };
    const fn = eng[site]||eng[site.split(' ')[0]];
    if (fn) return { reply:`Pesquisando "${q}" no ${site}...`, steps:[{action:'openTab',args:[fn(q)]}] };
  }

  // Pesquisa geral
  const srM = low.match(/^(?:pesquisa|busca|procura|googla|google)\s+(.+)/i);
  if (srM) {
    const q = srM[1].trim();
    return { reply:`Pesquisando "${q}"...`, steps:[{action:'openTab',args:[`https://google.com/search?q=${E(q)}`]}] };
  }

  return null; // precisa da IA
}

/* ════ INJETA AGENTE E ESPERA ═════════════════════════════ */
async function injectAgent(tabId) {
  await chrome.scripting.executeScript({ target:{tabId}, files:['ai_agent.js'] });
  await new Promise(r=>setTimeout(r,150));
}

/* ════ LÊ CONTEXTO DA PÁGINA ═════════════════════════════ */
async function readPage(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url?.startsWith('chrome')||tab.url?.startsWith('about')) {
      return { url:tab.url, title:tab.title||'', text:'', inputs:'', links:'', forms:0 };
    }
    await injectAgent(tabId);
    return await Promise.race([
      new Promise(resolve=>{
        chrome.tabs.sendMessage(tabId,{type:'AGENT_READ'},r=>{
          resolve(r||{url:tab.url,title:tab.title||'',text:'',inputs:'',links:'',forms:0});
        });
      }),
      new Promise(r=>setTimeout(()=>r({url:tab.url,title:tab.title||'',text:'',inputs:'',links:'',forms:0}),2000))
    ]);
  } catch(e) {
    return {url:'',title:'',text:'',inputs:'',links:'',forms:0};
  }
}

/* ════ EXECUTA STEPS ═════════════════════════════════════ */
async function execSteps(steps, tabId) {
  const results = [];

  for (const step of (steps||[])) {
    const { action, args=[], wait=0 } = step;

    try {
      /* openTab — abre nova aba */
      if (action === 'openTab') {
        let url = args[0]||'https://google.com';
        if (!url.startsWith('http')) url = 'https://'+url;
        const newTab = await chrome.tabs.create({url, active:true});
        results.push(`✓ Aberto: ${url}`);
        if (wait>0) await new Promise(r=>setTimeout(r,wait));
        // Atualiza tabId para a nova aba nas próximas ações
        tabId = newTab.id;
        continue;
      }

      /* navigate — muda URL da aba atual */
      if (action === 'navigate') {
        let url = args[0]||'';
        if (url.startsWith('chrome://')||url.startsWith('about:')) {
          results.push(`⚠️ URL bloqueada: ${url}`);
          continue;
        }
        if (!url.startsWith('http')) url = 'https://'+url;
        await chrome.tabs.update(tabId, {url});
        // Aguarda a página carregar
        await new Promise(resolve=>{
          const timeout = setTimeout(()=>resolve(), Math.max(wait||0, 1500));
          const listener = (updTabId, info) => {
            if (updTabId===tabId && info.status==='complete') {
              clearTimeout(timeout);
              chrome.tabs.onUpdated.removeListener(listener);
              setTimeout(resolve, 300);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
        results.push(`✓ Navegando: ${url}`);
        continue;
      }

      /* Outras ações — executa via ai_agent.js na aba */
      const tab = await chrome.tabs.get(tabId);
      if (tab.url?.startsWith('chrome')||tab.url?.startsWith('about')) {
        results.push(`⚠️ "${action}" não disponível nesta página`);
        continue;
      }

      await injectAgent(tabId);

      const result = await Promise.race([
        new Promise(resolve=>{
          chrome.tabs.sendMessage(tabId,{type:'AGENT_ACTION',action,args},r=>{
            if (chrome.runtime.lastError) resolve(`❌ ${chrome.runtime.lastError.message}`);
            else resolve(r?.result||`✓ ${action}`);
          });
        }),
        new Promise(r=>setTimeout(()=>r(`⏱ ${action} (timeout)`),6000))
      ]);

      results.push(result);
      if (wait>0) await new Promise(r=>setTimeout(r,wait));

    } catch(e) {
      results.push(`❌ ${action}: ${e.message}`);
    }
  }

  return results;
}

/* ════ AGENTE PRINCIPAL ══════════════════════════════════ */
async function runAgent(userText, tabId, sendResponse) {
  try {
    // 1. Tenta parse rápido sem IA
    const quick = quickParse(userText);
    if (quick) {
      const results = await execSteps(quick.steps, tabId);
      sendResponse({ok:true, reply:quick.reply, results});
      return;
    }

    // 2. Lê contexto da página
    const ctx = await readPage(tabId);

    // 3. Monta prompt com contexto
    const contextStr = [
      `URL: ${ctx.url||'(nova aba)'}`,
      `Título: ${ctx.title||''}`,
      ctx.inputs ? `Inputs:\n${ctx.inputs}` : '',
      ctx.text   ? `Texto da página:\n${ctx.text.slice(0,1000)}` : '',
      `\nPedido: ${userText}`,
    ].filter(Boolean).join('\n');

    // 4. Chama IA com modelo selecionado pelo usuário
    const activeModel = await getActiveModel();
    const raw = await callGroq(activeModel, [
      { role:'system', content:SYS },
      { role:'user',   content:contextStr }
    ]);

    // 5. Parse JSON
    let plan = { reply:'Feito!', steps:[] };
    try {
      const clean = raw
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // remove think do DeepSeek
        .replace(/```json\n?|\n?```/g, '')
        .trim();
      const match = clean.match(/\{[\s\S]*\}/);
      plan = JSON.parse(match?.[0] || clean);
    } catch(e) {
      // IA retornou texto puro, não JSON — trata como resposta
      plan = { reply: raw.replace(/<think>[\s\S]*?<\/think>/gi,'').trim(), steps:[] };
    }

    // 6. Executa
    const results = await execSteps(plan.steps||[], tabId);

    sendResponse({ ok:true, reply:plan.reply||'Feito!', results });

  } catch(e) {
    sendResponse({ ok:false, reply:`❌ ${e.message}`, results:[] });
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active:true, currentWindow:true });
  return tabs?.[0] || null;
}

async function executeCommanderCommand(cmd, sendResponse) {
  if (!cmd) {
    sendResponse({ success:false, msg:'Não entendi o comando.' });
    return;
  }

  try {
    if (cmd.action === 'open') {
      for (const url of (cmd.urls || [])) {
        await chrome.tabs.create({ url, active:true });
      }
      const label = cmd.fallback ? 'Pesquisa iniciada.' : (cmd.urls?.length > 1 ? `Abrindo ${cmd.urls.length} abas!` : `Abrindo: ${cmd.urls?.[0] || ''}`);
      sendResponse({ success:true, msg:label });
      return;
    }

    if (cmd.action === 'new_tab') {
      await chrome.tabs.create({ url:'chrome://newtab/', active:true });
      sendResponse({ success:true, msg:'Nova aba aberta!' });
      return;
    }

    const tab = await getActiveTab();
    if (!tab?.id) {
      sendResponse({ success:false, msg:'Nenhuma aba ativa encontrada.' });
      return;
    }

    if (cmd.action === 'close_tab') {
      await chrome.tabs.remove(tab.id);
      sendResponse({ success:true, msg:'Aba fechada!' });
      return;
    }

    if (cmd.action === 'reload') {
      await chrome.tabs.reload(tab.id);
      sendResponse({ success:true, msg:'Página recarregada!' });
      return;
    }

    if (cmd.action === 'back') {
      await chrome.scripting.executeScript({ target:{ tabId: tab.id }, func: () => history.back() });
      sendResponse({ success:true, msg:'Voltando...' });
      return;
    }

    if (cmd.action === 'scroll') {
      await chrome.scripting.executeScript({
        target:{ tabId: tab.id },
        func: (direction) => window.scrollBy({ top: direction === 'down' ? 400 : -400, behavior:'smooth' }),
        args:[cmd.direction]
      });
      sendResponse({ success:true, msg:cmd.direction === 'down' ? 'Rolando para baixo...' : 'Rolando para cima...' });
      return;
    }

    sendResponse({ success:false, msg:'Comando não reconhecido.' });
  } catch (e) {
    sendResponse({ success:false, msg:e?.message || 'Falha ao executar comando.' });
  }
}


/* ════ CORE STUDY ACTIONS ═════════════════════════════════ */
async function getActiveReadablePage() {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error('Nenhuma aba ativa encontrada.');
  const ctx = await readPage(tab.id);
  return { tab, ctx };
}

function clipText(text, max = 6000) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function generateCoreStudy(kind, input = {}) {
  const { tab, ctx } = await getActiveReadablePage();
  const selectedText = clipText(input.text || ctx.text || '', 7000);
  const topic = clipText(input.topic || '', 300);
  const title = ctx.title || tab.title || '';
  const url = ctx.url || tab.url || '';
  let memoryContext = '';
  if (kind === 'review') {
    const d = await new Promise(resolve => chrome.storage.local.get(['claw_study_memory','claw_history','claw_core_logs'], resolve));
    const mem = (d.claw_study_memory || []).slice(-12).map(x => `[${x.kind}] ${x.text}`).join('\n---\n');
    const hist = (d.claw_history || []).slice(-20).map(x => `${x.type || 'item'}: ${x.text || x.question || ''} ${x.answer ? '=> '+x.answer : ''}`).join('\n');
    memoryContext = `\nMemória recente do Claw:\n${mem || '(vazia)'}\n\nHistórico recente:\n${hist || '(vazio)'}`;
  }
  const base = `Título: ${title}\nURL: ${url}\nTópico pedido: ${topic || '(não informado)'}\nTexto/contexto:\n${selectedText || '(sem texto legível)'}${memoryContext}`;

  const prompts = {
    analyze: 'Faça uma análise escolar objetiva da página: resumo, conceitos importantes, possíveis perguntas, respostas curtas e pontos para revisar. Não faça ações automáticas em avaliações.',
    flashcards: 'Crie 8 a 12 flashcards de estudo no formato Q: pergunta / A: resposta, com respostas curtas e úteis.',
    plan: 'Crie um plano de estudo prático com Pomodoro, prioridades, revisão e exercícios. Seja direto e aplicável.',
    review: 'Analise o histórico/memória do Claw e indique pontos fracos, próximas revisões e um mini plano de treino.'
  };
  const task = prompts[kind] || prompts.analyze;
  const result = await callGroq('auto', [
    { role: 'system', content: 'Você é o Core Escolar do Claw. Ajude o aluno a estudar de forma honesta, clara e eficiente. Responda em português brasileiro com seções curtas.' },
    { role: 'user', content: `${task}\n\n${base}` }
  ], kind === 'flashcards' ? 1600 : 1800, 0.25, kind === 'plan' ? 'reason' : 'study');

  addCoreLog('info', 'Core Study executado', { kind, title: title.slice(0, 120) });
  return { ok: true, text: result, title, url };
}

async function saveStudyMemory(kind, text, meta = {}) {
  const item = { kind, text: String(text || '').slice(0, 2000), meta: safeMeta(meta), time: Date.now() };
  return new Promise(resolve => chrome.storage.local.get(['claw_study_memory'], d => {
    const mem = Array.isArray(d.claw_study_memory) ? d.claw_study_memory : [];
    mem.push(item);
    while (mem.length > 300) mem.shift();
    chrome.storage.local.set({ claw_study_memory: mem }, () => resolve(item));
  }));
}

/* ════ LISTENERS ══════════════════════════════════════════ */
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'MODELS_GET') {
    reply({ models: AVAILABLE_MODELS });
    return false;
  }

  if (msg.type === 'MODEL_SET') {
    chrome.storage.sync.set({ claw_model: msg.model }, () => reply({ ok: true }));
    return true;
  }

  if (msg.type === 'PING') { reply({ok:true}); return false; }


  if (msg.type === 'CORE_STATUS') {
    getCoreStatus().then(reply).catch(e => reply({ ok:false, error:e.message }));
    return true;
  }

  if (msg.type === 'CORE_LOGS_CLEAR') {
    chrome.storage.local.set({ claw_core_logs: [] }, () => reply({ ok:true }));
    return true;
  }

  if (msg.type === 'CORE_PAGE_ANALYZE' || msg.type === 'CORE_FLASHCARDS' || msg.type === 'CORE_STUDY_PLAN' || msg.type === 'CORE_REVIEW') {
    const map = { CORE_PAGE_ANALYZE:'analyze', CORE_FLASHCARDS:'flashcards', CORE_STUDY_PLAN:'plan', CORE_REVIEW:'review' };
    generateCoreStudy(map[msg.type], msg.payload || {}).then(async out => {
      await saveStudyMemory(map[msg.type], out.text, { title: out.title, url: out.url });
      reply(out);
    }).catch(e => reply({ ok:false, error:e.message }));
    return true;
  }

  if (msg.type === 'CORE_MEMORY_GET') {
    chrome.storage.local.get(['claw_study_memory','claw_flashcards'], d => reply({ ok:true, memory:d.claw_study_memory || [], flashcards:d.claw_flashcards || [] }));
    return true;
  }

  if (msg.type === 'CORE_MEMORY_CLEAR') {
    chrome.storage.local.set({ claw_study_memory: [], claw_flashcards: [] }, () => reply({ ok:true }));
    return true;
  }

  if (msg.type === 'COMMANDER_EXECUTE') {
    executeCommanderCommand(msg.command, reply);
    return true;
  }

  /* Proxy Groq — todos os scripts usam isso */
  if (msg.type === 'GROQ_FETCH') {
    (async () => {
      try {
        const { res, keyIndex, model } = await requestGroq(msg.payload || {});
        const data = await res.json();
        reply({ok:true, data, keyIndex, model});
      } catch (err) {
        reply({ok:false, error:err.message});
      }
    })();
    return true;
  }

  /* Streaming Groq — envia chunks via tabs.sendMessage */
  if (msg.type === 'GROQ_STREAM') {
    chrome.tabs.query({active:true, currentWindow:true}, async ([tab]) => {
      const streamId = msg.streamId;
      try {
        const { res } = await requestGroq({ ...(msg.payload || {}), stream: true });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while(true){
          const { done, value } = await reader.read();
          if(done) break;
          buffer += decoder.decode(value, {stream:true});
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for(const line of lines){
            if(!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if(data === '[DONE]'){
              chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta  = parsed.choices?.[0]?.delta?.content||'';
              if(delta) chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, delta, done:false });
            } catch{}
          }
        }
        chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
      } catch(e){
        chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, error:e.message, done:true });
      }
    });
    reply({ok:true});
    return true;
  }

  /* AGENT_STREAM — popup usa este tipo para streaming de chat */
  if (msg.type === 'AGENT_STREAM') {
    const streamId = msg.streamId;
    const messages = msg.messages;
    chrome.storage.sync.get(['claw_model'], async (d) => {
      const model = d.claw_model || 'auto';
      try {
        // Tenta streaming com rotação automática de API/modelo; se falhar, cai para resposta normal.
        let res;
        try {
          ({ res } = await requestGroq({ model, messages, max_tokens:2048, temperature:0.5, stream:true, claw_purpose:'agent' }));
        } catch(fetchErr) {
          console.error('[Claw] Stream failed, trying non-stream with rotation:', fetchErr.message);
          try {
            const out2 = await requestGroq({ model, messages, max_tokens:2048, temperature:0.5, claw_purpose:'agent' });
            const data2 = await out2.res.json();
            const content = data2.choices?.[0]?.message?.content||'';
            if(content) chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, delta:content, done:false });
            chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
          } catch(e2) {
            chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, error:'Falha na conexão: '+e2.message, done:true });
          }
          return;
        }
        
        // Verifica se body é streamável
        if (!res.body || !res.body.getReader) {
          // Fallback: lê como JSON
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content||'';
          if(content) chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, delta:content, done:false });
          chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
          return;
        }
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let gotAny = false;
        while(true){
          const { done, value } = await reader.read();
          if(done) break;
          buffer += decoder.decode(value, {stream:true});
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for(const line of lines){
            if(!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if(data === '[DONE]'){
              chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta  = parsed.choices?.[0]?.delta?.content||'';
              if(delta) { chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, delta, done:false }); gotAny=true; }
            } catch{}
          }
        }
        chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, done:true });
      } catch(e){
        console.error('[Claw] AGENT_STREAM error:', e);
        chrome.runtime.sendMessage({ type:'STREAM_CHUNK', streamId, error:e.message||'Erro desconhecido', done:true });
      }
    });
    reply({ok:true});
    return true;
  }

  /* Personalidade — salvar/ler */
  if (msg.type === 'PERSONALITY_SET') {
    chrome.storage.sync.set({ claw_personality: msg.personality }, () => reply({ok:true}));
    return true;
  }
  if (msg.type === 'PERSONALITY_GET') {
    chrome.storage.sync.get(['claw_personality'], d => reply({ personality: d.claw_personality||'' }));
    return true;
  }

  /* Agente IA livre */
  if (msg.type === 'AGENT_RUN') {
    // Busca a aba real (não extensão, não popup) — a última ativa na janela atual
    chrome.tabs.query({currentWindow:true}, (tabs) => {
      // Prefere a aba ativa que não seja a extensão
      const realTab = tabs.find(t =>
        t.active &&
        t.url &&
        !t.url.startsWith('chrome-extension://') &&
        !t.url.startsWith('chrome://') &&
        !t.url.startsWith('about:')
      ) || tabs.slice().reverse().find(t =>
        t.url &&
        !t.url.startsWith('chrome-extension://') &&
        !t.url.startsWith('chrome://') &&
        !t.url.startsWith('about:')
      );
      if (!realTab) {
        // Nenhuma aba válida — abre nova aba e executa
        chrome.tabs.create({url:'about:blank', active:true}, (newTab) => {
          runAgent(msg.text||'', newTab.id, reply);
        });
        return;
      }
      runAgent(msg.text||'', realTab.id, reply);
    });
    return true;
  }

  /* Abre URL diretamente — chamado pelo popup via botão rápido */
  if (msg.type === 'OPEN_URL') {
    let url = msg.url || 'https://google.com';
    if (!url.startsWith('http')) url = 'https://' + url;
    chrome.tabs.create({url, active:true}, () => {
      reply({ok:true});
    });
    return true;
  }
});

/* ════ RE-INJETA SCRIPTS ══════════════════════════════════ */
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome') || tab.url.startsWith('about')) return;

  chrome.storage.sync.get([
    'claw_translate','tr_lang',
    'claw_summarize','claw_explain',
    'claw_anti','claw_study',
    'claw_kahoot','claw_stopots',
    'claw_stealth','claw_delay'
  ], d => {
    const inj = (files, m) => {
      chrome.scripting.executeScript({target:{tabId}, files}, () => {
        if (chrome.runtime.lastError) return;
        chrome.tabs.sendMessage(tabId, m, () => void chrome.runtime.lastError);
      });
    };
    if (d.claw_translate)                       inj(['translator.js'],  {type:'TR_ON', lang:d.tr_lang||'auto'});
    if (d.claw_summarize || d.claw_explain)     inj(['page_tools.js'],  {type:'TOOLS_ON', summarize:!!d.claw_summarize, explain:!!d.claw_explain});
    if (d.claw_anti)                            inj(['anti_detect.js'], {type:'ANTI_ON'});
    if (d.claw_study)                           inj(['study_mode.js'],  {type:'STUDY_ON'});
    /* Kahoot — só em kahoot.it */
    if (d.claw_kahoot && tab.url && tab.url.includes('kahoot.it')) {
      inj(['stats.js','cache.js','kahoot.js'], {type:'KAHOOT_ON', stealth:!!d.claw_stealth, delay:parseInt(d.claw_delay)||0});
    }
    /* StopotS — só em stopots.com */
    if (d.claw_stopots && tab.url && tab.url.includes('stopots.com')) {
      inj(['stats.js','stopots.js'], {type:'STOP_ON'});
    }
  });
});

chrome.runtime.onInstalled.addListener(() => console.log('[Claw] v45 Advanced School OS instalado'));

/* ═══ STUDY MODE RELAY ═══ */
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!['STUDY_TOGGLE','STUDY_ON','STUDY_OFF','STUDY_STATUS'].includes(msg.type)) return;
  chrome.tabs.query({active:true, currentWindow:true}, ([tab]) => {
    if(!tab?.id) {
      reply({ ok:false, error:'Nenhuma aba ativa encontrada.' });
      return;
    }
    chrome.scripting.executeScript({ target:{ tabId:tab.id }, files:['study_mode.js'] }, () => {
      chrome.tabs.sendMessage(tab.id, { type: msg.type }, res => {
        if (chrome.runtime.lastError) {
          reply({ ok:false, error:chrome.runtime.lastError.message });
          return;
        }
        reply(res || { ok:true });
      });
    });
  });
  return true;
});

/* ═══ VOICE — Offscreen relay ═══ */
let creatingOffscreen = false;

async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (contexts.length > 0) return;
  if (creatingOffscreen) return;
  creatingOffscreen = true;
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Speech recognition requires DOM access for Web Speech API'
    });
  } finally {
    creatingOffscreen = false;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  /* Popup requesting voice start/stop */
  if (msg.target === 'background' && msg.action === 'voiceStart') {
    ensureOffscreen().then(() => {
      chrome.runtime.sendMessage({ target: 'offscreen', action: 'startVoice', lang: msg.lang || 'pt-BR' });
    }).catch(e => {
      // relay error back to popup
      chrome.runtime.sendMessage({ target: 'popup', type: 'voiceError', error: 'Erro offscreen: ' + e.message });
    });
    reply({ ok: true });
    return false;
  }
  if (msg.target === 'background' && msg.action === 'voiceStop') {
    chrome.runtime.sendMessage({ target: 'offscreen', action: 'stopVoice' });
    reply({ ok: true });
    return false;
  }
  /* Offscreen relaying results back — forward to popup */
  if (msg.target === 'background' && msg.from === 'offscreen') {
    chrome.runtime.sendMessage({ target: 'popup', type: msg.type, listening: msg.listening, error: msg.error, transcript: msg.transcript, isFinal: msg.isFinal });
    return false;
  }
});
