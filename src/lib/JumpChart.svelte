<script>
  import { universities } from './data.js';
  import { clamp, lerp, easeInOut } from './scroll.js';

  // t: 0..1 raw scroll progress for the whole jump section.
  // highlight: ids to spotlight (movers). Empty = neutral.
  // finale: reveal the full 2026 column again, for a side-by-side recap.
  let { t = 0, highlight = [], finale = false } = $props();

  // Smooth the scroll signal with a little inertia so the animation glides
  // instead of tracking every discrete wheel tick.
  let st = $state(t);
  $effect(() => {
    let raf;
    const tick = () => {
      const target = t;
      const next = st + (target - st) * 0.09;
      st = Math.abs(target - next) < 0.0004 ? target : next;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  // ---- Board geometry: 2026 column on the left, 2027 on the right ----
  // On narrow screens the board switches to a taller, narrower viewBox so the
  // chart fills the available vertical space instead of being letterboxed by
  // a wide landscape aspect ratio inside a tall portrait container. Tablet
  // widths get their own in-between viewBox, since a container that's roughly
  // as tall as it is wide is otherwise squeezed down to a thin landscape strip
  // by the desktop aspect ratio, leaving most of the height empty.
  let tier = $state('desktop');
  $effect(() => {
    const mqMobile = window.matchMedia('(max-width: 700px)');
    const mqTablet = window.matchMedia('(max-width: 1000px)');
    const update = () => {
      tier = mqMobile.matches ? 'mobile' : mqTablet.matches ? 'tablet' : 'desktop';
    };
    update();
    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
    return () => {
      mqMobile.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
    };
  });
  const pick = (mobileVal, tabletVal, desktopVal) =>
    tier === 'mobile' ? mobileVal : tier === 'tablet' ? tabletVal : desktopVal;

  const MAXR = 32;
  let vbW = $derived(pick(100, 150, 200));
  let vbH = $derived(pick(225, 185, 122));
  let yTop = $derived(pick(17, 20, 15));
  let yBot = $derived(pick(208, 178, 116));
  let XL = $derived(pick(24, 35, 46));
  let XR = $derived(pick(78, 115, 154));
  let R = $derived(pick(1.7, 1.55, 1.4));
  // Universities tied on the same rank sit at the exact same height, spaced
  // apart horizontally instead of one being nudged to a different rank line.
  let tieGap = $derived(pick(4.6, 4.2, 3.8));
  let edge = $derived(pick(6, 8, 10));
  let tickEdge = $derived(pick(3, 4.5, 6));
  const y = (rank) => yTop + ((rank - 1) / (MAXR - 1)) * (yBot - yTop);

  function tiePositions(rankOf, gap) {
    const groups = new Map();
    for (const u of universities) {
      const r = rankOf(u);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(u);
    }
    const out = {};
    for (const group of groups.values()) {
      const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
      const n = sorted.length;
      sorted.forEach((u, i) => {
        out[u.id] = (i - (n - 1) / 2) * gap;
      });
    }
    return out;
  }
  let tieL = $derived(tiePositions((u) => u.qs26, tieGap));
  let tieR = $derived(tiePositions((u) => u.qs27, tieGap));

  // Stagger: schools get transferred to the 2027 board one after another,
  // best new rank first, each within its own [start, start + DUR] window.
  const n = universities.length;
  const ordered = [...universities].sort((a, b) => a.qs27 - b.qs27 || a.id.localeCompare(b.id));
  const startOf = {};
  ordered.forEach((u, i) => {
    // Interleave the cascade (stride 7 through the rank order) so schools
    // erased at the same moment sit far apart on the board.
    const slot = (i * 7) % n;
    startOf[u.id] = 0.04 + (slot / n) * 0.3;
  });
  const DUR = 0.1;

  // The whole board slides up into its rails as the section arrives.
  let slide = $derived((1 - clamp(st * 5)) * 48);

  let nodes = $derived.by(() => {
    return universities.map((u) => {
      const lt = clamp((st - startOf[u.id]) / DUR, 0, 1);
      const delta = u.qs26 - u.qs27; // + = climbed

      const dxL = tieL[u.id];
      const dxR = tieR[u.id];
      const xl = XL + dxL;
      const yl = y(u.qs26);
      const xr = XR + dxR;
      const yr = y(u.qs27);
      // The member of a tie sitting closer to the centre gap points its label
      // inward instead of the column's usual outward direction, so the two
      // labels read away from each other instead of overlapping.
      const flipL = dxL > 0;
      const flipR = dxR < 0;

      // --- Phase 1: the eraser wipes the school off the 2026 board ---
      // A faint ghost of the original mark is left behind, like real chalk.
      // On the finale step, bring the 2026 marks back to full strength so both
      // years can be read side by side, and skip the eraser/smudge props.
      const leftO = finale ? 1 : 1 - 0.9 * clamp((lt - 0.1) / 0.3);
      const eraserO =
        finale || lt <= 0 || lt >= 0.5
          ? 0
          : Math.min(clamp(lt / 0.06), clamp((0.5 - lt) / 0.08));
      const ep = clamp(lt / 0.48);
      const eraserX = xl - 4.5 - Math.sin(ep * Math.PI * 3) * 5;
      const eraserY = yl + Math.sin(ep * Math.PI * 6.5) * 0.7;
      const smudgeO = finale || lt <= 0 || lt >= 0.6 ? 0 : Math.sin(Math.PI * clamp(lt / 0.6)) * 0.28;

      // --- Phase 2: a dashed chalk guide line travels to the new rank ---
      const connP = easeInOut(clamp((lt - 0.3) / 0.4));
      const cx2 = lerp(xl, xr, connP);
      const cy2 = lerp(yl, yr, connP);
      const connO = connP <= 0 ? 0 : 0.5 - 0.32 * clamp((lt - 0.88) / 0.12);

      // --- Phase 3: a chalk stick draws the dot, then writes the label ---
      const drawP = clamp((lt - 0.56) / 0.24);
      const fillO = clamp((lt - 0.78) / 0.12);
      const labelO = clamp((lt - 0.82) / 0.14);
      const chalkO =
        lt <= 0.52 || lt >= 0.995
          ? 0
          : Math.min(clamp((lt - 0.52) / 0.05), clamp((0.995 - lt) / 0.06));
      let chalkX = xr;
      let chalkY = yr;
      if (drawP < 1) {
        // Tip follows the circle outline as it is drawn (SVG circles start
        // their stroke at 3 o'clock and run clockwise).
        const a = drawP * Math.PI * 2;
        chalkX = xr + Math.cos(a) * R;
        chalkY = yr + Math.sin(a) * R;
      } else {
        // Then it slides under the label (rightward, or leftward if the
        // label points inward) as the name appears.
        const lp = clamp((lt - 0.82) / 0.14);
        const reach = 2.6 + lp * u.short.length * 1.15;
        chalkX = flipR ? xr - reach : xr + reach;
        chalkY = yr + 0.9;
      }

      return {
        ...u,
        delta,
        xl,
        yl,
        xr,
        yr,
        flipL,
        flipR,
        leftO,
        eraserO,
        eraserX,
        eraserY,
        smudgeO,
        connO,
        cx2,
        cy2,
        drawP,
        fillO,
        labelO,
        chalkO,
        chalkX,
        chalkY,
        isHi: highlight.length === 0 || highlight.includes(u.id)
      };
    });
  });

  const ticks = [1, 5, 10, 15, 20, 25, 30];
</script>

<div class="boardwrap" style="transform: translateY({slide}px)">
  <div class="board">
    <svg viewBox="0 0 {vbW} {vbH}" preserveAspectRatio="xMidYMid meet">
      <!-- rank scale -->
      {#each ticks as tk}
        <text class="rk" x={tickEdge} y={y(tk) + 0.8} text-anchor="middle">{tk}</text>
        <line class="grid" x1={edge} y1={y(tk)} x2={vbW - edge} y2={y(tk)} />
        <text class="rk" x={vbW - tickEdge} y={y(tk) + 0.8} text-anchor="middle">{tk}</text>
      {/each}

      <!-- column headers -->
      <text class="colhead" x={XL} y="8" text-anchor="middle">QS 2026</text>
      <text class="colarrow" x={vbW / 2} y="8" text-anchor="middle">→</text>
      <text class="colhead" x={XR} y="8" text-anchor="middle">QS 2027</text>

      {#each nodes as p (p.id)}
        <g
          class="node"
          class:dim={!p.isHi}
          class:up={p.isHi && p.delta > 0}
          class:down={p.isHi && p.delta < 0}
        >
          {#if p.connO > 0}
            <line class="conn" x1={p.xl} y1={p.yl} x2={p.cx2} y2={p.cy2} opacity={p.connO} />
          {/if}

          <!-- 2026 mark (fades to a chalk ghost once erased, or back to full on the finale) -->
          <g class="leftmark" opacity={p.leftO}>
            <circle class="dot ldot" cx={p.xl} cy={p.yl} r={R} />
            <text
              class="name lname"
              x={p.flipL ? p.xl + 2.6 : p.xl - 2.6}
              y={p.yl + 0.85}
              text-anchor={p.flipL ? 'start' : 'end'}
            >{p.short}</text>
          </g>

          {#if p.smudgeO > 0}
            <ellipse class="smudge" cx={p.xl - 3.5} cy={p.yl} rx="8" ry="2.4" opacity={p.smudgeO} />
          {/if}

          {#if p.eraserO > 0}
            <g class="spr-eraser" opacity={p.eraserO} transform="translate({p.eraserX} {p.eraserY}) rotate(-12)">
              <rect class="er-top" x="-4.6" y="-4.1" width="9.2" height="2.7" rx="0.8" />
              <rect class="er-felt" x="-4.6" y="-1.7" width="9.2" height="1.9" rx="0.5" />
            </g>
          {/if}

          <!-- 2027 mark, drawn in by the chalk -->
          {#if p.drawP > 0}
            <circle
              class="dot rdot"
              cx={p.xr}
              cy={p.yr}
              r={R}
              pathLength="1"
              style="stroke-dashoffset:{1 - p.drawP}; fill-opacity:{p.fillO}"
            />
            {#if p.labelO > 0}
              <text
                class="name rname"
                x={p.flipR ? p.xr - 2.6 : p.xr + 2.6}
                y={p.yr + 0.85}
                text-anchor={p.flipR ? 'end' : 'start'}
                opacity={p.labelO}
              >
                {p.short}{#if p.delta !== 0 && highlight.length && p.isHi}<tspan class="dtext">
                  {' '}{p.delta > 0 ? `▲+${p.delta}` : `▼${p.delta}`}</tspan>{/if}
              </text>
            {/if}
          {/if}

          {#if p.chalkO > 0}
            <g class="spr-chalk" opacity={p.chalkO} transform="translate({p.chalkX} {p.chalkY}) rotate(38)">
              <rect class="ck-body" x="0.4" y="-0.55" width="4.4" height="1.1" rx="0.35" />
            </g>
          {/if}
        </g>
      {/each}

      <!-- chalk progress line -->
      <line
        class="scrubline"
        x1={edge}
        y1={vbH - edge / 2}
        x2={edge + clamp(st) * (vbW - edge * 2)}
        y2={vbH - edge / 2}
      />
    </svg>
  </div>
  <div class="tray">
    <span class="stick"></span>
    <span class="eraserblock"></span>
  </div>
</div>

<style>
  .boardwrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(12px, 2.4vh, 26px) clamp(14px, 2.4vw, 30px) clamp(8px, 1.6vh, 18px);
    background:
      repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.07) 0 3px, transparent 3px 9px),
      linear-gradient(180deg, #503a26, #3a2917 55%, #2e2012);
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.08),
      inset 0 -4px 10px rgba(0, 0, 0, 0.5);
    will-change: transform;
  }
  .board {
    flex: 1;
    min-height: 0;
    border-radius: 4px;
    background:
      radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.03), transparent 50%),
      radial-gradient(circle at 75% 80%, rgba(255, 255, 255, 0.02), transparent 45%),
      linear-gradient(180deg, var(--board-2), var(--board));
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.35),
      inset 0 4px 22px rgba(0, 0, 0, 0.4),
      inset 0 0 90px rgba(0, 0, 0, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(6px, 1.4vh, 16px);
  }
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* chalk tray with resting chalk + eraser */
  .tray {
    position: relative;
    height: 12px;
    width: min(46%, 440px);
    margin: 10px auto 0;
    border-radius: 2px 2px 5px 5px;
    background: linear-gradient(180deg, #5a4128, #3a2917);
    box-shadow:
      0 4px 9px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  .tray .stick {
    position: absolute;
    left: 16%;
    top: -5px;
    width: 54px;
    height: 7px;
    border-radius: 3px;
    background: linear-gradient(180deg, #f6f5ec, #cfcec2);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.35);
  }
  .tray .eraserblock {
    position: absolute;
    right: 13%;
    top: -9px;
    width: 62px;
    height: 11px;
    border-radius: 2px;
    background: linear-gradient(180deg, #574032 0 55%, #cfccc0 55%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  /* --- chart marks --- */
  .grid {
    stroke: var(--chalk-faint);
    stroke-width: 0.1;
  }
  .rk {
    fill: var(--chalk-dim);
    font-family: var(--font-chalk);
    font-size: 2.4px;
  }
  .colhead {
    fill: var(--qs);
    font-family: var(--font-chalk);
    font-size: 5.5px;
    letter-spacing: 0.4px;
  }
  .colarrow {
    fill: var(--chalk-dim);
    font-family: var(--font-chalk);
    font-size: 4.5px;
  }

  .node {
    transition: opacity 0.3s ease;
  }
  .leftmark {
    transition: opacity 0.6s ease;
  }
  .node.dim {
    opacity: 0.28;
  }

  .dot {
    fill: var(--chalk);
  }
  .rdot {
    stroke: var(--chalk);
    stroke-width: 0.3;
    stroke-dasharray: 1;
  }
  .node.up .dot {
    fill: var(--accent-good);
  }
  .node.up .rdot {
    stroke: var(--accent-good);
  }
  .node.down .dot {
    fill: var(--accent-warn);
  }
  .node.down .rdot {
    stroke: var(--accent-warn);
  }

  .conn {
    stroke: var(--chalk-faint);
    stroke-width: 0.3;
    stroke-dasharray: 0.9 1.1;
    stroke-linecap: round;
  }
  .node.up .conn {
    stroke: color-mix(in srgb, var(--accent-good) 55%, transparent);
  }
  .node.down .conn {
    stroke: color-mix(in srgb, var(--accent-warn) 55%, transparent);
  }

  .name {
    fill: var(--chalk);
    font-family: var(--font-chalk);
    font-size: 2.7px;
    paint-order: stroke;
    stroke: var(--board);
    stroke-width: 0.55;
  }
  .node.dim .name {
    fill: var(--chalk-dim);
  }
  .dtext {
    font-weight: 700;
  }
  .node.up .dtext {
    fill: var(--accent-good);
  }
  .node.down .dtext {
    fill: var(--accent-warn);
  }

  .smudge {
    fill: var(--chalk);
    filter: blur(1.2px);
  }
  .er-top {
    fill: #4a3628;
  }
  .er-felt {
    fill: #d8d4c8;
  }
  .ck-body {
    fill: #f3f3ea;
  }

  .scrubline {
    stroke: color-mix(in srgb, var(--qs) 55%, transparent);
    stroke-width: 0.4;
    stroke-linecap: round;
  }

  @media (max-width: 1000px) {
    .name {
      font-size: 3.25px;
    }
    .rk {
      font-size: 2.7px;
    }
    .colhead {
      font-size: 6.25px;
    }
  }

  @media (max-width: 700px) {
    .name {
      font-size: 3.8px;
    }
    .rk {
      font-size: 3px;
    }
    .colhead {
      font-size: 7px;
    }
    .tray {
      display: none;
    }
  }
</style>
