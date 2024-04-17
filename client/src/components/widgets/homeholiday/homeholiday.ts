
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./homeholiday.scss');

@customElement('app-homeholiday')
class Homeholiday extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="title"></slot>
      <slot name="fromdate"></slot>
      <slot name="todate"></slot>
    `;
  }
}
