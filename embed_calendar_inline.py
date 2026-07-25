#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
calendar-data.json の内容を、index.html / full-calendar.html に埋め込まれた
オフラインフォールバック用の <script id="calendar-data-inline"> ブロックへ反映するスクリプト。

なぜ必要か：
  index.html / full-calendar.html は通常 fetch('calendar-data.json') で最新データを取得するが、
  ローカルでファイルをダブルクリックして file:// で直接開いた場合、ブラウザのセキュリティ制限により
  fetch がブロックされ、カレンダーが「予定がありません」という空状態になってしまう。
  このスクリプトで最新の calendar-data.json の内容を各HTMLファイルに埋め込んでおくことで、
  fetchが使えない環境でもページ内の埋め込みデータへ自動でフォールバックし、正しく表示される。

使い方：
  python3 embed_calendar_inline.py calendar-data.json index.html full-calendar.html

sync_calendar.py で calendar-data.json を再生成した後、必ずこのスクリプトも実行し、
2つのHTMLファイルの埋め込みデータも最新化すること（日次の自動同期タスクでも同様の手順を行う）。
"""
import json
import re
import sys

MARKER_START = '<!-- CALENDAR_DATA_INLINE_START -->'
MARKER_END = '<!-- CALENDAR_DATA_INLINE_END -->'

def embed(json_path, html_paths):
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)

    # HTML内の<script>にそのまま埋め込むため、</script>を分断してXSS/構文崩れを防ぐ
    payload = json.dumps(data, ensure_ascii=False).replace('</script>', '<\\/script>')
    new_block = (
        MARKER_START + '\n'
        '<!-- calendar-data.json と同じ内容のオフライン用フォールバックです。'
        'sync_calendar.py / embed_calendar_inline.py で更新されます。 -->\n'
        '<script type="application/json" id="calendar-data-inline">' + payload + '</script>\n'
        + MARKER_END
    )

    pattern = re.compile(re.escape(MARKER_START) + r'.*?' + re.escape(MARKER_END), re.DOTALL)

    for html_path in html_paths:
        with open(html_path, encoding='utf-8') as f:
            html = f.read()
        if MARKER_START not in html or MARKER_END not in html:
            print(f'警告: {html_path} にマーカーが見つかりません。スキップします。')
            continue
        new_html, n = pattern.subn(new_block, html, count=1)
        if n == 0:
            print(f'警告: {html_path} でマーカー置換に失敗しました。スキップします。')
            continue
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'{html_path} のオフラインフォールバックデータを更新しました（{len(data.get("events", []))}件）')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('使い方: python3 embed_calendar_inline.py calendar-data.json index.html [full-calendar.html ...]')
        sys.exit(1)
    embed(sys.argv[1], sys.argv[2:])
