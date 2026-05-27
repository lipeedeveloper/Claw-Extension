/* Offscreen document — SpeechRecognition for MV3 */
let recognition = null;
let isListening = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target !== 'offscreen') return false;

  if (msg.action === 'startVoice') {
    startVoice(msg.lang || 'pt-BR');
    sendResponse({ ok: true });
  } else if (msg.action === 'stopVoice') {
    if (recognition) recognition.stop();
    sendResponse({ ok: true });
  }
  return false;
});

function sendToBackground(data) {
  chrome.runtime.sendMessage({ target: 'background', from: 'offscreen', ...data });
}

function startVoice(lang) {
  if (isListening && recognition) { recognition.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    sendToBackground({ type: 'voiceError', error: 'Reconhecimento de voz nao disponivel neste navegador.' });
    return;
  }
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    sendToBackground({ type: 'voiceState', listening: true });
  };
  recognition.onend = () => {
    isListening = false;
    sendToBackground({ type: 'voiceState', listening: false });
  };
  recognition.onerror = (ev) => {
    isListening = false;
    sendToBackground({ type: 'voiceState', listening: false });
    if (ev.error === 'not-allowed') {
      sendToBackground({ type: 'voiceError', error: 'Permissao de microfone negada. Clique no icone de cadeado na barra de endereco e permita o microfone.' });
    } else if (ev.error !== 'aborted') {
      sendToBackground({ type: 'voiceError', error: 'Erro no microfone: ' + ev.error });
    }
  };
  recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    const isFinal = e.results[e.results.length - 1].isFinal;
    sendToBackground({ type: 'voiceResult', transcript, isFinal });
  };
  try { recognition.start(); }
  catch (e) {
    sendToBackground({ type: 'voiceError', error: 'Erro ao iniciar: ' + e.message });
  }
}
