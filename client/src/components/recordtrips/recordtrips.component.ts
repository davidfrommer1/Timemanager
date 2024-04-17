
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { guard } from 'lit-html/directives/guard';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface RecordTrip {
  id: string;
  userId: string;
  fromdate: string;
  todate: string;
  hours: string;
  destination: string;
  customer: string;
  note: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./recordtrips.component.scss');

@customElement('app-recordtrips')
class RecordtripsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('form') form!: HTMLFormElement;
  @query('#fromdate') fromdateElement!: HTMLInputElement;
  @query('#todate') todateElement!: HTMLInputElement;
  @query('#hours') hoursElement!: HTMLInputElement;
  @query('#destination') destinationElement!: HTMLInputElement;
  @query('#customer') customerElement!: HTMLInputElement;
  @query('#note') noteElement!: HTMLInputElement;

  @internalProperty()
  private recordtrips: RecordTrip[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('/recordtrips');
      this.recordtrips = (await response.json()).results;
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
        <div class="form-group" name="fromdate">
          <label class="control-label" for="fromdate">Start Datum</label>
          <input class="form-control" type="date" required id="fromdate" name="fromdate" placeholder="Datum bis" />
          <div class="invalid-feedback">Start Datum ist ungültig</div>
        </div>
        <div class="form-group" name="todate">
          <label class="control-label" for="todate">End Datum</label>
          <input class="form-control" type="date" id="todate" required name="todate" placeholder="Datum bis" />
          <div class="invalid-feedback">End Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="hours">Stunden</label>
          <input
            class="form-control"
            type="number"
            required
            id="hours"
            name="hours"
            placeholder="0.00"
            min="0"
            step="0.25"
          />
          <div class="invalid-feedback">Stunden müssen gefüllt sein</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="destination">Reiseort</label>
          <input
            class="form-control"
            type="text"
            maxlength="100"
            required
            id="destination"
            name="destination"
            placeholder="Reiseort"
          />
          <div class="invalid-feedback">Reiseort ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="customer">Kunde</label>
          <input
            class="form-control"
            type="text"
            maxlength="50"
            required
            id="customer"
            name="customer"
            placeholder="Kunde"
          />
          <div class="invalid-feedback">Kunde ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="note">Bemerkung</label>
          <textarea
            class="form-control"
            type="text"
            maxlength="300"
            id="note"
            name="note"
            rows="4"
            placeholder="Bemerkung"
          ></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="reset">Zurücksetzen</button>
      </form>
      <p></p>
      <div class="recordtrips">
        ${guard(
          [this.recordtrips],
          () => html`
            ${repeat(
              this.recordtrips,
              recordtrip => recordtrip.id,
              recordtrip => html`
                <app-recordtrip
                  @apprecordtripremoveclick=${() => this.removeRecordtrip(recordtrip)}
                  @apprecordtripeditclick=${() => this.showRecordtripDetails(recordtrip)}
                >
                  <span slot="customer">${recordtrip.customer}</span>
                  <span slot="fromdate">${recordtrip.fromdate}</span>
                  <span slot="todate">${recordtrip.todate}</span>
                  <span slot="hours">${recordtrip.hours}</span>
                </app-recordtrip>
              `
            )}
          `
        )}
      </div>
    `;
  }

  async removeRecordtrip(recordtripToRemove: RecordTrip) {
    try {
      await httpClient.delete('/recordtrips/' + recordtripToRemove.id);
      this.recordtrips = this.recordtrips.filter(recordtrip => recordtrip.id !== recordtripToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async showRecordtripDetails(recordtrip: RecordTrip) {
    router.navigate(`/recordtrips/${recordtrip.id}`);
  }

  async submit(event: Event) {
    event.preventDefault();
    if ((await this.validateDates()) == true) {
      const partialRecordtrip: Partial<RecordTrip> = {
        fromdate: this.fromdateElement.value,
        todate: this.todateElement.value,
        hours: this.hoursElement.value,
        destination: this.destinationElement.value,
        customer: this.customerElement.value,
        note: this.noteElement.value
      };
      console.log(partialRecordtrip);
      try {
        location.reload();
        const response = await httpClient.post('/recordtrips', partialRecordtrip);
        const recordtrip: RecordTrip = await response.json();
        this.recordtrips = [...this.recordtrips, recordtrip];
        this.fromdateElement.value = '';
        this.todateElement.value = '';
        this.hoursElement.value = '';
        this.destinationElement.value = '';
        this.customerElement.value = '';
        this.noteElement.value = '';
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
