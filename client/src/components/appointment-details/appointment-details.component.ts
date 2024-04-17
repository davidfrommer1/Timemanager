
import { css, customElement, html, LitElement, property, query, unsafeCSS } from 'lit-element';
import { Appointment } from '../../../../api-server/src/models/appointment';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./appointment-details.component.scss');

@customElement('app-appointment-details')
class AppointmentDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property()
  appointmentId!: string;

  @query('form')
  form!: HTMLFormElement;

  @query('#title')
  titleElement!: HTMLInputElement;

  @query('#date')
  dateElement!: HTMLInputElement;

  @query('#description')
  descriptionElement!: HTMLInputElement;

  appointment!: Appointment;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/appointments/' + this.appointmentId);
      this.appointment = await response.json();
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
      <h1>Termininformationen</h1>
      <form>
        <div class="form-group">
          <label class="control-label" for="title">Titel</label>
          <input
            class="form-control"
            type="text"
            autofocus
            required
            id="title"
            name="title"
            .value=${this.appointment?.title || ''}
          />
          <div class="invalid-feedback">Terminname ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="title">Datum</label>
          <input
            class="form-control"
            type="datetime-local"
            id="date"
            name="date"
            .value=${this.appointment?.date || ''}
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
            .value=${this.appointment?.description || ''}
          /></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedAppointment: Appointment = {
        ...this.appointment,
        title: this.titleElement.value,
        date: this.dateElement.value,
        description: this.descriptionElement.value
      };
      try {
        await httpClient.patch('/appointments/' + updatedAppointment.id, updatedAppointment);
        router.navigate('/appointments');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/appointments');
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
