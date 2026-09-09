/*!
 * MIC アクセス計測 v2  (2026-09-09)
 * - 永続的な訪問者ID(Cookie/localStorage)は使わない
 * - セッションIDは sessionStorage のみ。30分無操作で切り替え
 * - リファラは外部=ホスト名のみ / 内部=パスのみ に切り詰めて送信
 * - クエリ文字列は utm_source / utm_medium / utm_campaign のみ読み取る
 */
(function () {
  'use strict';
  try {
    if (navigator.webdriver) { return; }

    var API = 'https://script.google.com/macros/s/AKfycbwIcx4poYMx4xx9LqFLpkMC98B5UfPr03YnRmTVQM39-4ZUFvoZgUrb3U8hjVd2Zu49lQ/exec';

    var K_OFF     = 'mic_analytics_off';
    var K_SID     = 'mic_sid';
    var K_SEEN    = 'mic_seen';
    var K_LAST    = 'mic_last';
    var K_UTM     = 'mic_utm';
    var K_ENGAGED = 'mic_engaged';
    var IDLE_MS   = 30 * 60 * 1000;

    function now() { return Date.now(); }
    function sGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function sSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

    /* ---- 自分のアクセス除外 ---------------------------------------- */
    var qs;
    try { qs = new URLSearchParams(location.search); } catch (e) { qs = null; }
    if (qs) {
      if (qs.get('mic_noanalytics') === '1') { try { localStorage.setItem(K_OFF, '1'); } catch (e) {} }
      if (qs.get('mic_noanalytics') === '0') { try { localStorage.removeItem(K_OFF); } catch (e) {} }
    }
    try { if (localStorage.getItem(K_OFF) === '1') { return; } } catch (e) {}

    /* ---- セッション（30分無操作で新しいIDへ） ---------------------- */
    var last = parseInt(sGet(K_LAST) || '0', 10);
    var sid  = sGet(K_SID);
    if (!sid || !last || (now() - last) > IDLE_MS) {
      sid = Math.random().toString(36).slice(2) + now().toString(36);
      sSet(K_SID, sid);
      sSet(K_SEEN, '');
      sSet(K_UTM, '');
      sSet(K_ENGAGED, '');
    }
    sSet(K_LAST, String(now()));
    var isFirstPv = !sGet(K_SEEN);

    /* ---- UTM（セッション最初に受け取ったものを保持） ---------------- */
    var utm = { s: '', m: '', c: '', t: '' };
    var qsSource = qs ? (qs.get('utm_source') || '') : '';
    if (qsSource) {
      utm = {
        s: qsSource,
        m: (qs.get('utm_medium') || ''),
        c: (qs.get('utm_campaign') || ''),
        t: (qs.get('utm_content') || '')
      };
      sSet(K_UTM, JSON.stringify(utm));
    } else {
      try { var stored = sGet(K_UTM); if (stored) { utm = JSON.parse(stored); } } catch (e) {}
    }

    /* ---- リファラの最小化 ------------------------------------------ */
    function trimRef(ref) {
      if (!ref) { return ''; }
      try {
        var u = new URL(ref);
        if (u.hostname === location.hostname) { return u.pathname; }
        return u.hostname;
      } catch (e) { return ''; }
    }

    /* ---- 端末区分（生の画面幅は送らない） -------------------------- */
    function deviceClass() {
      var w = window.innerWidth || (screen && screen.width) || 0;
      if (w && w < 768)  { return 'mobile'; }
      if (w && w < 1024) { return 'tablet'; }
      return 'desktop';
    }

    /* ---- 送信 ------------------------------------------------------ */
    function send(params) {
      var url;
      try {
        var parts = [];
        for (var k in params) {
          if (!Object.prototype.hasOwnProperty.call(params, k)) { continue; }
          var v = params[k];
          if (v === null || v === undefined) { v = ''; }
          parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
        }
        url = API + '?' + parts.join('&');
      } catch (e) { return; }

      try {
        if (window.fetch) {
          fetch(url, { mode: 'no-cors', keepalive: true })['catch'](function () {});
          return;
        }
      } catch (e) {}
      try { new Image().src = url; } catch (e) {}
    }

    /* ---- ページビュー ---------------------------------------------- */
    send({
      a:  'hit',
      p:  location.pathname.slice(0, 200),
      h:  location.hash.slice(0, 60),
      r:  trimRef(document.referrer).slice(0, 120),
      s:  deviceClass(),
      l:  (navigator.language || '').slice(0, 20),
      v:  sid,
      n:  isFirstPv ? '1' : '',
      us: String(utm.s || '').slice(0, 40),
      um: String(utm.m || '').slice(0, 40),
      uc: String(utm.c || '').slice(0, 60),
      uct: String(utm.t || '').slice(0, 60)
    });
    sSet(K_SEEN, '1');

    /* ---- 有効セッション判定（5秒以上表示 or 何らかの操作） ---------- */
    var engaged   = sGet(K_ENGAGED) === '1';
    var visibleMs = 0;
    var tickFrom  = (document.visibilityState === 'visible') ? now() : 0;
    var timer     = null;

    function markEngaged() {
      if (engaged) { return; }
      engaged = true;
      sSet(K_ENGAGED, '1');
      if (timer) { clearInterval(timer); timer = null; }
      send({ a: 'ev', p: location.pathname.slice(0, 200), v: sid, e: 'engaged' });
    }

    function accumulate() {
      if (engaged) { return; }
      if (document.visibilityState === 'visible' && tickFrom) {
        visibleMs += now() - tickFrom;
        tickFrom = now();
        if (visibleMs >= 5000) { markEngaged(); }
      }
    }

    if (!engaged) {
      timer = setInterval(accumulate, 1000);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') { tickFrom = now(); }
        else { accumulate(); tickFrom = 0; }
      });
      ['scroll', 'click', 'keydown', 'touchstart'].forEach(function (t) {
        try { window.addEventListener(t, markEngaged, { once: true, passive: true }); }
        catch (e) { window.addEventListener(t, markEngaged, true); }
      });
    }

    /* ---- 外部リンク（CTA）のクリック ------------------------------- */
    document.addEventListener('click', function (ev) {
      try {
        var el = ev.target;
        var a  = (el && el.closest) ? el.closest('a[href]') : null;
        if (!a) { return; }

        var href = a.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#') { return; }

        var u;
        try { u = new URL(href, location.href); } catch (e) { return; }

        var name = '';
        var detail = '';

        if (u.protocol === 'mailto:') {
          name = 'cta_mail';
        } else if (u.protocol === 'tel:') {
          name = 'cta_tel';
        } else if (u.hostname && u.hostname !== location.hostname) {
          detail = u.hostname;
          if (/(^|\.)line\.me$|(^|\.)lin\.ee$/.test(u.hostname))            { name = 'cta_line'; }
          else if (/(^|\.)docs\.google\.com$|(^|\.)forms\.gle$/.test(u.hostname)) { name = 'cta_form'; }
          else if (/(^|\.)instagram\.com$/.test(u.hostname))                { name = 'cta_instagram'; }
          else if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) { name = 'cta_youtube'; }
          else { name = 'cta_other'; }
        } else {
          return;
        }

        send({
          a: 'ev',
          p: location.pathname.slice(0, 200),
          v: sid,
          e: name,
          ed: detail.slice(0, 60)
        });
      } catch (e) {}
    }, true);

  } catch (e) { /* 計測の失敗はページ表示に影響させない */ }
})();
