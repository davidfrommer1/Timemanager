
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { guard } from 'lit-html/directives/guard';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface Appointment {
  id: string;
  title: string;
  date: string;
  description: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./appointments.component.scss');

@customElement('app-appointments')
class AppointmentsComponent extends PageMixin(LitElement) {
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
  @query('#date') dateElement!: HTMLInputElement;
  @query('#description') descriptionElement!: HTMLInputElement;

  @internalProperty()
  private appointments: Appointment[] = [];

  @internalProperty()
  private appointmentsArchive: Appointment[] = [];

  @internalProperty()
  private collapseInfo = false;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/appointments');
      this.appointments = (await response.json()).results;
      const response2 = await httpClient.get('/appointments');
      this.appointmentsArchive = (await response2.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  render() {
    this.sortAppointment();
    this.sortAppointmentReverse();
    this.filterAppointment();
    this.filterAppointmentReverse();
    return html`
      ${this.renderNotification()}
      <div class="appointment-body">
      <h1>Termine</h1>
      <form>
        <div class ="form-group">
          <label class="control-label" for= "title">Titel</label>
          <input
            class="form-control"
            type="text"
            autofocus
            required
            id="title"
            name="title"
            placeholder="Termin"
          />
          <div class="invalid-feedback">Terminname ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="date">Datum und Uhrzeit</label>
          <input
            class="form-control"
            type="datetime-local"
            required
            id="date"
            name="date"
          />
          <div class="invalid-feedback">Datum ist ungültig</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="description">Beschreibung</label>
          <textarea
            class="form-control"
            id="description"
            name="description"
            rows="3"
            placeholder="Termininformationen"
          /></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="reset">Felder leeren</button>
      </form>
      </div>
      
      <div class="appointments">
        ${guard(
          [this.appointments],
          () => html`
            ${repeat(
              this.appointments,
              appointment => appointment.id,
              appointment => html`
                <app-appointment
                  @appappointmentremoveclick=${() => this.removeAppointment(appointment)}
                  @appappointmenteditclick=${() => this.showAppointmentDetails(appointment)}
                >
                  <span class="slottitle" slot="title">${appointment.title}</span>
                  <span slot="date"
                    >${appointment.date.split('T').reverse().join('Uhr ').split(' ').reverse().join(' ')}</span
                  >
                </app-appointment>
              `
            )}
          `
        )}
        </div>
      </div>
      <button type="button" id="btn-archive" class="btn btn-primary" @click="${
        this.collapse
      }">Alte Termine anzeigen</button>
      <p></p>
      <div class="archivebody">
      ${
        this.collapseInfo
          ? html`
        <div id="content">
          <p>
          ${guard(
            [this.appointmentsArchive],
            () => html`
              ${repeat(
                this.appointmentsArchive,
                appointment => appointment.id,
                appointment => html`
                  <app-appointment
                    @appappointmentremoveclick=${() => this.removeAppointmentArchive(appointment)}
                    @appappointmenteditclick=${() => this.showAppointmentDetails(appointment)}
                  >
                    <span class="slottitle" slot="title">${appointment.title}</span>
                    <span slot="date"
                      >${appointment.date.split('T').reverse().join('Uhr ').split(' ').reverse().join(' ')}</span
                    >
                  </app-appointment>
                `
              )}
            `
          )}
          </p>
      </div>
      </div>
      `
          : html``
      }
    `;
  }
  async collapse() {
    if (this.collapseInfo == false) {
      this.collapseInfo = true;
    } else {
      this.collapseInfo = false;
    }
  }

  async removeAppointment(appointmentToRemove: Appointment) {
    try {
      await httpClient.delete('/appointments/' + appointmentToRemove.id);
      this.appointments = this.appointments.filter(appointments => appointments.id !== appointmentToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
  async removeAppointmentArchive(appointmentToRemove: Appointment) {
    try {
      await httpClient.delete('/appointments/' + appointmentToRemove.id);
      this.appointmentsArchive = this.appointmentsArchive.filter(
        appointmentsArchive => appointmentsArchive.id !== appointmentToRemove.id
      );
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async showAppointmentDetails(appointment: Appointment) {
    router.navigate(`/appointments/${appointment.id}`);
  }

  async submit(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      const partialAppointment: Partial<Appointment> = {
        title: String(this.titleElement.value),
        date: String(this.dateElement.value),
        description: String(this.descriptionElement.value)
      };
      try {
        const response = await httpClient.post('/appointments', partialAppointment);
        const appointment: Appointment = await response.json();

        const d = new Date();
        const today = d.toLocaleDateString().split('.');
        const date = partialAppointment.date!.split('T');
        const date2 = date[0].split('-').reverse();
        if (
          Number(today[2]) > Number(date2[2]) ||
          (Number(today[2]) == Number(date2[2]) && Number(today[1]) > Number(date2[1])) ||
          (Number(today[2]) == Number(date2[2]) &&
            Number(today[1]) == Number(date2[1]) &&
            Number(today[0]) > Number(date2[0]))
        ) {
          this.appointmentsArchive = [...this.appointmentsArchive, appointment];
        } else {
          this.appointments = [...this.appointments, appointment];
        }
        this.titleElement.value = '';
        this.dateElement.value = '';
        this.descriptionElement.value = '';
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  async sortAppointment() {
    this.appointments.sort(function (a, b) {
      const c = a.date.split('T');
      const d = b.date.split('T');
      const e = Number(c[0].split('-').join(''));
      const f = Number(d[0].split('-').join(''));
      if (e < f) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  async sortAppointmentReverse() {
    this.appointmentsArchive.sort(function (a, b) {
      const c = a.date.split('T');
      const d = b.date.split('T');
      const e = Number(c[0].split('-').join(''));
      const f = Number(d[0].split('-').join(''));
      if (e < f) {
        return -1;
      } else if (a.date > b.date) {
        return 1;
      } else {
        return 0;
      }
    });
    this.appointmentsArchive.reverse();
  }

  async filterAppointment() {
    let counter = 0;
    this.appointments.forEach(a => {
      const d = new Date();
      const today = d.toLocaleDateString().split('.');
      const date = a.date.split('T');
      const date2 = date[0].split('-').reverse();
      if (
        Number(today[2]) > Number(date2[2]) ||
        (Number(today[2]) == Number(date2[2]) && Number(today[1]) > Number(date2[1])) ||
        (Number(today[2]) == Number(date2[2]) &&
          Number(today[1]) == Number(date2[1]) &&
          Number(today[0]) > Number(date2[0]))
      ) {
        counter++;
      }
    });
    for (let i = 0; i < counter; i++) {
      this.appointments.shift();
    }
  }

  async filterAppointmentReverse() {
    let counter = 0;
    this.appointmentsArchive.forEach(a => {
      const d = new Date();
      const today = d.toLocaleDateString().split('.');
      const date = a.date.split('T');
      const date2 = date[0].split('-').reverse();
      if (
        Number(today[2]) < Number(date2[2]) ||
        (Number(today[2]) == Number(date2[2]) && Number(today[1]) < Number(date2[1])) ||
        (Number(today[2]) == Number(date2[2]) &&
          Number(today[1]) == Number(date2[1]) &&
          Number(today[0]) - 1 < Number(date2[0]))
      ) {
        counter++;
      }
    });
    for (let i = 0; i < counter; i++) {
      this.appointmentsArchive.shift();
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
