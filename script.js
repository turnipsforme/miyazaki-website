/* Pinned age marker — vanilla JS, no dependencies.
   Interpolates Miyazaki's age from the timeline events as you scroll,
   and eases the displayed number so it ticks up satisfyingly. */
(function () {
  'use strict';

  var BORN = 1941 + 4 / 365; // born Jan 5, 1941
  var marker = document.getElementById('age-marker');
  var ageEl = document.getElementById('am-age');
  var yearEl = document.getElementById('am-year');
  if (!marker || !ageEl) return;

  var points = [];        // [{y, year}] sorted by y
  var dispAge = null;     // eased displayed age
  var lastShownAge = '';
  var lastShownYear = '';
  var started = false;

  function collect() {
    points.length = 0;
    var events = document.querySelectorAll('.event');
    var scrollY = window.scrollY;
    events.forEach(function (el) {
      var t = el.querySelector('time[datetime]');
      if (!t) return;
      var y = parseInt(t.getAttribute('datetime').slice(0, 4), 10);
      if (isNaN(y)) return;
      var top = el.getBoundingClientRect().top + scrollY;
      if (!points.length || top > points[points.length - 1].y + 8) {
        points.push({ y: top, year: y });
      }
    });
  }

  function targetAt(centerY) {
    if (!points.length) return null;
    /* never extrapolate before the first event — hold at it instead */
    if (centerY <= points[0].y) {
      return { year: points[0].year };
    }
    var last = points[points.length - 1];
    if (centerY >= last.y) {
      return { year: last.year + (centerY - last.y) / 600 };
    }
    for (var i = 1; i < points.length; i++) {
      var a = points[i - 1], b = points[i];
      if (centerY <= b.y) {
        var f = (centerY - a.y) / Math.max(1, b.y - a.y);
        return { year: a.year + f * (b.year - a.year) };
      }
    }
    return { year: last.year };
  }

  function frame() {
    if (!points.length) return;
    var center = window.scrollY + window.innerHeight * 0.45;
    var t = targetAt(center);
    if (t === null) return;

    /* only show the marker once the reader reaches the first event */
    var atFirst = center >= points[0].y - 40;
    marker.classList.toggle('is-visible', atFirst);
    if (!atFirst) return;

    var targetAge = t.year - BORN;
    if (dispAge === null) dispAge = targetAge;
    dispAge += (targetAge - dispAge) * 0.18; // ease toward scroll position
    if (Math.abs(targetAge - dispAge) < 0.002) dispAge = targetAge;

    var a = Math.floor(dispAge).toString();
    if (a !== lastShownAge) { ageEl.textContent = a; lastShownAge = a; }
    var yr = Math.floor(t.year).toString();
    if (yr !== lastShownYear && yr.length === 4) { yearEl.textContent = yr; lastShownYear = yr; }

    requestAnimationFrame(frame);
  }

  function start() {
    if (started) return;
    started = true;
    collect();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', collect);
  window.addEventListener('load', collect);
  document.addEventListener('DOMContentLoaded', collect);
  // lazy-loaded images shift layout — re-measure when the document resizes
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { collect(); });
    ro.observe(document.body);
  }
  start();
})();
