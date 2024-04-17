
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./appointment.scss');

@customElement('app-appointment')
class AppointmentComponent extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="title"></slot>
      <slot name="date"></slot>
      <span class="remove-appointment" @click="${() => this.emit('appappointmentremoveclick')}"></span>
      <span class="edit-appointment" @click="${() => this.emit('appappointmenteditclick')}"></span>
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
