/* @ds-bundle: {"format":4,"namespace":"RappiAdsDesignSystem_019dd9","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"BannerHome","sourcePath":"components/core/BannerHome.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"InappCard","sourcePath":"components/core/InappCard.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"434759a50e53","components/core/BannerHome.jsx":"3d4ac9e2af17","components/core/Button.jsx":"e7b7fbcd9fb6","components/core/InappCard.jsx":"3981c13f7b29","components/core/Tag.jsx":"80de67aca247","doc-page.js":"f106e1b77ea0","ui_kits/rappiads/Analytics.jsx":"adf33de5969a","ui_kits/rappiads/AppShell.jsx":"778bacacb489","ui_kits/rappiads/CampaignBuilder.jsx":"34ea3fe0be30","ui_kits/rappiads/Dashboard.jsx":"7bc593e8cfb9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RappiAdsDesignSystem_019dd9 = window.RappiAdsDesignSystem_019dd9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  value = '30%',
  label = 'OFF',
  variant = 'neon',
  size = 'md'
}) {
  const variants = {
    neon: {
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      color: '#fff'
    },
    dark: {
      background: '#0A0A0A',
      color: '#fff'
    },
    gold: {
      background: 'linear-gradient(135deg,#F0B769,#E8A24C)',
      color: '#0A0A0A'
    },
    white: {
      background: '#fff',
      color: '#FF2526'
    }
  };
  const sizes = {
    sm: {
      padding: '6px 10px',
      valueSize: 20,
      labelSize: 10,
      borderRadius: 10,
      gap: 2
    },
    md: {
      padding: '10px 14px',
      valueSize: 28,
      labelSize: 12,
      borderRadius: 14,
      gap: 3
    },
    lg: {
      padding: '14px 18px',
      valueSize: 40,
      labelSize: 15,
      borderRadius: 18,
      gap: 4
    }
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.neon;
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: s.padding,
      borderRadius: s.borderRadius,
      gap: s.gap,
      fontFamily: "'PPObjectSans',sans-serif",
      ...v
    }
  }, React.createElement('span', {
    style: {
      fontSize: s.valueSize,
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: '-0.04em'
    }
  }, value), React.createElement('span', {
    style: {
      fontSize: s.labelSize,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: 1
    }
  }, label));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/BannerHome.jsx
try { (() => {
function BannerHome({
  title = 'Tu súper en 10 min',
  subtitle = 'Al mismo precio. Sin salir.',
  cta = 'Ver más',
  variant = 'neon',
  logoSrc = null
}) {
  const bg = variant === 'turbo' ? '#248F63' : variant === 'pro' ? '#ECEFF3' : 'linear-gradient(135deg,#FF7A4D 0%,#FF2526 55%,#FF4583 100%)';
  const onDark = variant !== 'pro';
  const textColor = onDark ? '#fff' : '#000';
  const mutedColor = onDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.5)';
  const ctaStyle = onDark ? {
    background: '#fff',
    color: '#FF2526'
  } : {
    background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
    color: '#fff'
  };
  return React.createElement('div', {
    style: {
      width: 320,
      height: 136,
      borderRadius: 16,
      overflow: 'hidden',
      background: bg,
      fontFamily: "'PPObjectSans',sans-serif",
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, React.createElement('div', {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, React.createElement('div', {
    style: {
      fontSize: 20,
      fontWeight: 900,
      color: textColor,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    }
  }, title), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: mutedColor,
      lineHeight: 1.3
    }
  }, subtitle)), React.createElement('button', {
    style: {
      ...ctaStyle,
      borderRadius: 9999,
      border: 'none',
      cursor: 'pointer',
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 900,
      fontFamily: "'PPObjectSans',sans-serif",
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, cta));
}
Object.assign(__ds_scope, { BannerHome });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BannerHome.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  label = 'Pide ya',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'PPObjectSans', sans-serif",
    fontWeight: 900,
    letterSpacing: '0.01em',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    borderRadius: 9999,
    transition: 'opacity 150ms ease, transform 100ms ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  };
  const sizes = {
    sm: {
      padding: '8px 20px',
      fontSize: 13
    },
    md: {
      padding: '12px 28px',
      fontSize: 15
    },
    lg: {
      padding: '16px 40px',
      fontSize: 18
    }
  };
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #FF7A4D 0%, #FF2526 55%, #FF4583 100%)',
      color: '#fff'
    },
    secondary: {
      background: 'transparent',
      color: '#FF2526',
      border: '2px solid #FF2526'
    },
    ghost: {
      background: 'rgba(255,37,38,0.08)',
      color: '#FF2526'
    },
    dark: {
      background: '#0A0A0A',
      color: '#fff'
    },
    white: {
      background: '#fff',
      color: '#FF2526'
    }
  };
  const style = {
    ...base,
    ...(sizes[size] || sizes.md),
    ...(variants[variant] || variants.primary)
  };
  return React.createElement('button', {
    style,
    disabled,
    onClick
  }, label);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/InappCard.jsx
try { (() => {
function InappCard({
  title = '30% OFF hoy',
  description = 'En restaurantes seleccionados.',
  cta = 'Ver restaurantes',
  badgeValue = null,
  imageSrc = null,
  variant = 'neon'
}) {
  const isNeon = variant === 'neon';
  const isTurbo = variant === 'turbo';
  const isPro = variant === 'pro';
  const bgTop = isNeon ? 'linear-gradient(160deg,#FF7A4D 0%,#FF2526 55%,#FF4583 100%)' : isTurbo ? '#248F63' : '#ECEFF3';
  const textOnTop = !isPro;
  return React.createElement('div', {
    style: {
      width: 300,
      height: 400,
      borderRadius: 20,
      overflow: 'hidden',
      fontFamily: "'PPObjectSans',sans-serif",
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
      position: 'relative'
    }
  },
  // Top section (background + image)
  React.createElement('div', {
    style: {
      flex: 1,
      background: bgTop,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  }, imageSrc && React.createElement('img', {
    src: imageSrc,
    alt: '',
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), badgeValue && React.createElement('div', {
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      background: '#fff',
      borderRadius: 12,
      padding: '6px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: '#FF2526',
      lineHeight: 1,
      letterSpacing: '-0.04em'
    }
  }, badgeValue), React.createElement('span', {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: '#FF2526',
      letterSpacing: '.08em',
      textTransform: 'uppercase'
    }
  }, 'OFF'))),
  // Bottom section
  React.createElement('div', {
    style: {
      background: '#fff',
      padding: '16px 18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: '#0A0A0A',
      lineHeight: 1.1,
      letterSpacing: '-0.03em'
    }
  }, title), React.createElement('div', {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(10,10,10,0.55)',
      lineHeight: 1.4
    }
  }, description), React.createElement('button', {
    style: {
      marginTop: 4,
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      color: '#fff',
      border: 'none',
      borderRadius: 9999,
      padding: '10px 0',
      width: '100%',
      fontFamily: "'PPObjectSans',sans-serif",
      fontSize: 14,
      fontWeight: 900,
      cursor: 'pointer',
      letterSpacing: '0.01em'
    }
  }, cta)));
}
Object.assign(__ds_scope, { InappCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/InappCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  label = 'Turbo',
  variant = 'neon',
  active = false
}) {
  const variants = {
    neon: {
      background: active ? 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)' : 'rgba(255,37,38,0.08)',
      color: active ? '#fff' : '#FF2526'
    },
    turbo: {
      background: active ? '#248F63' : 'rgba(36,143,99,0.10)',
      color: active ? '#fff' : '#248F63'
    },
    pro: {
      background: active ? '#0A0A0A' : '#ECEFF3',
      color: active ? '#F0B769' : '#0A0A0A'
    },
    neutral: {
      background: active ? '#0A0A0A' : 'rgba(10,10,10,0.07)',
      color: active ? '#fff' : '#0A0A0A'
    }
  };
  const v = variants[variant] || variants.neon;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 16px',
      borderRadius: 9999,
      fontFamily: "'PPObjectSans',sans-serif",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      transition: 'all 150ms ease',
      ...v
    }
  }, label);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * On screen the document renders as a single continuous sheet on a desk
 * background (Google Docs' pageless view): you scroll one tall page card.
 * There is no manual page-splitting — write the whole document as normal
 * flow inside <doc-page> and the browser's print engine paginates it at
 * export.
 *
 * At print the component injects `@page { size: …; margin: 0 }` (which
 * leaves Chrome no margin box to draw its date/URL/page-count header in)
 * and moves the visual margin onto the sheet's own padding, so the printed
 * page has the same inset you see on screen. Standard break-hygiene rules
 * (`break-inside: avoid` on figures, code blocks, images and table rows;
 * `orphans/widows: 3`) are applied so paragraphs and groups split cleanly.
 * On screen and at print, headings default to `text-wrap: balance` and
 * body text (p, li, blockquote, figcaption) to `text-wrap: pretty`, so
 * the document avoids widowed/orphaned words; the defaults have zero
 * specificity, so any text-wrap you declare on those elements wins.
 * The component also marks the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page size="letter" margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 *
 * Attributes:
 *   size    — letter | a4 | legal (default letter)
 *   orientation — portrait (default) | landscape. For documents built to
 *           export, always set it explicitly. landscape swaps the named
 *           size's dimensions (letter landscape prints 11in × 8.5in).
 *   width / height — explicit CSS lengths, override `size` and
 *           `orientation`: the page IS the design's size (a poster
 *           printed at its true dimensions). With both set, the component
 *           also declares the page box as the preview size (a
 *           `meta[name="omelette-fixed-size"]` it injects at runtime,
 *           never overriding one you author), so the in-app preview
 *           scales the whole sheet into view.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the named
 *           paper: content lays out at exactly this size, and the
 *           component scales it to fit the printable area (centered
 *           horizontally, top-aligned), so e.g. a 960px-wide poster lands
 *           on one Letter page. Both must be set; they do not change the
 *           page box — `size`/`orientation` (or `width`/`height`)
 *           still name the paper. For pages WITHOUT running
 *           header/footer slots — the fit box fills the printable area
 *           and does not subtract slot heights.
 *   margin  — printable inset on every page (default 0.75in); margin="0"
 *           makes pages full-bleed (content then owns its own insets)
 *
 * Running header/footer (optional): give an element `slot="header"` or
 * `slot="footer"` and it repeats on every printed page via
 * `position: fixed`. To keep body text from sliding under it, the
 * component prints inside a single-cell table whose <thead>/<tfoot> are
 * spacers sized to the header/footer height — browsers repeat thead/tfoot
 * on every page, so each sheet's content starts below the header and ends
 * above the footer. On screen the header/footer render once at the
 * top/bottom of the sheet.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks: `break-before: page` on an element that must start
 *   a new page (a chapter, an appendix). Add your own kept-together
 *   blocks (callouts, stat tiles, cards) to a `break-inside: avoid`
 *   rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #ece8dd;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 14px rgba(20, 20, 19, 0.12);
      border-radius: 2px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
      } else if (typeof survivor._syncFixedSizeMeta === 'function') {
        // A departed true-size owner hands the page-global preview meta
        // to whatever true-size page remains (or it's removed).
        survivor._syncFixedSizeMeta();
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      this._vars.textContent = ':host{' + fitVars + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      tag.textContent = '@page { size: ' + this.pageWidth + ' ' + this.pageHeight + '; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "doc-page.js", error: String((e && e.message) || e) }); }

// ui_kits/rappiads/Analytics.jsx
try { (() => {
// RappiAds UI Kit — Analytics screen
function MiniBar({
  pct,
  color
}) {
  return React.createElement('div', {
    style: {
      background: '#F0F1F3',
      borderRadius: 4,
      height: 8,
      flex: 1
    }
  }, React.createElement('div', {
    style: {
      background: color || 'linear-gradient(135deg,#FF7A4D,#FF2526)',
      width: `${pct}%`,
      height: '100%',
      borderRadius: 4,
      transition: 'width .4s ease'
    }
  }));
}
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
const spendData = [18000, 23000, 31000, 28000, 41000, 67600];
const roasData = [3.1, 3.6, 4.0, 3.7, 4.4, 4.7];
const maxSpend = Math.max(...spendData);
const breakdown = [{
  channel: 'Meta 1:1',
  spend: '$28,400',
  impr: '5.8M',
  ctr: '2.3%',
  roas: '4.8x',
  pct: 42
}, {
  channel: 'In-App Card',
  spend: '$19,200',
  impr: '4.1M',
  ctr: '3.1%',
  roas: '5.2x',
  pct: 28
}, {
  channel: 'TikTok 9:16',
  spend: '$12,000',
  impr: '2.9M',
  ctr: '1.8%',
  roas: '3.9x',
  pct: 18
}, {
  channel: 'Banner Filtro',
  spend: '$8,000',
  impr: '1.4M',
  ctr: '4.2%',
  roas: '6.1x',
  pct: 12
}];
function Analytics() {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  },
  // Chart card
  React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 1px 4px rgba(0,0,0,.07)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 28
    }
  }, React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: '#0A0A0A'
    }
  }, 'Gasto & ROAS · H1 2026'), React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(10,10,10,.4)',
      marginTop: 2
    }
  }, 'Ene – Jun · Mars × Rappi · MX')), React.createElement('div', {
    style: {
      display: 'flex',
      gap: 16
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, React.createElement('div', {
    style: {
      width: 12,
      height: 4,
      borderRadius: 2,
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526)'
    }
  }), React.createElement('span', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(10,10,10,.45)'
    }
  }, 'Gasto MXN')), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, React.createElement('div', {
    style: {
      width: 12,
      height: 4,
      borderRadius: 2,
      background: '#248F63'
    }
  }), React.createElement('span', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(10,10,10,.45)'
    }
  }, 'ROAS')))),
  // Bar chart
  React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 12,
      height: 140
    }
  }, months.map((m, i) => React.createElement('div', {
    key: m,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      height: '100%',
      justifyContent: 'flex-end'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 10,
      fontWeight: 900,
      color: '#248F63'
    }
  }, roasData[i] + 'x'), React.createElement('div', {
    style: {
      width: '100%',
      background: i === months.length - 1 ? 'linear-gradient(180deg,#FF7A4D,#FF2526 60%,#FF4583)' : 'rgba(255,37,38,.2)',
      borderRadius: '6px 6px 0 0',
      height: `${spendData[i] / maxSpend * 100}%`,
      transition: 'height .4s ease'
    }
  }), React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(10,10,10,.4)'
    }
  }, m))))),
  // Breakdown table
  React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,.07)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      padding: '18px 24px',
      borderBottom: '1px solid rgba(0,0,0,.07)'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: '#0A0A0A'
    }
  }, 'Gasto por canal · Jun 2026')), React.createElement('div', {
    style: {
      padding: '0 24px'
    }
  }, breakdown.map((b, i) => React.createElement('div', {
    key: i,
    style: {
      padding: '14px 0',
      borderBottom: i < breakdown.length - 1 ? '1px solid rgba(0,0,0,.05)' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement('div', {
    style: {
      width: 120,
      fontSize: 13,
      fontWeight: 700,
      color: '#0A0A0A'
    }
  }, b.channel), React.createElement(MiniBar, {
    pct: b.pct,
    color: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)'
  }), React.createElement('div', {
    style: {
      width: 70,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: 900,
      color: '#0A0A0A'
    }
  }, b.spend), React.createElement('div', {
    style: {
      width: 60,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(10,10,10,.5)'
    }
  }, b.impr), React.createElement('div', {
    style: {
      width: 45,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: 700,
      color: 'rgba(10,10,10,.6)'
    }
  }, b.ctr), React.createElement('div', {
    style: {
      width: 50,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: 900,
      color: '#248F63'
    }
  }, b.roas))))));
}
Object.assign(window, {
  Analytics
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rappiads/Analytics.jsx", error: String((e && e.message) || e) }); }

// ui_kits/rappiads/AppShell.jsx
try { (() => {
// RappiAds UI Kit — AppShell (sidebar + top nav)
const rappiadsStyles = {
  sidebar: {
    width: 220,
    minWidth: 220,
    background: '#0A0A0A',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 24px',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100
  },
  sidebarLogo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 900,
    color: '#fff'
  },
  logoText: {
    fontSize: 15,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.02em'
  },
  logoSub: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,.4)',
    letterSpacing: '.1em',
    textTransform: 'uppercase'
  },
  navSection: {
    padding: '16px 12px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.3)',
    padding: '8px 8px 4px'
  },
  navItem: active => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? '#fff' : 'rgba(255,255,255,.5)',
    background: active ? 'rgba(255,37,38,.18)' : 'transparent',
    transition: 'all 150ms ease'
  }),
  navDot: active => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    background: active ? '#FF2526' : 'rgba(255,255,255,.2)',
    flexShrink: 0
  }),
  topBar: {
    position: 'fixed',
    left: 220,
    right: 0,
    top: 0,
    height: 60,
    background: '#fff',
    borderBottom: '1px solid rgba(0,0,0,.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    zIndex: 99
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: '#0A0A0A',
    letterSpacing: '-0.02em'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 900,
    color: '#fff'
  },
  main: {
    marginLeft: 220,
    marginTop: 60,
    minHeight: 'calc(100vh - 60px)',
    background: '#F7F8FA',
    padding: 32
  }
};
function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  return React.createElement('div', {
    style: rappiadsStyles.navItem(active),
    onClick
  }, React.createElement('div', {
    style: rappiadsStyles.navDot(active)
  }), React.createElement('span', null, label));
}
function AppShell({
  screen,
  onNav,
  title
}) {
  const navItems = [{
    id: 'dashboard',
    label: 'Dashboard'
  }, {
    id: 'campaigns',
    label: 'Campañas'
  }, {
    id: 'create',
    label: 'Nueva campaña'
  }, {
    id: 'analytics',
    label: 'Analytics'
  }, {
    id: 'creatives',
    label: 'Creatividades'
  }];
  return React.createElement('div', {
    style: {
      fontFamily: "'PPObjectSans',sans-serif"
    }
  },
  // Sidebar
  React.createElement('div', {
    style: rappiadsStyles.sidebar
  }, React.createElement('div', {
    style: rappiadsStyles.sidebarLogo
  }, React.createElement('div', {
    style: rappiadsStyles.logoMark
  }, 'R'), React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, React.createElement('span', {
    style: rappiadsStyles.logoText
  }, 'RappiAds'), React.createElement('span', {
    style: rappiadsStyles.logoSub
  }, 'Advertising'))), React.createElement('div', {
    style: rappiadsStyles.navSection
  }, React.createElement('span', {
    style: rappiadsStyles.navLabel
  }, 'Menú principal'), ...navItems.map(item => React.createElement(NavItem, {
    key: item.id,
    label: item.label,
    active: screen === item.id,
    onClick: () => onNav(item.id)
  }))), React.createElement('div', {
    style: {
      padding: '0 12px'
    }
  }, React.createElement('div', {
    style: {
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      borderRadius: 12,
      padding: '12px 14px'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 900,
      color: '#fff',
      marginBottom: 2
    }
  }, 'Mars × Rappi'), React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(255,255,255,.8)'
    }
  }, 'H2 2026 · JBP activo')))),
  // Top bar
  React.createElement('div', {
    style: rappiadsStyles.topBar
  }, React.createElement('span', {
    style: rappiadsStyles.topBarTitle
  }, title), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#FF2526',
      background: 'rgba(255,37,38,.08)',
      padding: '5px 12px',
      borderRadius: 9999
    }
  }, 'MX · Q2 2026'), React.createElement('div', {
    style: rappiadsStyles.avatar
  }, 'MA'))), React.createElement('div', {
    style: rappiadsStyles.main
  }));
}
Object.assign(window, {
  AppShell,
  NavItem,
  rappiadsStyles
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rappiads/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/rappiads/CampaignBuilder.jsx
try { (() => {
// RappiAds UI Kit — Campaign Builder (stepped flow)
const VERTICALS = [{
  id: 'turbo-super',
  name: 'Turbo Súper',
  desc: 'Supermercado express · 10 min',
  color: '#248F63',
  dark: true
}, {
  id: 'turbo-rest',
  name: 'Turbo Restaurantes',
  desc: 'Comida rápida · 15 min',
  color: '#248F63',
  dark: true
}, {
  id: 'restaurantes',
  name: 'Restaurantes',
  desc: 'Catálogo completo',
  color: '#FF2526',
  dark: true
}, {
  id: 'pro',
  name: 'Rappi Pro',
  desc: 'Membresía · envíos gratis',
  color: '#ECEFF3',
  dark: false
}, {
  id: 'general',
  name: 'Rappi General',
  desc: 'Plataforma completa',
  color: '#0A0A0A',
  dark: true
}];
const FORMATS = [{
  id: 'inapp',
  name: 'In-App Banner Home',
  dims: '320×136 px',
  ctx: 'Own media · app home',
  img: '../../assets/templates/struct-banner-home.png'
}, {
  id: 'inapp-card',
  name: 'In-App Card',
  dims: '300×400 px',
  ctx: 'Own media · app popup',
  img: '../../assets/templates/struct-inapp.png'
}, {
  id: 'banner-filtro',
  name: 'Banner Filtro',
  dims: '960×408 px',
  ctx: 'Own media · vertical filter',
  img: '../../assets/templates/struct-banner-filtro.png'
}, {
  id: 'meta-1x1',
  name: 'Meta 1:1',
  dims: '1200×1200 px',
  ctx: 'Paid · Meta feed',
  img: '../../assets/templates/paid-1.png'
}, {
  id: 'meta-9x16',
  name: 'Meta Stories/Reels',
  dims: '1080×1920 px',
  ctx: 'Paid · Meta stories',
  img: '../../assets/templates/paid-2.png'
}, {
  id: 'tiktok',
  name: 'TikTok Vertical',
  dims: '1080×1920 px',
  ctx: 'Paid · TikTok',
  img: '../../assets/templates/paid-tiktok.png'
}];
function StepBar({
  step
}) {
  const steps = ['Vertical', 'Formato', 'Creatividad', 'Presupuesto'];
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginBottom: 28
    }
  }, steps.map((s, i) => React.createElement(React.Fragment, {
    key: i
  }, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, React.createElement('div', {
    style: {
      width: 28,
      height: 28,
      borderRadius: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 900,
      background: i < step ? 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)' : i === step ? '#0A0A0A' : 'rgba(10,10,10,.1)',
      color: i <= step ? '#fff' : 'rgba(10,10,10,.35)'
    }
  }, i < step ? '✓' : i + 1), React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: i === step ? 900 : 500,
      color: i === step ? '#0A0A0A' : 'rgba(10,10,10,.4)'
    }
  }, s)), i < steps.length - 1 && React.createElement('div', {
    style: {
      flex: 1,
      height: 1,
      background: i < step ? '#FF2526' : 'rgba(0,0,0,.1)',
      margin: '0 10px',
      minWidth: 24
    }
  }))));
}
function CampaignBuilder() {
  const [step, setStep] = React.useState(0);
  const [vertical, setVertical] = React.useState(null);
  const [format, setFormat] = React.useState(null);
  const [title, setTitle] = React.useState('30% OFF hoy');
  const [desc, setDesc] = React.useState('En restaurantes seleccionados.');
  const [cta, setCta] = React.useState('Ver restaurantes');
  const [budget, setBudget] = React.useState('20000');
  const card = {
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 1px 4px rgba(0,0,0,.07)'
  };
  const nextBtn = (label, onClick, disabled) => React.createElement('button', {
    style: {
      background: disabled ? 'rgba(10,10,10,.1)' : 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      color: disabled ? 'rgba(10,10,10,.35)' : '#fff',
      border: 'none',
      borderRadius: 9999,
      padding: '12px 28px',
      fontSize: 14,
      fontWeight: 900,
      fontFamily: "'PPObjectSans',sans-serif",
      cursor: disabled ? 'not-allowed' : 'pointer'
    },
    onClick: disabled ? undefined : onClick
  }, label);
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(0,0,0,.12)',
    fontFamily: "'PPObjectSans',sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#0A0A0A',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, React.createElement('div', {
    style: card
  }, React.createElement(StepBar, {
    step
  }),
  // Step 0 — Vertical
  step === 0 && React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 16,
      color: '#0A0A0A'
    }
  }, 'Elige la vertical'), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12
    }
  }, VERTICALS.map(v => React.createElement('div', {
    key: v.id,
    onClick: () => setVertical(v.id),
    style: {
      background: vertical === v.id ? v.color : '#F7F8FA',
      borderRadius: 12,
      padding: '18px 16px',
      cursor: 'pointer',
      border: `2px solid ${vertical === v.id ? v.color : 'transparent'}`,
      transition: 'all 150ms ease'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: vertical === v.id && v.dark ? '#fff' : '#0A0A0A',
      marginBottom: 4
    }
  }, v.name), React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: vertical === v.id && v.dark ? 'rgba(255,255,255,.75)' : 'rgba(10,10,10,.5)'
    }
  }, v.desc)))), React.createElement('div', {
    style: {
      marginTop: 20,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, nextBtn('Siguiente →', () => setStep(1), !vertical))),
  // Step 1 — Format
  step === 1 && React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 16,
      color: '#0A0A0A'
    }
  }, 'Elige el formato'), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 12
    }
  }, FORMATS.map(f => React.createElement('div', {
    key: f.id,
    onClick: () => setFormat(f.id),
    style: {
      borderRadius: 12,
      padding: '14px',
      cursor: 'pointer',
      background: '#F7F8FA',
      border: `2px solid ${format === f.id ? '#FF2526' : 'transparent'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'all 150ms ease'
    }
  }, React.createElement('img', {
    src: f.img,
    alt: f.name,
    style: {
      width: '100%',
      height: 80,
      objectFit: 'cover',
      borderRadius: 8,
      background: '#e0e0e0'
    }
  }), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: '#0A0A0A'
    }
  }, f.name), React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: '#FF2526'
    }
  }, f.dims), React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(10,10,10,.4)'
    }
  }, f.ctx)))), React.createElement('div', {
    style: {
      marginTop: 20,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement('button', {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      color: 'rgba(10,10,10,.4)',
      fontFamily: "'PPObjectSans',sans-serif"
    },
    onClick: () => setStep(0)
  }, '← Atrás'), nextBtn('Siguiente →', () => setStep(2), !format))),
  // Step 2 — Creative copy
  step === 2 && React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 20,
      color: '#0A0A0A'
    }
  }, 'Crea el copy'), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24
    }
  },
  // Form
  React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, ...[['Titular (12–15 caracteres)', title, setTitle], ['Descripción (20–30 caracteres)', desc, setDesc], ['CTA (máx. 3 palabras)', cta, setCta]].map(([lbl, val, set]) => React.createElement('div', {
    key: lbl,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, React.createElement('label', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.45)'
    }
  }, lbl), React.createElement('input', {
    style: inputStyle,
    value: val,
    onChange: e => set(e.target.value)
  })))),
  // Live preview
  React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      alignItems: 'center'
    }
  }, React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.4)'
    }
  }, 'Vista previa'), React.createElement('div', {
    style: {
      width: 280,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,.13)'
    }
  }, React.createElement('div', {
    style: {
      height: 160,
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 16
    }
  }, React.createElement('div', {
    style: {
      position: 'relative',
      background: '#fff',
      borderRadius: 10,
      padding: '4px 8px',
      fontSize: 13,
      fontWeight: 900,
      color: '#FF2526'
    }
  }, '30% OFF')), React.createElement('div', {
    style: {
      background: '#fff',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, React.createElement('div', {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: '#0A0A0A',
      letterSpacing: '-0.02em'
    }
  }, title), React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'rgba(10,10,10,.55)'
    }
  }, desc), React.createElement('button', {
    style: {
      marginTop: 4,
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      color: '#fff',
      border: 'none',
      borderRadius: 9999,
      padding: '8px 0',
      width: '100%',
      fontFamily: "'PPObjectSans',sans-serif",
      fontSize: 13,
      fontWeight: 900,
      cursor: 'pointer'
    }
  }, cta))))), React.createElement('div', {
    style: {
      marginTop: 20,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, React.createElement('button', {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      color: 'rgba(10,10,10,.4)',
      fontFamily: "'PPObjectSans',sans-serif"
    },
    onClick: () => setStep(1)
  }, '← Atrás'), nextBtn('Siguiente →', () => setStep(3), false))),
  // Step 3 — Budget
  step === 3 && React.createElement('div', null, React.createElement('div', {
    style: {
      fontSize: 18,
      fontWeight: 900,
      marginBottom: 20,
      color: '#0A0A0A'
    }
  }, 'Presupuesto y calendario'), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, React.createElement('label', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.45)'
    }
  }, 'Presupuesto total (MXN)'), React.createElement('input', {
    style: {
      ...inputStyle,
      fontSize: 20,
      fontWeight: 900,
      letterSpacing: '-0.02em'
    },
    value: `$${budget}`,
    onChange: e => setBudget(e.target.value.replace(/[^0-9]/g, ''))
  })), React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, ...['Fecha inicio', 'Fecha fin'].map(l => React.createElement('div', {
    key: l,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, React.createElement('label', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.45)'
    }
  }, l), React.createElement('input', {
    type: 'date',
    style: inputStyle
  }))))), React.createElement('div', {
    style: {
      background: '#F7F8FA',
      borderRadius: 14,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, React.createElement('div', {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: '#0A0A0A',
      marginBottom: 4
    }
  }, 'Resumen'), ...[['Vertical', VERTICALS.find(v => v.id === vertical)?.name || '—'], ['Formato', FORMATS.find(f => f.id === format)?.name || '—'], ['Copy', title], ['Presupuesto', `$${parseInt(budget || 0).toLocaleString()} MXN`]].map(([k, v]) => React.createElement('div', {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13
    }
  }, React.createElement('span', {
    style: {
      fontWeight: 500,
      color: 'rgba(10,10,10,.5)'
    }
  }, k), React.createElement('span', {
    style: {
      fontWeight: 700,
      color: '#0A0A0A'
    }
  }, v))))), React.createElement('div', {
    style: {
      marginTop: 24,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, React.createElement('button', {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      color: 'rgba(10,10,10,.4)',
      fontFamily: "'PPObjectSans',sans-serif"
    },
    onClick: () => setStep(2)
  }, '← Atrás'), nextBtn('Enviar a revisión →', () => alert('Campaña enviada. El equipo de Rappi la revisará.'), false)))));
}
Object.assign(window, {
  CampaignBuilder
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rappiads/CampaignBuilder.jsx", error: String((e && e.message) || e) }); }

// ui_kits/rappiads/Dashboard.jsx
try { (() => {
// RappiAds UI Kit — Dashboard screen
function KpiCard({
  label,
  value,
  delta,
  color
}) {
  const up = delta && delta.startsWith('+');
  return React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,.07)',
      flex: 1,
      minWidth: 160,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.4)'
    }
  }, label), React.createElement('div', {
    style: {
      fontSize: 30,
      fontWeight: 900,
      color: color || '#0A0A0A',
      letterSpacing: '-0.04em',
      lineHeight: 1
    }
  }, value), delta && React.createElement('div', {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: up ? '#248F63' : '#FF2526'
    }
  }, `${delta} vs mes anterior`));
}
function StatusBadge({
  status
}) {
  const map = {
    'Activa': {
      bg: 'rgba(36,143,99,.12)',
      color: '#248F63'
    },
    'Pausada': {
      bg: 'rgba(10,10,10,.07)',
      color: 'rgba(10,10,10,.5)'
    },
    'Revisión': {
      bg: 'rgba(240,183,105,.18)',
      color: '#C47F00'
    },
    'Borrador': {
      bg: 'rgba(10,10,10,.06)',
      color: 'rgba(10,10,10,.4)'
    }
  };
  const s = map[status] || map['Borrador'];
  return React.createElement('span', {
    style: {
      ...s,
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 9999,
      letterSpacing: '.04em'
    }
  }, status);
}
const campaigns = [{
  name: 'Mars — Snickers Q2',
  vertical: 'Restaurantes',
  format: 'Meta 1:1 + Inapp',
  budget: '$45,000',
  spend: '$31,200',
  roas: '4.2x',
  status: 'Activa'
}, {
  name: 'Turbo Súper — Promo Mayo',
  vertical: 'Turbo Súper',
  format: 'Banner Filtro + Push',
  budget: '$28,000',
  spend: '$28,000',
  roas: '6.1x',
  status: 'Activa'
}, {
  name: 'Pro — Retención Q2',
  vertical: 'Pro',
  format: 'Inapp + SMS',
  budget: '$15,000',
  spend: '$8,400',
  roas: '3.8x',
  status: 'Activa'
}, {
  name: 'M&Ms — Temporada',
  vertical: 'Restaurantes',
  format: 'TikTok 9:16',
  budget: '$20,000',
  spend: '—',
  roas: '—',
  status: 'Revisión'
}, {
  name: 'Snickers — Black Friday',
  vertical: 'Turbo Súper',
  format: 'Meta 4:5 + UAC',
  budget: '$60,000',
  spend: '—',
  roas: '—',
  status: 'Borrador'
}];
function Dashboard({
  onNav
}) {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  },
  // KPI row
  React.createElement('div', {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, React.createElement(KpiCard, {
    label: 'Gasto total',
    value: '$67,600',
    delta: '+18%'
  }), React.createElement(KpiCard, {
    label: 'Impresiones',
    value: '14.2M',
    delta: '+31%'
  }), React.createElement(KpiCard, {
    label: 'Clicks',
    value: '284K',
    delta: '+22%'
  }), React.createElement(KpiCard, {
    label: 'ROAS promedio',
    value: '4.7x',
    delta: '+0.4x',
    color: '#248F63'
  }), React.createElement(KpiCard, {
    label: 'Campañas activas',
    value: '3',
    color: '#FF2526'
  })),
  // Active campaigns table
  React.createElement('div', {
    style: {
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,.07)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      padding: '18px 24px',
      borderBottom: '1px solid rgba(0,0,0,.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: '#0A0A0A'
    }
  }, 'Campañas'), React.createElement('button', {
    style: {
      background: 'linear-gradient(135deg,#FF7A4D,#FF2526 55%,#FF4583)',
      color: '#fff',
      border: 'none',
      borderRadius: 9999,
      padding: '8px 18px',
      fontSize: 12,
      fontWeight: 900,
      fontFamily: "'PPObjectSans',sans-serif",
      cursor: 'pointer'
    },
    onClick: () => onNav('create')
  }, '+ Nueva campaña')),
  // Table header
  React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr 1fr',
      columnGap: 12,
      padding: '10px 24px',
      background: '#F7F8FA'
    }
  }, ...['Campaña', 'Vertical', 'Formato', 'Presupuesto', 'Gasto', 'ROAS', 'Estado'].map(h => React.createElement('span', {
    key: h,
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '.1em',
      textTransform: 'uppercase',
      color: 'rgba(10,10,10,.35)'
    }
  }, h))),
  // Rows
  ...campaigns.map((c, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr 1fr',
      columnGap: 12,
      padding: '14px 24px',
      borderTop: '1px solid rgba(0,0,0,.05)',
      alignItems: 'center',
      cursor: 'pointer'
    }
  }, React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0A0A0A'
    }
  }, c.name), React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(10,10,10,.55)'
    }
  }, c.vertical), React.createElement('span', {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(10,10,10,.55)'
    }
  }, c.format), React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0A0A0A'
    }
  }, c.budget), React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0A0A0A'
    }
  }, c.spend), React.createElement('span', {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: c.roas !== '—' ? '#248F63' : 'rgba(10,10,10,.3)'
    }
  }, c.roas), React.createElement(StatusBadge, {
    status: c.status
  })))));
}
Object.assign(window, {
  Dashboard,
  KpiCard,
  StatusBadge
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rappiads/Dashboard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BannerHome = __ds_scope.BannerHome;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.InappCard = __ds_scope.InappCard;

__ds_ns.Tag = __ds_scope.Tag;

})();
