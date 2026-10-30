/* Scroll position is the timeline: no easing, timers, snapping or retained direction. */
(function () {
  'use strict';
  var section = document.querySelector('[data-scroll-stages]');
  if (!section) return;
  var articles = Array.from(section.querySelectorAll('.scroll-stage'));
  var frames = Array.from(section.querySelectorAll('.scroll-stages__frame'));
  var sticky = section.querySelector('.scroll-stages__sticky');
  var desktop = matchMedia('(min-width: 768px)');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var queued = false;
  var visible = true;
  function clamp(n) { return Math.max(-1, Math.min(1, n)); }
  function update() {
    queued = false;
    if (!visible) return;
    // Read all geometry before writing transforms to avoid repeated layouts.
    var viewport = innerHeight;
    var rects = articles.map(function (article) { return article.getBoundingClientRect(); });
    var stickyTop = sticky.getBoundingClientRect().top;
    rects.forEach(function (rect, index) {
      var frame = frames[index];
      var photo = desktop.matches ? frame.querySelector('img') : articles[index].querySelector('.scroll-stage__mobile-img');
      var progress = clamp((viewport / 2 - rect.top - rect.height / 2) / ((viewport + rect.height) / 2));
      if (desktop.matches) {
        // Frame edges track the corresponding article edges, including tall text.
        frame.style.height = rect.height + 'px';
        frame.style.transform = reduced.matches ? 'none' : 'translate3d(0,' + (rect.top - stickyTop) + 'px,0)';
      }
      photo.style.transform = reduced.matches ? 'none' :
        'translate3d(0,' + (-progress * 8) + '%,0) scale(' + (1.14 + progress * .06) + ')';
    });
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
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
