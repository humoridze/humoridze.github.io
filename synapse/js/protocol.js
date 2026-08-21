export const REPORT_LENGTH = 90;

export const STATUS = {
  NEW: 0x00,
  BUSY: 0x01,
  SUCCESS: 0x02,
  FAILURE: 0x03,
  TIMEOUT: 0x04,
  NOT_SUPPORTED: 0x05,
};

export const VARSTORE = 0x01;
export const NOSTORE = 0x00;

export const LED = {
  ZERO: 0x00,
  SCROLL: 0x01,
  LOGO: 0x04,
  BACKLIGHT: 0x05,
};

export const POLL_V1 = {
  1000: 0x01,
  500: 0x02,
  125: 0x08,
};

export const POLL_V1_HZ = {
  0x01: 1000,
  0x02: 500,
  0x08: 125,
};

export const POLL_V2 = {
  8000: 0x01,
  4000: 0x02,
  2000: 0x04,
  1000: 0x08,
  500: 0x10,
  250: 0x20,
  125: 0x40,
};

export const POLL_V2_HZ = {
  0x01: 8000,
  0x02: 4000,
  0x04: 2000,
  0x08: 1000,
  0x10: 500,
  0x20: 250,
  0x40: 125,
};

function xorCrc(bytes) {
  let checksum = 0;
  for (let index = 2; index < 88; index += 1) {
    checksum ^= bytes[index];
  }
  return checksum;
}

export function encodeReport({ transactionId, commandClass, commandId, dataSize, args = [] }) {
  const report = new Uint8Array(REPORT_LENGTH);
  report[1] = transactionId;
  report[5] = dataSize ?? args.length;
  report[6] = commandClass;
  report[7] = commandId;
  report.set(args, 8);
  report[88] = xorCrc(report);
  return report;
}

export function decodeReport(buffer) {
  let bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.byteLength === 91 && bytes[0] === 0x00) {
    bytes = bytes.subarray(1);
  }
  const dataSize = bytes[5] ?? 0;
  return {
    status: bytes[0],
    transactionId: bytes[1],
    dataSize,
    commandClass: bytes[6],
    commandId: bytes[7],
    args: Array.from(bytes.subarray(8, 8 + Math.min(dataSize, 80))),
  };
}

export function statusLabel(code) {
  switch (code) {
    case STATUS.BUSY:
      return 'BUSY';
    case STATUS.SUCCESS:
      return 'SUCCESS';
    case STATUS.FAILURE:
      return 'FAILURE';
    case STATUS.TIMEOUT:
      return 'TIMEOUT';
    case STATUS.NOT_SUPPORTED:
      return 'NOT_SUPPORTED';
    default:
      return `0x${code.toString(16).padStart(2, '0')}`;
  }
}

export function splitU16(value) {
  return [(value >> 8) & 0xff, value & 0xff];
}

export function joinU16(high, low) {
  return ((high << 8) | low) & 0xffff;
}

export function asciiFromBytes(bytes) {
  const chars = [];
  for (const code of bytes) {
    if (code === 0) break;
    if (code >= 32 && code < 127) chars.push(String.fromCharCode(code));
  }
  return chars.join('').trim();
}

export const commands = {
  getFirmware() {
    return { commandClass: 0x00, commandId: 0x81, dataSize: 0x02 };
  },
  getSerial() {
    return { commandClass: 0x00, commandId: 0x82, dataSize: 0x16 };
  },
  getPollRateV1() {
    return { commandClass: 0x00, commandId: 0x85, dataSize: 0x01 };
  },
  setPollRateV1(hz) {
    return {
      commandClass: 0x00,
      commandId: 0x05,
      dataSize: 0x01,
      args: [POLL_V1[hz] ?? 0x02],
    };
  },
  getPollRateV2() {
    return { commandClass: 0x00, commandId: 0xC0, dataSize: 0x01 };
  },
  setPollRateV2(hz) {
    return {
      commandClass: 0x00,
      commandId: 0x40,
      dataSize: 0x02,
      args: [0x00, POLL_V2[hz] ?? 0x08],
    };
  },
  getDpi() {
    return {
      commandClass: 0x04,
      commandId: 0x85,
      dataSize: 0x07,
      args: [NOSTORE],
    };
  },
  setDpi(dpiX, dpiY) {
    return {
      commandClass: 0x04,
      commandId: 0x05,
      dataSize: 0x07,
      args: [VARSTORE, ...splitU16(dpiX), ...splitU16(dpiY), 0x00, 0x00],
    };
  },
  getExtendedBrightness(ledId) {
    return {
      commandClass: 0x0F,
      commandId: 0x84,
      dataSize: 0x03,
      args: [VARSTORE, ledId],
    };
  },
  setExtendedBrightness(ledId, brightness) {
    return {
      commandClass: 0x0F,
      commandId: 0x04,
      dataSize: 0x03,
      args: [VARSTORE, ledId, brightness],
    };
  },
  setExtendedNone(ledId) {
    return {
      commandClass: 0x0F,
      commandId: 0x02,
      dataSize: 0x06,
      args: [VARSTORE, ledId, 0x00],
    };
  },
  setExtendedStatic(ledId, red, green, blue) {
    return {
      commandClass: 0x0F,
      commandId: 0x02,
      dataSize: 0x09,
      args: [VARSTORE, ledId, 0x01, 0x00, 0x00, 0x01, red, green, blue],
    };
  },
  setExtendedBreath(ledId, red, green, blue) {
    return {
      commandClass: 0x0F,
      commandId: 0x02,
      dataSize: 0x09,
      args: [VARSTORE, ledId, 0x02, 0x01, 0x00, 0x01, red, green, blue],
    };
  },
};
