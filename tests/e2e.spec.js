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

test.describe('בדיקות שפיות - הערות לכולם ושיוך מרוכז', () => {
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

  test('שיוך מרוכז משייך לפי שם בדיקה מדויק, ומדווח על שורות שלא זוהו', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await page.click('button[onclick="openSanityBulkModal()"]');
    await page.fill('#sanityBulkInput', 'בדיקת מסך א\tרבקה\nבדיקת מסך ב\tעדו\nבדיקה שלא קיימת\tמישהו');
    await page.click('button[onclick="applySanityBulkAssign()"]');
    await expect(page.locator('#sanityBulkResult')).toContainText('שויכו 2 בדיקות בהצלחה');
    await expect(page.locator('#sanityBulkResult')).toContainText('לא נמצאה בדיקה בשם "בדיקה שלא קיימת"');

    const assignees = await page.evaluate(() => ({ s1: SANITY_TASKS.s1.assignee, s2: SANITY_TASKS.s2.assignee }));
    expect(assignees).toEqual({ s1: 'רבקה', s2: 'עדו' });
  });
});
