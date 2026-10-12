// Theme: respects OS preference until the user picks one, then persists.
(function () {
  // Apply the stored choice; with none stored, fall back to the OS preference.
  function sync() {
    var saved = null;
    try { saved = localStorage.getItem('kk-theme'); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else document.documentElement.removeAttribute('data-theme');
    var btn = document.querySelector('.theme-btn');
    if (btn) render(btn);
  }
  sync();

  function label() {
    var t = document.documentElement.getAttribute('data-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return t === 'dark' ? 'light' : 'dark';
  }

  var ICONS = {
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };

  // Button shows the mode it switches to: moon + "dark", or sun + "light".
  function render(btn) {
    var t = label();
    btn.innerHTML = ICONS[t] + '<span>' + t + '</span>';
  }

  function toggle() {
    var next = label();
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('kk-theme', next); } catch (e) {}
    var btn = document.querySelector('.theme-btn');
    if (btn) render(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    render(btn);
    btn.addEventListener('click', toggle);
  });

  // Keep already-loaded pages in step: other tabs, and pages restored by back/forward.
  window.addEventListener('storage', function (e) { if (e.key === 'kk-theme' || e.key === null) sync(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) sync(); });

  // Keyboard shortcuts: "d" toggles theme, "?" shows the shortcut list, Esc hides it.
  var help = null;

  function buildHelp() {
    help = document.createElement('div');
    help.className = 'kbd-help';
    help.hidden = true;
    help.setAttribute('role', 'dialog');
    help.setAttribute('aria-label', 'Keyboard shortcuts');
    help.innerHTML =
      '<div class="kbd-panel">' +
      '<p class="kbd-title">Keyboard shortcuts</p>' +
      '<dl>' +
      '<dt><kbd>d</kbd></dt><dd>switch light / dark</dd>' +
      '<dt><kbd>?</kbd></dt><dd>show this list</dd>' +
      '</dl></div>';
    help.addEventListener('click', function (e) { if (e.target === help) help.hidden = true; });
    document.body.appendChild(help);
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

    if (e.key === 'Escape') {
      if (help && !help.hidden) help.hidden = true;
    } else if (e.key === '?') {
      if (!help) buildHelp();
      help.hidden = !help.hidden;
      e.preventDefault();
    } else if (e.key === 'd' || e.key === 'D') {
      toggle();
    }
  });
})();

window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};
