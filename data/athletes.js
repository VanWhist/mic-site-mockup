// MIC 選手データ
// このファイルは tools/publish_photos.py が自動更新します（photos の値のみ）。
// photos は「1人あたり最大3枚」の配列。先頭が代表写真で、パネルのヒーロー初期表示と
// 動画の背景に使われます。順序は写真が届いた順（received_at 昇順）。
// ★ 単数の photo は持ちません。二重管理を作らないため photos に一本化しています。
// 手で編集する場合は、選手の照合キーが id（ローマ字スラッグ）であることに注意してください。
// 氏名は表示専用で、照合には使いません（漢字の表記ゆれがあるため）。
// .json ではなく .js なのは、file:// でローカルプレビューしたときに fetch が CORS で
// 阻まれるためです（レッスンカレンダーで実際に発生済み）。
//
// ■ results（戦歴）について
// ここに書いてある results は「フォールバック」です。正本は戦歴APIで、index.html が
// 読み込み時に取りに行き、取れたらこの値を上書きします（レッスンカレンダーと同じ作り）。
// APIには毎週火曜9:00の自動チェックでSAJ競技データバンクの新着が入るので、
// 通常このファイルを手で更新する必要はありません。APIに届かない環境（file:// で開いた等）
// でも最低限の表示が出るように、直近の内容を写して置いてあります。
// 照合キーは sajId（SAJ競技者番号）です。氏名では突き合わせません（浜田/濵田のような
// 表記ゆれがあるため）。sajId が無い選手はAPIと結び付かず、常にこの値のままになります。
//
// ■ tracked について
// true  … 戦歴APIの取得対象。成績0件なら「まだ8位以内なし」と出る
// false … 取得対象外。「準備中」と出る。対象に加えるにはバックエンド側の
//         対象選手リストにも追加が必要（サイト側で tracked を立てるだけでは増えない）
//
// ■ 紹介文（tag / vision / goal）について
// 2026/08/24、選手紹介に出す文章はいったん全員分ゼロにしました。
//   tag           … 氏名の下に出る短い肩書き。もともと手書きだったものを削除
//   vision / goal … 選手カルテ（目標設定シート）から転記していたもの。
//                   カルテはコーチ・本人が見る前提で書かれたもので、公開を想定した文章では
//                   ないため取り下げた。データもここには残していない（このリポジトリは公開のため）
// 今後は、選手セルフアップロードアプリ（upload.html）で本人・保護者に公開前提で
// 書いてもらった短い肩書きを tag に入れる方針。表示側は空なら要素ごと出しません。

window.AP_ATHLETES = [
    {
      id:'mise-kurea',
      name:'見瀬クレア', sajId:5001737,
      tag:'',
      photos:['assets/athletes/mise-kurea-28f910d9.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2019-02-17',rank:8,disc:'MO',cat:'B',ev:'2019きはしクリニック東海北陸ブロックモーグル競技会'},
        {d:'2020-02-01',rank:6,disc:'MO',cat:'B',ev:'2020 東海北陸フリースタイルスキー選手権大会 (Ｂ級）'},
        {d:'2020-02-02',rank:3,disc:'MO',cat:'B',ev:'2020 東海北陸フリースタイルスキー選手権大会 (Ｂ級）'},
        {d:'2020-02-07',rank:7,disc:'MO',cat:'B',ev:'第3回小海リエックス・スキーバレーモーグル競技会'},
        {d:'2021-03-14',rank:2,disc:'MO',cat:'ジュニアオリンンピック（SAJ-A級）',ev:'JOCジュニアオリンピックカップ　2021全日本ジュニアスキー選手権大会フリースタイル競技　モーグル種目'},
        {d:'2022-02-19',rank:4,disc:'MO',cat:'FIS兼SAJ-A級',ev:'サンガリアシリーズ2022フリースタイルスキーふくしま大会'},
        {d:'2022-02-22',rank:4,disc:'MO',cat:'SAJ A級',ev:'第40回長野県フリースタイルスキー選手権大会'},
        {d:'2022-02-23',rank:6,disc:'MO',cat:'SAJ A級',ev:'2022HSCフリースタイル選手権大会モーグル大会'},
        {d:'2022-03-12',rank:1,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2022全日本ジュニアスキー選手権大会・フリースタイル競技・種目モーグル'},
        {d:'2024-01-27',rank:7,disc:'MO',cat:'SAJ A級',ev:'第24回ばんけいモーグル競技会'},
        {d:'2024-02-11',rank:1,disc:'MO',cat:'SAJ A級',ev:'2024白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2024-02-12',rank:1,disc:'MO',cat:'SAJ A級',ev:'2024白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2024-02-17',rank:7,disc:'MO',cat:'FIS兼SAJ-A級',ev:'2024 世界遺産五箇山フリースタイルスキー選手権大会/2024 FIS A級 たいら　モーグル競技会'},
        {d:'2024-02-18',rank:5,disc:'MO',cat:'FISアジアカップ兼SAJ-A級',ev:'2024 世界遺産五箇山フリースタイルスキー選手権大会/2024 アジアカップ　たいら　モーグル競技会'},
        {d:'2024-02-24',rank:7,disc:'DM',cat:'FIS兼SAJ-A級',ev:'第43回北海道スキー選手権大会フリースタイル競技DM/MO種目'},
        {d:'2024-02-25',rank:2,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第43回北海道スキー選手権大会フリースタイル競技DM/MO種目'},
        {d:'2024-03-02',rank:8,disc:'MO',cat:'FISアジアカップ兼SAJ-A級',ev:'アジアカップ　第33回札幌モーグル競技会'},
        {d:'2024-03-03',rank:4,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第95回宮様スキー大会国際競技会'},
        {d:'2024-03-16',rank:4,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2024全日本ジュニアスキー選手権大会フリースタイル競技・種目モーグル'},
        {d:'2024-03-24',rank:7,disc:'MO',cat:'全日本',ev:'第44回全日本スキー選手権大会・フリースタイル競技・種目デュアルモーグル・モーグル'},
        {d:'2025-02-01',rank:8,disc:'MO',cat:'SAJ A級',ev:'第25回ばんけいモーグル競技会'},
        {d:'2025-02-02',rank:5,disc:'MO',cat:'SAJ A級',ev:'第25回ばんけいモーグル競技会'},
        {d:'2025-02-23',rank:3,disc:'DM',cat:'FIS兼SAJ-A級',ev:'第44回北海道スキー選手権大会フリースタイル競技DM/MO種目'},
        {d:'2025-02-24',rank:3,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第44回北海道スキー選手権大会フリースタイル競技DM/MO種目'},
        {d:'2025-03-01',rank:5,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第96回宮様スキー大会国際競技会'},
        {d:'2025-03-08',rank:3,disc:'MO',cat:'FISアジアカップ兼SAJ-A級',ev:'2025 アジアカップ　たいら　モーグル競技会/2025 世界遺産五箇山フリースタイルスキー選手権大会/第1戦/第2戦'},
        {d:'2025-03-09',rank:1,disc:'MO',cat:'FISアジアカップ兼SAJ-A級',ev:'2025 アジアカップ　たいら　モーグル競技会/2025 世界遺産五箇山フリースタイルスキー選手権大会/第1戦/第2戦'},
        {d:'2025-03-15',rank:1,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2025-03-16',rank:1,disc:'DM',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2025-03-29',rank:8,disc:'DM',cat:'全日本',ev:'第45回全日本スキー選手権大会フリースタイル競技　種目：デュアルモーグル・モーグル'},
        {d:'2025-03-30',rank:7,disc:'MO',cat:'全日本',ev:'第45回全日本スキー選手権大会フリースタイル競技　種目：デュアルモーグル・モーグル'}
      ]
    },
    {
      id:'suzuki-reina',
      name:'鈴木伶菜', sajId:5002151,
      tag:'',
      photos:['assets/athletes/suzuki-reina-eca44afe.jpg','assets/athletes/suzuki-reina-4b8122aa.jpg','assets/athletes/suzuki-reina-8c8be600.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2024-03-10',rank:2,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2025-02-08',rank:2,disc:'MO',cat:'SAJ B級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-09',rank:6,disc:'DM',cat:'SAJ B級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-03-02',rank:6,disc:'DM',cat:'SAJ B級',ev:'令和6年度新潟県スキー選手権大会兼第23回国体記念松之山温泉モーグル競技会'},
        {d:'2025-03-16',rank:7,disc:'DM',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'aruga-mutsuhito',
      name:'有賀睦人', sajId:5002208,
      tag:'',
      photos:['assets/athletes/aruga-mutsuhito-08c84026.jpg'],
      hasKarte:false, vision:null, goal:null,
      // 有賀睦人｜MIC 選手紹介（MICモーグルチャンネル・限定公開・0:13）。
      // 元の assets/videos/睦人.mp4 と同じ映像。MP4 は参照されなくなるだけで残してある。
      video:'https://youtu.be/FTWfsrykCzk',
      videoAspect:'9:16',   // 縦動画。省略時は '16:9'（横）とみなす
      tracked:true,
      results:[
        {d:'2024-03-09',rank:6,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2024-03-10',rank:6,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2026-03-07',rank:3,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'},
        {d:'2026-03-08',rank:2,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'}
      ]
    },
    {
      id:'maji-haruyo',
      name:'馬路晴世', sajId:5001932,
      tag:'',
      photos:['assets/athletes/maji-haruyo-beac64ec.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2021-02-22',rank:2,disc:'MO',cat:'SAJ B級',ev:'2021白馬さのさかモーグル大会 第1戦・第2戦'},
        {d:'2022-02-26',rank:8,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2022-02-27',rank:3,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2022-03-12',rank:6,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2022全日本ジュニアスキー選手権大会・フリースタイル競技・種目モーグル'},
        {d:'2025-02-01',rank:6,disc:'MO',cat:'SAJ B級',ev:'2025HSCフリースタイルスキー選手権大会 B級モーグル大会 第1戦、第2戦'},
        {d:'2025-02-02',rank:5,disc:'MO',cat:'SAJ B級',ev:'2025HSCフリースタイルスキー選手権大会 B級モーグル大会 第1戦、第2戦'}
      ]
    },
    {
      id:'nanaumi-kaisei',
      name:'七海快成', sajId:5001891,
      tag:'',
      photos:['assets/athletes/nanaumi-kaisei-57b62ed8.jpg','assets/athletes/nanaumi-kaisei-f687f276.jpg','assets/athletes/nanaumi-kaisei-3e8fc59f.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2022-02-27',rank:6,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2023-01-28',rank:7,disc:'MO',cat:'SAJ B級',ev:'第23回埼玉県松之山温泉モーグル競技会'},
        {d:'2023-01-29',rank:6,disc:'MO',cat:'SAJ B級',ev:'令和4年度新潟県スキー選手権大会兼第21回国体記念松之山温泉モーグル競技会'},
        {d:'2023-02-25',rank:6,disc:'MO',cat:'SAJ B級',ev:'2023大阪府はくのりモーグル大会'},
        {d:'2023-02-26',rank:6,disc:'MO',cat:'SAJ B級',ev:'2023大阪府はくのりモーグル大会'},
        {d:'2025-02-08',rank:5,disc:'MO',cat:'SAJ A級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-09',rank:7,disc:'DM',cat:'SAJ A級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-15',rank:3,disc:'MO',cat:'SAJ A級',ev:'2025 白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2025-02-16',rank:8,disc:'MO',cat:'SAJ A級',ev:'2025 白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2025-03-15',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2026-02-07',rank:5,disc:'MO',cat:'SAJ A級',ev:'森下仁丹2026大阪府はくのりモーグル大会'},
        {d:'2026-03-14',rank:6,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'hamada-takuma',
      name:'浜田匠真', sajId:5002069,
      tag:'',
      photos:['assets/athletes/hamada-takuma-b48ce6d0.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[]
    },
    {
      id:'hamada-seima',
      name:'浜田誠真', sajId:5001957,
      tag:'',
      photos:['assets/athletes/hamada-seima-3cb34465.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2025-02-09',rank:5,disc:'DM',cat:'SAJ B級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2026-03-08',rank:5,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'}
      ]
    },
    {
      id:'matsumura-satomi',
      name:'松村聡美',
      tag:'',
      photos:['assets/athletes/matsumura-satomi-e0554086.jpg','assets/athletes/matsumura-satomi-c0fdb7ef.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'hayashi-ryoma',
      name:'林遼真', sajId:5001654,
      tag:'',
      photos:['assets/athletes/hayashi-ryoma-3bc998ac.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2019-03-02',rank:3,disc:'MO',cat:'B',ev:'イマトクCUPハチ北モーグル大会 第1戦'},
        {d:'2019-03-03',rank:2,disc:'MO',cat:'B',ev:'イマトクCUPハチ北モーグル大会 第2戦'},
        {d:'2022-03-12',rank:7,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2022全日本ジュニアスキー選手権大会・フリースタイル競技・種目モーグル'},
        {d:'2024-02-24',rank:7,disc:'MO',cat:'SAJ B級',ev:'2024森下仁丹 大阪府はくのりモーグル大会'},
        {d:'2024-02-25',rank:5,disc:'MO',cat:'SAJ B級',ev:'2024森下仁丹 大阪府はくのりモーグル大会'},
        {d:'2024-03-16',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2024全日本ジュニアスキー選手権大会フリースタイル競技・種目モーグル'},
        {d:'2025-02-04',rank:7,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第43回長野県フリースタイルスキー選手権大会 モーグル競技'},
        {d:'2026-02-08',rank:3,disc:'MO',cat:'SAJ A級',ev:'森下仁丹2026大阪府はくのりモーグル大会'},
        {d:'2026-03-14',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2026-03-15',rank:6,disc:'DM',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'katsuta-yumi',
      name:'勝田有美',
      tag:'',
      photos:['assets/athletes/katsuta-yumi-798cb8f8.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'fujihara-tomoki',
      name:'藤原朋己',
      tag:'',
      photos:['assets/athletes/fujihara-tomoki-db00bb99.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'suzuki-kae',
      name:'鈴木佳英', sajId:5002440,
      tag:'',
      photos:['assets/athletes/suzuki-kae-37c1f2b2.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2026-01-24',rank:8,disc:'MO',cat:'SAJ B級',ev:'第1回戸狩温泉モーグル競技会'},
        {d:'2026-03-08',rank:5,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'}
      ]
    }
];
