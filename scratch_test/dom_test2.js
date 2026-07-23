const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('../index.html', 'utf8');

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
  ['globalAlpha','fillStyle','strokeStyle','lineWidth','font','textAlign','textBaseline','filter','shadowBlur','shadowColor','lineCap','lineJoin']
    .forEach(p => Object.defineProperty(ctx, p, { value: 0, writable: true }));
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
  try {
    console.log('--- Testing setFormat variants ---');
    ['ig-square','ig-portrait','tiktok','fb-feed'].forEach(k => {
      win.setFormat(k);
      console.log(k, '->', win.document.getElementById('mainCanvas').width, win.document.getElementById('mainCanvas').height);
    });

    console.log('--- Testing addShapeLayer ---');
    win.setShapeType('rounded-rect');
    win.addShapeLayer();
    win.setShapeType('arrow');
    win.addShapeLayer();
    console.log('layers count:', win.state.layers.length);

    console.log('--- Testing addOrUpdateTextOverlay ---');
    win.document.getElementById('overlayText').value = 'Habari Test';
    win.addOrUpdateTextOverlay();
    console.log('layers count after text:', win.state.layers.length);

    console.log('--- Testing selection + liveUpdateSelectedText ---');
    const textLayer = win.state.layers.find(l => l.type === 'text');
    win.state.selectedLayerId = textLayer.id;
    win.document.getElementById('textSize').value = '80';
    win.liveUpdateSelectedText();
    console.log('text size updated:', textLayer.size);

    console.log('--- Testing undo/redo ---');
    win.undoAction();
    win.redoAction();

    console.log('--- Testing renderLayersList / updateSelectedLayerInfo ---');
    win.renderLayersList();
    win.updateSelectedLayerInfo();

    console.log('--- Testing togglePlanMode ---');
    win.togglePlanMode();
    win.togglePlanMode();

    console.log('--- Testing timeline ---');
    win.addTimelineStep('Test step', 'active');
    win.updateTimelineStep('Test step', 'done');

    console.log('--- Testing AI memory save/clear ---');
    win.document.getElementById('memTone').value = 'Rasmi';
    win.saveAIMemory();
    win.clearAIMemory();

    console.log('--- Testing scaleCanvasToFit ---');
    win.scaleCanvasToFit();

    console.log('ALL MANUAL TESTS COMPLETED, errors so far:', errorCount);
  } catch (e) {
    console.log('CAUGHT EXCEPTION IN TEST:', e.stack);
    errorCount++;
  }
  setTimeout(() => process.exit(errorCount > 0 ? 1 : 0), 200);
}, 1500);
