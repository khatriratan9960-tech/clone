/**
 * Bottom "chart link zone" of the jodi / panel chart pages, copied from the
 * original dpboss markup so the same market list is reachable from every
 * chart page.
 */
export const JODI_CHART_LINKS = [
  { label: 'Time Chart', slug: 'time-bazar' },
  { label: 'Sridevi Chart', slug: 'sridevi' },
  { label: 'Kalyan Morning Chart', slug: 'kalyan-morning' },
  { label: 'Madhuri Chart', slug: 'madhuri' },
  { label: 'Kalyan Chart', slug: 'kalyan' },
  { label: 'Sridevi Night Chart', slug: 'sridevi-night' },
  { label: 'Kalyan Night Chart', slug: 'kalyan-night' },
  { label: 'Old Main Mumbai Chart', slug: 'old-main-mumbai' },
  { label: 'Main Bazar Chart', slug: 'main-bazar' },
  { label: 'Milan Morning Chart', slug: 'milan-morning' },
  { label: 'Milan Day Chart', slug: 'milan-day' },
  { label: 'Milan Night Chart', slug: 'milan-night' },
  { label: 'Madhuri Night Chart', slug: 'madhuri-night' },
  { label: 'Madhur Morning Chart', slug: 'madhur-morning' },
  { label: 'Madhur Day Chart', slug: 'madhur-day' },
  { label: 'Madhur Night Chart', slug: 'madhur-night' },
  { label: 'Rajdhani Night Chart', slug: 'rajdhani-night' },
];

export const PANEL_CHART_LINKS = [
  { label: 'Time Panel Chart', slug: 'time-bazar' },
  { label: 'Sridevi Panel Chart', slug: 'sridevi' },
  { label: 'Kalyan Morning Panel Chart', slug: 'kalyan-morning' },
  { label: 'Madhuri Panel Chart', slug: 'madhuri' },
  { label: 'Padmavathi Panel Chart', slug: 'padmavathi' },
  { label: 'Kalyan Panel Chart', slug: 'kalyan' },
  { label: 'Sridevi Night Panel Chart', slug: 'sridevi-night' },
  { label: 'Kalyan Night Panel Chart', slug: 'kalyan-night' },
  { label: 'Old Main Mumbai Panel Chart', slug: 'old-main-mumbai' },
  { label: 'Main Bazar Panel Chart', slug: 'main-bazar' },
  { label: 'Milan Morning Panel Chart', slug: 'milan-morning' },
  { label: 'Milan Day Panel Chart', slug: 'milan-day' },
  { label: 'Milan Night Panel Chart', slug: 'milan-night' },
  { label: 'Madhuri Night Panel Chart', slug: 'madhuri-night' },
  { label: 'Rajdhani Night Panel Chart', slug: 'rajdhani-night' },
  { label: 'Madhur Morning Panel Chart', slug: 'madhur-morning' },
  { label: 'Madhur Day Panel Chart', slug: 'madhur-day' },
];

/** Build the chart-page URL for a market slug. */
export function chartUrl(type, slug) {
  return `/${type}-chart-record/${slug}.php`;
}