
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './appointments.component';

describe('app-appointments', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-appointments') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render the title "Termine"', async () => {
    await element.updateComplete;
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Termine');
  });
  it('should fetch the appointments on first update', async () => {
    spyOn(httpClient, 'get'); //vorher, da sonst der get schon abgeschlossen ist
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
  it('should render the ivalid feedback "Terminname ist erforderlich"', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('button') as HTMLElement;
    buttonElem.click();
    const invElem = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(invElem.innerText).toBe('Terminname ist erforderlich');
  });
});
