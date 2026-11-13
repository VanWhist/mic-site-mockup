// 一般レッスンの申込フォーム（lesson-apply.html）の設定
//
// .json ではなく .js なのは、file:// でローカルプレビューしたときに fetch が CORS で
// 阻まれるためです（athletes.js と同じ理由）。
//
// 新しい回を受け付けるときは、lessons に1件足します。id は開催日の8桁（YYYYMMDD）で、
// 一般レッスンのページのカードのアンカー（#lesson-YYYYMMDD）と、申込フォームの
// ?lesson=YYYYMMDD にそろえます。
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
  coach: '新保 龍登',

  lessons: [
    { id: '20261226', label: '12/26（土）', deadline: '2026-12-23', deadlineLabel: '12月23日（水）' },
    { id: '20261227', label: '12/27（日）', deadline: '2026-12-24', deadlineLabel: '12月24日（木）' }
  ],

  // 各回の時間帯。value は申込シートに入る値
  slots: [
    { value: 'am',  label: '午前', time: '10:00–12:00', fee: 5500 },
    { value: 'pm',  label: '午後', time: '13:00–15:00', fee: 5500 },
    { value: 'day', label: '1日',  time: '午前と午後',   fee: 11000 }
  ],

  // 動画は任意。1人1本まで
  video: { maxBytes: 250 * 1024 * 1024, note: '60秒くらいまで・250MBまで' }
};
