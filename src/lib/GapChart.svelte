<script>
  import { gapUniversities, regions, regionOf, systems, the27Pending } from './data.js';
  import ChartFrame from './ChartFrame.svelte';

  // highlight: ids to spotlight (empty = all)
  // focusRegion: 'asia' | 'na' | 'europe' | null
  let { highlight = [], focusRegion = null, sortMode = 'gap' } = $props();

  // gap = THE − QS. Positive = better on QS (higher THE number).
  // Uses THE 2027 (provisional stand-ins while the27Pending).
  let rows = $derived(
    gapUniversities
      .map((u) => {
        const the = u.the27 ?? u.the26;
        return {
          ...u,
          the,
          region: regionOf(u.country),
          gap: the - u.qs27
        };
      })
      .sort((a, b) => {
        if (sortMode === 'asia-first') {
          const ar = a.region === 'asia' ? 0 : 1;
          const br = b.region === 'asia' ? 0 : 1;
          if (ar !== br) return ar - br;
        }
        return b.gap - a.gap;
      })
  );

  const maxAbs = 25;
  const W = 100;
  const rowH = 5.2;
  let H = $derived(10 + rows.length * rowH + 8);
  const mid = 64;
  const barMax = 26;

  const xGap = (g) => mid + (g / maxAbs) * barMax;

  let lit = (u) => {
    if (highlight.length && !highlight.includes(u.id)) return false;
    if (focusRegion && u.region !== focusRegion) return false;
    return true;
  };
</script>

<ChartFrame
  title="THE vs QS — who gets a different grade?"
  sub="Gap = THE 2027 rank − QS 2027 rank. Left = stronger on THE · Right = stronger on QS"
  {focusRegion}
>
  <svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet">
    <!-- zero line -->
    <line x1={mid} y1={8} x2={mid} y2={H - 6} class="zero" />
    <text x={mid - 2} y={6} class="axis-end" text-anchor="end">← better on THE</text>
    <text x={mid + 2} y={6} class="axis-end" text-anchor="start">better on QS →</text>

    {#each rows as u, i (u.id)}
      {@const cy = 10 + i * rowH + rowH / 2}
      {@const x = xGap(u.gap)}
      {@const show = lit(u)}
      <g class="row" class:dim={!show}>
        <text x={mid - barMax - 11} y={cy + 1.2} class="name" text-anchor="end">{u.short}</text>
        <line
          x1={mid}
          y1={cy}
          x2={x}
          y2={cy}
          class="stem"
          style="stroke:{regions[u.region].color}"
        />
        <circle
          cx={x}
          cy={cy}
          r="1.35"
          class="dot"
          style="fill:{regions[u.region].color}"
        />
        <text
          x={x + (u.gap >= 0 ? 2.2 : -2.2)}
          y={cy + 1}
          class="gap-lbl"
          text-anchor={u.gap >= 0 ? 'start' : 'end'}
        >
          {u.gap > 0 ? '+' : ''}{u.gap}
        </text>
      </g>
    {/each}

    <text x={mid} y={H - 1.5} class="zero-lbl" text-anchor="middle">same rank</text>
  </svg>

  {#snippet notes()}
    <p class="chart-note">
      {#if the27Pending}
        Provisional: THE ranks currently mirror 2026. Swap in real `the27` values on release day.
      {:else}
        THE and QS ranks are both from their 2027 tables.
      {/if}
    </p>
    <p class="chart-note muted">
      <span style="color:{systems.the.color}">THE</span> leans on research quality &amp; teaching;
      <span style="color:{systems.qs.color}">QS</span> leans on reputation surveys — Asian schools often land in different places.
    </p>
  {/snippet}
</ChartFrame>

<style>
  .zero {
    stroke: var(--chalk-dim);
    stroke-width: 0.25;
    stroke-dasharray: 1 1.2;
    opacity: 0.7;
  }
  .axis-end {
    fill: var(--chalk-dim);
    font-family: var(--font-chalk);
    font-size: 3.3px;
  }
  .zero-lbl {
    fill: var(--chalk-dim);
    font-family: var(--font-body);
    font-size: 3.1px;
    font-style: italic;
  }
  .row {
    transition: opacity 0.4s ease;
  }
  .row.dim {
    opacity: 0.15;
  }
  .name {
    fill: var(--chalk);
    font-family: var(--font-body);
    font-size: 3.6px;
  }
  .stem {
    stroke-width: 0.7;
    opacity: 0.85;
  }
  .dot {
    stroke: var(--board);
    stroke-width: 0.25;
  }
  .gap-lbl {
    fill: var(--chalk-dim);
    font-family: var(--font-body);
    font-size: 3.1px;
  }
</style>
