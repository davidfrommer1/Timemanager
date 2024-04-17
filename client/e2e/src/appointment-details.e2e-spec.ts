
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/appointments', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  beforeAll(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });
  it('should change the title of the first appointment', async () => {
    await page.goto(config.clientUrl('/appointments'));
    await page.focus('app-appointments input');
    await page.keyboard.type('Testtermin Playwright');
    await page.keyboard.press('Tab');
    await page.keyboard.type('2022-06-01T08:30');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Dies ist ein Testtermin erzeugt durch Playwright');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForSelector('app-appointment');
    await Promise.all([page.waitForResponse('**'), await page.click('app-appointment .edit-appointment')]);

    expect(await page.$eval('input', (el: HTMLInputElement) => el.value)).toBe('Testtermin Playwright');
    await page.focus('input');
    const input = await page.$eval('input', (el: HTMLInputElement) => el.value);
    for (let i = 0; i < input.length; i++) {
      await page.keyboard.press('Backspace');
    }
    await page.keyboard.type('Changed Title');
    expect(await page.$eval('input', (el: HTMLInputElement) => el.value)).toBe('Changed Title');
  });
});
