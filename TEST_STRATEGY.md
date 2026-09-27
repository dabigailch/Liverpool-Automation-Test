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

## 5. ¿Qué no automatizarías en este flujo, y por qué?

- **Verificación visual/pixel-perfect del layout** (colores exactos, espaciados, tipografías): un assert de DOM no captura regresiones de diseño y es extremadamente frágil ante cambios de estilo no funcionales. Esto se cubre mejor con visual regression dedicado (ver Bonus) o revisión manual de diseño.
- **Banners promocionales/marketing** (ofertas de temporada, campañas): cambian con alta frecuencia y bajo valor de regresión; automatizarlos genera mantenimiento constante sin beneficio real.
- **Flujo de checkout/pago con datos reales**: automatizarlo contra producción implica riesgo financiero y legal (cargos reales, datos de tarjeta). Requiere un entorno sandbox dedicado, fuera del alcance de este challenge.
- **Todas las combinaciones de filtros** (marca × precio × rating × color, etc.): la cobertura combinatoria explota rápido. Se prioriza el camino crítico del usuario (búsqueda → color → orden) y se deja la variación de términos de búsqueda para pruebas data-driven paramétricas.

## 6. Si Liverpool agregara un CAPTCHA al flujo de búsqueda, ¿cómo lo manejarías?

Si se agregara un CAPTCHA, la automatización se manejaría según el entorno:
1. **Entornos de QA / Staging (Solución Principal):**
  -Bypass por Arquitectura: Solicitar a desarrollo deshabilitarlo en QA o permitir whitelisting de las IPs de CI/CD (GitHub Actions).
  -Autenticación por Tokens/Cookies: Inyectar cookies o tokens de prueba en la sesión de Playwright (browserContext.addCookies()) para omitir el desafío.
2. **Pruebas en Producción / E2E:**
  -Mocking de Red: Interceptar la llamada del CAPTCHA con page.route() para simular una respuesta exitosa.
  -Servicios de Resolución (APIs): Integrar proveedores como 2Captcha/Anti-Captcha solo si es estrictamente necesario validar el flujo en CI.

Nota: En la industria, la práctica estándar no es automatizar la resolución del CAPTCHA, sino evitar su activación en los entornos de prueba.

## 7. ¿Qué riesgos de flakiness existen y cómo se mitigaron?

| Riesgo | Mitigación aplicada |
|---|---|
| Condición de carrera al esperar la respuesta de red | `page.waitForResponse()` se registra **antes** de disparar filtro/orden, no después |
| Detección de automatización cambia el comportamiento de la página | Ver sección 2 (Fingerprinting y emulación de navegador real) |
| Re-render asíncrono de la SPA tras filtrar/ordenar | Se espera la respuesta real de la API en lugar de `waitForTimeout` fijo; el resto se apoya en el auto-waiting de Playwright |
| Inventario dinámico (puede no haber exactamente 5 PS5 blancos, o los precios cambian entre corridas) | La aserción exige **al menos 3 de 5** coincidencias en vez de 5/5 exactos |
| Fallos transitorios de red/CDN | Reintentos automáticos en CI, sin ocultar fallos reales |
| Banners de cookies u otros modales inesperados | `closeCookieBannerIfPresent()` cubre el caso conocido; un banner nuevo no contemplado seguiría siendo un punto de fallo pendiente |

## 8. Si tuvieras que integrar esto a un pipeline de equipo con 50+ suites, ¿qué cambiarías?

- **Sharding real**: usar `--shard=X/Y` distribuido en varios runners en vez de un solo job secuencial, para no ser el cuello de botella del pipeline.
- **Tagging selectivo**: etiquetar (`@smoke`, `@regression`) para que esta suite corra solo cuando corresponde, no en cada PR de módulos no relacionados.
- **Reporte centralizado**: consolidar en un dashboard cross-suite (Allure/ReportPortal) en vez de un artefacto HTML aislado, para ver tendencias de flakiness a través del tiempo y de todas las suites.
- **Cuarentena de tests inestables**: aislar automáticamente tests con historial de flakiness para que no bloqueen el pipeline completo mientras se investigan.
- **Config por ambiente vía secrets/env vars**: extender a credenciales y endpoints si el flujo lo requiriera.
- **SLA de tiempo por suite**: alertar si el runtime se degrada, señal temprana de regresión de performance del sitio o del test mismo.