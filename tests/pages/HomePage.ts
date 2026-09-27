import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly cookieCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('textbox', {
      name: 'Buscar por producto, categoría y más...',
      exact: true,
    });
    this.cookieCloseButton = page.getByTestId(
      'ml-cookie-consent-ml-cookie-consent-close-button'
    );
  }

  async goto() {
    await this.page.goto('https://www.liverpool.com.mx/');
  }

  async closeCookieBannerIfPresent() {
    try {
      await this.cookieCloseButton.click({ timeout: 5000 });
    } catch {
      // Si no aparece el banner (por ejemplo, en corridas repetidas), continuamos sin fallar.
    }
  }

  async search(term: string) {
    await this.searchInput.click();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }
}
