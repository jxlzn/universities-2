// Svelte action: reports how far an element has travelled through the viewport.
// progress = 0 when the element's top hits the bottom of the viewport,
//            1 when the element's bottom hits the top of the viewport.
export function scrollProgress(node, callback) {
  let ticking = false;

  function measure() {
    ticking = false;
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh;
    const raw = (vh - rect.top) / total;
    callback(Math.min(1, Math.max(0, raw)));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(measure);
    }
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
}

// Svelte action for "pinned" sections that sit under `position: sticky` from
// the very top of the page (where `scrollProgress`'s viewport-relative math
// doesn't start at 0). Reports 0 the moment the section starts pinning and 1
// once its scroll runway (height - 100vh) has been fully consumed.
export function pinProgress(node, callback) {
  let ticking = false;

  function measure() {
    ticking = false;
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight;
    const runway = rect.height - vh;
    if (runway <= 0) {
      callback(0);
      return;
    }
    const raw = -rect.top / runway;
    callback(Math.min(1, Math.max(0, raw)));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(measure);
    }
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
}

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
