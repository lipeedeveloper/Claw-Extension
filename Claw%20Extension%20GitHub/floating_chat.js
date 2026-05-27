/* CLAW — floating_chat.js v32 | @onerddev · github.com/onerddev */
(function(){
'use strict';
if(window.__clawChat__) return;
window.__clawChat__ = true;

let open = false;
let fabVisible = true;

const POPUP_URL = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
  ? chrome.runtime.getURL('popup.html') : 'popup.html';
const ICON_URL = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
  ? chrome.runtime.getURL('claw-icon.svg') : 'claw-icon.svg';

const style = document.createElement('style');
style.textContent = `
#__claw_fab__{
  position:fixed!important;height:36px;padding:0 12px 0 8px;
  border-radius:22px;z-index:2147483646!important;
  background:#1a1a1e;
  border:1.2px solid rgba(255,255,255,.12);cursor:grab;
  box-shadow:0 2px 12px rgba(0,0,0,.5);
  display:flex;align-items:center;gap:6px;
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .2s,border-color .2s,opacity .22s;
  user-select:none;overflow:hidden;
  font-family:'Geist','Inter',system-ui,sans-serif;
}
#__claw_fab__.dragging{cursor:grabbing;transition:none!important}
#__claw_fab__:hover{
  transform:scale(1.04) translateY(-1px);
  box-shadow:0 4px 16px rgba(0,0,0,.6);
  border-color:rgba(255,255,255,.18);
}
#__claw_fab__:active{transform:scale(.96)}
#__claw_fab__.hidden{opacity:0!important;pointer-events:none!important;transform:scale(.82)!important}

#__claw_fab_icon__{
  width:16px;height:16px;flex-shrink:0;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
#__claw_fab_claude__{
  width:16px;height:16px;flex-shrink:0;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
#__claw_fab__:hover #__claw_fab_claude__{transform:rotate(-15deg) scale(1.1)}

#__claw_fab_label__{
  font-size:12px;font-weight:600;letter-spacing:.01em;
  color:rgba(255,255,255,.7);pointer-events:none;white-space:nowrap;transition:color .18s;
}
#__claw_fab__:hover #__claw_fab_label__{color:#fff}

#__claw_panel__{
  position:fixed!important;width:380px;z-index:2147483647!important;
  background:#1a1a1e;border:1px solid rgba(255,255,255,.07);
  border-radius:18px;
  box-shadow:0 16px 48px rgba(0,0,0,.7);
  display:none;flex-direction:column;overflow:hidden;
  backdrop-filter:blur(48px);-webkit-backdrop-filter:blur(48px);
  max-height:580px;height:560px;
}
#__claw_panel__.open{display:flex;animation:__claw_in .26s cubic-bezier(.22,1,.36,1) both}
@keyframes __claw_in{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
#__claw_panel__ iframe{width:100%;height:100%;border:none;border-radius:18px;background:transparent}
`;
document.head.appendChild(style);

let fabX, fabY;
const MARGIN=14,FAB_H=36,FAB_W=94,PANEL_W=380,PANEL_H=560,PANEL_GAP=8;

function initPosition(){
  fabX = window.innerWidth - FAB_W - MARGIN;
  fabY = window.innerHeight - FAB_H - MARGIN;
  applyFabPosition();
}
function applyFabPosition(){
  fab.style.cssText += `;left:${fabX}px;top:${fabY}px;right:auto;bottom:auto`;
  updatePanelPosition();
}
function updatePanelPosition(){
  let pL = fabX + FAB_W - PANEL_W;
  if(pL < 8) pL = fabX;
  if(pL + PANEL_W > window.innerWidth - 8) pL = window.innerWidth - PANEL_W - 8;
  const spaceA = fabY, spaceB = window.innerHeight - fabY - FAB_H;
  const pT = spaceA > PANEL_H + PANEL_GAP ? fabY - PANEL_H - PANEL_GAP
    : spaceB > PANEL_H + PANEL_GAP ? fabY + FAB_H + PANEL_GAP
    : Math.max(8, fabY - PANEL_H - PANEL_GAP);
  panel.style.cssText += `;left:${pL}px;top:${pT}px;right:auto;bottom:auto`;
}

const fab = document.createElement('button');
fab.id = '__claw_fab__';
fab.title = 'Claw · Arraste para mover · Shift+C para ocultar';
fab.innerHTML = `
  <svg id="__claw_fab_icon__" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  <svg id="__claw_fab_close__" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  <svg id="__claw_fab_claude__" width="16" height="16" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg"><path fill="#d97757" d="M 233.959793 800.214905 L 468.644287 668.536987 L 472.590637 657.100647 L 468.644287 650.738403 L 457.208069 650.738403 L 417.986633 648.322144 L 283.892639 644.69812 L 167.597321 639.865845 L 54.926208 633.825623 L 26.577238 627.785339 L 3.3e-05 592.751709 L 2.73832 575.27533 L 26.577238 559.248352 L 60.724873 562.228149 L 136.187973 567.382629 L 249.422867 575.194763 L 331.570496 580.026978 L 453.261841 592.671082 L 472.590637 592.671082 L 475.328857 584.859009 L 468.724915 580.026978 L 463.570557 575.194763 L 346.389313 495.785217 L 219.543671 411.865906 L 153.100723 363.543762 L 117.181267 339.060425 L 99.060455 316.107361 L 91.248367 266.01355 L 123.865784 230.093994 L 167.677887 233.073853 L 178.872513 236.053772 L 223.248367 270.201477 L 318.040283 343.570496 L 441.825592 434.738342 L 459.946411 449.798706 L 467.194672 444.64447 L 468.080597 441.020203 L 459.946411 427.409485 L 392.617493 305.718323 L 320.778564 181.932983 L 288.80542 130.630859 L 280.348999 99.865845 C 277.369171 87.221436 275.194641 76.590698 275.194641 63.624268 L 312.322174 13.20813 L 332.8591 6.604126 L 382.389313 13.20813 L 403.248352 31.328979 L 434.013519 101.71814 L 483.865753 212.537048 L 561.181274 363.221497 L 583.812134 407.919434 L 595.892639 449.315491 L 600.40271 461.959839 L 608.214783 461.959839 L 608.214783 454.711609 L 614.577271 369.825623 L 626.335632 265.61084 L 637.771851 131.516846 L 641.718201 93.745117 L 660.402832 48.483276 L 697.530334 24.000122 L 726.52356 37.852417 L 750.362549 72 L 747.060486 94.067139 L 732.886047 186.201416 L 705.100708 330.52356 L 686.979919 427.167847 L 697.530334 427.167847 L 709.61084 415.087341 L 758.496704 350.174561 L 840.644348 247.490051 L 876.885925 206.738342 L 919.167847 161.71814 L 946.308838 140.29541 L 997.61084 140.29541 L 1035.38269 196.429626 L 1018.469849 254.416199 L 965.637634 321.422852 L 921.825562 378.201538 L 859.006714 462.765259 L 819.785278 530.41626 L 823.409424 535.812073 L 832.75177 534.92627 L 974.657776 504.724915 L 1051.328979 490.872559 L 1142.818848 475.167786 L 1184.214844 494.496582 L 1188.724854 514.147644 L 1172.456421 554.335693 L 1074.604126 578.496765 L 959.838989 601.449829 L 788.939636 641.879272 L 786.845764 643.409485 L 789.261841 646.389343 L 866.255127 653.637634 L 899.194702 655.409424 L 979.812134 655.409424 L 1129.932861 666.604187 L 1169.154419 692.537109 L 1192.671265 724.268677 L 1188.724854 748.429688 L 1128.322144 779.194641 L 1046.818848 759.865845 L 856.590759 714.604126 L 791.355774 698.335754 L 782.335693 698.335754 L 782.335693 703.731567 L 836.69812 756.885986 L 936.322205 846.845581 L 1061.073975 962.81897 L 1067.436279 991.490112 L 1051.409424 1014.120911 L 1034.496704 1011.704712 L 924.885986 929.234924 L 882.604126 892.107544 L 786.845764 811.48999 L 780.483276 811.48999 L 780.483276 819.946289 L 802.550415 852.241699 L 919.087341 1027.409424 L 925.127625 1081.127686 L 916.671204 1098.604126 L 886.469849 1109.154419 L 853.288696 1103.114136 L 785.073914 1007.355835 L 714.684631 899.516785 L 657.906067 802.872498 L 650.979858 806.81897 L 617.476624 1167.704834 L 601.771851 1186.147705 L 565.530212 1200 L 535.328857 1177.046997 L 519.302124 1139.919556 L 535.328857 1066.550537 L 554.657776 970.792053 L 570.362488 894.68457 L 584.536926 800.134277 L 592.993347 768.724976 L 592.429626 766.630859 L 585.503479 767.516968 L 514.22821 865.369263 L 405.825531 1011.865906 L 320.053711 1103.677979 L 299.516815 1111.812256 L 263.919525 1093.369263 L 267.221497 1060.429688 L 287.114136 1031.114136 L 405.825531 880.107361 L 477.422913 786.52356 L 523.651062 732.483276 L 523.328918 724.671265 L 520.590698 724.671265 L 205.288605 929.395935 L 149.154434 936.644409 L 124.993355 914.01355 L 127.973183 876.885986 L 139.409409 864.80542 L 234.201385 799.570435 L 233.879227 799.8927 Z"/></svg>
`;
document.body.appendChild(fab);

let isDragging=false,dragStartX,dragStartY,dragFabStartX,dragFabStartY,didDrag=false;

fab.addEventListener('mousedown', onDragStart);
fab.addEventListener('touchstart', onDragStart, {passive:false});

function onDragStart(e){
  const ev = e.touches?e.touches[0]:e;
  isDragging=true; didDrag=false;
  dragStartX=ev.clientX; dragStartY=ev.clientY;
  dragFabStartX=fabX; dragFabStartY=fabY;
  fab.classList.add('dragging');
  document.addEventListener('mousemove',onDragMove);
  document.addEventListener('mouseup',onDragEnd);
  document.addEventListener('touchmove',onDragMove,{passive:false});
  document.addEventListener('touchend',onDragEnd);
  e.preventDefault();
}
function onDragMove(e){
  if(!isDragging) return;
  const ev=e.touches?e.touches[0]:e;
  const dx=ev.clientX-dragStartX, dy=ev.clientY-dragStartY;
  if(Math.abs(dx)>3||Math.abs(dy)>3) didDrag=true;
  fabX=Math.max(0,Math.min(window.innerWidth-FAB_W,dragFabStartX+dx));
  fabY=Math.max(0,Math.min(window.innerHeight-FAB_H,dragFabStartY+dy));
  applyFabPosition();
  e.preventDefault();
}
function onDragEnd(){
  isDragging=false;
  fab.classList.remove('dragging');
  document.removeEventListener('mousemove',onDragMove);
  document.removeEventListener('mouseup',onDragEnd);
  document.removeEventListener('touchmove',onDragMove);
  document.removeEventListener('touchend',onDragEnd);
  if(!didDrag) togglePanel();
}

const panel = document.createElement('div');
panel.id = '__claw_panel__';
panel.innerHTML = `<iframe src="${POPUP_URL}" allow="microphone"></iframe>`;
document.body.appendChild(panel);

initPosition();
window.addEventListener('resize',()=>{
  fabX=Math.min(fabX,window.innerWidth-FAB_W);
  fabY=Math.min(fabY,window.innerHeight-FAB_H);
  applyFabPosition();
});

function togglePanel(){
  open=!open;
  if(open){
    panel.style.display='flex';
    panel.classList.add('open');
    updatePanelPosition();
  } else {
    panel.classList.remove('open');
    panel.style.display='none';
  }
  fab.classList.toggle('active',open);
  const fabIcon = document.getElementById('__claw_fab_icon__');
  if(fabIcon) fabIcon.style.display = open ? 'none' : 'block';
  const fabClose = document.getElementById('__claw_fab_close__');
  if(fabClose) fabClose.style.display = open ? 'block' : 'none';
  const fabClaude = document.getElementById('__claw_fab_claude__');
  if(fabClaude) fabClaude.style.display = 'block';
  const label = document.getElementById('__claw_fab_label__');
  
}
function toggleFabVisibility(){
  fabVisible=!fabVisible;
  fab.classList.toggle('hidden',!fabVisible);
  if(!fabVisible&&open){ open=false; panel.classList.remove('open'); panel.style.display='none';
    const label = document.getElementById('__claw_fab_label__');
    
  }
}

const DEFAULT_SC={key:'Space',altKey:true,ctrlKey:false,shiftKey:false};
let currentShortcut=DEFAULT_SC;
const normalizeKey=k=>(k===' '||k==='Space')?'Space':k;
const matchShortcut=(e,sc)=>normalizeKey(e.key)===normalizeKey(sc.key)&&
  !!e.altKey===!!sc.altKey&&!!e.ctrlKey===!!sc.ctrlKey&&!!e.shiftKey===!!sc.shiftKey;

chrome.storage.sync.get(['claw_shortcut'],d=>{ if(d.claw_shortcut) currentShortcut=d.claw_shortcut; });
chrome.runtime.onMessage.addListener(msg=>{ if(msg.type==='UPDATE_SHORTCUT'&&msg.shortcut) currentShortcut=msg.shortcut; });

document.addEventListener('keydown',e=>{
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA') return;
  if(e.shiftKey&&(e.key==='C'||e.key==='c')&&!e.ctrlKey&&!e.altKey){ e.preventDefault(); toggleFabVisibility(); return; }
  if(matchShortcut(e,currentShortcut)){ e.preventDefault(); togglePanel(); }
});

})();
