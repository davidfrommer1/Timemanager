
import { css, customElement, html, internalProperty, LitElement, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';
import { guard } from 'lit-html/directives/guard';
import { repeat } from 'lit-html/directives/repeat';

interface WorkingTime {
  id: string;
  date: string;
  start: string;
  end: string;
  duration: string;
  email: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./recordtime.component.scss');

@customElement('app-recordtime')
class RecordTimeComponent extends PageMixin(LitElement) {
  static styles = [
    css`
            '${unsafeCSS(sharedCSS)}
        `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];
  @internalProperty()
  start = 0;
  @internalProperty()
  end = 0;
  @internalProperty()
  private recordedTime: WorkingTime[] = [];
  @internalProperty()
  private time: Partial<WorkingTime> = {};

  async firstUpdated() {
    try {
      const response = await httpClient.get('/recordtime');
      this.recordedTime = (await response.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }
  async startRecord() {
    this.start = new Date().getTime();
    this.start.toLocaleString('de-DE');
    this.time.start = this.start.toString();
    this.time.email = sessionStorage.getItem('email') as string;
  }
  async endRecord() {
    this.end = new Date().getTime();
    this.calculateTime();
    this.time.end = this.end.toString();
  }

  async calculateDate() {
    const today = new Date();
    const daynum = today.getDate();
    let day = '';
    let month = '';
    if (daynum < 10) {
      day = daynum.toString();
      day = '0' + daynum;
    } else {
      day = daynum.toString();
    }
    let monthnum = today.getMonth();
    if (monthnum < 10) {
      monthnum = monthnum + 1;
      month = monthnum.toString();
      month = '0' + monthnum;
    } else {
      month = monthnum.toString();
    }
    const year = today.getFullYear();
    const date = day + '.' + month + '.' + year;
    this.time.date = date;
  }

  async calculateTime() {
    const diff = this.end - this.start;
    this.calculateDate();
    this.formatMs(diff);
  }

  async formatMs(milliseconds: number) {
    const hours = Math.floor(milliseconds / 3600000);
    if (hours > 0) {
      milliseconds -= hours * 3600000;
    }
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes > 0) milliseconds -= minutes * 60000;
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds > 0) milliseconds -= seconds * 1000;
    let stunden = '';
    let minuten = '';
    if (minutes < 10) {
      minuten = minutes.toString();
      minuten = '0' + minuten;
    }
    if (hours < 10) {
      stunden = hours.toString();
      minuten = '0' + stunden;
    }
    const temp = stunden + ':' + minuten;
    this.time.duration = temp;
    return temp;
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="record-time">
        <h1>Zeit erfassen</h1>
        <button type="button" class="btn btn-primary" @click="${this.startRecord}">Arbeitsbeginn</button>
        <button id="end" type="button" class="btn btn-primary" @click="${this.endRecord}">Arbeitsende</button>
        <button id="save" type="button" class="btn btn-primary" @click="${this.isvalid}">Sichern</button>
        <p></p>
        <p></p>
        <p></p>

        <div class="record-time-manually">
          <h1>Zeit nachtragen</h1>
          <button
            id="manual"
            type="button"
            class="btn btn-primary"
            onclick="window.location.href = '/app/recordtimemanual';"
          >
            Zeit nachträglich buchen
          </button>
        </div>
      </div>
      <div class="recorded-times">
        <h1>Erfasste Zeiten</h1>
        ${guard(
          [this.recordedTime],
          () => html`
            ${repeat(
              this.recordedTime,
              entry => entry.id,
              entry => html`
                <app-workingtime @appworkingtimeremoveclick=${() => this.removeBookedTime(entry)}>
                  <span class="slottitle" slot="date">${entry.date} </span>
                  <span slot="duration">${entry.duration}</span>
                </app-workingtime>
              `
            )}
          `
        )}
      </div>
    `;
  }
  async save() {
    try {
      const response = await httpClient.post('/recordtime', this.time);
      const test: WorkingTime = await response.json();
      this.recordedTime = [...this.recordedTime, test];
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
  async isvalid() {
    if (this.time.email != null && this.recordedTime.length != 0) {
      for (let i = 0; i < this.recordedTime.length; i++) {
        if (this.recordedTime[i].date == this.time.date) {
          alert('Zeitbuchung bereits vorhanden');
        }
      }
    } else {
      this.save();
    }
  }

  async removeBookedTime(timeToRemove: WorkingTime) {
    try {
      await httpClient.delete('/recordtime/' + timeToRemove.id);
      this.recordedTime = this.recordedTime.filter(time => time.id !== timeToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
}
