
import { css, customElement, html, LitElement, property, query, unsafeCSS } from 'lit-element';
import { Holiday } from '../../../../api-server/src/models/holiday';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./holiday-details.component.scss');

@customElement('app-holiday-details')
class HolidayDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property()
  holidayId!: string;

  @query('form')
  form!: HTMLFormElement;

  @query('#title')
  titleElement!: HTMLInputElement;

  @query('#fromdate')
  fromdateElement!: HTMLInputElement;

  @query('#todate')
  todateElement! : HTMLInputElement;

  @query('#description')
  descriptionElement!: HTMLInputElement;

  holiday!: Holiday;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/holidays/' + this.holidayId);
      this.holiday = await response.json();
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
      <h1>Urlaubsinformationen</h1>
      <form novalidate>
        <div class="form-group">
          <label class="control-label" for="title">Urlaub Name</label>
          <input
            class="form-control"
            type="text"
            autofocus
            required
            id="title"
            name="title"
            .value=${this.holiday?.title || ''}
          />
          <div class="invalid-feedback">Urlaubname ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="title">Von</label>
          <input
            class="form-control"
            type="date"
            id="fromdate"
            name="fromdate"
            .value=${this.holiday?.fromdate || ''}
          />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="title">Bis</label>
          <input
            class="form-control"
            type="date"
            id="todate"
            name="todate"
            .value=${this.holiday?.todate || ''}
          />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="description">Beschreibung</label>
          <textarea
            class="form-control"
            id="description"
            name="description"
            rows="5"
            .value=${this.holiday?.description || ''}
          ></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedHoliday: Holiday = {
        ...this.holiday,
        title: this.titleElement.value,
        fromdate: this.fromdateElement.value,
        todate: this.todateElement.value,
        description: this.descriptionElement.value
      };
      try {
        await httpClient.patch('/holidays/' + updatedHoliday.id, updatedHoliday);
        router.navigate('/holidays');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/holidays');
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}