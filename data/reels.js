// 「30秒でわかるモーグル」（Instagram リール・@mogul.mic）の一覧。トップページの #reels の段に出る。
// 新しい回は、配列の最後に1行足すだけで出る（画面にはこの順で左から並ぶ）。
//   no    … 回の番号（キャプションの「#5」なら 5）。番号のない回は null にする（番号なしで出る）
//   title … 題名（キャプションの1行目）。★ 選手の名前は入れない
//   url   … リールの URL（https://www.instagram.com/reel/<ID>/ の形）。<ID> が計測 reel_open の詳細になる
//   thumb … 自前のサムネイル（縦 9:16・幅 540px・WebP か JPEG・1枚 100KB 以下目安）。assets/reels/ に置く
//           ★ Instagram の画像 URL は期限切れになるので使わない。元の動画から ffmpeg で1コマ切り出す
// 2026/10/17 作成。サムネイルは各回の完成版動画の題名が出ているコマ。
window.MIC_REELS = [
  { no:1, title:'なぜ上体は安定して見える？',             url:'https://www.instagram.com/reel/DeL4oh7JvwK/', thumb:'assets/reels/30byou-01.webp' },
  { no:2, title:'コブ1つの中で、何が起きている？',         url:'https://www.instagram.com/reel/DeRLtAlJP7T/', thumb:'assets/reels/30byou-02.webp' },
  { no:3, title:'コブの中で、板にかかる圧はどう変わる？', url:'https://www.instagram.com/reel/DeWOk4SJTKA/', thumb:'assets/reels/30byou-03.webp' },
  { no:4, title:'コブの中で、足の圧はどこにかける？',     url:'https://www.instagram.com/reel/Ded7sAIyvV6/', thumb:'assets/reels/30byou-04.webp' },
  { no:5, title:'モーグルの「ライン」って、どこを通ってる？', url:'https://www.instagram.com/reel/DejHvDqShMb/', thumb:'assets/reels/30byou-05.webp' }
];
