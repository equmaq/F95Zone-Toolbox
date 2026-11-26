export default {
  key: 'ignoreEnabled',
  type: 'function',
  title: 'Instant Ignore',
  description: 'Instantly ignores threads and redirects back to the ignored thread.',
  enabledByDefault: false,
  run({ document }) {
    document.addEventListener('click', event => {
      const button = event.target?.closest?.('a.tic-button, a.tic--button');
      if (button?.textContent?.trim() !== 'Ignore thread') return;
      event.preventDefault();
      const url = new URL(button.href, location.href);
      const contentId = url.searchParams.get('content_id');
      const contentType = url.searchParams.get('content_type');
      const token = document.documentElement.getAttribute('data-csrf');
      if (!contentId || !contentType || !token) return;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/misc/tic-ignore';
      for (const [name, value] of Object.entries({
        is_confirmed: '1', content_type: contentType, redirect: `/threads/${contentId}`,
        content_id: contentId, _xfToken: token,
      })) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = value; form.append(input);
      }
      document.body.append(form);
      form.submit();
    });
  },
};
