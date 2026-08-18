#!/usr/bin/env bash
#
# 設計契約チェック — 「設計上あり得ない状態」を検査する。
#
# テストではない。契約の検査である。
# 2026/08/16 までに起きた巻き戻し（選手データのインライン化の復活、DRAFT表示の復活）は
# どちらもこれで検知できた。直した状態を固定するために置く。
#
# 使い方:  bash scripts/check-site.sh
# 終了コード: 0 = 合格 / 1 = 違反あり
#
# ★ 目的は「防止」ではなく「壊れた瞬間に気づくこと」。
#   落ちれば GitHub Actions から通知が飛ぶ。
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
ok()   { printf '  \033[32mOK\033[0m   %s\n' "$1"; }
bad()  { printf '  \033[31mNG\033[0m   %s\n' "$1"; fail=1; }
note() { printf '       %s\n' "$1"; }

echo "== 設計契約チェック =="

# ---------------------------------------------------------------- 1〜2. 選手データの単一情報源
# 選手データの正本は data/athletes.js だけ。index.html にインラインで持つと、
# publish_photos.py の反映が公開サイトに出なくなる（実際に一度そうなった）。

if grep -q '<script src="data/athletes\.js"></script>' index.html; then
  ok 'index.html が data/athletes.js を読み込んでいる'
else
  bad 'index.html に <script src="data/athletes.js"></script> が無い'
  note 'インライン化に戻っていないか確認すること'
fi

if grep -qE 'const[[:space:]]+AP_ATHLETES[[:space:]]*=[[:space:]]*window\.AP_ATHLETES' index.html; then
  ok 'index.html が window.AP_ATHLETES から受けている'
else
  bad 'index.html に const AP_ATHLETES = window.AP_ATHLETES が無い'
fi

# 配列リテラルを直接代入していたら、データがHTMLへ戻ったということ
if grep -qE 'const[[:space:]]+AP_ATHLETES[[:space:]]*=[[:space:]]*\[' index.html; then
  bad 'index.html に選手データがインラインで存在する（const AP_ATHLETES = [ ）'
  note "$(grep -nE 'const[[:space:]]+AP_ATHLETES[[:space:]]*=[[:space:]]*\[' index.html | head -3)"
else
  ok 'index.html に選手データのインラインが無い'
fi

# ---------------------------------------------------------------- 3〜5. data/athletes.js
if [ ! -s data/athletes.js ]; then
  bad 'data/athletes.js が無い、または空'
else
  ok 'data/athletes.js が存在し、空でない'

  if grep -q 'window\.AP_ATHLETES' data/athletes.js; then
    ok 'data/athletes.js が window.AP_ATHLETES を定義している'
  else
    bad 'data/athletes.js に window.AP_ATHLETES の定義が無い'
  fi

  ids=$(grep -oE "id:'[^']+'" data/athletes.js | sed "s/id:'//; s/'//" || true)
  n=$(printf '%s\n' "$ids" | grep -c . || true)
  if [ "$n" -ge 12 ]; then
    ok "選手が ${n} 件（12件以上）"
  else
    bad "選手が ${n} 件しかない（12件以上あるべき）"
  fi

  dup=$(printf '%s\n' "$ids" | sort | uniq -d)
  if [ -z "$dup" ]; then
    ok 'id の重複が無い'
  else
    bad "id が重複している: $(printf '%s ' $dup)"
    note 'publish_photos.py は重複があると停止する'
  fi

  # ---- 写真の複数枚化（2026/08/18）----
  # 単数の photo は廃止した。二重管理を作らないため photos（配列）に一本化している。
  # 移行漏れと、あとから単数へ戻す変更を止めるための検査。
  if grep -qE "(^|[^a-zA-Z])photo:" data/athletes.js; then
    bad 'data/athletes.js に単数の photo: が残っている（photos: の配列へ一本化すること）'
    note "$(grep -nE "(^|[^a-zA-Z])photo:" data/athletes.js | head -3)"
  else
    ok 'data/athletes.js に単数の photo: が無い'
  fi

  np=$(grep -c "photos:\[" data/athletes.js || true)
  if [ "$np" -ge 12 ]; then
    ok "photos: が ${np} 件（12件以上）"
  else
    bad "photos: が ${np} 件しかない（12件以上あるべき）"
    note '移行漏れの可能性がある'
  fi

  # ★ 1人あたり3枚まで。承認画面（Apps Script）側の「1選手1枚」ガードを外した代わりに
  #   置いている上限なので、ここが効かないと歯止めが無くなる。
  over=''
  while IFS= read -r arr; do
    [ -z "$arr" ] && continue
    q=$(printf '%s' "$arr" | tr -cd "'" | wc -c)
    cnt=$(( q / 2 ))
    if [ "$cnt" -gt 3 ]; then over="${over}${cnt}枚: ${arr}
"; fi
  done <<EOF_ARRAYS
$(grep -oE "photos:\[[^]]*\]" data/athletes.js)
EOF_ARRAYS
  if [ -z "$over" ]; then
    ok '1人あたりの photos が3枚以下'
  else
    bad '1人あたりの photos が3枚を超えている'
    note "$(printf '%s' "$over" | head -3)"
  fi

  # ---- 動画の値（2026/08/18）----
  # ★ video は .mp4 か YouTube の URL だけ。想定外の値は再生ボタンごと出さない作りだが、
  #   出ないことに気づけないので、値の段階で止める。
  #   video:null は「動画なし」なので対象外。
  badvid=''
  while IFS= read -r v; do
    [ -z "$v" ] && continue
    case "$v" in
      *.mp4|*.mp4\?*|*.mp4\#*) continue ;;
    esac
    if printf '%s' "$v" | grep -qE '^https?://(youtu\.be/|(www\.)?youtube\.com/(watch\?([^#]*&)?v=|shorts/|embed/))[A-Za-z0-9_-]{6,}'; then
      continue
    fi
    badvid="${badvid}${v}
"
  done <<EOF_VIDEOS
$(grep -oE "\bvideo:'[^']*'" data/athletes.js | sed "s/^video:'//; s/'$//")
EOF_VIDEOS
  if [ -z "$badvid" ]; then
    ok 'video の値が .mp4 か YouTube の URL になっている'
  else
    bad 'video に想定外の値がある（.mp4 か YouTube の URL のみ）'
    note "$(printf '%s' "$badvid" | head -3)"
  fi

  # 構文チェック。node が無い環境もあるので、無ければ括弧の対応で代用する
  if command -v node >/dev/null 2>&1; then
    if node --check data/athletes.js >/dev/null 2>&1; then
      ok 'data/athletes.js の構文が正しい（node --check）'
    else
      bad 'data/athletes.js に構文エラーがある'
      note "$(node --check data/athletes.js 2>&1 | head -3)"
    fi
  else
    o=$(tr -cd '{' < data/athletes.js | wc -c)
    c=$(tr -cd '}' < data/athletes.js | wc -c)
    ob=$(tr -cd '[' < data/athletes.js | wc -c)
    cb=$(tr -cd ']' < data/athletes.js | wc -c)
    if [ "$o" -eq "$c" ] && [ "$ob" -eq "$cb" ]; then
      ok "括弧の対応が取れている（node が無いため代用: {}=$o []=$ob）"
    else
      bad "括弧の対応が壊れている（{}=$o/$c []=$ob/$cb）"
    fi
  fi
fi

# ---------------------------------------------------------------- 6. upload.html
if [ ! -s upload.html ]; then
  bad 'upload.html が無い、または空'
else
  ok 'upload.html が存在する'
  # トークンを読まなくなったら、誰の写真か分からないまま受け付けることになる
  if grep -qE "get\('t'\)" upload.html; then
    ok 'upload.html がトークンを読み取っている'
  else
    bad "upload.html に get('t') が無い（トークンの読み取りが消えている）"
  fi
  # 第1層を廃止した以上、この2つが唯一の同意の記録
  for id in consentUpload consentCopyright; do
    if grep -q "id=\"$id\"" upload.html; then
      ok "upload.html に $id のチェックがある"
    else
      bad "upload.html から $id のチェックが消えている（唯一の同意の記録）"
    fi
  done
fi

# ---------------------------------------------------------------- 7. consent.html は廃止済み
if [ -e consent.html ]; then
  bad 'consent.html が存在する（2026/08/15 に第1層を廃止して削除したもの）'
  note '復活していると、次に触る人が「使うもの」と誤解する'
else
  ok 'consent.html が存在しない（第1層廃止のとおり）'
fi

# ---------------------------------------------------------------- 8. 公開前の下書き文言
# ★ 全文検索にすると CSS のコメント（「メニューを開いている間はDRAFTバッジを引っ込める」等）に
#   引っかかって即座に落ちる。**利用者の目に入る要素の中身**だけを見る。
#   バッジ自体は「リニューアル準備中」として残す判断（2026/08/15）なので、
#   要素の有無ではなく文言を検査する。
# ★ 検査する場所は、実際に巻き戻った3か所だけに限定する。
#     ・バッジ  … class="draft-badge" / class="demo-badge" の要素の中身
#     ・フッター注記 … class="sf-bottom" の中の <span>
#     ・<title> … タブと共有時に見える
#   本文まで対象にしない。将来ページ本文に「試作品」と書いた瞬間に落ちてしまい、
#   チェックが邪魔者になる。落ちるべきでないもので落ちるチェックは、やがて無視される。
NG_WORDS='試作|ラフ案|ラフです|非公開|RAFU|DRAFT'
for f in *.html; do
  [ -e "$f" ] || continue
  body=$(sed -n '/<body/,$p' "$f" | sed 's/<!--.*-->//g')

  badge=$(printf '%s\n' "$body" \
    | grep -nE "class=\"(draft-badge|demo-badge)\"[^>]*>[^<]*($NG_WORDS)" || true)
  footer=$(printf '%s\n' "$body" \
    | grep -A3 'class="sf-bottom"' \
    | grep -nE "<span[^>]*>[^<]*($NG_WORDS)" || true)
  title=$(grep -oE '<title>[^<]*</title>' "$f" | grep -E "$NG_WORDS" || true)

  if [ -z "$badge$footer$title" ]; then
    ok "$f に公開前の下書き文言が表示されていない（バッジ・フッター注記・title）"
  else
    bad "$f に公開前の下書き文言が表示されている"
    note "$(printf '%s\n%s\n%s' "$badge" "$footer" "$title" | grep . | head -3)"
  fi
done

# ---------------------------------------------------------------- 結果
echo
if [ "$fail" -eq 0 ]; then
  echo "合格：設計上の契約は守られています"
else
  echo "★ 不合格：上の NG を直してください"
fi
exit "$fail"
