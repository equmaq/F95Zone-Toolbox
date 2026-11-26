export default {
  key: 'plusOneEnabled',
  type: 'function',
  title: '+1 Blocker',
  description: 'Blocks those annoying +1 replies.',
  enabledByDefault: false,
  run({ document, isThreadPage }) {
    if (!isThreadPage) return;
    const regex = /^[+\uFE62]?\d+$/;
    const clean = () => document.querySelectorAll('.message').forEach(post => {
      const body = post.querySelector('.bbWrapper');
      if (body && regex.test(body.textContent.trim())) post.remove();
    });
    clean();
    new MutationObserver(clean).observe(document.body, { childList: true, subtree: true });
  },
};
