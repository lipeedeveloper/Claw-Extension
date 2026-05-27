/* CLAW — permissions.js v24 | Sistema de permissões e segurança */
(function(){
'use strict';
if(window.__clawPermissions__) return;
window.__clawPermissions__ = true;

let mode = 'safe';
let currentOverlay = null;

chrome.storage.local.get(['claw_permission_mode'], d => {
  mode = d.claw_permission_mode || 'safe';
});

chrome.runtime.onMessage.addListener((msg, _, reply) => {
  if(msg.type === 'PERM_SET_MODE'){
    mode = msg.mode;
    chrome.storage.local.set({ claw_permission_mode: mode });
    reply({ok:true, mode});
    return;
  }
  if(msg.type === 'PERM_GET_MODE'){
    reply({mode});
    return;
  }
  if(msg.type === 'PERM_CHECK'){
    if(mode === 'auto') {
      reply({allowed:true});
    } else {
      showConfirmation(msg.action, msg.description).then(allowed => reply({allowed}));
      return true;
    }
  }
});

function cleanupOverlay(){
  if(currentOverlay){
    currentOverlay.remove();
    currentOverlay = null;
  }
}

function showConfirmation(action, description){
  return new Promise(resolve => {
    cleanupOverlay();
    const overlay = document.createElement('div');
    currentOverlay = overlay;
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);
      display:flex;align-items:center;justify-content:center;
      font-family:Inter,system-ui,sans-serif;
    `;
    overlay.innerHTML = `
      <div style="background:#1a1a1e;border:1px solid #38383f;border-radius:14px;padding:20px;width:320px;box-shadow:0 16px 48px rgba(0,0,0,.7);">
        <div style="font-size:14px;font-weight:600;color:#ececec;margin-bottom:8px;">Claw — Confirmação</div>
        <div style="font-size:12px;color:#b4b4be;margin-bottom:6px;">Ação: <strong style="color:#cc7832">${action || 'ação'}</strong></div>
        <div style="font-size:11px;color:#72727e;margin-bottom:16px;">${description || 'Deseja executar esta ação?'}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="__cperm_no__" style="background:#2a2a2f;border:1px solid #38383f;border-radius:8px;color:#b4b4be;padding:6px 16px;cursor:pointer;font-size:12px;font-family:inherit;">Negar</button>
          <button id="__cperm_yes__" style="background:#cc7832;border:none;border-radius:8px;color:#fff;padding:6px 16px;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;">Permitir</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const finish = (allowed) => {
      cleanupOverlay();
      document.removeEventListener('keydown', onKey, true);
      resolve(allowed);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') finish(false);
      if (e.key === 'Enter') finish(true);
    };

    document.addEventListener('keydown', onKey, true);
    overlay.querySelector('#__cperm_yes__').onclick = () => finish(true);
    overlay.querySelector('#__cperm_no__').onclick = () => finish(false);
  });
}

window.ClawPermissions = {
  getMode: () => mode,
  setMode: (m) => { mode = m; chrome.storage.local.set({ claw_permission_mode: m }); },
  check: (action, desc) => mode === 'auto' ? Promise.resolve(true) : showConfirmation(action, desc)
};

})();
