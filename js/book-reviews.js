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
  // Format photos follow the neighboring stage dimensions, with a little extra height.
  const stages = document.querySelector('.book-steps__cards');
  const formats = document.querySelector('.book-formats');
  if (stages && formats) {
    const syncFormats = () => {
      if (matchMedia('(min-width: 1200px), (min-width: 768px) and (orientation: landscape)').matches) {
        const height = Math.max(...Array.from(stages.children, card => card.offsetHeight));
        formats.style.setProperty('--format-image-height', `${height + 24}px`);
      } else {
        formats.style.removeProperty('--format-image-height');
      }
    };
    new ResizeObserver(syncFormats).observe(stages);
    window.addEventListener('resize', syncFormats, { passive: true });
    syncFormats();
  }
})();
