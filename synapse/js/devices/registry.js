import deathadderEssential2021 from './deathadder-essential-2021.js';

const catalog = [
  deathadderEssential2021,
];

const byProductId = new Map(catalog.map((device) => [device.productId, device]));

export const RAZER_VENDOR_ID = 0x1532;

export function listDevices() {
  return catalog;
}

export function getDevice(productId) {
  return byProductId.get(productId) ?? null;
}

export function supportedProductIds() {
  return catalog.map((device) => device.productId);
}

export function hidDeviceFilters() {
  return catalog.flatMap((device) => {
    const base = {
      vendorId: device.vendorId ?? RAZER_VENDOR_ID,
      productId: device.productId,
    };
    return [
      { ...base, usagePage: 0xFF00 },
      base,
    ];
  });
}
