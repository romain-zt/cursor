import { widgetStyles } from './styles.js';
import type { Service, TimeSlot, Booking } from '../types/models.js';

type Step = 'services' | 'slots' | 'form' | 'confirmation';

interface WidgetState {
  step: Step;
  services: Service[];
  selectedService: Service | null;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  timezone: string;
  booking: Booking | null;
  customerName: string;
  customerEmail: string;
  emailError: string;
  error: string;
  loading: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ZedCheckoutElement extends HTMLElement {
  private shadow: ShadowRoot;
  private state: WidgetState;

  static get observedAttributes() {
    return ['merchant-id', 'api-base', 'theme'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.state = {
      step: 'services',
      services: [],
      selectedService: null,
      slots: [],
      selectedSlot: null,
      timezone: 'UTC',
      booking: null,
      customerName: '',
      customerEmail: '',
      emailError: '',
      error: '',
      loading: false,
    };
  }

  connectedCallback() {
    this.render();
    this.loadServices();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadServices();
    }
  }

  private get merchantId(): string {
    return this.getAttribute('merchant-id') ?? '';
  }

  private get apiBase(): string {
    return (this.getAttribute('api-base') ?? '').replace(/\/$/, '');
  }

  private async fetchJSON<T>(path: string): Promise<T> {
    const res = await fetch(`${this.apiBase}${path}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status, body });
    }
    return res.json();
  }

  private async postJSON<T>(path: string, data: object): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
    const res = await fetch(`${this.apiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, error: body.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, data: body as T };
  }

  private setState(partial: Partial<WidgetState>) {
    Object.assign(this.state, partial);
    this.render();
  }

  private async loadServices() {
    if (!this.merchantId || !this.apiBase) return;
    this.setState({ loading: true, error: '' });
    try {
      const data = await this.fetchJSON<{ services: Service[] }>(
        `/api/v1/merchants/${this.merchantId}/services`
      );
      this.setState({ services: data.services, loading: false });
    } catch {
      this.setState({ loading: false, error: 'Unable to load booking. Please try again.' });
    }
  }

  private async loadSlots(serviceId: string, date: string, preserveError = false) {
    this.setState({ loading: true, ...(preserveError ? {} : { error: '' }) });
    try {
      const data = await this.fetchJSON<{ slots: TimeSlot[]; timezone: string }>(
        `/api/v1/services/${serviceId}/slots?date=${date}`
      );
      this.setState({ slots: data.slots, timezone: data.timezone, loading: false });
    } catch {
      this.setState({ loading: false, error: 'Unable to load availability. Please try again.' });
    }
  }

  private async submitBooking() {
    const { selectedSlot, customerName, customerEmail } = this.state;
    if (!selectedSlot) return;

    if (!EMAIL_REGEX.test(customerEmail)) {
      this.setState({ emailError: 'Please enter a valid email address' });
      return;
    }

    this.setState({ loading: true, error: '', emailError: '' });
    const result = await this.postJSON<{ booking: Booking }>('/api/v1/bookings', {
      slot_id: selectedSlot.id,
      customer_name: customerName,
      customer_email: customerEmail,
    });

    if (!result.ok) {
      if (result.status === 409) {
        this.setState({
          loading: false,
          error: 'This time slot was just taken. Please choose another.',
          step: 'slots',
          selectedSlot: null,
        });
        if (this.state.selectedService) {
          const today = this.getCurrentDate();
          await this.loadSlots(this.state.selectedService.id, today, true);
        }
        return;
      }
      if (result.status === 422) {
        this.setState({ loading: false, emailError: 'Please enter a valid email address' });
        return;
      }
      this.setState({ loading: false, error: 'Something went wrong. Please try again.' });
      return;
    }

    this.setState({
      loading: false,
      booking: result.data.booking,
      step: 'confirmation',
    });
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  }

  private formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return isoString;
    }
  }

  private formatPrice(cents: number | null): string {
    if (cents === null || cents === undefined) return '';
    return `$${(cents / 100).toFixed(2)}`;
  }

  private render() {
    const { step } = this.state;

    let content = '';
    switch (step) {
      case 'services':
        content = this.renderServices();
        break;
      case 'slots':
        content = this.renderSlots();
        break;
      case 'form':
        content = this.renderForm();
        break;
      case 'confirmation':
        content = this.renderConfirmation();
        break;
    }

    this.shadow.innerHTML = `
      <style>${widgetStyles}</style>
      <div class="zc-container" role="region" aria-label="Booking">
        ${content}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderServices(): string {
    const { services, loading, error } = this.state;

    if (loading) {
      return '<div class="zc-loading">Loading services...</div>';
    }

    if (error) {
      return `
        <div class="zc-message">
          <p>${this.escapeHtml(error)}</p>
          <button class="zc-btn zc-btn-secondary" data-action="retry-services" style="margin-top:1rem;width:auto;">
            Try again
          </button>
        </div>
      `;
    }

    if (services.length === 0) {
      return '<div class="zc-message">No services available</div>';
    }

    const items = services.map((s) => `
      <li class="zc-list-item" data-action="select-service" data-service-id="${this.escapeHtml(s.id)}" role="button" tabindex="0" aria-label="${this.escapeHtml(s.name)}">
        <div>
          <div class="zc-list-item-name">${this.escapeHtml(s.name)}</div>
          <div class="zc-list-item-meta">${s.duration_minutes} min${s.price_cents ? ' · ' + this.formatPrice(s.price_cents) : ''}</div>
        </div>
        <span aria-hidden="true">&rsaquo;</span>
      </li>
    `).join('');

    return `
      <h2 class="zc-step-title">Select a service</h2>
      <ul class="zc-list">${items}</ul>
    `;
  }

  private renderSlots(): string {
    const { slots, loading, error, selectedService, timezone } = this.state;

    let errorBanner = '';
    if (error) {
      errorBanner = `<div class="zc-error-banner">${this.escapeHtml(error)}</div>`;
    }

    if (loading) {
      return `
        <button class="zc-back" data-action="back-to-services">&larr; Back</button>
        ${errorBanner}
        <div class="zc-loading">Loading availability...</div>
      `;
    }

    const dateInput = `
      <div class="zc-field">
        <label class="zc-label" for="zc-date">Date</label>
        <input class="zc-input" type="date" id="zc-date" data-action="change-date"
               value="${this.getCurrentDate()}" min="${this.getCurrentDate()}" />
      </div>
    `;

    if (slots.length === 0) {
      return `
        <button class="zc-back" data-action="back-to-services">&larr; Back</button>
        ${errorBanner}
        <h2 class="zc-step-title">${selectedService ? this.escapeHtml(selectedService.name) : 'Select a time'}</h2>
        ${dateInput}
        <div class="zc-message">No availability on this date.</div>
      `;
    }

    const tzNote = timezone === 'UTC' ? ' <span class="zc-list-item-meta">(Times shown in UTC)</span>' : '';
    const items = slots.map((s) => `
      <li class="zc-list-item" data-action="select-slot" data-slot-id="${this.escapeHtml(s.id)}" role="button" tabindex="0" aria-label="${this.formatTime(s.starts_at)}">
        <span>${this.formatTime(s.starts_at)} – ${this.formatTime(s.ends_at)}</span>
      </li>
    `).join('');

    return `
      <button class="zc-back" data-action="back-to-services">&larr; Back</button>
      ${errorBanner}
      <h2 class="zc-step-title">${selectedService ? this.escapeHtml(selectedService.name) : 'Select a time'}${tzNote}</h2>
      ${dateInput}
      <ul class="zc-list">${items}</ul>
    `;
  }

  private renderForm(): string {
    const { selectedSlot, customerName, customerEmail, emailError, loading, error } = this.state;

    let errorBanner = '';
    if (error) {
      errorBanner = `<div class="zc-error-banner">${this.escapeHtml(error)}</div>`;
    }

    const slotInfo = selectedSlot
      ? `<p class="zc-list-item-meta">${this.formatDate(selectedSlot.starts_at)} at ${this.formatTime(selectedSlot.starts_at)}</p>`
      : '';

    return `
      <button class="zc-back" data-action="back-to-slots">&larr; Back</button>
      ${errorBanner}
      <h2 class="zc-step-title">Your details</h2>
      ${slotInfo}
      <form class="zc-form" data-action="submit-booking">
        <div class="zc-field">
          <label class="zc-label" for="zc-name">Name</label>
          <input class="zc-input" type="text" id="zc-name" required
                 value="${this.escapeHtml(customerName)}"
                 placeholder="Your full name" autocomplete="name" />
        </div>
        <div class="zc-field">
          <label class="zc-label" for="zc-email">Email</label>
          <input class="zc-input ${emailError ? 'zc-input-error' : ''}" type="email" id="zc-email" required
                 value="${this.escapeHtml(customerEmail)}"
                 placeholder="you@example.com" autocomplete="email" />
          ${emailError ? `<span class="zc-error-text">${this.escapeHtml(emailError)}</span>` : ''}
        </div>
        <button class="zc-btn" type="submit" ${loading ? 'disabled' : ''}>
          ${loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    `;
  }

  private renderConfirmation(): string {
    const { booking, selectedService, selectedSlot } = this.state;
    if (!booking) return '';

    return `
      <div class="zc-confirmation">
        <div class="zc-confirmation-icon" aria-hidden="true">&#10003;</div>
        <h2>Booking Confirmed</h2>
        <p>Reference: <strong>${this.escapeHtml(booking.reference_code)}</strong></p>
        <div class="zc-confirmation-details">
          <div class="zc-confirmation-row">
            <span class="zc-confirmation-label">Service</span>
            <span>${selectedService ? this.escapeHtml(selectedService.name) : ''}</span>
          </div>
          <div class="zc-confirmation-row">
            <span class="zc-confirmation-label">Date</span>
            <span>${selectedSlot ? this.formatDate(selectedSlot.starts_at) : ''}</span>
          </div>
          <div class="zc-confirmation-row">
            <span class="zc-confirmation-label">Time</span>
            <span>${selectedSlot ? `${this.formatTime(selectedSlot.starts_at)} – ${this.formatTime(selectedSlot.ends_at)}` : ''}</span>
          </div>
          <div class="zc-confirmation-row">
            <span class="zc-confirmation-label">Name</span>
            <span>${this.escapeHtml(booking.customer_name)}</span>
          </div>
          <div class="zc-confirmation-row">
            <span class="zc-confirmation-label">Email</span>
            <span>${this.escapeHtml(booking.customer_email)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    this.shadow.querySelectorAll('[data-action="select-service"]').forEach((el) => {
      el.addEventListener('click', () => {
        const serviceId = (el as HTMLElement).dataset.serviceId;
        const service = this.state.services.find((s) => s.id === serviceId);
        if (service) {
          this.setState({ selectedService: service, step: 'slots' });
          this.loadSlots(service.id, this.getCurrentDate());
        }
      });
    });

    this.shadow.querySelectorAll('[data-action="select-slot"]').forEach((el) => {
      el.addEventListener('click', () => {
        const slotId = (el as HTMLElement).dataset.slotId;
        const slot = this.state.slots.find((s) => s.id === slotId);
        if (slot) {
          this.setState({ selectedSlot: slot, step: 'form' });
        }
      });
    });

    const dateInput = this.shadow.querySelector('[data-action="change-date"]');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        const date = (e.target as HTMLInputElement).value;
        if (this.state.selectedService && date) {
          this.loadSlots(this.state.selectedService.id, date);
        }
      });
    }

    this.shadow.querySelectorAll('[data-action="back-to-services"]').forEach((el) => {
      el.addEventListener('click', () => {
        this.setState({ step: 'services', selectedService: null, slots: [], error: '' });
      });
    });

    this.shadow.querySelectorAll('[data-action="back-to-slots"]').forEach((el) => {
      el.addEventListener('click', () => {
        this.setState({ step: 'slots', selectedSlot: null, error: '', emailError: '' });
      });
    });

    const form = this.shadow.querySelector('[data-action="submit-booking"]');
    if (form) {
      const nameInput = this.shadow.querySelector('#zc-name') as HTMLInputElement | null;
      const emailInput = this.shadow.querySelector('#zc-email') as HTMLInputElement | null;

      nameInput?.addEventListener('input', (e) => {
        this.state.customerName = (e.target as HTMLInputElement).value;
      });
      emailInput?.addEventListener('input', (e) => {
        this.state.customerEmail = (e.target as HTMLInputElement).value;
        this.state.emailError = '';
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.state.customerName = nameInput?.value ?? '';
        this.state.customerEmail = emailInput?.value ?? '';
        this.submitBooking();
      });
    }

    this.shadow.querySelectorAll('[data-action="retry-services"]').forEach((el) => {
      el.addEventListener('click', () => {
        this.loadServices();
      });
    });
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('zed-checkout')) {
    customElements.define('zed-checkout', ZedCheckoutElement);
  }
}
