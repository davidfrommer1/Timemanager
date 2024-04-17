
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/holidays', () => {
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

  it('should render the title "Urlaub"', async () => {
    await page.goto(config.clientUrl('/holidays'));
    const title = await page.textContent('app-holidays h1');
    expect(title).toBe('Urlaub');
  });
  it('should add a new holiday', async () => {
    await page.goto(config.clientUrl('/holidays'));
    await page.focus('app-holidays input');
    await page.keyboard.type('Urlaubstest');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('12.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const title = await page.innerText('app-holidays span[slot="title"]');
    expect(title).toBe('Urlaubstest');
  });
  it('should delete an holiday', async () => {
    await page.goto(config.clientUrl('/holidays'));
    await page.focus('app-holidays input');
    await page.keyboard.type('Urlaubstest');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('12.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForSelector('app-holiday');
    await Promise.all([page.waitForResponse('**'), await page.click('app-holiday .remove-holiday')]);
    expect(await page.$('app-holiday')).toBeNull();
  });
  it('should trigger an alert', async () => {
    await page.goto(config.clientUrl('/holidays'));
    await page.focus('app-holidays input');
    await page.keyboard.type('Urlaubstest');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('09.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.on('dialog', dialog => {
      const alertText = dialog.message();
      expect(alertText).toBe('Start Datum muss kleiner als End Datum sein');
    });
  });
});
