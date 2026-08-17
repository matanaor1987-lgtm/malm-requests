// בדיקות E2E למערכת בקשות מלמ.
// כל בדיקה עובדת מול Firebase מדומה (ראו helpers.js) - אף בדיקה לא נוגעת בנתונים אמיתיים.
const { test, expect } = require('@playwright/test');
const { mockFirebase, login } = require('./helpers');

test.describe('התחברות', () => {
  test('כניסה עם פרטים נכונים מציגה את הלשוניות', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await expect(page.locator('#mainTabs')).toBeVisible();
    await expect(page.locator('#lgOverlay')).toBeHidden();
  });

  test('כניסה עם סיסמה שגויה מציגה שגיאה ולא נכנסת', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await page.fill('#lgUser', 'testadmin');
    await page.fill('#lgPass', 'wrong-password');
    await page.click('#lgBtn');
    await expect(page.locator('#lgErr')).toHaveText(/שגוי/);
    await expect(page.locator('#mainTabs')).toBeHidden();
  });
});

test.describe('משימות לרבקה - יצירה ועריכה', () => {
  test('יצירת משימה חדשה מופיעה ברשימה', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('#btnAdd');
    await page.fill('#f_נ', 'משימת בדיקה אוטומטית');
    await page.fill('#f_כ', 'כותרת בדיקה');
    await page.fill('#f_ב', 'תוכן הבקשה לבדיקה');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);
    await expect(page.locator('#b2')).toContainText('משימת בדיקה אוטומטית');
  });

  test('שינוי סטטוס בעריכה נרשם ב-statusLog', async ({ page }) => {
    const rec = { _id: 'r_status_1', נ: 'משימה לבדיקת סטטוס', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('text=משימה לבדיקת סטטוס');
    // הלחיצה על שורת הטקסט לא פותחת עריכה - צריך את כפתור העריכה בשורה
    await page.click('tr:has-text("משימה לבדיקת סטטוס") .act-btn');
    await page.selectOption('#f_ס', 'בוצע');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);
    const log = await page.evaluate(() => {
      const r = DB.rivka.find(x => x._id === 'r_status_1');
      return r.statusLog;
    });
    expect(log.length).toBe(1);
    expect(log[0].s).toBe('בוצע');
  });
});

test.describe('רגרסיה: דליפת הערות בין משימות (הבאג שתוקן ב-saveModal)', () => {
  test('שמירת משימה אחרי שהמערך הוחלף ברקע לא דורסת את ה-chat שלה בהערות של משימה אחרת', async ({ page }) => {
    const taskA = { _id: 'A', נ: 'משימת A', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: { malm: [{ sender: 'x', text: 'הערה של A', ts: 1, time: 't' }], dhl: [] } };
    const taskB = { _id: 'B', נ: 'משימת B', מב: 'מנהלת בדיקה', ת: '2026-07-02', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: { malm: [{ sender: 'x', text: 'הערה של B', ts: 2, time: 't' }], dhl: [] } };
    await mockFirebase(page, { rivka: [taskA, taskB] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');

    // פותחים את משימה B (באינדקס 1 במערך המקורי)
    await page.evaluate(() => openEdit('rivka', 1));
    await expect(page.locator('#modalBg')).toHaveClass(/open/);

    // מדמים החלפת רקע של המערך (למשל markRead של משימה אחרת שהתחדש/נוספה),
    // כך שהאינדקס הישן (1) כבר לא מצביע על B אלא על A.
    await page.evaluate(({ taskA, taskB }) => {
      DB.rivka = [
        { _id: 'NEW', נ: 'משימה חדשה שנוספה במקביל', מב: 'מישהו אחר', ת: '2026-07-03', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} },
        taskA,
        taskB,
      ];
    }, { taskA, taskB });

    await page.fill('#f_כ', 'כותרת עודכנה');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const result = await page.evaluate(() => {
      const a = DB.rivka.find(r => r._id === 'A');
      const b = DB.rivka.find(r => r._id === 'B');
      return {
        bChat: (b.chat.malm || []).map(m => m.text),
        aChat: (a.chat.malm || []).map(m => m.text),
        bTitle: b.כ,
      };
    });
    expect(result.bChat).toEqual(['הערה של B']);
    expect(result.aChat).toEqual(['הערה של A']);
    expect(result.bTitle).toBe('כותרת עודכנה');
  });
});

test.describe('מחיקה רכה וביטול', () => {
  test('מחיקת משימה מסתירה אותה, וביטול משחזר אותה', async ({ page }) => {
    const rec = { _id: 'r_del_1', נ: 'משימה למחיקה', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await expect(page.locator('#b2')).toContainText('משימה למחיקה');

    page.once('dialog', (d) => d.accept());
    await page.click('tr:has-text("משימה למחיקה") .act-btn[title="מחק"]');
    await expect(page.locator('#b2')).not.toContainText('משימה למחיקה');
    await expect(page.locator('#savingMsg')).toContainText('ביטול');

    await page.click('#savingMsg a');
    await expect(page.locator('#b2')).toContainText('משימה למחיקה');
  });
});

test.describe('אזהרת שינויים לא שמורים', () => {
  test('סגירה בלי שינוי לא מציגה אזהרה', async ({ page }) => {
    const rec = { _id: 'r_dirty_1', נ: 'משימה לבדיקת יציאה', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה לבדיקת יציאה") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);

    let dialogShown = false;
    page.once('dialog', () => { dialogShown = true; });
    await page.evaluate(() => closeModal());
    await page.waitForTimeout(200);
    expect(dialogShown).toBe(false);
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);
  });

  test('סגירה עם שינוי מציגה אזהרה, וביטול האזהרה משאיר את החלון פתוח', async ({ page }) => {
    const rec = { _id: 'r_dirty_2', נ: 'משימה לבדיקת יציאה 2', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה לבדיקת יציאה 2") .act-btn');
    await page.fill('#f_כ', 'שיניתי משהו');

    page.once('dialog', (d) => d.dismiss());
    await page.evaluate(() => closeModal());
    await page.waitForTimeout(200);
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
  });
});

test.describe('Pagination', () => {
  test('רשימה גדולה מוצגת ב-100 בעמוד עם ניווט בין עמודים', async ({ page }) => {
    const rivka = [];
    for (let i = 0; i < 150; i++) {
      rivka.push({ _id: 'p' + i, נ: 'משימה ' + i, מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} });
    }
    await mockFirebase(page, { rivka });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await expect(page.locator('#pg2')).toContainText('עמוד 1 מתוך 2');
    const rowsPage1 = await page.locator('#b2 tr').count();
    expect(rowsPage1).toBe(100);

    await page.click('#pg2 button:has-text("הבא")');
    await expect(page.locator('#pg2')).toContainText('עמוד 2 מתוך 2');
    const rowsPage2 = await page.locator('#b2 tr').count();
    expect(rowsPage2).toBe(50);
  });
});

test.describe('קישורי קבצים - הורדה מול פתיחה', () => {
  test('PDF וקישורי אינטרנט נפתחים, שאר סוגי הקבצים מורידים', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    const result = await page.evaluate(() => ({
      pdf: shouldOpenLink('report.pdf'),
      docx: shouldOpenLink('file.docx'),
      xlsx: shouldOpenLink('sheet.xlsx'),
      sharepoint: shouldOpenLink('https://x.sharepoint.com/Doc.aspx?sourcedoc=abc'),
      directFile: shouldOpenLink('https://example.com/data.xlsx'),
    }));
    expect(result).toEqual({ pdf: true, docx: false, xlsx: false, sharepoint: true, directFile: false });
  });
});

test.describe('דוח שינויי סטטוס', () => {
  test('מציג רק שינויים בטווח התאריכים והסטטוס שנבחרו', async ({ page }) => {
    const now = Date.now();
    const day = 86400000;
    const rivka = [
      { _id: 'sr1', נ: 'בטווח', מב: 'x', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'בוצע', statusLog: [{ s: 'בוצע', t: now - 2 * day, by: 'x' }] },
      { _id: 'sr2', נ: 'מחוץ לטווח', מב: 'x', ת: '2026-06-01', כ: 'k', ב: 'b', ע: 1, ס: 'בוצע', statusLog: [{ s: 'בוצע', t: now - 40 * day, by: 'x' }] },
    ];
    await mockFirebase(page, { rivka });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('button[onclick="openStatusReport(\'rivka\')"]');
    await expect(page.locator('#statusReportResults')).toContainText('בטווח');
    await expect(page.locator('#statusReportResults')).not.toContainText('מחוץ לטווח');
  });
});

test.describe('בדיקות שפיות - הערות לכולם', () => {
  const sanity = {
    s1: { id: 's1', name: 'בדיקת מסך א', module: 'מסך א', env: 'טסט', status: 'פתוח', assignee: 'מנהלת בדיקה', notes: '', adminNotes: '' },
    s2: { id: 's2', name: 'בדיקת מסך ב', module: 'מסך ב', env: 'RDP', status: 'פתוח', assignee: '', notes: '', adminNotes: '' },
  };

  test('אדמין יכול לערוך גם "הערות בודק" וגם "Admin Notes" ישירות בטבלה', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');

    const row = page.locator('#sanityAdminBody tr', { hasText: 'בדיקת מסך א' });
    await row.locator('textarea').nth(0).fill('הערת בודק חדשה');
    await row.locator('textarea').nth(0).dispatchEvent('change');
    await row.locator('textarea').nth(1).fill('הערת אדמין חדשה');
    await row.locator('textarea').nth(1).dispatchEvent('change');
    await page.waitForTimeout(150);

    const updated = await page.evaluate(() => ({ notes: SANITY_TASKS.s1.notes, adminNotes: SANITY_TASKS.s1.adminNotes }));
    expect(updated).toEqual({ notes: 'הערת בודק חדשה', adminNotes: 'הערת אדמין חדשה' });
  });

  test('מנהל (לא אדמין) רואה ויכול לערוך את שתי שדות ההערות של בדיקה משויכת לו', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityManagerBody')).toContainText('בדיקת מסך א');

    const textareas = page.locator('#sanityManagerBody tr', { hasText: 'בדיקת מסך א' }).locator('textarea');
    await expect(textareas).toHaveCount(2);
    await textareas.nth(0).fill('עדכון מהמנהל');
    await textareas.nth(0).dispatchEvent('change');
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => SANITY_TASKS.s1.notes)).toBe('עדכון מהמנהל');
  });

  test('מנהל יכול לסמן בדיקה כ"נכשל" (לא רק "בוצע"), והיא נעלמת מהרשימה הפתוחה שלו', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityManagerBody')).toContainText('בדיקת מסך א');

    const row = page.locator('#sanityManagerBody tr', { hasText: 'בדיקת מסך א' });
    await row.locator('button', { hasText: 'נכשל' }).click();
    await expect(page.locator('#sanityNotesModal')).toBeVisible();
    await page.fill('#sanityCloseNotes', 'נפל בבדיקת שדה X');
    await page.click('#sanityCloseConfirmBtn');
    await page.waitForTimeout(150);

    const task = await page.evaluate(() => SANITY_TASKS.s1);
    expect(task.status).toBe('נכשל');
    expect(task.closedBy).toBe('מנהלת בדיקה');
    await expect(page.locator('#sanityManagerBody')).not.toContainText('בדיקת מסך א');
  });

  test('אדמין יכול לערוך מסך/מודול, סביבה וסטטוס ישירות דרך מודל העריכה', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך ב');

    const row = page.locator('#sanityAdminBody tr', { hasText: 'בדיקת מסך ב' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#sanityModal')).toBeVisible();
    await page.fill('#sanityModule', 'מודול חדש');
    await page.fill('#sanityEnv', 'PROD');
    await page.selectOption('#sanityStatus', 'נכשל');
    await page.click('button[onclick="saveSanityTask()"]');
    await page.waitForTimeout(150);

    const task = await page.evaluate(() => SANITY_TASKS.s2);
    expect(task.module).toBe('מודול חדש');
    expect(task.env).toBe('PROD');
    expect(task.status).toBe('נכשל');
    expect(task.closedBy).toBe('מנהל בדיקה');
  });
});

test.describe('רגרסיה: דריסת שדות בעריכת בדיקת שפיות (staleness, לא בעיית זהות)', () => {
  test('שמירה במודל העריכה של אדמין לא דורסת הערה שעודכנה ע"י יוזר/מסך אחר בזמן שהמודל היה פתוח', async ({ page }) => {
    const sanity = {
      s1: { id: 's1', name: 'בדיקת מסך א', module: 'מסך א', env: 'טסט', status: 'פתוח', assignee: '', notes: 'הערה מקורית', adminNotes: '' },
    };
    const { sanity: liveSanity } = await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');

    // פותחים את מודל העריכה - טוען סנאפשוט מקומי שכולל notes='הערה מקורית'
    await page.click('button[onclick="openEditSanity(\'s1\')"]');
    await expect(page.locator('#sanityModal')).toBeVisible();

    // מדמים עדכון מקביל ישירות בשרת (כאילו יוזר אחר, או מסך אחר של אותו אדמין, עדכן
    // את ההערה דרך updateSanityField בזמן שמודל העריכה הזה כבר היה פתוח)
    liveSanity.s1.notes = 'הערה שעודכנה במקביל ע"י יוזר אחר';

    // האדמין משנה שדה אחר בלבד (מודול) ושומר
    await page.fill('#sanityModule', 'מודול עודכן');
    await page.click('button[onclick="saveSanityTask()"]');
    await page.waitForTimeout(150);

    expect(liveSanity.s1.notes).toBe('הערה שעודכנה במקביל ע"י יוזר אחר');
    expect(liveSanity.s1.module).toBe('מודול עודכן');
  });
});

test.describe('רגרסיה: איבוד רשומות ביומן שינויים בפיתוחים ותיקונים (staleness)', () => {
  test('שמירת שינוי סטטוס פיתוח דרך מודל העריכה לא מוחקת רשומת יומן שנוספה במקביל ע"י יוזר אחר', async ({ page }) => {
    const { devTasks: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();

    // מדמים שינוי מקביל בשרת: יוזר אחר כבר שינה tStatus ורשם שורת יומן, בזמן שמודל העריכה הזה פתוח
    liveDevTasks['0'] = { tester: '', tStatus: 'נבדק', tNotes: '', status: '', sLog: [{ field: 'סטטוס בדיקה', s: 'נבדק', t: 111, by: 'מישהו אחר' }] };

    await page.selectOption('#devEditStatus', 'בפיתוח');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    const sLog = liveDevTasks['0'].sLog;
    expect(sLog.some(e => e.by === 'מישהו אחר' && e.s === 'נבדק')).toBe(true);
    expect(sLog.some(e => e.s === 'בפיתוח')).toBe(true);
  });
});

test.describe('משימות בעליה לאוויר', () => {
  test('אדמין רואה את הטאב, יכול להוסיף משימה חדשה ולראות אותה ברשימה', async ({ page }) => {
    const { launchTasks: liveLaunch } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await expect(page.locator('#tabLaunch')).toBeVisible();
    await page.click('.tab[data-tab="5"]');

    await page.click('button[onclick="openNewLaunch()"]');
    await expect(page.locator('#launchModal')).toBeVisible();
    await page.fill('#launchTask', 'לוודא שהממשק החדש עלה בפרוד');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    await expect(page.locator('#launchBody')).toContainText('לוודא שהממשק החדש עלה בפרוד');
    const ids = Object.keys(liveLaunch);
    expect(ids.length).toBe(1);
    expect(liveLaunch[ids[0]].status).toBe('פתוח');
  });

  test('מנהל (לא אדמין) לא רואה את הטאב', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await expect(page.locator('#tabLaunch')).toBeHidden();
  });

  test('עריכת משימה וסימון כ"בוצע" רושם מי סגר ומתי, ומחיקה מסירה מהרשימה', async ({ page }) => {
    const seed = { l1: { id: 'l1', task: 'משימה לבדיקה', status: 'פתוח', notes: '', createdAt: '2026-08-01T00:00:00.000Z' } };
    const { launchTasks: liveLaunch } = await mockFirebase(page, { launchTasks: JSON.parse(JSON.stringify(seed)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="5"]');
    await expect(page.locator('#launchBody')).toContainText('משימה לבדיקה');

    await page.click('button[onclick="openEditLaunch(\'l1\')"]');
    await expect(page.locator('#launchModal')).toBeVisible();
    await page.selectOption('#launchStatus', 'בוצע');
    await page.fill('#launchNotes', 'טופל בעליה');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    expect(liveLaunch.l1.status).toBe('בוצע');
    expect(liveLaunch.l1.closedBy).toBe('מנהל בדיקה');
    expect(liveLaunch.l1.notes).toBe('טופל בעליה');

    page.once('dialog', d => d.accept());
    await page.click('button[onclick="deleteLaunchTask(\'l1\')"]');
    await page.waitForTimeout(150);
    expect(liveLaunch.l1).toBeUndefined();
    await expect(page.locator('#launchBody')).not.toContainText('משימה לבדיקה');
  });
});

test.describe('קישור לאיפיון בפיתוחים ותיקונים', () => {
  test('הוספת קישור לאיפיון לשורה קיימת דרך מודל העריכה נשמרת ומציגה כפתור פתיחה', async ({ page }) => {
    const { devTasks: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    const link = 'https://dhlexpress.sharepoint.com/sites/focus/spec123.docx';
    await page.fill('#devEditSpecLink', link);
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks['0'].specLink).toBe(link);
    await expect(row.locator('a[href="' + link + '"]')).toHaveCount(1);
  });

  test('הוספת משימת פיתוח חדשה עם קישור לאיפיון שומרת אותו', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await page.click('button[onclick="openNewDevTask()"]');
    await expect(page.locator('#newDevModal')).toBeVisible();
    await page.fill('#ndtDesc', 'משימה חדשה עם איפיון');
    const link = 'https://teams.microsoft.com/l/file/spec456';
    await page.fill('#ndtSpecLink', link);
    await page.click('button[onclick="saveNewDevTask()"]');
    await page.waitForTimeout(150);

    const row = page.locator('#devBody tr', { hasText: 'משימה חדשה עם איפיון' });
    await expect(row.locator('a[href="' + link + '"]')).toHaveCount(1);
  });
});

test.describe('רגרסיה: שדות שלא נשמרו בכלל בעריכה הישנה (תאור/הערות/רכיב/גרסה/ממשק/הערות בודק)', () => {
  test('עריכת כל השדות דרך מודל העריכה ושמירה - כולם נשמרים בפועל בשרת ונשארים אחרי רענון', async ({ page }) => {
    const { devTasks: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();

    // עד היום השדות האלה לא היו ניתנים לעריכה בכלל, או שהעריכה שלהם לא הובילה לשמירה בפועל
    await page.fill('#devEditDesc', 'תאור משימה עודכן');
    await page.fill('#devEditNotes', 'הערת מפתח עודכנה');
    await page.fill('#devEditComp', 'COMP2');
    await page.fill('#devEditVer', '5.9999');
    await page.fill('#devEditIface', 'IFACE2');
    await page.fill('#devEditTNotes', 'הערת בודק עודכנה');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks['0']).toMatchObject({
      desc: 'תאור משימה עודכן',
      notes: 'הערת מפתח עודכנה',
      comp: 'COMP2',
      ver: '5.9999',
      iface: 'IFACE2',
      tNotes: 'הערת בודק עודכנה',
    });

    // רענון מלא של הדף - מוודא שהערכים חוזרים מהשרת ולא רק ישבו בזיכרון המקומי
    // (ההתחברות משוחזרת אוטומטית מ-sessionStorage אחרי רענון, אז אין צורך ב-login() שוב)
    await page.reload();
    await page.waitForSelector('#mainTabs', { state: 'visible' });
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('תאור משימה עודכן');
    await expect(page.locator('#devBody')).toContainText('הערת מפתח עודכנה');
    await expect(page.locator('#devBody')).toContainText('COMP2');
  });
});

test.describe('אימות כתיבה מול השרת (לא מסתפקים בתגובת HTTP 200)', () => {
  test('אם הכתיבה "מצליחה" ברמת ה-HTTP אבל לא נשמרת בפועל, האפליקציה מזהה זאת, מציגה שגיאה, ולא סוגרת את מסך העריכה', async ({ page }) => {
    await mockFirebase(page, {});
    // מיירטים במיוחד את הכתיבה לרשומה 0 ומדמים "הצלחה" מזויפת (200) שלא באמת משנה כלום בשרת
    await page.route('**/devTasks/0.json', async (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fallback();
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await page.fill('#devEditNotes', 'זה לא אמור באמת להישמר');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(300);

    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditMsg')).toContainText('האימות מול השרת נכשל');
  });

  test('אותו דבר במשימות לרבקה - כתיבה שלא נקלטת בפועל מציגה שגיאת אימות', async ({ page }) => {
    const taskA = { _id: 'A', נ: 'משימה', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [taskA] });
    await page.route('**/db/rivka.json', async (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
      return route.fallback();
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.evaluate(() => openEdit('rivka', 0));
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await page.fill('#f_כ', 'כותרת שלא תישמר');
    await page.click('button.btn-save');
    await page.waitForTimeout(300);

    await expect(page.locator('#savingMsg')).toContainText('האימות מול השרת נכשל');
  });
});
