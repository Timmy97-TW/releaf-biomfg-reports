/* Hover tooltips for any element carrying data-tip. No dependencies. */
(function () {
  'use strict';
  var tip = document.createElement('div');
  tip.id = 'viztip';
  tip.setAttribute('role', 'status');
  document.body.appendChild(tip);

  var current = null;

  function show(el, x, y) {
    if (el !== current) {
      tip.innerHTML = el.getAttribute('data-tip');
      current = el;
    }
    tip.classList.add('on');
    var r = tip.getBoundingClientRect();
    var left = x + 14, top = y - r.height - 12;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (left < 8) left = 8;
    if (top < 8) top = y + 18;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hide() { tip.classList.remove('on'); current = null; }

  document.addEventListener('mousemove', function (e) {
    var el = e.target.closest ? e.target.closest('[data-tip]') : null;
    if (el) show(el, e.clientX, e.clientY); else hide();
  }, { passive: true });

  document.addEventListener('mouseleave', hide, true);
  window.addEventListener('scroll', hide, { passive: true });

  /* keyboard: a focusable mark shows its tip too */
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest ? e.target.closest('[data-tip]') : null;
    if (!el) return hide();
    var b = el.getBoundingClientRect();
    show(el, b.left + b.width / 2, b.top + b.height / 2);
  });
  document.addEventListener('focusout', hide);
})();
