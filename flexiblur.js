// global
const onscreenCanvas = document.getElementById("canvas");
const onscreenCtx = onscreenCanvas.getContext("2d");

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

let imageData;
let offscreenOffsetY = 0;

function switchControllerVisibility() {
  const controller = document.getElementById("controller");
  if (controller.classList.contains("controller--hidden")) {
    controller.classList.remove("controller--hidden");
  } else {
    controller.classList.add("controller--hidden");
  }
}

function welcome() {
  const titleFontSize = onscreenCanvas.width / 12;
  onscreenCtx.lineWidth = 2;
  onscreenCtx.fillStyle = "#000";
  onscreenCtx.font = `${titleFontSize}px 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif`;
  onscreenCtx.textAlign = "center";
  onscreenCtx.fillText("FlexiBlur", onscreenCanvas.width / 2, onscreenCanvas.height / 4);
  onscreenCtx.font = `${titleFontSize / 1.5}px 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif`;
  onscreenCtx.fillText("Let's start editing!", onscreenCanvas.width / 2, onscreenCanvas.height / 4 + titleFontSize * 1.5);
}

function loadImage() {
  const render = new FileReader();
  render.readAsDataURL(document.getElementById("source").files[0]);
  render.onload = () => {
    imageData = render.result;
    const imageElem = new Image();
    imageElem.src = imageData;
    imageElem.onload = () => {
      fitImage(imageElem);
      putMask(imageElem);
      putImage();
      setRatioInputsAvailability(false);
      showFileName();
    }
  }
}

function unloadImage() {
  document.getElementsByClassName("controller__filename")[0].classList.remove("controller__filename--visible");
  document.getElementById("source").value = null;
  setBackground();
  welcome();
  setRatioInputsAvailability(true);
}

function showFileName() {
  const filename = document.getElementById("source").files[0].name;
  document.getElementById("filename").innerText = filename;
  document.getElementsByClassName("controller__filename")[0].classList.add("controller__filename--visible");
}

function setRatioInputsAvailability(enabled) {
  document.getElementById("ratioX").disabled = !enabled;
  document.getElementById("ratioY").disabled = !enabled;
}

function fitImage(imageElem) {
  const ratioX = Number(document.getElementById("ratioX").value);
  const ratioY = Number(document.getElementById("ratioY").value);
  changeCanvasSize(imageElem.width, imageElem.width / ratioX * ratioY);
  const ratio = onscreenCanvas.width / imageElem.width;
  const sizeY = imageElem.height * ratio;
  const offsetY = onscreenCanvas.height - sizeY;
  // draw in offscreen
  offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  offscreenCtx.globalCompositeOperation = "source-over";
  offscreenCtx.drawImage(imageElem, 0, 0, imageElem.width, imageElem.height, 0, offsetY, onscreenCanvas.width, sizeY);
  offscreenOffsetY = offsetY;
  const displayFitRatio = window.screen.width / onscreenCanvas.width * 0.95;
  const displayOffsetY = offsetY * displayFitRatio;
  const displaySizeY = sizeY * displayFitRatio;
  onscreenCanvas.style.height = `${displayOffsetY + displaySizeY}px`;
  const gradientBottomInput = document.getElementById("gradientBottom");
  gradientBottomInput.style.top = `${displayOffsetY}px`;
  gradientBottomInput.style.height = `${displaySizeY}px`;
}

function putMask() {
  const gradientTop = offscreenOffsetY / offscreenCanvas.height;
  const gradientBottom = gradientTop + (1 - Number(document.getElementById("gradientBottom").value));
  // draw in offscreen
  offscreenCtx.globalCompositeOperation = "destination-in";
  const gradient = onscreenCtx.createLinearGradient(0, 0, 0, offscreenCanvas.height);
  gradient.addColorStop(gradientTop, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(gradientBottom, "rgba(255, 255, 255, 1)");
  offscreenCtx.fillStyle = gradient;
  offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
}

function putImage() {
  onscreenCtx.globalCompositeOperation = "source-over";
  onscreenCtx.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height, 0, 0, onscreenCanvas.width, onscreenCanvas.height);
}

function changeCanvasSize(x, y) {
  x = Math.round(x);
  y = Math.round(y);
  onscreenCanvas.width = x;
  onscreenCanvas.height = y;
  offscreenCanvas.width = x;
  offscreenCanvas.height = y;
  document.getElementById("currentSize").innerText = `${x}px x ${y}px`;
  setBackground();
}

function setBackground() {
  const color = document.getElementById("bgColor").value;
  onscreenCtx.globalCompositeOperation = "source-over";
  onscreenCtx.fillStyle = color;
  onscreenCtx.fillRect(0, 0, onscreenCanvas.width, onscreenCanvas.height);
}

function changeRatioX() {
  const ratioX = Number(document.getElementById("ratioX").value);
  const ratioY = Number(document.getElementById("ratioY").value);
  const base = onscreenCanvas.height / ratioY;
  changeCanvasSize(base * ratioX, onscreenCanvas.height);
  if (document.getElementById("source").value != "") {
    loadImage();
  }
}

function changeRatioY() {
  const ratioX = Number(document.getElementById("ratioX").value);
  const ratioY = Number(document.getElementById("ratioY").value);
  const base = onscreenCanvas.width / ratioX;
  changeCanvasSize(onscreenCanvas.width, base * ratioY);
  if (document.getElementById("source").value != "") {
    loadImage();
  }
}

function changeBgColor() {
  setBackground();
  putImage();
}

function changeGradientRange() {
  setBackground();
  loadImage();
}

function saveImage() {
  onscreenCanvas.toBlob((blob) =>{
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

(() => {
  const controllerVisibilityButton = document.getElementById("controllerVisibility");
  controllerVisibilityButton.addEventListener("click", switchControllerVisibility);

  const sourceInput = document.getElementById("source");
  sourceInput.addEventListener("change", loadImage);

  const ratioXInput = document.getElementById("ratioX");
  ratioXInput.addEventListener("change", changeRatioX);

  const ratioYInput = document.getElementById("ratioY");
  ratioYInput.addEventListener("change", changeRatioY);

  const bgColorInput = document.getElementById("bgColor");
  bgColorInput.addEventListener("change", changeBgColor);

  const gradientBottomInput = document.getElementById("gradientBottom");
  gradientBottomInput.addEventListener("change", changeGradientRange);

  const saveButton = document.getElementById("save");
  saveButton.addEventListener("click", saveImage);

  const unloadButton = document.getElementById("unload");
  unloadButton.addEventListener("click", unloadImage)

  const screenRatio = Math.round(window.screen.height / window.screen.width * 10) / 10;
  document.getElementById("ratioX").value = 9;
  document.getElementById("ratioY").value = 9 * screenRatio;

  changeCanvasSize(1080, 1080 * screenRatio);
  if (document.getElementById("source").value != "") {
    loadImage();
  } else {
    welcome();
  }
})();
