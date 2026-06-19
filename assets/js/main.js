// ── Navigation toggle ──────────────────────────────────────────
function toggleNav(btn) {
  const links = document.getElementById('nav-links');
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}

// Close nav when a link is clicked
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.getElementById('nav-links').classList.remove('open');
      const btn = document.querySelector('.nav-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
});
