<script>
  import Scrolly from './lib/Scrolly.svelte';
  import RegionShareChart from './lib/RegionShareChart.svelte';
  import BeeswarmChart from './lib/BeeswarmChart.svelte';
  import GapChart from './lib/GapChart.svelte';
  import ChalkHeadline from './lib/ChalkHeadline.svelte';
  import CampusMorph from './lib/CampusMorph.svelte';
  import ChalkLotus from './lib/ChalkLotus.svelte';
  import DustPuff from './lib/DustPuff.svelte';
  import { scrollProgress, pinProgress, clamp, lerp } from './lib/scroll.js';
  import { sources, the27Pending, ph } from './lib/data.js';

  function goToBT() {
    window.location.href = 'https://www.businesstimes.com.sg';
  }

  let fbShare = $state('#');
  let xShare = $state('#');
  let liShare = $state('#');

  $effect(() => {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(
      "Does Asia's university rise pass Times Higher Education's test?"
    );
    fbShare = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    xShare = `https://x.com/intent/tweet?url=${u}&text=${t}`;
    liShare = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  });

  // ---- Hero: chalk-written headline + mortarboard that falls into the prologue ----
  let reducedMotion = $state(false);
  $effect(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  let headlineDone = $state(false);
  let headlineReady = $state(false);
  let hatShown = $state(false);
  let hatDustAt = $state(false);

  function onMorphMid() {
    if (!headlineReady) headlineReady = true;
  }

  function onHeadlineDone() {
    headlineDone = true;
    const hatDelay = reducedMotion ? 0 : 300;
    const dustDelay = reducedMotion ? 0 : 300 + 750;
    setTimeout(() => (hatShown = true), hatDelay);
    setTimeout(() => (hatDustAt = true), dustDelay);
  }

  // heroT: 0 while the hero is freshly pinned, 1 once its scroll runway is spent.
  let heroT = $state(0);
  let heroFade = $derived(1 - clamp(heroT / 0.32));

  let hatFall = $derived(clamp((heroT - 0.06) / 0.85));
  let hatEase = $derived(hatFall * hatFall * (3 - 2 * hatFall));
  let hatAnchored = $derived(heroT >= 1 || reducedMotion);
  let hatRotate = $derived(
    reducedMotion ? -7 : (1 - hatEase) * (hatEase * 300 - 6) + hatEase * -7
  );
  let hatDrift = $derived(reducedMotion || hatAnchored ? 0 : Math.sin(hatEase * Math.PI) * 16);

  let vw = $state(typeof window !== 'undefined' ? window.innerWidth : 1200);
  let vh = $state(typeof window !== 'undefined' ? window.innerHeight : 800);
  let headlineStage = $state(null);
  let hatSlot = $state(null);
  let startPos = $state({ x: 0, y: 0 });
  let landingPos = $state({ x: 0, y: 0 });

  $effect(() => {
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  $effect(() => {
    const update = () => {
      if (headlineStage) {
        const rect = headlineStage.getBoundingClientRect();
        const gap = Math.min(56, Math.max(32, vw * 0.045));
        startPos = { x: rect.left + rect.width / 2, y: rect.top - gap };
      }
      if (hatSlot) {
        const rect = hatSlot.getBoundingClientRect();
        landingPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  });

  let hatX = $derived(lerp(startPos.x || vw / 2, landingPos.x, hatEase));
  let hatY = $derived(lerp(startPos.y || vh * 0.32, landingPos.y, hatEase));

  let landed = $state(false);
  $effect(() => {
    if (heroT > 0.96 && !landed) landed = true;
    else if (heroT < 0.9 && landed) landed = false;
  });

  // ---- Act 1: regional share of THE Top 50 ----
  // Amber [brackets] = fill on release day. Historical 2018–2026 figures are real.
  let regionActive = $state(0);
  const regionSteps = [
    `The <strong>Times Higher Education</strong> rankings spread their weight more evenly across teaching, research environment and research quality. QS, by contrast, leans heavily on reputation surveys. The THE Top 50 is therefore a useful test of how far Asia’s rise extends.`,
    `A decade ago, the Top 50 was overwhelmingly Western. In <strong>2018</strong>, only <strong style="color:var(--r-asia)">six Asian universities</strong> made the list, while North America alone held about half of the places.`,
    `By <strong>2024</strong>, Asia’s share had grown. Universities in mainland China, Hong Kong, Singapore and Japan moved further up the table as their research output and citation impact rose.`,
    `In the <strong>2026</strong> table, <strong style="color:var(--r-asia)">ten Asian universities</strong> were in THE’s Top 50, nearly double the 2018 count, while North America’s share had declined slightly.`,
    `In the <strong>2027</strong> table, Asia holds ${ph('Asia count in THE Top 50')} of the Top 50${ph('↑ / ↓ / flat vs 2026')}. ${ph('One-line verdict: Asia gained / held / slipped')}.`
  ];

  // ---- Act 2: beeswarm movers (THE 2026 → 2027) ----
  let beeT = $state(0);
  let beeStep = $state(0);
  let beeStepEls = $state([]);

  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = beeStepEls.indexOf(entry.target);
            if (idx !== -1) beeStep = idx;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    for (const el of beeStepEls) if (el) observer.observe(el);
    return () => observer.disconnect();
  });

  const beeSteps = [
    `The chart shows the top tier moving from <strong>THE 2026</strong> to <strong>THE 2027</strong>. Each mortarboard represents a university, and its colour marks its region.`,
    `At the top, ${ph('who holds #1 — e.g. Oxford')} ${ph('streak / first-year note')}. The US and UK universities ${ph('mostly stay in place / shuffle')}.`,
    `Further down, most of the movement comes from <strong style="color:var(--r-asia)">Asian universities</strong>. ${ph('Biggest Asian climber: school + Δ')}. ${ph('Biggest Asian faller: school + Δ')}.`,
    `In Singapore, the <strong>National University of Singapore</strong> ${ph('NUS 2026→2027')}, while <strong>Nanyang Technological University</strong> ${ph('NTU 2026→2027')}. ${ph('One-line SG take')}.`,
    `In Hong Kong and mainland China, <strong>HKU</strong> ${ph('HKU 2026→2027')}, <strong>CUHK</strong> ${ph('CUHK 2026→2027')}, <strong>Tsinghua</strong> ${ph('Tsinghua 2026→2027')} and <strong>Peking</strong> ${ph('Peking 2026→2027')}.`,
    `One year of data cannot settle whether Asia is rising. But the direction of the movers shows which universities THE’s methodology currently favours: ${ph('closing verdict on Asia’s band')}.`
  ];

  const beeHi = [
    [],
    ['oxford', 'mit'],
    ['tokyo', 'hku', 'cuhk', 'ntu', 'nus', 'tsinghua', 'peking'],
    ['nus', 'ntu'],
    ['hku', 'cuhk', 'tsinghua', 'peking'],
    []
  ];
  const beeRegion = [null, null, 'asia', 'asia', 'asia', null];
  let beeHighlight = $derived(beeHi[beeStep] ?? []);
  let beeFocusRegion = $derived(beeRegion[beeStep] ?? null);

  // ---- Act 3: THE 2027 − QS 2027 gap ----
  let gapActive = $state(0);
  const gapSteps = [
    `Asian universities can rank higher in one system than in another. The chart shows the gap between each university’s <strong>THE 2027 rank and QS 2027 rank</strong>. Universities to the left of the centre line rank better on THE, while those to the right rank better on QS.`,
    `The gap is widest in Hong Kong. <strong style="color:var(--r-asia)">HKU</strong> ranks 11th on QS but ${ph('HKU THE 2027')} on THE, a difference of ${ph('HKU gap')}. <strong style="color:var(--r-asia)">CUHK</strong> ranks 18th on QS and ${ph('CUHK THE 2027')} on THE (${ph('CUHK gap')}). Reputation appears to lift both further on QS than THE’s teaching and research measures do.`,
    `Singapore falls in between. <strong>NUS</strong> (QS 10 / THE ${ph('NUS THE 2027')}) and <strong>NTU</strong> (QS 12 / THE ${ph('NTU THE 2027')}) ${ph('still rank better on QS / show a narrower gap / have flipped')}.`,
    `Mainland China’s research-intensive universities ${ph('still rank higher on THE / now rank higher on QS / rank similarly on both')}. <strong>Tsinghua</strong> ranks ${ph('Tsinghua THE 2027')} on THE and 14th on QS, while <strong>Peking</strong> ranks ${ph('Peking THE 2027')} on THE and 13th on QS.`,
    `Several Western research universities also rank higher on THE. <strong>Princeton</strong>, <strong>Berkeley</strong> and <strong>Yale</strong> ${ph('still / no longer')} rank higher on THE than on QS, while <strong>Imperial College London</strong>, which benefits from QS’ reputation weighting, ${ph('still / no longer')} shows the opposite pattern.`,
    `Whether Asian universities are rising therefore depends on which ranking is used. QS places heavy weight on reputation, while THE weighs a different mix of measures. In 2027, Asia’s results are ${ph('stronger on QS / mixed / stronger on THE')}.`
  ];
  const gapHi = [
    [],
    ['hku', 'cuhk'],
    ['nus', 'ntu'],
    ['tsinghua', 'peking'],
    ['princeton', 'berkeley', 'yale', 'imperial'],
    []
  ];
  const gapRegion = [null, 'asia', 'asia', 'asia', null, null];
  const gapSort = ['gap', 'asia-first', 'asia-first', 'asia-first', 'gap', 'gap'];
</script>

<!-- ══ HEADER ══════════════════════════════════════════════════════════════════ -->
<div class="header-container">
  <div class="header-bar">
    <div class="logos-container">
      <button class="btlogo" aria-label="The Business Times" onclick={goToBT}></button>
    </div>
    <div class="share-container">
      <div class="shareon">
        <a class="facebook" aria-label="Share on Facebook" href={fbShare} rel="noopener noreferrer" target="_blank"
          ><span class="sr-only">Facebook</span></a
        >
        <a class="twitter" aria-label="Share on X" href={xShare} rel="noopener noreferrer" target="_blank"
          ><span class="sr-only">X / Twitter</span></a
        >
        <a class="linkedin" aria-label="Share on LinkedIn" href={liShare} rel="noopener noreferrer" target="_blank"
          ><span class="sr-only">LinkedIn</span></a
        >
      </div>
    </div>
  </div>
</div>

<!-- ============================ HERO ============================ -->
<div class="hero-scroll" use:pinProgress={(p) => (heroT = p)}>
  <header class="hero">
    <h1 class="sr-only">Does Asia's university rise pass Times Higher Education's test?</h1>

    <div class="hero-inner" style="opacity:{heroFade}; transform: translateY({(1 - heroFade) * -26}px)">
      <div class="campus-stage">
        <CampusMorph reducedMotion={reducedMotion} onMid={onMorphMid} />
      </div>
      <div class="headline-stage" bind:this={headlineStage}>
        {#if headlineReady}
          <ChalkHeadline
            before="Does Asia's university rise pass"
            insertion="Times Higher Education's"
            after="test?"
            line2="THE 2027 rankings are out"
            startDelay={reducedMotion ? 0 : 0.08}
            onDone={onHeadlineDone}
          />
        {/if}
      </div>
      <p class="dek" class:show={headlineDone}>
        Times Higher Education (THE) has just released its World University Rankings 2027, months after Asian universities emerged among the biggest climbers in the QS rankings. THE weighs teaching and research differently. We look into whether Asia’s rise holds up under its methodology, and how Singapore and Hong Kong fare when the two rankings disagree.
      </p>
      <p class="byline" class:show={headlineDone}>BY LI ZUOWEI</p>
      <div class="scroll-cue" class:show={headlineDone}>
        scroll <span class="scroll-arrow" aria-hidden="true">↓</span>
      </div>
    </div>
  </header>
</div>

<!-- ============================ PROLOGUE ============================ -->
<div class="hat-slot" bind:this={hatSlot}>
  <div
    class="hat-flyer"
    class:anchored={hatAnchored}
    class:fixed={!hatAnchored}
    class:visible={hatShown}
    style:left={!hatAnchored ? `${hatX}px` : null}
    style:top={!hatAnchored ? `${hatY}px` : null}
    style:transform={!hatAnchored
      ? `translate(-50%, -50%) translate3d(${hatDrift}px, 0, 0) rotate(${hatRotate}deg)`
      : `rotate(${hatRotate}deg)`}
  >
    <div class="hat-entrance" class:show={hatShown} class:reduced={reducedMotion}>
      <div class="hat-bob" class:reduced={reducedMotion} class:paused={heroT > 0.02}>
        <ChalkLotus />
      </div>
    </div>
    {#if hatDustAt && heroT < 0.05}
      <div class="hat-dust"><DustPuff count={10} size={5} spread={26} /></div>
    {/if}
    {#if landed}
      <div class="land-dust"><DustPuff count={8} size={4} spread={20} /></div>
    {/if}
  </div>
</div>
<section class="prose">
  {#if the27Pending}
    <p class="draft-banner">
      Draft awaiting THE 2027 figures — amber <span class="ph">[brackets]</span> are placeholders to fill on release day.
    </p>
  {/if}
  <p>
    On Sep 30, 2026, <strong>Times Higher Education</strong> released its World University Rankings
    2027. {@html ph('Who is #1 — e.g. Oxford holds / MIT takes')} {@html ph('streak / first-year note')}.
    The result at the top matters less than the movement below it, where Asian universities have been
    gaining ground.
  </p>
  <p>
    The QS 2027 rankings, released in June, showed universities in Hong Kong and mainland China climbing
    while several Western institutions slipped. THE uses a different <a href="https://graphics.businesstimes.com.sg/specials/universities/index.html" target="_blank" rel="noopener">methodology</a>, placing more weight on
    teaching and research quality and less on reputation surveys. If Asia’s rise is genuine, it should
    also show up in THE’s table. If it does not, part of the gain may reflect how QS measures reputation.
  </p>
</section>

<h2 class="section-head">The balance of power · THE Top 50</h2>

<!-- ============================ REGION SHARE ============================ -->
<Scrolly steps={regionSteps} bind:active={regionActive}>
  {#snippet graphic(active)}
    <RegionShareChart step={active ?? 0} />
  {/snippet}
</Scrolly>

<h2 class="section-head">Asia’s strip · year to year</h2>

<!-- ============================ BEESWARM ============================ -->
<div class="jump-wrap" use:scrollProgress={(p) => (beeT = clamp((p - 0.06) / 0.86))}>
  <div class="jump-graphic">
    <BeeswarmChart t={beeT} highlight={beeHighlight} focusRegion={beeFocusRegion} />
  </div>
  <div class="jump-steps">
    {#each beeSteps as step, i}
      <div class="jstep" bind:this={beeStepEls[i]}>
        <div class="step-inner" class:active={beeStep === i}>{@html step}</div>
      </div>
    {/each}
  </div>
</div>

<h2 class="section-head">Where the rankings disagree · THE vs QS</h2>

<!-- ============================ GAP ============================ -->
<Scrolly steps={gapSteps} bind:active={gapActive} overlay>
  {#snippet graphic(active)}
    <GapChart
      highlight={gapHi[active] ?? []}
      focusRegion={gapRegion[active] ?? null}
      sortMode={gapSort[active] ?? 'gap'}
    />
  {/snippet}
</Scrolly>

<!-- ============================ CONCLUSION ============================ -->
<h2 class="section-head">So how should you read Asia’s rise?</h2>
<section class="prose">
  <p>
    Asia’s presence in THE’s Top 50 has {@html ph('nearly doubled / more than doubled / grown to N')} since
    2018, which shows that the rise is real. However, individual results still depend on the ranking
    used. Hong Kong universities rank highly on QS and {@html ph('merely solid / stronger / weaker')} on THE.
    Tsinghua and Peking are {@html ph('strong on both / split between the two')}, while Princeton and Berkeley
    {@html ph('still rank higher / no longer rank higher')} on THE, which places more weight on research.
  </p>
  <p>
    As with any league table, the most useful approach is to compare rankings rather than rely on one.
    With THE 2027 now released, the question is not only which universities moved, but whether Asia’s
    gains hold on a ranking that does not rely mainly on reputation.
    {@html ph('Final one-line answer to the hed')}
  </p>
</section>

<footer class="foot">
  <p class="sources">
    Sources: {#each sources as s, i}{#if i > 0}, {/if}<a href={s.url} target="_blank" rel="noopener">{s.label}</a>{/each}
  </p>
  <p class="credit">PRODUCED BY: LI ZUOWEI</p>
  <p class="credit">GRAPHICS: LI ZUOWEI</p>
</footer>

<style>
  /* ── HEADER ── */
  .header-container {
    position: relative;
    width: 100%;
    z-index: 100;
  }
  .header-bar {
    display: flex;
    width: 100%;
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
  }
  .logos-container,
  .share-container {
    display: flex;
    align-items: center;
  }
  .shareon {
    display: flex;
    gap: 10px;
  }
  .shareon a {
    position: relative;
    width: 28px;
    height: 28px;
    display: block;
  }
  .shareon > .facebook::before {
    content: '';
    position: absolute;
    background-image: url(https://www.businesstimes.com.sg/bt_files/interactives/assets/fbLogo.png) !important;
    width: 28px;
    height: 28px;
    background-size: 28px;
    background-repeat: no-repeat;
    top: 0;
    left: 0;
  }
  .shareon > .twitter::before {
    content: '';
    position: absolute;
    background-image: url('/specials/universities/x_white.png') !important;
    width: 28px;
    height: 28px;
    background-size: 28px;
    background-repeat: no-repeat;
    top: 0;
    left: 0;
  }
  .shareon > .linkedin::before {
    content: '';
    position: absolute;
    background-image: url(https://www.businesstimes.com.sg/bt_files/interactives/assets/inLogo.png) !important;
    width: 28px;
    height: 28px;
    background-size: 28px;
    background-repeat: no-repeat;
    top: 0;
    left: 0;
  }
  .header-bar .btlogo {
    width: 250px;
    height: 24px;
    cursor: pointer;
    background-image: url(https://www.businesstimes.com.sg/bt_files/interactives/assets/btLogo.png) !important;
    background-size: contain;
    background-color: transparent;
    background-repeat: no-repeat;
    border: none;
    margin: 0;
    padding: 0;
  }
  @media (min-width: 175px) and (max-width: 815px) {
    .header-bar .btlogo {
      width: 30px;
      background-image: url(https://www.businesstimes.com.sg/bt_files/interactives/assets/btMobileLogo.png) !important;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Hero is pinned for an extra scroll "runway" so the headline can fade and
     the mortarboard can fall out of it, landing just as the prologue arrives. */
  .hero-scroll {
    position: relative;
    height: 190vh;
  }
  .hero {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    overflow: hidden;
  }
  /* Fills the pinned hero and lets the campus illustration absorb any height
     shortfall, so the copy always fits inside the viewport. */
  .hero-inner {
    width: 100%;
    max-width: 900px;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
    will-change: opacity, transform;
  }
  .hero-inner > :not(.campus-stage):not(.headline-stage) {
    flex: 0 0 auto;
  }

  .headline-stage {
    position: relative;
    /* Preferred size only: shrinks with the viewport height instead of overflowing. */
    flex: 0 1 clamp(150px, 24vw, 230px);
    min-height: 0;
    margin-bottom: min(1.8rem, 3vh);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .campus-stage {
    width: 100%;
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin: 0 auto 0.4rem;
    opacity: 0.95;
  }
  .dek {
    font-size: 1.2rem; /* same as .prose body text */
    line-height: 1.55;
    color: var(--chalk);
    max-width: 720px;
    margin: 0 auto;
    font-weight: 300;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .dek.show {
    opacity: 1;
    transform: translateY(0);
  }
  .byline {
    margin: min(1.1rem, 2vh) auto 0;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 400;
    letter-spacing: 0.14em;
    color: #fff;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
  }
  .byline.show {
    opacity: 1;
    transform: translateY(0);
  }
  /* Flows below the dek instead of pinning to the hero's bottom edge, so it
     never collides with the dek text on shorter viewports. */
  .scroll-cue {
    margin: min(1.8rem, 2.5vh) 0 0;
    text-align: center;
    font-family: var(--font-chalk);
    font-size: 1rem;
    letter-spacing: 0.03em;
    color: var(--chalk-dim);
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .scroll-arrow {
    display: inline-block;
    font-size: 1.15em;
    line-height: 1;
  }
  .scroll-cue.show {
    opacity: 1;
    animation: bob 2s ease-in-out infinite;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }

  @media (min-width: 821px) {
    .scroll-cue {
      font-size: 1.25rem;
      margin-top: min(2.2rem, 2.5vh);
    }
    .scroll-arrow {
      font-size: 1.4em;
    }
    .scroll-cue.show {
      animation-name: bob-desktop;
    }
  }
  @keyframes bob-desktop {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
  }

  /* Mortarboard: appears above the headline after it finishes writing, then
     falls into its resting spot above the prologue as the user scrolls. */
  .hat-slot {
    position: relative;
    width: clamp(36px, 5vw, 52px);
    height: clamp(48px, 7vw, 72px);
    margin: -2.5rem auto 0;
  }
  .hat-flyer {
    width: clamp(36px, 5vw, 52px);
    opacity: 0;
    will-change: transform, opacity;
    pointer-events: none;
  }
  .hat-flyer.visible {
    opacity: 1;
  }
  .hat-flyer.fixed {
    position: fixed;
    z-index: 5;
  }
  .hat-flyer.anchored {
    position: relative;
    margin: 0 auto;
  }
  .hat-entrance {
    opacity: 0;
    transform: translateY(-34px) scale(0.35) rotate(-32deg);
    position: relative;
  }
  .hat-entrance.show {
    animation: hat-toss 0.9s cubic-bezier(0.22, 0.85, 0.3, 1.1) forwards;
  }
  .hat-entrance.reduced.show {
    animation: none;
    opacity: 1;
    transform: none;
  }
  @keyframes hat-toss {
    0% { opacity: 0; transform: translateY(-34px) scale(0.35) rotate(-32deg); }
    55% { opacity: 1; transform: translateY(4px) scale(1.14) rotate(9deg); }
    100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
  }
  .hat-bob {
    animation: hat-bob 3.4s ease-in-out 1.1s infinite;
  }
  .hat-bob.reduced,
  .hat-bob.paused {
    animation: none;
  }
  @keyframes hat-bob {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-7px) rotate(2deg); }
  }
  .hat-dust,
  .land-dust {
    position: absolute;
    inset: 0;
  }
  .hat-slot::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -5px;
    width: 56px;
    height: 9px;
    background: radial-gradient(ellipse at center, rgba(238, 240, 230, 0.22), transparent 72%);
    transform: translateX(-50%);
    filter: blur(1px);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .hat-slot:has(.hat-flyer.anchored.visible)::after {
    opacity: 1;
  }

  .prose {
    max-width: 680px;
    margin: 3.5rem auto;
    padding: 0 1.5rem;
    font-size: 1.2rem;
    line-height: 1.75;
    color: #e3e6da;
    font-weight: 300;
  }
  .prose p { margin: 0 0 1.4rem; }
  .prose strong { font-weight: 500; color: var(--chalk); }

  :global(.ph),
  .ph {
    display: inline;
    color: var(--accent-warn);
    font-family: var(--font-chalk);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.01em;
    white-space: normal;
  }
  .draft-banner {
    border: 1px dashed color-mix(in srgb, var(--accent-warn) 55%, transparent);
    background: color-mix(in srgb, var(--accent-warn) 12%, transparent);
    padding: 0.85rem 1rem;
    border-radius: 4px;
    font-size: 0.95rem;
    color: var(--accent-warn);
  }

  .section-head {
    font-family: var(--font-chalk);
    font-weight: 400;
    font-size: clamp(1.3rem, 3.2vw, 1.9rem);
    text-align: center;
    margin: 5rem auto 1rem;
    color: var(--chalk);
    letter-spacing: 1px;
    position: relative;
  }
  .section-head::after {
    content: '';
    display: block;
    width: 90px;
    height: 2px;
    margin: 1rem auto 0;
    background: var(--chalk-faint);
  }

  /* Beeswarm section: step cards on the left, full-height sticky chart on the right */
  .jump-wrap {
    position: relative;
    display: grid;
    grid-template-columns: minmax(280px, 370px) 1fr;
    gap: 2rem;
    width: 100%;
    max-width: 1300px;
    margin: 1.5rem auto 0;
    padding: 0 1.5rem;
    box-sizing: border-box;
  }
  .jump-graphic {
    grid-column: 2;
    grid-row: 1;
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100dvh;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .jump-steps {
    grid-column: 1;
    grid-row: 1;
    position: relative;
    z-index: 2;
  }
  .jstep {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  .step-inner {
    pointer-events: auto;
    width: 100%;
    background: color-mix(in srgb, var(--board) 70%, black);
    border: 1px solid var(--chalk-faint);
    border-radius: 4px;
    padding: 1.4rem 1.5rem;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    font-family: var(--font-body);
    font-size: 1.05rem;
    line-height: 1.6;
    opacity: 0.45;
    transform: translateY(10px);
    transition: opacity 0.45s ease, transform 0.45s ease;
  }
  .step-inner.active {
    opacity: 1;
    transform: translateY(0);
  }

  .foot {
    max-width: 680px;
    margin: 5rem auto 4rem;
    padding: 2rem 1.5rem 0;
    border-top: 1px solid var(--chalk-faint);
    color: var(--chalk-dim);
    font-size: 0.9rem;
  }
  .sources {
    margin: 0 0 1.2rem;
    line-height: 1.6;
  }
  .sources a {
    color: var(--chalk-dim);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .sources a:hover { color: var(--chalk); }
  .credit { margin: 0.35rem 0 0; color: var(--chalk-dim); }
  .credit:first-of-type { margin-top: 1.2rem; }

  @media (max-width: 820px) {
    .section-head {
      margin-bottom: 3rem;
    }
    .hero { padding: 1rem 0.625rem; }
    .headline-stage { flex-basis: clamp(185px, 36vw, 260px); }
    .campus-stage { margin-bottom: 0.15rem; }
    /* Phones/tablets: chart fills the screen, cards float over it from the bottom */
    .jump-wrap { display: block; padding: 0; max-width: none; }
    .jump-graphic { width: 100%; overflow: hidden; }
    .jump-steps { margin-top: -100vh; margin-top: -100dvh; pointer-events: none; }
    .jstep { min-height: 100dvh; align-items: flex-end; justify-content: center; padding-bottom: 4vh; }
    .step-inner { width: min(92vw, 380px); font-size: 16px; }
    .dek { font-size: 16px; }
    .prose { font-size: 16px; }
    .foot {
      font-size: 0.82rem;
      margin: 4rem auto 3rem;
      padding: 1.5rem 1.25rem 0;
    }
    .hero-scroll { height: 175vh; }
    .hat-slot,
    .hat-flyer { width: clamp(32px, 10vw, 44px); }
    .hat-slot { height: clamp(44px, 14vw, 62px); }
  }
</style>
