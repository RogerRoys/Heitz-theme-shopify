/* Marven-style scroll entrance for product cards: a small zoom-fade as
   each card first enters the viewport. Cards stay fully visible when
   JS is unavailable or the visitor prefers reduced motion. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const style = document.createElement('style');
  style.textContent = [
    'html.heitz-card-motion product-card { opacity: 0; transform: scale(0.96) translateY(14px); }',
    'html.heitz-card-motion product-card.heitz-card-in {',
    '  opacity: 1; transform: none;',
    '  transition: opacity 0.7s cubic-bezier(0.26, 0.54, 0.32, 1), transform 0.7s cubic-bezier(0.26, 0.54, 0.32, 1);',
    '}',
  ].join('\n');
  document.head.appendChild(style);
  document.documentElement.classList.add('heitz-card-motion');

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        window.setTimeout(() => el.classList.add('heitz-card-in'), el.heitzStagger || 0);
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  const seen = new WeakSet();
  const scan = () => {
    let i = 0;
    document.querySelectorAll('product-card').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.heitzStagger = Math.min(i * 70, 350);
      i += 1;
      io.observe(el);
    });
  };

  const start = () => {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
