
import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';

const componentCSS = require('./workingtime.scss');

@customElement('app-workingtime')
class WorkingtimeComponent extends LitElement {
  static styles = css`
    ${unsafeCSS(componentCSS)}
  `;
  render() {
    return html`
      <slot name="date"></slot>
      <slot name="duration"></slot>
      <span class="remove-time" @click="${() => this.emit('appworkingtimeremoveclick')}"></span>
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
