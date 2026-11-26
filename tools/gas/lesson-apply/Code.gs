/**
 * MIC-Lesson-Apply-API
 * 一般レッスンの申込フォーム（mogul-mic.com/lesson-apply.html）の受け取り先。
 *
 * mogul.mic@gmail.com の Apps Script に貼り、ウェブアプリとしてデプロイする。
 *   実行するユーザー：自分（mogul.mic@gmail.com）
 *   アクセスできるユーザー：全員
 * デプロイ後の /exec URL を data/api-config.js の lessonApplyApi に入れる。
 *
 * ★ このファイルは公開リポジトリにある。メールアドレス・ID などはここに書かず、
 *   すべてスクリプトプロパティに置く（README.md の手順）。
 *
 * スクリプトプロパティ
 *   SHEET_ID          申込を記録するスプレッドシートの ID（必須）
 *   NOTIFY_EMAILS     申込が来たことを知らせる先。カンマ区切り（必須）
 *   VIDEO_FOLDER_ID   動画を入れる Google ドライブのフォルダ ID（動画を受けるなら必須）
 *   CONSENT_PDF_ID    受付メールに付ける参加同意書 PDF の ID（任意）
 *   SITE_ORIGIN       動画を送るページのオリジン。既定 https://mogul-mic.com
 *   LINE_URL          受付メールに書く公式LINEの URL。既定 https://lin.ee/Q6XCwYg
 *
 * 定員は自動では締めない（2026-11 の決定：フォーム＋手動で管理）。
 * 代わりに、知らせるメールに「この回の申込数」を書く。
 */

var SHEET_NAME = '申込';
var HEADERS = [
  '受付日時', '受付番号', '回の組', '参加者番号',
  '申込者氏名', '電話番号', 'メールアドレス', 'きっかけ',
  '参加者氏名', 'ふりがな', '年齢（学年）', '参加する回',
  'スキー歴', 'ふだん滑っている斜面', 'モーグルの経験',
  '今回やってみたいこと', '不安なこと', 'けが・持病など',
  '加盟団体', 'MICのレッスン参加経験',
  '動画（ファイル名）', '動画（リンク）',
  'どのカードから', 'utm', '状態', 'メモ'
];
var COL = {};
HEADERS.forEach(function (h, i) { COL[h] = i + 1; });

// lesson-apply.html の data/lesson-apply.js と同じ内容にそろえる（id・date・slots・deadline）
// label は申込シートの「参加する回」とメールに書く名前。回ごとの申込数もこの名前で数える。
//   12月の2回は、すでにシートに入っている行と同じ名前のまま（コーチ名なし）にしておく。
//   1月からは、同じ日に2人のコーチの回があっても分かるよう、コーチ名を入れる。
// cap は知らせるメールに出す定員の目安（自動では締めない）。半日ありの回は午前・午後それぞれの人数、
//   1日のみの回はその回の人数。
// fees / slotText があれば、その回だけ料金と「参加する回」に書く枠の名前を変える（体験会）。
//   slotText には、回ごとの申込数を数えるために「午前」「午後」「1日」の文字を必ず入れる
var TRIAL_FEES = { am: 3300, pm: 3300, day: 5500 };
var TRIAL_SLOT_TEXT = { am: '午前（約2時間・時間は後日ご案内）', pm: '午後（約2時間・時間は後日ご案内）', day: '1日（午前・午後）' };
var LESSONS = {
  '20261226': { date: '2026-12-26', label: '12/26（土）', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2026-12-23' },
  '20261227': { date: '2026-12-27', label: '12/27（日）', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2026-12-24' },
  '20270107-watanabe': { date: '2027-01-07', label: '1/7（木）渡辺コーチ', slots: ['day'], cap: 6, deadline: '2027-01-04' },
  '20270108-watanabe': { date: '2027-01-08', label: '1/8（金）渡辺コーチ', slots: ['day'], cap: 6, deadline: '2027-01-04' },
  '20270109-watanabe': { date: '2027-01-09', label: '1/9（土）渡辺コーチ', slots: ['day'], cap: 6, deadline: '2027-01-04' },
  '20270110-watanabe': { date: '2027-01-10', label: '1/10（日）渡辺コーチ', slots: ['day'], cap: 6, deadline: '2027-01-04' },
  '20270111-watanabe': { date: '2027-01-11', label: '1/11（月・祝）渡辺コーチ', slots: ['day'], cap: 6, deadline: '2027-01-04' },
  '20270116-tanaka': { date: '2027-01-16', label: '1/16（土）田中コーチ', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2027-01-13' },
  '20270117-tanaka': { date: '2027-01-17', label: '1/17（日）田中コーチ', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2027-01-14' },
  // 冬休み モーグル体験会（2026-11-26 城さん決定）。コーチなし・時間は申込後に知らせる・料金は fees と BUNDLES。
  // trial の回を選ぶ申込は、checks.trial（小中高生・公認登録なし・ヘルメット）がないと受け付けない
  '20261228-trial': { date: '2026-12-28', label: '12/28（月）体験会', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2026-12-25', group: 'trial', trial: true, fees: TRIAL_FEES, slotText: TRIAL_SLOT_TEXT },
  '20261229-trial': { date: '2026-12-29', label: '12/29（火）体験会', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2026-12-26', group: 'trial', trial: true, fees: TRIAL_FEES, slotText: TRIAL_SLOT_TEXT },
  '20261230-trial': { date: '2026-12-30', label: '12/30（水）体験会', slots: ['am', 'pm', 'day'], cap: 5, deadline: '2026-12-27', group: 'trial', trial: true, fees: TRIAL_FEES, slotText: TRIAL_SLOT_TEXT }
};
var SLOTS = { am: '午前 10:00–12:00', pm: '午後 13:00–15:00', day: '1日（午前・午後）' };
var FEES = { am: 5500, pm: 5500, day: 11000 };
var PARTS = { am: ['am'], pm: ['pm'], day: ['am', 'pm'] };   // 時間の重なりを見るため（1日＝午前＋午後）
// まとめ料金。group の回で「1日」を選んだ日の数が n 日のとき、その n 日分を合わせてこの金額にする（半日は入れない）。
// data/lesson-apply.js の bundles と同じにする
var BUNDLES = { trial: { 2: 10000, 3: 15000 } };

function prop_(k, d) {
  var v = PropertiesService.getScriptProperties().getProperty(k);
  return v ? String(v).trim() : (d || '');
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, service: 'MIC-Lesson-Apply-API' });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, reason: 'invalid' }); }
  try {
    if (body.action === 'apply') return json_(apply_(body));
    if (body.action === 'video_start') return json_(videoStart_(body));
    if (body.action === 'video_done') return json_(videoDone_(body));
    return json_({ ok: false, reason: 'invalid' });
  } catch (err) {
    console.error(err && err.stack || err);
    return json_({ ok: false, reason: 'server_error' });
  }
}

// ---------------------------------------------------------------- 申込
function str_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max || 200); }
function text_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0009\u000b-\u001f]/g, ' ').trim().slice(0, max || 400); }
// スプレッドシートが数式として読まないように（= + - @ で始まる値の先頭に ' を付ける）
function cell_(v) { v = String(v == null ? '' : v); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function isClosed_(id) {
  var l = LESSONS[id];
  if (!l) return true;
  return Date.now() > new Date(l.deadline + 'T23:59:59+09:00').getTime();
}

function apply_(b, opt) {
  opt = opt || {};
  // ロボットよけの欄に何か入っていたら、受け付けたふりをして記録しない
  if (b.hp) return { ok: true, id: 'X', video_token: '' };

  var a = b.applicant || {};
  var app = {
    name: str_(a.name, 40), tel: str_(a.tel, 20), email: str_(a.email, 120), source: str_(a.source, 30)
  };
  var tel = app.tel.replace(/[^\d]/g, '');
  if (!app.name || !/^\d{10,11}$/.test(tel) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) return { ok: false, reason: 'invalid' };
  var c = b.checks || {}, g = b.consents || {};
  if (!c.level || !c.lift || !g.rules || !g.privacy || !g.guardian) return { ok: false, reason: 'invalid' };

  var ps = Array.isArray(b.participants) ? b.participants.slice(0, 4) : [];
  if (!ps.length) return { ok: false, reason: 'invalid' };
  var people = [];
  for (var i = 0; i < ps.length; i++) {
    var p = ps[i] || {};
    var slots = {};
    var raw = p.slots || {};
    for (var id in raw) {
      if (!Object.prototype.hasOwnProperty.call(raw, id)) continue;
      // hasOwnProperty で見る（__proto__ などのキーで Object の中身を引かないように）
      var okLesson = Object.prototype.hasOwnProperty.call(LESSONS, id) && Object.prototype.hasOwnProperty.call(SLOTS, raw[id]);
      if (!okLesson || LESSONS[id].slots.indexOf(raw[id]) < 0) return { ok: false, reason: 'invalid' };
      if (isClosed_(id)) return { ok: false, reason: 'closed' };
      slots[id] = raw[id];
    }
    var q = {
      name: str_(p.name, 40), kana: str_(p.kana, 60), age: str_(p.age, 20), slots: slots,
      ski_years: str_(p.ski_years, 20), slope: str_(p.slope, 20), mogul: str_(p.mogul, 20),
      wish: text_(p.wish), worry: text_(p.worry), health: text_(p.health),
      org: str_(p.org, 60), mic_before: str_(p.mic_before, 10),
      video: p.video && p.video.name ? str_(p.video.name, 120) : ''
    };
    if (!q.name || !q.kana || !q.age || !Object.keys(slots).length || !q.slope || !q.mogul) return { ok: false, reason: 'invalid' };
    if (hasOverlap_(slots)) return { ok: false, reason: 'invalid' };
    // 体験会の回を選んだときは、体験会の条件（小中高生・公認登録なし・ヘルメット）の確認が要る
    if (hasTrial_(slots) && !c.trial) return { ok: false, reason: 'invalid' };
    people.push(q);
  }

  // 同じメールアドレスからの連続送信を抑える（ボタンの二度押し・いたずら）
  var cache = CacheService.getScriptCache();
  var ck = 'apply:' + app.email.toLowerCase();
  var n = Number(cache.get(ck) || 0);
  if (n >= 5) return { ok: false, reason: 'busy' };
  cache.put(ck, String(n + 1), 600);

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return { ok: false, reason: 'busy' };
  var appId, vtoken, counts;
  try {
    var sh = sheet_();
    var now = new Date();
    // 受付日時は、日本時間の文字にしてから書く。Date のまま書くと、セルの書式によっては
    // 別のタイムゾーンの文字になった（2026-11-13 に実際に17時間ずれた）。
    // 書式が日付の列に書くので、シートが日付として読み取る
    var stamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    appId = Utilities.formatDate(now, 'Asia/Tokyo', 'MMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    vtoken = Utilities.getUuid();
    var rows = people.map(function (q, idx) {
      return [
        stamp, appId, str_(b.series, 30), idx + 1,
        app.name, app.tel, app.email, app.source,
        q.name, q.kana, q.age, slotsText_(q.slots),
        q.ski_years, q.slope, q.mogul,
        q.wish, q.worry, q.health, q.org, q.mic_before,
        q.video, '',
        str_(b.from_lesson, 30), str_(b.utm, 120), opt.test ? 'テスト' : '受付', ''
      ].map(function (v) {
        // 参加者番号（数）はそのまま。文字の欄は、数式として読まれないようにする
        return typeof v === 'number' ? v : cell_(v);
      });
    });
    var r0 = sh.getLastRow() + 1, n = rows.length;
    // 書式は列ごとに分けて付ける。文字の列だけ「書式なしテキスト」にして、電話番号の先頭の 0 や、
    // 年齢・加盟団体などが数字や日付に読み替えられるのを防ぐ。
    // ★ 受付日時と参加者番号の列には、書式なしテキストを一度もかけない
    //   （かけてから日付の書式に戻しても、文字のまま入った）
    sh.getRange(r0, COL['受付日時'], n, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');
    sh.getRange(r0, COL['受付番号'], n, 2).setNumberFormat('@');                    // 受付番号・回の組
    sh.getRange(r0, COL['参加者番号'], n, 1).setNumberFormat('0');
    sh.getRange(r0, COL['申込者氏名'], n, HEADERS.length - COL['申込者氏名'] + 1).setNumberFormat('@');
    SpreadsheetApp.flush();   // 書式を先に確定させてから値を書く
    sh.getRange(r0, 1, n, HEADERS.length).setValues(rows);
    counts = countBySlot_(sh);
    // 動画を送るための合言葉。受付番号だけでは送れないようにする（1日で無効）
    if (people.some(function (q) { return q.video; })) cache.put('vt:' + appId, vtoken, 21600);
  } finally {
    lock.releaseLock();
  }

  try { mailApplicant_(appId, app, people); } catch (err) { console.error('applicant mail', err); }
  try { mailNotify_(appId, app, people, counts); } catch (err) { console.error('notify mail', err); }
  return { ok: true, id: appId, video_token: vtoken };
}

// 1人が、同じ日の回で時間の重なる枠を両方選んでいないか
function hasOverlap_(slots) {
  var used = {};
  return Object.keys(slots).some(function (id) {
    return PARTS[slots[id]].some(function (part) {
      var k = LESSONS[id].date + ':' + part;
      if (used[k]) return true;
      used[k] = true;
      return false;
    });
  });
}

function hasTrial_(slots) {
  return Object.keys(slots).some(function (id) { return !!LESSONS[id].trial; });
}

function slotsText_(slots) {
  return Object.keys(slots).sort().map(function (id) {
    var L = LESSONS[id];
    return L.label + ' ' + ((L.slotText && L.slotText[slots[id]]) || SLOTS[slots[id]]);
  }).join('／');
}

function sheet_() {
  var ss = SpreadsheetApp.openById(prop_('SHEET_ID'));
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// 回ごと・時間帯ごとの申込人数（状態が「取消」「テスト」の行は数えない）。
// 半日ありの回は午前・午後に分けて数え、1日はその両方に数える。1日のみの回は、その回の人数を数える。
// 返す値：{ 表示名: { n: 人数, cap: 定員の目安 } }
function countBySlot_(sh) {
  var last = sh.getLastRow();
  var out = {};
  if (last < 2) return out;
  function add(k, cap) { out[k] = out[k] || { n: 0, cap: cap }; out[k].n++; }
  var v = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  v.forEach(function (r) {
    var st = String(r[COL['状態'] - 1]);
    if (st.indexOf('取消') >= 0 || st.indexOf('テスト') >= 0) return;
    String(r[COL['参加する回'] - 1]).split('／').forEach(function (s) {
      Object.keys(LESSONS).forEach(function (id) {
        var L = LESSONS[id], l = L.label;
        if (s.indexOf(l + ' ') !== 0) return;   // 名前のあとの空白まで見る（1/1 と 1/10 などを取り違えない）
        if (L.slots.indexOf('am') < 0) { add(l, L.cap); return; }
        if (s.indexOf('午前') >= 0 || s.indexOf('1日') >= 0) add(l + ' 午前', L.cap);
        if (s.indexOf('午後') >= 0 || s.indexOf('1日') >= 0) add(l + ' 午後', L.cap);
      });
    });
  });
  return out;
}

function feeOfLesson_(L, v) {
  return (L.fees && L.fees[v] != null) ? L.fees[v] : FEES[v];
}

// 1人分の参加費。lesson-apply.html の personFee と同じ計算にする
function personFee_(slots) {
  var sum = 0, dayFees = {};
  Object.keys(slots).forEach(function (id) {
    var L = LESSONS[id], f = feeOfLesson_(L, slots[id]);
    sum += f;
    if (slots[id] === 'day' && L.group && BUNDLES[L.group]) (dayFees[L.group] = dayFees[L.group] || []).push(f);
  });
  Object.keys(dayFees).forEach(function (g) {
    var t = BUNDLES[g][dayFees[g].length];
    if (t != null) { dayFees[g].forEach(function (f) { sum -= f; }); sum += t; }
  });
  return sum;
}

function feeTotal_(people) {
  var sum = 0;
  people.forEach(function (q) { sum += personFee_(q.slots); });
  return sum;
}

function mailApplicant_(appId, app, people) {
  var lines = [];
  lines.push(app.name + ' 様', '');
  lines.push('MIC の雪上レッスンにお申し込みいただき、ありがとうございます。', '次の内容で受け付けました。内容を確認して、こちらからご連絡します。', '');
  lines.push('受付番号：' + appId, '');
  people.forEach(function (q, i) {
    lines.push('■ 参加する人' + (people.length > 1 ? (i + 1) : '') + '：' + q.name + '（' + q.age + '）');
    lines.push('　' + slotsText_(q.slots));
  });
  lines.push('', '参加費の合計：' + feeTotal_(people).toLocaleString() + '円（税込・リフト券は別）');
  lines.push('会場：白馬八方尾根スキー場', '');
  if (people.some(function (q) { return hasTrial_(q.slots); })) {
    lines.push('冬休み モーグル体験会の集合場所と時間は、あらためてご連絡します。当日はヘルメットをお持ちください。', '');
  }
  lines.push('当日の中止・時間変更は、ご入力の電話番号またはこのメールアドレスへご連絡します。');
  lines.push('ご不明な点は、公式LINEからご連絡ください：' + prop_('LINE_URL', 'https://lin.ee/Q6XCwYg'), '');
  lines.push('MIC — Mogul Improvement Community', 'https://mogul-mic.com/');
  var opt = { name: 'MIC（Mogul Improvement Community）' };
  var pdf = prop_('CONSENT_PDF_ID');
  if (pdf) {
    lines.splice(lines.length - 3, 0, '参加同意書を添付しています。ご記入のうえ、レッスン当日、参加費と一緒にお渡しください。', '');
    opt.attachments = [DriveApp.getFileById(pdf).getBlob()];
  }
  MailApp.sendEmail(app.email, '【MIC】雪上レッスンのお申し込みを受け付けました（' + appId + '）', lines.join('\n'), opt);
}

function mailNotify_(appId, app, people, counts) {
  var to = prop_('NOTIFY_EMAILS');
  if (!to) return;
  var lines = ['雪上レッスンに申込がありました。', '', '受付番号：' + appId, '申込者：' + app.name + '／' + app.tel + '／' + app.email, ''];
  people.forEach(function (q, i) {
    lines.push('■ ' + (i + 1) + '. ' + q.name + '（' + q.kana + '・' + q.age + '）');
    lines.push('　回：' + slotsText_(q.slots));
    lines.push('　斜面：' + q.slope + '／モーグル：' + q.mogul + (q.ski_years ? '／スキー歴：' + q.ski_years : ''));
    if (q.health) lines.push('　けが・持病：' + q.health);
    if (q.video) lines.push('　動画：あり（届いたら別のメールで知らせます）');
  });
  lines.push('', '― 回ごとの申込数（この申込を含む・定員の目安）');
  // 回の順（LESSONS の順）に並べる
  var keys = [];
  Object.keys(LESSONS).forEach(function (id) {
    var l = LESSONS[id].label;
    [l, l + ' 午前', l + ' 午後'].forEach(function (k) { if (counts[k]) keys.push(k); });
  });
  keys.forEach(function (k) {
    var c = counts[k];
    lines.push('　' + k + '：' + c.n + '名／' + c.cap + '名' + (c.n >= c.cap ? '  ★' + c.cap + '名に達しました' : ''));
  });
  lines.push('', '申込シート：https://docs.google.com/spreadsheets/d/' + prop_('SHEET_ID') + '/edit');
  MailApp.sendEmail(to, '【MIC申込】雪上レッスン ' + app.name + ' 様（' + appId + '）', lines.join('\n'));
}

// ---------------------------------------------------------------- 動画
function checkToken_(b) {
  var t = CacheService.getScriptCache().get('vt:' + str_(b.id, 20));
  return !!t && t === String(b.video_token || '');
}

function findRow_(sh, appId, idx) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var v = sh.getRange(2, COL['受付番号'], last - 1, 3).getValues();   // 受付番号・回の組・参加者番号
  for (var i = v.length - 1; i >= 0; i--) {
    if (String(v[i][0]) === appId && Number(v[i][2]) === idx + 1) return i + 2;
  }
  return 0;
}

// Drive の再開可能アップロードを始め、ブラウザが直接送る先（セッションURL）を返す
function videoStart_(b) {
  if (!checkToken_(b)) return { ok: false, reason: 'invalid' };
  var folder = prop_('VIDEO_FOLDER_ID');
  if (!folder) return { ok: false, reason: 'server_error' };
  var size = Number(b.size) || 0;
  if (size <= 0 || size > 250 * 1024 * 1024) return { ok: false, reason: 'invalid' };
  var type = /^video\//.test(String(b.type)) ? String(b.type) : 'video/mp4';
  var appId = str_(b.id, 20);
  var name = appId + '_' + (Number(b.idx) + 1) + '_' + str_(b.name, 80).replace(/[\\\/:*?"<>|]/g, '_');
  var r = startSession_(folder, name, type, size);
  if (!r.session) {
    console.error('resumable start', r.code, r.body);
    // 何番で断られたかだけ返す（ブラウザのコンソールで、どの段で止まったか分かるように）
    return { ok: false, reason: 'drive_start_failed', status: r.code };
  }
  return { ok: true, session: r.session };
}

// Drive の再開可能アップロードを始める。{code, session, body} を返す。
// ★ このプロジェクトで「サービス → Drive API」を足しておくこと。無いと 403 で断られる
//   （DriveApp が使えていても、REST の呼び出しは別に有効化が要る）
// ★ 開始時に Origin を付けないと、ブラウザからの PUT が CORS で止まる
function startSession_(folder, name, type, size) {
  var res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': type,
      'X-Upload-Content-Length': String(size),
      Origin: prop_('SITE_ORIGIN', 'https://mogul-mic.com')
    },
    payload: JSON.stringify({ name: name, parents: [folder], mimeType: type }),
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var h = res.getAllHeaders();
  var session = code === 200 ? String(h.Location || h.location || '') : '';
  return { code: code, session: session, body: session ? '' : res.getContentText().slice(0, 500) };
}

function videoDone_(b) {
  if (!checkToken_(b)) return { ok: false, reason: 'invalid' };
  var appId = str_(b.id, 20), idx = Number(b.idx) || 0, fileId = str_(b.file_id, 100);
  var link = fileId ? 'https://drive.google.com/file/d/' + fileId + '/view' : '（ファイルIDなし・フォルダを確認）';
  var sh = sheet_();
  var row = findRow_(sh, appId, idx);
  if (row) sh.getRange(row, COL['動画（リンク）']).setValue(link);
  var to = prop_('NOTIFY_EMAILS');
  if (to) MailApp.sendEmail(to, '【MIC申込】動画が届きました（' + appId + '）', '受付番号 ' + appId + ' の参加者' + (idx + 1) + ' の動画が届きました。\n' + link);
  return { ok: true };
}

// ---------------------------------------------------------------- 設置の確認用
// スクリプトエディタから1回実行する。シートの見出しを作り、プロパティの入れ忘れを知らせる
function checkSetup() {
  ['SHEET_ID', 'NOTIFY_EMAILS', 'VIDEO_FOLDER_ID'].forEach(function (k) {
    console.log(k + '：' + (prop_(k) ? '設定済み' : '★未設定'));
  });
  console.log('CONSENT_PDF_ID：' + (prop_('CONSENT_PDF_ID') ? '設定済み' : '未設定（同意書を添付しない）'));
  var sh = sheet_();
  console.log('申込シート：' + sh.getParent().getName() + ' / ' + sh.getName() + '（' + (sh.getLastRow() - 1) + '件）');
  if (prop_('VIDEO_FOLDER_ID')) console.log('動画フォルダ：' + DriveApp.getFolderById(prop_('VIDEO_FOLDER_ID')).getName());
}

// 設置後の試し：自分（実行したアカウント）あてに、試しの申込を1件通す。
// 申込シートに「状態：テスト」の行が入り、受付メールと知らせるメールが届けば成功。
// テストの行は申込数に数えない。締切を過ぎた回しかないときは、使える回がないので失敗する。
function testApplyToMe() {
  var me = Session.getActiveUser().getEmail();
  var open = Object.keys(LESSONS).filter(function (id) { return !isClosed_(id); });
  if (!open.length) { console.log('受付中の回がありません'); return; }
  var slots = {}; slots[open[0]] = LESSONS[open[0]].slots[0];
  var res = apply_({
    action: 'apply', series: 'test',
    applicant: { name: 'テスト 申込者', tel: '090-0000-0000', email: me, source: 'その他' },
    participants: [{ name: 'テスト 参加者', kana: 'てすと', age: '10歳（小4）', slots: slots, slope: '中級斜面', mogul: '初めて' }],
    checks: { level: true, lift: true }, consents: { rules: true, privacy: true, guardian: true },
    from_lesson: '', utm: 'test', hp: ''
  }, { test: true });
  console.log(JSON.stringify(res));
}

// 設置後の試し：動画の受け取りを始められるかだけを確かめる（ファイルは作らない）。
// 「開始 OK（200）」と出れば、Drive への送信を始められる。403 なら「サービス → Drive API」を足す。
function testVideoStart() {
  var folder = prop_('VIDEO_FOLDER_ID');
  if (!folder) { console.log('★ VIDEO_FOLDER_ID が未設定'); return; }
  var r = startSession_(folder, 'テスト_開始だけ.mp4', 'video/mp4', 1024);
  if (!r.session) { console.log('★ 開始できない：Drive が ' + r.code + ' を返した\n' + r.body); return; }
  console.log('開始 OK（200）');
  // 始めた送信は取り消す（空のファイルを残さない）
  var c = UrlFetchApp.fetch(r.session, { method: 'delete', muteHttpExceptions: true });
  console.log('取り消し：' + c.getResponseCode() + '（499 なら取り消し済み）');
}
