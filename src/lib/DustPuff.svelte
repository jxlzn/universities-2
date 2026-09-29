<script>
  // A small burst of chalk-dust motes, for moments like a chalk stick lifting
  // off the board or a mortarboard thudding down. Purely decorative.
  let { count = 8, size = 4, delay = 0, spread = 26 } = $props();

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
    const dist = spread * (0.55 + Math.random() * 0.75);
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - spread * 0.35,
      d: delay + Math.random() * 0.1,
      s: size * (0.55 + Math.random() * 0.9)
    };
  });
</script>

<span class="dust-puff" aria-hidden="true">
  {#each particles as p, i (i)}
    <i
      class="mote"
      style="--dx:{p.dx}px; --dy:{p.dy}px; width:{p.s}px; height:{p.s}px; animation-delay:{p.d}s;"
    ></i>
  {/each}
</span>

<style>
  .dust-puff {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .mote {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 50%;
    background: var(--chalk);
    opacity: 0;
    animation: mote-fly 0.75s ease-out forwards;
  }
  @keyframes mote-fly {
    0% {
      opacity: 0;
      transform: translate(0, 0) scale(0.4);
    }
    18% {
      opacity: 0.85;
    }
    100% {
      opacity: 0;
      transform: translate(var(--dx), var(--dy)) scale(1);
    }
  }
</style>
