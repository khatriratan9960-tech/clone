/**
 * SSR entry used only by verify-chart.mjs - renders ChartPage for an
 * arbitrary chart URL so the produced markup can be asserted on.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChartPage from './src/components/ChartPage.jsx';

export function renderChartPage(pathname) {
  globalThis.window = { location: { pathname }, scrollTo() {} };
  return renderToStaticMarkup(createElement(ChartPage));
}