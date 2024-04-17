
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './sign-in.component';

describe('app-sign-in', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-sign-in') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render invalid feedback "E-Mail ist erforderlich und muss gültig sein"', async () => {
    await element.updateComplete;
    const spanElem = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(spanElem.innerText).toBe('E-Mail ist erforderlich und muss gültig sein');
  });
});
