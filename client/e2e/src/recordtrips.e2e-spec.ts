
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('recordtrips', () => {
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
  it('should render the Button "Speichern"', async () => {
    await page.goto(config.clientUrl('/recordtrips'));
    const button = await page.textContent('app-recordtrips button');
    expect(button).toBe('Speichern');
  });
  it('should add a new recordtrip', async () => {
    await page.goto(config.clientUrl('/recordtrips'));
    await page.focus('app-recordtrips input');
    await page.keyboard.type('10.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('12.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('8');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Hamburg');
    await page.keyboard.press('Tab');
    await page.keyboard.type('G + J');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const customer = await page.innerText('app-recordtrips span[slot="customer"]');
    expect(customer).toEqual('G + J');
  });

  it('should trigger an alert', async () => {
    await page.goto(config.clientUrl('/recordtrips'));
    await page.focus('app-recordtrips input');
    await page.keyboard.type('10.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('09.06.2021');
    await page.keyboard.press('Tab');
    await page.keyboard.type('8');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Hamburg');
    await page.keyboard.press('Tab');
    await page.keyboard.type('G + J');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.on('dialog', dialog => {
      const alertText = dialog.message();
      expect(alertText).toBe('Start Datum muss kleiner als End Datum sein');
    });
  });
});
