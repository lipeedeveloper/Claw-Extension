/* CLAW — cache.js v1 | Cache de respostas IA por pergunta
   Evita chamar a API para a mesma pergunta duas vezes.
   Desenvolvido por Emanuel Felipe
*/
(function(){
'use strict';
if(window.__clawCache__) return;
window.__clawCache__ = true;

const MAX = 200; // máximo de entradas

window.ClawCache = {
  _key: 'claw_answer_cache',

  _hash(str){ // hash simples e rápido
    let h = 0;
    for(let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return h.toString(36);
  },

  async get(question, options){
    const k = this._hash((question + JSON.stringify(options)).toLowerCase().trim());
    return new Promise(r => {
      chrome.storage.local.get([this._key], d => {
        const cache = d[this._key] || {};
        r(cache[k] || null);
      });
    });
  },

  async set(question, options, answer){
    const k = this._hash((question + JSON.stringify(options)).toLowerCase().trim());
    chrome.storage.local.get([this._key], d => {
      const cache = d[this._key] || {};
      // LRU simples: remove mais antigo se cheio
      const keys = Object.keys(cache);
      if(keys.length >= MAX) delete cache[keys[0]];
      cache[k] = { answer, ts: Date.now() };
      chrome.storage.local.set({ [this._key]: cache });
    });
  },

  async clear(){
    return new Promise(r => chrome.storage.local.remove([this._key], r));
  },

  async stats(){
    return new Promise(r => {
      chrome.storage.local.get([this._key], d => {
        const cache = d[this._key] || {};
        r({ entries: Object.keys(cache).length, max: MAX });
      });
    });
  }
};

})();
