
import { css, customElement, html, internalProperty, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface WorkingTime {
  id: string;
  date: string;
  start: string;
  end: string;
  duration: string;
  email: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./recordtimemanual.component.scss');

@customElement('app-recordtimemanual')
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
  start = '';
  @internalProperty()
  end = '';
  @internalProperty()
  @query('form')
  form!: HTMLFormElement;
  @query('#date') dateElement!: HTMLInputElement;
  @query('#arbeitsbeginn') startElement!: HTMLInputElement;
  @query('#arbeitsende') endElement!: HTMLInputElement;
  @internalProperty()
  private time: Partial<WorkingTime> = {};

  private recordedTime: WorkingTime[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('/recordtime');
      this.recordedTime = (await response.json()).results;
      console.log(this.recordedTime);
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
      <div class="recordtime-manually-body">
        <h1>Zeit nachträglich erfassen</h1>
        <form>
          <div class="form-group">
            <label class="control-label" for="date">Datum</label>
            <input class="form-control" type="date" autofocus required id="date" name="date" placeholder="Datum" />
            <div class="invalid-feedback">Datum erforderlich</div>
          </div>
          <div class="form-group">
            <label class="control-label" for="date">Arbeitsbeginn</label>
            <input
              class="form-control"
              type="time"
              required
              id="arbeitsbeginn"
              name="arbeitsbeginn"
              placeholder="Arbeitsbeginn"
            />
            <div class="invalid-feedback">Fehlerhafter Arbeitsbeginn</div>
          </div>
          <div class="form-group">
            <label class="control-label" for="date">Arbeitsende</label>
            <input
              class="form-control"
              type="time"
              autofocus
              required
              id="arbeitsende"
              name="arbeitsende"
              placeholder="Arbeitsende"
            />
            <div class="invalid-feedback">Fehlerhaftes Arbeitsende</div>
          </div>
          <button id="save" type="button" class="btn btn-primary" @click="${this.calculateTime}">Sichern</button>
        </form>
      </div>
    `;
  }

  async calculateTime() {
    this.start = this.startElement.value || '';
    this.time.start = this.start;
    this.end = this.endElement.value || '';
    this.time.end = this.end;
    const starthour = parseInt(this.start.substr(0, 2));
    const startmin = parseInt(this.start.substr(3, 6));
    const endhour = parseInt(this.end.substr(0, 2));
    const endmin = parseInt(this.end.substr(3, 6));
    let durhours = endhour - starthour;
    let durmins = endmin - startmin;
    this.time.email = sessionStorage.getItem('email') as string;
    if (durhours == 1 && durmins < 0) {
      //Arbeitszeit unter 1h
      durhours--;
      if (durmins < 0) {
        durmins = durmins * -1;
        durmins = 60 - durmins;
      }
    } else if (durmins < 0 && durhours > 1) {
      durhours--;
      if (durmins < 0) {
        durmins = durmins * -1;
        durmins = 60 - durmins;
      }
    } else {
      if (durmins < 0) {
        durmins = durmins * -1;
        durmins = 60 - durmins;
      }
    }
    let duration = ``;
    if (durhours < 10 && durmins < 10) {
      duration = 0 + durhours + ':' + 0 + durmins;
    } else if (durhours > 10 && durmins < 10) {
      duration = durhours + ':' + 0 + durmins;
    } else if (durhours > 10 && durmins > 10) {
      duration = durhours + ':' + 0 + durmins;
    } else {
      duration = durhours + ':' + durmins;
    }

    this.time.duration = duration;
    console.log(this.isdatevalid);
    if ((await this.isdatevalid()) == true) {
      const temp = this.time.duration.substr(0, 2);
      const postime = parseInt(temp);
      if (postime < 0) {
        this.form.classList.add('was-validated');
        alert('Arbeitsende muss größer als Arbeitsbeginn sein!!!');
      } else {
        this.save();
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  async isdatevalid() {
    this.time.date = this.dateElement.value.toString();
    this.time.date = this.time.date.split('-').reverse().join('.');
    let month = new Date().getMonth();
    month++;
    const day = new Date().getDate().toString();
    const todayd = parseInt(day.substr(0, 2));
    console.log(todayd);

    console.log(month);
    const bookedd = parseInt(this.time.date.substr(0, 2));
    console.log(bookedd);
    const bookedmstr = this.dateElement.value.substr(4, 4);
    const booedm = bookedmstr.substr(2, 2);
    const bookedm = parseInt(booedm);
    console.log(bookedm);
    if (bookedd > todayd && month <= bookedm) {
      return false;
    }
    return this.form.checkValidity();
  }
  async save() {
    if ((await this.isvalid()) == true) {
      try {
        const response = await httpClient.post('/recordtime', this.time);
        const test: WorkingTime = await response.json();
        this.recordedTime = [...this.recordedTime, test];
        this.dateElement.value = '';
        this.startElement.value = '';
        this.endElement.value = '';
        router.navigate('/recordtime');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  async isvalid() {
    if (this.time.email != null) {
      for (let i = 0; i < this.recordedTime.length; i++) {
        if (this.recordedTime[i].date == this.time.date) {
          return false;
        }
      }
      return true;
    }
  }
}
