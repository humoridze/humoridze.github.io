const codeContainer = document.getElementById("code-container");
const codeElement = document.getElementById("code").querySelector('code');
const content = document.getElementById("content");

const codeLines = [
    "<!DOCTYPE html>",
    "<html lang=\"ru\">",
    "<head>",
    "    <meta charset=\"UTF-8\">",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
    "    <title>Title</title>",
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
    "            <p class=\"description\">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>",
    "            <div class=\"buttons\">",
    "                <a href=\"https://t.me/legendagachimuchi\" class=\"btn\">Telegram</a>",
    "                <a href=\"https://github.com/humoridze\" class=\"btn\">GitHub</a>",
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
