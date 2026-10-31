(() => {
  const section = document.querySelector('.reviews--editorial');
  if (!section) return;
  const track = section.querySelector('.reviews__list');
  const update = () => {
    section.style.setProperty('--review-progress', Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth));
  };
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
})();
