# MICサイト（mic-site-mockup）固有ルール

## このリポジトリの前提
- main ブランチ直下（path: /）から GitHub Pages で公開される。ビルドを挟まない。
- main は保護されており、直接push・直接コミットはできない。
  公開サイトへの反映は Pull Request のマージによって開始される。
- 2026年8月、変更の巻き戻しが同日2回発生した。原因は、GitHub API経由のコミットが
  「親は常に最新、中身は送信側が持っているもの」という構造を持つため、
  4日前の index.html を土台にした内容が、コンフリクトを起こさずに最新の上に載ったこと。
  この経路は現在ブランチ保護（PR必須・strict）で塞がれている。
- tools/publish_photos.py も data/athletes.js と assets/athletes/ を書き換えて
  コミットする（pushはしない）。

## ブランチ運用
- main は保護されている。直接push・直接コミットはできない（API経由も含む）。
- main へのマージは Pull Request のみ。必須チェック guard と、
  土台が最新であること（strict）を満たさないとマージできない。
- 作業は必ず最新の origin/main からブランチを切って行う。
    git fetch origin main
    git switch -c work/<用途>-<YYYYMMDD> origin/main
- 1ブランチ＝1セッション＝1目的とする。別の目的の変更を同じブランチに載せない。
- PR作成前に git diff --stat origin/main...HEAD を実行し、
  変更ファイル数・行数が依頼範囲と一致するか確認する。一致しなければPRを作らず報告する。
- main へのマージは GitHub Pages の本番デプロイを開始する。マージ前に必ず確認を取る。

## index.html でコンフリクトが起きた場合
- index.html は約789KB の単一ファイルで、HTML・CSS・JavaScript が同居している。
  コンフリクトマーカーを手で解消しない。誤って別機能を壊しても気づけない。
- コンフリクトが出た場合は解消を試みず、その場で中断して状態を報告する。
  最新の origin/main からブランチを切り直し、変更を部分編集として当て直す。
- 古い内容でファイル全体を置換すると、コンフリクトを起こさずに他セッションの変更が消える。
  ファイル全体の書き出しは、直前の読み直しと確認なしに行わない。

## publish_photos.py の実行手順
- publish_photos.py は data/athletes.js と assets/athletes/ を書き換えてコミットする。
  機能変更とは別系統の、データ反映専用の操作とする。
- 機能作業用のブランチでは実行しない。写真反映のコミットが機能変更のPRに紛れ込む。
- 手順:
  1. git fetch origin main
  2. 最新の origin/main から publish/photos-<YYYYMMDD> ブランチを切る
  3. 作業ツリーが空であることを確認してから実行する
  4. git diff HEAD~1 HEAD -- data/athletes.js で反映内容を確認する
  5. PRを作り、マージ後に --mark-published を実行する
- 未反映の写真がある状態で長時間ブランチを寝かせない。反映は当日中に統合する。

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

## PR作成・マージ前に必ず行うこと
- 作業ブランチのpushは、origin/mainが進んでいても行ってよい。
  土台が古いかどうかはマージ時にstrictが判定する。
- PR作成前に `git fetch origin main` と `git status --short --branch` を実行する。
- `git diff --stat origin/main...HEAD` と通常の差分を確認する。
- 変更量や内容が依頼範囲と一致しない場合はPRを作らず、差分を報告する。
- mergeStateStatus が BEHIND の場合は、土台が古い。マージせず、
  最新の origin/main を取り込んでから再確認する。
- マージは GitHub Pages の本番デプロイを開始する。マージ前に必ず確認を取る。

## データの単一情報源
- 選手データの正本は data/athletes.js のみとする。
- index.html・upload.html は必ず <script src="data/athletes.js"> で読み込み、
  選手データを HTML 内にインラインで持たない。
  インライン化すると publish_photos.py の反映が公開サイトに出なくなる。
- publish_photos.py を実行する前にも git fetch し、data/athletes.js が最新か確認する。

## 巻き戻しに気づいた場合
- force push、reset --hard、revert で自力で戻そうとしない。
- 失われた内容と該当コミットを特定して報告し、対処方針の指示を待つ。
