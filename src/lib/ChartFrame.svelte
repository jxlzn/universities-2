<script>
  import { regions } from './data.js';

  // Shared shell for the sticky scrolly charts (beeswarm + THE-vs-QS gap) so
  // both get identical width, typography, legend and notes. The plot area
  // takes whatever height is left in the frame, so nothing overflows. The frame
  // itself (header, plot, legend and notes) uses about 3/4 of the panel height,
  // vertically centred by the panel.
  let { title, sub, focusRegion = null, children, notes } = $props();
</script>

<div class="chart">
  <h4 class="chart-title">{title}</h4>
  <p class="sub">{sub}</p>

  <div class="plot">
    {@render children()}
  </div>

  <div class="legend">
    {#each Object.values(regions) as r}
      <div class="lg" class:dim={focusRegion && focusRegion !== r.key}>
        <i style="background:{r.color}"></i>{r.label}
      </div>
    {/each}
  </div>

  {#if notes}
    <div class="notes">{@render notes()}</div>
  {/if}
</div>

<style>
  .chart {
    width: min(94%, 520px);
    height: 75%;
    margin: 0 auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .chart > :not(.plot) {
    flex: 0 0 auto;
  }
  .chart-title {
    font-family: var(--font-chalk);
    font-weight: 400;
    font-size: clamp(1rem, min(2.5vw, 3.2vh), 1.4rem);
    margin: 0 0 0.2rem;
    text-align: center;
    color: var(--chalk);
    letter-spacing: 0.4px;
  }
  .sub {
    margin: 0 0 min(0.6rem, 1.2vh);
    text-align: center;
    font-family: var(--font-body);
    font-size: clamp(0.74rem, 2.1vh, 0.98rem);
    line-height: 1.4;
    color: var(--chalk-dim);
    font-style: italic;
  }
  .plot {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
  }
  .plot :global(svg) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.3rem 1rem;
    margin-top: min(0.6rem, 1.2vh);
  }
  .lg {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: clamp(0.72rem, 2vh, 0.95rem);
    color: var(--chalk-dim);
    font-family: var(--font-body);
    transition: opacity 0.4s ease;
  }
  .lg.dim {
    opacity: 0.3;
  }
  .lg i {
    width: 0.85em;
    height: 0.85em;
    border-radius: 2px;
  }
  .notes :global(.chart-note) {
    margin: min(0.5rem, 1vh) 0 0;
    text-align: center;
    font-family: var(--font-body);
    font-size: clamp(0.68rem, 1.8vh, 0.85rem);
    line-height: 1.35;
    color: var(--accent-warn);
    font-style: italic;
  }
  .notes :global(.chart-note.muted) {
    color: var(--chalk-dim);
  }
</style>
