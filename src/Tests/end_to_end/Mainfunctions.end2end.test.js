const puppeteer = require('puppeteer');
const parse = require('url-parse');

const url = 'http://localhost:3001';
const testMail = 'test@teco.edu';
const testPassword = 'admin';
const testUser = 'testUSer';

it('Render page', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const title = await page.title();
  expect(title).toBe('Explorer');
  await browser.close();
});

it('Register user', async () => {
  const page = await init();
  await Promise.all([
    page.click('#btnRegisterNewUser'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  await page.type('#email', testMail);
  await page.type('#password', testPassword);
  await page.type('#passwordRepeat', testPassword);
  await page.type('#username', testUser);
  await page.click('#registerButton');
});

it('Login user', async () => {
  const page = await init();
  const localStorage = await getLocalStorage(page);
  await page.type('#email', 'test@teco.edu');
  await page.type('#password', 'admin');
  await Promise.all([
    page.click('#login-button'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  const newLocalStorage = await getLocalStorage(page);
  expect(localStorage.access_token).toBe(undefined);
  expect(newLocalStorage.access_token).not.toBe(undefined);
});

it('Logout user', async () => {
  const page = await init();
  await loginUser(page);
  await page.click('#userDropDownContent');
  await page.click('#buttonLogoutUser');
  const localStorage = await getLocalStorage(page);
  expect(parse(page.url()).pathname).toBe('/');
  expect(localStorage.access_token).toBe(undefined);
});

async function loginUser(page) {
  await page.type('#email', 'test@teco.edu');
  await page.type('#password', 'admin');
  await Promise.all([
    page.click('#login-button'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
}

async function init() {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.goto(url);
  return page;
}

async function getLocalStorage(page) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  return localStorageData;
}
