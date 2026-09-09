/* MIC アクセス計測ビーコン
   Cookie を使わず、IP・User-Agent も送らない。
   セッションIDは sessionStorage（タブを閉じると消える）。
   ?mic_noanalytics=1 を一度開くと、そのブラウザでは以後計測しない。 */
(function () {
  'use strict';
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwIcx4poYMx4xx9LqFLpkMC98B5UfPr03YnRmTVQM39-4ZUFvoZgUrb3U8hjVd2Zu49lQ/exec';

  try {
    // 自動化ブラウザ（クローラ・テスト）は数えない
    if (navigator.webdriver) return;

    // 自分自身を数えないための除外スイッチ
    var OPT_OUT = 'mic_analytics_off';
    if (location.search.indexOf('mic_noanalytics=1') !== -1) {
      try { localStorage.setItem(OPT_OUT, '1'); } catch (e) {}
    }
    if (location.search.indexOf('mic_noanalytics=0') !== -1) {
      try { localStorage.removeItem(OPT_OUT); } catch (e) {}
    }
    try { if (localStorage.getItem(OPT_OUT) === '1') return; } catch (e) {}

    // タブ単位の使い捨てID
    var SID = 'mic_sid';
    var sid = '';
    try {
      sid = sessionStorage.getItem(SID) || '';
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(SID, sid);
      }
    } catch (e) {}

    var q = '?a=hit'
      + '&p=' + encodeURIComponent(location.pathname)
      + '&h=' + encodeURIComponent((location.hash || '').slice(0, 40))
      + '&r=' + encodeURIComponent(document.referrer || '')
      + '&s=' + encodeURIComponent(String(window.innerWidth || ''))
      + '&l=' + encodeURIComponent(navigator.language || '')
      + '&v=' + encodeURIComponent(sid);

    var url = ENDPOINT + q;

    if (window.fetch) {
      fetch(url, { mode: 'no-cors', keepalive: true }).catch(function () {});
    } else {
      new Image().src = url;
    }
  } catch (e) {
    // 計測の失敗はサイトの表示に一切影響させない
  }
})();
