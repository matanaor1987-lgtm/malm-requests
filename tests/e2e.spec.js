// בדיקות E2E למערכת בקשות מלמ.
// כל בדיקה עובדת מול Firebase מדומה (ראו helpers.js) - אף בדיקה לא נוגעת בנתונים אמיתיים.
const { test, expect } = require('@playwright/test');
const { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll } = require('./helpers');

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

test.describe('רגרסיה: פריסת התפריט העליון בטאב משתמשים', () => {
  test('כניסה לטאב "משתמשים" לא מזיזה את התפריט העליון (מיקום #pane2 בדף חייב להיות אחרי #mainTabs)', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');

    const tabsBoxBefore = await page.locator('#mainTabs').boundingBox();
    await page.click('.tab[data-tab="2"]');
    await expect(page.locator('#pane2')).toHaveClass(/active/);
    const tabsBoxAfter = await page.locator('#mainTabs').boundingBox();

    // הבאג המקורי הזיז את התפריט מאות פיקסלים למטה (כי #pane2 היה מופיע לפניו ב-DOM
    // ונדחף מעליו כשהיה פעיל) - סובלנות קטנה כאן היא בגלל גלילה/רינדור, לא סימן לבאג.
    expect(Math.abs(tabsBoxAfter.y - tabsBoxBefore.y)).toBeLessThan(20);

    // בדיקה מבנית נוספת: #pane2 חייב לבוא אחרי #mainTabs ב-DOM, לא לפניו
    const mainTabsBeforePane2 = await page.evaluate(() => {
      const tabs = document.getElementById('mainTabs');
      const pane2 = document.getElementById('pane2');
      return !!(tabs.compareDocumentPosition(pane2) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(mainTabsBeforePane2).toBe(true);
  });
});

test.describe('סינון עדיפות בבחירה מרובה (מלמ ורבקה)', () => {
  test('טאב מלמ כולל: אפשר לבחור כמה עדיפויות בו-זמנית, ו"נקה" (הכל מסומן) מחזיר הכל', async ({ page }) => {
    const malm = [
      { _id: 'm1', ת: '2026-07-01', ד: 'תחום א', מ: 'משימת עדיפות 1', ע: 1, ס: 'פתוח', dhl: '', א: '', ה: '', chat: {}, reads: {} },
      { _id: 'm2', ת: '2026-07-01', ד: 'תחום א', מ: 'משימת עדיפות 3', ע: 3, ס: 'פתוח', dhl: '', א: '', ה: '', chat: {}, reads: {} },
      { _id: 'm3', ת: '2026-07-01', ד: 'תחום א', מ: 'משימת עדיפות 5', ע: 5, ס: 'פתוח', dhl: '', א: '', ה: '', chat: {}, reads: {} },
    ];
    await mockFirebase(page, { malm });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="0"]');
    await expect(page.locator('#b1')).toContainText('משימת עדיפות 1');

    await msfSelectOnly(page, 'malmPr', ['1', '3']);
    await expect(page.locator('#b1')).toContainText('משימת עדיפות 1');
    await expect(page.locator('#b1')).toContainText('משימת עדיפות 3');
    await expect(page.locator('#b1')).not.toContainText('משימת עדיפות 5');
    await expect(page.locator('#msf_malmPr_btn')).toHaveText('2 עדיפויות ▾');

    await msfSelectAll(page, 'malmPr');
    await expect(page.locator('#b1')).toContainText('משימת עדיפות 5');
    await expect(page.locator('#msf_malmPr_btn')).toHaveText('כל העדיפויות ▾');
  });

  test('טאב משימות לרבקה: אפשר לבחור כמה עדיפויות בו-זמנית', async ({ page }) => {
    const rivka = [
      { _id: 'r1', נ: 'משימה עדיפות 2', מב: 'מנהל בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 2, ס: 'פתוח', chat: {} },
      { _id: 'r2', נ: 'משימה עדיפות 4', מב: 'מנהל בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 4, ס: 'פתוח', chat: {} },
    ];
    await mockFirebase(page, { rivka });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await expect(page.locator('#b2')).toContainText('משימה עדיפות 2');

    await msfSelectOnly(page, 'rivkaPr', ['4']);
    await expect(page.locator('#b2')).not.toContainText('משימה עדיפות 2');
    await expect(page.locator('#b2')).toContainText('משימה עדיפות 4');
    await expect(page.locator('#msf_rivkaPr_btn')).toHaveText('4 ▾');
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

test.describe('רגרסיה: אימות שמירה מול שרת שמגזם צמתים ריקים (כמו Firebase אמיתי)', () => {
  // תקלה ותיקה: Firebase Realtime Database לא שומר צומת עם ערך {} - כתיבתו שקולה
  // למחיקתו. ברשומה חדשה יש שדות ריקים כאלה (chat:{}, reads:{}), כך שהשוואת
  // deepEqual בין מה שכתבנו למה שחזר מהשרת נכשלה תמיד גם כשהכתיבה בפועל הצליחה -
  // "שגיאה: האימות מול השרת נכשל" מופיע בכל שמירה, למרות שהמשימה כן נשמרה.
  // helpers.js מדמה עכשיו את הגיזום הזה (firebasePrune) כדי שהבדיקות יתפסו את זה.
  test('שמירת משימת מלמ חדשה לא מציגה שגיאת אימות שווא', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="0"]');
    await page.click('#btnAdd');
    await page.fill('#f_ד', 'תחום בדיקה');
    await page.fill('#f_מ', 'משימת מלמ חדשה לבדיקת אימות');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);
    await expect(page.locator('#b1')).toContainText('משימת מלמ חדשה לבדיקת אימות');
    await expect(page.locator('#savingMsg')).toContainText('נשמר');
    await expect(page.locator('#savingMsg')).not.toContainText('שגיאה');
  });

  test('שמירת משימה חדשה ברבקה לא מציגה שגיאת אימות שווא', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('#btnAdd');
    await page.fill('#f_נ', 'משימה חדשה לבדיקת אימות');
    await page.fill('#f_כ', 'כותרת');
    await page.fill('#f_ב', 'תוכן');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);
    await expect(page.locator('#b2')).toContainText('משימה חדשה לבדיקת אימות');
    await expect(page.locator('#savingMsg')).toContainText('נשמר');
    await expect(page.locator('#savingMsg')).not.toContainText('שגיאה');
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

test.describe('סינון בטבלת בדיקות שפיות לפי מבצע וסטטוס', () => {
  const sanity3 = {
    s1: { id: 's1', name: 'בדיקת מסך א', module: 'מסך א', env: 'טסט', status: 'פתוח', assignee: 'מנהלת בדיקה', notes: '', adminNotes: '' },
    s2: { id: 's2', name: 'בדיקת מסך ב', module: 'מסך ב', env: 'RDP', status: 'בוצע', assignee: 'מנהל בדיקה', notes: '', adminNotes: '' },
    s3: { id: 's3', name: 'בדיקת מסך ג', module: 'מסך ג', env: 'טסט', status: 'פתוח', assignee: 'מנהל בדיקה', notes: '', adminNotes: '' },
  };

  test('אפשר לסנן לפי מבצע ולפי סטטוס, כל אחד בנפרד ובשילוב, ו"נקה סינון" מחזיר הכל', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity3)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(3);

    await msfSelectOnly(page, 'sanityAssignee', ['מנהל בדיקה']);
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(2);
    await expect(page.locator('#sanityAdminBody tr:visible', { hasText: 'בדיקת מסך א' })).toHaveCount(0);

    await msfSelectOnly(page, 'sanityStatus', ['בוצע']);
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(1);
    await expect(page.locator('#sanityAdminBody tr:visible')).toContainText('בדיקת מסך ב');

    await page.click('button[onclick="clearSanityFilters()"]');
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(3);
  });

  test('אפשר לבחור כמה מבצעים בו-זמנית (בחירה מרובה)', async ({ page }) => {
    await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanity3)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');

    await msfSelectOnly(page, 'sanityAssignee', ['מנהלת בדיקה', 'מנהל בדיקה']);
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(3);
    await expect(page.locator('#msf_sanityAssignee_btn')).toHaveText('כל המבצעים ▾');

    await msfSelectOnly(page, 'sanityAssignee', []);
    await expect(page.locator('#sanityAdminBody tr:visible')).toHaveCount(0);
    await expect(page.locator('#msf_sanityAssignee_btn')).toHaveText('ללא מבצע ▾');
  });

  test('רשימת "מבצע" בפילטר מציגה רק משתמשים שבפועל משויכים לבדיקה כלשהי - לא את כל משתמשי המערכת', async ({ page }) => {
    await mockFirebase(page, {
      users: seedUsers([{ name: 'משתמש בלי אף בדיקה', username: 'nobody', password: 'pw', role: 'admin', email: 'nobody@test.local' }]),
      sanity: JSON.parse(JSON.stringify(sanity3))
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');

    await expect(page.locator('.msfcb_sanityAssignee[value="מנהל בדיקה"]')).toHaveCount(1);
    await expect(page.locator('.msfcb_sanityAssignee[value="מנהלת בדיקה"]')).toHaveCount(1);
    await expect(page.locator('.msfcb_sanityAssignee[value="משתמש בלי אף בדיקה"]')).toHaveCount(0);

    // לעומת זאת, ה-DROPDOWN של שיוך מבצע בטופס הבדיקה עצמו כן מציג את כולם - כדי שאפשר יהיה לשייך אליו בדיקה
    await page.click('button[onclick="openEditSanity(\'s1\')"]');
    await expect(page.locator('#sanityModal')).toBeVisible();
    await expect(page.locator('#sanityAssignee option', { hasText: 'משתמש בלי אף בדיקה' })).toHaveCount(1);
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
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();

    // מדמים שינוי מקביל בשרת: יוזר אחר כבר שינה tStatus ורשם שורת יומן, בזמן שמודל העריכה הזה פתוח
    liveDevTasks['dt_001'] = { tester: '', tStatus: 'נבדק', tNotes: '', status: '', sLog: [{ field: 'סטטוס בדיקה', s: 'נבדק', t: 111, by: 'מישהו אחר' }] };

    await page.selectOption('#devEditStatus', 'בפיתוח');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    const sLog = liveDevTasks['dt_001'].sLog;
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

  test('אפשר לסמן דחיפות (מיד / בהמשך) למשימה חדשה, וזה מוצג כתג בטבלה', async ({ page }) => {
    const { launchTasks: liveLaunch } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="5"]');

    await page.click('button[onclick="openNewLaunch()"]');
    await page.fill('#launchTask', 'משימה דחופה לבדיקה');
    await page.selectOption('#launchTiming', 'מיד');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    const row = page.locator('#launchBody tr', { hasText: 'משימה דחופה לבדיקה' });
    await expect(row).toContainText('מיד לאחר העליה');
    const ids = Object.keys(liveLaunch);
    expect(liveLaunch[ids[0]].timing).toBe('מיד');
  });

  test('אפשר לשנות דחיפות בעריכה, ומשימה ישנה בלי דחיפות מוצגת עם "—" ולא נכפה עליה ערך', async ({ page }) => {
    const seed = { l2: { id: 'l2', task: 'משימה ישנה בלי דחיפות', status: 'פתוח', notes: '', createdAt: '2026-08-01T00:00:00.000Z' } };
    const { launchTasks: liveLaunch } = await mockFirebase(page, { launchTasks: JSON.parse(JSON.stringify(seed)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="5"]');

    // משימה ישנה שלא סומנה - מוצגת עם "—", לא עם אחד מהערכים
    const row = page.locator('#launchBody tr', { hasText: 'משימה ישנה בלי דחיפות' });
    await expect(row).toContainText('—');
    await expect(row).not.toContainText('מיד לאחר העליה');
    await expect(row).not.toContainText('בימים שלאחר מכן');

    await page.click('button[onclick="openEditLaunch(\'l2\')"]');
    await expect(page.locator('#launchTiming')).toHaveValue(''); // לא נכפה ערך במודל העריכה
    await page.selectOption('#launchTiming', 'בהמשך');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    await expect(row).toContainText('בימים שלאחר מכן');
    expect(liveLaunch.l2.timing).toBe('בהמשך');
  });
});

test.describe('קישור לאיפיון בפיתוחים ותיקונים', () => {
  test('הוספת קישור לאיפיון לשורה קיימת דרך מודל העריכה נשמרת ומציגה כפתור פתיחה', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
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

    expect(liveDevTasks['dt_001'].specLink).toBe(link);
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
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
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

    expect(liveDevTasks['dt_001']).toMatchObject({
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
    // מיירטים במיוחד את הכתיבה למשימה 13770 ומדמים "הצלחה" מזויפת (200) שלא באמת משנה כלום בשרת
    await page.route('**/devTasksByUid/dt_001.json', async (route) => {
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

test.describe('רגרסיה: מיון בטבלת פיתוחים ותיקונים לא ישבש את המשימה שנשמרת', () => {
  test('מיון העמודות, ואז עריכה ושמירה של משימה - נשמרת על המשימה הנכונה, לא על אחרת שקפצה למקומה', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    // ממיינים לפי "מפתח" - זה שינה בעבר את סדר DEV_TASKS בפועל ולא רק את התצוגה
    await page.click('th[onclick="sortDevTable(\'dev\')"]');
    await page.waitForTimeout(100);

    // עורכים ושומרים את המשימה "13770" (איפה שהיא לא נמצאת עכשיו בתצוגה הממוינת)
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditDesc')).toHaveValue(/שינוי בחירת יבואן/);
    await page.fill('#devEditNotes', 'הערה שנוספה אחרי מיון');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    // הרשומה שנשמרה בפועל בשרת נשמרת לפי מזהה המשימה היציב "13770" - לא רשומה אחרת
    expect(liveDevTasks['dt_001'].notes).toBe('הערה שנוספה אחרי מיון');
    expect(Object.keys(liveDevTasks)).toEqual(['dt_001']);

    // רענון מלא - מוודאים שההערה נחתה על המשימה הנכונה ולא "נעלמה" מבחינת המשתמש
    await page.reload();
    await page.waitForSelector('#mainTabs', { state: 'visible' });
    await page.click('.tab[data-tab="3"]');
    const reloadedRow = page.locator('#devBody tr', { hasText: '13770' });
    await expect(reloadedRow).toContainText('הערה שנוספה אחרי מיון');
  });

  test('גם אם סדר DEV_TASKS משתנה לגמרי בזמן שמודל העריכה פתוח (סיבה כלשהי, לא רק מיון), השמירה עדיין נופלת על המשימה הנכונה', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();

    // הופכים לגמרי את סדר המערך בזיכרון בזמן שהמודל פתוח - מדמה כל תרחיש עתידי
    // אפשרי של שינוי סדר, לא רק מיון (שכבר לא באמת קורה, אבל ההגנה צריכה להיות עקרונית)
    await page.evaluate(() => { DEV_TASKS.reverse(); });

    await page.fill('#devEditNotes', 'עדיין אמור לנחות על 13770');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    expect(liveDevTasks['dt_001'].notes).toBe('עדיין אמור לנחות על 13770');
    expect(Object.keys(liveDevTasks)).toEqual(['dt_001']);
  });
});

test.describe('משימת פיתוח בלי מספר משימה (מזהה עסקי) - עדיין נשמרת ונערכת תקין', () => {
  test('יצירת משימה חדשה בלי למלא מספר משימה, ועריכה שלה אחר כך - שתיהן עובדות כי הזהות מבוססת על מזהה פנימי, לא על המספר', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await page.click('button[onclick="openNewDevTask()"]');
    await expect(page.locator('#newDevModal')).toBeVisible();
    // בכוונה לא ממלאים את "מספר משימה"
    await page.fill('#ndtDesc', 'משימה בלי מספר משימה כלל');
    await page.click('button[onclick="saveNewDevTask()"]');
    await page.waitForTimeout(150);

    const savedIds = Object.keys(liveDevTasks);
    expect(savedIds.length).toBe(1);
    expect(liveDevTasks[savedIds[0]].id).toBe('');
    expect(liveDevTasks[savedIds[0]].desc).toBe('משימה בלי מספר משימה כלל');

    const row = page.locator('#devBody tr', { hasText: 'משימה בלי מספר משימה כלל' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await page.fill('#devEditNotes', 'עריכה אחרי יצירה בלי מספר משימה');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks[savedIds[0]].notes).toBe('עריכה אחרי יצירה בלי מספר משימה');
  });
});

test.describe('אדמין יכול לערוך כל שדה שמוצג בטבלאות', () => {
  test('מספר משימה ניתן לעריכה במודל העריכה של פיתוחים ותיקונים', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTaskNum')).toHaveValue('13770');
    await page.fill('#devEditTaskNum', '99999');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks['dt_001'].id).toBe('99999');
    await expect(page.locator('#devBody')).toContainText('99999');
    await expect(page.locator('#devBody')).not.toContainText('13770');
  });

  test('אדמין יכול לערוך את שדה "מבקש" (DROPDOWN ממשתמשי המערכת) במשימות לרבקה, ומנהל (לא אדמין) לא רואה את השדה הזה', async ({ page }) => {
    const rec = { _id: 'r1', נ: 'משימה', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מב option:checked')).toHaveText('מנהלת בדיקה (manager)');
    await page.selectOption('#f_מב', { label: 'מנהל בדיקה (admin)' });
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const savedMav = await page.evaluate(() => DB.rivka.find(r => r._id === 'r1').מב);
    expect(savedMav).toBe('מנהל בדיקה');
  });

  test('מנהל (לא אדמין) לא רואה שדה "מבקש" בעריכה', async ({ page }) => {
    const rec = { _id: 'r2', נ: 'משימה 2', מב: 'מנהלת בדיקה', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await page.click('tr:has-text("משימה 2") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מב')).toHaveCount(0);
  });
});

test.describe('ניהול רשימות DROPDOWN בטאב פיתוחים ותיקונים לבדיקה', () => {
  test('אדמין יכול להוסיף אפשרות חדשה לרשימת "סטטוס בדיקה", היא נשמרת בשרת ומופיעה מיד ב-DROPDOWN של מודל העריכה', async ({ page }) => {
    const { devLists: liveDevLists } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    await page.click('button[onclick="openDevListsModal()"]');
    await expect(page.locator('#devListsModal')).toBeVisible();
    await page.fill('#devListNew_tStatus', 'ממתין לסביבת בדיקה');
    await page.click('button[onclick="addDevListOption(\'tStatus\')"]');
    await page.waitForTimeout(150);

    // נשמר בפועל בשרת (לא רק בזיכרון המקומי)
    expect(liveDevLists.tStatus).toContain('ממתין לסביבת בדיקה');
    await expect(page.locator('#devListsMsg')).toContainText('נשמר');
    await page.click('button[onclick="closeDevListsModal()"]');

    // פותחים משימה לעריכה - האפשרות החדשה קיימת ב-DROPDOWN בלי לגעת בקוד
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTStatus option[value="ממתין לסביבת בדיקה"]')).toHaveCount(1);
  });

  test('אדמין יכול להסיר אפשרות מרשימה קיימת ("סטטוס פיתוח"), וההסרה נשמרת בשרת', async ({ page }) => {
    const { devLists: liveDevLists } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');

    await page.click('button[onclick="openDevListsModal()"]');
    await expect(page.locator('#devListsModal')).toBeVisible();
    // מסירים את "נבדק" מרשימת סטטוס פיתוח
    await page.locator('#devListsBody span', { hasText: 'נבדק' }).locator('button').click();
    await page.waitForTimeout(150);

    expect(liveDevLists.status).not.toContain('נבדק');
    await expect(page.locator('#devListsBody')).not.toContainText('נבדק');
  });

  test('"בודק DHL" אינו ברשימה הניתנת לעריכה כאן - הוא מנוהל כשיוך למשתמש (ראו התיאור הבא)', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await page.click('button[onclick="openDevListsModal()"]');
    await expect(page.locator('#devListsModal')).toBeVisible();
    await expect(page.locator('#devListsBody')).not.toContainText('בודק DHL');
  });

  test('מנהל (לא אדמין) לא רואה כלל את הטאב, ולכן לא יכול לגשת לניהול הרשימות', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await expect(page.locator('#tabDev')).toBeHidden();
  });
});

test.describe('שיוך "בודק DHL" למשתמש אמיתי (כמו מבצע בדיקות שפיות) + מייל התראה', () => {
  test('רשימת בודק DHL במודל העריכה מגיעה מכל משתמשי המערכת (אפשר לשייך משימה לכל אחד), לא מרשימה חופשית', async ({ page }) => {
    await mockFirebase(page, { users: seedUsers([{ name: 'עידו הבודק', username: 'ido_t', password: 'pw', role: 'admin', email: 'ido.tester@test.local' }]) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option', { hasText: 'עידו הבודק' })).toHaveCount(1);
    await expect(page.locator('#devEditTester option', { hasText: 'מנהל בדיקה' })).toHaveCount(1);
  });

  test('שיוך בודק חדש שולח מייל התראה למשתמש המשויך, ושמירה חוזרת בלי לשנות בודק לא שולחת שוב', async ({ page }) => {
    await mockFirebase(page, { users: seedUsers([{ name: 'עידו הבודק', username: 'ido_t', password: 'pw', role: 'admin', email: 'ido.tester@test.local' }]) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    // מדמים את emailjs (חסום ב-CDN בבדיקות) כדי שנוכל לתפוס את הקריאה בלי לגעת ברשת אמיתית
    await page.evaluate(() => {
      window.__emailCalls = [];
      window.emailjs = { send: function(service, template, params) { window.__emailCalls.push(params); return Promise.resolve(); } };
    });
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    // ה-DROPDOWN מציג ערך = _uid של המשתמש (לא השם), לכן בוחרים לפי התווית הנראית
    await page.selectOption('#devEditTester', { label: 'עידו הבודק (admin)' });
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    let calls = await page.evaluate(() => window.__emailCalls);
    expect(calls.length).toBe(1);
    expect(calls[0].to_email).toBe('ido.tester@test.local');
    expect(calls[0].to_name).toBe('עידו הבודק');

    // שמירה חוזרת בלי לשנות את הבודק - לא אמורה לשלוח מייל שוב
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option:checked')).toHaveText('עידו הבודק (admin)');
    await page.fill('#devEditTNotes', 'הערה בלי לשנות בודק');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    calls = await page.evaluate(() => window.__emailCalls);
    expect(calls.length).toBe(1);
  });
});

test.describe('מזהה פנימי יציב (_uid) למשתמשים, ותיקון שיוכי בודק DHL ישנים', () => {
  test('כל משתמש מקבל אוטומטית _uid יציב בטעינה, גם אם לא היה לו קודם', async ({ page }) => {
    await mockFirebase(page, {}); // seedUsers() ברירת המחדל - בלי _uid
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    const uids = await page.evaluate(() => DB.users.map(u => u._uid));
    expect(uids.every(Boolean)).toBe(true);
    expect(new Set(uids).size).toBe(uids.length); // כולם ייחודיים
  });

  test('פתיחת משימה עם שיוך בודק ישן ("עידו") שמתאים חד-משמעית למשתמש קיים ("עידו אפרתי") - נבחר אוטומטית ב-DROPDOWN', async ({ page }) => {
    await mockFirebase(page, {
      users: seedUsers([{ name: 'עידו אפרתי', username: 'ido_a', password: 'pw', role: 'admin', email: 'ido.a@test.local' }]),
      devTasksByUid: { dt_001: { tester: 'עידו', tStatus: '', tNotes: '', status: '' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option:checked')).toHaveText('עידו אפרתי (admin)');
  });

  test('שיוך ישן ("עידו") בלי שום משתמש תואם - לא נבחר כלום אוטומטית, מוצג כ"שיוך ישן" ולא נמחק אם שומרים בלי לגעת', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {
      devTasksByUid: { dt_001: { tester: 'עידו', tStatus: '', tNotes: '', status: '' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option', { hasText: 'שיוך ישן' })).toHaveCount(1);
    await page.fill('#devEditTNotes', 'לא נוגעים בבודק');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks['dt_001'].tester).toBe('עידו');
    expect(liveDevTasks['dt_001'].testerUid || '').toBe('');
  });

  test('אדמין יכול להגדיר כינוי (שם נוסף) למשתמש בטאב משתמשים, נשמר ומוצג ברשימה', async ({ page }) => {
    const { db } = await mockFirebase(page, { users: seedUsers([{ name: 'עדו אפרתי', username: 'edo_a', password: 'pw', role: 'admin', email: 'edo.a@test.local' }]) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="2"]');
    await expect(page.locator('#usersList')).toContainText('עדו אפרתי');

    const row = page.locator('#usersList > div', { hasText: 'עדו אפרתי' });
    await row.locator('button', { hasText: 'ערוך' }).click();
    await row.locator('.eu_aliases').fill('עידו, Ido');
    await row.locator('.eu_save').click();
    await page.waitForTimeout(150);

    const savedUser = db.users.find(u => u.name === 'עדו אפרתי');
    expect(savedUser.aliases).toEqual(['עידו', 'Ido']);
    await expect(page.locator('#usersList')).toContainText('גם: עידו, Ido');
  });

  test('כינוי מוגדר ("עידו" -> "עדו אפרתי") מזהה אוטומטית משימה עם שיוך בודק ישן בפתיחתה, ונשמר בפועל', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {
      users: seedUsers([{ name: 'עדו אפרתי', username: 'edo_a', password: 'pw', role: 'admin', email: 'edo.a@test.local', aliases: ['עידו'] }]),
      devTasksByUid: {
        dt_001: { tester: 'עידו', tStatus: '', tNotes: '', status: '' }
      }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');

    // פתיחת משימה בודדת - נבחר אוטומטית לפי הכינוי
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option:checked')).toHaveText('עדו אפרתי (admin)');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(150);

    expect(liveDevTasks['dt_001'].testerUid).toBeTruthy();
    expect(liveDevTasks['dt_001'].tester).toBe('עדו אפרתי');
  });
});

test.describe('שיוך "מטפל" במשימות לרבקה למשתמש אמיתי (אותו מנגנון UID כמו בודק DHL)', () => {
  test('שדה מטפל הוא DROPDOWN ממשתמשי המערכת, מתאים אוטומטית שיוך ישן ("עידו") לפי כינוי, ושומר Uid+שם', async ({ page }) => {
    const rec = { _id: 'r1', נ: 'משימה', מב: 'מנהלת בדיקה', מט: 'עידו', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, {
      rivka: [rec],
      users: seedUsers([{ name: 'עדו אפרתי', username: 'edo_a', password: 'pw', role: 'admin', email: 'edo.a@test.local', aliases: ['עידו'] }])
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    // הכינוי ("עידו") מזהה אוטומטית את "עדו אפרתי" ב-DROPDOWN
    await expect(page.locator('#f_מט option:checked')).toHaveText('עדו אפרתי (admin)');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const saved = await page.evaluate(() => DB.rivka.find(r => r._id === 'r1'));
    expect(saved.מט).toBe('עדו אפרתי');
    expect(saved.מטUid).toBeTruthy();
  });

  test('שיוך מטפל ישן בלי שום התאמה - נשמר לא נוגעים בו אם לא בוחרים ידנית, וגם מנהל שעורך משימה שלו לא מוחק אותו בטעות', async ({ page }) => {
    const rec = { _id: 'r2', נ: 'משימה 2', מב: 'מנהלת בדיקה', מט: 'שם שלא קיים בכלל', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה 2") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מט option', { hasText: 'שיוך ישן' })).toHaveCount(1);
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    let saved = await page.evaluate(() => DB.rivka.find(r => r._id === 'r2'));
    expect(saved.מט).toBe('שם שלא קיים בכלל');
    expect(saved.מטUid || '').toBe('');

    // מנהלת בדיקה (לא אדמין) עורכת את אותה משימה (שהיא ה"מבקש" שלה) - שדה מטפל
    // כלל לא מוצג לה, וזה בעבר איפס את השדה בשמירה (g('f_מט') על אלמנט לא קיים)
    await page.click('#btnOut');
    await login(page, 'testmgr', 'pw');
    await page.click('tr:has-text("משימה 2") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מט')).toHaveCount(0);
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    saved = await page.evaluate(() => DB.rivka.find(r => r._id === 'r2'));
    expect(saved.מט).toBe('שם שלא קיים בכלל');
  });
});

test.describe('שיוך "מבקש" במשימות לרבקה למשתמש אמיתי - בלי לגעת אף פעם בערכים לא-תואמים', () => {
  test('שדה מבקש הוא DROPDOWN ממשתמשי המערכת, מתאים אוטומטית שיוך ישן לפי כינוי, ושומר Uid+שם', async ({ page }) => {
    const rec = { _id: 'r1', נ: 'משימה', מב: 'עידו', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, {
      rivka: [rec],
      users: seedUsers([{ name: 'עדו אפרתי', username: 'edo_a', password: 'pw', role: 'admin', email: 'edo.a@test.local', aliases: ['עידו'] }])
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מב option:checked')).toHaveText('עדו אפרתי (admin)');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const saved = await page.evaluate(() => DB.rivka.find(r => r._id === 'r1'));
    expect(saved.מב).toBe('עדו אפרתי');
    expect(saved.מבUid).toBeTruthy();
  });

  test('שיוך מבקש ישן בלי שום התאמה לעולם לא נדרס/נמחק - נשאר בדיוק כמו שהיה, גם אחרי שמירה', async ({ page }) => {
    const rec = { _id: 'r2', נ: 'משימה 2', מב: 'שם שלא קיים בכלל', ת: '2026-07-01', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה 2") .act-btn');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#f_מב option', { hasText: 'שיוך ישן' })).toHaveCount(1);
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const saved = await page.evaluate(() => DB.rivka.find(r => r._id === 'r2'));
    expect(saved.מב).toBe('שם שלא קיים בכלל');
    expect(saved.מבUid || '').toBe('');
  });

  test('משימה חדשה שנוצרת ע"י אדמין דרך "+ משימה חדשה" מקבלת מבUid אוטומטית (מה שיפתח מעכשיו כבר מקושר)', async ({ page }) => {
    await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('#btnAdd');
    await page.fill('#f_נ', 'משימה חדשה עם מבקש אוטומטי');
    await page.fill('#f_כ', 'כותרת');
    await page.fill('#f_ב', 'תוכן');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    const saved = await page.evaluate(() => DB.rivka.find(r => r.נ === 'משימה חדשה עם מבקש אוטומטי'));
    expect(saved.מב).toBe('מנהל בדיקה');
    expect(saved.מבUid).toBeTruthy();
  });
});

test.describe('סטטוס בדיקה "לבדיקה בעליה לאוויר" - יצירת משימה מקושרת אוטומטית', () => {
  test('בחירת הסטטוס יוצרת אוטומטית משימה מקושרת בטאב "משימות בעליה לאוויר", עם ניווט הלוך ושוב', async ({ page }) => {
    const { devTasksByUid: liveDevTasks, launchTasks: liveLaunch } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await page.selectOption('#devEditTStatus', 'לבדיקה בעליה לאוויר');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(300);

    // המשימה נשמרה עם קישור, ונוצרה בפועל משימה חדשה בשרת בטאב עליה לאוויר
    expect(liveDevTasks['dt_001'].tStatus).toBe('לבדיקה בעליה לאוויר');
    const launchId = liveDevTasks['dt_001'].linkedLaunchId;
    expect(launchId).toBeTruthy();
    expect(liveLaunch[launchId]).toBeTruthy();
    expect(liveLaunch[launchId].linkedDevUid).toBe('dt_001');
    expect(liveLaunch[launchId].linkedDevTaskNum).toBe('13770');
    expect(liveLaunch[launchId].status).toBe('פתוח');

    // כפתור ניווט מטאב הפיתוחים לטאב עליה לאוויר
    await expect(page.locator('#devBody tr', { hasText: '13770' }).locator('button[title*="עבר למשימה המקושרת"]')).toBeVisible();
    await page.locator('#devBody tr', { hasText: '13770' }).locator('button[title*="עבר למשימה המקושרת"]').click();
    await expect(page.locator('.tab[data-tab="5"]')).toHaveClass(/active/);
    await expect(page.locator('#launchBody')).toContainText('13770');

    // וכפתור ניווט חזרה מטאב עליה לאוויר לטאב הפיתוחים
    await page.locator('#launchBody button', { hasText: 'מקושר למשימת פיתוח' }).click();
    await expect(page.locator('.tab[data-tab="3"]')).toHaveClass(/active/);
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTaskNum')).toHaveValue('13770');
  });

  test('רגרסיה: עריכה ושמירה של המשימה המקושרת עצמה בטאב "משימות בעליה לאוויר" לא מוחקת את הקישור חזרה למשימת הפיתוח', async ({ page }) => {
    const { devTasksByUid: liveDevTasks, launchTasks: liveLaunch } = await mockFirebase(page, {
      devTasksByUid: { dt_001: { tester: '', tStatus: 'לבדיקה בעליה לאוויר', tNotes: '', status: '', linkedLaunchId: 'launch_existing' } },
      launchTasks: { launch_existing: { id: 'launch_existing', task: 'בדיקה בעליה לאוויר — משימת פיתוח 13770', status: 'פתוח', notes: '', closedBy: '', closedAt: '', createdAt: '2026-08-01T00:00:00.000Z', linkedDevUid: 'dt_001', linkedDevTaskNum: '13770' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="5"]');
    await expect(page.locator('#launchBody')).toContainText('13770');

    // עורכים את המשימה בטאב עליה לאוויר עצמו (לא דרך הקישור) - כמו שמנהל היה עושה בפועל
    await page.click('button[onclick="openEditLaunch(\'launch_existing\')"]');
    await expect(page.locator('#launchModal')).toBeVisible();
    await page.fill('#launchNotes', 'עדכנתי הערה על המשימה');
    await page.selectOption('#launchStatus', 'בוצע');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    // הקישור חזרה למשימת הפיתוח (uid ומספר משימה) חייב להישאר אחרי השמירה
    expect(liveLaunch['launch_existing'].linkedDevUid).toBe('dt_001');
    expect(liveLaunch['launch_existing'].linkedDevTaskNum).toBe('13770');
    expect(liveLaunch['launch_existing'].notes).toBe('עדכנתי הערה על המשימה');
    expect(liveLaunch['launch_existing'].status).toBe('בוצע');
    await expect(page.locator('#launchBody button', { hasText: 'מקושר למשימת פיתוח' })).toBeVisible();
  });

  test('שמירה חוזרת כשהסטטוס כבר "לבדיקה בעליה לאוויר" לא יוצרת משימה מקושרת כפולה', async ({ page }) => {
    const { devTasksByUid: liveDevTasks, launchTasks: liveLaunch } = await mockFirebase(page, {
      devTasksByUid: { dt_001: { tester: '', tStatus: 'לבדיקה בעליה לאוויר', tNotes: '', status: '', linkedLaunchId: 'launch_existing' } },
      launchTasks: { launch_existing: { id: 'launch_existing', task: 'קיים כבר', status: 'פתוח', notes: '', closedBy: '', closedAt: '', createdAt: '2026-08-01T00:00:00.000Z', linkedDevUid: 'dt_001', linkedDevTaskNum: '13770' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTStatus')).toHaveValue('לבדיקה בעליה לאוויר');
    await page.fill('#devEditTNotes', 'הערה נוספת בלי לשנות סטטוס');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    expect(Object.keys(liveLaunch)).toEqual(['launch_existing']);
    expect(liveDevTasks['dt_001'].linkedLaunchId).toBe('launch_existing');
  });

  test('אפשר לבחור גם את הסטטוס החדש "לא רלוונטי" והוא נשמר כרגיל', async ({ page }) => {
    const { devTasksByUid: liveDevTasks } = await mockFirebase(page, {});
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await page.selectOption('#devEditTStatus', 'לא רלוונטי');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(200);

    expect(liveDevTasks['dt_001'].tStatus).toBe('לא רלוונטי');
    await expect(page.locator('#devBody tr', { hasText: '13770' })).toContainText('לא רלוונטי');
  });
});

test.describe('סטטוס "לבדיקה בעליה לאוויר" בבדיקות שפיות - יצירת משימה מקושרת אוטומטית (כמו בפיתוחים ותיקונים)', () => {
  const sanitySeed = {
    s1: { id: 's1', name: 'בדיקת מסך א', module: 'מסך א', env: 'טסט', status: 'פתוח', assignee: 'מנהלת בדיקה', notes: '', adminNotes: '' },
  };

  test('בחירת הסטטוס יוצרת אוטומטית משימה מקושרת בטאב "משימות בעליה לאוויר", עם ניווט הלוך ושוב', async ({ page }) => {
    const { sanity: liveSanity, launchTasks: liveLaunch } = await mockFirebase(page, { sanity: JSON.parse(JSON.stringify(sanitySeed)) });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await expect(page.locator('#sanityAdminBody')).toContainText('בדיקת מסך א');

    await page.click('button[onclick="openEditSanity(\'s1\')"]');
    await expect(page.locator('#sanityModal')).toBeVisible();
    await page.selectOption('#sanityStatus', 'לבדיקה בעליה לאוויר');
    await page.click('button[onclick="saveSanityTask()"]');
    await page.waitForTimeout(200);

    expect(liveSanity.s1.status).toBe('לבדיקה בעליה לאוויר');
    const launchId = liveSanity.s1.linkedLaunchId;
    expect(launchId).toBeTruthy();
    expect(liveLaunch[launchId]).toBeTruthy();
    expect(liveLaunch[launchId].linkedSanityId).toBe('s1');
    expect(liveLaunch[launchId].linkedSanityName).toBe('בדיקת מסך א');
    expect(liveLaunch[launchId].status).toBe('פתוח');

    // כפתור ניווט מטאב בדיקות שפיות לטאב עליה לאוויר
    const row = page.locator('#sanityAdminBody tr', { hasText: 'בדיקת מסך א' });
    await expect(row.locator('button[title*="עבר למשימה המקושרת"]')).toBeVisible();
    await row.locator('button[title*="עבר למשימה המקושרת"]').click();
    await expect(page.locator('.tab[data-tab="5"]')).toHaveClass(/active/);
    await expect(page.locator('#launchBody')).toContainText('בדיקת מסך א');

    // וכפתור ניווט חזרה מטאב עליה לאוויר לטאב בדיקות שפיות
    await page.locator('#launchBody button', { hasText: 'מקושר לבדיקת שפיות' }).click();
    await expect(page.locator('.tab[data-tab="4"]')).toHaveClass(/active/);
    await expect(page.locator('#sanityModal')).toBeVisible();
    await expect(page.locator('#sanityName')).toHaveValue('בדיקת מסך א');
  });

  test('שמירה חוזרת כשהסטטוס כבר "לבדיקה בעליה לאוויר" לא יוצרת משימה מקושרת כפולה', async ({ page }) => {
    const { sanity: liveSanity, launchTasks: liveLaunch } = await mockFirebase(page, {
      sanity: { s1: Object.assign({}, sanitySeed.s1, { status: 'לבדיקה בעליה לאוויר', linkedLaunchId: 'launch_existing' }) },
      launchTasks: { launch_existing: { id: 'launch_existing', task: 'קיים כבר', status: 'פתוח', notes: '', closedBy: '', closedAt: '', createdAt: '2026-08-01T00:00:00.000Z', linkedSanityId: 's1', linkedSanityName: 'בדיקת מסך א' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="4"]');
    await page.click('button[onclick="openEditSanity(\'s1\')"]');
    await expect(page.locator('#sanityModal')).toBeVisible();
    await expect(page.locator('#sanityStatus')).toHaveValue('לבדיקה בעליה לאוויר');
    await page.fill('#sanityDesc', 'עדכון תיאור בלי לשנות סטטוס');
    await page.click('button[onclick="saveSanityTask()"]');
    await page.waitForTimeout(200);

    expect(Object.keys(liveLaunch)).toEqual(['launch_existing']);
    expect(liveSanity.s1.linkedLaunchId).toBe('launch_existing');
  });

  test('רגרסיה: עריכה ושמירה של המשימה המקושרת עצמה בטאב "משימות בעליה לאוויר" לא מוחקת את הקישור חזרה לבדיקת השפיות', async ({ page }) => {
    const { sanity: liveSanity, launchTasks: liveLaunch } = await mockFirebase(page, {
      sanity: { s1: Object.assign({}, sanitySeed.s1, { status: 'לבדיקה בעליה לאוויר', linkedLaunchId: 'launch_existing' }) },
      launchTasks: { launch_existing: { id: 'launch_existing', task: 'בדיקה בעליה לאוויר — בדיקת שפיות: בדיקת מסך א', status: 'פתוח', notes: '', closedBy: '', closedAt: '', createdAt: '2026-08-01T00:00:00.000Z', linkedSanityId: 's1', linkedSanityName: 'בדיקת מסך א' } }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="5"]');
    await expect(page.locator('#launchBody')).toContainText('בדיקת מסך א');

    await page.click('button[onclick="openEditLaunch(\'launch_existing\')"]');
    await expect(page.locator('#launchModal')).toBeVisible();
    await page.fill('#launchNotes', 'עדכנתי הערה על המשימה');
    await page.selectOption('#launchStatus', 'בוצע');
    await page.click('button[onclick="saveLaunchTask()"]');
    await page.waitForTimeout(150);

    expect(liveLaunch['launch_existing'].linkedSanityId).toBe('s1');
    expect(liveLaunch['launch_existing'].linkedSanityName).toBe('בדיקת מסך א');
    expect(liveLaunch['launch_existing'].notes).toBe('עדכנתי הערה על המשימה');
    expect(liveLaunch['launch_existing'].status).toBe('בוצע');
    await expect(page.locator('#launchBody button', { hasText: 'מקושר לבדיקת שפיות' })).toBeVisible();
  });
});

test.describe('פילטרים נוספים בטבלת פיתוחים ותיקונים לבדיקה', () => {
  test('אפשר לסנן לפי סטטוס פיתוח, רכיב, ממשק וגרסה - לא רק לפי בודק/סטטוס בדיקה', async ({ page }) => {
    // המשימות הקבועות במערכת (85) תמיד מוצגות - לכן לא סופרים סה"כ שורות, אלא בודקים
    // נוכחות/היעדרות של שתי משימות ספציפיות (13770, 14281) עם ערכים ייחודיים שלא
    // מתנגשים עם אף אחת מ-85 המשימות הקבועות.
    await mockFirebase(page, {
      devTasksByUid: {
        dt_001: { status: 'בפיתוח', comp: 'ZZFILTERCOMP', ver: '5.1557', iface: 'DCC' },
        dt_002: { status: 'נסגר', comp: 'ZZFILTERCOMP', ver: '9.9999FILTERVER', iface: 'ZZZ' }
      }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    await page.selectOption('#devFilterVer', '9.9999FILTERVER');
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(0);

    await page.selectOption('#devFilterVer', '');
    await page.selectOption('#devFilterComp', 'ZZFILTERCOMP');
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);

    // סטטוס פיתוח הוא עכשיו סינון בבחירה מרובה (checkboxes) - בוחרים רק "בפיתוח"
    await msfSelectOnly(page, 'devStatus', ['בפיתוח']);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(0);

    await page.click('button[onclick="clearDevFilters()"]');
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);
  });

  test('סטטוס פיתוח, בודק DHL וסטטוס בדיקה ניתנים לסינון בבחירה מרובה (כמה ערכים בו-זמנית)', async ({ page }) => {
    await mockFirebase(page, {
      users: seedUsers([{ name: 'עידו הבודק', username: 'ido_t', password: 'pw', role: 'admin', email: 'ido.t@test.local' }]),
      devTasksByUid: {
        dt_001: { status: 'בפיתוח', tester: 'עידו הבודק', tStatus: 'תקין' },
        dt_002: { status: 'נבדק', tester: 'עידו הבודק', tStatus: 'לא תקין' },
        dt_003: { status: 'נסגר', tester: '', tStatus: '' }
      }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    // בוחרים שני סטטוסי פיתוח בו-זמנית ("בפיתוח" ו-"נבדק") - שתי המשימות הראשונות מוצגות, השלישית לא
    await msfSelectOnly(page, 'devStatus', ['בפיתוח', 'נבדק']);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);
    const dt3Id = await page.evaluate(() => DEV_TASKS.find(t => t._uid === 'dt_003').id);
    await expect(page.locator('#devBody tr:visible', { hasText: dt3Id })).toHaveCount(0);
    await expect(page.locator('#msf_devStatus_btn')).toHaveText('2 סטטוסים ▾');

    await msfSelectAll(page, 'devStatus');
    await expect(page.locator('#msf_devStatus_btn')).toHaveText('כל הסטטוסים (פיתוח) ▾');
    await expect(page.locator('#devBody tr:visible', { hasText: dt3Id })).toHaveCount(1);
  });

  test('אפשר לסנן לפי "ללא סטטוס" / "ללא סטטוס בדיקה" - למשימות שעדיין לא קיבלו סטטוס בכלל', async ({ page }) => {
    // dt_001 (13770) מקבל סטטוסים מפורשים; dt_002 (14281) נשאר עם ברירת המחדל
    // הקבועה בקוד - status/tStatus ריקים, בדיוק כמו משימה "טרייה" שעוד לא טופלה.
    await mockFirebase(page, {
      devTasksByUid: {
        dt_001: { status: 'בפיתוח', tStatus: 'תקין' }
      }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    await expect(page.locator('.msfcb_devStatus[value=""]')).toHaveCount(1);
    await expect(page.locator('.msfcb_devTStatus[value=""]')).toHaveCount(1);

    await msfSelectOnly(page, 'devStatus', ['']);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(0);
    await expect(page.locator('#msf_devStatus_btn')).toHaveText('ללא סטטוס ▾');
    await msfSelectAll(page, 'devStatus');

    await msfSelectOnly(page, 'devTStatus', ['']);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(0);
    await expect(page.locator('#msf_devTStatus_btn')).toHaveText('ללא סטטוס בדיקה ▾');
  });

  test('רגרסיה: שמירת משימה בזמן שיש סינון פעיל לא מאפסת את הסינון בתצוגה (הטבלה נשארת מסוננת, לא רק ה-DROPDOWN)', async ({ page }) => {
    await mockFirebase(page, {
      users: seedUsers([{ name: 'עידו הבודק', username: 'ido_t', password: 'pw', role: 'admin', email: 'ido.t@test.local' }]),
      devTasksByUid: {
        dt_001: { tester: 'עידו הבודק' },
        // dt_002 (14281) משויך לבודק אחר - כדי שבחירת "רק עידו הבודק" בפילטר (שמכיל
        // עכשיו רק בודקים שבפועל משויכים למשימה) תישאר סינון משמעותי, לא "הכל מסומן"
        dt_002: { tester: 'מנהל בדיקה' }
      }
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    await msfSelectOnly(page, 'devTester', ['עידו הבודק']);
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(0);

    // עורכים ושומרים משימה שכן תואמת לסינון (בדיוק כמו שהמשתמש דיווח)
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await page.fill('#devEditNotes', 'עדכון תוך כדי סינון פעיל');
    await page.click('button[onclick="saveDevTaskModal()"]');
    await page.waitForTimeout(300);

    // אחרי השמירה: הסינון עדיין חייב להיות מיושם בפועל על הטבלה, לא רק בכפתור
    await expect(page.locator('#msf_devTester_btn')).toHaveText('עידו הבודק ▾');
    await expect(page.locator('#devBody tr:visible', { hasText: '13770' })).toHaveCount(1);
    await expect(page.locator('#devBody tr:visible', { hasText: '14281' })).toHaveCount(0);
  });

  test('רשימת "בודק DHL" בפילטר מציגה רק מי שבפועל משויך למשימה כלשהי - לא את כל משתמשי המערכת', async ({ page }) => {
    await mockFirebase(page, {
      users: seedUsers([{ name: 'עידו הבודק', username: 'ido_t', password: 'pw', role: 'admin', email: 'ido.t@test.local' }]),
      devTasksByUid: { dt_001: { tester: 'עידו הבודק' } }
      // "מנהל בדיקה" ו"מנהלת בדיקה" (המשתמשים הרגילים) לא משויכים לאף משימה - לא אמורים להופיע בפילטר
    });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="3"]');
    await expect(page.locator('#devBody')).toContainText('13770');

    await expect(page.locator('.msfcb_devTester[value="עידו הבודק"]')).toHaveCount(1);
    await expect(page.locator('.msfcb_devTester[value="מנהל בדיקה"]')).toHaveCount(0);
    await expect(page.locator('.msfcb_devTester[value="מנהלת בדיקה"]')).toHaveCount(0);

    // לעומת זאת, ה-DROPDOWN של שיוך בודק במודל העריכה כן מציג את כולם - כדי שאפשר יהיה לשייך אליו משימה
    const row = page.locator('#devBody tr', { hasText: '13770' });
    await row.locator('button', { hasText: 'עריכה' }).click();
    await expect(page.locator('#devEditModal')).toBeVisible();
    await expect(page.locator('#devEditTester option', { hasText: 'מנהל בדיקה' })).toHaveCount(1);
  });
});

test.describe('העברת משימה מרבקה למלמ כולל', () => {
  test('אדמין רואה כפתור העברה, והפתיחה ממפה נכון את השדות מרבקה למלמ', async ({ page }) => {
    const rec = { _id: 'r_tr_1', נ: 'נושא מקור', מב: 'מנהלת בדיקה', ת: '2026-07-05', כ: 'כותרת מקור', ב: 'תוכן הבקשה המקורי', מט: 'דני הבודק', ע: 2, ס: 'בטיפול', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await expect(page.locator('#b2')).toContainText('נושא מקור');

    await expect(page.locator('tr:has-text("נושא מקור") .act-btn[title="העבר למלמ כולל"]')).toBeVisible();
    await page.click('tr:has-text("נושא מקור") .act-btn[title="העבר למלמ כולל"]');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);
    await expect(page.locator('#modalTitle')).toContainText('העברת משימה למלמ');

    // שדות שיש להם מקבילה ברבקה ממופים אוטומטית
    await expect(page.locator('#f_ת')).toHaveValue('2026-07-05');
    await expect(page.locator('#f_ע')).toHaveValue('2');
    await expect(page.locator('#f_ס')).toHaveValue('בטיפול');
    await expect(page.locator('#f_א')).toHaveValue('דני הבודק'); // "מטפל" ברבקה -> "אחראי מלמ"
    await expect(page.locator('#f_מ')).toHaveValue('נושא מקור\nכותרת מקור\nתוכן הבקשה המקורי');
    // שדות שאין להם מקבילה ברבקה (תחום, DHL) נשארים ריקים למילוי ידני
    await expect(page.locator('#f_ד')).toHaveValue('');
    await expect(page.locator('#f_dhl')).toHaveValue('');
    // אין למשימת מלמ צ'אט משלה עדיין (עוד לא נשמרה) - לא מציגים את הסקשן
    await expect(page.locator('#chatSection')).toBeHidden();
  });

  test('השלמת ההעברה יוצרת משימת מלמ עם השדות הנכונים, ומסירה (מחיקה רכה) את המקור ברבקה; ביטול משחזר את המקור', async ({ page }) => {
    const rec = { _id: 'r_tr_2', נ: 'משימה להעברה', מב: 'מנהלת בדיקה', ת: '2026-07-06', כ: 'כותרת', ב: 'תוכן', מט: 'רותם הבודקת', ע: 1, ס: 'פתוח', chat: { malm: [{ sender: 'x', text: 'הערה ברבקה', ts: 1, time: 't' }], dhl: [] } };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testadmin', 'pw');
    await page.click('.tab[data-tab="1"]');
    await page.click('tr:has-text("משימה להעברה") .act-btn[title="העבר למלמ כולל"]');
    await expect(page.locator('#modalBg')).toHaveClass(/open/);

    await page.fill('#f_ד', 'תחום שהושלם ידנית');
    await page.fill('#f_dhl', 'DHL בדיקה');
    await page.click('button.btn-save');
    await expect(page.locator('#modalBg')).not.toHaveClass(/open/);

    // המשימה החדשה נוצרה במלמ עם המיפוי הנכון
    await page.click('.tab[data-tab="0"]');
    await expect(page.locator('#b1')).toContainText('משימה להעברה');
    const malmRec = await page.evaluate(() => DB.malm.find(x => (x.מ || '').includes('משימה להעברה')));
    expect(malmRec).toBeTruthy();
    expect(malmRec.ת).toBe('2026-07-06');
    expect(malmRec.ע).toBe('1');
    expect(malmRec.ס).toBe('פתוח');
    expect(malmRec.א).toBe('רותם הבודקת');
    expect(malmRec.ד).toBe('תחום שהושלם ידנית');
    expect(malmRec.dhl).toBe('DHL בדיקה');

    // המקור ברבקה הוסר (מחיקה רכה - נשאר במערך עם deleted:true, לא נמחק לצמיתות)
    await page.click('.tab[data-tab="1"]');
    await expect(page.locator('#b2')).not.toContainText('משימה להעברה');
    const rivkaAfter = await page.evaluate(() => DB.rivka.find(x => x._id === 'r_tr_2'));
    expect(rivkaAfter.deleted).toBe(true);
    expect(rivkaAfter.chat.malm[0].text).toBe('הערה ברבקה'); // מחיקה רכה לא מוחקת נתונים אחרים של הרשומה

    // ואפשר לבטל את ההסרה מרבקה (המשימה במלמ שנוצרה כבר לא מתבטלת - היא רשומה עצמאית שכבר אומתה בשרת)
    await expect(page.locator('#savingMsg')).toContainText('ביטול');
    await page.click('#savingMsg a');
    await expect(page.locator('#b2')).toContainText('משימה להעברה');
    const rivkaUndone = await page.evaluate(() => DB.rivka.find(x => x._id === 'r_tr_2'));
    expect(rivkaUndone.deleted).toBeFalsy(); // undoDelete/saveDeletedFlag מסירים את הדגל לגמרי (לא false מפורש) - כמו בכל ביטול מחיקה אחר במערכת
  });

  test('מנהל (לא אדמין) לא רואה את כפתור ההעברה', async ({ page }) => {
    const rec = { _id: 'r_tr_3', נ: 'משימה של מנהל', מב: 'מנהלת בדיקה', ת: '2026-07-07', כ: 'k', ב: 'b', ע: 1, ס: 'פתוח', chat: {} };
    await mockFirebase(page, { rivka: [rec] });
    await page.goto('/index.html');
    await login(page, 'testmgr', 'pw');
    await page.click('.tab[data-tab="1"]');
    await expect(page.locator('#b2')).toContainText('משימה של מנהל');
    await expect(page.locator('tr:has-text("משימה של מנהל") .act-btn[title="העבר למלמ כולל"]')).toHaveCount(0);
  });
});
