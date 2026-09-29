<script>
  // Generic scrollytelling driver. Renders sticky `graphic` + scrolling steps,
  // and reports the index of the step currently near the middle of the screen.
  // overlay: on small screens, the graphic fills the screen and the step cards
  // float over it from the bottom (same behaviour as the beeswarm section).
  let { steps = [], active = $bindable(-1), graphic, overlay = false } = $props();

  let stepEls = $state([]);

  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = stepEls.indexOf(entry.target);
            if (idx !== -1) active = idx;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    for (const el of stepEls) if (el) observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div class="scrolly" class:overlay>
  <div class="graphic">
    {@render graphic(active)}
  </div>
  <div class="steps">
    {#each steps as step, i}
      <div class="step" class:active={active === i} bind:this={stepEls[i]}>
        <div class="step-inner">
          {@html step}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .scrolly {
    position: relative;
    display: grid;
    grid-template-columns: 1fr minmax(300px, 420px);
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .graphic {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .steps {
    position: relative;
    z-index: 2;
  }
  .step {
    min-height: 78vh;
    display: flex;
    align-items: center;
  }
  .step-inner {
    background: color-mix(in srgb, var(--board) 82%, black);
    border: 1px solid var(--chalk-faint);
    border-radius: 4px;
    padding: 1.4rem 1.5rem;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    opacity: 0.32;
    transform: translateY(10px);
    transition: opacity 0.5s ease, transform 0.5s ease;
    font-family: var(--font-body);
    font-size: 1.05rem;
    line-height: 1.6;
  }
  .step.active .step-inner {
    opacity: 1;
    transform: translateY(0);
  }
  @media (max-width: 820px) {
    .scrolly {
      grid-template-columns: 1fr;
      padding-top: 0.5rem;
    }
    .graphic {
      top: 12vh;
      height: 58vh;
      align-items: flex-start;
      padding-top: 1rem;
    }
    .steps {
      pointer-events: none;
    }
    .step {
      min-height: 70vh;
      justify-content: center;
    }
    .step-inner {
      pointer-events: auto;
      max-width: 340px;
      font-size: 16px;
    }

    /* Full-screen graphic with cards floating over it from the bottom */
    .overlay.scrolly {
      padding: 0;
      max-width: none;
    }
    .overlay .graphic {
      top: 0;
      height: 100vh;
      height: 100dvh;
      width: 100%;
      overflow: hidden;
      align-items: center;
      padding-top: 0;
    }
    .overlay .steps {
      margin-top: -100vh;
      margin-top: -100dvh;
    }
    .overlay .step {
      min-height: 100vh;
      min-height: 100dvh;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4vh;
    }
    .overlay .step-inner {
      width: min(92vw, 380px);
      max-width: none;
    }
  }
</style>
