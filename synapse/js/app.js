import { getDevice, hidDeviceFilters } from './devices/registry.js';
import { RazerSession, openControlInterface, exclusionFilters } from './hid.js';

const connectBtn = document.getElementById('connect-btn');
const hidBadge = document.getElementById('hid-badge');
const gate = document.getElementById('gate');
const workspace = document.getElementById('workspace');
const controls = document.getElementById('controls');
const toasts = document.getElementById('toasts');
const logoLed = document.querySelector('.logo-led');

const ui = {
  name: document.getElementById('device-name'),
  pid: document.getElementById('device-pid'),
  firmware: document.getElementById('device-fw'),
  serial: document.getElementById('device-serial'),
};

let session = null;
let state = {
  dpiX: 1600,
  dpiY: 1600,
  linkAxes: true,
  pollRate: 1000,
  lighting: {},
};

function lightingState(zone) {
  if (!state.lighting[zone.id]) {
    state.lighting[zone.id] = {
      brightness: 100,
      effect: zone.effects.includes('static') ? 'static' : zone.effects[0],
    };
  }
  return state.lighting[zone.id];
}

function toast(message, isError = false) {
  const node = document.createElement('div');
  node.className = `toast${isError ? ' is-error' : ''}`;
  node.textContent = message;
  toasts.append(node);
  setTimeout(() => node.remove(), 4200);
}

function debounce(fn, ms) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapDpi(value, spec) {
  const rounded = Math.round(Number(value) / spec.step) * spec.step;
  return clamp(rounded, spec.min, spec.max);
}

function percentToByte(percent) {
  return clamp(Math.round((Number(percent) / 100) * 255), 0, 255);
}

function byteToPercent(value) {
  return clamp(Math.round((Number(value) / 255) * 100), 0, 100);
}

function pidLabel(productId) {
  return `1532:${productId.toString(16).padStart(4, '0').toUpperCase()}`;
}

function setBadge(text, isError = false) {
  hidBadge.hidden = !text;
  hidBadge.textContent = text;
  hidBadge.classList.toggle('is-error', isError);
}

function updateLedPreview() {
  const logo = state.lighting.logo;
  logoLed.classList.remove('is-on', 'is-breath');
  logoLed.style.opacity = '';
  if (!logo || logo.effect === 'none' || logo.brightness === 0) return;
  logoLed.style.opacity = String(Math.max(0.25, logo.brightness / 100));
  if (logo.effect === 'breath') {
    logoLed.classList.add('is-breath');
    return;
  }
  logoLed.classList.add('is-on');
}

function renderControls(profile) {
  const blocks = [];
  if (profile.dpi) blocks.push(dpiCard(profile.dpi));
  if (profile.pollRate) blocks.push(pollCard(profile.pollRate));
  if (profile.lighting?.zones?.length) {
    for (const zone of profile.lighting.zones) blocks.push(lightingCard(zone));
  }
  controls.innerHTML = blocks.join('');
  bindControls(profile);
  updateLedPreview();
}

function dpiCard(spec) {
  const axes = spec.independentAxes
    ? `<label class="check"><input id="link-axes" type="checkbox" ${state.linkAxes ? 'checked' : ''}>Связать оси</label>`
    : '';
  return `
    <article class="card">
      <h3>Чувствительность</h3>
      <div class="dpi-readout"><strong id="dpi-value">${state.dpiX}</strong><span>DPI</span></div>
      <div class="field">
        <label for="dpi-x">X</label>
        <input id="dpi-x" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${state.dpiX}">
        <output id="dpi-x-out">${state.dpiX}</output>
      </div>
      <div class="field">
        <label for="dpi-y">Y</label>
        <input id="dpi-y" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${state.dpiY}" ${spec.independentAxes ? '' : 'disabled'}>
        <output id="dpi-y-out">${state.dpiY}</output>
      </div>
      ${axes}
    </article>
  `;
}

function pollCard(spec) {
  const buttons = spec.rates.map((hz) => (
    `<button type="button" data-poll="${hz}" class="${hz === state.pollRate ? 'is-active' : ''}">${hz} Гц</button>`
  )).join('');
  return `
    <article class="card">
      <h3>Частота опроса</h3>
      <div class="seg" id="poll-seg">${buttons}</div>
    </article>
  `;
}

function lightingCard(zone) {
  const current = lightingState(zone);
  const labels = { none: 'Выкл', static: 'Статичный', breath: 'Дыхание' };
  const buttons = zone.effects.map((effect) => (
    `<button type="button" data-effect="${effect}" class="${effect === current.effect ? 'is-active' : ''}">${labels[effect] ?? effect}</button>`
  )).join('');
  const brightness = zone.brightness
    ? `<div class="field">
        <label for="brightness-${zone.id}">%</label>
        <input id="brightness-${zone.id}" type="range" min="0" max="100" step="1" value="${current.brightness}">
        <output id="brightness-out-${zone.id}">${current.brightness}</output>
      </div>`
    : '';
  return `
    <article class="card">
      <h3>Подсветка · ${zone.name}</h3>
      ${brightness}
      <div class="seg" data-zone="${zone.id}">${buttons}</div>
    </article>
  `;
}

function bindControls(profile) {
  const dpiX = document.getElementById('dpi-x');
  const dpiY = document.getElementById('dpi-y');
  const dpiXOut = document.getElementById('dpi-x-out');
  const dpiYOut = document.getElementById('dpi-y-out');
  const dpiValue = document.getElementById('dpi-value');
  const linkAxes = document.getElementById('link-axes');
  const applyDpi = debounce(async () => {
    try {
      await session.setDpi(state.dpiX, state.dpiY);
    } catch (error) {
      toast(error.message, true);
    }
  }, 140);

  const syncDpiUi = () => {
    dpiX.value = String(state.dpiX);
    dpiY.value = String(state.dpiY);
    dpiXOut.textContent = String(state.dpiX);
    dpiYOut.textContent = String(state.dpiY);
    dpiValue.textContent = String(state.dpiX);
  };

  dpiX?.addEventListener('input', () => {
    state.dpiX = snapDpi(dpiX.value, profile.dpi);
    if (!profile.dpi.independentAxes || state.linkAxes) state.dpiY = state.dpiX;
    syncDpiUi();
    applyDpi();
  });

  dpiY?.addEventListener('input', () => {
    state.dpiY = snapDpi(dpiY.value, profile.dpi);
    if (state.linkAxes) state.dpiX = state.dpiY;
    syncDpiUi();
    applyDpi();
  });

  linkAxes?.addEventListener('change', () => {
    state.linkAxes = linkAxes.checked;
    if (state.linkAxes) {
      state.dpiY = state.dpiX;
      syncDpiUi();
      applyDpi();
    }
  });

  document.getElementById('poll-seg')?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-poll]');
    if (!button) return;
    const hz = Number(button.dataset.poll);
    try {
      await session.setPollRate(hz);
      state.pollRate = hz;
      for (const node of button.parentElement.querySelectorAll('button')) {
        node.classList.toggle('is-active', node === button);
      }
    } catch (error) {
      toast(error.message, true);
    }
  });

  for (const zone of profile.lighting?.zones ?? []) {
    const current = lightingState(zone);
    const applyLight = debounce(async () => {
      try {
        await session.setLighting(zone, current.effect, zone.defaultRgb ?? [0, 255, 0]);
        if (zone.brightness) await session.setBrightness(zone.ledId, percentToByte(current.brightness));
      } catch (error) {
        toast(error.message, true);
      }
    }, 120);

    const brightness = document.getElementById(`brightness-${zone.id}`);
    const brightnessOut = document.getElementById(`brightness-out-${zone.id}`);
    brightness?.addEventListener('input', () => {
      current.brightness = Number(brightness.value);
      brightnessOut.textContent = String(current.brightness);
      updateLedPreview();
      applyLight();
    });

    document.querySelector(`[data-zone="${zone.id}"]`)?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-effect]');
      if (!button) return;
      current.effect = button.dataset.effect;
      for (const node of button.parentElement.querySelectorAll('button')) {
        node.classList.toggle('is-active', node === button);
      }
      updateLedPreview();
      applyLight();
    });
  }
}

async function requestDevices() {
  try {
    const options = { filters: hidDeviceFilters(), exclusionFilters };
    try {
      return await navigator.hid.requestDevice(options);
    } catch (error) {
      if (String(error.name) === 'TypeError') {
        return navigator.hid.requestDevice({ filters: hidDeviceFilters() });
      }
      throw error;
    }
  } catch (error) {
    if (error.name === 'NotFoundError') return [];
    throw error;
  }
}

async function connect() {
  if (session) {
    await disconnect();
    return;
  }

  const picked = await requestDevices();
  if (!picked.length) return;

  const { hidDevice, firmware } = await openControlInterface(picked, getDevice);
  const profile = getDevice(hidDevice.productId);
  session = new RazerSession(hidDevice, profile);
  hidDevice.addEventListener('disconnect', () => {
    toast('Мышь отключена', true);
    disconnect(true);
  });

  ui.name.textContent = profile.name;
  ui.pid.textContent = pidLabel(profile.productId);
  ui.firmware.textContent = firmware;
  try {
    ui.serial.textContent = await session.getSerial();
  } catch {
    ui.serial.textContent = '—';
  }

  state.lighting = {};
  try {
    const dpi = await session.getDpi();
    state.dpiX = snapDpi(dpi.x, profile.dpi);
    state.dpiY = snapDpi(dpi.y, profile.dpi);
    state.linkAxes = state.dpiX === state.dpiY;
  } catch { /* keep defaults */ }
  try {
    const poll = await session.getPollRate();
    if (poll) state.pollRate = poll;
  } catch { /* keep defaults */ }
  for (const zone of profile.lighting?.zones ?? []) {
    const current = lightingState(zone);
    if (zone.brightness) {
      try {
        current.brightness = byteToPercent(await session.getBrightness(zone.ledId));
      } catch { /* keep defaults */ }
    }
  }

  renderControls(profile);
  gate.hidden = true;
  workspace.hidden = false;
  connectBtn.textContent = 'Отключить';
  connectBtn.classList.remove('btn-primary');
  connectBtn.classList.add('btn-ghost');
  setBadge(profile.name);
}

async function disconnect(fromEvent = false) {
  if (session && !fromEvent) {
    try { await session.close(); } catch { /* already gone */ }
  }
  session = null;
  state.lighting = {};
  controls.innerHTML = '';
  workspace.hidden = true;
  gate.hidden = false;
  connectBtn.textContent = 'Подключить мышь';
  connectBtn.classList.add('btn-primary');
  connectBtn.classList.remove('btn-ghost');
  setBadge('');
  updateLedPreview();
}

function boot() {
  if (!('hid' in navigator)) {
    connectBtn.disabled = true;
    setBadge('Нужен Chrome или Edge', true);
    toast('WebHID недоступен в этом браузере', true);
    return;
  }
  connectBtn.addEventListener('click', async () => {
    connectBtn.disabled = true;
    try {
      await connect();
    } catch (error) {
      toast(error.message, true);
    } finally {
      connectBtn.disabled = false;
    }
  });
}

boot();
