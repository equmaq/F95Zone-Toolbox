export default {
  key: 'maskedLinkSkipperEnabled',
  type: 'function',
  title: 'Masked Link Skipper',
  description: 'Automatically presses the continue button when downloading a game.',
  enabledByDefault: false,
  run({ document, isDownloadPage }) {
    if (!isDownloadPage) return;
    const submitted = new WeakSet();
    const pending = new WeakSet();
    const submitForms = () => document.querySelectorAll('form.f95dl-box').forEach(form => {
      if (submitted.has(form) || pending.has(form)) return;
      pending.add(form);
      const delay = document.querySelector('.blockMessage.blockMessage--error.blockMessage--iconic') ? 3000 : 2300;
      window.setTimeout(() => { pending.delete(form); submitted.add(form); form.submit(); }, delay);
    });
    submitForms();
    new MutationObserver(submitForms).observe(document.body, { childList: true, subtree: true });
  },
};
