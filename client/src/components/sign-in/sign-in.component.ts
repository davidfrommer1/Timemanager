
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./sign-in.component.scss');

@customElement('app-sign-in')
class SignInComponent extends PageMixin(LitElement) {
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

  @query('#email')
  emailElement!: HTMLInputElement;

  @query('#password')
  passwordElement!: HTMLInputElement;

  render() {
    return html`
      <app-header title="Zeitenmanager" .linkItems=${this.linkItems}> </app-header>
      ${this.renderNotification()}
      <h1>Anmelden</h1>
      <form>
        <div class="form-group">
          <label class="control-label" for="email">E-Mail</label>
          <input class="form-control" type="email" autofocus required id="email" name="email" />
          <div class="invalid-feedback">E-Mail ist erforderlich und muss gültig sein</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password">Passwort</label>
          <input class="form-control" type="password" required id="password" name="password" />
          <div class="invalid-feedback">Passwort ist erforderlich</div>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Anmelden</button>
        <button class="btn btn-secondary" type="button" @click="${this.redirectRegister}">Konto erstellen</button>
      </form>
    `;
  }

  async redirectRegister() {
    router.navigate(`/users/sign-up`);
  }

  async submit() {
    if (this.isFormValid()) {
      const authData = {
        email: this.emailElement.value,
        password: this.passwordElement.value
      };
      window.sessionStorage.setItem('email', this.emailElement.value);
      try {
        await httpClient.post('/users/sign-in', authData);
        router.navigate('/home');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
