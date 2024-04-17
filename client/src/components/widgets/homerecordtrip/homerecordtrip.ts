
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./homerecordtrip.scss');

@customElement('app-homerecordtrip')
class Homerecordtrip extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="customer"></slot>
      <slot name="fromdate"></slot>
      <slot name="todate"></slot>
      <slot name="hours"></slot>
    `;
  }
}
