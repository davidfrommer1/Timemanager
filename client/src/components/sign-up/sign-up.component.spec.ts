
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './sign-up.component';

describe('app-sign-up', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-sign-up') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });
  it('should render the first input label "Name"', async () => {
    await element.updateComplete;
    const labelElem = element.shadowRoot!.querySelector('label') as HTMLElement;
    expect(labelElem.innerText).toBe('Name');
  });
  it('should render the ivalid feedback', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('button') as HTMLElement;
    buttonElem.click();
    const invElem = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(invElem.innerText).toBe('Name ist erforderlich und muss mit Großbuchstaben anfangen');
  });
});
