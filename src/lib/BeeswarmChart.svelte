<script>
  import { universities, regions, regionOf, the27Pending } from './data.js';
  import { clamp, lerp, easeInOut } from './scroll.js';
  import ChartFrame from './ChartFrame.svelte';

  // t: 0..1 scroll progress (drives left→right leap)
  // highlight: university ids to spotlight
  // focusRegion: dim everything outside this region key
  let { t = 0, highlight = [], focusRegion = null } = $props();

  // Always THE 2026 → 2027. While the27Pending, the27 ranks mirror the26 (flat trails).
  const yearL = 2026;
  const yearR = 2027;
  const rankL = (u) => u.the26;
  const rankR = (u) => u.the27;

  let st = $state(t);
  $effect(() => {
    let raf;
    const tick = () => {
      const next = st + (t - st) * 0.1;
      st = Math.abs(t - next) < 0.0004 ? t : next;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

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
  const pick = (m, tab, d) => (tier === 'mobile' ? m : tier === 'tablet' ? tab : d);

  const MAXR = 55;
  // Same proportions as the THE-vs-QS chart (~1 : 1.53) so both scrolly charts
  // sit at the same height in their sticky panel.
  let vbW = $derived(pick(100, 100, 100));
  let vbH = $derived(pick(210, 153, 153));
  let yTop = $derived(pick(16, 16, 16));
  let yBot = $derived(vbH - 15);
  let XL = $derived(pick(28, 28, 28));
  let XR = $derived(pick(72, 72, 72));
  let R = $derived(pick(2.1, 1.8, 1.8));
  let swarmGap = $derived(pick(3.2, 2.8, 2.8));

  const y = (rank) => yTop + ((clamp(rank, 1, MAXR) - 1) / (MAXR - 1)) * (yBot - yTop);

  function swarmOffsets(list, rankOf, gap) {
    const groups = new Map();
    for (const u of list) {
      const r = rankOf(u);
      if (r == null || r > MAXR) continue;
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(u);
    }
    const out = {};
    for (const group of groups.values()) {
      const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((u, i) => {
        out[u.id] = (i - (sorted.length - 1) / 2) * gap;
      });
    }
    return out;
  }

  let sample = $derived(
    universities.filter((u) => {
      const a = rankL(u);
      const b = rankR(u);
      return a != null && b != null && a <= MAXR && b <= MAXR;
    })
  );

  let offL = $derived(swarmOffsets(sample, rankL, swarmGap));
  let offR = $derived(swarmOffsets(sample, rankR, swarmGap));
  let animT = $derived(easeInOut(clamp(st)));

  function pos(u) {
    const y0 = y(rankL(u));
    const y1 = y(rankR(u));
    const x0 = XL + (offL[u.id] ?? 0);
    const x1 = XR + (offR[u.id] ?? 0);
    return {
      x: lerp(x0, x1, animT),
      y: lerp(y0, y1, animT),
      x0,
      y0,
      x1,
      y1,
      delta: rankL(u) - rankR(u)
    };
  }

  let lit = (id) => highlight.length === 0 || highlight.includes(id);
  let regionLit = (u) => !focusRegion || regionOf(u.country) === focusRegion;

  const ticks = [1, 10, 20, 30, 40, 50];
</script>

<ChartFrame
  title="THE {yearL} → {yearR}"
  sub="Each mortarboard is a university. Colour = region."
  {focusRegion}
>
  <svg viewBox="0 0 {vbW} {vbH}" preserveAspectRatio="xMidYMid meet">
    <defs>
      <symbol id="hat-bee" viewBox="0 0 100 53.31">
        <path
          d="M20.14,24.04l27.47,15.41,31.84-3.85-2.82,13.87c-10.57-2.31-20.99-.54-31.32,3.85-8.54-8.18-17.88-13.59-28.24-15.4l3.08-13.87ZM.12,9.5L54.04,0l45.96,29.53-52.63,6.16L.12,9.5Z"
          fill="currentColor"
        />
        <path
          d="M12.02,30.78c1.48,0,2.69-1.03,2.69-2.3,0-1.03-.79-1.9-1.87-2.19V10.03h-1.63v16.25c-1.08.3-1.87,1.17-1.87,2.19,0,1.27,1.2,2.3,2.69,2.3Z"
          fill="currentColor"
        />
      </symbol>
    </defs>

    {#each ticks as tick}
      <line x1={XL - 10} x2={XR + 10} y1={y(tick)} y2={y(tick)} class="grid" />
      <text x={XL - 12} y={y(tick) + 1.1} class="tick" text-anchor="end">{tick}</text>
    {/each}

    <text x={XL} y={yTop - 6} class="col-label" text-anchor="middle">{yearL}</text>
    <text x={XR} y={yTop - 6} class="col-label" text-anchor="middle">{yearR}</text>

    {#each sample as u (u.id)}
      {@const p = pos(u)}
      {@const show = lit(u.id) && regionLit(u)}
      {#if animT > 0.05 && Math.abs(p.delta) > 0}
        <line
          x1={p.x0}
          y1={p.y0}
          x2={p.x}
          y2={p.y}
          class="trail"
          class:dim={!show}
          style="stroke:{regions[regionOf(u.country)].color}"
        />
      {/if}
    {/each}

    {#each sample as u (u.id)}
      {@const p = pos(u)}
      {@const show = lit(u.id) && regionLit(u)}
      {@const reg = regionOf(u.country)}
      <g
        class="pt"
        class:dim={!show}
        style="transform: translate({p.x}px, {p.y}px); color:{regions[reg].color}"
      >
        <use href="#hat-bee" x={-R * 1.4} y={-R * 0.85} width={R * 2.8} height={R * 1.5} />
        {#if show && (highlight.includes(u.id) || (focusRegion === 'asia' && reg === 'asia' && highlight.length === 0))}
          <text x={R * 1.6} y="1.1" class="lbl">{u.short}</text>
        {:else if show && highlight.includes(u.id)}
          <text x={R * 1.6} y="1.1" class="lbl">{u.short}</text>
        {/if}
      </g>
    {/each}
  </svg>

  {#snippet notes()}
    {#if the27Pending}
      <p class="chart-note">
        Provisional: 2027 ranks currently mirror 2026. Replace `the27` in data.js on release day.
      </p>
    {/if}
  {/snippet}
</ChartFrame>

<style>
  .grid {
    stroke: var(--chalk-faint);
    stroke-width: 0.2;
  }
  .tick {
    fill: var(--chalk-dim);
    font-family: var(--font-body);
    font-size: 4px;
  }
  .col-label {
    fill: var(--chalk);
    font-family: var(--font-chalk);
    font-size: 5px;
  }
  .trail {
    stroke-width: 0.35;
    opacity: 0.55;
    transition: opacity 0.4s ease;
  }
  .trail.dim {
    opacity: 0.08;
  }
  .pt {
    transition: opacity 0.4s ease;
  }
  .pt.dim {
    opacity: 0.14;
  }
  .lbl {
    fill: var(--chalk);
    font-family: var(--font-body);
    font-size: 4.4px;
    paint-order: stroke;
    stroke: var(--board);
    stroke-width: 0.9;
  }
</style>
