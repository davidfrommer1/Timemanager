import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/changepassword', () => {
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

  it('should render the title "Passwort ändern"', async () => {
    await page.goto(config.clientUrl('/changepassword'));
    const title = await page.textContent('h1');
    expect(title).toBe('Passwort ändern');
  });

  it('should render the button "Sichern"', async () => {
    await page.goto(config.clientUrl('/changepassword'));
    const btn = await page.innerText('.btn');
    expect(btn).toBe('Sichern');
  });

  it('should render the alert "Das alte Passwort ist nicht korrekt!"', async () => {
    await page.goto(config.clientUrl('/changepassword'));
    await page.focus('app-changepassword input');
    await page.fill('#oldpw', 'Falschespasswort');
    await page.fill('#newpw', 'Neuespasswort123');
    await page.click('.btn');
    page.on('dialog', dialog => {
      const alert = dialog.message();
      expect(alert).toBe('Das alte Passwort ist nicht korrekt!');
    });
  });
});
