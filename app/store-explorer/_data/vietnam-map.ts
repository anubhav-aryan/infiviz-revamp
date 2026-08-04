// GENERATED FILE — do not edit by hand.
//
// Baked from the design project's `store-explorer-map.js`, which drew Vietnam at
// runtime with d3 + topojson and fetched Natural Earth geometry from a CDN. The
// geometry and the seeded store pins are both static, so the projection is run
// once at build authoring time and committed here: no runtime dependency, no
// network call, no loading state.
//
// Source geometry: world-atlas@2.0.2 countries-110m.json, country id 704.
// Projection: d3.geoMercator().fitExtent([[16,16],[624,504]], vn).
// Pins: the original's seeded LCG (seed 20260804) over its 6 store clusters.

export type PinStatus = 'today' | 'range' | 'none';

export const VN_VIEWBOX = '0 0 640 520';
export const VN_HEIGHT = 520;

/** Vietnam outline, already projected into the viewBox above. */
export const VN_PATH =
  'M275.037,443.389L302.426,430.394L335.748,428.044L321.826,408.459L375.119,383.506L378.999,344.53L371.696,322.755L377.402,290.028L369.413,266.748L345.448,243.779L325.478,214.597L299.116,175.146L261.115,155.119L270.244,143.056L290.557,134.22L278.233,104.754L239.204,104.467L224.939,73.56L206.452,46.58L223.456,38.154L248.676,38.329L279.602,34.372L306.534,16L321.826,28.956L350.812,35.245L345.791,54.991L360.854,68.881L392.808,77.772L350.47,106.819L324.108,138.725L317.147,162.048L341.34,197.303L371.011,240.698L399.769,261.111L419.055,287.581L433.548,348.116L429.326,405.228L402.85,426.514L366.56,447.317L340.655,474.117L301.17,504L289.644,483.471L298.546,461.652Z';

/** 60 store pins, projected. Matches the design's legend colours. */
export const PINS: { x: number; y: number; s: PinStatus }[] = [
  { x: 348.9, y: 434.5, s: 'today' },
  { x: 355.5, y: 442.4, s: 'range' },
  { x: 349.6, y: 431.2, s: 'today' },
  { x: 344.5, y: 434.9, s: 'none' },
  { x: 355.6, y: 434.2, s: 'range' },
  { x: 353.6, y: 443.1, s: 'today' },
  { x: 363.4, y: 442.8, s: 'range' },
  { x: 356, y: 431.2, s: 'today' },
  { x: 357.3, y: 438.8, s: 'today' },
  { x: 356.5, y: 428, s: 'range' },
  { x: 357.9, y: 431.9, s: 'none' },
  { x: 340.6, y: 445.1, s: 'today' },
  { x: 358.6, y: 444.2, s: 'today' },
  { x: 351.6, y: 428.6, s: 'today' },
  { x: 335.6, y: 439.1, s: 'today' },
  { x: 340.4, y: 439.1, s: 'none' },
  { x: 358.9, y: 424.9, s: 'today' },
  { x: 353.6, y: 432.2, s: 'today' },
  { x: 363.7, y: 434.6, s: 'today' },
  { x: 364.6, y: 437.9, s: 'today' },
  { x: 355.1, y: 426.5, s: 'range' },
  { x: 359.5, y: 425.5, s: 'today' },
  { x: 353.8, y: 440.8, s: 'range' },
  { x: 347, y: 445.7, s: 'today' },
  { x: 362.6, y: 444.7, s: 'none' },
  { x: 347.7, y: 433.4, s: 'none' },
  { x: 337.2, y: 433, s: 'today' },
  { x: 335.1, y: 430.7, s: 'today' },
  { x: 353.2, y: 438.4, s: 'none' },
  { x: 348.8, y: 428.9, s: 'none' },
  { x: 356.8, y: 408.6, s: 'today' },
  { x: 372.8, y: 442.9, s: 'range' },
  { x: 360.8, y: 408.7, s: 'range' },
  { x: 350.1, y: 421.2, s: 'none' },
  { x: 377.6, y: 421.4, s: 'range' },
  { x: 342.3, y: 427.8, s: 'today' },
  { x: 316.7, y: 461.4, s: 'range' },
  { x: 331.5, y: 449.1, s: 'range' },
  { x: 297.9, y: 436.6, s: 'range' },
  { x: 322.7, y: 439.4, s: 'none' },
  { x: 331.8, y: 444.4, s: 'range' },
  { x: 313.7, y: 456.6, s: 'today' },
  { x: 337.9, y: 462.8, s: 'range' },
  { x: 334.3, y: 457.2, s: 'none' },
  { x: 400.6, y: 280, s: 'range' },
  { x: 422.5, y: 227.4, s: 'none' },
  { x: 409.6, y: 284.3, s: 'none' },
  { x: 395.2, y: 268.6, s: 'none' },
  { x: 390.4, y: 293.3, s: 'none' },
  { x: 308.4, y: 102.9, s: 'today' },
  { x: 322.6, y: 94.5, s: 'none' },
  { x: 323, y: 112.1, s: 'none' },
  { x: 306.4, y: 106, s: 'range' },
  { x: 308.9, y: 100.6, s: 'none' },
  { x: 311.7, y: 91, s: 'range' },
  { x: 338.5, y: 104.8, s: 'none' },
  { x: 296, y: 75, s: 'none' },
  { x: 283.7, y: 70.3, s: 'none' },
  { x: 257.2, y: 82.9, s: 'none' },
  { x: 264.2, y: 52.2, s: 'today' },
];
