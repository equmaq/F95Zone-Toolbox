export default {
  key: 'maskedLinkSkipperEnabled',
  type: 'function',
  title: 'Masked Link Skipper',
  description: 'Automatically presses the continue button when downloading a game.',
  enabledByDefault: false,
  run({ document, isDownloadPage }) {
    let delay1 = 3000;
    let delay2 = 2300;
    if (globalThis.isDonor) {
      delay1 = 1500;
      delay2 = 500;
    }
    if (!isDownloadPage) return;
    const submitted = new WeakSet();
    const pending = new WeakSet();
    const submitForms = () => document.querySelectorAll('form.f95dl-box').forEach(form => {
      if (submitted.has(form) || pending.has(form)) return;
      pending.add(form);
      const delay = document.querySelector('.blockMessage.blockMessage--error.blockMessage--iconic') ? delay1 : delay2;
      window.setTimeout(() => { pending.delete(form); submitted.add(form); form.submit(); }, delay);
    });
    submitForms();
    new MutationObserver(submitForms).observe(document.body, { childList: true, subtree: true });
  },
};
