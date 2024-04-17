
import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './holidays.component';

describe('app-holidays', () => {
  let element: LitElement;
  beforeEach(() => {
    element = document.createElement('app-holidays') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render the title "Urlaub"', async () => {
    await element.updateComplete;
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Urlaub');
  });
  it('should fetch the holidays on first update', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });
  it('should render the ivalid feedback "Urlaub Name ist erforderlich"', async () => {
    await element.updateComplete;
    const buttonElem = element.shadowRoot!.querySelector('button') as HTMLElement;
    buttonElem.click();
    const invElem = element.shadowRoot!.querySelector('.invalid-feedback') as HTMLElement;
    expect(invElem.innerText).toBe('Urlaub Name ist erforderlich');
  });

  it('should render the fetched holidays', async () => {
    const holidays = [
      { id: 1, title: 'Sommer', fromdate: '17.06.2021', todate: '24.06.2021' },
      { id: 2, title: 'Winter', fromdate: '23.12.2021', todate: '02.01.2022' }
    ];
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: holidays });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property tasks asynchron gesetzt wird
    await element.updateComplete;

    const taskElems = element.shadowRoot!.querySelectorAll('app-holiday');
    expect(taskElems.length).toBe(2);
  });
});
