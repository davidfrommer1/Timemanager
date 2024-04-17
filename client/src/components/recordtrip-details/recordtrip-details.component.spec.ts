
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './recordtrip-details.component';

describe('app-recordtrip-details', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-recordtrip-details') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });
  it('should fetch the recordtrip-details on first update', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
  it('should render 2 buttons', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('button') as HTMLElement;
    const buttonElem2 = element.shadowRoot!.querySelector('button:nth-child(2)') as HTMLElement;
    if (buttonElem != buttonElem2) expect(buttonElem).not.toBe(buttonElem2);
  });
});
