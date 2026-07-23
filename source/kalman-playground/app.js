"use strict";

const FILTERS = {
  kf1d: {
    label: "1D KF",
    hint: "z = position，例如 4.2",
    defaultMeasurement: "4.2",
    state: [0, 0],
  },
  cv2d: {
    label: "2D CV-KF",
    hint: "z = x, y，例如 4.2, 1.1",
    defaultMeasurement: "4.2, 1.1",
    state: [0, 0, 0, 0],
  },
  ekf: {
    label: "EKF range/bearing",
    hint: "z = range, bearing(rad)，例如 4.4, 0.25",
    defaultMeasurement: "4.4, 0.25",
    state: [1, 0.4, 0, 0],
  },
  ukf: {
    label: "UKF range/bearing",
    hint: "z = range, bearing(rad)，例如 4.4, 0.25",
    defaultMeasurement: "4.4, 0.25",
    state: [1, 0.4, 0, 0],
  },
};

const STEP_ORDER = ["posterior", "predict", "gain", "update"];

const SLIDERS = [
  ["dt", "dt", 0.1, 2.0, 1.0, 0.1],
  ["qPos", "Q position", 0.001, 1.0, 0.08, 0.001],
  ["qVel", "Q velocity", 0.001, 1.8, 0.35, 0.001],
  ["r", "R measurement", 0.01, 4.0, 0.35, 0.01],
  ["p0", "P0 initial", 0.1, 8.0, 1.0, 0.1],
  ["gate", "Mahalanobis gate", 0.5, 8.0, 3.5, 0.1],
];

const formulas = {
  posterior: [
    ["上一后验状态", "已有 xₖ₋₁, Pₖ₋₁，等待新的测量 zₖ。"],
  ],
  predict: [
    ["状态预测", "x⁻ₖ = F xₖ₋₁"],
    ["协方差预测", "P⁻ₖ = F Pₖ₋₁ Fᵀ + Q"],
  ],
  gain: [
    ["创新", "yₖ = zₖ - h(x⁻ₖ)"],
    ["创新协方差", "Sₖ = H P⁻ₖ Hᵀ + R"],
    ["Kalman 增益", "Kₖ = P⁻ₖ Hᵀ Sₖ⁻¹"],
  ],
  update: [
    ["状态更新", "xₖ = x⁻ₖ + Kₖ yₖ"],
    ["Joseph 协方差更新", "Pₖ = (I-KH)P⁻ₖ(I-KH)ᵀ + K R Kᵀ"],
  ],
};

const app = {
  filter: "kf1d",
  phase: "posterior",
  params: Object.fromEntries(SLIDERS.map(([key, , , , value]) => [key, value])),
  x: [0, 0],
  P: identity(2, 1),
  z: [4.2],
  predicted: null,
  gain: null,
  updated: null,
  history: [],
  autoTimer: null,
  view: { scale: 48 },
};

const el = {
  filterButtons: document.getElementById("filterButtons"),
  measurementHint: document.getElementById("measurementHint"),
  measurementInput: document.getElementById("measurementInput"),
  addMeasurementButton: document.getElementById("addMeasurementButton"),
  sliders: document.getElementById("sliders"),
  predictButton: document.getElementById("predictButton"),
  gainButton: document.getElementById("gainButton"),
  updateButton: document.getElementById("updateButton"),
  nextButton: document.getElementById("nextButton"),
  autoButton: document.getElementById("autoButton"),
  resetButton: document.getElementById("resetButton"),
  activeFilterLabel: document.getElementById("activeFilterLabel"),
  phaseLabel: document.getElementById("phaseLabel"),
  gateLabel: document.getElementById("gateLabel"),
  stepExplanation: document.getElementById("stepExplanation"),
  formulaPanel: document.getElementById("formulaPanel"),
  numericPanel: document.getElementById("numericPanel"),
  historyList: document.getElementById("historyList"),
  processCanvas: document.getElementById("processCanvas"),
  stepRow: document.getElementById("stepRow"),
  drawerToggleButton: document.getElementById("drawerToggleButton"),
  inspectorDrawer: document.getElementById("inspectorDrawer"),
};

function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function identity(n, scale = 1) {
  const out = zeros(n, n);
  for (let i = 0; i < n; i += 1) out[i][i] = scale;
  return out;
}

function diag(values) {
  const out = zeros(values.length, values.length);
  values.forEach((v, i) => { out[i][i] = v; });
  return out;
}

function transpose(a) {
  return a[0].map((_, c) => a.map((row) => row[c]));
}

function add(a, b) {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

function subtract(a, b) {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}

function mul(a, b) {
  const out = zeros(a.length, b[0].length);
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      for (let j = 0; j < b[0].length; j += 1) {
        out[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return out;
}

function matVec(a, x) {
  return a.map((row) => row.reduce((sum, v, i) => sum + v * x[i], 0));
}

function vecAdd(a, b) {
  return a.map((v, i) => v + b[i]);
}

function vecSub(a, b) {
  return a.map((v, i) => v - b[i]);
}

function vecScale(a, s) {
  return a.map((v) => v * s);
}

function outer(a, b) {
  return a.map((av) => b.map((bv) => av * bv));
}

function inverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [...row, ...identity(n)[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const div = a[col][col];
    for (let j = 0; j < n * 2; j += 1) a[col][j] /= div;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = 0; j < n * 2; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

function rangeBearingFromState(x) {
  const px = x[0];
  const py = x[1];
  return [Math.hypot(px, py), Math.atan2(py, px)];
}

function normalizeAngle(a) {
  let out = a;
  while (out > Math.PI) out -= Math.PI * 2;
  while (out < -Math.PI) out += Math.PI * 2;
  return out;
}

function jacobianRangeBearing(x) {
  const px = x[0];
  const py = x[1];
  const r = Math.max(1e-6, Math.hypot(px, py));
  return [
    [px / r, py / r, 0, 0],
    [-py / (r * r), px / (r * r), 0, 0],
  ];
}

function linearModel(filter = app.filter) {
  const dt = app.params.dt;
  if (filter === "kf1d") {
    return {
      F: [[1, dt], [0, 1]],
      H: [[1, 0]],
      Q: diag([app.params.qPos * dt ** 3 / 3, app.params.qVel * dt]),
      R: [[app.params.r]],
    };
  }
  return {
    F: [
      [1, 0, dt, 0],
      [0, 1, 0, dt],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
    H: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
    ],
    Q: diag([
      app.params.qPos * dt ** 3 / 3,
      app.params.qPos * dt ** 3 / 3,
      app.params.qVel * dt,
      app.params.qVel * dt,
    ]),
    R: identity(2, app.params.r),
  };
}

function parseMeasurementInput(text, filter = app.filter) {
  const parts = text
    .split(/[,\s]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(Number);
  const expected = filter === "kf1d" ? 1 : 2;
  if (parts.length !== expected || parts.some((v) => !Number.isFinite(v))) {
    throw new Error(`测量值需要 ${expected} 个数字`);
  }
  return parts;
}

function measurementAsXY(z = app.z, filter = app.filter) {
  if (filter === "kf1d") return [z[0], 0];
  if (filter === "ekf" || filter === "ukf") {
    return [z[0] * Math.cos(z[1]), z[0] * Math.sin(z[1])];
  }
  return z;
}

function measurementFromXY([x, y], filter = app.filter) {
  if (filter === "kf1d") return [x];
  if (filter === "ekf" || filter === "ukf") return [Math.hypot(x, y), Math.atan2(y, x)];
  return [x, y];
}

function formatMeasurementInput(z, filter = app.filter) {
  const digits = filter === "ekf" || filter === "ukf" ? 4 : 3;
  return z.map((v) => Number(v).toFixed(digits)).join(", ");
}

function stateAsXY(x = app.x) {
  if (x.length === 2) return [x[0], 0];
  return [x[0], x[1]];
}

function runPredict() {
  const model = linearModel(app.filter);
  const xMinus = matVec(model.F, app.x);
  const pMinus = add(mul(mul(model.F, app.P), transpose(model.F)), model.Q);
  app.predicted = { x: xMinus, P: pMinus, model };
  app.gain = null;
  app.updated = null;
  app.phase = "predict";
  render();
}

function computeLinearGain() {
  const pred = app.predicted || (runPredict(), app.predicted);
  const { H, R } = pred.model;
  const hx = matVec(H, pred.x);
  const y = vecSub(app.z, hx);
  const S = add(mul(mul(H, pred.P), transpose(H)), R);
  const SInv = inverse(S);
  if (!SInv) throw new Error("S 不可逆");
  const K = mul(mul(pred.P, transpose(H)), SInv);
  return { H, R, hx, y, S, K, gateValue: mahalanobis(y, SInv) };
}

function computeEkfGain() {
  const pred = app.predicted || (runPredict(), app.predicted);
  const H = jacobianRangeBearing(pred.x);
  const hx = rangeBearingFromState(pred.x);
  const y = vecSub(app.z, hx);
  y[1] = normalizeAngle(y[1]);
  const R = diag([app.params.r, app.params.r * 0.08]);
  const S = add(mul(mul(H, pred.P), transpose(H)), R);
  const SInv = inverse(S);
  if (!SInv) throw new Error("S 不可逆");
  const K = mul(mul(pred.P, transpose(H)), SInv);
  return { H, R, hx, y, S, K, gateValue: mahalanobis(y, SInv) };
}

function computeUkfGain() {
  const pred = app.predicted || (runPredict(), app.predicted);
  const n = pred.x.length;
  const lambda = 1e-3;
  const spread = Math.sqrt(n + lambda);
  const sigma = [pred.x];
  for (let i = 0; i < n; i += 1) {
    const delta = Array(n).fill(0);
    delta[i] = Math.sqrt(Math.max(1e-9, pred.P[i][i])) * spread;
    sigma.push(vecAdd(pred.x, delta));
    sigma.push(vecSub(pred.x, delta));
  }
  const weights = [lambda / (n + lambda), ...Array(2 * n).fill(1 / (2 * (n + lambda)))];
  const zSigma = sigma.map(rangeBearingFromState);
  const hx = [0, 0];
  zSigma.forEach((z, i) => {
    hx[0] += weights[i] * z[0];
    hx[1] += weights[i] * z[1];
  });
  let S = diag([app.params.r, app.params.r * 0.08]);
  let cross = zeros(n, 2);
  zSigma.forEach((z, i) => {
    const dz = [z[0] - hx[0], normalizeAngle(z[1] - hx[1])];
    const dx = vecSub(sigma[i], pred.x);
    S = add(S, outer(vecScale(dz, Math.sqrt(Math.abs(weights[i]))), vecScale(dz, Math.sqrt(Math.abs(weights[i])))));
    cross = add(cross, outer(dx, vecScale(dz, weights[i])));
  });
  const SInv = inverse(S);
  if (!SInv) throw new Error("S 不可逆");
  const K = mul(cross, SInv);
  const y = vecSub(app.z, hx);
  y[1] = normalizeAngle(y[1]);
  return { H: null, R: diag([app.params.r, app.params.r * 0.08]), hx, y, S, K, gateValue: mahalanobis(y, SInv), ukf: true };
}

function mahalanobis(y, SInv) {
  return Math.sqrt(Math.max(0, matVec(mul([y], SInv), y)[0]));
}

function runGain() {
  if (!app.predicted) runPredict();
  if (app.filter === "ekf") app.gain = computeEkfGain();
  else if (app.filter === "ukf") app.gain = computeUkfGain();
  else app.gain = computeLinearGain();
  app.phase = "gain";
  render();
}

function runUpdate() {
  if (!app.gain) runGain();
  const pred = app.predicted;
  const { K, y } = app.gain;
  const xUpdated = vecAdd(pred.x, matVec(K, y));
  let pUpdated;
  if (app.gain.ukf) {
    pUpdated = subtract(pred.P, mul(mul(K, app.gain.S), transpose(K)));
  } else {
    const I = identity(pred.P.length);
    const KH = mul(K, app.gain.H);
    const projector = subtract(I, KH);
    pUpdated = add(mul(mul(projector, pred.P), transpose(projector)), mul(mul(K, app.gain.R), transpose(K)));
  }
  app.updated = { x: xUpdated, P: pUpdated };
  app.x = xUpdated;
  app.P = pUpdated;
  app.phase = "update";
  app.history.unshift({
    filter: FILTERS[app.filter].label,
    z: [...app.z],
    x: [...app.x],
    gate: app.gain.gateValue,
  });
  app.history = app.history.slice(0, 8);
  render();
}

function useMeasurement() {
  try {
    app.z = parseMeasurementInput(el.measurementInput.value, app.filter);
    el.measurementInput.value = formatMeasurementInput(app.z, app.filter);
    app.phase = "posterior";
    app.predicted = null;
    app.gain = null;
    app.updated = null;
    render();
  } catch (err) {
    el.stepExplanation.textContent = err.message;
  }
}

function nextStep() {
  if (app.phase === "posterior" || app.phase === "update") runPredict();
  else if (app.phase === "predict") runGain();
  else runUpdate();
}

function resetFilter(filter = app.filter) {
  app.filter = filter;
  app.phase = "posterior";
  app.x = [...FILTERS[filter].state];
  app.P = identity(app.x.length, app.params.p0);
  app.z = parseMeasurementInput(FILTERS[filter].defaultMeasurement, filter);
  app.predicted = null;
  app.gain = null;
  app.updated = null;
  app.history = [];
  el.measurementHint.textContent = FILTERS[filter].hint;
  el.measurementInput.value = FILTERS[filter].defaultMeasurement;
  render();
}

function handleCanvasClick(event) {
  const canvas = el.processCanvas;
  const rect = canvas.getBoundingClientRect();
  const screen = [
    (event.clientX - rect.left) * canvas.width / rect.width,
    (event.clientY - rect.top) * canvas.height / rect.height,
  ];
  const world = screenToWorld(screen, canvas);
  app.z = measurementFromXY(world, app.filter);
  el.measurementInput.value = formatMeasurementInput(app.z, app.filter);
  app.phase = "posterior";
  app.predicted = null;
  app.gain = null;
  app.updated = null;
  render();
}

function resizeCanvasToDisplaySize() {
  const canvas = el.processCanvas;
  const bounds = canvas.parentElement?.getBoundingClientRect?.() || canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(bounds.width || canvas.clientWidth || canvas.width || 980));
  const height = Math.max(280, Math.round(bounds.height || canvas.clientHeight || canvas.height || 560));
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  return true;
}

function scheduleRender() {
  const raf = typeof window.requestAnimationFrame === "function"
    ? window.requestAnimationFrame.bind(window)
    : (fn) => fn();
  raf(render);
}

function toggleInspectorDrawer() {
  document.body.classList.toggle("drawer-open");
}

function toggleAuto() {
  if (app.autoTimer) {
    clearInterval(app.autoTimer);
    app.autoTimer = null;
    el.autoButton.textContent = "Auto Play";
    return;
  }
  app.autoTimer = setInterval(nextStep, 900);
  el.autoButton.textContent = "Stop";
}

function fmt(v, digits = 3) {
  if (Array.isArray(v[0])) {
    return "[\n" + v.map((row) => "  [" + row.map((x) => Number(x).toFixed(digits)).join(", ") + "]").join(",\n") + "\n]";
  }
  return "[" + v.map((x) => Number(x).toFixed(digits)).join(", ") + "]";
}

function formulaHtml() {
  return Object.entries(formulas).map(([phase, items]) => (
    `<div class="formula ${phase === app.phase ? "active" : ""}">
      <strong>${phase}</strong>
      ${items.map(([name, body]) => `<div>${name}: <code>${body}</code></div>`).join("")}
    </div>`
  )).join("");
}

function numericText() {
  const lines = [
    `filter = ${FILTERS[app.filter].label}`,
    `phase = ${app.phase}`,
    `z_k = ${fmt(app.z)}`,
    `x posterior = ${fmt(app.x)}`,
    `P posterior = ${fmt(app.P)}`,
  ];
  if (app.predicted) {
    lines.push("", `x^- = ${fmt(app.predicted.x)}`, `P^- = ${fmt(app.predicted.P)}`);
  }
  if (app.gain) {
    lines.push("", `h(x^-) = ${fmt(app.gain.hx)}`, `y = ${fmt(app.gain.y)}`, `S = ${fmt(app.gain.S)}`, `K = ${fmt(app.gain.K)}`, `mahalanobis = ${app.gain.gateValue.toFixed(3)}`);
  }
  if (app.updated) {
    lines.push("", `x_k = ${fmt(app.updated.x)}`, `P_k = ${fmt(app.updated.P)}`);
  }
  return lines.join("\n");
}

function renderFormulaAndNumbers() {
  el.formulaPanel.innerHTML = formulaHtml();
  el.numericPanel.textContent = numericText();
  el.activeFilterLabel.textContent = FILTERS[app.filter].label;
  el.phaseLabel.textContent = app.phase;
  el.gateLabel.textContent = app.gain ? app.gain.gateValue.toFixed(2) : "-";
  const explanations = {
    posterior: "当前是上一时刻的后验状态。输入新的测量值后，先执行 Predict。",
    predict: "预测步骤只使用运动模型 F 和过程噪声 Q，不看测量值。",
    gain: "创新 y 表示测量和预测的差；K 决定这次更新更相信预测还是测量。",
    update: "更新后状态会从预测点被拉向测量点，协方差通常收缩。",
  };
  el.stepExplanation.textContent = explanations[app.phase];
  [...el.stepRow.querySelectorAll(".step-pill")].forEach((node) => {
    node.classList.toggle("active", node.dataset.step === app.phase);
  });
}

function renderHistory() {
  el.historyList.innerHTML = app.history.length
    ? app.history.map((h, i) => `<div class="history-item">#${app.history.length - i} ${h.filter}<br>z=${fmt(h.z)}<br>x=${fmt(h.x)}<br>gate=${h.gate.toFixed(2)}</div>`).join("")
    : `<div class="history-item">还没有完成 Update。输入测量值，然后按 Predict → Innovation/Gain → Update。</div>`;
}

function drawGrid(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07101e";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  const scale = app.view.scale;
  const worldStep = niceStep(70 / scale);
  const pixelStep = Math.max(34, worldStep * scale);
  const originX = w * 0.5;
  const originY = h * 0.5;
  for (let x = originX % pixelStep; x <= w; x += pixelStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = originY % pixelStep; y <= h; y += pixelStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(96,165,250,0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(w, originY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(originX, 0);
  ctx.lineTo(originX, h);
  ctx.stroke();
  ctx.fillStyle = "rgba(234,242,255,0.68)";
  ctx.font = "12px sans-serif";
  ctx.fillText(`1 grid ≈ ${worldStep}`, 14, 22);
}

function worldToScreen([x, y], canvas) {
  const scale = app.view.scale;
  return [canvas.width * 0.5 + x * scale, canvas.height * 0.5 - y * scale];
}

function screenToWorld([x, y], canvas) {
  const scale = app.view.scale || 48;
  return [(x - canvas.width * 0.5) / scale, (canvas.height * 0.5 - y) / scale];
}

function niceStep(raw) {
  const exponent = Math.floor(Math.log10(Math.max(raw, 1e-9)));
  const base = raw / 10 ** exponent;
  const niceBase = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return Number((niceBase * 10 ** exponent).toPrecision(4));
}

function computeAdaptiveView(canvas, points) {
  let maxAbsX = 1;
  let maxAbsY = 1;
  points.forEach(({ point, P }) => {
    if (!point) return;
    const uncertaintyX = P ? Math.sqrt(Math.max(1e-6, P[0][0])) * 2 : 0;
    const uncertaintyY = P && P.length > 2 ? Math.sqrt(Math.max(1e-6, P[1][1])) * 2 : 0;
    maxAbsX = Math.max(maxAbsX, Math.abs(point[0]) + uncertaintyX);
    maxAbsY = Math.max(maxAbsY, Math.abs(point[1]) + uncertaintyY);
  });
  const margin = 72;
  const usableW = Math.max(80, canvas.width - margin * 2);
  const usableH = Math.max(80, canvas.height - margin * 2);
  return {
    scale: Math.min(80, usableW / (maxAbsX * 2), usableH / (maxAbsY * 2)),
  };
}

function drawPoint(ctx, canvas, point, color, label, radius = 8) {
  const [x, y] = worldToScreen(point, canvas);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#eaf2ff";
  ctx.font = "13px sans-serif";
  ctx.fillText(label, x + 12, y - 12);
}

function drawArrow(ctx, canvas, from, to, color, label) {
  const [x1, y1] = worldToScreen(from, canvas);
  const [x2, y2] = worldToScreen(to, canvas);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12 * Math.cos(angle - 0.45), y2 - 12 * Math.sin(angle - 0.45));
  ctx.lineTo(x2 - 12 * Math.cos(angle + 0.45), y2 - 12 * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.fillStyle = color;
    ctx.font = "13px sans-serif";
    ctx.fillText(label, (x1 + x2) * 0.5 + 8, (y1 + y2) * 0.5 - 8);
  }
}

function drawCovariance(ctx, canvas, point, P, color) {
  const [x, y] = worldToScreen(point, canvas);
  const rx = Math.max(8, Math.min(120, Math.sqrt(Math.max(1e-6, P[0][0])) * app.view.scale));
  const ry = P.length > 2 ? Math.max(8, Math.min(120, Math.sqrt(Math.max(1e-6, P[1][1])) * app.view.scale)) : 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse ? ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2) : ctx.arc(x, y, rx, 0, Math.PI * 2);
  ctx.stroke();
}

function drawProcess() {
  const canvas = el.processCanvas;
  resizeCanvasToDisplaySize();
  const ctx = canvas.getContext("2d");
  const posterior = stateAsXY(app.phase === "update" && app.history[0] ? app.history[0].x : app.x);
  const predicted = app.predicted ? stateAsXY(app.predicted.x) : null;
  const measurement = measurementAsXY();
  const updated = app.updated ? stateAsXY(app.updated.x) : null;
  app.view = computeAdaptiveView(canvas, [
    { point: [0, 0] },
    { point: posterior, P: app.P },
    { point: predicted, P: app.predicted?.P },
    { point: measurement },
    { point: updated, P: app.updated?.P },
  ]);
  drawGrid(ctx, canvas.width, canvas.height);

  drawCovariance(ctx, canvas, posterior, app.P, "rgba(74,222,128,0.45)");
  drawPoint(ctx, canvas, posterior, "#4ade80", "xₖ₋₁ / xₖ");

  if (predicted) {
    drawCovariance(ctx, canvas, predicted, app.predicted.P, "rgba(250,204,21,0.45)");
    drawArrow(ctx, canvas, posterior, predicted, "#facc15", "F prediction");
    drawPoint(ctx, canvas, predicted, "#facc15", "x⁻ₖ");
  }

  if (app.phase === "gain" || app.phase === "update") {
    drawPoint(ctx, canvas, measurement, "#f8fafc", "zₖ", 6);
    if (predicted) drawArrow(ctx, canvas, predicted, measurement, "#fb7185", "innovation y");
  }

  if (updated) {
    drawArrow(ctx, canvas, predicted || posterior, updated, "#22d3ee", "K y");
    drawPoint(ctx, canvas, updated, "#22d3ee", "xₖ", 9);
  }
}

function render() {
  renderFormulaAndNumbers();
  renderHistory();
  drawProcess();
  updateButtons();
}

function updateButtons() {
  [...el.filterButtons.children].forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === app.filter);
  });
}

function createFilterButtons() {
  Object.entries(FILTERS).forEach(([key, filter]) => {
    const button = document.createElement("button");
    button.textContent = filter.label;
    button.dataset.filter = key;
    button.addEventListener("click", () => resetFilter(key));
    el.filterButtons.appendChild(button);
  });
}

function createSliders() {
  SLIDERS.forEach(([key, label, min, max, value, step]) => {
    const wrap = document.createElement("div");
    wrap.className = "slider";
    const labelNode = document.createElement("label");
    const name = document.createElement("span");
    const current = document.createElement("strong");
    name.textContent = label;
    current.textContent = String(value);
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.addEventListener("input", () => {
      app.params[key] = Number(input.value);
      current.textContent = Number(input.value).toFixed(step < 0.01 ? 3 : 2);
      app.P = identity(app.x.length, app.params.p0);
      app.phase = "posterior";
      app.predicted = null;
      app.gain = null;
      app.updated = null;
      render();
    });
    labelNode.append(name, current);
    wrap.append(labelNode, input);
    el.sliders.appendChild(wrap);
  });
}

function init() {
  createFilterButtons();
  createSliders();
  el.addMeasurementButton.addEventListener("click", useMeasurement);
  el.measurementInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") useMeasurement();
  });
  el.processCanvas.addEventListener("click", handleCanvasClick);
  el.drawerToggleButton.addEventListener("click", toggleInspectorDrawer);
  if (typeof window.addEventListener === "function") {
    window.addEventListener("resize", scheduleRender);
  }
  el.predictButton.addEventListener("click", runPredict);
  el.gainButton.addEventListener("click", runGain);
  el.updateButton.addEventListener("click", runUpdate);
  el.nextButton.addEventListener("click", nextStep);
  el.autoButton.addEventListener("click", toggleAuto);
  el.resetButton.addEventListener("click", () => resetFilter(app.filter));
  resetFilter("kf1d");
}

window.KalmanProcessVisualizer = {
  steps: STEP_ORDER,
  parseMeasurementInput,
  measurementFromXY,
  screenToWorld,
  resizeCanvasToDisplaySize,
  runPredict,
  runGain,
  runUpdate,
  resetFilter,
};

init();
