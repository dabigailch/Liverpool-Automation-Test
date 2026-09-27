import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { watchForSearchApiResponse, extractApiProducts } from './api/SearchApiClient';

test('buscar PS5, filtrar por blanco, ordenar por precio, extraer top 5 y validar contra la API', async ({ page }) => {
  const homePage = new HomePage(page);
  const resultsPage = new SearchResultsPage(page);

  await homePage.goto();
  await homePage.closeCookieBannerIfPresent();
  await homePage.search('playstation 5');

  // 1. Aplicamos el filtro por color
  await resultsPage.filterByColor(/^Blanco \(\d+\)$/);

  // 2. Iniciamos la escucha de red JUSTO ANTES de ordenar por precio para capturar la respuesta final
  const apiResponsePromise = watchForSearchApiResponse(page);

  // 3. Aplicamos la ordenación
  await resultsPage.sortByPriceLowToHigh();

  const apiResponse = await apiResponsePromise;
  const apiProducts = await extractApiProducts(apiResponse);

  const uiProducts = await resultsPage.getFirstNProducts(5);

  console.log('TOP 5 UI:');
  console.table(uiProducts);
  console.log(`API devolvió ${apiProducts.length} productos en total.`);

  // --- Validación cruzada ---
  let matchCount = 0;
  const discrepancies: string[] = [];

  for (const uiProduct of uiProducts) {
    const apiMatch = apiProducts.find((p) => p.name === uiProduct.name);

    if (!apiMatch) {
      discrepancies.push(
        `"${uiProduct.name}": aparece en la UI pero NO se encontró en la respuesta de la API.`
      );
      continue;
    }

    matchCount++;

    const uiPriceNumber = parseFloat(uiProduct.price.replace(/[$,]/g, ''));
    if (uiPriceNumber !== apiMatch.price) {
      discrepancies.push(
        `"${uiProduct.name}": precio UI ($${uiPriceNumber}) distinto al precio de la API ($${apiMatch.price}).`
      );
    }
  }

  console.log(`Coincidencias por nombre: ${matchCount} de ${uiProducts.length}`);
  if (discrepancies.length > 0) {
    console.log('--- DISCREPANCIAS ENCONTRADAS ---');
    discrepancies.forEach((d) => console.log(d));
  } else {
    console.log('Sin discrepancias: UI y API coinciden completamente.');
  }

  // Requisito del reto: al menos 3 de los 5 resultados UI deben aparecer en la API.
  expect(matchCount).toBeGreaterThanOrEqual(3);

  // Bonus de robustez: afirmamos que los precios de la UI están en orden ascendente.
  const uiPrices = uiProducts.map((p) => parseFloat(p.price.replace(/[$,]/g, '')));
  const isAscending = uiPrices.every((price, i) => i === 0 || uiPrices[i - 1] <= price);
  expect(isAscending).toBe(true);
});