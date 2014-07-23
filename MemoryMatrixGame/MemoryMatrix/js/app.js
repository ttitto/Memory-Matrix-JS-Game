function createBackground(w, h) {
    var bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'bg';
    bgCanvas.height = h;
    bgCanvas.width = w;
    bgCanvas.style.background = "cyan";
    document.body.appendChild(bgCanvas);
}

createBackground(640, 480);