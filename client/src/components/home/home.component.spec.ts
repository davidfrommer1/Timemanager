
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './home.component';

describe('app-home', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-home') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render the title "Arbeitszeiten"', async () => {
    await element.updateComplete;
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Arbeitszeiten');
  });
  it('should fetch the appointments, workingtimes, holidays and trips  on first update', async () => {
    spyOn(httpClient, 'get'); //vorher, da sonst der get schon abgeschlossen ist
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
  it('should render 4 buttons', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('#btn-recordtime') as HTMLElement;
    const buttonElem2 = element.shadowRoot!.querySelector('#btn-appointments') as HTMLElement;
    const buttonElem3 = element.shadowRoot!.querySelector('#btn-holidays') as HTMLElement;
    const buttonElem4 = element.shadowRoot!.querySelector('#btn-recordtrips') as HTMLElement;
    expect(buttonElem).not.toBe(buttonElem2);
    expect(buttonElem).not.toBe(buttonElem3);
    expect(buttonElem).not.toBe(buttonElem4);
    expect(buttonElem2).not.toBe(buttonElem3);
    expect(buttonElem2).not.toBe(buttonElem4);
    expect(buttonElem3).not.toBe(buttonElem4);
  });
});
