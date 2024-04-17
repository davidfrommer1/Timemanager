
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { guard } from 'lit-html/directives/guard';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface Holiday {
  id: string;
  title: string;
  fromdate: string;
  todate: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./holidays.component.scss');

@customElement('app-holidays')
class HolidaysComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('form') form!: HTMLFormElement;
  @query('#title') titleElement!: HTMLInputElement;
  @query('#fromdate') fromdateElement!: HTMLInputElement;
  @query('#todate') todateElement!: HTMLInputElement;

  @internalProperty()
  private holidays: Holiday[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('/holidays');
      this.holidays = (await response.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Urlaub</h1>
      <form>
        <div class="form-group">
          <label class="control-label" for="title">Name</label>
          <input class="form-control" type="text" autofocus required id="title" name="title" placeholder="Urlaub" />
          <div class="invalid-feedback">Urlaub Name ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="fromdate">Start Datum</label>
          <input class="form-control" type="date" required id="fromdate" name="fromdate" placeholder="VonDatum" />
          <div class="invalid-feedback">Start Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="todate">End Datum</label>
          <input class="form-control" type="date" id="todate" required name="todate" placeholder="BisDatum" />
          <div class="invalid-feedback">End Datum ist ungültig</div>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="reset">Zurücksetzen</button>
      </form>
      <p></p>
      <div class="holidays">
        ${guard(
          [this.holidays],
          () => html`
            ${repeat(
              this.holidays,
              holiday => holiday.id,
              holiday => html`
                <app-holiday @appholidayremoveclick=${() => this.removeHoliday(holiday)}>
                  <span slot="title">${holiday.title}</span>
                  <span slot="fromdate">Start Datum: ${holiday.fromdate}</span>
                  <span slot="todate">End Datum: ${holiday.todate}</span>
                </app-holiday>
              `
            )}
          `
        )}
      </div>
    `;
  }

  async removeHoliday(holidayToRemove: Holiday) {
    try {
      await httpClient.delete('/holidays/' + holidayToRemove.id);
      this.holidays = this.holidays.filter(holiday => holiday.id !== holidayToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async submit(event: Event) {
    event.preventDefault();
    if ((await this.validateDates()) == true) {
      const partialHoliday: Partial<Holiday> = {
        title: this.titleElement.value,
        fromdate: this.fromdateElement.value,
        todate: this.todateElement.value
      };
      console.log(partialHoliday);
      try {
        location.reload();
        const response = await httpClient.post('/holidays', partialHoliday);
        const holiday: Holiday = await response.json();
        this.holidays = [...this.holidays, holiday];
        this.titleElement.value = '';
        this.fromdateElement.value = '';
        this.todateElement.value = '';
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  validateDates() {
    const startDate = this.fromdateElement.value;
    const endDate = this.todateElement.value;
    if (Date.parse(endDate) <= Date.parse(startDate)) {
      alert('Start Datum muss kleiner als End Datum sein');
      return false;
    }
    return this.form.checkValidity();
  }
}
