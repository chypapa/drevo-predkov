/* A restrained 16px overlap at each contrasting section boundary.
   Sticky stage geometry remains on its original, untransformed section. */
(function () {
 'use strict';
 var root = document.documentElement;
 if (!root.classList.contains('book-intro-redesign')) return;
 var reduced = matchMedia('(prefers-reduced-motion: reduce)');
 var wide = matchMedia('(min-width:768px) and (orientation:landscape), (min-width:1200px)');
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
   pair.surface.style.transform = 'translate3d(0,' + (16 * progress).toFixed(3) + 'px,0)';
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
