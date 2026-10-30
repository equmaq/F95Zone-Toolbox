export default {
  key: 'styleUnignoreButton',
  type: 'style',
  title: 'Highlight Unignore And Unwatch Buttons',
  description: 'Makes Unignore thread and Unwatch buttons more visible.',
  enabledByDefault: false,
  run({ document }) {
    const applyStyles = () => document.querySelectorAll('a.tic-button, a.tic--button, a.button--link').forEach(element => {
      Object.assign(element.style, { backgroundColor: '', borderColor: '', borderLeftWidth: '', borderLeftStyle: '' });
      if (['Unignore thread', 'Unwatch'].includes(element.textContent.trim())) {
        Object.assign(element.style, { backgroundColor: 'rgba(220, 53, 69, 0.3)', borderColor: '#dc3545', borderLeftWidth: '1px', borderLeftStyle: 'solid' });
      }
    });
    let timer;
    const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(applyStyles, 0); };
    applyStyles();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  },
};
