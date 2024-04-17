
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './recordtrips.component';

describe('app-recordtrips', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-recordtrips') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render the title "Start Datum"', async () => {
    await element.updateComplete;
    const spanElem = element.shadowRoot!.querySelector('label') as HTMLElement;
    expect(spanElem.innerText).toBe('Start Datum');
  });
  it('should fetch the recordtrips on first update', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
  it('should render the fetched recordtrips', async () => {
    const recordtrips = [
      {
        id: 1,
        fromdate: '17.06.2021',
        todate: '18.06.2021',
        hours: '16',
        destination: 'Hamburg',
        customer: 'G + J',
        note: 'Geschäftsessen und Frühstück'
      },
      { id: 2, fromdate: '15.08.2021', todate: '15.08.2021', hours: '2,25', destination: 'Berlin', customer: 'BMG' }
    ];
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: recordtrips });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const taskElems = element.shadowRoot!.querySelectorAll('app-recordtrip');
    expect(taskElems.length).toBe(2);
  });
});
