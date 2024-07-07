document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.querySelector('.input__search');
    const discoverButton = document.getElementById('discoverButton');
    const fullscreenMessage = document.getElementById('fullscreenMessage');
    const textToType = "Кто же лучший человек в его жизни?";

    inputField.addEventListener('input', function() {
        inputField.value = textToType.substring(0, inputField.value.length);
        if (inputField.value === textToType) {
            discoverButton.classList.add('show');
        } else {
            discoverButton.classList.remove('show');
        }
    });

    discoverButton.addEventListener('click', function() {
        fullscreenMessage.classList.add('show');
    });
});
