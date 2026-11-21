/* ---------- 블로그(iframe) 삽입: 높이·보이는 범위 주고받기 (antenna-types 규약) ---------- */
(function(){
  if (window.self === window.top) return;
  var last = 0, on = false;
  function send(force){
    if (!on) return;
    var h = Math.ceil(document.body.getBoundingClientRect().height);
    if (!force && Math.abs(h - last) < 2) return;
    last = h;
    try { window.parent.postMessage({type: 'antenna-types:height', height: h}, '*'); } catch(e){}
  }
  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'antenna-types:ping'){
      var first = !on;
      if (!on){ on = true; window.__embedOn = true; document.documentElement.classList.add('embedded'); }
      send(true);
      if (first) setTimeout(jumpHash, 200);
    } else if (d.type === 'antenna-types:viewport'){
      window.__embedView = {top: +d.top || 0, height: +d.height || 0};
    }
  });
  if ('ResizeObserver' in window) new ResizeObserver(function(){ send(false); }).observe(document.body);
  window.addEventListener('load', function(){ send(true); });
  /* 목차 링크(#s5 등): 블로그 화면을 그 자리로 옮김 */
  function scrollToEl(el){
    var v = window.__embedView, H = v && v.height ? v.height : 800;
    var y = el.getBoundingClientRect().top + window.scrollY - 70 + H / 2;
    try { window.parent.postMessage({type: 'antenna-types:scrollto', y: y, smooth: true}, '*'); } catch(e){}
  }
  function jumpHash(){
    var t = location.hash && document.getElementById(location.hash.slice(1));
    if (t) scrollToEl(t);
  }
  document.addEventListener('click', function(e){
    if (!window.__embedOn) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault(); scrollToEl(t);
  });
})();

(function(){
  'use strict';

  /* ---------- 목차로 버튼: 목차 상자가 화면 밖으로 나가면 나타남 ---------- */
  var fab = document.getElementById('tocFab'), tocBox = document.getElementById('toc');
  var tocVisible = true;
  function updFab(){ if (fab) fab.classList.toggle('show', !tocVisible && window.scrollY > 400); }
  if ('IntersectionObserver' in window && tocBox) {
    new IntersectionObserver(function(es){ tocVisible = es[0].isIntersecting; updFab(); }).observe(tocBox);
  }
  window.addEventListener('scroll', updFab, {passive: true});

  /* ---------- 넷 구조도: 시기별 보기 ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function(box){
    var btns = box.querySelectorAll('.tabbar .btn'), panes = box.querySelectorAll('[data-pane]'),
        st = box.querySelector('.tabbar .status');
    function show(k){
      btns.forEach(function(b){
        var on = b.getAttribute('data-k') === k;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on && st) st.textContent = '표시 중: ' + b.getAttribute('data-name');
      });
      panes.forEach(function(p){ p.hidden = p.getAttribute('data-pane') !== k; });
    }
    btns.forEach(function(b){ b.addEventListener('click', function(){ show(b.getAttribute('data-k')); }); });
    show(btns[0].getAttribute('data-k'));
  });
})();
