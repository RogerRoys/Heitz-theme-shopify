/*
  MEGA MENU FIX v7

  Goal:
  - Keep mega menu opening normally on hover
  - Stop the double-open animation
  - Keep close order: mega menu closes first, then header closes

  Key change from previous version:
  - JS does NOT animate submenu opening anymore.
  - Theme/native CSS handles opening.
  - JS only helps close animation and header timing.
*/

(function () {
  'use strict';

  const MEGA_CLOSE_DELAY = 650;
  const SUBMENU_TRANSITION_FALLBACK = 800;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(() => {
    initHeaderHoverBehavior();
    initSubmenuCloseOnlyAnimation();
    initSlideshowHeaderHeight();
  });

  document.addEventListener('shopify:section:load', () => {
    initHeaderHoverBehavior();
    initSubmenuCloseOnlyAnimation();
    initSlideshowHeaderHeight();
  });

  function initHeaderHoverBehavior() {
    const header = document.querySelector('header-component') || document.querySelector('#header-component');
    if (!header) return;

    const row = header.querySelector('.header__row');
    if (!row) return;

    if (header.dataset.headerHoverFixInit === 'true') return;
    header.dataset.headerHoverFixInit = 'true';

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let headerCloseTimer = null;

    function clearHeaderCloseTimer() {
      if (headerCloseTimer) {
        clearTimeout(headerCloseTimer);
        headerCloseTimer = null;
      }
    }

    function openHeader() {
      clearHeaderCloseTimer();
      header.classList.add('is_active');
      row.classList.add('header-active');
    }

    function closeHeader() {
      header.classList.remove('is_active');

      if (header.getAttribute('data-scroll-direction') === 'up') {
        row.classList.add('header-active');
      } else {
        row.classList.remove('header-active');
      }
    }

    function getOpenMegaMenuTriggers() {
      return Array.from(
        header.querySelectorAll('.menu-list__list-item [aria-expanded="true"]')
      ).filter((trigger) => {
        const item = trigger.closest('.menu-list__list-item');
        return item && item.querySelector('.menu-list__submenu');
      });
    }

    function hasOpenMegaMenu() {
      return getOpenMegaMenuTriggers().length > 0;
    }

    function requestMegaMenuClose() {
      getOpenMegaMenuTriggers().forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
      });
    }

    if (!isTouch) {
      header.addEventListener('mouseenter', openHeader);

      header.addEventListener('mouseleave', () => {
        clearHeaderCloseTimer();

        if (hasOpenMegaMenu()) {
          requestMegaMenuClose();

          headerCloseTimer = setTimeout(() => {
            closeHeader();
            headerCloseTimer = null;
          }, MEGA_CLOSE_DELAY);
        } else {
          closeHeader();
        }
      });
    }

    const observer = new MutationObserver(() => {
      if (header.matches(':hover') || header.classList.contains('is_active')) return;

      if (header.getAttribute('data-scroll-direction') === 'up') {
        row.classList.add('header-active');
      } else {
        row.classList.remove('header-active');
      }
    });

    observer.observe(header, {
      attributes: true,
      attributeFilter: ['data-scroll-direction']
    });
  }

  function initSubmenuCloseOnlyAnimation() {
    const menuItems = document.querySelectorAll('.menu-list__list-item');

    menuItems.forEach((item) => {
      if (item.dataset.submenuCloseOnlyInit === 'true') return;

      const trigger = getDirectTrigger(item);
      const submenu = getDirectSubmenu(item);

      if (!trigger || !submenu) return;

      item.dataset.submenuCloseOnlyInit = 'true';
      item.dataset.submenuExpanded = trigger.getAttribute('aria-expanded') === 'true' ? 'true' : 'false';

      // Very important:
      // Do not lock closed menus with inline height on load.
      // Let theme CSS control visibility/opening.
      cleanupSubmenuAnimationStyles(submenu);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName !== 'aria-expanded') return;

          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          const wasExpanded = item.dataset.submenuExpanded === 'true';

          if (isExpanded === wasExpanded) return;
          item.dataset.submenuExpanded = isExpanded ? 'true' : 'false';

          if (isExpanded) {
            // Do NOT animate open with JS. That caused the double-open.
            removeOldTransitionHandler(submenu);
            cancelPendingWrite(submenu);
            cleanupSubmenuAnimationStyles(submenu);
          } else {
            animateCloseOnly(submenu);
          }
        });
      });

      observer.observe(trigger, {
        attributes: true,
        attributeFilter: ['aria-expanded']
      });
    });
  }

  function getDirectTrigger(item) {
    return Array.from(
      item.querySelectorAll('.menu-list__link[aria-expanded], [aria-expanded]')
    ).find((el) => el.closest('.menu-list__list-item') === item) || null;
  }

  function getDirectSubmenu(item) {
    return Array.from(
      item.querySelectorAll('.menu-list__submenu')
    ).find((el) => el.closest('.menu-list__list-item') === item) || null;
  }

  function animateCloseOnly(submenu) {
    if (!submenu) return;

    removeOldTransitionHandler(submenu);
    cancelPendingWrite(submenu);

    const token = nextAnimationToken(submenu);

    const startHeight = submenu.offsetHeight || submenu.scrollHeight || 0;

    submenu.style.overflow = 'hidden';
    submenu.style.clipPath = 'none';
    submenu.style.webkitClipPath = 'none';
    submenu.style.setProperty('height', `${startHeight}px`, 'important');

    // Force reflow before closing to 0.
    submenu.offsetHeight;

    scheduleWrite(submenu, () => {
      if (submenu._animationToken !== token) return;
      submenu.style.setProperty('height', '0px', 'important');
    });

    addTransitionCleanup(submenu, () => {
      if (submenu._animationToken !== token) return;

      submenu.style.setProperty('height', '0px', 'important');
      submenu.style.removeProperty('overflow');
      submenu.style.removeProperty('clip-path');
      submenu.style.removeProperty('-webkit-clip-path');
      removeOldTransitionHandler(submenu);
    });
  }

  function cleanupSubmenuAnimationStyles(submenu) {
    if (!submenu) return;

    submenu.style.removeProperty('height');
    submenu.style.removeProperty('overflow');
    submenu.style.removeProperty('clip-path');
    submenu.style.removeProperty('-webkit-clip-path');
  }

  function scheduleWrite(submenu, callback) {
    cancelPendingWrite(submenu);

    submenu._writeRaf1 = requestAnimationFrame(() => {
      submenu._writeRaf1 = null;

      submenu._writeRaf2 = requestAnimationFrame(() => {
        submenu._writeRaf2 = null;
        callback();
      });
    });
  }

  function cancelPendingWrite(submenu) {
    if (!submenu) return;

    if (submenu._writeRaf1) {
      cancelAnimationFrame(submenu._writeRaf1);
      submenu._writeRaf1 = null;
    }

    if (submenu._writeRaf2) {
      cancelAnimationFrame(submenu._writeRaf2);
      submenu._writeRaf2 = null;
    }
  }

  function nextAnimationToken(submenu) {
    submenu._animationToken = (submenu._animationToken || 0) + 1;
    return submenu._animationToken;
  }

  function addTransitionCleanup(element, cleanup) {
    let finished = false;

    const onTransitionEnd = (event) => {
      if (event.target !== element) return;
      if (event.propertyName && event.propertyName !== 'height') return;
      finish();
    };

    const finish = () => {
      if (finished) return;
      finished = true;

      element.removeEventListener('transitionend', onTransitionEnd);

      if (element._submenuTransitionFallback) {
        clearTimeout(element._submenuTransitionFallback);
        element._submenuTransitionFallback = null;
      }

      cleanup();
    };

    element._transitionHandler = onTransitionEnd;
    element.addEventListener('transitionend', onTransitionEnd);
    element._submenuTransitionFallback = setTimeout(finish, SUBMENU_TRANSITION_FALLBACK);
  }

  function removeOldTransitionHandler(element) {
    if (!element) return;

    if (element._transitionHandler) {
      element.removeEventListener('transitionend', element._transitionHandler);
      element._transitionHandler = null;
    }

    if (element._submenuTransitionFallback) {
      clearTimeout(element._submenuTransitionFallback);
      element._submenuTransitionFallback = null;
    }
  }

  function initSlideshowHeaderHeight() {
    const headerGroup = document.querySelector('#header-group');
    const slideshowSlides = document.querySelector(
      'slideshow-slides[size="slideshow_full_height"], .full_hero_section, .full_split_section'
    );

    if (!headerGroup || !slideshowSlides) return;

    function getStickyHeaderHeight() {
      const stickyHeaderComponent =
        document.querySelector('#header-component[sticky="always"]') ||
        document.querySelector('#header-component[sticky="scroll-up"]');

      if (!stickyHeaderComponent || !headerGroup.contains(stickyHeaderComponent)) return null;

      const sectionGroup = document.querySelector('div.shopify-section-group-header-group');
      const headerSection = document.querySelector('header.shopify-section-group-header-group');

      if (!headerSection) return null;

      let totalHeight = 0;

      if (sectionGroup) {
        totalHeight += sectionGroup.getBoundingClientRect().height || 0;
      }

      totalHeight += headerSection.getBoundingClientRect().height || 0;

      return totalHeight;
    }

    function updateSlideshowHeight() {
      const isNotSticky = headerGroup.getAttribute('transparent') === 'not-sticky';

      if (isNotSticky) {
        slideshowSlides.style.height = '';
        return;
      }

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const viewportUnit = isMobile ? 'svh' : 'dvh';
      const stickyHeight = getStickyHeaderHeight();

      if (stickyHeight !== null) {
        slideshowSlides.style.height = `calc(100${viewportUnit} - ${stickyHeight}px)`;
        return;
      }

      const normalHeaderHeight = headerGroup.getBoundingClientRect().height;
      slideshowSlides.style.height = `calc(100${viewportUnit} - ${normalHeaderHeight}px)`;
    }

    updateSlideshowHeight();

    if (headerGroup.dataset.slideshowHeaderHeightInit === 'true') return;
    headerGroup.dataset.slideshowHeaderHeightInit = 'true';

    let windowWidth = window.innerWidth;

    window.addEventListener('resize', () => {
      if (window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        updateSlideshowHeight();
      }
    });
  }
})();