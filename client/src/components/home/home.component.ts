
import { css, customElement, html, LitElement, internalProperty, unsafeCSS } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { guard } from 'lit-html/directives/guard';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./home.component.scss');

interface Appointment {
  id: string;
  title: string;
  purpose: string;
  date: string;
  description: string;
  userId: string;
}
interface Holiday {
  id: string;
  userId: string;
  title: string;
  fromdate: string;
  todate: string;
}

interface WorkingTime {
  id: string;
  date: string;
  start: string;
  end: string;
  duration: string;
  email: string;
}

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

@customElement('app-home')
class HomeComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @internalProperty()
  private appointments: Appointment[] = [];

  @internalProperty()
  private holidays: Holiday[] = [];

  @internalProperty()
  private recordedTime: WorkingTime[] = [];

  @internalProperty()
  private recordtrips: RecordTrip[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('/appointments');
      this.appointments = (await response.json()).results;
      const response2 = await httpClient.get('/holidays');
      this.holidays = (await response2.json()).results;
      const response3 = await httpClient.get('/recordtime');
      this.recordedTime = (await response3.json()).results;
      const response4 = await httpClient.get('/recordtrips');
      this.recordtrips = (await response4.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }

    this.filterAppointmentReverse();
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="homebody">
        <div class="recordtime-block">
          <h1>Arbeitszeiten</h1>
          <button
            type="button"
            class="btn btn-primary"
            id="btn-recordtime"
            onclick="window.location.href = '/app/recordtime';"
          >
            Zu den Arbeitszeiten
          </button>
          <p></p>
          <div class="appointments">
            ${guard(
              [this.recordedTime],
              () => html`
                ${repeat(
                  this.recordedTime,
                  entry => entry.id,
                  entry => html`
                    <app-workingtime>
                      <span class="slottitle" slot="date">${entry.date} </span>
                      <span slot="duration">${entry.duration}</span>
                    </app-workingtime>
                  `
                )}
              `
            )}
          </div>
        </div>
        <div class="appointments-block">
          <h1>Termine</h1>
          <button
            type="button"
            class="btn btn-primary"
            id="btn-appointments"
            onclick="window.location.href = '/app/appointments';"
          >
            Zu den Terminen
          </button>
          <p></p>
          <div class="appointments">
            ${guard(
              [this.appointments],
              () => html`
                ${repeat(
                  this.appointments,
                  appointment => appointment.id,
                  appointment => html`
                    <app-homeappointment @appappointmentclick=${() => this.showAppointmentDetails(appointment)}>
                      <span class="slottitle" slot="title">${appointment.title}</span>
                      <span slot="date"
                        >${appointment.date.split('T').reverse().join('Uhr ').split(' ').reverse().join(' ')}</span
                      >
                    </app-homeappointment>
                  `
                )}
              `
            )}
          </div>
        </div>
        <div class="holiday-block">
          <h1>Urlaub</h1>
          <button
            type="button"
            class="btn btn-primary"
            id="btn-holidays"
            onclick="window.location.href = '/app/holidays';"
          >
            Zum Urlaub
          </button>
          <p></p>
          <div class="appointments">
            ${guard(
              [this.holidays],
              () => html`
                ${repeat(
                  this.holidays,
                  holiday => holiday.id,
                  holiday => html`
                    <app-homeholiday>
                      <span slot="title">${holiday.title}</span>
                      <span slot="fromdate">Von: ${holiday.fromdate}</span>
                      <span slot="todate">Bis: ${holiday.todate}</span>
                    </app-homeholiday>
                  `
                )}
              `
            )}
          </div>
        </div>
        <div class="trips-block">
          <h1>Reisen</h1>
          <button
            type="button"
            class="btn btn-primary"
            id="btn-recordtrips"
            onclick="window.location.href = '/app/recordtrips';"
          >
            Zu den Reisen
          </button>

          <p></p>
          <div class="appointments">
            ${guard(
              [this.recordtrips],
              () => html`
                ${repeat(
                  this.recordtrips,
                  recordtrip => recordtrip.id,
                  recordtrip => html`
                    <app-homerecordtrip>
                      <span slot="customer">${recordtrip.customer}</span>
                      <span slot="fromdate">${recordtrip.fromdate}</span>
                      <span slot="todate">${recordtrip.todate}</span>
                      <span slot="hours">${recordtrip.hours}</span>
                    </app-homerecordtrip>
                  `
                )}
              `
            )}
          </div>
        </div>
      </div>
    `;
  }

  async removeAppointment(appointmentToRemove: Appointment) {
    try {
      await httpClient.delete('/appointments/' + appointmentToRemove.id);
      this.appointments = this.appointments.filter(appointments => appointments.id !== appointmentToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async filterAppointmentReverse() {
    let counter = 0;
    this.appointments.forEach(a => {
      const d = new Date();
      const today = d.toLocaleDateString().split('.');
      const date = a.date.split('T');
      const date2 = date[0].split('-').reverse();
      let c = 1;
      if (Number(today[2]) < Number(date2[2])) {
        c = 0;
      } else if (Number(today[2]) == Number(date2[2]) && Number(today[1]) < Number(date2[1])) {
        c = 0;
      } else if (
        Number(today[2]) == Number(date2[2]) &&
        Number(today[1]) == Number(date2[1]) &&
        Number(today[0]) - 1 < Number(date2[0])
      ) {
        c = 0;
      }
      if (c == 1) {
        counter++;
      }
    });
    this.sortAppointment();

    for (let i = 0; i < counter; i++) {
      this.appointments.shift();
    }
    this.appointments = this.appointments.slice(0, 5);
    this.holidays = this.holidays.slice(0, 5);
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

  async removeHoliday(holidayToRemove: Holiday) {
    try {
      await httpClient.delete('/holidays/' + holidayToRemove.id);
      this.holidays = this.holidays.filter(holiday => holiday.id !== holidayToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
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
  async showAppointmentDetails(appointment: Appointment) {
    router.navigate(`/appointments/${appointment.id}`);
  }
}
