(function () {
  'use strict';

  var section = document.querySelector('[data-scroll-stages]');
  if (!section) return;

  var frames = Array.prototype.slice.call(section.querySelectorAll('.scroll-stages__frame'));
  var photos = frames.map(function (frame) { return frame.querySelector('img'); });
  var mobilePhotos = Array.prototype.slice.call(section.querySelectorAll('.scroll-stage__mobile-img'));
  var articles = Array.prototype.slice.call(section.querySelectorAll('.scroll-stage'));
  var desktop = window.matchMedia('(min-width: 768px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var queued = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateDesktop() {
    var sectionTop = section.getBoundingClientRect().top;
    var scrolled = -sectionTop;
    var starts = articles.map(function (article) {
      return article.getBoundingClientRect().top - sectionTop;
    });
    var progress = 0;
    for (var index = 0; index < starts.length - 1; index += 1) {
      if (scrolled >= starts[index]) {
        progress = index + (scrolled - starts[index]) / (starts[index + 1] - starts[index]);
      }
    }
    progress = clamp(progress, 0, frames.length - 1);

    frames.forEach(function (frame, index) {
      frame.style.transform = 'translate3d(0, ' + ((index - progress) * 100) + '%, 0)';
      if (reduced.matches) {
        photos[index].style.transform = 'none';
        return;
      }
      var local = clamp(progress - index, -1, 1);
      var y = local * -8;
      var scale = 1.1 - (local + 1) * 0.01;
      photos[index].style.transform = 'translate3d(0, ' + y + '%, 0) scale(' + scale + ')';
    });
  }

  function updateMobile() {
    var viewport = window.innerHeight;
    mobilePhotos.forEach(function (photo) {
      if (reduced.matches) {
        photo.style.transform = 'none';
        return;
      }
      var rect = photo.parentElement.getBoundingClientRect();
      var offset = clamp((rect.top + rect.height / 2 - viewport / 2) / viewport, -1, 1);
      photo.style.transform = 'translate3d(0, ' + (offset * 4) + '%, 0) scale(1.1)';
    });
  }

  function update() {
    queued = false;
    if (desktop.matches) updateDesktop();
    else updateMobile();
  }

  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  update();
})();
