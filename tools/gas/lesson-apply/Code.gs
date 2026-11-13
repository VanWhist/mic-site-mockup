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

// lesson-apply.html の data/lesson-apply.js と同じ内容にそろえる
var LESSONS = {
  '20261226': { label: '12/26（土）', deadline: '2026-12-23' },
  '20261227': { label: '12/27（日）', deadline: '2026-12-24' }
};
var SLOTS = { am: '午前 10:00–12:00', pm: '午後 13:00–15:00', day: '1日（午前・午後）' };
var FEES = { am: 5500, pm: 5500, day: 11000 };

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
      if (!LESSONS[id] || !SLOTS[raw[id]]) return { ok: false, reason: 'invalid' };
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
        str_(b.from_lesson, 10), str_(b.utm, 120), opt.test ? 'テスト' : '受付', ''
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

function slotsText_(slots) {
  return Object.keys(slots).sort().map(function (id) { return LESSONS[id].label + ' ' + SLOTS[slots[id]]; }).join('／');
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

// 回ごと・時間帯ごとの申込人数（状態が「取消」「テスト」の行は数えない）。1日は午前・午後の両方に数える
function countBySlot_(sh) {
  var last = sh.getLastRow();
  var out = {};
  if (last < 2) return out;
  var v = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  v.forEach(function (r) {
    var st = String(r[COL['状態'] - 1]);
    if (st.indexOf('取消') >= 0 || st.indexOf('テスト') >= 0) return;
    String(r[COL['参加する回'] - 1]).split('／').forEach(function (s) {
      Object.keys(LESSONS).forEach(function (id) {
        var l = LESSONS[id].label;
        if (s.indexOf(l) !== 0) return;
        if (s.indexOf('午前') >= 0 || s.indexOf('1日') >= 0) out[l + ' 午前'] = (out[l + ' 午前'] || 0) + 1;
        if (s.indexOf('午後') >= 0 || s.indexOf('1日') >= 0) out[l + ' 午後'] = (out[l + ' 午後'] || 0) + 1;
      });
    });
  });
  return out;
}

function feeTotal_(people) {
  var sum = 0;
  people.forEach(function (q) { Object.keys(q.slots).forEach(function (id) { sum += FEES[q.slots[id]]; }); });
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
  lines.push('当日の中止・時間変更は、ご入力の電話番号またはこのメールアドレスへご連絡します。');
  lines.push('ご不明な点は、公式LINEからご連絡ください：' + prop_('LINE_URL', 'https://lin.ee/Q6XCwYg'), '');
  lines.push('MIC — Mogul Improvement Community', 'https://mogul-mic.com/');
  var opt = { name: 'MIC（Mogul Improvement Community）' };
  var pdf = prop_('CONSENT_PDF_ID');
  if (pdf) {
    lines.splice(lines.length - 3, 0, '参加同意書を添付しています。当日までにご確認ください。', '');
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
  lines.push('', '― 回ごとの申込数（この申込を含む・定員の目安は1枠5名）');
  Object.keys(counts).sort().forEach(function (k) {
    lines.push('　' + k + '：' + counts[k] + '名' + (counts[k] >= 5 ? '  ★5名に達しました' : ''));
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
  var res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': type,
      'X-Upload-Content-Length': String(size),
      // ブラウザから直接 PUT するため、送信元のオリジンを伝えておく（CORS）
      Origin: prop_('SITE_ORIGIN', 'https://mogul-mic.com')
    },
    payload: JSON.stringify({ name: name, parents: [folder] }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    console.error('resumable start', res.getResponseCode(), res.getContentText());
    return { ok: false, reason: 'server_error' };
  }
  var h = res.getAllHeaders();
  return { ok: true, session: h.Location || h.location };
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
  var slots = {}; slots[open[0]] = 'am';
  var res = apply_({
    action: 'apply', series: 'test',
    applicant: { name: 'テスト 申込者', tel: '090-0000-0000', email: me, source: 'その他' },
    participants: [{ name: 'テスト 参加者', kana: 'てすと', age: '10歳（小4）', slots: slots, slope: '中級斜面', mogul: '初めて' }],
    checks: { level: true, lift: true }, consents: { rules: true, privacy: true, guardian: true },
    from_lesson: '', utm: 'test', hp: ''
  }, { test: true });
  console.log(JSON.stringify(res));
}
