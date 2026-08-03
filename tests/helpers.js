// כלי עזר משותפים לבדיקות E2E.
// mockFirebase מיירט כל קריאה ל-Firebase RTDB האמיתי ומחליף אותה ב-DB מדומה בזיכרון,
// כדי שאף בדיקה לעולם לא תיגע בנתונים האמיתיים של המערכת.

function seedUsers(extra) {
  return [
    { name: 'מנהל בדיקה', username: 'testadmin', password: 'pw', role: 'admin', email: 'admin@test.local' },
    { name: 'מנהלת בדיקה', username: 'testmgr', password: 'pw', role: 'manager', email: 'mgr@test.local' },
    ...(extra || [])
  ];
}

async function mockFirebase(page, initial) {
  const db = {
    malm: (initial && initial.malm) || [],
    rivka: (initial && initial.rivka) || [],
    users: (initial && initial.users) || seedUsers(),
  };

  await page.route('**/malm-focus-default-rtdb.firebaseio.com/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === 'GET') {
      if (path === '/db.json') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(db) });
      }
      const m = path.match(/^\/db\/(malm|rivka|users)\.json$/);
      if (m) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(db[m[1]] || []) });
      }
      // devTasks.json / sanity.json / כל השאר - אין לנו נתונים, מחזירים ריק
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    }

    if (method === 'PUT') {
      let body;
      try { body = req.postDataJSON(); } catch (e) { body = null; }
      const m = path.match(/^\/db\/(malm|rivka|users)\.json$/);
      if (m) db[m[1]] = body;
      else if (path === '/db.json' && body) Object.assign(db, body);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }

    if (method === 'PATCH') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // חוסמים את סקריפט ה-CDN של EmailJS - לא רלוונטי לבדיקות ולא אמור לחסום כלום
  // (הקוד באפליקציה כבר מטפל במקרה ש-emailjs לא נטען).
  await page.route('**/cdn.jsdelivr.net/**', (route) => route.abort());

  return db;
}

async function login(page, username, password) {
  await page.waitForSelector('#lgUser', { state: 'visible' });
  await page.fill('#lgUser', username);
  await page.fill('#lgPass', password);
  await page.click('#lgBtn');
  await page.waitForSelector('#mainTabs', { state: 'visible' });
}

module.exports = { mockFirebase, seedUsers, login };
