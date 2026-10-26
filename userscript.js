// ==UserScript==
// @name         F95Zone Toolbox
// @description  A collection of js-modules for F95Zone that can be individually toggled by the user.
// @author       equmaq
// @icon         https://www.google.com/s2/favicons?domain=f95zone.to
// @namespace    https://github.com/equmaq/F95Zone-Toolbox
// @supportURL   https://github.com/equmaq/F95Zone-Toolbox/issues
// @version      1.4.4
// @license      GPL-3.0
// @match        https://f95zone.to/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @downloadURL https://update.sleazyfork.org/scripts/590793/F95Zone%20Toolbox.user.js
// @updateURL https://update.sleazyfork.org/scripts/590793/F95Zone%20Toolbox.user.js
// ==/UserScript==

(function init() {
  'use strict';

  const STORAGE_KEYS = {
    lastSeenVersion: 'f95zone-toolbox:last-seen-version',
    plusOneEnabled: 'f95zone-toolbox:plus-one-enabled',
    ignoreEnabled: 'f95zone-toolbox:ignore-enabled',
    styleUnignoreButton: 'f95zone-toolbox:style-unignore-button',
    styleWatchIcons: 'f95zone-toolbox:style-watch-icons',
  };
  const CURRENT_VERSION = GM_info.script.version;

  const isThreadPage = /\/threads\//.test(location.pathname);
  const isDownloadPage = /\/dl\//.test(location.pathname);
  const modules = [
    {
      key: 'plusOneEnabled',
      type: 'function',
      title: '+1 Blocker',
      description: 'Blocks those annoying +1 replies.',
      enabledByDefault: false,
      run({ document, isThreadPage }) {
        if (!isThreadPage) {
          return;
        }

        const regex = /^[+﹢]?\d+$/;

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

        clean();

        const observer = new MutationObserver(() => clean());
        observer.observe(document.body, { childList: true, subtree: true });
      },
    },
    {
      key: 'ignoreEnabled',
      type: 'function',
      title: 'Instant Ignore',
      description: 'Makes the "Ignore thread" button instantly ignore threads. Also redirects back to the ignored thread instead of the Adult Games forum.',
      enabledByDefault: false,
      run({ document }) {
        document.addEventListener('click', event => {
          const button = event.target?.closest?.('a.tic-button');
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
          form.innerHTML = [
            '<input type="hidden" name="is_confirmed" value="1">',
            `<input type="hidden" name="content_type" value="${contentType}">`,
            `<input type="hidden" name="redirect" value="/threads/${contentId}">`,
            `<input type="hidden" name="content_id" value="${contentId}">`,
            `<input type="hidden" name="_xfToken" value="${token}">`,
          ].join('');

          document.body.appendChild(form);
          form.submit();
        });
      },
    },
    {
      key: 'maskedLinkSkipperEnabled',
      type: 'function',
      title: 'Masked Link Skipper',
      description: 'Automatically presses the "continue to" button when trying to download a game.',
      enabledByDefault: false,
      run({ document, isDownloadPage }) {
        if (isDownloadPage === false) {
          return;
        }

        const submittedForms = new WeakSet();
        const pendingForms = new WeakSet();

        const submitForms = () => {
          document.querySelectorAll('form.f95dl-box').forEach(form => {
            if (submittedForms.has(form) || pendingForms.has(form)) {
              return;
            }

            pendingForms.add(form);

            const delay = document.querySelector(
              '.blockMessage.blockMessage--error.blockMessage--iconic'
            ) ? 3000 : 0;

            window.setTimeout(() => {
              pendingForms.delete(form);
              submittedForms.add(form);
              form.submit();
            }, delay);
          });
        };

        submitForms();

        const observer = new MutationObserver(submitForms);
        observer.observe(document.body, { childList: true, subtree: true });
      },
    },
    {
      key: 'styleUnignoreButton',
      type: 'style',
      title: 'Highlight Unignore And Unwatch Buttons',
      description: 'Does what it says on the tin. Makes the "Unignore thread" and "Unwatch" buttons more visible by adding a red background and border.',
      enabledByDefault: false,
      run({ document }) {
        const buttonStyles = {
          backgroundColor: 'rgba(220, 53, 69, 0.3)',
          borderColor: '#dc3545',
          borderLeftWidth: '1px',
          borderLeftStyle: 'solid',
        };

        const clearStyles = element => {
          element.style.backgroundColor = '';
          element.style.borderColor = '';
          element.style.borderLeftWidth = '';
          element.style.borderLeftStyle = '';
        };

        const applyStyles = () => {
          document.querySelectorAll('a.tic-button, a.button--link').forEach(element => {
            const text = element.textContent.trim();

            clearStyles(element);

            if (text === 'Unignore thread' || text === 'Unwatch') {
              Object.assign(element.style, buttonStyles);
            }
          });
        };

        let debounceTimer = null;
        const scheduleApply = () => {
          window.clearTimeout(debounceTimer);
          debounceTimer = window.setTimeout(applyStyles, 0);
        };

        applyStyles();

        const observer = new MutationObserver(scheduleApply);
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      },
    },
    {
      key: 'styleWatchIcons',
      type: 'style',
      title: 'Highlight Watched Threads On Latest Updates Page',
      description: 'Makes watched threads more obvious on the latest updates page by applying a red overlay to the thumbnail and making the "watched eye" red.',
      enabledByDefault: false,
      run({ document }) {
        const containerSelector = '#latest-page_items-wrap';
        let styleObserver = null;
        let retryObserver = null;

        const applyStyles = () => {
          document.querySelectorAll('.fa-eye').forEach(icon => {
            Object.assign(icon.style, {
              color: 'rgb(186, 69, 69)',
              opacity: '1',
              top: '2px',
              right: '5px',
              fontSize: '20px',
            });
          });

          document.querySelectorAll('.resource-tile_thumb').forEach(tile => {
            if (tile.querySelector('i.far.fa-eye.watch-icon')) {
              tile.style.boxShadow = 'inset 0 0 0 9999px rgba(149, 4, 4, 0.6)';
            }
          });
        };

        const attachObserver = () => {
          const scope = document.querySelector(containerSelector);
          if (!scope) {
            return false;
          }

          styleObserver?.disconnect();
          styleObserver = new MutationObserver(() => applyStyles());
          styleObserver.observe(scope, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });

          return true;
        };

        applyStyles();

        if (!attachObserver()) {
          retryObserver = new MutationObserver(() => {
            if (attachObserver()) {
              retryObserver?.disconnect();
              retryObserver = null;
              applyStyles();
            }
          });

          retryObserver.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }
      },
    },
  ];

  const moduleState = Object.fromEntries(
    modules.map(module => [module.key, Boolean(module.enabledByDefault)])
  );

  const introState = {
    mode: 'normal',
    fresh: false,
  };

  function getStorage() {
    const gmGetValue = typeof GM_getValue === 'function'
      ? (key, fallback) => Promise.resolve(GM_getValue(key, fallback))
      : typeof GM?.getValue === 'function'
        ? (key, fallback) => GM.getValue(key, fallback)
        : null;

    const gmSetValue = typeof GM_setValue === 'function'
      ? (key, value) => Promise.resolve(GM_setValue(key, value))
      : typeof GM?.setValue === 'function'
        ? (key, value) => GM.setValue(key, value)
        : null;

    return {
      async get(key, fallback) {
        if (gmGetValue) return gmGetValue(key, fallback);
        const stored = localStorage.getItem(key);
        if (stored === null) return fallback;
        try {
          return JSON.parse(stored);
        } catch {
          return stored;
        }
      },
      async set(key, value) {
        if (gmSetValue) return gmSetValue(key, value);
        localStorage.setItem(key, JSON.stringify(value));
      },
    };
  }

  const storage = getStorage();

  let menuDialog = null;
  let moduleCheckboxes = new Map();

  function getModuleContext() {
    return {
      document,
      window,
      location,
      isThreadPage,
    };
  }

  async function loadModuleState() {
    const values = await Promise.all(modules.map(async module => {
      const stored = await storage.get(STORAGE_KEYS[module.key], Boolean(module.enabledByDefault));
      return [module.key, Boolean(stored)];
    }));

    for (const [key, value] of values) {
      moduleState[key] = value;
    }
  }

  function createDialog() {
    const existing = document.getElementById('f95zone-toolbox-dialog');
    if (existing) return existing;

    const dialog = document.createElement('dialog');
    dialog.id = 'f95zone-toolbox-dialog';
    dialog.className = 'f95zone-toolbox-dialog';
    dialog.style.cssText = [
      'max-width:min(92vw,800px)',
      'width:fit-content',
      'border:0',
      'border-radius:7px',
      'padding:0',
      'overflow:hidden',
      'color:#e5eefc',
      'background:transparent',
      'box-shadow:0 24px 80px rgba(0,0,0,.5)',
    ].join(';');

    if (!document.getElementById('f95zone-toolbox-style')) {
      const style = document.createElement('style');
      style.id = 'f95zone-toolbox-style';
      style.textContent = `
        dialog.f95zone-toolbox-dialog {
          background: transparent;
          color: #e8edf5;
          border-radius: 7px;
        }

        dialog.f95zone-toolbox-dialog::backdrop {
          background: rgba(8, 10, 16, 0.72);
          backdrop-filter: blur(6px);
        }

        .f95zone-toolbox-form {
          display: flex;
          flex-direction: column;
          font: 14px/1.45 Arial, sans-serif;
        }

        .f95zone-toolbox-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .f95zone-toolbox-title {
          margin: 0 0 4px;
          font-size: 20px;
          line-height: 1.2;
          color: rgb(236, 85, 85);
        }

        .f95zone-toolbox-description {
          margin: 0;
          color: rgb(238, 238, 238);
        }

        .f95zone-toolbox-intro {
          margin: 0 0 6px;
          color: #f0c76b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .f95zone-toolbox-welcome {
          margin: 0 0 8px;
          color: #e6e7ea;
          font-size: 13px;
        }

        .f95zone-toolbox-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 14px;
          padding: 18px 18px 16px;
          background: #242629;
        }

        .f95zone-toolbox-column {
          display: grid;
          gap: 10px;
          align-content: start;
          width: fit-content;
        }

        .f95zone-toolbox-column-title {
          margin: 0 2px 2px;
          color: #b8c1d1;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .f95zone-toolbox-column-list {
          display: grid;
          gap: 10px;
          width: fit-content;
        }

        .f95zone-toolbox-module {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          width: 370px;
        }

        .f95zone-toolbox-module.iconic {
          gap: 10px;
        }

        .f95zone-toolbox-module .iconic-label {
          display: grid;
          gap: 2px;
        }

        .f95zone-toolbox-module .iconic-label strong {
          font-size: 14px;
        }

        .f95zone-toolbox-module .iconic-label span {
          color: #aab2c1;
        }

        .f95zone-toolbox-module i {
          display: inline-block;
          min-width: 1em;
          height: 0.9em;
          text-align: left;
          position: relative;
          flex: 0 0 auto;
          font-style: normal;
          line-height: 1;
          color: #9398a0;
        }

        .f95zone-toolbox-module i::before,
        .f95zone-toolbox-module i::after {
          position: absolute;
          left: 0;
          top: 0.12em;
          display: inline-block;
          width: 0.88em;
          line-height: 1;
          vertical-align: -1px;
          font-size: 1.2em;
        }

        .f95zone-toolbox-module-copy {
          display: grid;
          gap: 2px;
        }

        .f95zone-toolbox-module-copy strong {
          font-size: 14px;
        }

        .f95zone-toolbox-module-copy span {
          color: #aab2c1;
        }

        .f95zone-toolbox-column--styles .f95zone-toolbox-module {
          border-color: rgba(220, 53, 69, 0.18);
        }

        @media (max-width: 860px) {
          .f95zone-toolbox-body {
            grid-template-columns: 1fr;
          }
        }

        .f95zone-toolbox-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 52px;
          padding: 0 16px;
          background: #37383a;
        }

        .f95zone-toolbox-tip {
          color: #9fa6b3;
          font-size: 12px;
          line-height: 1.2;
        }

        .f95zone-toolbox-tip--fresh {
          color: #ff5151;
          text-shadow: 0 0 6px rgba(255, 81, 81, 0.85), 0 0 16px rgba(255, 81, 81, 0.45);
        }
      `;
      document.head.appendChild(style);
    }

    dialog.innerHTML = `
      <form class="f95zone-toolbox-form" method="dialog">
        <div class="f95zone-toolbox-body">
          <div class="f95zone-toolbox-header" style="grid-column: 1 / -1;">
            <div>
              <p class="f95zone-toolbox-intro" data-role="intro-line"></p>
              <p class="f95zone-toolbox-welcome" data-role="welcome-line"></p>
              <h2 id="f95zone-toolbox-title" class="f95zone-toolbox-title">F95Zone Toolbox</h2>
              <p class="f95zone-toolbox-description">Choose which modules should be active. Changes are saved immediately and applied upon reload.</p>
            </div>
          </div>
          <section class="f95zone-toolbox-column f95zone-toolbox-column--functions">
            <h3 class="f95zone-toolbox-column-title">Function modules</h3>
            <div class="f95zone-toolbox-column-list">
              ${renderModuleCards('function')}
            </div>
          </section>
          <section class="f95zone-toolbox-column f95zone-toolbox-column--styles">
            <h3 class="f95zone-toolbox-column-title">Style modules</h3>
            <div class="f95zone-toolbox-column-list">
              ${renderModuleCards('style')}
            </div>
          </section>
        </div>
        <div class="f95zone-toolbox-footer">
          <div class="f95zone-toolbox-tip" data-role="tip-line">Open this menu again from the userscript manager menu.</div>
          <button type="submit" value="apply" class="button--primary button">Apply</button>
        </div>
      </form>
    `;

    dialog.addEventListener('close', async () => {
      if (!menuDialog) {
        return;
      }

      if (dialog.returnValue === 'apply') {
        await saveMenuState();
        await storage.set(STORAGE_KEYS.lastSeenVersion, CURRENT_VERSION);
        location.reload();
      }

      menuDialog = null;
    });

    document.body.appendChild(dialog);
    moduleCheckboxes = new Map(modules.map(module => [module.key, dialog.querySelector(`input[name="${module.key}"]`)]));
    syncDialogIntro(dialog);
    return dialog;
  }

  function renderModuleCards(type) {
    return modules
      .filter(module => module.type === type)
      .map(module => `
        <label class="f95zone-toolbox-module iconic iconic--checkbox">
          <input type="checkbox" name="${module.key}" ${moduleState[module.key] ? 'checked' : ''}>
          <i aria-hidden="true"></i>
          <span class="iconic-label f95zone-toolbox-module-copy">
            <strong>${module.title}</strong>
            <span>${module.description}</span>
          </span>
        </label>
      `)
      .join('');
  }

  function syncDialogIntro(dialog) {
    const introLine = dialog.querySelector('[data-role="intro-line"]');
    const welcomeLine = dialog.querySelector('[data-role="welcome-line"]');
    const tipLine = dialog.querySelector('[data-role="tip-line"]');

    if (introLine) {
      introLine.textContent = introState.mode === 'update'
        ? `New Version: ${CURRENT_VERSION}!`
        : introState.mode === 'install'
          ? 'Welcome to F95Zone Toolbox!'
          : '';
      introLine.style.display = introLine.textContent ? '' : 'none';
    }

    if (welcomeLine) {
      welcomeLine.textContent = introState.mode === 'install'
        ? 'Use this setup to turn modules on or off before the page reloads.'
        : introState.mode === 'update'
          ? 'This config window opens once per version so you can review new releases.'
          : '';
      welcomeLine.style.display = welcomeLine.textContent ? '' : 'none';
    }

    if (tipLine) {
      tipLine.classList.toggle('f95zone-toolbox-tip--fresh', introState.fresh);
    }
  }

  async function saveMenuState() {
    for (const module of modules) {
      const checkbox = moduleCheckboxes.get(module.key);
      const enabled = Boolean(checkbox?.checked);
      moduleState[module.key] = enabled;
      await storage.set(STORAGE_KEYS[module.key], enabled);
    }
  }

  function applyModules() {
    const context = getModuleContext();

    for (const module of modules) {
      if (!moduleState[module.key]) {
        continue;
      }

      if (module.type === 'function' && typeof module.run === 'function') {
        module.run(context);
        continue;
      }

      if (module.type === 'style' && typeof module.run === 'function') {
        module.run(context);
      }
    }
  }

  async function showDialog(force = false) {
    const lastSeenVersion = await storage.get(STORAGE_KEYS.lastSeenVersion, '');
    const shouldShowFreshIntro = lastSeenVersion !== CURRENT_VERSION;
    if (!force && !shouldShowFreshIntro) return;

    introState.mode = shouldShowFreshIntro
      ? (lastSeenVersion ? 'update' : 'install')
      : 'normal';
    introState.fresh = shouldShowFreshIntro;

    const dialog = createDialog();
    menuDialog = dialog;
    if (dialog.open) {
      dialog.close();
    }

    if (shouldShowFreshIntro) {
      await storage.set(STORAGE_KEYS.lastSeenVersion, CURRENT_VERSION);
    }

    dialog.showModal();
  }

  function registerMenuCommand(label, handler) {
    const candidates = [
      typeof GM_registerMenuCommand === 'function' && GM_registerMenuCommand,
      typeof GM?.registerMenuCommand === 'function' && GM.registerMenuCommand,
    ].filter(Boolean);

    for (const register of candidates) {
      try {
        register(label, handler);
        return true;
      } catch {
        // Try the next supported menu API.
      }
    }

    return false;
  }

  async function bootstrap() {
    console.log('[F95Zone Toolbox] loaded');

    await loadModuleState();

    applyModules();

    registerMenuCommand('F95Zone Toolbox: Open config', () => {
      void showDialog(true);
    });

    await showDialog(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void bootstrap();
    }, { once: true });
  } else {
    void bootstrap();
  }
}());
