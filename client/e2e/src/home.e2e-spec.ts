
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('home', () => {
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

  it('should render the title "Arbeitszeiten"', async () => {
    await page.goto(config.clientUrl('/app/home'));
    const title = await page.textContent('h1');
    expect(title).toBe('Arbeitszeiten');
  });

  it('should redirekt to /recordtime', async () => {
    await page.goto(config.clientUrl('/app/home'));
    await page.click('.btn');
    const title = await page.textContent('h1');
    expect(title).toBe('Zeit erfassen');
  });
});
