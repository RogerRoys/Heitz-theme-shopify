(() => {
  const root = document.documentElement;
  const pendingClass = 'heitz-navigation-pending';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileViewport = window.matchMedia('(max-width: 749px)');
  const navigationPause = mobileViewport.matches ? 160 : 290;
  const arrivalCleanup = mobileViewport.matches ? 230 : 360;
  const arrivalFallback = mobileViewport.matches ? 180 : 320;
  let clearTimer;

  const createLoader = () => {
    if (reduceMotion.matches || document.querySelector('.heitz-page-loader')) return;

    const loader = document.createElement('div');
    const bar = document.createElement('span');
    loader.className = 'heitz-page-loader';
    loader.setAttribute('aria-hidden', 'true');
    bar.className = 'heitz-page-loader__bar';
    loader.append(bar);
    document.body.append(loader);
  };

  const preparePage = () => {
    window.clearTimeout(window.__heitzRevealFallback);
    createLoader();

    if (!root.classList.contains('heitz-reveal-enabled')) return;

    const transitionImage = document.querySelector(
      '#MainContent picture img, #MainContent img, main picture img, main img'
    );

    if (transitionImage instanceof HTMLImageElement) {
      transitionImage.classList.add('heitz-transition-focus');
    }

    let revealStarted = false;
    const revealPage = () => {
      if (revealStarted) return;
      revealStarted = true;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          root.classList.add('heitz-reveal-ready');
          window.setTimeout(() => {
            root.classList.remove('heitz-reveal-enabled', 'heitz-reveal-ready');
            transitionImage?.classList.remove('heitz-transition-focus');
          }, arrivalCleanup);
        });
      });
    };

    if (document.readyState === 'complete') {
      revealPage();
    } else {
      window.addEventListener('load', revealPage, { once: true });
      window.setTimeout(revealPage, arrivalFallback);
    }
  };

  const clearPendingState = () => {
    window.clearTimeout(clearTimer);
    root.classList.remove(pendingClass);
  };

  const showPendingState = () => {
    createLoader();
    clearPendingState();
    root.classList.add(pendingClass);
    clearTimer = window.setTimeout(clearPendingState, 4000);
  };

  const isSameDocumentNavigation = (url) =>
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash !== window.location.hash;

  document.addEventListener(
    'click',
    (event) => {
      if (
        reduceMotion.matches ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;

      if (!link || link.hasAttribute('download') || link.target === '_blank') return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) return;
      if (url.href === window.location.href || isSameDocumentNavigation(url)) return;
      if (root.classList.contains(pendingClass)) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      showPendingState();
      window.setTimeout(() => window.location.assign(url.href), navigationPause);
    },
    { capture: false }
  );

  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || event.defaultPrevented) return;

      const url = new URL(form.action || window.location.href, window.location.href);
      if (url.origin === window.location.origin) showPendingState();
    },
    { capture: true }
  );

  window.addEventListener('pageshow', clearPendingState);

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      preparePage,
      { once: true }
    );
  } else {
    preparePage();
  }
})();
