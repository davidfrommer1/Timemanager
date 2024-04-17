import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/recordtimemanual', () => {
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

  it('should render the title "Zeit nachträglich erfassen"', async () => {
    await page.goto(config.clientUrl('/recordtimemanual'));
    const title = await page.textContent(' h1');
    expect(title).toBe('Zeit nachträglich erfassen');
  });

  it('should render the button "Sichern"', async () => {
    await page.goto(config.clientUrl('/recordtimemanual'));
    const btn = await page.textContent('.btn');
    expect(btn).toBe('Sichern');
  });

  it('should render the alert "Arbeitsende muss größer als Arbeitsbeginn sein"', async () => {
    await page.goto(config.clientUrl('/recordtimemanual'));
    await page.screenshot({ path: 'screenshot2.png' });
    await page.focus('app-recordtimemanual input');
    await page.fill('#date', '2021-06-19');
    await page.fill('#arbeitsbeginn', '08:00');
    await page.fill('#arbeitsende', '06:00');
    await page.click('#save');
    page.on('dialog', dialog => {
      const alert = dialog.message();
      expect(alert).toBe('Arbeitsende muss größer als Arbeitsbeginn sein!!!');
    });
  });
});
