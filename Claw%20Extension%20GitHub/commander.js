/* CLAW — commander.js v20
   Assistente de comandos por voz/texto.
   Faz o parse no content script e delega execucao ao background no MV3.
*/
(function(){
'use strict';

const SITES = {
  'youtube':'https://youtube.com','instagram':'https://instagram.com','twitter':'https://twitter.com','x':'https://x.com',
  'tiktok':'https://tiktok.com','facebook':'https://facebook.com','telegram':'https://web.telegram.org',
  'discord':'https://discord.com/app','reddit':'https://reddit.com','pinterest':'https://pinterest.com',
  'snapchat':'https://snapchat.com','twitch':'https://twitch.tv','gmail':'https://mail.google.com','google drive':'https://drive.google.com',
  'drive':'https://drive.google.com','docs':'https://docs.google.com','google docs':'https://docs.google.com','sheets':'https://sheets.google.com',
  'slides':'https://slides.google.com','google fotos':'https://photos.google.com','google maps':'https://maps.google.com','maps':'https://maps.google.com',
  'calendar':'https://calendar.google.com','google calendar':'https://calendar.google.com','trello':'https://trello.com',
  'github':'https://github.com','figma':'https://figma.com','netflix':'https://netflix.com','prime':'https://primevideo.com',
  'amazon prime':'https://primevideo.com','disney':'https://disneyplus.com','disney+':'https://disneyplus.com','spotify':'https://open.spotify.com',
  'deezer':'https://deezer.com','globoplay':'https://globoplay.globo.com','star+':'https://starplus.com','hbo':'https://max.com','max':'https://max.com',
  'crunchyroll':'https://crunchyroll.com','kahoot':'https://kahoot.it','stopots':'https://stopots.com','wikipedia':'https://pt.wikipedia.org','chatgpt':'https://chatgpt.com','claude':'https://claude.ai',
  'amazon':'https://amazon.com.br','mercado livre':'https://mercadolivre.com.br','shopee':'https://shopee.com.br','magalu':'https://magazineluiza.com.br',
  'americanas':'https://americanas.com.br','ifood':'https://ifood.com.br','google':'https://google.com','bing':'https://bing.com',
  'outlook':'https://outlook.live.com','onedrive':'https://onedrive.live.com','icloud':'https://icloud.com',
};

const SEARCH_ENGINES = {
  youtube: q => `https://youtube.com/results?search_query=${encodeURIComponent(q)}`,
  google: q => `https://google.com/search?q=${encodeURIComponent(q)}`,
  bing: q => `https://bing.com/search?q=${encodeURIComponent(q)}`,
  maps: q => `https://maps.google.com/search?q=${encodeURIComponent(q)}`,
  wikipedia: q => `https://pt.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
  twitter: q => `https://twitter.com/search?q=${encodeURIComponent(q)}`,
  reddit: q => `https://reddit.com/search?q=${encodeURIComponent(q)}`,
  amazon: q => `https://amazon.com.br/s?k=${encodeURIComponent(q)}`,
  shopee: q => `https://shopee.com.br/search?keyword=${encodeURIComponent(q)}`,
  'mercado livre': q => `https://lista.mercadolivre.com.br/${encodeURIComponent(q)}`,
};

function parseCommand(input) {
  const raw = String(input || '').trim().toLowerCase();
  if (!raw) return null;

  const openMulti = raw.match(/^(abr[ae]|vai|acessa|vai (para|pro|pra)|entra|ir para)\s+(.+)/i);
  if (openMulti) {
    const rest = openMulti[3].replace(/ e /gi, ',');
    const sites = rest.split(/[,]+/).map(s => s.trim()).filter(Boolean);
    const urls = sites.map(s => SITES[s.toLowerCase()]).filter(Boolean);
    if (urls.length > 0) return { action: 'open', urls };
  }

  const searchIn = raw.match(/(?:pesquisa|busca|procura|search)\s+(.+?)\s+no\s+(.+)/i);
  if (searchIn) {
    const query = searchIn[1].trim();
    const engine = searchIn[2].trim().toLowerCase();
    const fn = SEARCH_ENGINES[engine];
    if (fn) return { action: 'open', urls: [fn(query)] };
  }

  const search = raw.match(/^(?:pesquisa|busca|procura|search|googla|pesquisar)\s+(.+)/i);
  if (search) {
    const query = search[1].trim();
    return { action: 'open', urls: [`https://google.com/search?q=${encodeURIComponent(query)}`] };
  }

  const yt = raw.match(/^(?:coloca|toca|play|youtube)\s+(.+?)(?:\s+no youtube)?$/i);
  if (yt || raw.startsWith('youtube ')) {
    const query = (yt ? yt[1] : raw.replace('youtube ', '')).trim();
    return { action: 'open', urls: [SEARCH_ENGINES.youtube(query)] };
  }

  if (/fecha(r)?\s+(essa|a|esta)?\s*aba/i.test(raw)) return { action: 'close_tab' };
  if (/nova aba|aba nova/i.test(raw)) return { action: 'new_tab' };
  if (/^volta(r)?$/i.test(raw)) return { action: 'back' };
  if (/^(recarrega(r)?|atualiza(r)?|refresh|f5)$/i.test(raw)) return { action: 'reload' };
  if (/rola(r)?\s+para\s+baixo|scroll down/i.test(raw)) return { action: 'scroll', direction: 'down' };
  if (/rola(r)?\s+para\s+cima|scroll up|topo/i.test(raw)) return { action: 'scroll', direction: 'up' };

  for (const [name, url] of Object.entries(SITES)) {
    if (raw === name || raw === 'abre ' + name || raw === 'abrir ' + name) {
      return { action: 'open', urls: [url] };
    }
  }

  if (raw.length > 2) {
    return { action: 'open', urls: [`https://google.com/search?q=${encodeURIComponent(raw)}`], fallback: true };
  }

  return null;
}

function executeCommand(cmd, callback) {
  if (!cmd) {
    callback({ success: false, msg: 'Não entendi o comando.' });
    return;
  }
  chrome.runtime.sendMessage({ type: 'COMMANDER_EXECUTE', command: cmd }, response => {
    if (chrome.runtime.lastError) {
      callback({ success: false, msg: chrome.runtime.lastError.message || 'Falha ao executar comando.' });
      return;
    }
    callback(response || { success: false, msg: 'Sem resposta do background.' });
  });
}

chrome.runtime.onMessage.addListener((msg, _, reply) => {
  if (msg.type === 'CMD_RUN') {
    const cmd = parseCommand(msg.text);
    executeCommand(cmd, result => reply(result));
    return true;
  }
});

})();
