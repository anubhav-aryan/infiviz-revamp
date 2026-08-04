// GENERATED FILE — do not edit by hand.
//
// Baked from the design project's `vietnam-coverage-map.js`, which drew Vietnam
// at runtime with d3 + topojson and fetched Natural Earth geometry from a CDN.
// The geometry and the seeded store dots are static, so the projection is run
// once at authoring time and committed here.
//
// Source geometry: world-atlas@2.0.2 countries-110m.json, country id 704.
// Projection: d3.geoMercator().fitExtent([[10,10],[326,430]], vn).
// Dots: the original's seeded LCG (seed 20260724) over its 6 store clusters.

export type CoverageStatus = 'covered' | 'overdue' | 'notyet';

export const COVERAGE_VIEWBOX = '0 0 336 440';
export const COVERAGE_HEIGHT = 440;

/** Vietnam outline, already projected into the viewBox above. */
export const COVERAGE_PATH =
  'M129.303,377.835L152.875,366.651L181.554,364.628L169.571,347.772L215.439,326.296L218.778,292.751L212.492,274.011L217.403,245.844L210.528,225.808L189.902,206.039L172.714,180.924L150.026,146.97L117.32,129.733L125.177,119.352L142.66,111.747L132.053,86.387L98.462,86.14L86.185,59.539L70.274,36.319L84.909,29.067L106.614,29.217L133.231,25.812L156.41,10L169.571,21.15L194.519,26.563L190.197,43.558L203.162,55.512L230.662,63.165L194.224,88.164L171.536,115.624L165.545,135.697L186.367,166.039L211.903,203.388L236.654,220.956L253.252,243.738L265.726,295.837L262.092,344.991L239.305,363.311L208.072,381.215L185.777,404.281L151.794,430L141.874,412.331L149.535,393.553Z';

/** 62 store dots, projected. */
export const COVERAGE_DOTS: { x: number; y: number; s: CoverageStatus }[] = [
  { x: 189.5, y: 362, s: 'covered' },
  { x: 202.3, y: 370.6, s: 'covered' },
  { x: 201.8, y: 365.1, s: 'overdue' },
  { x: 204.8, y: 371.1, s: 'covered' },
  { x: 193.2, y: 379.9, s: 'covered' },
  { x: 186.4, y: 361.9, s: 'covered' },
  { x: 199.6, y: 374.1, s: 'covered' },
  { x: 196.7, y: 371.4, s: 'notyet' },
  { x: 193.5, y: 360.9, s: 'covered' },
  { x: 189.7, y: 374.8, s: 'covered' },
  { x: 184.9, y: 365.5, s: 'covered' },
  { x: 189.3, y: 370.1, s: 'covered' },
  { x: 191.8, y: 380.8, s: 'covered' },
  { x: 205.6, y: 364.8, s: 'covered' },
  { x: 202.8, y: 370, s: 'covered' },
  { x: 183.4, y: 369.3, s: 'covered' },
  { x: 203.2, y: 380.3, s: 'covered' },
  { x: 202.1, y: 365.1, s: 'covered' },
  { x: 204.4, y: 361.6, s: 'covered' },
  { x: 185.6, y: 360, s: 'covered' },
  { x: 204.9, y: 358.2, s: 'covered' },
  { x: 198.1, y: 366, s: 'covered' },
  { x: 215.1, y: 371.8, s: 'covered' },
  { x: 208.8, y: 356.4, s: 'covered' },
  { x: 210, y: 353.4, s: 'covered' },
  { x: 196.1, y: 366, s: 'covered' },
  { x: 194.9, y: 375.7, s: 'covered' },
  { x: 204, y: 353.6, s: 'covered' },
  { x: 204.3, y: 348, s: 'covered' },
  { x: 207, y: 358.5, s: 'covered' },
  { x: 196.8, y: 360.7, s: 'notyet' },
  { x: 183.7, y: 407.3, s: 'notyet' },
  { x: 159.5, y: 396.3, s: 'notyet' },
  { x: 167.3, y: 390, s: 'notyet' },
  { x: 172.9, y: 398.5, s: 'covered' },
  { x: 155.4, y: 402.7, s: 'covered' },
  { x: 146.5, y: 398.3, s: 'covered' },
  { x: 153.4, y: 408, s: 'notyet' },
  { x: 159.4, y: 403.9, s: 'covered' },
  { x: 157.1, y: 374.7, s: 'overdue' },
  { x: 244, y: 243.9, s: 'covered' },
  { x: 258.4, y: 225.1, s: 'covered' },
  { x: 234.4, y: 243.8, s: 'overdue' },
  { x: 232.2, y: 226.2, s: 'overdue' },
  { x: 235.2, y: 246.1, s: 'covered' },
  { x: 219, y: 220.1, s: 'covered' },
  { x: 213.4, y: 213.6, s: 'covered' },
  { x: 185.3, y: 95.2, s: 'covered' },
  { x: 171.1, y: 67.7, s: 'covered' },
  { x: 164.5, y: 67.5, s: 'covered' },
  { x: 178.4, y: 79.3, s: 'overdue' },
  { x: 161.2, y: 70.9, s: 'covered' },
  { x: 151.9, y: 87.6, s: 'covered' },
  { x: 158.6, y: 95.5, s: 'covered' },
  { x: 164.7, y: 79.1, s: 'covered' },
  { x: 186.4, y: 96.6, s: 'covered' },
  { x: 156.5, y: 23.9, s: 'overdue' },
  { x: 130.3, y: 37.4, s: 'covered' },
  { x: 150, y: 35, s: 'notyet' },
  { x: 148.3, y: 56.7, s: 'overdue' },
  { x: 155.9, y: 49.8, s: 'covered' },
  { x: 138, y: 36, s: 'overdue' },
];
