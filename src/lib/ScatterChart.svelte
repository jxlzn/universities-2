<script>
  import { universities, systems } from './data.js';

  // mode: 'us' | 'the': which ranking to compare QS against on the Y axis.
  // highlight: array of university ids to emphasise (empty = all lit).
  let { mode = 'us', highlight = [] } = $props();

  const MAX = 25;
  const pad = { l: 14, r: 6, t: 6, b: 14 };
  const HAT_W = 4;
  const HAT_H = (HAT_W * 53.31) / 100;

  const sx = (rank) => pad.l + ((rank - 1) / (MAX - 1)) * (100 - pad.l - pad.r);
  const sy = (rank) => pad.t + ((rank - 1) / (MAX - 1)) * (100 - pad.t - pad.b);

  let points = $derived(
    universities
      .filter((u) => u.qs27 != null && u.qs27 <= MAX && u[mode] != null && u[mode] <= MAX)
      .map((u) => ({
        ...u,
        cx: sx(u.qs27),
        cy: sy(u[mode]),
        gap: Math.abs(u.qs27 - u[mode])
      }))
  );

  const ticks = [1, 5, 10, 15, 20, 25];
  let lit = (id) => highlight.length === 0 || highlight.includes(id);
</script>

<div class="scatter">
  <div class="cmp">
    <span class="tag" style="color:{systems.qs.color}">QS 2027</span>
    <span class="vs">vs</span>
    <span class="tag" style="color:{systems[mode].color}">{systems[mode].label}</span>
  </div>
  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
    <defs>
      <symbol id="hat-icon" viewBox="0 0 100 53.31">
        <path
          d="M20.14,24.04l27.47,15.41,31.84-3.85-2.82,13.87c-10.57-2.31-20.99-.54-31.32,3.85-8.54-8.18-17.88-13.59-28.24-15.4l3.08-13.87ZM.12,9.5L54.04,0l45.96,29.53-52.63,6.16L.12,9.5Z"
          fill="currentColor"
        />
        <path
          d="M12.02,30.78c1.48,0,2.69-1.03,2.69-2.3,0-1.03-.79-1.9-1.87-2.19V10.03h-1.63v16.25c-1.08.3-1.87,1.17-1.87,2.19,0,1.27,1.2,2.3,2.69,2.3Z"
          fill="currentColor"
        />
        <path
          d="M12.02,31.43c-.48,0-.94-.09-1.36-.24-.79,4.06-1.33,10.37-1.33,11.74,0,2.06,1.2-1.02,2.69-1.02s2.69,3.09,2.69,1.02c0-1.37-.53-7.67-1.33-11.74-.42.15-.88.24-1.36.24Z"
          fill="currentColor"
        />
      </symbol>
    </defs>
    <!-- agreement diagonal -->
    <line
      x1={sx(1)} y1={sy(1)} x2={sx(MAX)} y2={sy(MAX)}
      class="diag"
    />
    <!-- grid + ticks -->
    {#each ticks as t}
      <line x1={sx(t)} y1={pad.t} x2={sx(t)} y2={100 - pad.b} class="grid" />
      <line x1={pad.l} y1={sy(t)} x2={100 - pad.r} y2={sy(t)} class="grid" />
      <text x={sx(t)} y={100 - pad.b + 4} class="tick" text-anchor="middle">{t}</text>
      <text x={pad.l - 1.5} y={sy(t) + 1.2} class="tick" text-anchor="end">{t}</text>
    {/each}

    <text x={(pad.l + 100 - pad.r) / 2} y={99.5} class="axis-label" text-anchor="middle">
      ← Better QS 2027 rank
    </text>
    <text
      x={-((pad.t + 100 - pad.b) / 2)} y={3.4}
      class="axis-label" text-anchor="middle" transform="rotate(-90)"
    >
      Better {systems[mode].label} rank →
    </text>

    {#each points as p (p.id)}
      <g class="pt" class:dim={!lit(p.id)} style="transform: translate({p.cx}px, {p.cy}px)">
        <use
          href="#hat-icon"
          class="dot"
          class:big={p.gap >= 6}
          x={-HAT_W / 2}
          y={-HAT_H / 2}
          width={HAT_W}
          height={HAT_H}
        />
        <text x={HAT_W / 2 + 0.6} y="0.9" class="lbl">{p.short}</text>
      </g>
    {/each}
  </svg>
  <p class="hint note">Only universities in our sample that rank within the top 25 on both QS 2027 and {systems[mode].label} are shown.</p>
  <p class="hint">Universities that fall on the dashed line occupy similar positions in both rankings; the further a point sits from the line, the more sharply the two systems diverge.</p>
</div>

<style>
  .scatter {
    width: min(94%, 560px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cmp {
    font-family: var(--font-chalk);
    font-size: 1.35rem;
    margin-bottom: 0.4rem;
    letter-spacing: 0.5px;
  }
  .cmp .vs {
    color: var(--chalk-dim);
    margin: 0 0.4rem;
    font-size: 1rem;
  }
  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .diag {
    stroke: var(--chalk-dim);
    stroke-width: 0.3;
    stroke-dasharray: 1.4 1.2;
    opacity: 0.7;
  }
  .grid {
    stroke: var(--chalk-faint);
    stroke-width: 0.12;
  }
  .tick {
    fill: var(--chalk-dim);
    font-family: var(--font-body);
    font-size: 2.6px;
  }
  .axis-label {
    fill: var(--chalk);
    font-family: var(--font-chalk);
    font-size: 3px;
  }
  .pt {
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
  }
  .pt.dim {
    opacity: 0.22;
  }
  .dot {
    color: var(--qs);
    overflow: visible;
  }
  .dot.big {
    color: var(--accent-warn);
  }
  .lbl {
    fill: var(--chalk);
    font-family: var(--font-body);
    font-size: 3.2px;
    paint-order: stroke;
    stroke: var(--board);
    stroke-width: 0.6;
  }
  .hint {
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--chalk-dim);
    margin-top: 0.85rem;
    text-align: center;
    max-width: 420px;
  }
  .hint.note {
    margin-top: 0.9rem;
    margin-bottom: 0;
    font-style: italic;
    font-size: 0.72rem;
    text-align: left;
    align-self: stretch;
    max-width: none;
  }

  @media (max-width: 820px) {
    .tick {
      font-size: 4px;
    }
    .axis-label {
      font-size: 4.6px;
    }
  }
</style>
