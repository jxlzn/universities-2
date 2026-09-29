<script>
  import { methodologyCategories, methodologyData, systems } from './data.js';

  // highlight: which system key to emphasise, or null for "show all equally"
  let { highlight = null } = $props();

  const order = ['qs', 'the', 'us'];
  const catColor = {
    reputation: 'var(--c-rep)',
    research: 'var(--c-res)',
    teaching: 'var(--c-teach)',
    intl: 'var(--c-intl)',
    other: 'var(--c-other)'
  };

  function segments(sysKey) {
    let x = 0;
    return methodologyCategories.map((c) => {
      const w = methodologyData[sysKey][c.key];
      const seg = { key: c.key, label: c.label, w, x };
      x += w;
      return seg;
    });
  }
</script>

<div class="chart">
  <h4 class="chart-title">How the three ranking systems weight their scores</h4>
  <div class="rows">
    {#each order as sysKey}
      {@const dim = highlight && highlight !== sysKey}
      <div class="row" class:dim>
        <div class="row-label" style="color:{systems[sysKey].color}">{systems[sysKey].label}</div>
        <div class="bar">
          {#each segments(sysKey) as seg}
            {#if seg.w > 0}
              <div
                class="seg"
                style="left:{seg.x}%; width:{seg.w}%; background:{catColor[seg.key]}"
                title="{seg.label}: {seg.w}%"
              >
                {#if seg.w >= 9}<span>{seg.w}</span>{/if}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="legend">
    {#each methodologyCategories as c}
      <div class="lg"><i style="background:{catColor[c.key]}"></i>{c.label}</div>
    {/each}
  </div>
  <div class="axis"><span>0%</span><span>weight of overall score</span><span>100%</span></div>
  <p class="chart-note">
    Methodology weights are re-bucketed into five comparable families for side-by-side reading.
  </p>
</div>

<style>
  .chart {
    width: min(92%, 640px);
  }
  .chart-title {
    font-family: var(--font-chalk);
    font-weight: 400;
    font-size: 1.5rem;
    margin: 0 0 1.6rem;
    color: var(--chalk);
    letter-spacing: 0.5px;
  }
  .rows {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .row {
    transition: opacity 0.4s ease, filter 0.4s ease;
  }
  .row.dim {
    opacity: 0.28;
    filter: grayscale(0.6);
  }
  .row-label {
    font-family: var(--font-chalk);
    font-size: 1.15rem;
    margin-bottom: 0.35rem;
  }
  .bar {
    position: relative;
    height: 38px;
    width: 100%;
    border-bottom: 1px dashed var(--chalk-faint);
  }
  .seg {
    position: absolute;
    top: 0;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(20, 26, 22, 0.82);
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    opacity: 0.9;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
    transition: transform 0.4s ease;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1.1rem;
    margin-top: 1.5rem;
  }
  .lg {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--chalk-dim);
  }
  .lg i {
    width: 13px;
    height: 13px;
    border-radius: 2px;
    display: inline-block;
  }
  .axis {
    display: flex;
    justify-content: space-between;
    margin-top: 0.8rem;
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--chalk-dim);
    font-style: italic;
  }
  .chart-note {
    margin: 1rem 0 0;
    font-family: var(--font-body);
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--chalk-dim);
    font-style: italic;
  }
  @media (max-width: 820px) {
    .chart-title {
      font-size: 1.25rem;
      line-height: 1.35;
      margin-bottom: 1.2rem;
    }
  }
</style>
