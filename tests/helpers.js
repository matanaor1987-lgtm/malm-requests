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

// מדמה את ההתנהגות האמיתית של Firebase Realtime Database: כתיבת אובייקט/מערך
// ריק (או null) לנתיב שקולה למחיקתו - הצומת פשוט לא נשמר. בלי הדמיה הזו, מוק
// ה-Firebase "נחמד" מדי ולא היה תופס באגים כמו זה שבו רשומה חדשה עם chat:{}
// נכשלת באימות מול השרת האמיתי (ראו deepEqual/pruneEmpty ב-index.html).
function firebasePrune(v) {
  if (v === null || v === undefined || typeof v !== 'object') return v;
  if (Array.isArray(v)) {
    return v.map(firebasePrune).filter((x) => x !== undefined && x !== null);
  }
  const out = {};
  Object.keys(v).forEach((k) => {
    const pv = firebasePrune(v[k]);
    if (pv === null || pv === undefined) return;
    if (typeof pv === 'object' && Object.keys(pv).length === 0) return;
    out[k] = pv;
  });
  return out;
}

async function mockFirebase(page, initial) {
  const db = {
    malm: (initial && initial.malm) || [],
    rivka: (initial && initial.rivka) || [],
    users: (initial && initial.users) || seedUsers(),
  };
  const sanity = (initial && initial.sanity) || {};
  const devTasksByUid = (initial && initial.devTasksByUid) || {};
  const launchTasks = (initial && initial.launchTasks) || {};
  const devLists = (initial && initial.devLists) || {};

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
      if (path === '/sanity.json') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sanity) });
      }
      const sm = path.match(/^\/sanity\/([^/]+)\.json$/);
      if (sm) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sanity[sm[1]] || null) });
      }
      if (path === '/devTasksByUid.json') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(devTasksByUid) });
      }
      const dm = path.match(/^\/devTasksByUid\/([^/]+)\.json$/);
      if (dm) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(devTasksByUid[decodeURIComponent(dm[1])] || null) });
      }
      if (path === '/launchTasks.json') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(launchTasks) });
      }
      const lm = path.match(/^\/launchTasks\/([^/]+)\.json$/);
      if (lm) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(launchTasks[lm[1]] || null) });
      }
      if (path === '/devLists.json') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(devLists) });
      }
      // כל השאר - אין לנו נתונים, מחזירים ריק
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    }

    if (method === 'PUT') {
      let body;
      try { body = req.postDataJSON(); } catch (e) { body = null; }
      body = firebasePrune(body);
      const m = path.match(/^\/db\/(malm|rivka|users)\.json$/);
      const sm = path.match(/^\/sanity\/([^/]+)\.json$/);
      const dm = path.match(/^\/devTasksByUid\/([^/]+)\.json$/);
      const lm = path.match(/^\/launchTasks\/([^/]+)\.json$/);
      if (m) db[m[1]] = body;
      else if (path === '/db.json' && body) Object.assign(db, body);
      else if (path === '/sanity.json') { Object.keys(sanity).forEach(k => delete sanity[k]); Object.assign(sanity, body); }
      else if (sm) sanity[sm[1]] = body;
      else if (dm) devTasksByUid[decodeURIComponent(dm[1])] = body;
      else if (path === '/devTasksByUid.json' && body) { Object.keys(devTasksByUid).forEach(k => delete devTasksByUid[k]); Object.assign(devTasksByUid, body); }
      else if (lm) launchTasks[lm[1]] = body;
      else if (path === '/devLists.json' && body) { Object.keys(devLists).forEach(k => delete devLists[k]); Object.assign(devLists, body); }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }

    if (method === 'PATCH') {
      const m = path.match(/^\/sanity\/([^/]+)\.json$/);
      const dm = path.match(/^\/devTasksByUid\/([^/]+)\.json$/);
      if (m) {
        let body; try { body = req.postDataJSON(); } catch (e) { body = {}; }
        sanity[m[1]] = Object.assign(sanity[m[1]] || {}, body);
      } else if (dm) {
        let body; try { body = req.postDataJSON(); } catch (e) { body = {}; }
        devTasksByUid[decodeURIComponent(dm[1])] = Object.assign(devTasksByUid[decodeURIComponent(dm[1])] || {}, body);
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }

    if (method === 'DELETE') {
      const lm = path.match(/^\/launchTasks\/([^/]+)\.json$/);
      const sm = path.match(/^\/sanity\/([^/]+)\.json$/);
      if (lm) delete launchTasks[lm[1]];
      else if (sm) delete sanity[sm[1]];
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // חוסמים את סקריפט ה-CDN של EmailJS - לא רלוונטי לבדיקות ולא אמור לחסום כלום
  // (הקוד באפליקציה כבר מטפל במקרה ש-emailjs לא נטען).
  await page.route('**/cdn.jsdelivr.net/**', (route) => route.abort());

  return { db, sanity, devTasksByUid, launchTasks, devLists };
}

async function login(page, username, password) {
  await page.waitForSelector('#lgUser', { state: 'visible' });
  await page.fill('#lgUser', username);
  await page.fill('#lgPass', password);
  await page.click('#lgBtn');
  await page.waitForSelector('#mainTabs', { state: 'visible' });
}

// עוזרים לתפריטי סינון בבחירה מרובה (MSF, ראו msfToggle/msfChange/msfCheckAll
// ב-index.html) - מפעילים ישירות את מנגנון האפליקציה (בלי תלות בפתיחת ה-
// dropdown הנפתח, כדי שהבדיקה תישאר יציבה ומהירה).
async function msfSelectOnly(page, key, values) {
  await page.evaluate(({ key, values }) => {
    document.querySelectorAll('.msfcb_' + key).forEach(function(cb) {
      cb.checked = values.includes(cb.value);
    });
    msfChange(key);
  }, { key, values });
}
async function msfSelectAll(page, key) {
  await page.evaluate((key) => {
    document.querySelectorAll('.msfcb_' + key).forEach(function(cb) { cb.checked = true; });
    msfChange(key);
  }, key);
}

module.exports = { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll };
