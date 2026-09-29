<script>
  // Detailed chalk sketch: neo-Gothic / classical collegiate facade draws,
  // then morphs into an East-Asian campus courtyard garden.
  // Generic architecture only — not a likeness of any real university.
  let {
    progress = null,
    reducedMotion = false,
    onMid = () => {},
    onDone = () => {}
  } = $props();

  let internal = $state(0);
  let midFired = false;
  let doneFired = false;

  let t = $derived(progress != null ? progress : internal);

  let drawW = $derived(clamp((t - 0.0) / 0.32));
  let morph = $derived(clamp((t - 0.3) / 0.46));
  let drawE = $derived(clamp((t - 0.34) / 0.48));
  let settle = $derived(clamp((t - 0.8) / 0.2));

  let westOp = $derived(1 - ease(morph));
  let eastOp = $derived(ease(drawE) * (0.5 + settle * 0.5));
  let ochre = $derived(0.2 + settle * 0.55);

  function clamp(v, lo = 0, hi = 1) {
    return Math.min(hi, Math.max(lo, v));
  }
  function ease(p) {
    return p * p * (3 - 2 * p);
  }
  function dash(len, p) {
    const drawn = len * ease(clamp(p));
    return `${drawn} ${len}`;
  }
  function d(p, start, span = 1 - start) {
    return clamp((p - start) / span);
  }

  $effect(() => {
    if (progress != null) return;
    if (reducedMotion) {
      internal = 1;
      if (!midFired) {
        midFired = true;
        onMid();
      }
      if (!doneFired) {
        doneFired = true;
        onDone();
      }
      return;
    }
    let raf;
    let start = null;
    const DUR = 6800;
    function tick(ts) {
      if (start == null) start = ts;
      const p = Math.min(1, (ts - start) / DUR);
      internal = p;
      if (p >= 0.32 && !midFired) {
        midFired = true;
        onMid();
      }
      if (p >= 1) {
        if (!doneFired) {
          doneFired = true;
          onDone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  $effect(() => {
    if (progress == null) return;
    if (t >= 0.32 && !midFired) {
      midFired = true;
      onMid();
    }
    if (t >= 0.99 && !doneFired) {
      doneFired = true;
      onDone();
    }
  });
</script>

<div class="campus" aria-hidden="true">
  <svg viewBox="0 0 280 172" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id="cm-grain" x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.55" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <clipPath id="cm-lake-clip">
        <path
          d="M14 130 C60 127, 110 130, 140 129 C180 128, 230 130, 266 130
             C272 142, 262 154, 240 160 C200 169, 90 169, 44 160 C22 154, 8 142, 14 130 Z"
        />
      </clipPath>
      <linearGradient id="cm-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9fd0c8" stop-opacity="0.34" />
        <stop offset="0.6" stop-color="#7fb6b0" stop-opacity="0.18" />
        <stop offset="1" stop-color="#5f9c98" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    <g filter="url(#cm-grain)">
      <!-- terrain -->
      <path
        class="line ground"
        d="M8 128 C40 122, 90 126, 140 124 C190 122, 240 126, 272 128"
        pathLength="100"
        stroke-dasharray={dash(100, Math.max(drawW, drawE))}
      />
      <path
        class="line faint"
        style="opacity:{0.72 * westOp}"
        d="M20 132 C70 130, 120 134, 170 131 C220 129, 250 133, 268 132"
        pathLength="80"
        stroke-dasharray={dash(80, d(Math.max(drawW, drawE), 0.2))}
      />

      <!-- ════════ WESTERN COLLEGIATE FACADE ════════ -->
      <g class="west" style="opacity:{westOp}">
        <!-- side wing L -->
        <path
          class="line"
          d="M28 128 L28 78 L62 78 L62 128"
          pathLength="100"
          stroke-dasharray={dash(100, d(drawW, 0))}
        />
        <path
          class="line faint"
          d="M28 78 L45 62 L62 78 M32 86 H58 M32 98 H58 M32 110 H58"
          pathLength="90"
          stroke-dasharray={dash(90, d(drawW, 0.06))}
        />
        <!-- side wing R -->
        <path
          class="line"
          d="M218 128 L218 78 L252 78 L252 128"
          pathLength="100"
          stroke-dasharray={dash(100, d(drawW, 0.02))}
        />
        <path
          class="line faint"
          d="M218 78 L235 62 L252 78 M222 86 H248 M222 98 H248 M222 110 H248"
          pathLength="90"
          stroke-dasharray={dash(90, d(drawW, 0.08))}
        />

        <!-- main block outline + cornice -->
        <path
          class="line"
          d="M62 128 L62 70 L218 70 L218 128"
          pathLength="120"
          stroke-dasharray={dash(120, d(drawW, 0.05))}
        />
        <path
          class="line"
          d="M58 70 H222 M60 66 H220"
          pathLength="80"
          stroke-dasharray={dash(80, d(drawW, 0.12))}
        />

        <!-- classical pediment + dentils -->
        <path
          class="line"
          d="M72 66 L140 22 L208 66"
          pathLength="120"
          stroke-dasharray={dash(120, d(drawW, 0.14))}
        />
        <path
          class="line faint"
          d="M80 66 L140 30 L200 66 M140 30 L140 42"
          pathLength="100"
          stroke-dasharray={dash(100, d(drawW, 0.18))}
        />
        <path
          class="line faint"
          d="M88 64 v4 M100 64 v4 M112 64 v4 M124 64 v4 M136 64 v4 M148 64 v4 M160 64 v4 M172 64 v4 M184 64 v4 M196 64 v4"
          pathLength="50"
          stroke-dasharray={dash(50, d(drawW, 0.22))}
        />

        <!-- central clock tower -->
        <path
          class="line"
          d="M118 66 L118 18 L162 18 L162 66"
          pathLength="100"
          stroke-dasharray={dash(100, d(drawW, 0.2))}
        />
        <path
          class="line"
          d="M114 18 H166 L160 8 H120 Z M140 8 L140 2 M132 2 H148"
          pathLength="90"
          stroke-dasharray={dash(90, d(drawW, 0.28))}
        />
        <!-- clock face -->
        <circle
          class="line"
          cx="140"
          cy="38"
          r="11"
          pathLength="70"
          stroke-dasharray={dash(70, d(drawW, 0.32))}
        />
        <path
          class="line faint"
          d="M140 38 L140 30 M140 38 L147 42 M140 27 v2 M140 47 v2 M129 38 h2 M149 38 h2"
          pathLength="40"
          stroke-dasharray={dash(40, d(drawW, 0.38))}
        />

        <!-- colonnade: 4 columns with bases & capitals -->
        <path
          class="line"
          d="M78 128 V74 M76 74 H86 M76 128 H86 M76 70 H86
             M108 128 V74 M106 74 H116 M106 128 H116 M106 70 H116
             M164 128 V74 M162 74 H172 M162 128 H172 M162 70 H172
             M194 128 V74 M192 74 H202 M192 128 H202 M192 70 H202"
          pathLength="200"
          stroke-dasharray={dash(200, d(drawW, 0.24))}
        />
        <!-- fluting hints -->
        <path
          class="line hair"
          d="M81 120 V78 M83 120 V78 M111 120 V78 M113 120 V78 M167 120 V78 M169 120 V78 M197 120 V78 M199 120 V78"
          pathLength="120"
          stroke-dasharray={dash(120, d(drawW, 0.35))}
        />

        <!-- grand arched portal -->
        <path
          class="line"
          d="M124 128 V98 A16 18 0 0 1 156 98 V128"
          pathLength="90"
          stroke-dasharray={dash(90, d(drawW, 0.4))}
        />
        <path
          class="line faint"
          d="M128 128 V100 A12 14 0 0 1 152 100 V128 M140 92 V128 M132 110 H148"
          pathLength="80"
          stroke-dasharray={dash(80, d(drawW, 0.48))}
        />

        <!-- mullioned windows — upper storey -->
        <path
          class="line faint"
          d="M88 48 h16 v14 h-16 z M92 48 v14 M96 48 v14 M100 48 v14
             M176 48 h16 v14 h-16 z M180 48 v14 M184 48 v14 M188 48 v14"
          pathLength="120"
          stroke-dasharray={dash(120, d(drawW, 0.42))}
        />
        <!-- arched windows mid -->
        <path
          class="line faint"
          d="M88 88 h16 v18 h-16 z M96 88 v-6 a4 4 0 0 1 0 0
             M176 88 h16 v18 h-16 z
             M88 88 Q96 80 104 88 M176 88 Q184 80 192 88"
          pathLength="100"
          stroke-dasharray={dash(100, d(drawW, 0.5))}
        />

        <!-- stone coursing / quoins -->
        <path
          class="line hair"
          d="M62 80 H70 M62 92 H70 M62 104 H70 M62 116 H70
             M210 80 H218 M210 92 H218 M210 104 H218 M210 116 H218
             M70 70 H210 M70 82 H210 M70 94 H210 M70 106 H210 M70 118 H210"
          pathLength="200"
          stroke-dasharray={dash(200, d(drawW, 0.45))}
        />

        <!-- ceremonial steps + railing -->
        <path
          class="line"
          d="M112 128 H168 M116 132 H164 M120 136 H160 M124 140 H156"
          pathLength="80"
          stroke-dasharray={dash(80, d(drawW, 0.55))}
        />
        <path
          class="line faint"
          d="M118 128 V140 M162 128 V140"
          pathLength="30"
          stroke-dasharray={dash(30, d(drawW, 0.6))}
        />

        <!-- ivy on left wing -->
        <path
          class="line hair"
          d="M30 100 C36 94, 34 88, 40 84 C36 90, 42 96, 38 102 C44 98, 46 108, 42 112
             M252 100 C246 94, 248 88, 242 84"
          pathLength="80"
          stroke-dasharray={dash(80, d(drawW, 0.62))}
        />

        <!-- flagpole remnant on tower -->
        <path
          class="line hair"
          d="M140 2 V-4 M140 -4 L148 -1 L140 2"
          pathLength="25"
          stroke-dasharray={dash(25, d(drawW, 0.65))}
        />
      </g>

      <!-- ════════ EAST-ASIAN CAMPUS GARDEN ════════ -->
      <g class="east" style="opacity:{eastOp}">
        <!-- ════════ ONE PAVILION (centred, on the shore) ════════ -->
        <g transform="translate(-141.25 -32) scale(1.25)">
          <path
            class="line"
            d="M200 128 V100 H250 V128 M200 100 Q225 82 250 100
               M210 128 V104 M240 128 V104 M205 112 H245"
            pathLength="150"
            stroke-dasharray={dash(150, d(drawE, 0.1))}
          />
          <path
            class="line accent"
            style="opacity:{0.5 + ochre * 0.4}"
            d="M194 100 Q212 78 225 74 Q238 78 256 100 M201 96 Q225 80 249 96"
            pathLength="120"
            stroke-dasharray={dash(120, d(drawE, 0.24))}
          />
          <path
            class="line faint"
            d="M206 128 H244 M209 131 H241"
            pathLength="40"
            stroke-dasharray={dash(40, d(drawE, 0.32))}
          />
        </g>

        <!-- ════════ LAKE ════════ -->
        <!-- water surface tint -->
        <path
          class="lake-fill"
          style="opacity:{d(drawE, 0.4) * (0.5 + settle * 0.5)}"
          d="M14 130 C60 127, 110 130, 140 129 C180 128, 230 130, 266 130
             C272 142, 262 154, 240 160 C200 169, 90 169, 44 160 C22 154, 8 142, 14 130 Z"
        />
        <!-- shoreline / lake edge (top shore is drawn by the ground lines; lower rim is a whisper) -->
        <path
          class="line hair"
          style="opacity:0.28"
          d="M14 130 C8 142, 22 154, 44 160 C90 169, 200 169, 240 160 C262 154, 272 142, 266 130"
          pathLength="260"
          stroke-dasharray={dash(260, d(drawE, 0.36))}
        />
        <!-- gentle shore lip -->
        <path
          class="line faint"
          d="M16 133 C60 131, 110 134, 140 132 C180 131, 230 134, 264 133"
          pathLength="120"
          stroke-dasharray={dash(120, d(drawE, 0.42))}
        />

        <!-- pavilion mirrored in the water -->
        <path
          class="line reflect"
          style="opacity:{d(drawE, 0.6) * (0.35 + settle * 0.4)}"
          d="M112 137 Q140 152 168 137 M121 134 V147 M159 134 V147"
        />
        <path
          class="line reflect"
          style="opacity:{d(drawE, 0.66) * (0.3 + settle * 0.3)}"
          d="M108 141 q8 -2 16 0 t16 0 t16 0 t16 0 M116 147 q7 -2 14 0 t14 0 t14 0 t14 0"
        />

        <!-- ripples -->
        <path
          class="line hair"
          d="M44 152 q8 -2.5 16 0 t16 0 t16 0
             M186 154 q8 -2.5 16 0 t16 0 t16 0
             M100 164 q10 -2.5 20 0 t20 0 t20 0 t20 0"
          pathLength="140"
          stroke-dasharray={dash(140, d(drawE, 0.6))}
        />
        <path
          class="line hair"
          d="M60 158 q6 -2 12 0 t12 0 M160 160 q6 -2 12 0 t12 0 M226 147 q5 -2 10 0 t10 0"
          pathLength="70"
          stroke-dasharray={dash(70, d(drawE, 0.68))}
        />
        <!-- dense wave rows across the whole surface -->
        <path
          class="line wave"
          clip-path="url(#cm-lake-clip)"
          d="M22 137 q5 -1.8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0
             M18 142 q5 -1.8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0
             M20 147 q5 -1.8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0
             M28 153 q5 -1.8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0
             M48 159 q5 -1.8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"
          pathLength="400"
          stroke-dasharray={dash(400, d(drawE, 0.5))}
        />

      </g>

    </g>
  </svg>
</div>

<style>
  .campus {
    width: min(94vw, 640px);
    margin: 0 auto;
    pointer-events: none;
    flex: 0 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  svg {
    width: 100%;
    height: auto;
    flex: 1 1 auto;
    min-height: 0;
    display: block;
    overflow: visible;
  }
  .line {
    fill: none;
    stroke: var(--chalk);
    stroke-width: 1.05;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .line.faint {
    stroke-width: 0.75;
    opacity: 0.72;
  }
  .line.hair {
    stroke-width: 0.55;
    opacity: 0.55;
  }
  .line.ground {
    stroke-width: 1.25;
    opacity: 0.9;
  }
  .line.accent {
    stroke: var(--r-asia);
    stroke-width: 1.1;
  }
  .lake-fill {
    fill: url(#cm-water);
    stroke: none;
  }
  .line.wave {
    stroke: #bfe3dc;
    stroke-width: 0.6;
    opacity: 0.5;
  }
  .line.reflect {
    stroke-width: 0.7;
    stroke-dasharray: 3.2 2.6;
  }

  @media (max-width: 820px) {
    .campus {
      width: min(98vw, 460px);
    }
    .line {
      stroke-width: 1.2;
    }
    .line.faint {
      stroke-width: 0.85;
    }
    .line.hair {
      stroke-width: 0.65;
    }
  }
</style>
