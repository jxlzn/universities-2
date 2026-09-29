<script>
  // Recolours the site's graduation-cap mark (public/hat.svg) to chalk so it
  // reads against the dark board, instead of its original near-black fill.
  let { class: klass = '' } = $props();
</script>

<svg viewBox="0 0 100 53.31" class="chalk-hat {klass}" aria-hidden="true" focusable="false">
  <path
    d="M20.14,24.04l27.47,15.41,31.84-3.85-2.82,13.87c-10.57-2.31-20.99-.54-31.32,3.85-8.54-8.18-17.88-13.59-28.24-15.4l3.08-13.87ZM.12,9.5L54.04,0l45.96,29.53-52.63,6.16L.12,9.5Z"
  />
  <g>
    <path
      d="M12.02,30.78c1.48,0,2.69-1.03,2.69-2.3,0-1.03-.79-1.9-1.87-2.19V10.03h-1.63v16.25c-1.08.3-1.87,1.17-1.87,2.19,0,1.27,1.2,2.3,2.69,2.3Z"
    />
    <path
      d="M12.02,31.43c-.48,0-.94-.09-1.36-.24-.79,4.06-1.33,10.37-1.33,11.74,0,2.06,1.2-1.02,2.69-1.02s2.69,3.09,2.69,1.02c0-1.37-.53-7.67-1.33-11.74-.42.15-.88.24-1.36.24Z"
    />
  </g>
</svg>

<style>
  .chalk-hat {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .chalk-hat path {
    fill: var(--chalk);
    fill-rule: evenodd;
  }
</style>
