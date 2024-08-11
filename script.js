// script.js
const codeContainer = document.getElementById("code-container");
const codeElement = document.getElementById("code").querySelector('code');
const content = document.getElementById("content");

const codeLines = [
    "<!DOCTYPE html>",
    "<html lang='ru'>",
    "<head>",
    "    <meta charset='UTF-8'>",
    "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
    "    <title>титл епт</title>",
    "    <link rel='stylesheet' href='styles.css'>",
    "    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css'>",
    "</head>",
    "<body>",
    "    <div id='code-container'>",
    "        <pre id='code' class='language-html'><code></code></pre>",
    "    </div>",
    "    <div id='content' class='hidden'>",
    "        <div class='content-inner'>",
    "            <div class='logo'></div>",
    "            <p class='description'>Лорем ипсум хуипсум</p>",
    "            <div class='buttons'>",
    "                <a href='https://t.me/legendagachimuchi' class='btn'>Telegram</a>",
    "                <a href='https://github.com/humoridze' class='btn'>GitHub</a>",
    "            </div>",
    "        </div>",
    "    </div>",
    "    <script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'></script>",
    "    <script src='script.js'></script>",
    "</body>",
    "</html>"
];

let currentLine = 0;
let currentChar = 0;

function typeCode() {
    if (currentLine < codeLines.length) {
        const currentText = codeLines[currentLine];
        if (currentChar < currentText.length) {
            codeElement.textContent += currentText[currentChar];
            currentChar++;
            Prism.highlightAll(); // Подсветка синтаксиса
            setTimeout(typeCode, 10); // Скорость печати
        } else {
            codeElement.textContent += "\n";
            currentChar = 0;
            currentLine++;
            setTimeout(typeCode, 100); // Задержка между строками
        }
    } else {
        finishCode();
    }
}

function finishCode() {
    codeContainer.style.opacity = '0';
    codeContainer.style.transform = 'scale(0.9)';
    setTimeout(() => {
        codeContainer.classList.add("hidden");
        content.classList.remove("hidden");
    }, 1000); // Пауза перед исчезновением кода и показом контента
}

typeCode();
