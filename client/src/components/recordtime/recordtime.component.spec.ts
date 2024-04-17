import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import './recordtime.component';

describe('app-recordtime', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-recordtime') as LitElement;
    document.body.appendChild(element);
  });

  it('should fetch the recordedtimes on first update', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should redner the fetched times', async () => {
    const recordedtimes = [
      { date: '18.06.2021', duration: '07:30' },
      { date: '17.06.2021', duration: '08:00' }
    ];

    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: recordedtimes });
        }
      } as Response)
    );
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
    const timeElems = element.shadowRoot!.querySelectorAll('app-workingtime');
    expect(timeElems.length).toBe(2);
  });

  it('should render the h1: "Zeit erfassen"', async () => {
    await element.updateComplete;
    const h1 = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1.innerText).toBe('Zeit erfassen');
  });
});
