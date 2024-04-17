
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./homeappointment.scss');

@customElement('app-homeappointment')
class HomeappointmentComponent extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="title"></slot>
      <slot name="date"></slot>
    `;
  }
}
