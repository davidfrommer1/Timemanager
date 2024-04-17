
import { css, customElement, html, internalProperty, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';
import { User } from '../../../../api-server/src/models/user';
import bcrypt from 'bcryptjs';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./changepassword.component.scss');

@customElement('app-changepassword')
class ChangePasswordComponent extends PageMixin(LitElement) {
  static styles = [
    css`
            '${unsafeCSS(sharedCSS)}
        `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];
  @internalProperty()
  oldpw = '';

  @internalProperty()
  newpw = '';
  @query('form') form!: HTMLInputElement;
  @query('#oldpw') oldpwElement!: HTMLInputElement;
  @query('#newpw') newpwElement!: HTMLInputElement;

  @internalProperty()
  private users: User[] = [];

  @internalProperty()
  private user: Partial<User> = {};

  async firstUpdated() {
    try {
      //console.log('get');
      const response = await httpClient.get('/users');
      this.users = (await response.json()).results;
      console.log(this.users);
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }
  async isFormValid() {
    bcrypt.compare(this.oldpwElement.value, this.users[0].password, (err, res) => {
      if (res == true) {
        this.submit();
        alert('Ihr Passwort wurde erfolgreich geändert');
      } else if (res == false) {
        alert('Das alte Passwort ist nicht korrekt!');
      } else {
        console.log(err);
      }
    });
  }

  async submit() {
    this.user.password = this.newpwElement.value;
    this.user.id = this.users[0].id;
    try {
      await httpClient.patch('/users/' + this.user.id, this.user);
      router.navigate('/home');
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Passwort ändern</h1>
      <form novalidate>
        <div class="changepassword">
          <label class="control-label" for="oldpw">Altes Passwort</label>
          <input class="form-control" type="password" required id="oldpw" name="oldpw" placeholder="Altes Kennwort" />
        </div>
        <div>
          <label class="control-label" for="newpw">Neues Passwort</label>
          <input
            class="form-control"
            type="password"
            pattern="(?=.*[a-z])(?=.*[A-Z]).{10,}"
            required
            id="newpw"
            name="newpw"
            placeholder="Passwort ist erforderlich und muss mind. 10 Zeichen lang sein, einen Großbuchstaben, eine Zahl und einen Kleinbuchstaben haben"
          />
        </div>
        <button id="save" type="button" class="btn btn-primary" @click="${this.isFormValid}">Sichern</button>
      </form>
    `;
  }
}
