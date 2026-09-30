// Theme: respects OS preference until the user picks one, then persists.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('kk-theme'); } catch (e) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  function label() {
    var t = document.documentElement.getAttribute('data-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return t === 'dark' ? 'light' : 'dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    btn.textContent = label();
    btn.addEventListener('click', function () {
      var next = label();
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('kk-theme', next); } catch (e) {}
      btn.textContent = label();
    });
  });
})();

window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
};
