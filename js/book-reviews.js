(() => {
  const section = document.querySelector('.reviews--editorial');
  if (!section) return;
  // Format photos follow the neighboring stage dimensions, with a little extra height.
  const stages = document.querySelector('.book-steps__cards');
  const formats = document.querySelector('.book-formats');
  if (stages && formats) {
    const syncFormats = () => {
      if (matchMedia('(min-width: 1200px)').matches) {
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
