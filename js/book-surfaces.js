/* Visible overlap and background parallax at contrasting section boundaries.
   Sticky stage geometry remains on its original, untransformed section. */
(function () {
 'use strict';
 var root = document.documentElement;
 if (!root.classList.contains('book-intro-redesign')) return;
 var reduced = matchMedia('(prefers-reduced-motion: reduce)');
 var wide = matchMedia('(min-width:768px)');
 var backgrounds = [
  { section: document.querySelector('.book-steps'), image: document.querySelector('.book-steps__backdrop img') },
  { section: document.querySelector('#calc'), image: document.querySelector('#calc .calc__backdrop') }
 ].filter(function (entry) { return entry.section && entry.image; });
 var pairs = [
  ['.book-editorial', '.book-steps'],
  ['.book-steps__window', '.book-formats'],
  ['#reviews', '#calc'],
  ['#calc', '.h3-footer']
 ].map(function (selectors) { return { surface: document.querySelector(selectors[0]), next: document.querySelector(selectors[1]) }; })
  .filter(function (pair) { return pair.surface && pair.next; });
 var queued = false;
 function layoutTop(element) {
  var top = 0;
  for (var node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
 }
 function update() {
  queued = false;
  var enabled = wide.matches && !reduced.matches;
  pairs.forEach(function (pair) {
   if (!enabled) { pair.surface.style.transform = ''; return; }
   var nextTop = layoutTop(pair.next) - scrollY;
   var progress = Math.max(0, Math.min(1, (innerHeight - nextTop) / innerHeight));
   var overlap = Math.min(160, innerHeight * .16);
   pair.surface.style.transform = 'translate3d(0,' + (overlap * progress).toFixed(3) + 'px,0)';
  });
  backgrounds.forEach(function (entry) {
   if (!enabled) { entry.image.style.transform = ''; return; }
   var rect = entry.section.getBoundingClientRect();
   var progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight));
   entry.image.style.transform = 'translate3d(0,' + (progress * 72).toFixed(3) + 'px,0) scale(1.18)';
  });
 }
 function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
 addEventListener('scroll', schedule, { passive: true });
 addEventListener('resize', schedule);
 reduced.addEventListener('change', schedule);
 wide.addEventListener('change', schedule);
 if ('ResizeObserver' in window) {
  var observer = new ResizeObserver(schedule);
  pairs.forEach(function (pair) { observer.observe(pair.next); });
 }
 if (document.fonts) document.fonts.ready.then(schedule);
 update();
})();
