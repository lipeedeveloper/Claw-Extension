/* CLAW — rate_limiter.js v1
   Previne spam de ações no AI Agent — evita travar páginas.
   Desenvolvido por Emanuel Felipe
*/
(function(){
'use strict';
if(window.__clawRateLimit__) return;
window.__clawRateLimit__ = true;

const LIMITS = {
  default:  { max: 10, window: 5000  },  // 10 ações em 5s
  click:    { max: 5,  window: 3000  },  // 5 clicks em 3s
  type:     { max: 8,  window: 4000  },  // 8 tipos em 4s
  navigate: { max: 3,  window: 10000 },  // 3 navigates em 10s
  scroll:   { max: 20, window: 3000  },  // scroll é mais livre
};

const buckets = {}; // { actionType: [timestamps] }

window.ClawRateLimit = {
  check(action) {
    const rule = LIMITS[action] || LIMITS.default;
    const now  = Date.now();
    if (!buckets[action]) buckets[action] = [];

    // Remove timestamps fora da janela
    buckets[action] = buckets[action].filter(t => now - t < rule.window);

    if (buckets[action].length >= rule.max) {
      const waitMs = rule.window - (now - buckets[action][0]);
      return { allowed: false, waitMs };
    }

    buckets[action].push(now);
    return { allowed: true };
  },

  reset(action) {
    if (action) delete buckets[action];
    else Object.keys(buckets).forEach(k => delete buckets[k]);
  },

  getStats() {
    return Object.fromEntries(
      Object.entries(buckets).map(([k, v]) => [k, v.length])
    );
  }
};

})();
