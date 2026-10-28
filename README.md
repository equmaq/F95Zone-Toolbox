# F95Zone-Toolbox

A collection of js-modules for F95Zone that can be individually toggled by the user.

Current function modules:
- Instant Ignore Button
- +1 Reply Blocker
- Masked Link Skipper

Current Style Modules:
- Highlight Unignore And Unwatch Buttons
- Highlight Watched Threads On Latest Updates Page


## Installation

https://sleazyfork.org/en/scripts/590793-f95zone-toolbox

---

## Technical Details

The userscript is split into independent modules. Each module has a checkbox in
the Toolbox configuration dialog and is disabled by default. The selected
settings are saved and applied after the page reloads.

### Function Modules

#### Instant Ignore Button

This module watches for clicks on F95Zone's `Ignore thread` link. Instead of
allowing the normal confirmation page to open, it:

1. Prevents the link's normal action.
2. Reads the thread ID and content type from the link URL.
3. Reads the CSRF token from the page's `data-csrf` attribute.
4. Builds and submits a hidden `POST` form to `/misc/tic-ignore`.

The form marks the action as confirmed and redirects back to the ignored
thread. The click handler is attached to the document, so it also works for a
button inserted after the initial page load.

#### +1 Reply Blocker

On thread pages, this module looks through `.message` elements and checks the
text inside each post's `.bbWrapper` element. Posts containing only a number,
optionally preceded by `+` or `﹢`, are removed from the page. For example,
`+1` and `42` match, while normal sentences do not.

It performs one scan immediately and then uses a `MutationObserver` to scan
again when new posts are added during dynamic page navigation.

#### Masked Link Skipper

This module is intended for download pages (`/dl/`) and finds forms with the
`.f95dl-box` class. These forms represent F95Zone's intermediate "continue to"
step. Each form is submitted automatically after a short delay, removing the
need to press the button manually.

The normal delay is 2.3 seconds. If the page contains F95Zone's error message,
the delay is increased to 3 seconds.

### Style Modules

#### Highlight Unignore And Unwatch Buttons

This module checks links matching `a.tic-button` and `a.button--link`. Links
whose text is exactly `Unignore thread` or `Unwatch` receive a translucent red
background, a red border, and a red left border.

The styling runs once immediately and is repeated when the page changes. The
updates are debounced with a zero-millisecond timeout so several DOM changes
can be handled together.

#### Highlight Watched Threads On Latest Updates Page

This module finds watched-thread icons (`.fa-eye` and
`.watch-icon`) and makes them easier to see by setting their color, opacity,
position, and size. It also adds a red inset overlay to the thumbnail
(`.resource-tile_thumb`) containing a watched icon.

### Shared Runtime

At startup the script waits for the document to be ready, loads each module's
saved enabled/disabled value, and runs the enabled modules with the current
page context. Page-specific modules exit immediately when their URL does not
match their supported page type.

Settings use the userscript manager's `GM_getValue`/`GM_setValue` APIs (or the
modern `GM.getValue`/`GM.setValue` APIs). If neither API is available, the
script falls back to `localStorage`. The userscript manager menu contains
`F95Zone Toolbox: Open config`, which opens the settings dialog again. The
dialog also appears on first install and once after a new script version is
detected.

## AI usage disclosure

- AI powered IntelliSense/inline suggestions were occasionally used (GitHub Copilot)
