// ==UserScript==
// @name         SANTOS.meczada - Precisão Máxima v13
// @namespace    http://tampermonkey.net/
// @version      13.0
// @description  Detecção ultra precisa de perguntas e opções para Wayground/Quizizz - Projeto Governo Brasileiro
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @icon         https://i.imgur.com/7YbX5Jx.png
// ==/UserScript==

(function () {
  'use strict';

  /**************************************************************************
   * CONFIGURAÇÃO DE PRECISÃO MÁXIMA
   **************************************************************************/
  const CFG = {
    pollInterval: 1000,
    debounceMs: 100,
    maxPerplexityChars: 1800,
    minTextLen: 3,
    clusterGapPx: 25,
    enableAppearanceDetection: true,
    savePositionKey: 'santos_meczada_pos_v13',
    saveMinimizedKey: 'santos_meczada_min_v13',
    minOptionLength: 2,
    maxOptionLength: 150,
    questionMinLength: 10,
    optionSimilarityThreshold: 0.7,
    waygroundSelectors: [
      '[data-test="question-text"]',
      '.question-text',
      '.qz-question',
      '.q-text',
      '[class*="question"]',
      '[class*="prompt"]',
      '[class*="quiz"]',
      '[class*="challenge"]',
      '.wayground-question',
      '.wg-question',
      '.question-content',
      '.question-body',
      '.question-title',
      '.problem-statement',
      '.quiz-question'
    ],
    optionSelectors: [
      '[data-test*="option"]',
      '[role="option"]',
      '[role="radio"]',
      '[class*="option"]',
      '[class*="choice"]',
      '[class*="answer"]',
      '.quiz-option',
      '.answer-choice',
      '.option-container',
      '.choice-text',
      '.wayground-option',
      '.wg-option'
    ]
  };

  /**************************************************************************
   * UTILITÁRIOS AVANÇADOS
   **************************************************************************/
  const nowStr = () => new Date().toLocaleTimeString();
  const normalize = s => (s || '').replace(/\s+/g, ' ').trim();
  const clamp = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);
  const isElement = o => o && o.nodeType === 1;
  
  const tryQuery = (sel, root = document) => {
    try { return root.querySelector(sel); } 
    catch (e) { return null; }
  };

  const tryQueryAll = (sel, root = document) => {
    try { return Array.from(root.querySelectorAll(sel)); } 
    catch (e) { return []; }
  };

  // Calcula similaridade entre textos (0-1)
  function textSimilarity(a, b) {
    if (!a || !b) return 0;
    const str1 = a.toLowerCase(), str2 = b.toLowerCase();
    if (str1 === str2) return 1;
    
    // Algoritmo de similaridade de Jaccard
    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  // Verifica se elemento é visível
  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    if (el.closest && el.closest('#santos-meczada-ui-v13')) return false;
    if (el.hasAttribute && el.getAttribute('aria-hidden') === 'true') return false;
    
    const st = getComputedStyle(el);
    if (!st) return false;
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
    if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
    
    const r = el.getBoundingClientRect();
    if (r.bottom < -5 || r.top > (innerHeight + 5) || r.right < -5 || r.left > (innerWidth + 5)) return false;
    
    return true;
  }

  // Extrai texto de elemento com todas as possibilidades
  function getText(el) {
    if (!el) return '';
    
    // Campos de entrada
    try {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        return (el.placeholder || el.value || el.title || '').trim();
      }
    } catch {}
    
    // Elementos com texto
    let t = '';
    try { 
      t = el.innerText || el.textContent || ''; 
    } catch {}
    
    t = (t || '').trim();
    
    // Atributos alternativos
    try {
      const attrs = [
        el.getAttribute('aria-label'),
        el.getAttribute('title'),
        el.getAttribute('alt'),
        el.getAttribute('data-tooltip'),
        el.getAttribute('data-title')
      ].filter(Boolean);
      
      attrs.forEach(a => {
        if (a && !t.includes(a)) t += (t ? ' ' : '') + a;
      });
    } catch {}
    
    return normalize(t);
  }

  // Verifica se elemento parece uma opção válida
  function looksLikeValidOption(el) {
    if (!isElement(el) || !isVisible(el)) return false;
    
    const text = getText(el);
    if (!text || text.length < CFG.minOptionLength || text.length > CFG.maxOptionLength) return false;
    
    // Ignorar textos com palavras proibidas
    const invalidKeywords = [
      'zoom', 'image', 'question', 'clicar', 'expandir', 'voltar', 'próxima',
      'anterior', 'enviar', 'copiar', 'capturar', 'área', 'menu', 'configuração',
      'ajuda', 'login', 'registrar', 'perfil', 'pontuação', 'score', 'timer',
      'tempo', 'contador', 'loading', 'carregando', 'play', 'pause', 'stop'
    ];
    
    const lowerText = text.toLowerCase();
    for (const kw of invalidKeywords) {
      if (lowerText.includes(kw)) return false;
    }
    
    // Verificar aparência visual
    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 30) return false;
    
    const st = getComputedStyle(el);
    const bg = st.backgroundColor || '';
    
    // Elementos com fundo colorido são bons candidatos
    if (bg && /rgba?\([^)]+\)/.test(bg)) {
      if (!bg.includes('0, 0, 0, 0') && !bg.includes('transparent')) {
        return true;
      }
    }
    
    // Elementos com bordas arredondadas são bons candidatos
    const br = parseFloat(st.borderRadius) || 0;
    if (br > 6) return true;
    
    // Verificar roles e tags específicas
    const role = el.getAttribute && el.getAttribute('role');
    const tagName = el.tagName.toLowerCase();
    
    if ((role && /button|option|radio|checkbox/i.test(role)) || 
        tagName === 'button' || 
        tagName === 'label' ||
        /option|choice|answer/i.test(el.className)) {
      return true;
    }
    
    return false;
  }

  /**************************************************************************
   * DETECÇÃO DE PERGUNTAS E OPÇÕES - ALGORITMO AVANÇADO
   **************************************************************************/
  
  // Coleta todos os textos visíveis com filtros inteligentes
  function collectVisibleTextNodes(root = document) {
    const nodes = [];
    const ignoreSelectors = [
      'script', 'style', 'meta', 'link', 'noscript', 
      'header', 'footer', 'nav', 'menu', 'aside',
      '.advertisement', '.ad', '.ads', '[class*="banner"]',
      '.navbar', '.toolbar', '.header', '.footer',
      '.modal', '.popup', '.dialog', '.overlay',
      '#santos-meczada-ui-v13', '.santos-meczada-ui'
    ];
    
    // Coletar todos os elementos visíveis
    const allElements = tryQueryAll('body *');
    
    for (const el of allElements) {
      if (!isVisible(el)) continue;
      
      // Pular elementos com seletores ignorados
      let shouldIgnore = false;
      for (const sel of ignoreSelectors) {
        if (el.matches(sel)) {
          shouldIgnore = true;
          break;
        }
      }
      if (shouldIgnore) continue;
      
      // Pular elementos que são pais de muitos filhos (provavelmente containers)
      if (el.children.length > 10) continue;
      
      const text = getText(el);
      if (!text || text.length < CFG.minTextLen) continue;
      
      nodes.push({
        el,
        text,
        rect: el.getBoundingClientRect(),
        fontSize: parseFloat(getComputedStyle(el).fontSize) || 14,
        fontWeight: getComputedStyle(el).fontWeight || 'normal'
      });
    }
    
    return nodes;
  }

  // Agrupamento inteligente de elementos por proximidade e semelhança
  function clusterElements(nodes) {
    if (!nodes.length) return [];
    
    // Primeiro, agrupar por proximidade vertical
    nodes.sort((a, b) => a.rect.top - b.rect.top);
    const verticalClusters = [];
    let currentCluster = { items: [nodes[0]], top: nodes[0].rect.top, bottom: nodes[0].rect.bottom };
    
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.rect.top - currentCluster.bottom <= CFG.clusterGapPx) {
        currentCluster.items.push(node);
        currentCluster.bottom = Math.max(currentCluster.bottom, node.rect.bottom);
      } else {
        verticalClusters.push(currentCluster);
        currentCluster = { items: [node], top: node.rect.top, bottom: node.rect.bottom };
      }
    }
    if (currentCluster.items.length) verticalClusters.push(currentCluster);
    
    // Agora, dentro de cada cluster vertical, agrupar por proximidade horizontal
    const finalClusters = [];
    
    for (const vCluster of verticalClusters) {
      vCluster.items.sort((a, b) => a.rect.left - b.rect.left);
      const horizontalClusters = [];
      let hCluster = { items: [vCluster.items[0]], left: vCluster.items[0].rect.left, right: vCluster.items[0].rect.right };
      
      for (let i = 1; i < vCluster.items.length; i++) {
        const item = vCluster.items[i];
        if (item.rect.left - hCluster.right <= CFG.clusterGapPx) {
          hCluster.items.push(item);
          hCluster.right = Math.max(hCluster.right, item.rect.right);
        } else {
          horizontalClusters.push(hCluster);
          hCluster = { items: [item], left: item.rect.left, right: item.rect.right };
        }
      }
      if (hCluster.items.length) horizontalClusters.push(hCluster);
      
      // Adicionar todos os clusters horizontais aos clusters finais
      finalClusters.push(...horizontalClusters);
    }
    
    // Calcular pontuação para cada cluster
    finalClusters.forEach(cluster => {
      // Calcular propriedades do cluster
      cluster.text = cluster.items.map(i => i.text).join(' ');
      cluster.textLength = cluster.text.length;
      cluster.centerX = (cluster.left + cluster.right) / 2;
      cluster.centerY = (cluster.top + cluster.bottom) / 2;
      
      // Calcular tamanho médio da fonte (ponderado pelo comprimento do texto)
      let totalWeight = 0;
      let weightedFontSize = 0;
      
      cluster.items.forEach(item => {
        const weight = item.text.length;
        weightedFontSize += item.fontSize * weight;
        totalWeight += weight;
      });
      
      cluster.avgFontSize = totalWeight > 0 ? weightedFontSize / totalWeight : 14;
      
      // Pontuação baseada em tamanho de texto, fonte e posição central
      const centerXDist = Math.abs(cluster.centerX - window.innerWidth / 2);
      const centerYDist = Math.abs(cluster.centerY - window.innerHeight / 2);
      const centerDist = Math.sqrt(centerXDist * centerXDist + centerYDist * centerYDist);
      
      cluster.score = cluster.textLength * cluster.avgFontSize * (1 + 10 / (1 + centerDist / 100));
    });
    
    return finalClusters.sort((a, b) => b.score - a.score);
  }

  // Encontra o container da pergunta principal
  function findQuestionContainer() {
    // 1. Tentar seletores conhecidos do Wayground/Quizizz
    for (const selector of CFG.waygroundSelectors) {
      const el = tryQuery(selector);
      if (el && isVisible(el) && getText(el).length >= CFG.questionMinLength) {
        const container = ascendToContainer(el);
        if (container) return container;
      }
    }
    
    // 2. Tentar encontrar por atributos data específicos
    const dataSelectors = [
      '[data-type="question"]',
      '[data-kind="quiz"]',
      '[data-role="question"]',
      '[data-purpose="quiz"]',
      '[data-test*="question"]',
      '[data-test*="quiz"]',
      '[data-test*="challenge"]'
    ];
    
    for (const selector of dataSelectors) {
      const el = tryQuery(selector);
      if (el && isVisible(el) && getText(el).length >= CFG.questionMinLength) {
        const container = ascendToContainer(el);
        if (container) return container;
      }
    }
    
    // 3. Algoritmo de clustering para encontrar o texto principal
    const allTextNodes = collectVisibleTextNodes();
    const clusters = clusterElements(allTextNodes);
    
    if (clusters.length > 0) {
      // O cluster com maior pontuação é provavelmente a pergunta
      const bestCluster = clusters[0];
      
      // Subir na hierarquia para encontrar o container principal
      if (bestCluster.items.length > 0) {
        const container = ascendToContainer(bestCluster.items[0].el);
        if (container) return container;
      }
    }
    
    // 4. Fallback: usar o body
    return document.body;
  }

  // Sobe na hierarquia para encontrar um container adequado
  function ascendToContainer(el) {
    if (!el) return null;
    
    let node = el;
    let bestContainer = el;
    let bestScore = 0;
    
    // Verificar vários níveis acima
    for (let i = 0; i < 12 && node; i++) {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      
      // Calcular pontuação do container
      let score = 0;
      
      // Pontuar por tamanho (containers de pergunta geralmente são largos)
      if (rect.width > window.innerWidth * 0.4) score += 30;
      
      // Pontuar por posição central
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(centerX - window.innerWidth / 2, 2) +
        Math.pow(centerY - window.innerHeight / 2, 2)
      );
      score += Math.max(0, 50 - distFromCenter / 10);
      
      // Pontuar por classes e IDs relevantes
      const className = (node.className || '').toLowerCase();
      const id = (node.id || '').toLowerCase();
      
      if (/(question|quiz|challenge|problem|test|exam)/.test(className)) score += 40;
      if (/(question|quiz|challenge|problem|test|exam)/.test(id)) score += 40;
      if (/(container|wrapper|box|panel|card)/.test(className)) score += 20;
      if (/(container|wrapper|box|panel|card)/.test(id)) score += 20;
      
      // Pontuar por estilo (containers frequentemente têm fundo, padding, etc.)
      if (style.backgroundColor && !style.backgroundColor.includes('rgba(0, 0, 0, 0)')) score += 10;
      if (parseFloat(style.padding) > 10) score += 10;
      if (parseFloat(style.margin) > 10) score += 5;
      if (parseFloat(style.borderRadius) > 5) score += 5;
      
      // Atualizar melhor container se necessário
      if (score > bestScore) {
        bestScore = score;
        bestContainer = node;
      }
      
      node = node.parentElement;
    }
    
    return bestContainer;
  }

  // Detecta opções ao redor de um container
  function detectOptionsAround(containerEl, questionText = '') {
    const options = [];
    if (!containerEl) return options;
    
    // 1. Buscar por seletores conhecidos de opções
    for (const selector of CFG.optionSelectors) {
      const elements = tryQueryAll(selector, containerEl);
      for (const el of elements) {
        if (!isVisible(el)) continue;
        
        const text = getText(el);
        if (!text || text.length < CFG.minOptionLength) continue;
        
        // Verificar se é similar à pergunta (não deve ser)
        if (questionText && textSimilarity(text, questionText) > CFG.optionSimilarityThreshold) continue;
        
        // Verificar se já existe uma opção similar
        const isDuplicate = options.some(opt => textSimilarity(opt, text) > 0.8);
        if (!isDuplicate) {
          options.push(text);
        }
      }
    }
    
    // 2. Busca por aparência (elementos que parecem botões/opções)
    if (CFG.enableAppearanceDetection) {
      const allElements = tryQueryAll('*', containerEl);
      
      for (const el of allElements) {
        if (!isVisible(el)) continue;
        if (!looksLikeValidOption(el)) continue;
        
        const text = getText(el);
        if (!text || text.length < CFG.minOptionLength) continue;
        
        // Verificar se é similar à pergunta
        if (questionText && textSimilarity(text, questionText) > CFG.optionSimilarityThreshold) continue;
        
        // Verificar se já existe uma opção similar
        const isDuplicate = options.some(opt => textSimilarity(opt, text) > 0.8);
        if (!isDuplicate) {
          options.push(text);
        }
      }
    }
    
    // 3. Ordenar opções por posição vertical (de cima para baixo)
    options.sort((a, b) => {
      try {
        const aEl = findElementByText(a, containerEl);
        const bEl = findElementByText(b, containerEl);
        
        if (!aEl || !bEl) return 0;
        return aEl.getBoundingClientRect().top - bEl.getBoundingClientRect().top;
      } catch {
        return 0;
      }
    });
    
    return options.slice(0, 10); // Limitar a 10 opções
  }

  // Encontra elemento pelo texto
  function findElementByText(text, root = document) {
    const elements = tryQueryAll('*', root);
    for (const el of elements) {
      if (getText(el) === text) return el;
    }
    return null;
  }

  /**************************************************************************
   * EXTRAÇÃO DE PERGUNTA E OPÇÕES - ALGORITMO PRECISO
   **************************************************************************/
  
  async function extractQuestionAndOptions(container) {
    const result = { question: '', options: [], confidence: 0 };
    if (!container) return result;
    
    // ETAPA 1: Extrair a pergunta
    let questionText = '';
    let questionElement = null;
    
    // 1A. Tentar encontrar a pergunta por seletores específicos
    for (const selector of CFG.waygroundSelectors) {
      const el = tryQuery(selector, container);
      if (el && isVisible(el)) {
        const text = getText(el);
        if (text && text.length >= CFG.questionMinLength) {
          questionText = text;
          questionElement = el;
          break;
        }
      }
    }
    
    // 1B. Se não encontrou por seletores, usar heurística de clustering
    if (!questionText) {
      const containerTextNodes = collectVisibleTextNodes(container);
      const clusters = clusterElements(containerTextNodes);
      
      if (clusters.length > 0) {
        // O cluster com maior pontuação é provavelmente a pergunta
        const bestCluster = clusters[0];
        questionText = bestCluster.text;
        
        if (bestCluster.items.length > 0) {
          questionElement = bestCluster.items[0].el;
        }
      }
    }
    
    // 1C. Limpar e normalizar a pergunta
    questionText = normalize(questionText);
    result.question = questionText;
    
    // ETAPA 2: Extrair opções
    result.options = detectOptionsAround(container, questionText);
    
    // ETAPA 3: Refinar opções - remover duplicatas e conteúdos indesejados
    result.options = result.options
      .map(opt => normalize(opt))
      .filter(opt => {
        // Remover opções muito similares à pergunta
        if (questionText && textSimilarity(opt, questionText) > CFG.optionSimilarityThreshold) {
          return false;
        }
        
        // Remover opções muito curtas ou muito longas
        if (opt.length < CFG.minOptionLength || opt.length > CFG.maxOptionLength) {
          return false;
        }
        
        // Remover opções que são números isolados (provavelmente contadores)
        if (/^\d+$/.test(opt)) return false;
        
        return true;
      });
    
    // ETAPA 4: Calcular confiança
    let confidence = 0;
    
    // Pontuar por existência de pergunta
    if (questionText.length >= CFG.questionMinLength) confidence += 40;
    
    // Pontuar por número de opções
    if (result.options.length >= 2) {
      confidence += Math.min(40, result.options.length * 10);
    }
    
    // Pontuar por posição central do container
    try {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(centerX - window.innerWidth / 2, 2) +
        Math.pow(centerY - window.innerHeight / 2, 2)
      );
      confidence += Math.max(0, 20 - distFromCenter / 20);
    } catch {}
    
    result.confidence = Math.min(100, confidence);
    
    return result;
  }

  /**************************************************************************
   * CONSTRUÇÃO DO PAYLOAD E ATUALIZAÇÃO DA UI
   **************************************************************************/
  
  function buildPayload(question, options) {
    const parts = [];
    parts.push(`# ${document.title || 'Sem título'}`);
    parts.push(`**URL:** ${location.href}`);
    
    if (question) {
      parts.push('');
      parts.push('## PERGUNTA:');
      parts.push(question);
    }
    
    if (options && options.length) {
      parts.push('');
      parts.push('## OPÇÕES:');
      options.forEach((o, i) => {
        parts.push(`${String.fromCharCode(65 + i)}) ${o}`);
      });
    }
    
    return parts.join('\n');
  }

  function updatePreview(text, confidence) {
    const box = document.getElementById('santos-preview');
    if (!box) return;
    
    const view = clamp(text || '', 1800).replace(/\n/g, '\n');
    box.innerHTML = view.replace(/\n/g, '<br>');
    
    const host = document.getElementById('santos-host');
    if (host) host.innerText = `Wayground · Conf: ${confidence}%`;
  }

  /**************************************************************************
   * INTERFACE DO USUÁRIO - FLUTUANTE ARRASTÁVEL
   **************************************************************************/
  
  let UI = null;
  let lastPayload = '';
  let uiMinimized = (localStorage.getItem(CFG.saveMinimizedKey) === '1');

  function buildUI() {
    if (document.getElementById('santos-meczada-ui-v13')) return;
    
    UI = document.createElement('div');
    UI.id = 'santos-meczada-ui-v13';
    Object.assign(UI.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      width: '420px',
      zIndex: 2147483647,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      borderRadius: '12px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(6,44,61,0.95), rgba(3,85,100,0.95))',
      color: '#fff',
      userSelect: 'none',
      touchAction: 'none',
      backdropFilter: 'blur(10px)'
    });

    UI.innerHTML = `
      <div id="santos-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;cursor:move;background:rgba(0,0,0,0.2)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:#fff;color:#023e6f;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px">🎯</div>
          <div style="font-weight:700;font-size:16px">SANTOS.meczada</div>
          <div id="santos-host" style="font-size:12px;padding:4px 10px;border-radius:8px;background:rgba(255,255,255,0.12);margin-left:8px">Wayground</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button id="santos-min" title="Minimizar" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center">–</button>
          <button id="santos-close" title="Fechar" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
        </div>
      </div>
      <div id="santos-body" style="padding:12px;display:flex;flex-direction:column;gap:12px">
        <div id="santos-preview" style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;max-height:320px;overflow:auto;font-family:monospace;font-size:13px;line-height:1.4">Aguardando captura...</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="santos-send" style="flex:1;background:#9c27b0;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:700;cursor:pointer;min-width:120px">Enviar Perplexity</button>
          <button id="santos-copy" style="background:#2e7d32;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:700;cursor:pointer;min-width:80px">Copiar</button>
          <button id="santos-manual" style="background:#1976d2;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:700;cursor:pointer;min-width:120px">Capturar área</button>
        </div>
        <div style="font-size:12px;opacity:0.85;text-align:center">Atalhos: Ctrl+Shift+U (mostrar/ocultar), Ctrl+Shift+M (captura manual)</div>
      </div>
    `;
    
    document.body.appendChild(UI);

    // Carregar posição salva
    const pos = localStorage.getItem(CFG.savePositionKey);
    if (pos) {
      try {
        const p = JSON.parse(pos);
        UI.style.left = p.left; 
        UI.style.top = p.top; 
        UI.style.right = 'auto'; 
        UI.style.bottom = 'auto';
      } catch {}
    }

    // Estado minimizado
    if (uiMinimized) {
      document.getElementById('santos-body').style.display = 'none';
      document.getElementById('santos-min').textContent = '+';
    }

    // Configurar event listeners
    document.getElementById('santos-close').onclick = () => UI.remove();
    document.getElementById('santos-min').onclick = toggleMinimize;
    document.getElementById('santos-send').onclick = () => {
      if (!lastPayload) return toast('Nada capturado');
      let q = lastPayload;
      if (q.length > CFG.maxPerplexityChars) q = q.slice(0, CFG.maxPerplexityChars) + '…';
      window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`, '_blank');
    };
    document.getElementById('santos-copy').onclick = async () => {
      try { 
        await navigator.clipboard.writeText(lastPayload || ''); 
        toast('Copiado para a área de transferência'); 
      } catch { 
        toast('Falha ao copiar'); 
      }
    };
    document.getElementById('santos-manual').onclick = enableManualCapture;

    makeDraggable(UI, document.getElementById('santos-header'));
  }

  function toggleMinimize() {
    const body = document.getElementById('santos-body');
    const btn = document.getElementById('santos-min');
    if (!body) return;
    
    if (body.style.display === 'none') {
      body.style.display = 'flex';
      btn.textContent = '–';
      uiMinimized = false;
    } else {
      body.style.display = 'none';
      btn.textContent = '+';
      uiMinimized = true;
    }
    
    localStorage.setItem(CFG.saveMinimizedKey, uiMinimized ? '1' : '0');
  }

  function makeDraggable(container, handle) {
    let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
    
    const onPointerDown = (ev) => {
      ev.preventDefault();
      dragging = true;
      const rect = container.getBoundingClientRect();
      startX = (ev.clientX || (ev.touches && ev.touches[0].clientX));
      startY = (ev.clientY || (ev.touches && ev.touches[0].clientY));
      origX = rect.left;
      origY = rect.top;
      
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp, { once: true });
    };
    
    const onPointerMove = (ev) => {
      if (!dragging) return;
      const cx = ev.clientX || (ev.touches && ev.touches[0].clientX);
      const cy = ev.clientY || (ev.touches && ev.touches[0].clientY);
      if (typeof cx !== 'number' || typeof cy !== 'number') return;
      
      const dx = cx - startX, dy = cy - startY;
      container.style.left = (origX + dx) + 'px';
      container.style.top = (origY + dy) + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    };
    
    const onPointerUp = (ev) => {
      dragging = false;
      localStorage.setItem(CFG.savePositionKey, JSON.stringify({
        left: container.style.left || container.getBoundingClientRect().left + 'px',
        top: container.style.top || container.getBoundingClientRect().top + 'px'
      }));
      
      document.removeEventListener('pointermove', onPointerMove);
    };
    
    handle.addEventListener('pointerdown', onPointerDown, { passive: false });
  }

  function toast(msg) {
    const n = document.createElement('div');
    Object.assign(n.style, {
      position: 'fixed',
      right: '26px',
      bottom: '120px',
      zIndex: 2147483647,
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
  }

  /**************************************************************************
   * CAPTURA MANUAL
   **************************************************************************/
  
  let manualOverlay = null;
  
  function enableManualCapture() {
    if (manualOverlay) return disableManualCapture();
    
    toast('Clique no bloco a ser capturado (Esc para cancelar)');
    manualOverlay = document.createElement('div');
    Object.assign(manualOverlay.style, {
      position: 'fixed',
      inset: 0,
      zIndex: 2147483646,
      cursor: 'crosshair',
      background: 'transparent'
    });
    
    document.body.appendChild(manualOverlay);
    
    const hover = document.createElement('div');
    Object.assign(hover.style, {
      position: 'fixed',
      border: '2px solid #00e5ff',
      background: 'rgba(0,229,255,0.1)',
      pointerEvents: 'none',
      zIndex: 2147483647,
      borderRadius: '6px',
      display: 'none'
    });
    
    document.body.appendChild(hover);

    const move = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const el = document.elementFromPoint(x, y);
      
      if (!el || !isVisible(el)) {
        hover.style.display = 'none';
        return;
      }
      
      const r = el.getBoundingClientRect();
      Object.assign(hover.style, {
        display: 'block',
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px'
      });
    };
    
    const click = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const el = document.elementFromPoint(x, y);
      
      disableManualCapture();
      if (!el) return;
      
      const container = ascendToContainer(el) || el;
      const q = await extractQuestionAndOptions(container);
      lastPayload = buildPayload(q.question, q.options);
      updatePreview(lastPayload, q.confidence);
      toast('Capturado manualmente');
    };
    
    const key = (e) => {
      if (e.key === 'Escape') {
        disableManualCapture();
        toast('Captura cancelada');
      }
    };
    
    manualOverlay.addEventListener('mousemove', move);
    manualOverlay.addEventListener('click', click, { capture: true });
    window.addEventListener('keydown', key, { once: true });
    
    manualOverlay._cleanup = () => {
      manualOverlay.removeEventListener('mousemove', move);
      manualOverlay.removeEventListener('click', click, { capture: true });
      window.removeEventListener('keydown', key);
      hover.remove();
      manualOverlay.remove();
    };
  }

  function disableManualCapture() {
    if (manualOverlay && manualOverlay._cleanup) manualOverlay._cleanup();
    manualOverlay = null;
  }

  /**************************************************************************
   * PROCESSAMENTO PRINCIPAL E OBSERVADORES
   **************************************************************************/
  
  async function processLoop() {
    try {
      const container = findQuestionContainer();
      if (!container) return;
      
      const res = await extractQuestionAndOptions(container);
      lastPayload = buildPayload(res.question, res.options);
      updatePreview(lastPayload, res.confidence);
    } catch (e) {
      console.error('SANTOS.v13 process error', e);
    }
  }

  let mo = null, poll = null;
  
  function startObservers() {
    stopObservers();
    
    // Observer para mudanças no DOM
    mo = new MutationObserver(() => {
      debounceProcess();
    });
    
    mo.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
    
    // Polling como fallback
    poll = setInterval(processLoop, CFG.pollInterval);
    
    // Observar redimensionamento e scroll
    window.addEventListener('resize', debounceProcess);
    window.addEventListener('scroll', debounceProcess, { passive: true });
  }
  
  function stopObservers() {
    if (mo) {
      mo.disconnect();
      mo = null;
    }
    
    if (poll) {
      clearInterval(poll);
      poll = null;
    }
    
    window.removeEventListener('resize', debounceProcess);
    window.removeEventListener('scroll', debounceProcess);
  }
  
  let debounceTimer = null;
  function debounceProcess() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => processLoop(), CFG.debounceMs);
  }

  /**************************************************************************
   * SHORTCUTS DE TECLADO
   **************************************************************************/
  
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
      const ui = document.getElementById('santos-meczada-ui-v13');
      if (ui) ui.style.display = (ui.style.display === 'none' ? 'block' : 'none');
    }
    
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
      enableManualCapture();
    }
  });

  /**************************************************************************
   * INICIALIZAÇÃO
   **************************************************************************/
  
  function init() {
    buildUI();
    startObservers();
    processLoop();
    
    // Notificação de inicialização
    toast('SANTOS.meczada v13 iniciado - Precisão Máxima');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 100);
  } else {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();