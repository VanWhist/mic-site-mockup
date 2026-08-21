// MIC 選手データ
// このファイルは tools/publish_photos.py が自動更新します（photos の値のみ）。
// photos は「1人あたり最大3枚」の配列。先頭が代表写真で、パネルのヒーロー初期表示と
// 動画の背景に使われます。順序は写真が届いた順（received_at 昇順）。
// ★ 単数の photo は持ちません。二重管理を作らないため photos に一本化しています。
// 手で編集する場合は、選手の照合キーが id（ローマ字スラッグ）であることに注意してください。
// 氏名は表示専用で、照合には使いません（漢字の表記ゆれがあるため）。
// .json ではなく .js なのは、file:// でローカルプレビューしたときに fetch が CORS で
// 阻まれるためです（レッスンカレンダーで実際に発生済み）。

window.AP_ATHLETES = [
    {
      id:'mise-kurea',
      name:'見瀬クレア',
      tag:'世界ジュニア3位・アジアカップ優勝',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2025/05/S__71491609-2.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'suzuki-reina',
      name:'鈴木伶菜',
      tag:'ジュニアオリンピックMO11位・DM7位',
      photos:['assets/athletes/suzuki-reina-eca44afe.jpg','assets/athletes/suzuki-reina-4b8122aa.jpg','assets/athletes/suzuki-reina-8c8be600.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2024-03-09',rank:2,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2025-02-07',rank:2,disc:'MO',cat:'SAJ B級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-08',rank:6,disc:'DM',cat:'SAJ B級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-03-01',rank:6,disc:'DM',cat:'SAJ B級',ev:'令和6年度新潟県スキー選手権大会兼第23回国体記念松之山温泉モーグル競技会'},
        {d:'2025-03-15',rank:7,disc:'DM',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'aruga-mutsuhito',
      name:'有賀睦人',
      tag:'大阪府ジュニアスキー技術選手権 優勝',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2025/06/4C82761B-A841-49F2-B548-A37442EA875D.jpg'],
      hasKarte:true,
      vision:'ワールドカップなどで活躍したいです。',
      goal:'今年からはA級なのでまずは、A級に残れる順位を取りたいです。',
      // 有賀睦人｜MIC 選手紹介（MICモーグルチャンネル・限定公開・0:13）。
      // 元の assets/videos/睦人.mp4 と同じ映像。MP4 は参照されなくなるだけで残してある。
      video:'https://youtu.be/FTWfsrykCzk',
      videoAspect:'9:16',   // 縦動画。省略時は '16:9'（横）とみなす
      tracked:true,
      results:[
        {d:'2024-03-08',rank:6,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2024-03-09',rank:6,disc:'MO',cat:'SAJ B級未満',ev:'2024森下仁丹 大阪府ジュニアモーグル大会'},
        {d:'2026-03-06',rank:3,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'},
        {d:'2026-03-07',rank:2,disc:'MO',cat:'SAJ B級',ev:'森下仁丹2026大阪府はくのりモーグル里見大会'}
      ]
    },
    {
      id:'maji-haruyo',
      name:'馬路晴世',
      tag:'B級公認大会5位',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2025/06/2769E8BF-BFBE-4469-B8CD-034E8AB7A0E8-731x1024.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2021-02-21',rank:2,disc:'MO',cat:'SAJ B級',ev:'2021白馬さのさかモーグル大会 第1戦・第2戦'},
        {d:'2022-02-25',rank:8,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2022-02-26',rank:3,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2022-03-11',rank:6,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2022全日本ジュニアスキー選手権大会・フリースタイル競技・種目モーグル'},
        {d:'2025-01-31',rank:6,disc:'MO',cat:'SAJ B級',ev:'2025HSCフリースタイルスキー選手権大会 B級モーグル大会 第1戦、第2戦'},
        {d:'2025-02-01',rank:5,disc:'MO',cat:'SAJ B級',ev:'2025HSCフリースタイルスキー選手権大会 B級モーグル大会 第1戦、第2戦'}
      ]
    },
    {
      id:'nanaumi-kaisei',
      name:'七海快成',
      tag:'全日本選手権初出場',
      photos:['assets/athletes/nanaumi-kaisei-57b62ed8.jpg','assets/athletes/nanaumi-kaisei-f687f276.jpg','assets/athletes/nanaumi-kaisei-3e8fc59f.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2022-02-26',rank:6,disc:'MO',cat:'SAJ B級',ev:'2022大阪府はくのりモーグル大会'},
        {d:'2023-01-27',rank:7,disc:'MO',cat:'SAJ B級',ev:'第23回埼玉県松之山温泉モーグル競技会'},
        {d:'2023-01-28',rank:6,disc:'MO',cat:'SAJ B級',ev:'令和4年度新潟県スキー選手権大会兼第21回国体記念松之山温泉モーグル競技会'},
        {d:'2023-02-24',rank:6,disc:'MO',cat:'SAJ B級',ev:'2023大阪府はくのりモーグル大会'},
        {d:'2023-02-25',rank:6,disc:'MO',cat:'SAJ B級',ev:'2023大阪府はくのりモーグル大会'},
        {d:'2025-02-07',rank:5,disc:'MO',cat:'SAJ A級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-08',rank:7,disc:'DM',cat:'SAJ A級',ev:'2025フリースタイルスキー秋田・田沢湖モーグル競技会'},
        {d:'2025-02-14',rank:3,disc:'MO',cat:'SAJ A級',ev:'2025 白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2025-02-15',rank:8,disc:'MO',cat:'SAJ A級',ev:'2025 白馬乗鞍埼玉県モーグル選手権大会'},
        {d:'2025-03-14',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2025全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2026-02-06',rank:5,disc:'MO',cat:'SAJ A級',ev:'森下仁丹2026大阪府はくのりモーグル大会'},
        {d:'2026-03-13',rank:6,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'hamada-takuma',
      name:'浜田匠真',
      tag:'楽しくスキーを頑張る',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2023/06/352538139_155384994191123_6081636642944124410_n.jpg'],
      hasKarte:true,
      vision:'スキーモーグルを広めれる人になりたいです。',
      goal:'B級大会優勝です。',
      video:null,
      tracked:true,
      results:[]
    },
    {
      id:'hamada-seima',
      name:'浜田誠真',
      tag:'B級公認大会出場',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2023/09/356241684_166366369759652_8476162081763316629_n.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'matsumura-satomi',
      name:'松村聡美',
      tag:'GARAカップ 小学生の部 3位',
      photos:['assets/athletes/matsumura-satomi-e0554086.jpg','assets/athletes/matsumura-satomi-c0fdb7ef.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'hayashi-ryoma',
      name:'林遼真',
      tag:'A級公認大会7位',
      photos:['https://mogul-mic.com/mic2026/wp-content/uploads/2025/05/S__5562378-925x1024.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:true,
      results:[
        {d:'2019-03-01',rank:3,disc:'MO',cat:'B',ev:'イマトクCUPハチ北モーグル大会 第1戦'},
        {d:'2019-03-02',rank:2,disc:'MO',cat:'B',ev:'イマトクCUPハチ北モーグル大会 第2戦'},
        {d:'2022-03-11',rank:7,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2022全日本ジュニアスキー選手権大会・フリースタイル競技・種目モーグル'},
        {d:'2024-02-23',rank:7,disc:'MO',cat:'SAJ B級',ev:'2024森下仁丹 大阪府はくのりモーグル大会'},
        {d:'2024-02-24',rank:5,disc:'MO',cat:'SAJ B級',ev:'2024森下仁丹 大阪府はくのりモーグル大会'},
        {d:'2024-03-15',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2024全日本ジュニアスキー選手権大会フリースタイル競技・種目モーグル'},
        {d:'2025-02-03',rank:7,disc:'MO',cat:'FIS兼SAJ-A級',ev:'第43回長野県フリースタイルスキー選手権大会 モーグル競技'},
        {d:'2026-02-07',rank:3,disc:'MO',cat:'SAJ A級',ev:'森下仁丹2026大阪府はくのりモーグル大会'},
        {d:'2026-03-13',rank:2,disc:'MO',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'},
        {d:'2026-03-14',rank:6,disc:'DM',cat:'全日本ジュニア',ev:'JOCジュニアオリンピックカップ2026全日本ジュニアスキー選手権大会フリースタイル競技デュアルモーグル・モーグル種目'}
      ]
    },
    {
      id:'katsuta-yumi',
      name:'勝田有美',
      tag:'2026シーズン加入・S-air拠点',
      photos:['assets/athletes/katsuta-yumi-798cb8f8.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'fujihara-tomoki',
      name:'藤原朋己',
      tag:'2026シーズン加入',
      photos:['assets/athletes/fujihara-tomoki-db00bb99.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    },
    {
      id:'suzuki-kae',
      name:'鈴木佳英',
      tag:'八方ジュニアテクニカル取得',
      photos:['assets/athletes/suzuki-kae-37c1f2b2.jpg'],
      hasKarte:false, vision:null, goal:null, video:null,
      tracked:false, results:[]
    }
];
