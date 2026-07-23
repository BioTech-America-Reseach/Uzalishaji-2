const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('../index.html', 'utf8');

// Stub a fake 2D context so drawing calls don't throw.
const fakeCtxMethods = ['save','restore','translate','rotate','scale','beginPath','moveTo','lineTo',
  'closePath','fill','stroke','arc','arcTo','rect','clip','drawImage','fillRect','strokeRect',
  'fillText','strokeText','measureText','setLineDash','createLinearGradient','clearRect','quadraticCurveTo','bezierCurveTo'];

function makeFakeCtx() {
  const ctx = {};
  fakeCtxMethods.forEach(m => {
    ctx[m] = () => {
      if (m === 'measureText') return { width: 10 };
      if (m === 'createLinearGradient') return { addColorStop: () => {} };
      return undefined;
    };
  });
  ctx.canvas = { width: 1200, height: 630 };
  Object.defineProperty(ctx, 'globalAlpha', { value: 1, writable: true });
  Object.defineProperty(ctx, 'fillStyle', { value: '#000', writable: true });
  Object.defineProperty(ctx, 'strokeStyle', { value: '#000', writable: true });
  Object.defineProperty(ctx, 'lineWidth', { value: 1, writable: true });
  Object.defineProperty(ctx, 'font', { value: '10px sans-serif', writable: true });
  Object.defineProperty(ctx, 'textAlign', { value: 'left', writable: true });
  Object.defineProperty(ctx, 'textBaseline', { value: 'alphabetic', writable: true });
  Object.defineProperty(ctx, 'filter', { value: 'none', writable: true });
  Object.defineProperty(ctx, 'shadowBlur', { value: 0, writable: true });
  Object.defineProperty(ctx, 'shadowColor', { value: 'transparent', writable: true });
  Object.defineProperty(ctx, 'lineCap', { value: 'butt', writable: true });
  Object.defineProperty(ctx, 'lineJoin', { value: 'miter', writable: true });
  return ctx;
}

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost/index.html',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = function () { return makeFakeCtx(); };
    window.HTMLCanvasElement.prototype.toDataURL = function () { return 'data:image/png;base64,AAAA'; };
    window.matchMedia = window.matchMedia || function () { return { matches: false, addListener(){}, removeListener(){} }; };
    let store = {};
    window.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
    window.fetch = () => Promise.reject(new Error('network disabled in test'));
  }
});

const win = dom.window;
let errorCount = 0;
win.addEventListener('error', (e) => {
  errorCount++;
  console.log('WINDOW ERROR:', e.error ? (e.error.stack || e.error.message) : e.message);
});

setTimeout(() => {
  console.log('Errors captured:', errorCount);
  console.log('typeof setFormat:', typeof win.setFormat);
  console.log('typeof drawShapeLayer:', typeof win.drawShapeLayer);
  console.log('typeof generateContentPlan:', typeof win.generateContentPlan);
  console.log('typeof loadComments:', typeof win.loadComments);
  console.log('typeof submitVideoJob:', typeof win.submitVideoJob);
  console.log('canvas width after init:', win.document.getElementById('mainCanvas').width);
  console.log('canvas height after init:', win.document.getElementById('mainCanvas').height);
  process.exit(errorCount > 0 ? 1 : 0);
}, 1500);
