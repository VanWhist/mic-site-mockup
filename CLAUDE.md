# MICサイト（mic-site-mockup）固有ルール

※このファイルは暫定版。別ブランチ運用の設計が固まり次第、差し替える。

## このリポジトリの前提
- main ブランチ直下（path: /）から GitHub Pages で公開される。ビルドを挟まない。
- mainへのpushでGitHub Pagesのデプロイが開始され、完了後に公開サイトへ反映される。
- 複数のClaude Codeセッションが、別々のcloneから同じmainを操作する運用下で、
  2026年8月に変更の巻き戻しが同日2回発生した。直接原因は調査中。
- tools/publish_photos.py も data/athletes.js を書き換えてコミットする（pushはしない）。

## 編集前に必ず行うこと
- 編集開始前に `git fetch origin main` と `git status --short --branch` を実行する。
- 作業ツリーが空で、ローカルがorigin/mainより遅れているだけの場合は、
  `git pull --ff-only` で更新する。
- 未コミット変更がある、ローカルに未pushコミットがある、履歴が分岐している場合は、
  pull・merge・rebase・resetを自動実行せず、状態を報告する。
- 同期後、対象ファイルを読み直してから編集する。
- `git diff origin/main -- <対象ファイル>` に差分がある場合は、
  差分がローカル変更・未pushコミット・リモート更新のどれによるものか確認する。
  原因が判断できなければ編集を開始しない。
- index.htmlなど単一ファイルに複数機能が入ったファイルは、
  古い内容を土台にファイル全体を置換しない。必要な範囲だけ部分編集する。
- ファイル全体の置換が必要な場合は、直前にfetchと読み直しを行い、
  理由と変更範囲を示して確認を得てから実行する。
- 会話の途中で読み込んだ内容をそのまま土台にしない。
  最後のfetchより後に編集を再開する場合は、対象ファイルを読み直す。

## push前に必ず行うこと
- mainへのpushは本番デプロイを開始するため、毎回事前確認を取る。
- push前に `git fetch origin main` と `git status --short --branch` を実行する。
- origin/mainに新しいコミットがある、または履歴が分岐している場合はpushしない。
- リモートと同期していることを確認したうえで、
  `git diff --stat origin/main...HEAD` と通常の差分を確認する。
- 変更量や内容が依頼範囲と一致しない場合はpushせず、差分を報告する。

## データの単一情報源
- 選手データの正本は data/athletes.js のみとする。
- index.html・upload.html は必ず <script src="data/athletes.js"> で読み込み、
  選手データを HTML 内にインラインで持たない。
  インライン化すると publish_photos.py の反映が公開サイトに出なくなる。
- publish_photos.py を実行する前にも git fetch し、data/athletes.js が最新か確認する。

## 巻き戻しに気づいた場合
- force push、reset --hard、revert で自力で戻そうとしない。
- 失われた内容と該当コミットを特定して報告し、対処方針の指示を待つ。
