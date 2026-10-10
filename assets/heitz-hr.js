/* Heitz home refresh – header, overlays, cart drawer, wishlist, hero, announcement */
(function () {
  if (window.__heitzHR) return; window.__heitzHR = true;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cfg = function () { return window.HeitzHR || {}; };
  var root = document.documentElement;
  var mq = window.matchMedia('(max-width: 989px)');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var img = function (u, w) { if (!u) return ''; u = String(u); if (u.indexOf('//') === 0) u = 'https:' + u; return u + (u.indexOf('?') > -1 ? '&' : '?') + 'width=' + (w || 200); };

  function money(cents) {
    var f = cfg().moneyFormat || '${{amount}}', v = (Number(cents) || 0) / 100;
    var n = function (d, t, s) { var p = v.toFixed(d).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, t); return p[1] ? p[0] + s + p[1] : p[0]; };
    return f.replace(/\{\{\s*(\w+)\s*\}\}/, function (m, k) {
      if (k === 'amount_no_decimals') return n(0, ',', '.');
      if (k === 'amount_with_comma_separator') return n(2, '.', ',');
      if (k === 'amount_no_decimals_with_comma_separator') return n(0, '.', ',');
      if (k === 'amount_with_apostrophe_separator') return n(2, "'", '.');
      return n(2, ',', '.');
    });
  }
  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
  }

  /* ---------- Overlay manager (open / close / click outside / Esc) ---------- */
  var openId = null, lastFocus = null;
  function open(id) {
    if (openId === id) return;
    closeAll(true);
    var el = document.getElementById(id); if (!el) return;
    lastFocus = document.activeElement;
    el.hidden = false; el.offsetWidth;
    el.classList.add('is-open'); openId = id;
    var lock = el.getAttribute('data-lock');
    if (lock !== 'false' && !(lock === 'mobile' && !mq.matches)) root.classList.add('hr-lock');
    el.dispatchEvent(new CustomEvent('hr:open'));
    var f = $('[data-autofocus]', el); if (f) setTimeout(function () { f.focus(); }, 260);
  }
  function closeAll(silent) {
    closeMega();
    if (!openId) return;
    var el = document.getElementById(openId); openId = null;
    root.classList.remove('hr-lock');
    if (!el) return;
    el.classList.remove('is-open');
    setTimeout(function () { if (!el.classList.contains('is-open')) el.hidden = true; }, 520);
    if (!silent && lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  window.HeitzHR = Object.assign(window.HeitzHR || {}, { open: open, close: closeAll });

  document.addEventListener('click', function (e) {
    var t = e.target;
    var o = t.closest('[data-hr-open]');
    if (o) {
      e.preventDefault();
      var id = o.getAttribute('data-hr-open');
      if (openId === id && o.hasAttribute('data-hr-toggle')) closeAll(); else open(id);
      return;
    }
    if (t.closest('[data-hr-close]')) { if (t.closest('a[href]') && !t.closest('a[href]').hasAttribute('data-hr-close')) return; if (t.closest('a[href]')) { closeAll(true); return; } e.preventDefault(); closeAll(); return; }
    // currency dropdown
    var ct = t.closest('[data-hr-cur-toggle]');
    $$('[data-hr-cur]').forEach(function (c) { if (!ct || !c.contains(ct)) { c.classList.remove('is-open'); var b = $('[data-hr-cur-toggle]', c); b && b.setAttribute('aria-expanded', 'false'); } });
    if (ct) { var c = ct.closest('[data-hr-cur]'); var on = !c.classList.contains('is-open'); c.classList.toggle('is-open', on); ct.setAttribute('aria-expanded', on); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); $$('[data-hr-cur]').forEach(function (c) { c.classList.remove('is-open'); }); } });

  /* ---------- 7a Mega menu (desktop hover, no dim) ---------- */
  var megaT;
  function hdr() { return $('[data-hr-header]'); }
  function openMega(a) {
    var h = hdr(); if (!h || mq.matches) return;
    clearTimeout(megaT); h.classList.add('is-mega');
    $$('[data-hr-mega]', h).forEach(function (x) { x.classList.toggle('is-open', x === a); x.setAttribute('aria-expanded', x === a); });
  }
  function closeMega() {
    var h = hdr(); if (!h) return;
    h.classList.remove('is-mega'); $$('[data-hr-mega]', h).forEach(function (x) { x.classList.remove('is-open'); x.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('mouseover', function (e) {
    var h = hdr(); if (!h || mq.matches) return;
    var a = e.target.closest('[data-hr-mega]');
    if (a) { openMega(a); return; }
    if (e.target.closest('.hr-nav__a')) { closeMega(); return; }
    if (h.classList.contains('is-mega')) {
      if (e.target.closest('[data-hr-mega-panel]') || e.target.closest('.hr-hdr__row')) { clearTimeout(megaT); return; }
      clearTimeout(megaT); megaT = setTimeout(closeMega, 160);
    }
  });
  document.addEventListener('focusin', function (e) { var a = e.target.closest && e.target.closest('[data-hr-mega]'); if (a) openMega(a); else if (!(e.target.closest && e.target.closest('[data-hr-mega-panel]'))) closeMega(); });

  /* ---------- Mobile accordion ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hr-acc]'); if (!b) return;
    var acc = b.closest('.hr-acc'), on = !acc.classList.contains('is-open');
    acc.classList.toggle('is-open', on); b.setAttribute('aria-expanded', on);
  });

  /* ---------- 9b Announcement ---------- */
  function initAnn(a) {
    if (a.__hr) return; a.__hr = 1;
    var m = $$('.hr-ann__msg', a), i = 0, t; if (m.length < 2) { $$('.hr-ann__arrow', a).forEach(function (b) { b.style.visibility = 'hidden'; }); return; }
    var dur = (parseFloat(a.getAttribute('data-speed')) || 5) * 1000;
    function go(n) { var o = m[i]; o.classList.remove('is-active'); o.classList.add('is-out'); setTimeout(function () { o.classList.remove('is-out'); }, 650); i = (n + m.length) % m.length; m[i].classList.add('is-active'); run(); }
    function run() { clearInterval(t); t = setInterval(function () { go(i + 1); }, dur); }
    $('[data-hr-ann-prev]', a).addEventListener('click', function () { go(i - 1); });
    $('[data-hr-ann-next]', a).addEventListener('click', function () { go(i + 1); });
    a.addEventListener('mouseenter', function () { clearInterval(t); }); a.addEventListener('mouseleave', run);
    run();
  }

  /* ---------- 4c Hero ---------- */
  function initHero(h) {
    if (h.__hr) return; h.__hr = 1;
    var s = $$('.hr-hero__slide', h), d = $$('.hr-hero__dot', h), i = 0, t;
    if (s.length < 2) return;
    var auto = h.getAttribute('data-autoplay') === 'true', dur = (parseFloat(h.getAttribute('data-speed')) || 5.5) * 1000;
    if (!auto) h.classList.add('is-static');
    function go(n) {
      s[i].classList.remove('is-active'); d[i] && d[i].classList.remove('is-active');
      i = (n + s.length) % s.length;
      s[i].classList.add('is-active');
      if (d[i]) { d[i].offsetWidth; d[i].classList.add('is-active'); }
      run();
    }
    function run() { clearTimeout(t); if (auto) t = setTimeout(function () { go(i + 1); }, dur); }
    d.forEach(function (b, k) { b.addEventListener('click', function () { if (k !== i) go(k); }); });
    var x0 = null;
    h.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    h.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(t); else run(); });
    run();
  }

  /* ---------- Cart (6a) ---------- */
  var Cart = {
    data: null, prod: {}, busyN: 0,
    el: function () { return document.getElementById('HrCart'); },
    busy: function (on) { this.busyN += on ? 1 : -1; var e = this.el(); e && e.classList.toggle('is-busy', this.busyN > 0); },
    load: function () {
      var self = this;
      return fetch((cfg().root || '/') + 'cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).then(function (c) {
        self.data = c;
        return Promise.all(c.items.map(function (it) {
          if (self.prod[it.handle]) return null;
          return fetch((cfg().root || '/') + 'products/' + it.handle + '.js').then(function (r) { return r.ok ? r.json() : { variants: [] }; }).then(function (p) { self.prod[it.handle] = p; }).catch(function () { self.prod[it.handle] = { variants: [] }; });
        }));
      }).then(function () { self.render(); return self.data; });
    },
    cmp: function (it) {
      var p = this.prod[it.handle], v = p && p.variants && p.variants.filter(function (x) { return x.id === it.variant_id; })[0];
      return v && v.compare_at_price > it.original_price ? v.compare_at_price : 0;
    },
    change: function (key, q) { var s = this; s.busy(true); return post((cfg().root || '/') + 'cart/change.js', { id: key, quantity: q }).then(function () { return s.load(); }).finally(function () { s.busy(false); }); },
    add: function (items, btn) {
      var s = this; btn && btn.setAttribute('aria-busy', 'true');
      return post((cfg().root || '/') + 'cart/add.js', { items: items }).then(function (r) {
        if (!r.ok) return r.json().then(function (j) { throw new Error(j.description || j.message || 'Sorry, this item could not be added.'); });
      }).then(function () { return s.load(); }).then(function () { open('HrCart'); document.dispatchEvent(new CustomEvent('heitz:cart-updated')); })
        .catch(function (e) { alert(e.message); }).finally(function () { btn && btn.removeAttribute('aria-busy'); });
    },
    setCode: function (code) {
      var s = this; s.busy(true);
      return post((cfg().root || '/') + 'cart/update.js', { discount: code }).then(function () { return s.load(); }).finally(function () { s.busy(false); });
    },
    counts: function () { var n = this.data ? this.data.item_count : 0; $$('[data-hr-cart-count]').forEach(function (e) { e.textContent = n; }); },
    render: function () {
      var c = this.data, el = this.el(); this.counts(); if (!c || !el) return;
      var self = this, empty = c.items.length === 0;
      $('[data-hr-cart-empty]', el).hidden = !empty;
      $('[data-hr-cart-foot]', el).hidden = empty;
      // free shipping
      var ship = $('[data-hr-ship]', el), th = Math.round((cfg().freeShip || 0) * ((window.Shopify && Shopify.currency && Number(Shopify.currency.rate)) || 1));
      if (empty) ship.hidden = true;
      else {
        ship.hidden = false;
        var left = th - c.total_price, pct = th > 0 ? Math.min(100, c.total_price / th * 100) : 100;
        ship.classList.toggle('is-free', left <= 0);
        ship.innerHTML = '<span>' + (left <= 0 ? '✓ ' + esc(cfg().freeShipLabel || 'Free tracked shipping unlocked') : 'You\u2019re <strong>' + money(left) + '</strong> away from free tracked shipping') + '</span><div class="hr-bar"><i style="width:' + pct + '%"></i></div>';
      }
      // items
      var save = 0;
      $('[data-hr-cart-items]', el).innerHTML = c.items.map(function (it) {
        var was = self.cmp(it) * it.quantity, line = it.final_line_price, orig = Math.max(was, it.original_line_price);
        if (orig > line) save += orig - line;
        var opts = (it.options_with_values || []).filter(function (o) { return o.value !== 'Default Title'; }).map(function (o) { return o.value; }).join(' · ');
        return '<div class="hr-it" data-key="' + esc(it.key) + '">' +
          '<a class="hr-zoom" href="' + esc(it.url) + '">' + (it.image ? '<img src="' + esc(img(it.image, 200)) + '" alt="" loading="lazy">' : '') + '</a>' +
          '<div class="hr-it__info"><div class="hr-it__top"><a class="hr-it__n" href="' + esc(it.url) + '">' + esc(it.product_title) + '</a><button type="button" class="hr-it__rm" data-hr-rm>Remove</button></div>' +
          (opts ? '<span class="hr-it__v">' + esc(opts) + '</span>' : '') +
          '<div class="hr-it__bot"><div class="hr-qty"><button type="button" data-hr-q="-1" aria-label="Decrease">−</button><span>' + it.quantity + '</span><button type="button" data-hr-q="1" aria-label="Increase">+</button></div>' +
          '<div class="hr-pr' + (orig > line ? ' is-sale' : '') + '"><b>' + money(line) + '</b>' + (orig > line ? '<s>' + money(orig) + '</s>' : '') + '</div></div></div></div>';
      }).join('');
      // totals
      $$('[data-hr-total]', el).forEach(function (e) { e.textContent = money(c.total_price); });
      var sv = $('[data-hr-save]', el); var codeSave = (c.cart_level_discount_applications || []).reduce(function (a, d) { return a + (d.total_allocated_amount || 0); }, 0);
      var seal = save - 0; sv.hidden = seal <= 0; sv.textContent = 'You\u2019re saving ' + money(seal) + ' with the gold seal';
      var ap = $('[data-hr-disc-applied]', el), codes = (c.discount_codes || []).filter(function (d) { return d.applicable; });
      ap.innerHTML = codes.map(function (d) { return '<div class="hr-disc__row"><span>Code ' + esc(d.code) + '</span><span>' + (codeSave ? '−' + money(codeSave) : '') + '<button type="button" data-hr-disc-rm>Remove</button></span></div>'; }).join('');
      this.upsell();
    },
    upsell: function () {
      var el = this.el(), c = this.data, box = $('[data-hr-up]', el); if (!c || !c.items.length) { box.hidden = true; return; }
      var inCart = c.items.map(function (i) { return i.product_id; }), self = this;
      var pick = function (list) {
        var p = (list || []).filter(function (x) { return inCart.indexOf(x.id) < 0 && x.available !== false; })[0];
        if (!p) { box.hidden = true; return; }
        var vid = p.variant || (p.variants && (p.variants.filter(function (v) { return v.available; })[0] || p.variants[0]).id);
        var price = typeof p.price === 'number' ? p.price : (p.variants && p.variants[0] && p.variants[0].price);
        box.hidden = false;
        $('[data-hr-up-item]', el).innerHTML = '<div class="hr-up"><a class="hr-zoom" href="' + esc(p.url) + '">' + (p.img || p.featured_image ? '<img src="' + esc(p.img || img(p.featured_image, 160)) + '" alt="" loading="lazy">' : '') + '</a><div class="hr-up__i"><a href="' + esc(p.url) + '">' + esc(p.title) + '</a><span class="hr-up__p">' + money(price) + '</span></div><button type="button" class="hr-btn" data-hr-up-add="' + vid + '">Add</button></div>';
      };
      var pid = c.items[0].product_id;
      if (self._recFor === pid && self._rec) return pick(self._rec.concat(cfg().upsell || []));
      fetch((cfg().root || '/') + 'recommendations/products.json?product_id=' + pid + '&limit=6&intent=related').then(function (r) { return r.ok ? r.json() : { products: [] }; })
        .then(function (j) { self._recFor = pid; self._rec = j.products || []; pick(self._rec.concat(cfg().upsell || [])); })
        .catch(function () { pick(cfg().upsell || []); });
    }
  };
  window.HeitzHR.cart = Cart;

  document.addEventListener('click', function (e) {
    var t = e.target, it = t.closest('.hr-it');
    if (it && t.closest('[data-hr-q]')) { var q = parseInt($('.hr-qty span', it).textContent, 10) + parseInt(t.closest('[data-hr-q]').getAttribute('data-hr-q'), 10); Cart.change(it.getAttribute('data-key'), Math.max(0, q)); return; }
    if (it && t.closest('[data-hr-rm]')) { it.style.transition = 'opacity .25s'; it.style.opacity = '.3'; Cart.change(it.getAttribute('data-key'), 0); return; }
    var up = t.closest('[data-hr-up-add]'); if (up) { Cart.add([{ id: Number(up.getAttribute('data-hr-up-add')), quantity: 1 }], up); return; }
    var dt = t.closest('[data-hr-disc-tog]');
    if (dt) { var d = $('[data-hr-disc]'), on = !d.classList.contains('is-open'); d.classList.toggle('is-open', on); dt.setAttribute('aria-expanded', on); if (on) setTimeout(function () { var i = $('input', d); i && i.focus(); }, 200); return; }
    if (t.closest('[data-hr-disc-rm]')) { Cart.setCode(''); return; }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches && f.matches('[data-hr-disc-form]')) {
      e.preventDefault();
      var code = (f.code.value || '').trim(), msg = $('[data-hr-disc-msg]');
      if (!code) { msg.className = 'hr-disc__msg is-err'; msg.textContent = 'Enter a code'; return; }
      Cart.setCode(code).then(function (c) {
        var ok = (c.discount_codes || []).some(function (d) { return d.code.toUpperCase() === code.toUpperCase() && d.applicable; });
        msg.className = 'hr-disc__msg ' + (ok ? 'is-ok' : 'is-err'); msg.textContent = ok ? '✓ ' + code.toUpperCase() + ' applied' : 'That code isn\u2019t valid for this cart';
        if (ok) f.code.value = '';
      });
      return;
    }
    // Take over Add to cart forms
    if (!cfg().takeOver || !(f instanceof HTMLFormElement)) return;
    var act = f.getAttribute('action') || ''; if (!/\/cart\/add/.test(act)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var fd = new FormData(f), btn = f.querySelector('[type=submit]'); btn && btn.setAttribute('aria-busy', 'true');
    fetch((cfg().root || '/') + 'cart/add.js', { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).then(function (r) {
      if (!r.ok) return r.json().then(function (j) { throw new Error(j.description || j.message || 'Sorry, this item could not be added.'); });
    }).then(function () { return Cart.load(); }).then(function () { open('HrCart'); document.dispatchEvent(new CustomEvent('heitz:cart-updated')); })
      .catch(function (err) { alert(err.message); }).finally(function () { btn && btn.removeAttribute('aria-busy'); });
  }, true);
  ['cart:update', 'cart:updated', 'cart:refresh'].forEach(function (ev) { document.addEventListener(ev, function () { Cart.load(); }); });
  document.addEventListener('hr:open', function (e) { if (e.target.id === 'HrCart') Cart.load(); if (e.target.id === 'HrWish') Wish.render(); if (e.target.id === 'HrSearch') { var q = $('[data-hr-q]'); q && q.select(); } }, true);

  /* ---------- 5c Search (predictive) ---------- */
  var sT, sCtl;
  function runSearch(q) {
    var tiles = $('[data-hr-tiles]'), res = $('[data-hr-res]'); if (!res) return;
    if (q.length < 2) { res.hidden = true; if (tiles) tiles.hidden = false; return; }
    sCtl && sCtl.abort && sCtl.abort(); sCtl = window.AbortController ? new AbortController() : null;
    fetch((cfg().root || '/') + 'search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=8&resources[options][unavailable_products]=last', sCtl ? { signal: sCtl.signal } : {})
      .then(function (r) { return r.json(); }).then(function (j) {
        var ps = (j.resources && j.resources.results && j.resources.results.products) || [];
        if (tiles) tiles.hidden = true; res.hidden = false;
        var url = (cfg().searchUrl || '/search') + '?type=product&q=' + encodeURIComponent(q);
        res.innerHTML = ps.length ? ps.map(function (p) {
          var pr = Math.round(parseFloat(p.price) * 100);
          return '<a class="hr-res__card" href="' + esc(p.url) + '"><span class="hr-zoom">' + (p.image ? '<img src="' + esc(img(p.image, 500)) + '" alt="" loading="lazy">' : '') + '</span><span>' + esc(p.title) + '</span><span class="hr-res__p">' + (isNaN(pr) ? '' : money(pr)) + '</span></a>';
        }).join('') + '<a class="hr-res__more hr-link" href="' + esc(url) + '">View all results for “' + esc(q) + '”</a>'
          : '<p class="hr-res__none">No lights match “' + esc(q) + '”. Try “pendant” or “outdoor”.</p>';
      }).catch(function () {});
  }
  document.addEventListener('input', function (e) { if (e.target.matches && e.target.matches('[data-hr-q]')) { clearTimeout(sT); var v = e.target.value.trim(); sT = setTimeout(function () { runSearch(v); }, 220); } });
  document.addEventListener('click', function (e) { var s = e.target.closest('[data-hr-sugg]'); if (!s) return; var q = $('[data-hr-q]'); q.value = s.getAttribute('data-hr-sugg'); q.focus(); runSearch(q.value); });

  /* ---------- 8c Wishlist ---------- */
  var Wish = {
    key: 'heitz-wishlist', cache: {},
    get: function () { try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch (e) { return []; } },
    set: function (a) { try { localStorage.setItem(this.key, JSON.stringify(a)); } catch (e) {} this.sync(); },
    toggle: function (h) { var a = this.get(), i = a.indexOf(h); if (i > -1) a.splice(i, 1); else a.unshift(h); this.set(a); return i < 0; },
    sync: function () {
      var a = this.get();
      $$('[data-hr-wish-count]').forEach(function (e) { e.textContent = a.length; });
      $$('[data-hr-wish]').forEach(function (b) { var on = a.indexOf(b.getAttribute('data-hr-wish')) > -1; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    },
    fetchP: function (h) { var s = this; if (s.cache[h]) return Promise.resolve(s.cache[h]); return fetch((cfg().root || '/') + 'products/' + h + '.js').then(function (r) { return r.ok ? r.json() : null; }).then(function (p) { s.cache[h] = p; return p; }).catch(function () { return null; }); },
    render: function () {
      var list = $('[data-hr-wish-list]'), foot = $('[data-hr-wish-foot]'), self = this, a = this.get(); if (!list) return;
      this.position();
      if (!a.length) { list.innerHTML = '<p class="hr-wish__empty">Nothing saved yet. Tap the heart on any light to keep it here.</p>'; foot && (foot.style.display = 'none'); return; }
      foot && (foot.style.display = '');
      Promise.all(a.map(function (h) { return self.fetchP(h); })).then(function (ps) {
        list.innerHTML = ps.map(function (p, i) {
          if (!p) return '';
          var v = (p.variants || []).filter(function (x) { return x.available; })[0] || (p.variants || [])[0] || {};
          return '<div class="hr-wish__row"><a class="hr-zoom" href="' + esc(p.url) + '">' + (p.featured_image ? '<img src="' + esc(img(p.featured_image, 140)) + '" alt="" loading="lazy">' : '') + '</a>' +
            '<div class="hr-wish__info"><a href="' + esc(p.url) + '">' + esc(p.title) + '</a><span class="hr-wish__p">' + money(v.price) + '</span><button type="button" class="hr-wish__rm" data-hr-wish-rm="' + esc(a[i]) + '">Remove</button></div>' +
            '<button type="button" class="hr-wish__add" data-hr-wish-add="' + (v.id || '') + '"' + (v.available ? '' : ' disabled') + ' aria-label="Add to cart"><svg class="hr-ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></button></div>';
        }).join('');
      });
    },
    position: function () {
      var p = $('.hr-wish__panel'); if (!p || mq.matches) return;
      var h = hdr(), btn = h && $('.hr-hdr__d [data-hr-open="HrWish"]', h);
      var top = h ? h.getBoundingClientRect().bottom : 120;
      p.style.setProperty('--hr-wish-top', Math.max(10, h ? $('.hr-hdr__top', h).getBoundingClientRect().bottom + 6 : top) + 'px');
      if (btn) { var r = btn.getBoundingClientRect(), right = Math.max(12, window.innerWidth - r.right - 60); p.style.right = right + 'px'; p.style.setProperty('--hr-wish-arrow', Math.max(16, window.innerWidth - right - (r.left + r.width / 2) - 7) + 'px'); }
    }
  };
  window.HeitzHR.wishlist = Wish;
  document.addEventListener('click', function (e) {
    var t = e.target, b = t.closest('[data-hr-wish]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      var added = Wish.toggle(b.getAttribute('data-hr-wish'));
      b.classList.remove('is-pop'); b.offsetWidth; b.classList.add('is-pop');
      if (added) { open('HrWish'); var ok = $('[data-hr-wish-ok]'); if (ok) { ok.classList.add('is-on'); setTimeout(function () { ok.classList.remove('is-on'); }, 1800); } }
      else if (openId === 'HrWish') Wish.render();
      return;
    }
    var rm = t.closest('[data-hr-wish-rm]'); if (rm) { var a = Wish.get().filter(function (h) { return h !== rm.getAttribute('data-hr-wish-rm'); }); Wish.set(a); Wish.render(); return; }
    var ad = t.closest('[data-hr-wish-add]'); if (ad && ad.getAttribute('data-hr-wish-add')) { Cart.add([{ id: Number(ad.getAttribute('data-hr-wish-add')), quantity: 1 }], ad); return; }
    var all = t.closest('[data-hr-wish-all]');
    if (all) { var ids = $$('[data-hr-wish-add]').filter(function (x) { return !x.disabled && x.getAttribute('data-hr-wish-add'); }).map(function (x) { return { id: Number(x.getAttribute('data-hr-wish-add')), quantity: 1 }; }); if (ids.length) Cart.add(ids, all); }
  }, true);
  window.addEventListener('resize', function () { if (openId === 'HrWish') Wish.position(); });

  /* ---------- Init ---------- */
  function init() {
    $$('[data-hr-ann]').forEach(initAnn); $$('[data-hr-hero]').forEach(initHero); Wish.sync();
    if (document.getElementById('HrCart')) Cart.load().catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', function () { $$('[data-hr-ann]').forEach(initAnn); $$('[data-hr-hero]').forEach(initHero); Wish.sync(); });
  mq.addEventListener && mq.addEventListener('change', function () { closeAll(true); });
})();
