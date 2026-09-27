# Liverpool.com.mx — PS5 Search Flow Automation

[![E2E Tests](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/playwright.yml/badge.svg)](https://github.com/dabigailch/correccion-liverpool-automation-test/actions/workflows/playwright.yml)

Playwright Test (JavaScript) suite: search → filter by color → sort by
price → extract top 5 results → cross-validate against the intercepted
network response, plus reporting, CI, and optional bonus checks.

## Requisitos

- Node.js ≥ 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm` si no lo tienes instalado)

## Instalación

```bash
pnpm install
pnpm exec playwright install --with-deps chromium firefox webkit