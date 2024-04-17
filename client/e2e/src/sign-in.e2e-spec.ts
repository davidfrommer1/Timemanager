
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('sign-in', () => {
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
  });

  afterEach(async () => {
    await context.close();
  });
  it('should fail given wrong credentials', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('input:below(:text("mail"))', userSession.email);
    await page.fill('input:below(:text("Passwort"))', userSession.password);
    const [response] = await Promise.all([page.waitForResponse('**/sign-in'), page.click('button:text("Anmelden")')]);
    expect(response.status()).toBe(401);
  });

  it('should succeed given proper credentials', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('input:below(:text("mail"))', userSession.email);
    await page.fill('input:below(:text("Passwort"))', userSession.password);
    const [response] = await Promise.all([page.waitForResponse('**/sign-in'), page.click('button:text("Anmelden")')]);
    expect(response.status()).toBe(201);
    await userSession.deleteUser();
  });
});
