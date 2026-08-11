// ==UserScript==
// @name         F95Zone Instant Thread Ignore Button
// @description  Makes the "Ignore thread" button instantly ignore threads without pulling up the annoying form. Also redirects back to the igonred thread instead of the Adult Games forum.
// @author       equmaq
// @version      1.0
// @license      GPL-2.0
// @match        *://f95zone.to/threads/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=f95zone.to
// ==/UserScript==

document.addEventListener('click', function (e) {
    const btn = e.target.closest('a.tic--button');
    if (!btn) return;
    if (btn.textContent.trim() !== 'Ignore thread') return;

    e.preventDefault();

    const url = new URL(btn.href);
    const contentId = url.searchParams.get('content_id');
    const contentType = url.searchParams.get('content_type');

    // grab CSRF token from <html>
    const token = document.documentElement.getAttribute('data-csrf');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/misc/tic-ignore';

    form.innerHTML = `
        <input type="hidden" name="is_confirmed" value="1">
        <input type="hidden" name="content_type" value="${contentType}">
        <input type="hidden" name="redirect" value="/threads/${contentId}">
        <input type="hidden" name="content_id" value="${contentId}">
        <input type="hidden" name="_xfToken" value="${token}">
    `;

    document.body.appendChild(form);
    form.submit();
});