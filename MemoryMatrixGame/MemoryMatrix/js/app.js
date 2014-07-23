function createBackground(w, h) {
    var bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'main-canvas';
    bgCanvas.height = h;
    bgCanvas.width = w;
    document.body.appendChild(bgCanvas);
}

createBackground(640, 480);