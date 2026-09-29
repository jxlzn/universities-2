<script>
  // Chalk lotus in bloom, resting on a lily pad, for the prologue scroll-fall.
  let { class: klass = '' } = $props();
</script>

<svg viewBox="0 0 48 68" class="lotus {klass}" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- stem -->
    <path d="M24 46 V63" />
    <!-- lily pad -->
    <path d="M7 62 Q24 55 41 62 Q24 68 7 62 Z" opacity="0.6" />
    <path d="M24 62 L33 59.5" opacity="0.35" />

    <!-- outer petals -->
    <path d="M24 46 C10 50, 1 42, 2 32 C10 34, 18 38, 24 46 Z" opacity="0.8" />
    <path d="M24 46 C38 50, 47 42, 46 32 C38 34, 30 38, 24 46 Z" opacity="0.8" />

    <!-- middle petals -->
    <path d="M24 46 C14 44, 6 34, 7 22 C16 26, 22 36, 24 46 Z" />
    <path d="M24 46 C34 44, 42 34, 41 22 C32 26, 26 36, 24 46 Z" />

    <!-- centre petal -->
    <path d="M24 8 C31 18, 31 34, 24 46 C17 34, 17 18, 24 8 Z" />

    <!-- petal veins -->
    <path d="M24 16 V40" opacity="0.4" />
    <path d="M13 28 C16 32, 19 37, 21 42" opacity="0.35" />
    <path d="M35 28 C32 32, 29 37, 27 42" opacity="0.35" />
  </g>
  <circle cx="24" cy="44" r="1.6" fill="currentColor" opacity="0.35" />
</svg>

<style>
  .lotus {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    color: var(--r-asia);
  }
</style>
