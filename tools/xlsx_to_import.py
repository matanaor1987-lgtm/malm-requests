# ממיר את קובץ ה-Excel של רבקה (רשימת משימות בין גרסאות) לחבילת ייבוא imports/<name>.json
# שהאפליקציה טוענת דרך הקישור  index.html?import=<name>  (תצוגה מקדימה ואז כפתור אחד).
# שימוש: /usr/bin/python3 -I tools/xlsx_to_import.py <קובץ.xlsx> <שם-חבילה> <גרסת-יעד, למשל 5.1575>
# עמודות צפויות (לפי שם כותרת): משימה, מפתח, סטטוס משימה, תאור, רכיב, גרסה צפויה, הערות רבקה.
# שדה "לקוח" מתעלמים ממנו, חוץ מזיהוי תוכנית "שדרת המידע" (sderat_meida / "REST API מכס").
import json, re, sys, openpyxl

src, name, release = sys.argv[1], sys.argv[2], sys.argv[3]
ws = openpyxl.load_workbook(src, data_only=True).worksheets[0]
rows = list(ws.iter_rows(values_only=True))
col = {h: i for i, h in enumerate(rows[0])}
get = lambda r, h: str(r[col[h]]).strip() if h in col and r[col[h]] is not None else ''

FYI = re.compile(r'^(לידיעה|לא מצריך בדיקה|תשתיתי|nice to have|לא בטוחה שרלוונטי|בתחנות חדשות בלבד)')

def norm_ver(v):  # Excel מוריד אפסים בסוף: 5.156 הוא 5.1560
    m = re.fullmatch(r'5\.(\d{3,4})', v)
    return '5.' + m.group(1).ljust(4, '0') if m else v

tasks, seen = [], set()
for r in rows[1:]:
    tid = get(r, 'משימה').split('.')[0]
    if not tid or tid in seen:
        continue
    seen.add(tid)
    note, desc, cust = get(r, 'הערות רבקה'), get(r, 'תאור'), get(r, 'לקוח')
    fyi = bool(FYI.match(note)) or 'אינו דורש בדיקה' in note
    status, tstatus = 'פתוח', ''
    if note.startswith('בוצע כבר אצלכם'): tstatus = 'לבדיקה חוזרת'
    elif note.startswith('נבדק ותקין'): status, tstatus = 'נבדק', 'תקין'
    elif note.startswith('בבדיקות'): status = 'בבדיקה'
    if fyi: status, tstatus = '', ''
    prog = 'שדרת המידע' if cust == 'sderat_meida' or 'REST API מכס' in desc else ''
    m = re.search(r'ממשק\s*(\d{3,4})', desc)
    comp = '|'.join(p for p in get(r, 'רכיב').split('+') if p and p != 'Nothing')
    tasks.append({'id': tid, 'dev': get(r, 'מפתח'), 'desc': desc, 'comp': comp,
                  'ver': norm_ver(get(r, 'גרסה צפויה')), 'notes': note, 'rStatus': get(r, 'סטטוס משימה'),
                  'status': status, 'tStatus': tstatus, 'fyi': fyi, 'program': prog,
                  'iface': ('REST ' + m.group(1)) if prog and m else ''})

out = {'name': 'רשימת רבקה - ' + name, 'release': release, 'source': src.split('/')[-1], 'tasks': tasks}
json.dump(out, open('imports/%s.json' % name, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(tasks), 'tasks;', sum(t['fyi'] for t in tasks), 'fyi;', sum(bool(t['program']) for t in tasks), 'program')
