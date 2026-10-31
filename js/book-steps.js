/* The photograph pins only while its section is crossing the viewport.
   Every card position is a direct function of scroll position, in either direction. */
(function () {
  'use strict';
  var section = document.querySelector('[data-book-steps]');
  if (!section) return;
  var row = section.querySelector('.book-steps__cards');
  var cards = Array.from(section.querySelectorAll('.book-steps__card'));
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var compact = matchMedia('(max-width:767px), (max-width:1199px) and (orientation:portrait)');
  var active = false, queued = false, viewport = 0, releaseAt = 0;
  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function update() {
    queued = false;
    if (!active) return;
    var scrolled = -section.getBoundingClientRect().top;
    // At this point the sticky window naturally releases and carries the first card with it.
    var leaving = Math.max(0, scrolled - releaseAt);
    cards.forEach(function (card, index) {
      // Start before pinning: the first card is settled when the full background arrives.
      var enterStart = [-.85, -.40, .10][index];
      var enter = clamp((scrolled / viewport - enterStart) / .75);
      var extraSpeed = [0, .35, .8][index];
      var y = (1 - enter) * viewport * .8 - leaving * extraSpeed;
      card.style.transform = 'translate3d(0,' + y.toFixed(3) + 'px,0)';
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function configure() {
    viewport = innerHeight;
    var padding = parseFloat(getComputedStyle(section).getPropertyValue('--form-padding')) || 32;
    // Tall copy always remains in ordinary flow rather than being clipped.
    active = !reduce.matches && !compact.matches && row.offsetHeight + 2 * padding <= viewport;
    section.classList.toggle('is-scroll-story', active);
    if (!active) {
      cards.forEach(function (card) { card.style.transform = ''; });
      return;
    }
    releaseAt = Math.max(1, section.offsetHeight - viewport);
    update();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', configure);
  reduce.addEventListener('change', configure);
  compact.addEventListener('change', configure);
  if ('ResizeObserver' in window) new ResizeObserver(configure).observe(row);
  if (document.fonts) document.fonts.ready.then(configure);
  section.addEventListener('focusin', function (event) {
    if (!active || !event.target.closest('.book-steps__card')) return;
    var rect = event.target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > viewport) {
      scrollTo({ top: scrollY + section.getBoundingClientRect().top + viewport * .95, behavior: 'instant' });
    }
  });
  configure();
})();
