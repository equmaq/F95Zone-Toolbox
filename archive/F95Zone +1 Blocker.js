// ==UserScript==
// @name         F95Zone +1 Blocker
// @namespace    http://tampermonkey.net/
// @version      2026-04-29v2
// @description  Blocks those annoying +1 replies
// @author       equmaq
// @match        https://f95zone.to/threads/*/page-*
// @match        https://f95zone.to/threads/*/post-*
// @match        https://f95zone.to/threads/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=f95zone.to
// @license      GLP-2
// @downloadURL https://update.greasyfork.org/scripts/575934/F95Zone%20%2B1%20Blocker.user.js
// @updateURL https://update.greasyfork.org/scripts/575934/F95Zone%20%2B1%20Blocker.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const regex = /^\s*\+?\s*\d+\s*$/;

    function clean() {
        document.querySelectorAll('.message').forEach(post => {
            const bb = post.querySelector('.bbWrapper');
            if (!bb) return;

            const text = bb.textContent.trim();

            if (regex.test(text)) {
                post.remove();
            }
        });
    }

    // initial run
    clean();

    // handle dynamically loaded posts
    const observer = new MutationObserver(() => clean());
    observer.observe(document.body, { childList: true, subtree: true });
})();