const canvas = document.getElementById('pixelCanvas');
const context = canvas.getContext('2d');
const pixelSize = 10;

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((event.clientY - rect.top) / pixelSize) * pixelSize;
    context.fillStyle = '#000';
    context.fillRect(x, y, pixelSize, pixelSize);
});
