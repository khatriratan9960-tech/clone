/**
 * Entry used only by verify-chart.mjs - renders ChartPage for an arbitrary
 * chart URL. Client-side (hydrateRoot) so useApi's async effect runs and
 * pulls REAL history from the API. The pathname is read from window.location,
 * so set globalThis.window before importing.
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ChartPage from './src/components/ChartPage.jsx';

export function renderChartPage(pathname, rootEl) {
  // Always mount a real client root so ChartPage's useApi effect runs and
  // fetches genuine history from the live API (no SSR, no fabricated data).
  const root = createRoot(rootEl);
  root.render(createElement(ChartPage));
  return null;
}