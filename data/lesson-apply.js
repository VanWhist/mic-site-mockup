// 一般レッスンの申込フォーム（lesson-apply.html）の設定
//
// .json ではなく .js なのは、file:// でローカルプレビューしたときに fetch が CORS で
// 阻まれるためです（athletes.js と同じ理由）。
//
// 新しい回を受け付けるときは、lessons に1件足します。1回＝「日付×コーチ」です。
// id は、2026年12月の2回だけ開催日の8桁（YYYYMMDD）、2027年1月からは「YYYYMMDD-コーチ」
// （例：20270110-watanabe）にします。同じ日に2人のコーチの回があっても見分けられるようにするため。
// id は、一般レッスンのページのカードのアンカー（#lesson-<id>）と、申込フォームの
// ?lesson=<id> にそろえます。
// ★ 回を足したり変えたりしたら、Apps Script（tools/gas/lesson-apply/Code.gs の LESSONS）も
//   同じ内容にそろえて、デプロイし直します。そろっていない回は、送信しても受け付けられません。
// deadline の日（JST）の 23:59 まで受け付けます。過ぎた回は選べなくなります。
//
// ★ 申込の受け取り先（Apps Script のURL）は data/api-config.js の lessonApplyApi です。
//   通知先のメールアドレスなどはここにもコードにも書かず、Apps Script のスクリプト
//   プロパティにだけ置きます（このリポジトリは公開されているため）。

window.MIC_LESSON_APPLY = {
  // 申込シートで回の組をまとめる名前。シーズン中はこのままでよい
  series: 'snow-2026-27',
  title: '雪上レッスンのお申し込み',
  place: '白馬八方尾根スキー場',

  // date      開催日。同じ日の回どうしで、1人が時間の重なる枠を両方選べないようにするのに使う
  // label     フォームに出す日付
  // coach     その回のコーチ
  // slots     選べる枠（下の slotDefs の value）。半日ありは ['am','pm','day']、1日のみは ['day']
  // capacity  定員。capacityLabel はフォームに出す書き方（自動では締めない。2026-11 の決定）
  // capacityNote  定員の補足（任意）。コーチで絞った概要の「定員」に、かっこ書きで出す
  lessons: [
    { id: '20261226', date: '2026-12-26', label: '12/26（土）', coach: '新保 龍登', slots: ['am', 'pm', 'day'],
      capacityLabel: '午前・午後それぞれ5名程度', deadline: '2026-12-23', deadlineLabel: '12月23日（水）' },
    { id: '20261227', date: '2026-12-27', label: '12/27（日）', coach: '新保 龍登', slots: ['am', 'pm', 'day'],
      capacityLabel: '午前・午後それぞれ5名程度', deadline: '2026-12-24', deadlineLabel: '12月24日（木）' },
    { id: '20270107-watanabe', date: '2027-01-07', label: '1/7（木）', coach: '渡辺 大晴', slots: ['day'],
      capacityLabel: '6名', capacityNote: '2名以上で開催', deadline: '2027-01-04', deadlineLabel: '1月4日（月）' },
    { id: '20270108-watanabe', date: '2027-01-08', label: '1/8（金）', coach: '渡辺 大晴', slots: ['day'],
      capacityLabel: '6名', capacityNote: '2名以上で開催', deadline: '2027-01-04', deadlineLabel: '1月4日（月）' },
    { id: '20270109-watanabe', date: '2027-01-09', label: '1/9（土）', coach: '渡辺 大晴', slots: ['day'],
      capacityLabel: '6名', capacityNote: '2名以上で開催', deadline: '2027-01-04', deadlineLabel: '1月4日（月）' },
    { id: '20270110-watanabe', date: '2027-01-10', label: '1/10（日）', coach: '渡辺 大晴', slots: ['day'],
      capacityLabel: '6名', capacityNote: '2名以上で開催', deadline: '2027-01-04', deadlineLabel: '1月4日（月）' },
    { id: '20270111-watanabe', date: '2027-01-11', label: '1/11（月・祝）', coach: '渡辺 大晴', slots: ['day'],
      capacityLabel: '6名', capacityNote: '2名以上で開催', deadline: '2027-01-04', deadlineLabel: '1月4日（月）' },
    { id: '20270116-tanaka', date: '2027-01-16', label: '1/16（土）', coach: '田中 花', slots: ['am', 'pm', 'day'],
      capacityLabel: '午前・午後それぞれ5名程度', deadline: '2027-01-13', deadlineLabel: '1月13日（水）' },
    { id: '20270117-tanaka', date: '2027-01-17', label: '1/17（日）', coach: '田中 花', slots: ['am', 'pm', 'day'],
      capacityLabel: '午前・午後それぞれ5名程度', deadline: '2027-01-14', deadlineLabel: '1月14日（木）' }
  ],

  // 枠の決まり。value は申込シートに入る値。parts は時間の重なりを見るためのもの（1日＝午前＋午後）
  slotDefs: [
    { value: 'am',  label: '午前', time: '10:00–12:00', fee: 5500,  parts: ['am'] },
    { value: 'pm',  label: '午後', time: '13:00–15:00', fee: 5500,  parts: ['pm'] },
    { value: 'day', label: '1日',  time: '午前と午後',   fee: 11000, parts: ['am', 'pm'] }
  ],

  // 動画は任意。1人1本まで
  video: { maxBytes: 250 * 1024 * 1024, note: '60秒くらいまで・250MBまで' }
};
