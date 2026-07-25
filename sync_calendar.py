#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MICレッスンカレンダー同期スクリプト
Google Calendar (list_events) の生データ(JSON) -> サイト用 calendar-data.json への変換。

想定入力: Google Calendar API の events.list レスポンス形式
  { "events": [ { "id", "summary", "start":{"dateTime"}, "end":{"dateTime"}, "description", "status" }, ... ] }

出力: calendar-data.json
  {
    "lastUpdated": "<ISO8601>",
    "sourceCalendarId": "...",
    "events": [
      {
        "id", "date"(YYYY-MM-DD), "startTime"(HH:MM), "endTime"(HH:MM),
        "meetingTime"(HH:MM|null), "title", "venue", "rawSummary",
        "price"(int|null), "priceLabel"(str), "capacity"(int|null), "capacityLabel"(str),
        "note"(str), "applyMethod"(str)
      }, ...
    ],
    "venues": ["O-air", "S-air", "O-air+トランポリン施設", ...]   // 実データから動的に抽出
  }

このスクリプトは日次の自動同期タスクからも同じロジックで呼び出される想定。
"""
import json
import re
import sys
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))

def parse_price(desc):
    m = re.search(r'([\d,]{3,})\s*円', desc)
    if not m:
        return None, None
    val = int(m.group(1).replace(',', ''))
    return val, m.group(0).replace('。', '').strip()

def parse_capacity(desc):
    m = re.search(r'(\d+)\s*名(?:受付中|様)', desc)
    if not m:
        return None, None
    return int(m.group(1)), m.group(0).replace('です', '').strip()

def parse_meeting_time(desc):
    m = re.search(r'(\d{1,2})\s*時(?:(\d{1,2})\s*分)?\s*集合', desc)
    if not m:
        return None
    hh = int(m.group(1))
    mm = int(m.group(2)) if m.group(2) else 0
    return f'{hh:02d}:{mm:02d}'

def parse_apply_method(desc):
    if 'LINE' in desc or 'LINE' in desc:
        return '公式LINEよりお申し込み'
    return 'お問い合わせください'

def split_title_venue(summary):
    # 全角スペースでタイトルと会場名を分割（例: "ウォータージャンプ練習会　S-air"）
    parts = re.split(r'[　]', summary, maxsplit=1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    # 半角スペースでの分割もフォールバックとして試す
    parts = summary.rsplit(' ', 1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return summary.strip(), ''

def to_local_dt(dt_str):
    # "2026-07-25T10:30:00+09:00" 形式を想定
    dt = datetime.fromisoformat(dt_str)
    return dt.astimezone(JST)

def build_note(desc):
    # 説明文から申込・集合時間・料金行を除いた「補足」だけを抜き出す簡易処理
    lines = [l.strip() for l in desc.split('\n') if l.strip()]
    notes = []
    skip_patterns = [r'円', r'名受付中', r'名様', r'LINE', r'集合です']
    for l in lines:
        if any(re.search(p, l) for p in skip_patterns):
            continue
        notes.append(l)
    return ' '.join(notes)

def convert(raw, source_calendar_id):
    events_out = []
    venues = []
    for ev in raw.get('events', []):
        if ev.get('status') == 'cancelled':
            continue
        summary = ev.get('summary', '')
        desc = ev.get('description', '') or ''
        start = ev.get('start', {}).get('dateTime')
        end = ev.get('end', {}).get('dateTime')
        if not start or not end:
            continue  # 終日イベント等は今回スキップ

        start_dt = to_local_dt(start)
        end_dt = to_local_dt(end)
        title, venue = split_title_venue(summary)
        price, price_label = parse_price(desc)
        capacity, capacity_label = parse_capacity(desc)
        meeting_time = parse_meeting_time(desc)
        apply_method = parse_apply_method(desc)
        note = build_note(desc)

        if venue and venue not in venues:
            venues.append(venue)

        events_out.append({
            'id': ev.get('id'),
            'date': start_dt.strftime('%Y-%m-%d'),
            'startTime': start_dt.strftime('%H:%M'),
            'endTime': end_dt.strftime('%H:%M'),
            'meetingTime': meeting_time,
            'title': title,
            'venue': venue,
            'rawSummary': summary,
            'price': price,
            'priceLabel': price_label,
            'capacity': capacity,
            'capacityLabel': capacity_label,
            'applyMethod': apply_method,
            'note': note,
        })

    events_out.sort(key=lambda e: (e['date'], e['startTime']))
    venues.sort()

    return {
        'lastUpdated': datetime.now(JST).isoformat(),
        'sourceCalendarId': source_calendar_id,
        'events': events_out,
        'venues': venues,
    }

if __name__ == '__main__':
    in_path = sys.argv[1] if len(sys.argv) > 1 else 'raw-calendar-events.json'
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'calendar-data.json'
    source_calendar_id = sys.argv[3] if len(sys.argv) > 3 else '0e140c50330d8072dd0f1d7c2838a181f9ce83fc3a0c36b7620ce3827ae45d67@group.calendar.google.com'

    with open(in_path, encoding='utf-8') as f:
        raw = json.load(f)

    result = convert(raw, source_calendar_id)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f'{len(result["events"])} 件のイベントを変換しました -> {out_path}')
    print(f'検出された会場: {result["venues"]}')
