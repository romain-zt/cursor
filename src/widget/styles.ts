export const widgetStyles = `
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
    color: #1a1a1a;
    --zc-primary: #2563eb;
    --zc-primary-hover: #1d4ed8;
    --zc-error: #dc2626;
    --zc-border: #e5e7eb;
    --zc-bg: #ffffff;
    --zc-bg-hover: #f9fafb;
    --zc-radius: 8px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .zc-container {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
  }

  .zc-step-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .zc-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .zc-list-item {
    border: 1px solid var(--zc-border);
    border-radius: var(--zc-radius);
    padding: 0.875rem 1rem;
    cursor: pointer;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.15s;
  }

  .zc-list-item:hover {
    background: var(--zc-bg-hover);
  }

  .zc-list-item-name {
    font-weight: 500;
  }

  .zc-list-item-meta {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .zc-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .zc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .zc-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .zc-input {
    border: 1px solid var(--zc-border);
    border-radius: var(--zc-radius);
    padding: 0.625rem 0.75rem;
    font-size: 1rem;
    min-height: 44px;
    width: 100%;
    font-family: inherit;
  }

  .zc-input:focus {
    outline: 2px solid var(--zc-primary);
    outline-offset: -1px;
  }

  .zc-input-error {
    border-color: var(--zc-error);
  }

  .zc-error-text {
    color: var(--zc-error);
    font-size: 0.8125rem;
  }

  .zc-btn {
    background: var(--zc-primary);
    color: white;
    border: none;
    border-radius: var(--zc-radius);
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
    width: 100%;
    font-family: inherit;
    transition: background 0.15s;
  }

  .zc-btn:hover {
    background: var(--zc-primary-hover);
  }

  .zc-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .zc-btn-secondary {
    background: transparent;
    color: var(--zc-primary);
    border: 1px solid var(--zc-border);
  }

  .zc-btn-secondary:hover {
    background: var(--zc-bg-hover);
  }

  .zc-back {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    color: var(--zc-primary);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.5rem 0;
    min-height: 44px;
    font-family: inherit;
  }

  .zc-confirmation {
    text-align: center;
    padding: 2rem 1rem;
  }

  .zc-confirmation-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .zc-confirmation h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .zc-confirmation-details {
    margin-top: 1rem;
    text-align: left;
    border: 1px solid var(--zc-border);
    border-radius: var(--zc-radius);
    padding: 1rem;
  }

  .zc-confirmation-row {
    display: flex;
    justify-content: space-between;
    padding: 0.375rem 0;
    font-size: 0.875rem;
  }

  .zc-confirmation-label {
    color: #6b7280;
  }

  .zc-message {
    text-align: center;
    padding: 2rem 1rem;
    color: #6b7280;
  }

  .zc-error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--zc-radius);
    padding: 0.75rem 1rem;
    color: var(--zc-error);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .zc-loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }
`;
