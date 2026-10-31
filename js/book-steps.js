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
  var active = false, queued = false, viewport = 0, travel = 0, exitDistance = 0;
  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function update() {
    queued = false;
    if (!active) return;
    var progress = clamp(-section.getBoundingClientRect().top / travel);
    cards.forEach(function (card, index) {
      var enterStart = index * .10;
      var enter = clamp((progress - enterStart) / .20);
      var exitEnd = [.98, .86, .74][index];
      var leave = clamp((progress - .58) / (exitEnd - .58));
      var y = (1 - enter) * viewport * .8 - leave * exitDistance;
      card.style.transform = 'translate3d(0,' + y.toFixed(3) + 'px,0)';
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function configure() {
    viewport = innerHeight;
    var padding = parseFloat(getComputedStyle(section).getPropertyValue('--form-padding')) || 32;
    var heading = section.querySelector('.book-steps__heading').offsetHeight;
    // Tall copy always remains in ordinary flow rather than being clipped.
    active = !reduce.matches && !compact.matches && row.offsetHeight + 2 * (padding + heading) <= viewport;
    section.classList.toggle('is-scroll-story', active);
    if (!active) {
      cards.forEach(function (card) { card.style.transform = ''; });
      return;
    }
    travel = Math.max(1, section.offsetHeight - viewport);
    exitDistance = (viewport + row.offsetHeight) / 2 + padding;
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
      scrollTo({ top: scrollY + section.getBoundingClientRect().top + travel * .46, behavior: 'instant' });
    }
  });
  configure();
})();
