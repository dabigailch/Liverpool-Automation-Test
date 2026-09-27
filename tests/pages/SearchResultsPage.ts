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

  // El punto decimal vive en un <span class="invisible">, así que innerText
  // nunca lo incluye (respeta la visibilidad CSS). El precio llega como
  // "$39900" en vez de "$399.00"; insertamos el punto antes de los últimos
  // 2 dígitos, que siempre son los centavos.
  private formatPrice(rawPrice: string): string {
    return rawPrice.replace(/(\d{2})$/, '.$1');
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

      const rawPrice = await card
        .locator(`[data-testid="${productId}-price"] .text-price-primary`)
        .first()
        .innerText();

      results.push({
        name: name.trim(),
        price: this.formatPrice(rawPrice.replace(/\s+/g, '')),
      });
    }

    return results;
  }
}
