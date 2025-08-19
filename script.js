const pixelCanvas = document.getElementById("pixelCanvas");
const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const makeGridBtn = document.getElementById("makeGrid");
const clearGridBtn = document.getElementById("clearGrid");
const eraserBtn = document.getElementById("eraser");
const undoBtn = document.getElementById("undoBtn");

let eraseMode = false;
let isDrawing = false;
let history = [];
let currentStroke = [];
let lastTap = 0;

// Crear cuadrícula
function makeGrid(size) {
  if (size > 37) size = 37;
  if (size < 1) size = 1;
  if (window.innerWidth < 600 && size > 25) {
    size = 25;
    alert("En móviles el tamaño máximo es 25 😅");
  }

  pixelCanvas.innerHTML = "";
  pixelCanvas.style.display = "grid";
  pixelCanvas.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  pixelCanvas.style.gridTemplateRows = `repeat(${size}, 20px)`;

  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement("div");
    pixel.classList.add("pixel");
    pixel.style.width = "20px";
    pixel.style.height = "20px";
    pixel.style.border = "1px solid #ccc";
    pixel.style.backgroundColor = "white";
    pixelCanvas.appendChild(pixel);
  }
}

// Guardar un pixel dentro del trazo actual
function savePixel(pixel, oldColor, newColor) {
  currentStroke.push({ pixel, oldColor, newColor });
}

// Aplicar color a un pixel
function applyColor(pixel, color) {
  if (!pixel || !pixel.classList.contains("pixel")) return;
  const oldColor = pixel.style.backgroundColor;
  if (oldColor !== color) {
    savePixel(pixel, oldColor, color);
    pixel.style.backgroundColor = color;
  }
}

// Terminar trazo
function endStroke() {
  if (currentStroke.length > 0) {
    history.push(currentStroke);
    currentStroke = [];
  }
}

// --- MOUSE ---
pixelCanvas.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("pixel")) {
    isDrawing = true;
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(e.target, color);
  }
});

pixelCanvas.addEventListener("mousemove", (e) => {
  if (isDrawing && e.target.classList.contains("pixel")) {
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(e.target, color);
  }
});

document.addEventListener("mouseup", () => {
  isDrawing = false;
  endStroke();
});

// --- TOUCH ---
pixelCanvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains("pixel")) {
    isDrawing = true;
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(element, color);
  }
}, { passive: false });

pixelCanvas.addEventListener("touchmove", (e) => {
  if (!isDrawing) return;
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains("pixel")) {
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(element, color);
  }
  e.preventDefault(); // bloquea scroll y pull-to-refresh
}, { passive: false });

pixelCanvas.addEventListener("touchend", (e) => {
  isDrawing = false;
  endStroke();

  // Doble toque
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  lastTap = currentTime;

  if (tapLength < 300) {
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!eraseMode && element && element.classList.contains("pixel")) {
      const oldColor = element.style.backgroundColor;
      const newColor = "white";
      savePixel(element, oldColor, newColor);
      element.style.backgroundColor = newColor;
      endStroke();
    }
  }
}, { passive: false });

// Bloquear scroll general mientras dibujas
document.body.addEventListener("touchmove", (e) => {
  if (isDrawing) e.preventDefault();
}, { passive: false });

// --- CONTROLES ---
function clearGrid() {
  const pixels = pixelCanvas.querySelectorAll(".pixel");
  pixels.forEach(pixel => pixel.style.backgroundColor = "white");
  history = [];
}

eraserBtn.addEventListener("click", () => {
  eraseMode = !eraseMode;
  eraserBtn.textContent = eraseMode ? "Borrador ON" : "Borrador OFF";
});

undoBtn.addEventListener("click", () => {
  if (history.length === 0) return;
  const lastStroke = history.pop();
  lastStroke.forEach(item => item.pixel.style.backgroundColor = item.oldColor);
});

makeGridBtn.addEventListener("click", () => makeGrid(parseInt(sizePicker.value)));
clearGridBtn.addEventListener("click", clearGrid);

// --- INICIAL ---
makeGrid(parseInt(sizePicker.value));

// --- DOBLE CLIC (ratón) ---
pixelCanvas.addEventListener("dblclick", (e) => {
  if (!eraseMode && e.target.classList.contains("pixel")) {
    const pixel = e.target;
    const oldColor = pixel.style.backgroundColor;
    const newColor = "white";
    savePixel(pixel, oldColor, newColor);
    pixel.style.backgroundColor = newColor;
    endStroke();
  }
});
