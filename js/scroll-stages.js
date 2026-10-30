/* Text scrolls naturally. Only the clipping boundary moves; photographs never translate. */
(function () {
  'use strict';
  var section = document.querySelector('[data-scroll-stages]');
  if (!section) return;
  var articles = Array.from(section.querySelectorAll('.scroll-stage'));
  var frames = Array.from(section.querySelectorAll('.scroll-stages__frame'));
  var sticky = section.querySelector('.scroll-stages__sticky');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = matchMedia('(max-width: 767px)');
  var queued = false, visible = true;
  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function update() {
    queued = false;
    if (!visible) return;
    if (mobile.matches) {
      frames.forEach(function (frame) { frame.style.height = ''; frame.style.clipPath = 'none'; frame.querySelector('img').style.transform = 'none'; });
      section.querySelectorAll('.scroll-stage__mobile-img').forEach(function (photo) { photo.style.transform = 'none'; });
      return;
    }
    var rects = articles.map(function (article) { return article.getBoundingClientRect(); });
    var windowRect = sticky.getBoundingClientRect();
    // Reveal each incoming frame as its text section crosses the photo viewport.
    var reveals = rects.map(function (rect, index) {
      return index === 0 ? 1 : clamp(1 - (rect.top - windowRect.top) / windowRect.height);
    });
    frames.forEach(function (frame, index) {
      frame.style.height = reduced.matches ? rects[index].height + 'px' : '';
      frame.style.clipPath = reduced.matches ? 'none' : 'inset(' + ((1 - reveals[index]) * 100) + '% 0 0)';
      // The outgoing photograph shrinks subtly underneath the next reveal.
      var covered = index + 1 < frames.length ? reveals[index + 1] : 0;
      frame.querySelector('img').style.transform = reduced.matches ? 'none' : 'scale(' + (1.08 - covered * .08) + ')';
    });
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  mobile.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    var resizeObserver = new ResizeObserver(schedule);
    articles.forEach(function (article) { resizeObserver.observe(article); });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) schedule();
    }, { rootMargin: '100% 0px' }).observe(section);
  }
  if (document.fonts) document.fonts.ready.then(schedule);
  update();
})();

/* Settle user-initiated scrolling at the nearest stage. Never pull back on exit. */
(function () {
  'use strict';
  var section = document.querySelector('[data-scroll-stages]');
  if (!section) return;
  var articles = Array.from(section.querySelectorAll('.scroll-stage'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = matchMedia('(max-width: 767px)');
  var timer = 0, animation = 0, snapping = false;
  function cancel() {
    clearTimeout(timer);
    if (animation) cancelAnimationFrame(animation);
    animation = 0;
    if (snapping && window.lenis) window.lenis.scrollTo(scrollY, { immediate: true });
    snapping = false;
  }
  function settle() {
    if (mobile.matches || reduce.matches || document.querySelector('.overlay.is-open')) return;
    var stops = articles.map(function (e) { return scrollY + e.getBoundingClientRect().top; });
    if (scrollY < stops[0] || scrollY > stops[stops.length - 1] + 1) return;
    var target = stops.reduce(function (best, y) { return Math.abs(y - scrollY) < Math.abs(best - scrollY) ? y : best; }, stops[0]);
    if (Math.abs(target - scrollY) < 2) return;
    snapping = true;
    var ease = function (t) { return t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; };
    if (window.lenis) {
      window.lenis.scrollTo(target, { duration: 1.35, easing: ease, onComplete: function () { snapping = false; } });
    } else {
      var origin = scrollY, started = performance.now();
      function step(now) {
        var t = Math.min(1, (now - started) / 1350);
        scrollTo({ top: origin + (target - origin) * ease(t), behavior: 'instant' });
        if (t < 1) animation = requestAnimationFrame(step);
        else { animation = 0; snapping = false; }
      }
      animation = requestAnimationFrame(step);
    }
  }
  function arm() { cancel(); if (!mobile.matches && !reduce.matches) timer = setTimeout(settle, 300); }
  addEventListener('wheel', arm, { passive: true });
  addEventListener('touchstart', cancel, { passive: true });
  addEventListener('touchmove', cancel, { passive: true });
  addEventListener('touchend', arm, { passive: true });
  addEventListener('pointerdown', cancel, { passive: true });
  addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) arm();
  });
  addEventListener('resize', cancel);
  reduce.addEventListener('change', cancel);
  mobile.addEventListener('change', cancel);
})();
