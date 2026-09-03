/* 戦歴の規則と補助関数。
 *
 * ★ index.html の中にインラインで持っていたものを、そのまま外に出したファイル。
 *   1ページでしか使わないうちはインラインでよかったが、選手育成ページでも
 *   同じ規則で選手を選ぶことになったため、出所を1つにする。
 *
 * ★ 規則を2か所に持たない。program-athlete.html にコピーしないこと。
 *   2026/08/30 の短期教室カードが「同じものをもう1か所に置いたら片方だけ腐った」例。
 *
 * 使い方
 *   <script src="data/history-rules.js"></script>
 *   const R = window.MIC_HISTORY_RULES;
 */
(function () {
  'use strict';

  // ==================== 戦歴の規則（表として持つ） ====================
  //
  // ★ コードに if で埋めない。選手が育つほど新しいカテゴリが出てくる。
  //   表なら1行足せば済むが、条件分岐に埋めると次に足す人が全部読み直すことになる。
  //   実際 ANC（オセアニアカップ）と OPN（Open FIS）は当初の表に無く、あとから足した。
  //
  // ★★ 3つの別々の軸を持つ。1つの順序ではない。★★
  //
  //   limit … 掲載基準。一覧に載せるかどうか（初出場は成績を問わず載せる）
  //           8位 → 16位 → 32位 → 全成績（null）
  //           大会の格が上がるほど緩くする。W杯32位は国内B級8位より難しい。
  //
  //   band  … 格の帯。「主な成績」でどちらを先に出すか。小さいほど格が高い。
  //           ★ limit と同じではない。WJC と JO はどちらも掲載基準16位だが格が違う。
  //
  //   src   … 出所。同じ大会が SAJ と FIS の両方に入るため、カテゴリごとに1つへ決める。
  //           ★ 日付＋種目での突き合わせはしない。実データで1日ずれる例がある
  //             （林遼真・長野県選手権 SAJ 2025-02-03 / FIS 2025-02-04）。
  //
  // 3つ目の軸「種別（個人／団体）」は種目名で決まるので DISCIPLINES に持たせている。
  var RULES = [
    // key       表示名                  limit  band  src
    ['SAJ_B',   'SAJ B級公認',            8,     6,  'SAJ'],
    ['SAJ_A',   'SAJ A級公認',            8,     6,  'SAJ'],
    ['JO',      'ジュニアオリンピック',     16,     4,  'SAJ'],
    ['FIS',     'FISレース',              8,     5,  'FIS'],
    ['OPN',     'Open FIS',               8,     5,  'FIS'],
    ['NC',      '全日本選手権',            16,     4,  'FIS'],
    ['AC',      'アジアカップ',            16,     3,  'FIS'],
    ['ANC',     'オセアニアカップ',         16,     3,  'FIS'],
    ['WJC',     '世界ジュニア選手権',       16,     2,  'FIS'],
    ['WC',      'ワールドカップ',          32,     1,  'FIS'],
    ['WSC',     '世界選手権',            null,     0,  'FIS'],
    ['OWG',     'オリンピック',           null,     0,  'FIS'],
    ['UNI',     'ユニバーシアード',        null,     0,  'FIS'],   // FISコード未確認
    ['ASG',     'アジア大会',             null,     0,  'FIS']    // FISコード未確認
  ];

  // 順位が数値にならない行（DNF・DNS・DSQ…）を載せる帯の上限。
  //   0=世界最高峰  1=ワールドカップ  2=世界ジュニア  までが対象。
  var SYMBOL_BAND_MAX = 2;

  var RULE = {};
  RULES.forEach(function (r) {
    RULE[r[0]] = { label: r[1], limit: r[2], band: r[3], src: r[4] };
  });

  // 台帳の Category 文字列 → 規則のキー。★ 文字列そのままで持つ。部分一致で散らかさない。
  //   「FIS兼SAJ-A級」のように、二重公認の大会は台帳が自分で申告している。
  //   だから行を突き合わせなくても、カテゴリだけで出所を決められる。
  var CAT_KEY = {
    'SAJ B級': 'SAJ_B',
    'B': 'SAJ_B',
    '小学1~6年生以下（SAJ-B級）＊ポイントスケールはB級未満とする': 'SAJ_B',
    'SAJ A級': 'SAJ_A',
    '全日本ジュニア': 'JO',
    'ジュニアオリンンピック（SAJ-A級）': 'JO',   // 「ン」が重複した台帳側の表記。直さず受ける
    '全日本': 'NC',
    'FIS兼SAJ-A級': 'FIS',
    'FISアジアカップ兼SAJ-A級': 'AC',
    // FIS 側の Category はコードがそのまま入る
    'FIS': 'FIS', 'OPN': 'OPN', 'NC': 'NC', 'AC': 'AC', 'ANC': 'ANC',
    'WJC': 'WJC', 'WC': 'WC', 'WSC': 'WSC', 'OWG': 'OWG'
  };

  // SAJ側のカテゴリ名がそのままだと1行に収まらないものだけ短くする。
  // 一覧に無いものは触らない（勝手に言い換えない）。
  var CAT_SHORT = {
    '小学1~6年生以下（SAJ-B級）＊ポイントスケールはB級未満とする': 'SAJ B級未満'
  };

  // ★ 短縮形も、同じキーに向けて自動で登録する。手で並べない。
  //   台帳は生の値、data/athletes.js は短縮したあとの値を持っている（語彙が2つある）。
  //   両方を受けないと、API が生きているときとフォールバックのときで扱いが変わる。
  Object.keys(CAT_SHORT).forEach(function (raw) {
    var short = CAT_SHORT[raw];
    if (CAT_KEY[raw] && !(short in CAT_KEY)) CAT_KEY[short] = CAT_KEY[raw];
  });

  // 種目の表（3つ目の軸）。★ 団体戦は一覧に載せるが「主な成績」には出さない。
  //   団体の順位はチームメイト次第で決まる。個人の入賞と並べると
  //   「世界ジュニア9位」と読まれ、個人成績と誤解される。
  var DISCIPLINES = {
    'Moguls':           ['MO',    '個人'],
    'Dual Moguls':      ['DM',    '個人'],
    'Dual Moguls Team': ['DM団体', '団体'],
    'モーグル':           ['MO',    '個人'],
    'デュアルモーグル':     ['DM',    '個人'],
    'MO':               ['MO',    '個人'],
    'DM':               ['DM',    '個人']
  };

  // 種目の日本語名。★ 看板では「DM」ではなく通じる言葉にする。
  //   表に無いものは短縮形をそのまま出す（勝手に日本語名を作らない）。
  var DISCIPLINE_JA = { 'MO': 'モーグル', 'DM': 'デュアルモーグル', 'DM団体': 'デュアルモーグル団体' };

  /** 順位を数値で取る。取れなければ null。
   *  ★ DNF / DNS を名指しで書かないこと。DSQ・DQ・DNQ など他にもある。
   *    列挙で書くと、次に見たことのない記号が来たときに落ちる。 */
  function rankNum(v) {
    if (v == null || v === '') return null;
    var n = Number(v);
    return (typeof n === 'number' && isFinite(n) && n > 0) ? n : null;
  }

  /** ★ API とフォールバック（data/athletes.js）の両方を、必ずここに通す。
   *  ★ rank を1つの変数に数値と文字列の両方を持たせない。
   *    NaN が混ざると sort の並び順が不定になり、例外も出ない。 */
  function normalizeResults(rows) {
    return (rows || []).map(function (r) {
      var rawCat  = String(r.cat == null ? '' : r.cat);
      var rawDisc = String(r.disc == null ? '' : r.disc);
      var key = CAT_KEY[rawCat] || null;             // null＝表に無いカテゴリ
      var d   = DISCIPLINES[rawDisc] || [rawDisc, '個人'];
      return {
        d: String(r.d == null ? '' : r.d),
        rankNum:  rankNum(r.rank),                   // 比較・並べ替え専用。null あり
        rankText: String(r.rank == null ? '' : r.rank),  // 画面表示専用
        disc: d[0],
        kind: d[1],
        cat: rawCat,
        key: key,
        label: key ? RULE[key].label : (CAT_SHORT[rawCat] || rawCat),
        src: r.src || 'SAJ',
        ev: String(r.ev == null ? '' : r.ev)
      };
    });
  }

  // 想定の外に出たものの控え。★ サイトからは Van様へ報告できないので、
  //   ここでは console と window に残すだけにする。
  var outOfSpec = [];
  window.__apOutOfSpec = outOfSpec;
  function reportOutOfSpec(kind, athleteName, r) {
    var rec = { 種類: kind, 選手: athleteName || '', 日付: r.d, 大会: r.ev,
                種目: r.disc, 順位: r.rankText, カテゴリ: r.cat };
    if (outOfSpec.some(function (x) {
      return x.種類 === rec.種類 && x.選手 === rec.選手 && x.日付 === rec.日付
          && x.大会 === rec.大会 && x.種目 === rec.種目;
    })) return;
    outOfSpec.push(rec);
    console.warn('[戦歴] 想定の外に出た行 —', rec);
  }

  /** 同じ大会が SAJ と FIS の両方に入るので、カテゴリごとに出所を1つへ決める。
   *  ★ 「そのカテゴリに FIS の行があるか」で見る。選手単位だと抜けが残る。 */
  function pickBySource(rows, athleteName) {
    var fisByKey = {};
    rows.forEach(function (r) { if (r.src === 'FIS' && r.key) fisByKey[r.key] = true; });
    return rows.filter(function (r) {
      if (!r.key) return true;                       // 表に無いカテゴリは落とさない
      var want = RULE[r.key].src;
      if (r.src === want) return true;
      if (want === 'FIS' && !fisByKey[r.key]) {
        // 置き換わる先が無い。落とすと行が消えるので残し、想定の外に出たものとして控える。
        reportOutOfSpec('出所がFISのカテゴリなのに、その選手にFISデータが無い行', athleteName, r);
        return true;
      }
      return false;
    });
  }

  /** 掲載基準を当てる。初出場はカテゴリごとに判定し、成績を問わず載せる。 */
  function applyLimits(rows) {
    var list = rows.slice().sort(function (x, y) { return x.d < y.d ? -1 : (x.d > y.d ? 1 : 0); });
    var first = {};
    list.forEach(function (r) { if (r.key && !(r.key in first)) first[r.key] = r.d; });
    list.forEach(function (r) {
      r.debut = !!(r.key && first[r.key] === r.d);
      if (!r.key) { r.show = true; return; }         // 表に無いカテゴリは黙って落とさない
      // ★ 順位が数値にならない行は、格の高い大会だけ載せる。記号を名指ししない。
      if (r.rankNum === null) {
        r.show = r.debut || RULE[r.key].band <= SYMBOL_BAND_MAX;
        return;
      }
      var lim = RULE[r.key].limit;
      r.show = r.debut || lim === null || r.rankNum <= lim;
    });
    return list.filter(function (r) { return r.show; });
  }

  function inLimit(r) {
    if (!r.key || r.rankNum === null) return false;
    var lim = RULE[r.key].limit;
    return lim === null || r.rankNum <= lim;
  }

  /** 「主な成績」を選ぶ。最大3件。
   *  ① 各カテゴリの最上位1件だけを候補にする
   *  ② 同じ格の帯からは1件まで
   *  ③ 帯の中では「基準内 > 基準外」、次に順位が上
   *  ④ 「出場」は最大1件まで
   *  ★ どれも実データで起きた破綻に対応している。消すと再発する。 */
  function mainResults(shown) {
    var best = {};
    shown.forEach(function (r) {
      if (r.rankNum === null || r.kind === '団体' || !r.key) return;
      var cur = best[r.key];
      if (!cur || r.rankNum < cur.rankNum) best[r.key] = r;
    });
    var perBand = {};
    Object.keys(best).forEach(function (k) {
      var r = best[k], b = RULE[k].band;
      var cur = perBand[b];
      var score = [inLimit(r) ? 0 : 1, r.rankNum];
      if (!cur || score[0] < cur.score[0]
          || (score[0] === cur.score[0] && score[1] < cur.score[1])) {
        perBand[b] = { r: r, score: score };
      }
    });
    var out = [];
    var debutUsed = 0;
    Object.keys(perBand).map(Number).sort(function (x, y) { return x - y; }).forEach(function (b) {
      if (out.length >= 3) return;
      var r = perBand[b].r;
      if (!inLimit(r)) {
        if (debutUsed >= 1) return;                  // ④
        debutUsed++;
      }
      out.push(r);
    });
    return out;
  }

  /** 基準内なら順位、基準外なら「出場」。 */
  function resultLabel(r) {
    return inLimit(r) ? (r.rankText + '位') : '出場';
  }

  /** 1人の選手の結果を、規則を通したうえで返す。 */
  function shownResults(athlete) {
    return applyLimits(pickBySource(normalizeResults(athlete.results), athlete.name));
  }

  // 「所属選手の主な実績」に載せる帯の下限。この帯まで（数字が小さいほう）の結果を
  //   1件でも持つ選手は、順位を問わず載せる（出場だけでも載る）。
  //   4 ＝ 世界ジュニア／ジュニオリ／全日本／アジアカップ／オセアニアカップ まで。
  //   ★ 人数で切らない（2026/09/02 Van様の判断）。「出場するだけで凄い大会」で線を引く。
  var HIGHLIGHT_BAND_MAX = 4;

  /** 「所属選手の主な実績」に出す、その選手の代表1件。無ければ null。
   *
   *  候補は 主な成績と同じ条件（rankNum が null／団体／キー無し は除く）に加えて
   *  帯が HIGHLIGHT_BAND_MAX 以内のもの。
   *
   *  ★ 並べ替えは「基準内 → 帯 → 順位 → 日付の新しい順」。
   *    帯だけで並べると、七海快成さんが 世界ジュニア46位（出場）になり
   *    ジュニアオリンピック2位 が隠れる。基準内を先にすると 2位 が出る。
   *    基準内が1件も無ければ、いちばん格の高い「出場」が残る。
   *  ★ 順位の数値と文字列を1つの変数に混ぜない。混ぜると sort が NaN を返して
   *    並びが黙って崩れる（例外も出ない）。 */
  function highlightResult(athlete) {
    var cands = shownResults(athlete).filter(function (r) {
      return r.rankNum !== null && r.kind !== '団体' && !!r.key
          && RULE[r.key].band <= HIGHLIGHT_BAND_MAX;
    });
    if (!cands.length) return null;
    cands.sort(function (x, y) {
      var ix = inLimit(x) ? 0 : 1, iy = inLimit(y) ? 0 : 1;
      if (ix !== iy) return ix - iy;                     // 基準内が先
      var bx = RULE[x.key].band, by = RULE[y.key].band;
      if (bx !== by) return bx - by;                     // 帯が上（数字が小さい）ほうが先
      if (x.rankNum !== y.rankNum) return x.rankNum - y.rankNum;
      return x.d < y.d ? 1 : (x.d > y.d ? -1 : 0);       // 同じなら新しいほう
    });
    return cands[0];
  }

  /** 選手同士の並び順。帯 → 順位 → 日付の新しい順。
   *  ★ ページ側で別の順序を作らない。ここが唯一の定義。 */
  function compareHighlights(x, y) {
    var bx = RULE[x.key].band, by = RULE[y.key].band;
    if (bx !== by) return bx - by;
    if (x.rankNum !== y.rankNum) return x.rankNum - y.rankNum;
    return x.d < y.d ? 1 : (x.d > y.d ? -1 : 0);
  }

  /** シートの日付セルはJSTの0時で入っているため、JSONではUTCの前日15:00として出てくる。
   *  文字列を先頭10文字で切ると1日前になるので、+9時間してから暦日を取る。 */
  function jstDate(v) {
    if (v == null) return '';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    var t = new Date(v).getTime();
    if (isNaN(t)) return '';
    return new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 10);
  }

  /** 戦歴APIの生の行を sajId ごとにまとめる。突き合わせは sajId のみ。
   *  ★ 氏名で突き合わせない（浜田／濵田のような表記ゆれで取りこぼす）。
   *  ★ 順位で行を落とさない。Number(Rank) の判定を入れると DNF/DNS/DSQ が
   *    NaN になって黙って消える。数値化は normalizeResults に任せる。 */
  function groupBySajId(rows) {
    var bySaj = new Map();
    rows.forEach(function (r) {
      var saj = Number(r['SAJ番号']);
      var d = jstDate(r.Date);
      var rawRank = (r.Rank == null ? '' : String(r.Rank)).trim();
      if (!saj || !d || rawRank === '') return;
      if (!bySaj.has(saj)) bySaj.set(saj, []);
      bySaj.get(saj).push({
        d: d,
        rank: rawRank,                  // ★ 文字列のまま渡す。数値化は正規化で1か所だけ
        disc: String(r.Discipline == null ? '' : r.Discipline),
        cat: String(r.Category == null ? '' : r.Category),   // 短縮せず生のまま
        src: String(r.Source == null ? '' : r.Source) || 'SAJ',
        ev: String(r.Event == null ? '' : r.Event)
      });
    });
    return bySaj;
  }

  window.MIC_HISTORY_RULES = {
    HISTORY_API_URL: 'https://script.google.com/macros/s/AKfycbznKEiCkuCYXO-B9e8Y6fV6fuVe9JpaOkSfMqai_bAsspS-mwcU5Ggx1oMOEBwuJnO_8A/exec',
    RULES: RULES,
    RULE: RULE,
    SYMBOL_BAND_MAX: SYMBOL_BAND_MAX,
    HIGHLIGHT_BAND_MAX: HIGHLIGHT_BAND_MAX,
    CAT_KEY: CAT_KEY,
    CAT_SHORT: CAT_SHORT,
    DISCIPLINES: DISCIPLINES,
    DISCIPLINE_JA: DISCIPLINE_JA,
    rankNum: rankNum,
    normalizeResults: normalizeResults,
    pickBySource: pickBySource,
    applyLimits: applyLimits,
    inLimit: inLimit,
    mainResults: mainResults,
    resultLabel: resultLabel,
    shownResults: shownResults,
    highlightResult: highlightResult,
    compareHighlights: compareHighlights,
    jstDate: jstDate,
    groupBySajId: groupBySajId
  };
})();
