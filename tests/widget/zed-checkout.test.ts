import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';

/**
 * Widget tests run with jsdom environment to access DOM APIs.
 * @vitest-environment jsdom
 */

let ZedCheckoutElement: typeof import('../../src/widget/zed-checkout.js').ZedCheckoutElement;

beforeAll(async () => {
  const mod = await import('../../src/widget/zed-checkout.js');
  ZedCheckoutElement = mod.ZedCheckoutElement;
});

function createWidget(merchantId = 'test-merchant', apiBase = 'http://localhost:3000'): HTMLElement {
  const el = document.createElement('zed-checkout');
  el.setAttribute('merchant-id', merchantId);
  el.setAttribute('api-base', apiBase);
  return el;
}

function mockFetch(responses: Record<string, { status: number; body: object }>) {
  return vi.fn(async (url: string, _opts?: RequestInit) => {
    const path = new URL(url).pathname + new URL(url).search;
    for (const [pattern, response] of Object.entries(responses)) {
      if (path.includes(pattern)) {
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          json: async () => response.body,
        } as Response;
      }
    }
    return { ok: false, status: 404, json: async () => ({ error: 'not_found' }) } as Response;
  });
}

describe('ZedCheckout Widget', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('uses shadow DOM to isolate styles', async () => {
    globalThis.fetch = mockFetch({
      '/api/v1/merchants/test-merchant/services': {
        status: 200,
        body: { services: [] },
      },
    });

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    expect(widget.shadowRoot).not.toBeNull();
    const style = widget.shadowRoot!.querySelector('style');
    expect(style).not.toBeNull();
  });

  it('shows "No services available" when merchant has no services', async () => {
    globalThis.fetch = mockFetch({
      '/api/v1/merchants/test-merchant/services': {
        status: 200,
        body: { services: [] },
      },
    });

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    const text = widget.shadowRoot!.textContent;
    expect(text).toContain('No services available');
  });

  it('renders service list when merchant has services', async () => {
    globalThis.fetch = mockFetch({
      '/api/v1/merchants/test-merchant/services': {
        status: 200,
        body: {
          services: [
            { id: 's1', name: 'Yoga Class', duration_minutes: 60, price_cents: 2500, active: true },
            { id: 's2', name: 'Pilates', duration_minutes: 45, price_cents: null, active: true },
          ],
        },
      },
    });

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    const text = widget.shadowRoot!.textContent;
    expect(text).toContain('Yoga Class');
    expect(text).toContain('Pilates');
    expect(text).toContain('$25.00');
  });

  it('shows error message with retry when API is unreachable', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Network error');
    });

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    const text = widget.shadowRoot!.textContent;
    expect(text).toContain('Unable to load booking');
    expect(text).toContain('Try again');
  });

  it('renders multi-step flow: services → slots → form → confirmation', async () => {
    const fetchMock = vi.fn(async (url: string, opts?: RequestInit) => {
      const path = new URL(url).pathname;

      if (path.includes('/services') && !path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            services: [{ id: 's1', name: 'Training', duration_minutes: 60, price_cents: null, active: true }],
          }),
        } as Response;
      }
      if (path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            slots: [{ id: 'sl1', starts_at: '2026-06-01T10:00:00Z', ends_at: '2026-06-01T11:00:00Z', status: 'available' }],
            timezone: 'America/New_York',
          }),
        } as Response;
      }
      if (path.includes('/bookings') && opts?.method === 'POST') {
        return {
          ok: true, status: 201,
          json: async () => ({
            booking: {
              id: 'b1', reference_code: 'ZC-TEST', slot_id: 'sl1',
              customer_name: 'Test User', customer_email: 'test@example.com',
              status: 'confirmed', created_at: '2026-06-01T10:00:00Z',
            },
          }),
        } as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as Response;
    });
    globalThis.fetch = fetchMock;

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    // Step 1: Services
    expect(widget.shadowRoot!.textContent).toContain('Select a service');
    expect(widget.shadowRoot!.textContent).toContain('Training');

    // Click service
    const serviceItem = widget.shadowRoot!.querySelector('[data-action="select-service"]') as HTMLElement;
    serviceItem.click();
    await new Promise((r) => setTimeout(r, 20));

    // Step 2: Slots
    expect(widget.shadowRoot!.textContent).toContain('Training');

    // Click slot
    const slotItem = widget.shadowRoot!.querySelector('[data-action="select-slot"]') as HTMLElement;
    slotItem.click();
    await new Promise((r) => setTimeout(r, 10));

    // Step 3: Form
    expect(widget.shadowRoot!.textContent).toContain('Your details');

    // Fill form and submit
    const nameInput = widget.shadowRoot!.querySelector('#zc-name') as HTMLInputElement;
    const emailInput = widget.shadowRoot!.querySelector('#zc-email') as HTMLInputElement;
    nameInput.value = 'Test User';
    emailInput.value = 'test@example.com';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('input'));

    const form = widget.shadowRoot!.querySelector('[data-action="submit-booking"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 20));

    // Step 4: Confirmation
    expect(widget.shadowRoot!.textContent).toContain('Booking Confirmed');
    expect(widget.shadowRoot!.textContent).toContain('ZC-TEST');
  });

  it('shows inline error for invalid email', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      if (path.includes('/services') && !path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            services: [{ id: 's1', name: 'Yoga', duration_minutes: 60, price_cents: null, active: true }],
          }),
        } as Response;
      }
      if (path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            slots: [{ id: 'sl1', starts_at: '2026-06-01T10:00:00Z', ends_at: '2026-06-01T11:00:00Z', status: 'available' }],
            timezone: 'UTC',
          }),
        } as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as Response;
    });
    globalThis.fetch = fetchMock;

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    // Navigate to form
    const serviceItem = widget.shadowRoot!.querySelector('[data-action="select-service"]') as HTMLElement;
    serviceItem.click();
    await new Promise((r) => setTimeout(r, 20));

    const slotItem = widget.shadowRoot!.querySelector('[data-action="select-slot"]') as HTMLElement;
    slotItem.click();
    await new Promise((r) => setTimeout(r, 10));

    // Submit with invalid email
    const nameInput = widget.shadowRoot!.querySelector('#zc-name') as HTMLInputElement;
    const emailInput = widget.shadowRoot!.querySelector('#zc-email') as HTMLInputElement;
    nameInput.value = 'Test';
    emailInput.value = 'not-an-email';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('input'));

    const form = widget.shadowRoot!.querySelector('[data-action="submit-booking"]') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 10));

    expect(widget.shadowRoot!.textContent).toContain('valid email');
  });

  it('shows slot unavailable error and refreshes when 409 returned', async () => {
    let bookingCallCount = 0;
    const fetchMock = vi.fn(async (url: string, opts?: RequestInit) => {
      const path = new URL(url).pathname;
      if (path.includes('/services') && !path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            services: [{ id: 's1', name: 'Boxing', duration_minutes: 60, price_cents: null, active: true }],
          }),
        } as Response;
      }
      if (path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            slots: [{ id: 'sl1', starts_at: '2026-06-01T10:00:00Z', ends_at: '2026-06-01T11:00:00Z', status: 'available' }],
            timezone: 'UTC',
          }),
        } as Response;
      }
      if (path.includes('/bookings') && opts?.method === 'POST') {
        bookingCallCount++;
        return {
          ok: false, status: 409,
          json: async () => ({ error: 'slot_unavailable' }),
        } as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as Response;
    });
    globalThis.fetch = fetchMock;

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    // Navigate through to form
    (widget.shadowRoot!.querySelector('[data-action="select-service"]') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 20));
    (widget.shadowRoot!.querySelector('[data-action="select-slot"]') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 10));

    // Submit
    const nameInput = widget.shadowRoot!.querySelector('#zc-name') as HTMLInputElement;
    const emailInput = widget.shadowRoot!.querySelector('#zc-email') as HTMLInputElement;
    nameInput.value = 'Test';
    emailInput.value = 'test@example.com';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('input'));

    (widget.shadowRoot!.querySelector('[data-action="submit-booking"]') as HTMLFormElement)
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise((r) => setTimeout(r, 20));

    expect(widget.shadowRoot!.textContent).toContain('just taken');
    expect(bookingCallCount).toBe(1);
  });

  it('shows UTC note when timezone is UTC', async () => {
    globalThis.fetch = vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      if (path.includes('/services') && !path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            services: [{ id: 's1', name: 'Yoga', duration_minutes: 60, price_cents: null, active: true }],
          }),
        } as Response;
      }
      if (path.includes('/slots')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            slots: [{ id: 'sl1', starts_at: '2026-06-01T10:00:00Z', ends_at: '2026-06-01T11:00:00Z', status: 'available' }],
            timezone: 'UTC',
          }),
        } as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as Response;
    });

    const widget = createWidget();
    document.body.appendChild(widget);
    await new Promise((r) => setTimeout(r, 10));

    (widget.shadowRoot!.querySelector('[data-action="select-service"]') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 20));

    expect(widget.shadowRoot!.textContent).toContain('Times shown in UTC');
  });
});
