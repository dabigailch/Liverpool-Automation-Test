# Liverpool.com.mx — QA Automation Challenge (E2E Playwright Framework)

[![E2E Tests](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/test.yml/badge.svg)](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/test.yml)

Suite de pruebas automatizadas E2E para la plataforma de **Liverpool.com.mx** desarrollada con **Playwright** y **TypeScript**.

El proyecto automatiza el flujo completo de búsqueda de productos (*PlayStation 5*), filtrado por color (*Blanco*), ordenamiento por precio (*Mayor a menor*), extracción de los primeros 5 resultados y validación cruzada de datos contra la respuesta interceptada de la red (API).

---

## Requisitos

- Node.js ≥ 18
- npm (incluido con Node.js)

---

## Instalación

```
npm ci
npx playwright install --with-deps chromium firefox webkit
```

---

## Cómo correr los tests

**Modo headless (por defecto):**
```bash
npm test
```

**Modo headed** (con navegador visible, útil para debugging):
```bash
npm run test:headed
```

**Ver el último reporte HTML generado:**
```bash
npm run test:report
```

**Validar tipos de TypeScript** (mismo chequeo que corre en CI):
```bash
npm run typecheck
```

---

## Estructura del proyecto

```
tests/
  liverpool-search.spec.ts   # Spec E2E principal
  pages/                     # Page Objects (HomePage, SearchResultsPage)
  api/                       # Cliente de intercepción de red (SearchApiClient)
playwright.config.ts         # Config global: timeouts, reintentos, reportes, navegadores
.github/workflows/           # Pipeline de CI
TEST_STRATEGY.md             # Documento de estrategia y decisiones de diseño
```

---

## CI/CD

Cada push/PR a `main` dispara el workflow de GitHub Actions, que instala dependencias, valida tipos, instala navegadores, corre la suite en modo headless y sube el reporte HTML como artefacto descargable.

Ver el historial de corridas: [Actions → Playwright Tests](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/test.yml)
