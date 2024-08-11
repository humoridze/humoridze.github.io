const codeContainer = document.getElementById("code-container");
const codeElement = document.getElementById("code").querySelector('code');
const content = document.getElementById("content");

const codeLines = [
    "<!DOCTYPE html>",
    "<html lang=\"ru\">",
    "<head>",
    "    <meta charset=\"UTF-8\">",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
    "    <title>Сайт, который сам себя пишет</title>",
    "    <link rel=\"stylesheet\" href=\"styles.css\">",
    "    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css\">",
    "</head>",
    "<body>",
    "    <div id=\"code-container\">",
    "        <pre id=\"code\" class=\"language-html\"><code></code></pre>",
    "    </div>",
    "    <div id=\"content\" class=\"hidden\">",
    "        <div class=\"content-inner\">",
    "            <div class=\"logo\"></div>",
    "            <p class=\"description\">Этот сайт сам себя написал!</p>",
    "            <div class=\"buttons\">",
    "                <a href=\"https://t.me/yourtelegram\" class=\"btn\">Telegram</a>",
    "                <a href=\"https://github.com/yourgithub\" class=\"btn\">GitHub</a>",
    "            </div>",
    "        </div>",
    "    </div>",
    "    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js\"></script>",
    "    <script src=\"script.js\"></script>",
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
            Prism.highlightAll(); 
            setTimeout(typeCode, 10); 
        } else {
            codeElement.textContent += "\n";
            currentChar = 0;
            currentLine++;
            setTimeout(typeCode, 100); 
        }
    } else {
        finishCode();
    }
}

function finishCode() {
    codeContainer.style.opacity = '0';
    codeContainer.style.transform = 'scale(1.1)'; 
    setTimeout(() => {
        codeContainer.style.display = 'none'; 
        content.classList.remove("hidden");
    }, 1000); 
}

typeCode();
