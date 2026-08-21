import {
  STATUS,
  commands,
  decodeReport,
  encodeReport,
  joinU16,
  asciiFromBytes,
  POLL_V1_HZ,
  POLL_V2_HZ,
  statusLabel,
} from './protocol.js';

const WAIT_MS = 90;
const RETRIES = 5;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unwrapReport(dataView) {
  return new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
}

function isProtectedCollection(hidDevice) {
  return hidDevice.collections.some((collection) => {
    const page = collection.usagePage;
    const usage = collection.usage;
    return page === 0x01 && (usage === 0x02 || usage === 0x06);
  }) && hidDevice.collections.every((collection) => {
    const page = collection.usagePage;
    const usage = collection.usage;
    return page === 0x01 && (usage === 0x02 || usage === 0x06 || usage === 0x01);
  });
}

export const exclusionFilters = [
  { usagePage: 0x01, usage: 0x02 },
  { usagePage: 0x01, usage: 0x06 },
];

export class RazerSession {
  constructor(hidDevice, profile) {
    this.hidDevice = hidDevice;
    this.profile = profile;
    this.chain = Promise.resolve();
  }

  transactionId(kind) {
    const ids = this.profile.transactionId;
    if (typeof ids === 'number') return ids;
    return ids[kind] ?? ids.default ?? 0xFF;
  }

  enqueue(task) {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => {});
    return run;
  }

  async request(kind, packet) {
    return this.enqueue(() => this.sendWithRetry(kind, packet));
  }

  async sendWithRetry(kind, packet) {
    let lastError = null;
    for (let attempt = 0; attempt < RETRIES; attempt += 1) {
      try {
        const response = await this.sendOnce(kind, packet);
        if (response.status === STATUS.SUCCESS || response.status === STATUS.BUSY) {
          return response;
        }
        lastError = new Error(`Команда отклонена: ${statusLabel(response.status)}`);
      } catch (error) {
        lastError = error;
      }
      await sleep(WAIT_MS);
    }
    throw lastError ?? new Error('Нет ответа от устройства');
  }

  async sendOnce(kind, packet) {
    const report = encodeReport({
      transactionId: this.transactionId(kind),
      ...packet,
    });
    await this.hidDevice.sendFeatureReport(0x00, report);
    await sleep(WAIT_MS);
    const raw = unwrapReport(await this.hidDevice.receiveFeatureReport(0x00));
    return decodeReport(raw);
  }

  async getFirmware() {
    const response = await this.request('info', commands.getFirmware());
    return `v${response.args[0] ?? 0}.${response.args[1] ?? 0}`;
  }

  async getSerial() {
    const response = await this.request('info', commands.getSerial());
    return asciiFromBytes(response.args) || '—';
  }

  async getDpi() {
    const response = await this.request('dpi', commands.getDpi());
    return {
      x: joinU16(response.args[1] ?? 0, response.args[2] ?? 0),
      y: joinU16(response.args[3] ?? 0, response.args[4] ?? 0),
    };
  }

  async setDpi(dpiX, dpiY) {
    await this.request('dpi', commands.setDpi(dpiX, dpiY));
  }

  async getPollRate() {
    if (!this.profile.pollRate) return null;
    if (this.profile.pollRate.protocol === 'v2') {
      const response = await this.request('pollRate', commands.getPollRateV2());
      return POLL_V2_HZ[response.args[0]] ?? POLL_V2_HZ[response.args[1]] ?? null;
    }
    const response = await this.request('pollRate', commands.getPollRateV1());
    return POLL_V1_HZ[response.args[0]] ?? null;
  }

  async setPollRate(hz) {
    if (!this.profile.pollRate) return;
    if (this.profile.pollRate.protocol === 'v2') {
      await this.request('pollRate', commands.setPollRateV2(hz));
      return;
    }
    await this.request('pollRate', commands.setPollRateV1(hz));
  }

  async getBrightness(ledId) {
    const response = await this.request('lighting', commands.getExtendedBrightness(ledId));
    return response.args[2] ?? 0;
  }

  async setBrightness(ledId, brightness) {
    await this.request('lighting', commands.setExtendedBrightness(ledId, brightness));
  }

  async setLighting(zone, effect, rgb) {
    const ledId = zone.ledId;
    if (effect === 'none') {
      await this.request('lighting', commands.setExtendedNone(ledId));
      return;
    }
    if (effect === 'breath') {
      await this.request('lighting', commands.setExtendedBreath(ledId, rgb[0], rgb[1], rgb[2]));
      return;
    }
    await this.request('lighting', commands.setExtendedStatic(ledId, rgb[0], rgb[1], rgb[2]));
  }

  async close() {
    if (this.hidDevice.opened) {
      await this.hidDevice.close();
    }
  }
}

export async function openControlInterface(hidDevices, resolveProfile) {
  const candidates = hidDevices.filter((device) => !isProtectedCollection(device));
  const queue = candidates.length > 0 ? candidates : hidDevices;
  const errors = [];

  for (const hidDevice of queue) {
    const profile = resolveProfile(hidDevice.productId);
    if (!profile) continue;
    try {
      if (!hidDevice.opened) await hidDevice.open();
      const probe = new RazerSession(hidDevice, profile);
      const firmware = await probe.getFirmware();
      if (firmware && firmware !== 'v0.0') {
        return { hidDevice, firmware };
      }
      await hidDevice.close();
    } catch (error) {
      errors.push(error);
      if (hidDevice.opened) {
        try { await hidDevice.close(); } catch { /* ignore */ }
      }
    }
  }

  const unknown = hidDevices.find((device) => !resolveProfile(device.productId));
  if (unknown && queue.every((device) => !resolveProfile(device.productId))) {
    const pid = unknown.productId.toString(16).padStart(4, '0');
    throw new Error(`Мышь 1532:${pid} пока не поддерживается`);
  }

  const detail = errors[0]?.message ? `: ${errors[0].message}` : '';
  throw new Error(`Не найден управляющий HID-интерфейс${detail}`);
}
