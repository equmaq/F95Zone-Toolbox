export default {
  key: 'styleWatchIcons',
  type: 'style',
  title: 'Highlight Watched Threads On Latest Updates Page',
  description: 'Makes watched threads more obvious on the latest updates page.',
  enabledByDefault: false,
  run({ document }) {
    const applyStyles = () => {
      document.querySelectorAll('.fa-eye').forEach(icon => Object.assign(icon.style, {
        color: 'rgb(186, 69, 69)', opacity: '1', top: '2px', right: '5px', fontSize: '20px',
      }));
      document.querySelectorAll('.resource-tile_thumb').forEach(tile => {
        if (tile.querySelector('i.far.fa-eye.watch-icon')) tile.style.boxShadow = 'inset 0 0 0 9999px rgba(149, 4, 4, 0.6)';
      });
    };
    const attach = () => {
      const scope = document.querySelector('#latest-page_items-wrap');
      if (!scope) return false;
      new MutationObserver(applyStyles).observe(scope, { childList: true, subtree: true, attributes: true, characterData: true });
      return true;
    };
    applyStyles();
    if (!attach()) {
      const retry = new MutationObserver(() => { if (attach()) retry.disconnect(); });
      retry.observe(document.body, { childList: true, subtree: true });
    }
  },
};
