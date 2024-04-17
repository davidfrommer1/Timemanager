
import { css, customElement, html, LitElement, internalProperty, unsafeCSS } from 'lit-element';
import { router } from '../../router';
import { httpClient } from '../../http-client';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./app.component.scss');

@customElement('app-root')
class AppComponent extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];
  @internalProperty()
  title = 'Zeitenmanager';

  @internalProperty()
  linkItems = [
    { title: 'Termine', routePath: '/appointments' },
    { title: 'Urlaub', routePath: '/holidays' },
    { title: 'Reise Erfassen', routePath: '/recordtrips' },
    { title: 'Arbeitszeiten', routePath: '/recordtime' },
    { title: 'Passwort ändern', routePath: '/changepassword' },
    { title: 'Abmelden', routePath: '/users/sign-out' }
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  renderRouterOutlet() {
    return router.select(
      {
        '/users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        '/users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        '/users/sign-out': () => html`<app-sign-out></app-sign-out>`,
        '/holidays': () => html`<app-holidays></app-holidays>`,
        '/recordtrips': () => html`<app-recordtrips></app-recordtrips>`,
        '/recordtrips/:id': params =>
          html`<app-recordtrip-details .recordtripId=${params.id}></app-recordtrip-details>`,
        '/recordtime': () => html`<app-recordtime></app-recordtime>`,
        '/recordtimemanual': () => html`<app-recordtimemanual></app-recordtimemanual>`,
        '/appointments': () => html`<app-appointments></app-appointments>`,
        '/appointments/:id': params =>
          html`<app-appointment-details .appointmentId=${params.id}></app-appointment-details>`,
        '/home': () => html`<app-home></app-home>`,
        '/changepassword': () => html`<app-changepassword></app-changepassword>`
      },
      () => html`<app-home></app-home>`
    );
  }

  render() {
    return html`
      <app-header title="${this.title}" .linkItems=${this.linkItems}> </app-header>
      <div class="main container">${this.renderRouterOutlet()}</div>
    `;
  }
}
