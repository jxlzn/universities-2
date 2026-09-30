<script>
  // A chalk stick "writes" the headline across three lines:
  //   1. before
  //   2. insertion (highlighted) + after
  //   3. line2
  // Each glyph fades in with slight wobble and density variation so the text
  // feels drawn, not wiped on with a horizontal mask.
  import DustPuff from './DustPuff.svelte';

  if (typeof window !== 'undefined' && !window.__ch_loadTime) window.__ch_loadTime = Date.now();

  let {
    before = "Does the rise of Asia's universities pass",
    insertion = "Times Higher Education's",
    after = 'test?',
    line2 = 'THE 2027 rankings are out',
    startDelay = 0.15,
    onDone = () => {}
  } = $props();

  let vw = $state(typeof window !== 'undefined' ? window.innerWidth : 1200);
  let ready = $state(false);
  let reduced = $state(false);

  $effect(() => {
    const onResize = () => (vw = window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  $effect(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const markReady = () => (ready = true);
    if (document.fonts?.ready) {
      document.fonts.ready.then(markReady).catch(markReady);
    } else {
      markReady();
    }
  });

  // Measure with a real SVG <text> so layout matches paint (canvas metrics diverge on Kalam).
  function getMeasureEl() {
    if (typeof document === 'undefined') return null;
    if (!getMeasureEl.el) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText =
        'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('font-family', "Kalam, 'Comic Sans MS', cursive");
      text.setAttribute('font-weight', '700');
      text.style.letterSpacing = '0';
      text.style.fontKerning = 'normal';
      svg.appendChild(text);
      document.body.appendChild(svg);
      getMeasureEl.el = text;
    }
    return getMeasureEl.el;
  }

  function measure(text, size) {
    const el = getMeasureEl();
    if (!el) return text.length * size * 0.5;
    el.setAttribute('font-size', String(size));
    el.textContent = text;
    return el.getComputedTextLength();
  }

  const MAX_SIZE = 50;
  const MIN_SIZE = 15;
  const GAP_EM = 0.62;
  const MOBILE_MAX = 820;

  let isMobile = $derived(vw <= MOBILE_MAX);
  let maxWidth = $derived(Math.min(740, vw - (isMobile ? 20 : 64)));
  let fitSafety = $derived(isMobile ? 1 : 1.18);
  let minFontSize = $derived(isMobile ? 20 : MIN_SIZE);

  function fitFontSize() {
    if (typeof document === 'undefined') return MAX_SIZE;
    let size = MAX_SIZE;
    while (size > minFontSize) {
      const w1 = measure(before, size);
      const w2 = measure(insertion, size) + size * GAP_EM + measure(after, size);
      const w3 = measure(line2, size);
      if (Math.max(w1, w2, w3) * fitSafety <= maxWidth) break;
      size -= 1;
    }
    return size;
  }

  let fontSize = $derived(ready ? fitFontSize() : Math.min(MAX_SIZE, vw * (isMobile ? 0.06 : 0.045)));

  let beforeW = $derived(ready ? measure(before, fontSize) : 0);
  let insertW = $derived(ready ? measure(insertion, fontSize) : 0);
  let afterW = $derived(ready ? measure(after, fontSize) : 0);
  let line2W = $derived(ready ? measure(line2, fontSize) : 0);
  let gapW = $derived(fontSize * GAP_EM);

  let beforeStartX = $derived((maxWidth - beforeW) / 2);
  let beforeEndX = $derived(beforeStartX + beforeW);
  let row2W = $derived(insertW + gapW + afterW);
  let insertStartX = $derived((maxWidth - row2W) / 2);
  let insertEndX = $derived(insertStartX + insertW);
  let afterStartX = $derived(insertEndX + gapW);
  let afterEndX = $derived(afterStartX + afterW);
  let line2StartX = $derived((maxWidth - line2W) / 2);
  let line2EndX = $derived(line2StartX + line2W);

  let lineGap = $derived(fontSize * 1.22);
  let baselineY1 = $derived(fontSize * 0.95);
  let baselineY2 = $derived(baselineY1 + lineGap);
  let baselineY3 = $derived(baselineY2 + lineGap);
  let svgHeight = $derived(baselineY3 + fontSize * 0.4);

  function hash01(n, seed = 0) {
    const a = Math.sin((n + seed) * 127.1) * 43758.5453;
    return a - Math.floor(a);
  }

  // Place each glyph from full-string SVG advances (not per-char widths).
  // Solo glyph widths ignore kerning and give uneven gaps in cursive faces like Kalam.
  function buildCharLayout(text, size, startX, seed) {
    const el = getMeasureEl();
    const chars = [...text];
    if (!el) {
      let x = startX;
      return chars.map((char, i) => {
        const w = size * 0.5;
        const layout = { char, x, w, cx: x + w / 2, dy: 0, rot: 0, density: 1 };
        x += w;
        return layout;
      });
    }
    el.setAttribute('font-size', String(size));
    el.textContent = text;
    let codeUnit = 0;
    return chars.map((char, i) => {
      const x = startX + (codeUnit === 0 ? 0 : el.getSubStringLength(0, codeUnit));
      const w = el.getSubStringLength(codeUnit, char.length);
      codeUnit += char.length;
      return {
        char,
        x,
        w,
        cx: x + w / 2,
        dy: (hash01(i, seed) - 0.5) * size * 0.11,
        rot: (hash01(i, seed + 17) - 0.5) * 3.2,
        density: 0.86 + hash01(i, seed + 41) * 0.14
      };
    });
  }

  let beforeChars = $derived(ready ? buildCharLayout(before, fontSize, beforeStartX, 1) : []);
  let insertChars = $derived(ready ? buildCharLayout(insertion, fontSize, insertStartX, 23) : []);
  let afterChars = $derived(ready ? buildCharLayout(after, fontSize, afterStartX, 7) : []);
  let line2Chars = $derived(ready ? buildCharLayout(line2, fontSize, line2StartX, 53) : []);

  function charReveal(progress, index, total) {
    if (progress <= 0 || total === 0) return 0;
    const start = index / total;
    const end = (index + 1) / total;
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    const p = (progress - start) / (end - start);
    return p * p * (3 - 2 * p);
  }

  function tipXFromLayout(layout, progress) {
    if (!layout.length) return 0;
    const start = layout[0].x;
    const end = layout[layout.length - 1].x + layout[layout.length - 1].w;
    const target = start + (end - start) * progress;
    for (const c of layout) {
      if (target <= c.x + c.w) return target;
    }
    return end;
  }

  const SPEED = 440;
  const wDur = (px, min = 0.22, max = 1.1) => Math.min(max, Math.max(min, px / SPEED));
  const MOVE_TO_ROW2 = 0.2;
  const MOVE_GAP = 0.12;
  const PAUSE_BEFORE_L3 = 0.2;
  const MOVE_TO_L3 = 0.22;

  let timeline = $derived.by(() => {
    if (!ready) return null;
    let t = startDelay;
    const seg = (extra) => {
      const s = { start: t, ...extra };
      t += extra.dur;
      return s;
    };
    const before_ = seg({ type: 'write', key: 'before', dur: wDur(beforeW), x1: beforeStartX, x2: beforeEndX, y: baselineY1 });
    const moveRow2 = seg({ type: 'move', dur: MOVE_TO_ROW2, x1: beforeEndX, y1: baselineY1, x2: insertStartX, y2: baselineY2 });
    const insert = seg({ type: 'write', key: 'insertion', dur: wDur(insertW, 0.3, 1.0), x1: insertStartX, x2: insertEndX, y: baselineY2 });
    const moveGap = seg({ type: 'move', dur: MOVE_GAP, x1: insertEndX, y1: baselineY2, x2: afterStartX, y2: baselineY2 });
    const after_ = seg({ type: 'write', key: 'after', dur: wDur(afterW), x1: afterStartX, x2: afterEndX, y: baselineY2 });
    t += PAUSE_BEFORE_L3;
    const moveL3 = seg({ type: 'move', dur: MOVE_TO_L3, x1: afterEndX, y1: baselineY2, x2: line2StartX, y2: baselineY3 });
    const line2_ = seg({ type: 'write', key: 'line2', dur: wDur(line2W, 0.35, 1.35), x1: line2StartX, x2: line2EndX, y: baselineY3 });
    return {
      segs: [before_, moveRow2, insert, moveGap, after_, moveL3, line2_],
      total: t,
      lastX: line2EndX,
      lastY: baselineY3
    };
  });

  const layouts = $derived({
    before: beforeChars,
    insertion: insertChars,
    after: afterChars,
    line2: line2Chars
  });

  let reveal = $state({ before: 0, insertion: 0, after: 0, line2: 0 });
  let chalk = $state({ x: 0, y: 0, angle: 36, visible: false, lifted: false });
  let showDust = $state(false);
  let dustPos = $state({ x: 0, y: 0 });

  function ease(p) {
    return p * p * (3 - 2 * p);
  }

  function applyElapsed(elapsed, tl, charLayouts, size) {
    let tipX = tl.segs[0].x1;
    let tipY = tl.segs[0].y ?? tl.segs[0].y1;
    let tipAngle = 36;
    let visible = false;
    const r = { before: 0, insertion: 0, after: 0, line2: 0 };

    for (const s of tl.segs) {
      const p = Math.min(1, Math.max(0, (elapsed - s.start) / s.dur));
      if (elapsed >= s.start) visible = true;
      if (s.type === 'write') {
        r[s.key] = p;
        const layout = charLayouts[s.key] ?? [];
        if (elapsed >= s.start && elapsed <= s.start + s.dur + 0.001) {
          tipX = tipXFromLayout(layout, p);
          const wobble = Math.sin(p * Math.PI * Math.max(layout.length, 1) * 1.4 + s.start * 3) * size * 0.05;
          tipY = s.y + wobble;
          tipAngle = 36 + Math.sin(elapsed * 11 + s.x1) * 6;
        } else if (elapsed > s.start + s.dur) {
          tipX = s.x2;
          tipY = s.y;
        }
      } else if (s.type === 'move') {
        if (elapsed >= s.start && elapsed <= s.start + s.dur + 0.001) {
          const pe = ease(p);
          tipX = s.x1 + (s.x2 - s.x1) * pe;
          tipY = s.y1 + (s.y2 - s.y1) * pe;
          tipAngle = 36 + (pe - 0.5) * 8;
        } else if (elapsed > s.start + s.dur) {
          tipX = s.x2;
          tipY = s.y2;
        }
      }
    }

    reveal = r;
    chalk = { x: tipX, y: tipY, angle: tipAngle, visible, lifted: chalk.lifted };
    if (typeof window !== 'undefined') {
      window.__ch_debug = { elapsed, total: tl.total, reveal: r, sinceLoad: (Date.now() - window.__ch_loadTime) / 1000 };
    }
  }

  let doneFired = false;
  $effect(() => {
    if (!ready || !timeline) return;
    if (reduced) {
      reveal = { before: 1, insertion: 1, after: 1, line2: 1 };
      if (!doneFired) {
        doneFired = true;
        onDone();
      }
      return;
    }

    let raf;
    let start = null;
    function tick(ts) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / 1000;
      applyElapsed(elapsed, timeline, layouts, fontSize);
      if (elapsed >= timeline.total) {
        if (!doneFired) {
          doneFired = true;
          dustPos = { x: timeline.lastX, y: timeline.lastY };
          showDust = true;
          chalk = { ...chalk, lifted: true };
          onDone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div class="chalk-headline-wrap">
  <svg
    class="chalk-headline"
    style:max-width="{maxWidth}px"
    width={maxWidth}
    height={svgHeight}
    viewBox="0 0 {maxWidth} {svgHeight}"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter id="chalk-grain" x="-8%" y="-20%" width="116%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.55" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="chalk-fresh" x="-15%" y="-30%" width="130%" height="160%">
        <feGaussianBlur stdDeviation="0.55" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g filter="url(#chalk-grain)">
      {#each beforeChars as c, i}
        {@const rp = charReveal(reveal.before, i, beforeChars.length)}
        {#if rp > 0.01}
          <text
            class="chalk-char"
            x={c.x}
            y={baselineY1 + c.dy * (1 - rp)}
            font-size={fontSize}
            opacity={rp * c.density}
            transform="rotate({c.rot * (1 - rp)} {c.cx} {baselineY1})"
            filter={rp < 0.92 ? 'url(#chalk-fresh)' : undefined}
          >{c.char}</text>
        {/if}
      {/each}

      {#each insertChars as c, i}
        {@const rp = charReveal(reveal.insertion, i, insertChars.length)}
        {#if rp > 0.01}
          <text
            class="chalk-char insertion"
            x={c.x}
            y={baselineY2 + c.dy * (1 - rp)}
            font-size={fontSize}
            opacity={rp * c.density}
            transform="rotate({c.rot * (1 - rp)} {c.cx} {baselineY2})"
            filter={rp < 0.92 ? 'url(#chalk-fresh)' : undefined}
          >{c.char}</text>
        {/if}
      {/each}

      {#each afterChars as c, i}
        {@const rp = charReveal(reveal.after, i, afterChars.length)}
        {#if rp > 0.01}
          <text
            class="chalk-char"
            x={c.x}
            y={baselineY2 + c.dy * (1 - rp)}
            font-size={fontSize}
            opacity={rp * c.density}
            transform="rotate({c.rot * (1 - rp)} {c.cx} {baselineY2})"
            filter={rp < 0.92 ? 'url(#chalk-fresh)' : undefined}
          >{c.char}</text>
        {/if}
      {/each}

      {#each line2Chars as c, i}
        {@const rp = charReveal(reveal.line2, i, line2Chars.length)}
        {#if rp > 0.01}
          <text
            class="chalk-char"
            x={c.x}
            y={baselineY3 + c.dy * (1 - rp)}
            font-size={fontSize}
            opacity={rp * c.density}
            transform="rotate({c.rot * (1 - rp)} {c.cx} {baselineY3})"
            filter={rp < 0.92 ? 'url(#chalk-fresh)' : undefined}
          >{c.char}</text>
        {/if}
      {/each}
    </g>

    {#if !reduced}
      <g class="chalk-stick-outer" transform="translate({chalk.x} {chalk.y}) rotate({chalk.angle})">
        <g class="chalk-stick" class:visible={chalk.visible} class:lifted={chalk.lifted}>
          <rect class="stick-body" x={fontSize * 0.06} y={-fontSize * 0.1} width={fontSize * 0.85} height={fontSize * 0.2} rx={fontSize * 0.06} />
        </g>
      </g>
    {/if}
  </svg>
  {#if showDust}
    <div class="headline-dust" style="left:{dustPos.x}px; top:{dustPos.y - fontSize * 0.7}px;">
      <DustPuff count={9} size={5} spread={30} />
    </div>
  {/if}
</div>

<style>
  .chalk-headline-wrap {
    position: relative;
    width: 100%;
    margin: auto 0;
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  /* Scales down (viewBox, "meet") when the hero runs short on height. */
  .chalk-headline {
    display: block;
    width: 100%;
    height: auto;
    flex: 1 1 auto;
    min-height: 0;
    margin: 0 auto;
    overflow: visible;
  }
  .chalk-char {
    font-family: var(--font-chalk);
    font-weight: 700;
    fill: var(--chalk);
    letter-spacing: 0;
    font-kerning: normal;
    text-rendering: geometricPrecision;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .chalk-char.insertion {
    fill: var(--qs);
  }
  .chalk-stick {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .chalk-stick.visible {
    opacity: 1;
  }
  .chalk-stick.lifted {
    transition: opacity 0.5s ease 0.35s, transform 0.6s ease 0.35s;
    opacity: 0;
    transform: translate(var(--lift-x, 0px), -14px) rotate(20deg);
  }
  .stick-body {
    fill: #f3f1e6;
    stroke: rgba(0, 0, 0, 0.12);
    stroke-width: 0.4;
  }
  .headline-dust {
    position: absolute;
    width: 1px;
    height: 1px;
  }
</style>
