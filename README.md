<div align="center">
  <img height="160" src="https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/claude-color.png" />
  <h1>Claw Extension</h1>
  <p><strong>Seu assitente do Chrome!</strong></p>
  <p>by <a href="https://github.com/onerddev">Emanuel Felipe</a></p>

 
</div>

---

## O que é o Claw?

O **Claw** é uma extensão para navegador focada em estudo, produtividade escolar, automação pessoal autorizada e assistência com IA. Ele reúne chat flutuante, agente de navegador, comandos por voz/texto, modo estudo, tradutor, resumo de páginas, plugins escolares, macro recorder, cache, Smart Router, rotação de API keys e fallback de modelos.

Esta versão foi preparada para GitHub: **não possui API keys fixas no código**. As chaves devem ser adicionadas pelo próprio usuário no popup da extensão.

---

## Destaques da versão atual

- Interface escura/fosca no estilo Claw.
- Painel flutuante disponível em páginas comuns.
- Agente para comandos de navegação e ações simples no navegador.
- Smart Router para escolher modelos conforme a tarefa.
- Rotação de API keys configuradas pelo usuário.
- Fallback automático de modelos quando uma chamada falhar.
- Cooldown automático para chaves/modelos com erro ou limite.
- Fila interna para reduzir falhas por muitas chamadas simultâneas.
- Cache de respostas para evitar requisições repetidas.
- Modo estudo com resumo, explicação, perguntas e flashcards.
- Motor matemático com suporte a símbolos escolares comuns.
- Plugins escolares com ícones locais em `plugin-icons/`.
- Versão limpa sem WhatsApp, LinkedIn, Notion, Teams, Brainly, Desmos, GeoGebra, Duolingo, Canva, Quizizz e Blooket.

---

## Funcionalidades

### Agente de IA (`ai_agent.js`)

Agente integrado ao navegador para interpretar comandos em linguagem natural e auxiliar em ações de página.

- Abrir sites e novas abas.
- Pesquisar termos em plataformas suportadas.
- Ler conteúdo visível da página.
- Clicar em elementos por texto, `aria-label`, `title`, `placeholder` ou seletor.
- Preencher campos quando solicitado pelo usuário.
- Rolar, voltar, recarregar e navegar em páginas.
- Extrair texto, links, imagens, tabelas e inputs.

---

### Chat Flutuante (`floating_chat.js`)

Interface de chat sempre disponível em sites comuns.

- Botão flutuante arrastável.
- Painel com o popup completo do Claw.
- Atalho para abrir/fechar rapidamente.
- Reposicionamento automático conforme o espaço da tela.
- Suporte a toque em dispositivos compatíveis.

---

### Comandos por Voz e Texto (`commander.js`)

Assistente de comandos por linguagem natural integrado ao popup.

- Reconhecimento de voz via Web Speech API.
- Comandos como abrir, pesquisar, resumir, explicar e traduzir.
- Reconhecimento de variações e erros comuns de digitação.
- Integração com sites escolares e plataformas suportadas.

---

### Core IA (`claw_core.js` + `background.js`)

Cérebro central do Claw.

- Smart Router para escolher o melhor modelo por tarefa.
- Separação por tipo de tarefa: matemática, raciocínio, agente, tradução, visão e respostas rápidas.
- Logs internos de diagnóstico.
- Fila de requisições.
- Cooldown para chaves/modelos que falham.
- Rotação automática entre API keys salvas pelo usuário.
- Fallback de modelos quando o modelo principal não responder.

---

### Modo Estudo (`study_mode.js`)

Ferramentas para estudar em qualquer página.

- Resumo do conteúdo da página.
- Explicação em linguagem simples.
- Geração de perguntas e respostas.
- Extração de pontos-chave.
- Criação de flashcards.
- Histórico local de estudo.

---

### Kahoot Estudo (`kahoot.js`)

Assistente de estudo para perguntas em formato de quiz.

- Detecção de pergunta e alternativas.
- Sugestão de resposta com justificativa.
- Suporte a matemática, física, química, biologia, história, geografia, português, inglês e ciências.
- Foco especial em matemática.
- Suporte a expressões com `²`, `³`, `√`, `×`, `x`, `÷`, `:`, `%`, frações, potência e parênteses.
- Modo de confirmação manual: o Claw recomenda e explica; o usuário decide a resposta.

---

### StopotS Estudo (`stopots.js`)

Assistente para treino de palavras e categorias.

- Identificação de letra e categorias.
- Sugestões por categoria.
- Cache local para respostas repetidas.
- Modo de estudo com copiar/usar manualmente.

---

### Tradutor Integrado (`translator.js`)

Tradução rápida de texto selecionado ou digitado.

- Suporte a múltiplos idiomas.
- Interface flutuante discreta.
- Atalho para tradução de seleção.
- Roteamento para modelo rápido quando possível.

---

### Explicador de Seleção (`explain_selection.js`)

Explica qualquer trecho selecionado na página.

- Botão flutuante ao selecionar texto.
- Atalho `Alt+E`.
- Modos: padrão, simples e técnico.
- Botão de copiar explicação.

---

### Ferramentas de Página (`page_tools.js`)

Resumo e análise de páginas.

- Resumo do texto principal.
- Explicação de trechos selecionados.
- Divisão automática de textos longos.
- Mensagens claras de erro de API.

---

### Gravador de Macro (`macro_recorder.js`)

Grava e reproduz sequências de ações do usuário.

- Grava cliques, digitação, teclas e rolagem.
- Salva macros no `chrome.storage.local`.
- Lista macros no popup.
- Permite executar e deletar macros salvos.
- Melhor busca de elementos em páginas modernas.

---

### Memória Persistente (`memory.js`)

Sistema de memória contextual local por domínio.

- Guarda preferências e notas por site.
- Usa `chrome.storage`.
- Ajuda o agente a manter contexto entre sessões.

---

### Dashboard de Produtividade (`productivity.js`)

Análise e acompanhamento do uso do navegador.

- Tempo de uso por site.
- Indicador de foco/distração.
- Metas configuráveis.
- Dados integrados ao popup.

---

### Estatísticas (`stats.js`)

Métricas locais de uso.

- Contagem de interações.
- Histórico de tarefas.
- Uso por dia/sessão.

### Cache (`cache.js`)

Reduz consumo de API.

- Armazena respostas por hash.
- Retorna respostas repetidas instantaneamente.
- Limpeza automática de entradas antigas.

### Rate limiter (`rate_limiter.js`)

Controle de fluxo interno.

- Evita spam de chamadas.
- Organiza fila de requisições.
- Backoff em caso de sobrecarga.
- Proteção contra loops.

### Permissões (`permissions.js`)

Camada local de controle.

- Whitelist/blacklist por domínio.
- Níveis de permissão por site.
- Confirmação para ações sensíveis.
- Bloqueio em páginas restritas do navegador.

---

## Plugins por plataforma

| Plugin | Arquivo | Funções principais |
|---|---|---|
| YouTube | `plugins/youtube.js` | Resumo de vídeos, apoio a estudos e extração de contexto |
| Spotify | `plugins/spotify.js` | Modo foco, rotina de estudo e apoio com playlists |
| Gmail | `plugins/gmail.js` | Resumo de emails, sugestões de resposta e escrita assistida |
| Google Docs | `plugins/google_docs.js` | Correção, resumo, melhoria de texto e apoio para redação |
| Google Meet | `plugins/meet.js` | Notas, resumo e apoio em aulas/reuniões |
| Google Classroom | `plugins/school_sites.js` | Apoio para tarefas, links e páginas escolares |
| Google Drive | `plugins/school_sites.js` | Organização e análise de materiais de estudo |
| Wikipedia | `plugins/school_sites.js` | Resumo escolar e explicação de temas |
| Khan Academy | `plugins/school_sites.js` | Busca e apoio em conteúdos de estudo |
| Google Tradutor | `plugins/school_sites.js` | Atalhos e integração com tradução |
| Google Forms | `plugins/school_sites.js` | Apoio de leitura, explicação e estudo |

Todos os ícones dos plugins ficam em `plugin-icons/`, carregados localmente pela extensão.

---

## Arquitetura

```txt
Claw Extension
├── manifest.json
├── background.js              # Service Worker, proxy Groq, router, APIs e logs
├── popup.html / popup.js      # Interface principal
├── floating_chat.js           # Chat flutuante
├── ai_agent.js                # Agente executor de página
├── commander.js               # Comandos por voz/texto
├── claw_core.js               # Core escolar, diagnóstico e memória avançada
├── offscreen.html/js          # Suporte offscreen
│
├── Ferramentas de Conteúdo
│   ├── explain_selection.js
│   ├── page_tools.js
│   ├── translator.js
│   └── study_mode.js
│
├── Estudos e Quizzes
│   ├── kahoot.js
│   └── stopots.js
│
├── Automação
│   └── macro_recorder.js
│
├── Sistema
│   ├── memory.js
│   ├── cache.js
│   ├── rate_limiter.js
│   ├── permissions.js
│   ├── anti_detect.js
│   ├── productivity.js
│   └── stats.js
│
├── plugins/
│   ├── youtube.js
│   ├── spotify.js
│   ├── gmail.js
│   ├── google_docs.js
│   ├── meet.js
│   └── school_sites.js
│
├── plugin-icons/
│   ├── youtube.svg
│   ├── spotify.svg
│   ├── gmail.svg
│   ├── docs.svg
│   ├── meet.svg
│   ├── classroom.svg
│   ├── drive.svg
│   ├── wikipedia.svg
│   ├── khan.svg
│   ├── translate.svg
│   └── forms.svg
│
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Configuração da API Groq

A extensão usa a API da Groq para chamadas de IA. Esta versão para GitHub **não inclui chaves fixas**.

### Como obter uma chave

1. Acesse [console.groq.com](https://console.groq.com)
2. Faça login ou crie uma conta.
3. Entre em **API Keys**.
4. Clique em **Create API Key**.
5. Copie a chave gerada.

### Como configurar na extensão

1. Abra o popup do Claw.
2. Vá em **Configurações**.
3. Cole uma ou mais chaves no campo de API.
4. Use uma chave por linha.
5. Salve e teste.

O Claw usa automaticamente:

- rotação entre chaves salvas;
- cooldown quando uma chave falha;
- fallback de modelos;
- fila para reduzir erro de limite;
- logs com chaves mascaradas.

> Nunca publique suas chaves no GitHub. Use somente o campo de configuração local da extensão.

---

## Modelos usados pelo Smart Router

| Finalidade | Modelos principais |
|---|---|
| Matemática | `qwen/qwen3-32b`, `openai/gpt-oss-120b`, `llama-3.3-70b-versatile` |
| Raciocínio | `openai/gpt-oss-120b`, `qwen/qwen3-32b`, `llama-3.3-70b-versatile` |
| Agente | `llama-3.3-70b-versatile`, `groq/compound-mini`, `openai/gpt-oss-20b` |
| Visão/OCR | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Respostas rápidas | `openai/gpt-oss-20b`, `llama-3.1-8b-instant` |
| Tradução | `llama-3.1-8b-instant`, `openai/gpt-oss-20b` |

Também existe a opção **Auto Router**, que escolhe o modelo conforme a tarefa.

---

## Instalação

1. Baixe ou clone este repositório.
2. Abra o Chrome ou Edge.
3. Acesse `chrome://extensions/` ou `edge://extensions/`.
4. Ative o **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação**.
6. Selecione a pasta da extensão.
7. Abra o popup do Claw e configure sua API key.

---

## Uso responsável

O Claw foi criado para estudo, produtividade e automação pessoal autorizada. Recursos de estudo em quizzes e jogos educativos devem ser usados para aprender, revisar e entender conteúdos, não para burlar avaliações, regras de plataformas ou atividades escolares.

---

## Segurança

- Não há API keys fixas nesta versão.
- Logs mascaram chaves e tokens.
- Configurações ficam no armazenamento local do navegador.
- Ações sensíveis podem exigir confirmação.
- Evite usar o agente em páginas bancárias, médicas, governamentais ou com dados sensíveis.

---

## Autor

<div align="center">
  <p>Desenvolvido por <strong>Emanuel Felipe</strong></p>
  <p><em>Transformando o navegador em um ambiente inteligente, escolar e produtivo.</em></p>
</div>
