const pixelCanvas = document.getElementById("pixelCanvas");
const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const makeGridBtn = document.getElementById("makeGrid");
const clearGridBtn = document.getElementById("clearGrid");
const eraserBtn = document.getElementById("eraser");
const undoBtn = document.getElementById("undoBtn");

let eraseMode = false; // modo borrador
let isDrawing = false; // está arrastrando
let history = [];      // pila de acciones
let currentStroke = []; // trazo actual

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
    pixel.classList.add("pixel"); // importante para los eventos
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

// Terminar un trazo y guardarlo en el historial
function endStroke() {
  if (currentStroke.length > 0) {
    history.push(currentStroke);
    currentStroke = [];
  }
}

// Eventos de mouse
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
  endStroke(); // guardar trazo completo
});

// Eventos táctiles
pixelCanvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains("pixel")) {
    isDrawing = true;
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(element, color);
  }
  e.preventDefault();
}, { passive: false });

pixelCanvas.addEventListener("touchmove", (e) => {
  if (!isDrawing) return;
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains("pixel")) {
    const color = eraseMode ? "white" : colorPicker.value;
    applyColor(element, color);
  }
  e.preventDefault();
}, { passive: false });

pixelCanvas.addEventListener("touchend", () => {
  isDrawing = false;
  endStroke(); // guardar trazo completo
});

// Evitar scroll/pull-to-refresh en todo el body mientras se dibuja
document.body.addEventListener("touchmove", (e) => {
  if (isDrawing) e.preventDefault();
}, { passive: false });

// Limpiar cuadrícula
function clearGrid() {
  const pixels = pixelCanvas.querySelectorAll(".pixel");
  pixels.forEach(pixel => pixel.style.backgroundColor = "white");
  history = [];
}

// Activar/desactivar borrador
eraserBtn.addEventListener("click", () => {
  eraseMode = !eraseMode;
  eraserBtn.textContent = eraseMode ? "Borrador ON" : "Borrador OFF";
});

// Deshacer
undoBtn.addEventListener("click", () => {
  if (history.length === 0) return;
  const lastStroke = history.pop();
  lastStroke.forEach(item => item.pixel.style.backgroundColor = item.oldColor);
});

// Botones de control
makeGridBtn.addEventListener("click", () => makeGrid(parseInt(sizePicker.value)));
clearGridBtn.addEventListener("click", clearGrid);

// Grid inicial
makeGrid(parseInt(sizePicker.value));

// Doble clic (ratón) para borrar cuando el borrador está OFF
pixelCanvas.addEventListener("dblclick", (e) => {
  if (!eraseMode && e.target.classList.contains("pixel")) {
    const pixel = e.target;
    const oldColor = pixel.style.backgroundColor;
    const newColor = "white";
    savePixel(pixel, oldColor, newColor); // guardamos en el trazo actual
    pixel.style.backgroundColor = newColor;
    endStroke(); // se guarda como un trazo completo para undo
  }
});

// Doble toque (pantalla táctil) para borrar cuando el borrador está OFF
let lastTap = 0;
pixelCanvas.addEventListener("touchend", (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  lastTap = currentTime;

  if (tapLength < 300) { // si el doble toque ocurre en <300ms
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
});
