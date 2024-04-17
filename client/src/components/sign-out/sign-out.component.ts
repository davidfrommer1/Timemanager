
import { customElement, html, internalProperty, LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin';

@customElement('app-sign-out')
class SignOutComponent extends PageMixin(LitElement) {
  @internalProperty()
  linkItems = [
    { title: 'Konto erstellen', routePath: '/users/sign-up' },
    { title: 'Anmelden', routePath: '/users/sign-in' },
    { title: 'Abmelden', routePath: '/users/sign-out' }
  ];

  render() {
    return html`
      <app-header title="Zeitenmanager" .linkItems=${this.linkItems}> </app-header>
      ${this.renderNotification()}
    `;
  }

  async firstUpdated() {
    try {
      await httpClient.delete('/users/sign-out');
      this.setNotification({ infoMessage: 'Abmeldung erfolgreich!' });
      sessionStorage.clear();
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
}
