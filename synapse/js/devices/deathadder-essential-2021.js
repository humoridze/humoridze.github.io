export default {
  id: 'deathadder-essential-2021',
  name: 'DeathAdder Essential (2021)',
  vendorId: 0x1532,
  productId: 0x0098,
  transactionId: {
    default: 0xFF,
    info: 0xFF,
    dpi: 0xFF,
    pollRate: 0xFF,
    lighting: 0x3F,
  },
  dpi: {
    min: 100,
    max: 6400,
    step: 100,
    independentAxes: true,
  },
  pollRate: {
    protocol: 'v1',
    rates: [125, 500, 1000],
  },
  lighting: {
    protocol: 'extended-matrix',
    zones: [
      {
        id: 'logo',
        ledId: 0x04,
        name: 'Логотип',
        brightness: true,
        color: 'mono-green',
        defaultRgb: [0x00, 0xFF, 0x00],
        effects: ['none', 'static', 'breath'],
      },
    ],
  },
};
