import { LitElement } from 'lit-element';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { httpClient } from '../../http-client';
import './recordtimemanual.component';

describe('app-recordtimemanual', () => {
  let element: LitElement;
  let page: Page;
  beforeEach(() => {
    element = document.createElement('app-recordtimemanual') as LitElement;
    document.body.appendChild(element);
  });
  it('should render the h1: "Zeit nachträglich erfassen"', async () => {
    await element.updateComplete;
    const h1 = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1.innerText).toBe('Zeit nachträglich erfassen');
  });

  it('should render the button "Sichern"', async () => {
    await element.updateComplete;
    const button = element.shadowRoot!.querySelector('button') as HTMLElement;
    expect(button.innerText).toBe('Sichern');
  });

  it('should render the invalid feedback ', async () => {
    await element.updateComplete;
    const button = element.shadowRoot!.querySelector('button') as HTMLElement;
    button.click();
    const invFeedback = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(invFeedback.innerText).toBe('Datum erforderlich');
  });
});
