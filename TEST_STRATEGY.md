# Estrategia de Pruebas E2E - Liverpool Automation Challenge

## 1. Arquitectura y Diseño del Framework
El framework está construido con **Playwright** y **TypeScript** aplicando el patrón **Page Object Model (POM)** para garantizar modularidad, mantenibilidad y reusabilidad.

- `pages/`: Contiene las clases POM (`SearchPage.ts`, `ResultsPage.ts`) encapsulando los locadores y acciones de la interfaz.
- `tests/`: Contiene los specs E2E con aserciones claras y descriptivas.
- `playwright.config.ts`: Configuración global que define timeouts, reintentos en CI, emulación de navegadores y políticas de captura de evidencias (screenshots, traces y reportes HTML).

## 2. Estrategia de Bypass de WAF y Akamai Bot Detection
Para superar la detección de automatización en entornos de Integración Continua sin comprometer la integridad del test:
- **Estrategia de Fingerprinting**: Se deshabilita la propiedad `navigator.webdriver` mediante opciones de inicio del navegador (`--disable-blink-features=AutomationControlled`).
- **Emulación de Navegador Real**: Se configuran encabezados HTTP auténticos (`Sec-Ch-Ua`, `Accept-Language`, `User-Agent`) simulando una sesión de navegación residencial en México (`es-MX`, `America/Mexico_City`).
- **Persistencia de Cookies y Sesión**: Permite la negociación natural de certificados y cookies con la red de entrega de contenido (CDN/WAF) de Akamai.

## 3. Intercepción de Servicios y Validación UI vs. API
La suite intercepta en tiempo real la respuesta HTTP del endpoint de búsqueda (`/api/plp/search`):
1. **Extracción UI**: Se leen los precios y nombres de los primeros 5 productos renderizados en el DOM tras aplicar filtros y ordenamiento.
2. **Validación Backend**: Se contrasta el payload JSON de la API contra la vista de usuario.
3. **Reporte de Discrepancias**: Se calculan las coincidencias exactas y se registran diferencias en consola sin ocultar fallos reales.
4. **Verificación de Negocio**: Se asegura con aserciones estrictas que los precios estén ordenados de manera ascendente.

## 4. Integración Continua (CI/CD)
El pipeline en GitHub Actions (`.github/workflows/test.yml`) ejecuta:
- Validación de tipos con TypeScript (`npm run typecheck`).
- Ejecución limpia de tests (`npm test`) en ambiente Ubuntu Headless.
- Generación y publicación de reportes HTML como artefactos sin ocultar resultados fallidos (`|| true` totalmente eliminado).