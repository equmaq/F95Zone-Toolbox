# F95Zone Toolbox

> A small, sharp userscript for making F95Zone less tedious.

F95Zone Toolbox bundles independent quality-of-life modules into one configurable userscript. Enable only what you want; settings persist through the userscript manager and changes take effect after reload.

## What It Does

| Module | Purpose |
| --- | --- |
| **+1 Blocker** | Removes replies containing only a number, such as `+1` or `42`. |
| **Instant Ignore** | Ignores a thread directly and returns to that thread instead of opening the confirmation flow. |
| **Masked Link Skipper** | Automatically submits F95Zone download continuation forms. |
| **Button Highlights** | Makes `Unignore thread` and `Unwatch` controls stand out. |
| **Watched Thread Highlights** | Emphasizes watched threads on the latest updates page. |

Every module is disabled by default and can be toggled from the **F95Zone Toolbox** configuration dialog.

## Install

Install the generated userscript through your preferred userscript manager:

- [Install from Sleazy Fork](https://sleazyfork.org/en/scripts/590793-f95zone-toolbox)
- Or build `dist/f95zone-toolbox.user.js` locally and import it manually.

The script matches `https://f95zone.to/*` and supports Tampermonkey, Violentmonkey, and Greasemonkey-compatible managers.

## Development

```bash
npm install
npm run build
```

The production userscript is written to `dist/`.

For iterative development:

```bash
npm run watch
```

BundleMonkey performs the bundling. The build wrapper also handles the workspace path safely and generates the module registry and dialog assets automatically.

## Project Shape

```text
src/f95zone-toolbox/
├── index.user.js                 # runtime, settings, and dialog coordinator
├── dialog.html                   # dialog markup
├── dialog.css                    # dialog styling
└── modules/
    ├── plus-one-blocker.js
    ├── instant-ignore.js
    ├── masked-link-skipper.js
    ├── highlight-buttons.js
    └── highlight-watched-threads.js
```

## Add A Module

Create one file in `src/f95zone-toolbox/modules/` and export a module object:

```js
export default {
  key: 'myModuleEnabled',
  type: 'function', // 'function' or 'style'
  title: 'My Module',
  description: 'What this module does.',
  enabledByDefault: false,
  run({ document, window, location, isThreadPage, isDownloadPage }) {
    // Module behavior
  },
};
```

That is all. The build automatically discovers every `.js` file in the modules folder, adds it to the toolbox dialog, persists its setting, and runs it when enabled.

Use the supplied context to keep page checks local to the module. For example, return immediately when `isThreadPage` or `isDownloadPage` does not apply.

## Runtime Notes

- Settings use `GM_getValue`/`GM_setValue` or modern `GM.getValue`/`GM.setValue` APIs.
- `localStorage` is used as a fallback when no GM storage API is available.
- The userscript menu contains **F95Zone Toolbox: Open config**.
- The configuration dialog opens automatically on first install and after a version change.

## License

[GPL-3.0](LICENSE)

## AI Disclosure

GitHub Copilot was occasionally used for IntelliSense and inline suggestions during development.
Migration to bundlemonkey mostly done by AI.
