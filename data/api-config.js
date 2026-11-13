// MIC アプリのエンドポイント設定
//
// upload.html と lesson-apply.html が読み込みます。
// .json ではなく .js なのは、file:// でローカルプレビューしたときに fetch が CORS で
// 阻まれるためです（athletes.js と同じ理由）。
//
// ここに入るのは「匿名アクセス可のウェブアプリURL」だけです。URL自体は秘密ではなく、
// 保護しているのは選手ごとのトークンです。
// ★ 共有シークレット（MIC_SHARED_SECRET）は絶対にこのファイルへ書かないこと。
//   あれは Python ⇄ MIC-Publish-API のもので、リポジトリの外の .env にのみ置きます。
//
// 設定手順：Van様が MIC-Upload-API をデプロイしたあと、その /exec URL を uploadApi に入れます。

window.MIC_API = {
  // MIC-Upload-API（mogul.mic@gmail.com でデプロイ。2026/08/15 設定）
  uploadApi: 'https://script.google.com/macros/s/AKfycbxKy_MfsKrCmHpec9yvl2oKxVnkDwT14iM83jPmRxG6KWEMevj1nPt_1zAyd-1HNeCrlA/exec',

  // MIC-Lesson-Apply-API（一般レッスンの申込フォーム lesson-apply.html の受け取り先）。
  // mogul.mic@gmail.com でデプロイしたあと、その /exec URL を入れる。
  // 空のあいだは、申込フォームは送信できず、公式LINEへ案内する。
  lessonApplyApi: ''
};
