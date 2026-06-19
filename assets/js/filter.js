// ── Works page: client-side filtering & sorting ────────────────
(function () {
  'use strict';

  let activeType    = 'all';
  let activeSubject = 'all';
  let sortOrder     = 'newest';   // 'newest' | 'oldest'

  const grid       = document.getElementById('works-grid');
  const noResults  = document.getElementById('no-results');
  const statusEl   = document.getElementById('filter-status');

  if (!grid) return;

  // ── Apply current filters ──────────────────────────────────
  function applyFilters() {
    const cards = Array.from(grid.querySelectorAll('.work-card-full'));

    let visible = 0;

    cards.forEach(function (card) {
      const cardType     = card.dataset.type || 'article';
      const cardSubjects = (card.dataset.subjects || '').split(',').filter(Boolean);

      const typeMatch    = activeType    === 'all' || cardType === activeType;
      const subjectMatch = activeSubject === 'all' || cardSubjects.includes(activeSubject);

      const show = typeMatch && subjectMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Sort visible cards
    const visibleCards = cards.filter(c => c.style.display !== 'none');
    visibleCards.sort(function (a, b) {
      const da = parseInt(a.dataset.date, 10);
      const db = parseInt(b.dataset.date, 10);
      return sortOrder === 'newest' ? db - da : da - db;
    });
    visibleCards.forEach(function (card) { grid.appendChild(card); });

    // Update status
    if (statusEl) {
      const total = cards.length;
      if (activeType === 'all' && activeSubject === 'all') {
        statusEl.textContent = total + ' work' + (total !== 1 ? 's' : '');
      } else {
        statusEl.textContent = 'Showing ' + visible + ' of ' + total;
      }
    }

    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  // ── Button click handler ───────────────────────────────────
  document.querySelectorAll('.filter-btn[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filterGroup = btn.dataset.filter;
      const value       = btn.dataset.value;

      // Update active state for buttons in the same group
      document.querySelectorAll('.filter-btn[data-filter="' + filterGroup + '"]')
        .forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      if (filterGroup === 'type')    activeType    = value;
      if (filterGroup === 'subject') activeSubject = value;

      applyFilters();
    });
  });

  // Sort buttons
  var sortNewest = document.getElementById('sort-newest');
  var sortOldest = document.getElementById('sort-oldest');

  if (sortNewest) {
    sortNewest.addEventListener('click', function () {
      sortOrder = 'newest';
      sortNewest.classList.add('active');
      if (sortOldest) sortOldest.classList.remove('active');
      applyFilters();
    });
  }
  if (sortOldest) {
    sortOldest.addEventListener('click', function () {
      sortOrder = 'oldest';
      sortOldest.classList.add('active');
      if (sortNewest) sortNewest.classList.remove('active');
      applyFilters();
    });
  }

  // ── URL param pre-filtering ────────────────────────────────
  // Allows linking like /works.html?type=video or ?subject=firmware
  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const type    = params.get('type');
    const subject = params.get('subject');

    if (type) {
      var btn = document.querySelector('.filter-btn[data-filter="type"][data-value="' + type + '"]');
      if (btn) btn.click();
    }
    if (subject) {
      var sbtn = document.querySelector('.filter-btn[data-filter="subject"][data-value="' + subject + '"]');
      if (sbtn) sbtn.click();
    }
  }

  // ── Reset ──────────────────────────────────────────────────
  window.resetFilters = function () {
    activeType    = 'all';
    activeSubject = 'all';
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.remove('active');
      if (b.dataset.value === 'all') b.classList.add('active');
    });
    applyFilters();
  };

  // ── Init ───────────────────────────────────────────────────
  applyFilters();
  applyUrlParams();

})();
