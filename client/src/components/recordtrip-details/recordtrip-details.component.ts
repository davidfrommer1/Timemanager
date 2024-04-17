import { css, customElement, html, LitElement, property, query, unsafeCSS } from 'lit-element';
import { RecordTrip } from '../../../../api-server/src/models/recordtrip';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./recordtrip-details.component.scss');

@customElement('app-recordtrip-details')
class RecordtripDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property()
  recordtripId!: string;

  @query('form') form!: HTMLFormElement;
  @query('#fromdate') fromdateElement!: HTMLInputElement;
  @query('#todate') todateElement!: HTMLInputElement;
  @query('#hours') hoursElement!: HTMLInputElement;
  @query('#destination') destinationElement!: HTMLInputElement;
  @query('#customer') customerElement!: HTMLInputElement;
  @query('#note') noteElement!: HTMLInputElement;

  recordtrip!: RecordTrip;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/recordtrips/' + this.recordtripId);
      this.recordtrip = await response.json();
      await this.requestUpdate();
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
      <h1>Reise Erfassen</h1>
      <form>
        <div class="form-group">
          <span class="title">Datum von:</span>
          <input
            class="form-control"
            type="date"
            required
            id="fromdate"
            name="fromdate"
            .value=${this.recordtrip?.fromdate || ''}
          />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <span class="title">Datum bis:</span>
          <input
            class="form-control"
            type="date"
            id="todate"
            required
            name="todate"
            .value=${this.recordtrip?.todate || ''}
          />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <span class="title">Stunden:</span>
          <input
            class="form-control"
            type="text"
            required
            id="hours"
            name="hours"
            .value=${this.recordtrip?.hours || ''}
          />
          <div class="invalid-feedback">Stunden müssen gefüllt sein</div>
        </div>
        <div class="form-group">
          <span class="title">Reiseort:</span>
          <input
            class="form-control"
            type="text"
            maxlength="100"
            required
            id="destination"
            name="destination"
            .value=${this.recordtrip?.destination || ''}
          />
          <div class="invalid-feedback">Reiseort ist erforderlich</div>
        </div>
        <div class="form-group">
          <span class="title">Kunde:</span>
          <input
            class="form-control"
            type="text"
            maxlength="50"
            required
            id="customer"
            name="customer"
            .value=${this.recordtrip?.customer || ''}
          />
          <div class="invalid-feedback">Kunde ist erforderlich</div>
        </div>
        <div class="form-group">
          <span class="title">Bemerkung:</span>
          <textarea
            class="form-control"
            type="text"
            maxlength="300"
            id="note"
            name="note"
            rows="4"
            .value=${this.recordtrip?.note || ''}
          ></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    `;
  }

  async submit() {
    if ((await this.validateDates()) == true) {
      const updatedRecordtrip: RecordTrip = {
        ...this.recordtrip,
        fromdate: this.fromdateElement.value,
        todate: this.todateElement.value,
        hours: this.hoursElement.value,
        destination: this.destinationElement.value,
        customer: this.customerElement.value,
        note: this.noteElement.value
      };
      try {
        await httpClient.patch('/recordtrips/' + updatedRecordtrip.id, updatedRecordtrip);
        router.navigate('/recordtrips');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/recordtrips');
  }

  validateDates() {
    const startDate = this.fromdateElement.value;
    const endDate = this.todateElement.value;
    if (Date.parse(endDate) <= Date.parse(startDate)) {
      alert('Start Datum muss kleiner als End Datum sein');
      this.todateElement.value = '';
    }
    return this.form.checkValidity();
  }
}
