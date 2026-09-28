# Estrategia de Pruebas E2E - Liverpool Automation Challenge

## 1. Arquitectura y Diseño
Framework en **Playwright + TypeScript** con **Page Object Model (POM)** para modularidad y reusabilidad.
- `pages/`: clases POM (`SearchPage.ts`, `ResultsPage.ts`) con locadores y acciones.
- `tests/`: specs E2E con aserciones descriptivas.
- `playwright.config.ts`: timeouts, reintentos en CI, emulación de navegadores y evidencias (screenshots, traces, reporte HTML).

## 2. Estrategia ante WAF y Akamai Bot Detection
Para superar la detección en CI sin comprometer la integridad del test:
- **Fingerprinting**: se deshabilita `navigator.webdriver` (`--disable-blink-features=AutomationControlled`).
- **Navegador real**: encabezados auténticos (`Sec-Ch-Ua`, `Accept-Language`, `User-Agent`) y contexto mexicano (`es-MX`, `America/Mexico_City`).
- **Cookies y sesión**: persistencia para negociar de forma natural con el CDN/WAF de Akamai.

## 3. Intercepción de Servicios: UI vs. API
Se intercepta la respuesta de `/api/plp/search`:
1. **UI**: precios y nombres de los primeros 5 productos tras filtrar y ordenar.
2. **Backend**: se contrasta el JSON de la API contra la UI.
3. **Discrepancias**: se calculan coincidencias y se registran diferencias sin ocultar fallos reales.
4. **Negocio**: aserción estricta de precios en orden ascendente.

## 4. Integración Continua (CI/CD)
Pipeline en GitHub Actions (`.github/workflows/test.yml`): validación de tipos (`npm run typecheck`), tests (`npm test`) en Ubuntu headless y reporte HTML como artefacto, sin ocultar fallos (`|| true` eliminado).

## 5. Qué no automatizaría
- **Layout pixel-perfect**: frágil ante cambios de estilo; mejor visual regression o revisión manual.
- **Banners promocionales**: cambian mucho y aportan poco valor de regresión.
- **Checkout/pago real**: riesgo financiero y legal; requiere un sandbox.
- **Todas las combinaciones de filtros**: explosión combinatoria; se prioriza el camino crítico (búsqueda → color → orden) y los términos de búsqueda se parametrizan.

## 6. Si aparece un CAPTCHA
1. **QA/Staging**: pedir a desarrollo deshabilitarlo o permitir las IPs de GitHub Actions; inyectar cookies/tokens de prueba (`browserContext.addCookies()`).
2. **Producción/E2E**: mocking con `page.route()`; servicios como 2Captcha/Anti-Captcha solo si es estrictamente necesario.

La práctica estándar es evitar su activación en pruebas, no automatizar su resolución.

## 7. Riesgos de flakiness y mitigaciones
- **Carrera de red**: `page.waitForResponse()` se registra antes de filtrar/ordenar.
- **Detección de automatización**: ver sección 2.
- **Re-render asíncrono de la SPA**: se espera la API real, no `waitForTimeout`; auto-waiting de Playwright.
- **Inventario dinámico**: se exigen al menos 3 de 5 coincidencias.
- **Fallos de red/CDN**: reintentos en CI sin ocultar fallos reales.
- **Banners de cookies**: `closeCookieBannerIfPresent()`; un banner nuevo seguiría siendo un punto de fallo.

## 8. Pipeline con 50+ suites
- **Sharding** (`--shard=X/Y`) en varios runners.
- **Tagging** (`@smoke`, `@regression`) para correr solo lo pertinente.
- **Reporte centralizado** (Allure/ReportPortal) para ver tendencias de flakiness.
- **Cuarentena** automática de tests inestables.
- **Config por ambiente** vía secrets/env vars.
- **SLA de tiempo** por suite con alertas ante degradación.