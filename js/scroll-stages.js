/* Text scrolls naturally. Only the clipping boundary moves; photographs never translate. */
(function () {
  'use strict';
  var section = document.querySelector('[data-scroll-stages]');
  if (!section) return;
  var articles = Array.from(section.querySelectorAll('.scroll-stage'));
  var frames = Array.from(section.querySelectorAll('.scroll-stages__frame'));
  var sticky = section.querySelector('.scroll-stages__sticky');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var queued = false, visible = true;
  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function update() {
    queued = false;
    if (!visible) return;
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
