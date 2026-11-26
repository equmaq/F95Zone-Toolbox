// ==UserScript==
// @name         F95Zone-Toolbox
// @namespace    https://example.com/F95Zone-Toolbox
// @version      3.0.0
// @description  A collection of JS modules for F95Zone that can be individually toggled by the user.
// @icon         https://www.google.com/s2/favicons?domain=f95zone.to
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @author       equmaq
// @homepage     https://github.com/equmaq/F95Zone-Toolbox
// @homepageURL  https://github.com/equmaq/F95Zone-Toolbox
// @match        https://f95zone.to/*
// @run-at       document-end
// @updateURL    https://update.sleazyfork.org/scripts/590793/F95Zone%20Toolbox.user.js
// @downloadURL  https://update.sleazyfork.org/scripts/590793/F95Zone%20Toolbox.user.js
// @supportURL   https://github.com/equmaq/F95Zone-Toolbox/issues
// ==/UserScript==

// src/modular-userscript/modules/highlight-buttons.js
var highlight_buttons_default = {
  key: "styleUnignoreButton",
  type: "style",
  title: "Highlight Unignore And Unwatch Buttons",
  description: "Makes Unignore thread and Unwatch buttons more visible.",
  enabledByDefault: false,
  run({ document: document2 }) {
    const applyStyles = () => document2.querySelectorAll("a.tic-button, a.tic--button, a.button--link").forEach((element) => {
      Object.assign(element.style, { backgroundColor: "", borderColor: "", borderLeftWidth: "", borderLeftStyle: "" });
      if (["Unignore thread", "Unwatch"].includes(element.textContent.trim())) {
        Object.assign(element.style, { backgroundColor: "rgba(220, 53, 69, 0.3)", borderColor: "#dc3545", borderLeftWidth: "1px", borderLeftStyle: "solid" });
      }
    });
    let timer;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(applyStyles, 0);
    };
    applyStyles();
    new MutationObserver(schedule).observe(document2.body, { childList: true, subtree: true, characterData: true });
  }
};

// src/modular-userscript/modules/highlight-watched-threads.js
var highlight_watched_threads_default = {
  key: "styleWatchIcons",
  type: "style",
  title: "Highlight Watched Threads On Latest Updates Page",
  description: "Makes watched threads more obvious on the latest updates page.",
  enabledByDefault: false,
  run({ document: document2 }) {
    const applyStyles = () => {
      document2.querySelectorAll(".fa-eye").forEach((icon) => Object.assign(icon.style, {
        color: "rgb(186, 69, 69)",
        opacity: "1",
        top: "2px",
        right: "5px",
        fontSize: "20px"
      }));
      document2.querySelectorAll(".resource-tile_thumb").forEach((tile) => {
        if (tile.querySelector("i.far.fa-eye.watch-icon")) tile.style.boxShadow = "inset 0 0 0 9999px rgba(149, 4, 4, 0.6)";
      });
    };
    const attach = () => {
      const scope = document2.querySelector("#latest-page_items-wrap");
      if (!scope) return false;
      new MutationObserver(applyStyles).observe(scope, { childList: true, subtree: true, attributes: true, characterData: true });
      return true;
    };
    applyStyles();
    if (!attach()) {
      const retry = new MutationObserver(() => {
        if (attach()) retry.disconnect();
      });
      retry.observe(document2.body, { childList: true, subtree: true });
    }
  }
};

// src/modular-userscript/modules/instant-ignore.js
var instant_ignore_default = {
  key: "ignoreEnabled",
  type: "function",
  title: "Instant Ignore",
  description: "Instantly ignores threads and redirects back to the ignored thread.",
  enabledByDefault: false,
  run({ document: document2 }) {
    document2.addEventListener("click", (event) => {
      const button = event.target?.closest?.("a.tic-button, a.tic--button");
      if (button?.textContent?.trim() !== "Ignore thread") return;
      event.preventDefault();
      const url = new URL(button.href, location.href);
      const contentId = url.searchParams.get("content_id");
      const contentType = url.searchParams.get("content_type");
      const token = document2.documentElement.getAttribute("data-csrf");
      if (!contentId || !contentType || !token) return;
      const form = document2.createElement("form");
      form.method = "POST";
      form.action = "/misc/tic-ignore";
      for (const [name, value] of Object.entries({
        is_confirmed: "1",
        content_type: contentType,
        redirect: `/threads/${contentId}`,
        content_id: contentId,
        _xfToken: token
      })) {
        const input = document2.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.append(input);
      }
      document2.body.append(form);
      form.submit();
    });
  }
};

// src/modular-userscript/modules/masked-link-skipper.js
var masked_link_skipper_default = {
  key: "maskedLinkSkipperEnabled",
  type: "function",
  title: "Masked Link Skipper",
  description: "Automatically presses the continue button when downloading a game.",
  enabledByDefault: false,
  run({ document: document2, isDownloadPage }) {
    if (!isDownloadPage) return;
    const submitted = /* @__PURE__ */ new WeakSet();
    const pending = /* @__PURE__ */ new WeakSet();
    const submitForms = () => document2.querySelectorAll("form.f95dl-box").forEach((form) => {
      if (submitted.has(form) || pending.has(form)) return;
      pending.add(form);
      const delay = document2.querySelector(".blockMessage.blockMessage--error.blockMessage--iconic") ? 3e3 : 2300;
      window.setTimeout(() => {
        pending.delete(form);
        submitted.add(form);
        form.submit();
      }, delay);
    });
    submitForms();
    new MutationObserver(submitForms).observe(document2.body, { childList: true, subtree: true });
  }
};

// src/modular-userscript/modules/plus-one-blocker.js
var plus_one_blocker_default = {
  key: "plusOneEnabled",
  type: "function",
  title: "+1 Blocker",
  description: "Blocks those annoying +1 replies.",
  enabledByDefault: false,
  run({ document: document2, isThreadPage }) {
    if (!isThreadPage) return;
    const regex = /^[+\uFE62]?\d+$/;
    const clean = () => document2.querySelectorAll(".message").forEach((post) => {
      const body = post.querySelector(".bbWrapper");
      if (body && regex.test(body.textContent.trim())) post.remove();
    });
    clean();
    new MutationObserver(clean).observe(document2.body, { childList: true, subtree: true });
  }
};

// src/modular-userscript/modules/index.js
var modules_default = [
  highlight_buttons_default,
  highlight_watched_threads_default,
  instant_ignore_default,
  masked_link_skipper_default,
  plus_one_blocker_default
];

// src/modular-userscript/dialog-assets.js
var dialogHtml = '<form method="dialog" class="modular-userscript">\n  <div class="modular-userscript-body">\n    <header class="modular-userscript-header">\n      <p class="modular-userscript-intro">{{INTRO}}</p>\n      <h2>F95Zone Toolbox</h2>\n      <p>Choose which modules should be active. Changes are saved immediately and applied upon reload.</p>\n    </header>\n    {{SECTIONS}}\n  </div>\n  <footer class="modular-userscript-footer">\n    <small>Open this menu again from the userscript manager menu.</small>\n    <button type="submit" value="apply" class="button">Apply</button>\n  </footer>\n</form>\n';
var dialogCss = ".modular-userscript-dialog {\n  --dialog-background: #25262a;\n  --dialog-border: #505459;\n  --dialog-text: #ffffff;\n  --dialog-muted: #8c939b;\n  --dialog-accent: #ed5456;\n  --dialog-surface: #37383a;\n  max-width: min(92vw, 800px);\n  width: fit-content;\n  border: 1px solid var(--dialog-border);\n  border-radius: 7px;\n  padding: 0;\n  overflow: hidden;\n  color: var(--dialog-text);\n  background: var(--dialog-background);\n  box-shadow: 0 16px 40px rgba(31, 35, 40, .18);\n}\n\n.modular-userscript-dialog::backdrop {\n  background: rgba(31, 35, 40, .32);\n}\n\n.modular-userscript {\n  font: 14px/1.45 system-ui, sans-serif;\n  color: var(--dialog-text);\n}\n\n.modular-userscript-body {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 14px;\n  padding: 18px;\n}\n\n.modular-userscript-header {\n  grid-column: 1 / -1;\n}\n\n.modular-userscript h2 {\n  margin: 0 0 4px;\n  color: var(--dialog-text);\n}\n\n.modular-userscript p {\n  margin: 4px 0;\n}\n\n.modular-userscript-intro {\n  color: var(--dialog-accent);\n  text-transform: uppercase;\n  font-size: 12px;\n  font-weight: bold;\n}\n\n.modular-userscript-section {\n  display: grid;\n  gap: 10px;\n  align-content: start;\n}\n\n.modular-userscript-section h3 {\n  margin: 0;\n  color: var(--dialog-muted);\n  font-size: 12px;\n  text-transform: uppercase;\n}\n\n.modular-userscript-module {\n  display: flex;\n  gap: 10px;\n  align-items: center;\n  width: 340px;\n  padding: 12px 14px;\n  border: 1px solid var(--dialog-border);\n  border-radius: 8px;\n  background: var(--dialog-surface);\n}\n\n.modular-userscript-module span {\n  display: grid;\n  gap: 2px;\n}\n\n.modular-userscript-module small,\n.modular-userscript-footer small {\n  color: var(--dialog-muted);\n}\n\n.modular-userscript-footer {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 16px;\n  border-top: 1px solid var(--dialog-border);\n  background: var(--dialog-surface);\n}\n\n.modular-userscript button {\n  border: 1px solid var(--dialog-accent);\n  border-radius: 6px;\n  padding: 0px 12px;\n  color: #ffffff;\n  background: var(--dialog-accent);\n  cursor: pointer;\n}\n\n@media (max-width: 860px) {\n  .modular-userscript-body {\n    grid-template-columns: 1fr;\n  }\n\n  .modular-userscript-module {\n    width: auto;\n  }\n}\n\n";

// src/modular-userscript/index.user.js
var SCRIPT_NAME = "F95Zone-Toolbox";
var VERSION = "3.0.0";
var STORAGE_PREFIX = "f95zone-toolbox";
var STORAGE_KEYS = {
  lastSeenVersion: `${STORAGE_PREFIX}:last-seen-version`
};
var storage = {
  async get(key, fallback) {
    let get = null;
    if (typeof GM_getValue === "function") {
      get = (name, value2) => Promise.resolve(GM_getValue(name, value2));
    } else if (typeof GM !== "undefined" && typeof GM.getValue === "function") {
      get = GM.getValue.bind(GM);
    }
    if (get)
      return get(key, fallback);
    const value = localStorage.getItem(key);
    if (value === null)
      return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  async set(key, value) {
    let set = null;
    if (typeof GM_setValue === "function") {
      set = (name, storedValue) => Promise.resolve(GM_setValue(name, storedValue));
    } else if (typeof GM !== "undefined" && typeof GM.setValue === "function") {
      set = GM.setValue.bind(GM);
    }
    if (set)
      return set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  }
};
function getContext() {
  return {
    document,
    window,
    location,
    isThreadPage: /\/threads\//.test(location.pathname),
    isDownloadPage: /\/dl\//.test(location.pathname)
  };
}
async function loadModuleState() {
  return Object.fromEntries(await Promise.all(modules_default.map(async (module) => {
    const key = `${STORAGE_PREFIX}:${module.key}`;
    return [module.key, Boolean(await storage.get(key, module.enabledByDefault))];
  })));
}
function createDialog(state) {
  const existing = document.getElementById("modular-userscript-dialog");
  if (existing)
    return existing;
  const dialog = document.createElement("dialog");
  dialog.id = "modular-userscript-dialog";
  dialog.className = "modular-userscript-dialog";
  const style = document.createElement("style");
  style.textContent = dialogCss;
  document.head.append(style);
  const sections = ["function", "style"].map((type) => `
    <section class="modular-userscript-section">
      <h3>${type} modules</h3>
      ${modules_default.filter((module) => module.type === type).map((module) => `
        <label class="modular-userscript-module">
          <input type="checkbox" name="${module.key}" ${state.values[module.key] ? "checked" : ""}>
          <i aria-hidden="true"></i>
          <span class="modular-userscript-module-copy">
            <strong>${module.title}</strong>
            <span>${module.description}</span>
          </span>
        </label>
      `).join("")}
    </section>
  `).join("");
  let intro = "";
  if (state.mode === "update") {
    intro = `New Version: ${VERSION}!`;
  } else if (state.mode === "install") {
    intro = `Welcome to ${SCRIPT_NAME}!`;
  }
  dialog.innerHTML = dialogHtml.replace("{{INTRO}}", intro).replace("{{SECTIONS}}", sections);
  dialog.addEventListener("close", async () => {
    if (dialog.returnValue !== "apply")
      return;
    await Promise.all(modules_default.map(async (module) => {
      const enabled = dialog.querySelector(`[name="${module.key}"]`).checked;
      state.values[module.key] = enabled;
      await storage.set(`${STORAGE_PREFIX}:${module.key}`, enabled);
    }));
    await storage.set(STORAGE_KEYS.lastSeenVersion, VERSION);
    location.reload();
  });
  document.body.append(dialog);
  return dialog;
}
async function openDialog(force = false) {
  const lastSeenVersion = await storage.get(STORAGE_KEYS.lastSeenVersion, "");
  if (!force && lastSeenVersion === VERSION)
    return;
  const values = await loadModuleState();
  createDialog({
    values,
    mode: lastSeenVersion ? "update" : "install"
  }).showModal();
}
async function main() {
  const values = await loadModuleState();
  const context = getContext();
  modules_default.forEach((module) => {
    if (values[module.key])
      module.run(context);
  });
  let register = null;
  if (typeof GM_registerMenuCommand === "function") {
    register = GM_registerMenuCommand;
  } else if (typeof GM !== "undefined" && typeof GM.registerMenuCommand === "function") {
    register = GM.registerMenuCommand.bind(GM);
  }
  register?.(`${SCRIPT_NAME}: Open config`, () => void openDialog(true));
  await openDialog();
  await storage.set(STORAGE_KEYS.lastSeenVersion, VERSION);
}
void (() => main())();
