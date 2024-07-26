const canvas = document.getElementById('pixelCanvas');
const context = canvas.getContext('2d');
const pixelSize = 10;
const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080', '#808080', '#C0C0C0'];
let currentColor = colors[0];
let canPlacePixel = true;

const colorPicker = document.getElementById('colorPicker');
colors.forEach(color => {
    const colorButton = document.createElement('button');
    colorButton.style.backgroundColor = color;
    colorButton.addEventListener('click', () => {
        currentColor = color;
    });
    colorPicker.appendChild(colorButton);
});

canvas.addEventListener('click', (event) => {
    if (!canPlacePixel) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((event.clientY - rect.top) / pixelSize) * pixelSize;
    context.fillStyle = currentColor;
    context.fillRect(x, y, pixelSize, pixelSize);
    // Send pixel data to the server
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onopen = () => {
        ws.send(JSON.stringify({ x, y, color: currentColor }));
    };
    canPlacePixel = false;
    setTimeout(() => canPlacePixel = true, 300000); // 5 minutes
});

// WebSocket to receive pixel updates
const ws = new WebSocket("ws://localhost:8000/ws");
ws.onmessage = (event) => {
    const { x, y, color } = JSON.parse(event.data);
    context.fillStyle = color;
    context.fillRect(x, y, pixelSize, pixelSize);
};
