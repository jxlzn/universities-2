<script>
  // Detailed chalk stone lantern (tōrō) for the prologue scroll-fall.
  let { class: klass = '' } = $props();
</script>

<svg viewBox="0 0 48 68" class="lantern {klass}" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- shaft -->
    <path d="M24 66 V48" />
    <!-- base platform -->
    <path d="M12 48 H36" />
    <path d="M14 48 L12 52 H36 L34 48" opacity="0.55" />
    <!-- firebox -->
    <rect x="16" y="32" width="16" height="16" rx="1.2" />
    <path d="M16 40 H32" opacity="0.45" />
    <path d="M20 36 V44 M28 36 V44" opacity="0.4" />
    <!-- roof -->
    <path d="M14 32 L24 18 L34 32 Z" />
    <path d="M16 32 L24 22 L32 32" opacity="0.5" />
    <!-- finial -->
    <path d="M24 18 V10" />
    <path d="M21 12 H27" />
    <circle cx="24" cy="8" r="2.2" />
  </g>
  <circle cx="24" cy="40" r="1.6" fill="currentColor" opacity="0.3" />
</svg>

<style>
  .lantern {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    color: var(--r-asia);
  }
</style>
