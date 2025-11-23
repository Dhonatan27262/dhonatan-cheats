// ==UserScript==
// @name         Intro Profissional - Mario Run
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Abertura estilo Super Mario: Mario corre da esquerda pra direita com parallax, som e skip (estético apenas).
// @match        https://bookmeet.com/*   // <-- ajuste para o domínio desejado
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ========== CONFIGURÁVEIS ========== */
  const DURATION_MS = 4000; // duração total da animação (ms)
  const CANVAS_Z_INDEX = 2147483646;
  // Se tiver sprite sheet: url da sprite (horizontal frames) e número de frames
  // Se preferir usar gif animado, deixe SPRITE_SHEET_URL vazio e marque GIF_FALLBACK true.
  const SPRITE_SHEET_URL = ""; // ex: "https://meu-host.com/mario-sprites.png"
  const SPRITE_FRAMES = 6; // somente relevante se usar sprite sheet
  const GIF_FALLBACK = true; // usa gif fallback se SPRITE_SHEET_URL vazio
  const GIF_URL = "https://i.imgur.com/Uw0S1nh.gif"; // fallback (exemplo)
  const MARIO_WIDTH_PX = 96; // tamanho do personagem em pixels base
  const MARIO_SCALE = 1.15; // escala final do personagem
  const PLAY_SOUND = false; // true para tocar som
  const SOUND_URL = "https://files.catbox.moe/6g8m1o.mp3"; // opção de tema

  /* ========== FIM CONFIG ========== */

  // evita rodar em iframes
  if (window.top !== window.self) return;

  // criar container canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = CANVAS_Z_INDEX;
  canvas.style.pointerEvents = 'auto';
  canvas.id = 'marioIntroCanvas';

  // acessibilidade: role
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Animação de abertura');

  const ctx = canvas.getContext('2d', { alpha: true });
  document.documentElement.appendChild(canvas);

  // responsivo
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // facilita desenho com CSS pixels
  }
  window.addEventListener('resize', resize);
  resize();

  // Carregar sprite/gif
  let marioImage = new Image();
  marioImage.crossOrigin = "anonymous";
  let usingSpriteSheet = !!SPRITE_SHEET_URL;
  if (usingSpriteSheet) {
    marioImage.src = SPRITE_SHEET_URL;
  } else if (GIF_FALLBACK) {
    marioImage.src = GIF_URL;
  } else {
    // desenhar placeholder pixel-art se nenhuma imagem
    const placeholder = document.createElement('canvas');
    placeholder.width = 64;
    placeholder.height = 64;
    const pctx = placeholder.getContext('2d');
    // simples bloco vermelho com "M"
    pctx.fillStyle = '#d33';
    pctx.fillRect(0, 0, 64, 64);
    pctx.fillStyle = '#fff';
    pctx.font = 'bold 32px sans-serif';
    pctx.fillText('M', 12, 44);
    marioImage.src = placeholder.toDataURL();
    usingSpriteSheet = false;
  }

  // carregar som (opcional)
  let audio;
  if (PLAY_SOUND) {
    audio = new Audio(SOUND_URL);
    audio.volume = 0.35;
    audio.loop = false;
    audio.preload = 'auto';
  }

  // animação
  const startTime = performance.now();
  const total = DURATION_MS;
  let finished = false;

  // função de easing (smoothstep / easeInOutCubic)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // loop de desenho
  function draw(now) {
    const elapsed = Math.min(total, now - startTime);
    const t = Math.max(0, Math.min(1, elapsed / total));
    const e = easeInOutCubic(t);

    // limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);

    // ---------- BACKGROUND: sky gradient ----------
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#8fd3ff');
    skyGrad.addColorStop(1, '#a0d7ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // ---------- PARALLAX LAYERS ----------
    // Hills (furthest)
    ctx.save();
    ctx.globalAlpha = 0.95;
    const hillOffset = e * 120; // move slightly with e
    ctx.fillStyle = '#77c75a';
    drawHills(ctx, W, H, -hillOffset * 0.2, 0.7);
    ctx.restore();

    // Clouds (mid)
    ctx.save();
    ctx.globalAlpha = 0.95;
    const cloudOffset = e * 220;
    drawClouds(ctx, W, H, -cloudOffset * 0.6);
    ctx.restore();

    // Foreground (grass path)
    ctx.save();
    drawForeground(ctx, W, H);
    ctx.restore();

    // ---------- MARIO ----------
    // compute mario position (left -> right)
    // start slightly offscreen left, end slightly offscreen right
    const startX = -MARIO_WIDTH_PX * 2;
    const endX = W + MARIO_WIDTH_PX * 2;
    const x = startX + (endX - startX) * e;

    // vertical position (ground)
    const groundY = H * 0.68;
    // small bobbing while running
    const bob = Math.sin(now / 90) * 4 * (1 - Math.abs(0.5 - t));
    const y = groundY - MARIO_WIDTH_PX * 0.75 + bob;

    // shadow
    ctx.save();
    const shadowW = MARIO_WIDTH_PX * 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + MARIO_WIDTH_PX * 0.4, groundY + 8, shadowW * 0.6 * (1 + 0.1 * Math.sin(now / 120)), 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // draw mario image (if sprite sheet and frames, draw correct frame)
    const drawW = MARIO_WIDTH_PX * MARIO_SCALE;
    const drawH = MARIO_WIDTH_PX * MARIO_SCALE;
    if (usingSpriteSheet && marioImage.complete) {
      const frame = Math.floor((now / 80) % SPRITE_FRAMES); // 80ms per frame
      const fw = marioImage.width / SPRITE_FRAMES;
      const fh = marioImage.height;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(marioImage, frame * fw, 0, fw, fh, x, y - drawH * 0.12, drawW, drawH);
    } else if (marioImage.complete) {
      // gif fallback or single image
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(marioImage, x, y - drawH * 0.12, drawW, drawH);
    }

    // optional subtle vignette / title text
    ctx.save();
    ctx.font = '700 22px "Press Start 2P", monospace';
    ctx.fillStyle = `rgba(255,255,255,${0.9 - t * 0.9})`;
    ctx.textAlign = 'center';
    ctx.fillText('Iniciando…', W / 2, H * 0.12);
    ctx.restore();

    // final easing fade + tiny camera shake
    if (t > 0.92) {
      const fade = (t - 0.92) / 0.08;
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, W, H);
    }

    // continuar ou terminar
    if (elapsed < total && !finished) {
      requestAnimationFrame(draw);
    } else {
      // final effects
      finished = true;
      // tiny shake then remove
      const shakeDuration = 250;
      const shakeStart = performance.now();
      (function shakeLoop(now2) {
        const sElapsed = now2 - shakeStart;
        if (sElapsed < shakeDuration) {
          const intensity = 6 * (1 - sElapsed / shakeDuration);
          canvas.style.transform = `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`;
          requestAnimationFrame(shakeLoop);
        } else {
          canvas.style.transform = '';
          // fade out and remove
          canvas.style.transition = 'opacity 300ms ease';
          canvas.style.opacity = '0';
          setTimeout(() => {
            try { canvas.remove(); } catch (e) {}
            if (audio && !audio.paused) audio.pause();
          }, 320);
        }
      })(performance.now());
    }
  }

  // desenha colinas simples
  function drawHills(ctx, W, H, offsetX = 0, scale = 1) {
    ctx.beginPath();
    const baseY = H * 0.78;
    ctx.moveTo(0, H);
    ctx.lineTo(0, baseY + 120);
    for (let i = -1; i < 6; i++) {
      const cx = (i * (W / 5)) + (offsetX * 0.3);
      const cy = baseY - 80 * Math.sin((i + 1) * 0.5) * scale;
      ctx.quadraticCurveTo(cx + 100, cy - 40, cx + (W / 5), baseY + 120);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  // desenha nuvens simples
  function drawClouds(ctx, W, H, offsetX = 0) {
    ctx.fillStyle = '#ffffffcc';
    const cloudCount = Math.max(3, Math.floor(W / 280));
    for (let i = 0; i < cloudCount; i++) {
      const cx = (i / cloudCount) * W + ((offsetX * 0.6) % (W)) + (i * 40);
      const cy = H * 0.18 + (Math.sin(i) * 20);
      drawCloud(ctx, cx - 80, cy, 1.1 + (i % 2) * 0.15);
    }
  }
  function drawCloud(ctx, x, y, scale = 1) {
    ctx.beginPath();
    ctx.ellipse(x + 30 * scale, y, 24 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 60 * scale, y - 8 * scale, 34 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 96 * scale, y, 24 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawForeground(ctx, W, H) {
    // grass strip
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    // small tile pattern suggestion: coins/blocks/tiles could be drawn here
    // we keep it minimal to not distrair
  }

  // iniciar quando imagem carregada (ou imediatamente se já estiver ok)
  function tryStart() {
    if (marioImage.complete) {
      if (PLAY_SOUND && audio) {
        // tocar som ligeiramente antes para sincronizar
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      requestAnimationFrame(draw);
    } else {
      marioImage.onload = () => {
        requestAnimationFrame(draw);
      };
      // timeout fallback
      setTimeout(() => {
        if (!marioImage.complete) {
          requestAnimationFrame(draw);
        }
      }, 300);
    }
  }
  tryStart();

  // skip handlers (click/tap/ESC)
  function skip() {
    finished = true;
    canvas.style.transition = 'opacity 200ms ease';
    canvas.style.opacity = '0';
    setTimeout(() => { try { canvas.remove(); } catch (e) {} }, 220);
    if (audio && !audio.paused) audio.pause();
  }
  canvas.addEventListener('click', skip);
  canvas.addEventListener('touchstart', skip, { passive: true });
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') skip();
  });

  // evita bloqueio de pointer events no site (é apenas estético) — removed after animation
})();