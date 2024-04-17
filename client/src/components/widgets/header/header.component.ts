
import { css, customElement, html, LitElement, property, internalProperty, unsafeCSS } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./header.component.scss');

@customElement('app-header')
class HeaderComponent extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];
  @property()
  title = '';

  @property()
  linkItems: Array<{ title: string; routePath: string }> = [];

  @internalProperty()
  private navbarOpen = false;

  render() {
    return html`
      <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-success">
        <a class="navbar-brand" href="/home"><span class="logo"></span>${this.title}</a>
        <button
          @click="${this.toggle}"
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div
          class=${classMap({
            'collapse': true,
            'navbar-collapse': true,
            'justify-content-end': true,
            'show': this.navbarOpen
          })}
          id="navbarNav"
        >
          <ul class="navbar-nav">
            ${this.linkItems.map(
              linkItem => html`
                <li class="nav-item">
                  <a class="nav-link" href="${linkItem.routePath}" @click=${this.close}>${linkItem.title}</a>
                </li>
              `
            )}
          </ul>
        </div>
      </nav>
    `;
  }

  toggle() {
    this.navbarOpen = !this.navbarOpen;
  }

  close() {
    this.navbarOpen = false;
  }
}
