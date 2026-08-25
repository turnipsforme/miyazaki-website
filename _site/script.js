/* Year index scrollspy + mobile strip label — vanilla JS, no dependencies.
   The active entry is whichever chronology event occupies the reading zone
   (upper-middle of the viewport), determined by IntersectionObserver rather
   than per-frame inspection. State is exposed via aria-current, never by
   colour alone. */
(function () {
  'use strict';

  var events = Array.prototype.slice.call(document.querySelectorAll('.event[data-year]'));
  var indexLinks = Array.prototype.slice.call(
    document.querySelectorAll('.year-index a[data-year]'));

  /* link lookup: greatest index year <= the active event's year */
  var years = indexLinks.map(function (a) { return parseInt(a.dataset.year, 10); });

  function linkForYear(y) {
    var best = null;
    for (var i = 0; i < indexLinks.length; i++) {
      if (years[i] <= y && (best === null || years[i] > years[best])) best = i;
    }
    if (best === null) return years.length ? 0 : null;
    return best;
  }

  var currentIdx = -1;

  function setActive(idx) {
    if (idx === currentIdx || idx === null) return;
    currentIdx = idx;
    indexLinks.forEach(function (a, i) {
      var active = i === idx;
      a.classList.toggle('is-active', active);
      a.classList.toggle('is-nearby', !active && Math.abs(i - idx) === 1);
      if (active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    /* mirror state into the mobile strip + panel */
    var yrEl = indexLinks[idx].querySelector('.yi-yr');
    var lbEl = indexLinks[idx].querySelector('.yi-label');
    var mbYear = document.getElementById('mb-year');
    var mbTitle = document.getElementById('mb-title');
    if (mbYear && yrEl) mbYear.textContent = yrEl.textContent;
    if (mbTitle && lbEl) mbTitle.textContent = lbEl.textContent;
    document.querySelectorAll('.mobile-panel a[href^="#"]').forEach(function (a) {
      if (a.getAttribute('href') === indexLinks[idx].getAttribute('href')) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function readingDistance(entry) {
    return Math.abs(entry.boundingClientRect.top - window.innerHeight * 0.35);
  }

  var observer = new IntersectionObserver(function (observedEntries) {
    var visible = observedEntries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return readingDistance(a) - readingDistance(b); });
    if (!visible.length) return;
    var year = parseInt(visible[0].target.dataset.year, 10);
    setActive(linkForYear(year));
  }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });

  events.forEach(function (el) { observer.observe(el); });

  /* initial state: first chapter is active before any intersection fires */
  window.addEventListener('load', function () { setActive(0); });

  /* The visible range is derived from the chronology itself, never
     hard-coded, so the header can never drift out of sync with it. */
  var headerRange = document.querySelector('.sh-range');
  if (headerRange && events.length) {
    var startYear = parseInt(events[0].dataset.year, 10);
    var endYear = parseInt(events[events.length - 1].dataset.year, 10);
    headerRange.innerHTML =
      '<time datetime="' + startYear + '">' + startYear + '</time>' +
      ' \u2014 ' +
      '<time datetime="' + endYear + '">' + endYear + '</time>';
  }
})();

/* Escape closes the mobile index panel. */
(function () {
  var toggle = document.getElementById('mi-toggle');
  var panel = document.getElementById('mi-panel');
  if (!toggle || !panel) return;
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    toggle.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  });
})();

/* Article reading window: one reusable <dialog> + one lazy iframe.
   Without JavaScript the teaser is simply a link to the standalone
   article page, so no fallback markup is needed here. */
(function () {
  var dialog = document.querySelector('#article-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var frame = document.querySelector('#article-frame');
  var title = document.querySelector('#article-dialog-title');
  var closeButton = document.querySelector('.article-dialog-close');
  var lastArticleTrigger = null;

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.article-window');
    if (!trigger) return;

    event.preventDefault();
    lastArticleTrigger = trigger;

    title.textContent = trigger.dataset.articleTitle || 'Article';
    frame.title = trigger.dataset.articleTitle || 'Article';
    frame.src = trigger.dataset.articleUrl || trigger.href;

    dialog.showModal();
  });

  closeButton.addEventListener('click', function () { dialog.close(); });

  /* "← Back to the chronology" inside the article must close this window,
     not load the chronology into the iframe. Same-origin, so the parent can
     intercept it. Registered once on 'load', not per open; the href stays
     intact for standalone pages without JavaScript. */
  function wireArticleReturnLink() {
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (error) {
      return;
    }
    if (!doc) return;

    doc.addEventListener('click', function (event) {
      var returnLink = event.target.closest('.return-link');
      if (!returnLink) return;

      event.preventDefault();
      dialog.close(); /* triggers the shared close handler below */
    });
  }
  frame.addEventListener('load', wireArticleReturnLink);

  /* clicking the backdrop (outside the document window) closes it */
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', function () {
    frame.removeAttribute('src');
    if (lastArticleTrigger) lastArticleTrigger.focus();
  });
})();
