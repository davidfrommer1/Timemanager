
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./recordtrip.component.scss');

@customElement('app-recordtrip')
class RecordtripComponent extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;

  render() {
    return html`
      <slot name="customer"></slot>
      <slot name="fromdate"></slot>
      <slot name="todate"></slot>
      <slot name="hours"></slot>
      <span class="remove-recordtrip" @click="${() => this.emit('apprecordtripremoveclick')}"></span>
      <span class="edit-recordtrip" @click="${() => this.emit('apprecordtripeditclick')}"></span>
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
