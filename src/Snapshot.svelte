<script>
  import BeeswarmChart from './lib/BeeswarmChart.svelte';
</script>

<div class="wrap">
  <div class="head">
    <p class="kicker">Asia advances</p>
    <h1>Region-coloured movers</h1>
    <p class="sub">Connected beeswarm of THE ranks — Asia in ochre, North America in blue</p>
  </div>
  <div class="graphic">
    <BeeswarmChart t={1} highlight={[]} focusRegion={null} />
  </div>
</div>

<style>
  :global(html, body) {
    background: var(--board);
    height: 100%;
    overflow: hidden;
  }
  .wrap {
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    padding: 16px 32px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.025) 0, transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 0, transparent 40%),
      var(--board);
    font-family: var(--font-body);
    color: var(--chalk);
  }
  .head {
    text-align: center;
  }
  .kicker {
    margin: 0 0 2px;
    font-family: var(--font-chalk);
    font-size: 16px;
    letter-spacing: 1px;
    color: var(--r-asia);
  }
  h1 {
    margin: 0 0 4px;
    font-size: 26px;
    font-weight: 500;
    color: var(--chalk);
  }
  .sub {
    margin: 0;
    font-size: 13px;
    color: var(--chalk-dim);
  }
  .graphic {
    flex: 1;
    min-height: 0;
  }
</style>
