
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { UserSession } from './user-session';
import config from './config';

describe('/recordtime', () => {
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

  it('should render the title "Zeit erfassen"', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const title = await page.textContent('app-recordtime h1');
    expect(title).toBe('Zeit erfassen');
  });

  it('should record a time', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    await page.click('.btn');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const time = await page.innerText('app-workingtime span[slot="duration"]');
    expect(time).toBe('0:00');
  });

  it('should redirect to recordtimemanual', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    await page.click('#manual');
    const title = await page.innerText('h1');
    expect(title).toBe('Zeit nachträglich erfassen');
  });

  it('should render the button "Arbeitsbeginn"', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const btn = await page.innerText('.btn');
    expect(btn).toBe('Arbeitsbeginn');
  });

  it('should render the button "Zeit nachträglich buchen"', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const btn = await page.innerText('#manual');
    expect(btn).toBe('Zeit nachträglich buchen');
  });
  it('should render the button "Zeit nachträglich buchen"', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const btn = await page.innerText('#manual');
    expect(btn).toBe('Zeit nachträglich buchen');
  });
  it('should render the button "Arbeitsende', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const btn = await page.innerText('#end');
    expect(btn).toBe('Arbeitsende');
  });
  it('should render the button "Sichern', async () => {
    await page.goto(config.clientUrl('/recordtime'));
    const btn = await page.innerText('#save');
    expect(btn).toBe('Sichern');
  });
});
