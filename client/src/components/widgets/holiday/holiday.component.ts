
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./holiday.component.scss');

@customElement('app-holiday')
class HolidayComponent extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="title"></slot>
      <slot name="fromdate"></slot>
      <slot name="todate"></slot>
      <span class="remove-holiday" @click="${() => this.emit('appholidayremoveclick')}"></span>
    `;
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
