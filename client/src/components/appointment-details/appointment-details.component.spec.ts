
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './appointment-details.component';

describe('app-appointment-details', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-appointment-details') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });
  it('should render the title "Termininformationen"', async () => {
    await element.updateComplete;
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Termininformationen');
  });
  it('should render 2 buttons', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('button') as HTMLElement;
    const buttonElem2 = element.shadowRoot!.querySelector('button:nth-child(2)') as HTMLElement;
    if (buttonElem != buttonElem2) expect(buttonElem).not.toBe(buttonElem2);
  });
});
