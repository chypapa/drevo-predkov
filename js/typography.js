/* Keep Russian prepositions with the following word, including dynamic copy. */
(() => {
  const preposition = /(^|[\s«„("—–])((?:а|и|не|ни|бы|же|после|около|возле|кроме|вдоль|вокруг|вместо|внутри|мимо|помимо|против|ради|сверх|согласно|благодаря|без|безо|близ|в|во|вне|для|до|за|из|изо|из-за|из-под|к|ко|между|на|над|надо|о|об|обо|от|ото|перед|передо|по|под|подо|при|про|с|со|сквозь|среди|у|через)) +(?=\S|$)/giu;
  const bind = text => {
    let result;
    do { result = text; text = text.replace(preposition, '$1$2\u00a0'); } while (text !== result);
    return text;
  };
  const ignored = 'script,style,code,pre,kbd,samp,textarea,[contenteditable]';
  const format = root => {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!root.parentElement?.closest(ignored)) {
        const text = bind(root.data);
        if (root.data !== text) root.data = text;
      }
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(ignored)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) format(walker.currentNode);
  };
  format(document.body);
  document.title = bind(document.title);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') format(record.target);
      else for (const node of record.addedNodes) format(node);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
