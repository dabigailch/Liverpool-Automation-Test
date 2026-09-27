# Liverpool.com.mx — QA Automation Challenge (E2E Playwright Framework)

[![E2E Tests](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/playwright.yml/badge.svg)](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/playwright.yml)

Suite de pruebas automatizadas E2E para la plataforma de **Liverpool.com.mx** desarrollada con **Playwright** y **TypeScript**.

El proyecto automatiza el flujo completo de búsqueda de productos (*PlayStation 5*), filtrado por color (*Blanco*), ordenamiento por precio (*Mayor a menor*), extracción de los primeros 5 resultados y validación cruzada de datos contra la respuesta interceptada de la red (API).

---

## 🛠️ Requisitos

- Node.js ≥ 18
- npm (incluido con Node.js)

---

## 🚀 Instalación

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit