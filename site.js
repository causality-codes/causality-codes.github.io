// Theme: respects OS preference until the user picks one, then persists.
(function () {
  // Opened from disk, some browsers give every file its own localStorage, so there
  // the choice also travels as ?theme= on links between pages.
  var local = location.protocol === 'file:';

  // Apply the stored choice; with none stored, fall back to the OS preference.
  function sync() {
    var q = local && /[?&]theme=(light|dark)\b/.exec(location.search);
    var saved = q && q[1];
    if (!saved) try { saved = localStorage.getItem('kk-theme'); } catch (e) {}
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
    if (local) try { history.replaceState(null, '', '?theme=' + next + location.hash); } catch (e) {}
    var btn = document.querySelector('.theme-btn');
    if (btn) render(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    render(btn);
    btn.addEventListener('click', toggle);
  });

  // Citations: every .cite gets a copy button offering its text or the BibTeX in its hidden <pre>.
  var COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/>' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    // Fallback for pages opened from disk or over plain http.
    return new Promise(function (ok, fail) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var done = document.execCommand('copy');
      ta.remove();
      if (done) ok(); else fail();
    });
  }

  var openMenu = null;
  function closeMenu() { if (openMenu) { openMenu.hidden = true; openMenu = null; } }

  // One copy button; pressing it opens a menu of formats: [[name, getText], ...].
  function copyMenu(formats) {
    var wrap = document.createElement('span');
    wrap.className = 'cite-actions';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy citation');
    btn.setAttribute('aria-haspopup', 'menu');
    btn.innerHTML = COPY_ICON + '<span></span>';
    var menu = document.createElement('span');
    menu.className = 'copy-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'menu');

    formats.forEach(function (f) {
      var item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('role', 'menuitem');
      item.textContent = f[0];
      item.addEventListener('click', function () {
        closeMenu();
        copy(f[1]()).then(function () { return 'copied'; }, function () { return 'failed'; }).then(function (msg) {
          btn.lastChild.textContent = msg;
          setTimeout(function () { btn.lastChild.textContent = ''; }, 1500);
        });
      });
      menu.appendChild(item);
    });

    btn.addEventListener('click', function (e) {
      var wasOpen = openMenu === menu;
      closeMenu();
      if (!wasOpen) { menu.hidden = false; openMenu = menu; }
      e.stopPropagation();
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  document.addEventListener('click', function (e) {
    if (openMenu && !openMenu.contains(e.target)) closeMenu();
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cite').forEach(function (cite) {
      var p = cite.querySelector('p'), bib = cite.querySelector('pre');
      var text = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
      var formats = [];
      if (p) formats.push(['Plain text', function () { return text; }]);
      if (bib) formats.push(['BibTeX', function () { return bib.textContent.trim(); }]);
      // The button sits inline, right after the reference text.
      if (formats.length) (p || cite).appendChild(copyMenu(formats));
    });
  });

  // Keep already-loaded pages in step: other tabs, and pages restored by back/forward.
  window.addEventListener('storage', function (e) { if (e.key === 'kk-theme' || e.key === null) sync(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) sync(); });

  // From disk, hand the choice to the next page through its link.
  if (local) document.addEventListener('click', function (e) {
    var t = document.documentElement.getAttribute('data-theme');
    var a = e.target.closest && e.target.closest('a[href]');
    if (t && a && a.protocol === 'file:' && /\.html$/.test(a.pathname)) a.search = '?theme=' + t;
  }, true);

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
      closeMenu();
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
