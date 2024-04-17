
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./sign-up.component.scss');

@customElement('app-sign-up')
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @internalProperty()
  linkItems = [
    { title: 'Konto erstellen', routePath: '/users/sign-up' },
    { title: 'Anmelden', routePath: '/users/sign-in' },
    { title: 'Abmelden', routePath: '/users/sign-out' }
  ];

  @query('form')
  form!: HTMLFormElement;

  @query('#name')
  nameElement!: HTMLInputElement;

  @query('#email')
  emailElement!: HTMLInputElement;

  @query('#password')
  passwordElement!: HTMLInputElement;

  @query('#password-check')
  passwordCheckElement!: HTMLInputElement;

  render() {
    return html`
      <app-header title="Zeitenmanager" .linkItems=${this.linkItems}> </app-header>
      ${this.renderNotification()}
      <h1>Kundenkonto erstellen</h1>
      <form novalidate>
        <div class="form-group">
          <label class="control-label" for="name">Name</label>
          <input class="form-control" type="text" pattern="[A-Z]{1}.+" autofocus required id="name" name="name" />
          <div class="invalid-feedback">Name ist erforderlich und muss mit Großbuchstaben anfangen</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="email">E-Mail</label>
          <input class="form-control" type="email" required id="email" name="email" />
          <div class="invalid-feedback">E-Mail ist erforderlich und muss gültig sein</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password">Passwort</label>
          <input
            class="form-control"
            type="password"
            pattern="(?=.*[a-z])(?=.*[A-Z]).{10,}"
            title="Muss mindestens 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen Kleinbuchstaben haben"
            required
            minlength="10"
            id="password"
            name="password"
            autocomplete="off"
          />
          <div class="invalid-feedback">
            Passwort ist erforderlich und muss mind. 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen
            Kleinbuchstaben haben
          </div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password-check">Passwort nochmal eingeben</label>
          <input
            class="form-control"
            type="password"
            pattern="(?=.*[a-z])(?=.*[A-Z]).{10,}"
            title="Muss mindestens 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen Kleinbuchstaben haben"
            required
            minlength="10"
            id="password-check"
            name="passwordCheck"
          />
          <div class="invalid-feedback">
            Erneute Passworteingabe ist erforderlich und muss mit der ersten Passworteingabe übereinstimmen
          </div>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Konto erstellen</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const accountData = {
        name: this.nameElement.value,
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value
      };
      window.sessionStorage.setItem('email', this.emailElement.value);
      try {
        await httpClient.post('users', accountData);
        router.navigate('/home');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Passwörter müssen gleich sein');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }
}
