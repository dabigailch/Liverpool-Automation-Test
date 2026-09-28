import { Page, Response } from '@playwright/test';

export interface ApiProduct {
  productId: string;
  name: string;
  price: number;
}

interface RawSearchRecord {
  productId: string;
  title: string;
  priceInfo?: {
    salePrice?: number;
  };
}

interface RawSearchResponse {
  data?: {
    records?: RawSearchRecord[];
  };
}

const SEARCH_API_PATTERN = '/api/plp/search';

/**
 * Registra un listener para la respuesta MÁS RECIENTE de /api/plp/search.
 * Debe llamarse ANTES de disparar la acción que provoca la petición
 * (filtrar o cambiar el orden), para no perder la respuesta por una
 * condición de carrera.
 */
export function watchForSearchApiResponse(page: Page): Promise<Response> {
  return page.waitForResponse(
    (response) =>
      response.url().includes(SEARCH_API_PATTERN) &&
      response.request().method() === 'POST' &&
      response.status() === 200
  );
}

/**
 * Parsea la respuesta JSON de /api/plp/search y devuelve una lista
 * simplificada de productos: id, nombre y precio vigente (salePrice).
 */
export async function extractApiProducts(response: Response): Promise<ApiProduct[]> {
  const json = (await response.json()) as RawSearchResponse;
  const records = json?.data?.records ?? [];

  return records.map((record) => ({
    productId: record.productId,
    name: record.title,
    price: record.priceInfo?.salePrice ?? NaN,
  }));
}
