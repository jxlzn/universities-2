<script>
  import { regionalShares, regions, regionOrder, the27Pending } from './data.js';

  // stepIndex drives which year is lit and how much of the Asia story is emphasised.
  // 0 intro · 1 early years · 2 recent climb · 3 2026 · 4 2027 / Asia focus
  let { step = 0 } = $props();

  const years = regionalShares.map((d) => d.year);
  const focusYear = $derived(
    step <= 0 ? null : step === 1 ? 2018 : step === 2 ? 2024 : step === 3 ? 2026 : 2027
  );
  const asiaOnly = $derived(step >= 4);

  const W = 100;
  const H = 72;
  const pad = { l: 10, r: 4, t: 10, b: 14 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const barW = innerW / years.length;
  const gap = 0.28;

  function stack(row) {
    let y = 0;
    return regionOrder.map((key) => {
      const v = row[key];
      const seg = { key, v, y0: y, y1: y + v };
      y += v;
      return seg;
    });
  }

  const maxTotal = 50;
  const yScale = (v) => pad.t + innerH * (1 - v / maxTotal);
  const hScale = (v) => (v / maxTotal) * innerH;

  let litYear = (year) => focusYear == null || focusYear === year;
</script>

<div class="chart">
  <h4 class="chart-title">Who fills THE’s top 50?</h4>
  <p class="sub">Share of institutions in the Times Higher Education Top 50, by region</p>

  <svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Stacked bars of THE Top 50 by region over time">
    <!-- y grid -->
    {#each [0, 10, 20, 30, 40, 50] as tick}
      <line
        x1={pad.l}
        x2={W - pad.r}
        y1={yScale(tick)}
        y2={yScale(tick)}
        class="grid"
      />
      <text x={pad.l - 1.2} y={yScale(tick) + 1} class="tick" text-anchor="end">{tick}</text>
    {/each}

    {#each regionalShares as row, i}
      {@const segs = stack(row)}
      {@const x = pad.l + i * barW + (barW * gap) / 2}
      {@const bw = barW * (1 - gap)}
      {@const dim = !litYear(row.year)}
      <g class="bar" class:dim class:asia-focus={asiaOnly}>
        {#each segs as seg}
          <rect
            x={x}
            y={yScale(seg.y1)}
            width={bw}
            height={hScale(seg.v)}
            fill={regions[seg.key].color}
            class="seg"
            class:mute={asiaOnly && seg.key !== 'asia'}
            opacity={asiaOnly && seg.key !== 'asia' ? 0.18 : 0.92}
          >
            <title>{regions[seg.key].label}: {seg.v}</title>
          </rect>
        {/each}
        <!-- Asia count callout on lit / late steps -->
        {#if (focusYear === row.year || (step >= 3 && row.year >= 2024)) && row.asia}
          <text
            x={x + bw / 2}
            y={yScale(row.asia) - 1.2}
            class="callout"
            text-anchor="middle"
          >{row.asia}</text>
        {/if}
        <text x={x + bw / 2} y={H - 5.5} class="year" text-anchor="middle">
          {row.year}
        </text>
        {#if row.provisional && the27Pending}
          <text x={x + bw / 2} y={H - 1.8} class="prov" text-anchor="middle">est.</text>
        {/if}
      </g>
    {/each}

    <text x={2.2} y={pad.t + innerH / 2} class="axis-label" text-anchor="middle" transform="rotate(-90 2.2 {pad.t + innerH / 2})">
      universities in Top 50
    </text>
  </svg>

  <div class="legend">
    {#each regionOrder as key}
      <div class="lg" class:dim={asiaOnly && key !== 'asia'}>
        <i style="background:{regions[key].color}"></i>{regions[key].label}
      </div>
    {/each}
  </div>
  {#if the27Pending}
    <p class="chart-note">2027 bar is provisional (mirrors 2026). Replace the 2027 row in `regionalShares` on release day.</p>
  {/if}
</div>

<style>
  .chart {
    width: min(94%, 560px);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0.75rem 0;
  }
  .chart > :not(svg) {
    flex: 0 0 auto;
  }
  .chart-title {
    font-family: var(--font-chalk);
    font-weight: 400;
    font-size: 1.45rem;
    margin: 0 0 0.25rem;
    color: var(--chalk);
    letter-spacing: 0.5px;
  }
  .sub {
    margin: 0 0 1rem;
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--chalk-dim);
    font-style: italic;
  }
  svg {
    width: 100%;
    height: auto;
    flex: 1 1 auto;
    min-height: 0;
    overflow: visible;
  }
  .grid {
    stroke: var(--chalk-faint);
    stroke-width: 0.15;
  }
  .tick {
    fill: var(--chalk-dim);
    font-family: var(--font-body);
    font-size: 3.2px;
  }
  .axis-label {
    fill: var(--chalk-dim);
    font-family: var(--font-chalk);
    font-size: 3.5px;
  }
  .bar {
    transition: opacity 0.45s ease;
  }
  .bar.dim {
    opacity: 0.28;
  }
  .seg {
    transition: opacity 0.45s ease;
  }
  .year {
    fill: var(--chalk);
    font-family: var(--font-body);
    font-size: 3.4px;
  }
  .prov {
    fill: var(--accent-warn);
    font-family: var(--font-body);
    font-size: 2.7px;
    font-style: italic;
  }
  .callout {
    fill: var(--r-asia);
    font-family: var(--font-chalk);
    font-size: 4.2px;
    font-weight: 700;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem 1rem;
    margin-top: 0.9rem;
  }
  .lg {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--chalk-dim);
    transition: opacity 0.4s ease;
  }
  .lg.dim {
    opacity: 0.3;
  }
  .lg i {
    width: 0.85em;
    height: 0.85em;
    border-radius: 2px;
    display: inline-block;
  }
  .chart-note {
    margin: 0.75rem 0 0;
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--accent-warn);
    font-style: italic;
  }
  @media (max-width: 820px) {
    .chart-title {
      font-size: 1.2rem;
    }
  }
</style>
