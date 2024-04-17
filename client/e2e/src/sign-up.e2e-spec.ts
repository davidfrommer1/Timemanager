
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import config from './config';

describe('sign-up', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterEach(async () => {
    await context.close();
  });

  it('should render the title "Kundenkonto erstellen"', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    const title = await page.textContent('app-sign-up h1');
    expect(title).toBe('Kundenkonto erstellen');
  });

  it('should render "E-Mail ist erforderlich und muss gültig sein"', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.focus('app-sign-up input');
    await page.keyboard.type('Testname');
    await page.keyboard.press('Tab');
    await page.keyboard.type('test');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Test123456');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Test123456');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    expect(await page.$('text="E-Mail ist erforderlich und muss gültig sein"')).not.toBeNull();
  });

  it('should render "Passwort ist erforderlich und muss mind. 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen Kleinbuchstaben haben"', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.focus('app-sign-up input');
    await page.keyboard.type('Testname');
    await page.keyboard.press('Tab');
    await page.keyboard.type('test@web.de');
    await page.keyboard.press('Tab');
    await page.keyboard.type('test123456');
    await page.keyboard.press('Tab');
    await page.keyboard.type('test123456');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    expect(
      await page.$(
        'text="Passwort ist erforderlich und muss mind. 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen Kleinbuchstaben haben"'
      )
    ).not.toBeNull();
  });
});
