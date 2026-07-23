"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..", "source", "kalman-playground");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const generatedPath = path.join(__dirname, "..", "public", "kalman-playground", "index.html");

for (const required of [
  "app-shell",
  "workbench",
  "canvas-panel",
  "drawerToggleButton",
  "processCanvas",
]) {
  if (!html.includes(required)) {
    throw new Error(`index.html missing full-screen lab marker: ${required}`);
  }
}

for (const required of [
  ".app-shell",
  ".workbench",
  ".canvas-panel",
  "height: 100vh",
  "grid-template-columns: minmax(260px, 320px) minmax(0, 1fr)",
]) {
  if (!css.includes(required)) {
    throw new Error(`styles.css missing full-screen lab marker: ${required}`);
  }
}

if (fs.existsSync(generatedPath)) {
  const generated = fs.readFileSync(generatedPath, "utf8");
  const normalized = generated.trimStart().toLowerCase();
  if (!normalized.startsWith("<!doctype html>")) {
    throw new Error("generated playground page must start with the standalone <!doctype html>");
  }
  for (const forbidden of ["<strong>Fluid</strong>", "id=\"navbar\"", "hexo-theme-fluid"]) {
    if (generated.includes(forbidden)) {
      throw new Error(`generated playground page must not be wrapped by Fluid theme: ${forbidden}`);
    }
  }
}

function element(id = "") {
  const listeners = {};
  const node = {
    id,
    textContent: "",
    innerHTML: "",
    value: "",
    dataset: {},
    children: [],
    style: {},
    className: "",
    listeners,
    parentElement: null,
    classList: { toggle() {}, add() {}, remove() {} },
    append(...items) {
      items.forEach((item) => { item.parentElement = this; });
      this.children.push(...items);
    },
    appendChild(item) {
      item.parentElement = this;
      this.children.push(item);
    },
    addEventListener(type, handler) { listeners[type] = handler; },
    dispatchEvent(event) {
      if (!listeners[event.type]) return false;
      listeners[event.type](event);
      return true;
    },
    querySelectorAll() { return []; },
    getContext() {
      return {
        calls: node.contextCalls,
        clearRect(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){},
        stroke(){},
        arc(x, y, radius){ this.calls.push(["arc", x, y, radius]); },
        ellipse(x, y, rx, ry){ this.calls.push(["ellipse", x, y, rx, ry]); },
        fill(){}, closePath(){},
        setLineDash(){}, fillText(){},
        save(){}, restore(){}, translate(){}, rotate(){},
        set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {},
        set font(v) {}, set textAlign(v) {},
      };
    },
  };
  node.contextCalls = [];
  node.clientWidth = 1180;
  node.clientHeight = 720;
  node.width = 900;
  node.height = 520;
  node.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: node.clientWidth,
    height: node.clientHeight,
  });
  return node;
}

const ids = new Map();
const document = {
  body: element("body"),
  getElementById(id) {
    if (!ids.has(id)) ids.set(id, element(id));
    return ids.get(id);
  },
  createElement() { return element(); },
};

const canvasWrap = element("canvasWrap");
canvasWrap.clientWidth = 1180;
canvasWrap.clientHeight = 720;
const canvas = Object.assign(element("processCanvas"), {
  parentElement: canvasWrap,
  clientWidth: 1180,
  clientHeight: 720,
});
ids.set("processCanvas", canvas);

const sandbox = {
  window: {},
  document,
  Event: function Event(){},
  setInterval() { return 1; },
  clearInterval() {},
  requestAnimationFrame(fn) { fn(); },
  Math,
  Number,
  Array,
  Object,
  String,
  Boolean,
  console,
  devicePixelRatio: 1,
};
sandbox.window = sandbox;

vm.runInNewContext(js, sandbox);

const api = sandbox.KalmanProcessVisualizer;
if (!api) throw new Error("app.js must expose KalmanProcessVisualizer");
if (typeof api.resizeCanvasToDisplaySize !== "function") {
  throw new Error("KalmanProcessVisualizer must expose resizeCanvasToDisplaySize");
}

api.resizeCanvasToDisplaySize();
if (canvas.width < 1100 || canvas.height < 680) {
  throw new Error(`canvas internal size must follow display size, got ${canvas.width}x${canvas.height}`);
}

console.log("kalman full-screen playground smoke ok");
