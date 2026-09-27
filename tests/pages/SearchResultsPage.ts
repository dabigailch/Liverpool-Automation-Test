import { Page, Locator } from '@playwright/test';

export interface ProductInfo {
  name: string;
  price: string;
}

export class SearchResultsPage {
  readonly page: Page;
  readonly sortButton: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sortButton = page.getByTestId('dropdown-sorting-button');
    this.productCards = page.locator('[data-testid$="-card"]');
  }

  async filterByColor(colorLabelPattern: RegExp) {
    await this.page.getByRole('checkbox', { name: colorLabelPattern }).click();
    await this.page.waitForURL(/\/N-/);
  }

  async sortByPriceLowToHigh() {
    await this.sortButton.click();
    await this.page.getByRole('option', { name: 'Menor precio' }).click();
    await this.page.waitForURL(/sort=sortPrice/);
  }

  /**
   * Limpia el texto recuperado del DOM manteniendo números y el punto decimal.
   */
  private cleanPrice(rawPrice: string): string {
    if (!rawPrice) return '0.00';
    // Mantiene dígitos y el punto decimal
    return rawPrice.replace(/[^0-9.]/g, '');
  }

  async getFirstNProducts(n: number): Promise<ProductInfo[]> {
    const cards = this.productCards;
    const count = Math.min(await cards.count(), n);
    const results: ProductInfo[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      const cardTestId = await card.getAttribute('data-testid');
      const productId = cardTestId?.replace(/-card$/, '');

      const name = await card.locator('h3').first().innerText();

      // Usamos textContent() en lugar de innerText() para extraer también 
      // el texto de los elementos con CSS invisible (como el punto decimal).
      const priceElement = card.locator(`[data-testid="${productId}-price"] .text-price-primary`).first();
      const rawPrice = (await priceElement.textContent()) || '';

      results.push({
        name: name.trim(),
        price: this.cleanPrice(rawPrice),
      });
    }

    return results;
  }
}