/* CLAW — focus_mode.js compatibility layer | v45
   Mantém os mesmos eventos antigos, mas funciona como modo discreto/foco:
   apenas oculta/mostra overlays do Claw quando solicitado. Não altera eventos do site. */
(function(){
  'use strict';
  if (window.__clawFocusModeV44__) return;
  window.__clawFocusModeV44__ = true;

  let ON = false;
  const SELECTORS = [
    '#__ck_card__', '#__claw_k__', '#__claw_float__', '#__claw_core_panel__',
    '#__claw_school_bar__', '#__claw_school_out__', '#__claw_spotify_bar__',
    '#__claw_sp_panel__', '#__claw_yt_panel__'
  ];

  function setPanelsHidden(hidden) {
    SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (hidden) {
          if (!el.dataset.clawPrevDisplay) el.dataset.clawPrevDisplay = el.style.display || '';
          el.style.display = 'none';
        } else {
          el.style.display = el.dataset.clawPrevDisplay || '';
          delete el.dataset.clawPrevDisplay;
        }
      });
    });
  }

  function setState(next){
    ON = !!next;
    setPanelsHidden(ON);
    console.log('[Claw] Modo discreto ' + (ON ? 'ativo' : 'desativado'));
  }

  document.addEventListener('keydown', e => {
    if (e.altKey && (e.key === 'h' || e.key === 'H')) setState(!ON);
  });

  chrome.runtime.onMessage.addListener((msg, _, reply) => {
    if (msg.type === 'ANTI_ON')  { setState(true); reply({ ok:true, active:true }); return false; }
    if (msg.type === 'ANTI_OFF') { setState(false); reply({ ok:true, active:false }); return false; }
    if (msg.type === 'ANTI_STATUS') { reply({ ok:true, active:ON }); return false; }
    return false;
  });

  try { chrome.storage.sync.get(['claw_anti'], d => { if (d.claw_anti) setState(true); }); } catch(_) {}
})();
