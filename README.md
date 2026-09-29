# Does Asia's university rise pass Times Higher Education's test?

A short visual **scrollytelling** piece on the **Times Higher Education (THE) World University
Rankings 2027**, asking whether Asia’s rise on QS survives THE’s different scorecard.
Academic chalkboard style, built with **Svelte + Vite**.

## What's inside

Three acts, region-first:

1. **The balance of power** — stacked bars of who fills THE’s **Top 50** by region
   (Asia / North America / Europe / Rest), 2018 → 2027. Steps walk the long climb in Asia’s
   share.
2. **Asia’s strip** — a scroll-driven **connected beeswarm**: universities as mortarboards,
   coloured by region, leaping from one THE year to the next. While `the27Pending` is true,
   the chart shows the last completed shift (**2025 → 2026**); flip the flag and fill `the27`
   ranks on release day.
3. **A different grade** — **diverging lollipops** of THE − QS gaps. Hong Kong looks strong on
   QS and middling on THE; Tsinghua/Peking and several US research names often prefer THE.

## Sep 30 release checklist

In `src/lib/data.js`:

1. Fill every university’s `the27` rank (currently mirrors `the26`)
2. Update `regionalShares` row for `2027` (remove `provisional: true`)
3. Set `the27Pending = false`
4. Replace every amber `[bracket]` placeholder in `src/App.svelte` and `article.md`

Copy is already written in **just-published** voice (“THE has released…”, “2027 rankings are out”).

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Structure

| File | Purpose |
| --- | --- |
| `src/App.svelte` | Article narrative + section layout |
| `src/lib/data.js` | Ranks, regional shares, sources, `the27Pending` |
| `src/lib/Scrolly.svelte` | Sticky-graphic + steps driver |
| `src/lib/RegionShareChart.svelte` | Stacked Top-50-by-region bars |
| `src/lib/BeeswarmChart.svelte` | Region-coloured connected beeswarm |
| `src/lib/GapChart.svelte` | THE − QS diverging lollipops |
| `src/lib/scroll.js` | `scrollProgress` / `pinProgress` helpers |

Older QS-era charts (`JumpChart`, `MethodologyChart`, `ScatterChart`) remain in `src/lib/`
but are unused by this cut.

## Data & caveats

Ranks are published **overall** positions; ties share a rank. Regional Top-50 counts are
tallied from THE’s published tables (Asia = CN/HK/SG/JP/KR/TW). Gap chart currently pairs
**THE 2026** with **QS 2027** until THE 2027 ranks are filled in.
